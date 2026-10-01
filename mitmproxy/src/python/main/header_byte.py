#!/usr/bin/env python3
"""Extract the token `header_byte` (byte 1 of the X-Net-Sync-Term header `03 xx 00 04`) from the VM chunk (chunk 32).

    from header_byte import extract_header_byte
    extract_header_byte("blob-response-body")   # -> 73

    venv/bin/python mitmproxy/src/python/main/header_byte.py <body file>...

The input is a file holding the body of the response to a `https://www.bet365.rs/Api/1/Blob?37,www-sports,brl/24/...` request (the
module blob of the page: the scripts are separated by `\\x03\\x06\\x05`, chunk 32 is the VM one). The body may be saved decoded or
still gzip/brotli compressed; a single chunk file (e.g. the files of data/obfuscated/) is accepted as well. Nothing is requested from
bet365, and Node is not needed.

Why this is not a regex: the chunk is a tiny register-VM interpreter plus one huge base64 program. The header byte is the literal
`N` of `chr(3) + chr(N)` inside the program's `buildToken` function. In every build the VM's opcode numbers, string XOR key and
special registers are re-generated, so the chunk is read in four steps (a port of mitmproxy/src/javascript/vm-disassembler):

  1. find the chunk by content (the one with a >= 10000 char base64 literal), not by the number 32;
  2. derive the build's profile from its interpreter: every opcode handler is recognised by a fingerprint of its normalised syntax
     tree (known_handlers_py.json), the string key and the special registers are read from the interpreter's structure;
  3. decode the program with that profile;
  4. find `buildToken` by its shape (not by its address, which changes per build) and read N.

Anything unexpected (unknown handler, unknown opcode, no or several `buildToken` candidates, chunks that disagree) raises
HeaderByteError; the extractor never guesses.
"""
import base64
import collections
import hashlib
import json
import re
import struct
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

import esprima

KNOWN_HANDLERS_FILE = Path(__file__).with_name("known_handlers_py.json")

MODULE_SEPARATOR = b"\x03\x06\x05"   # separates the scripts of a blob response; each starts with one type byte
PROGRAM_PATTERN = re.compile(rb"""['"][A-Za-z0-9+/=]{10000,}['"]""")
HEADER_SIGNATURE_LENGTH = 16   # buildToken starts with `chr(3) + chr(N)`; it is looked for in this many first instructions

KEPT_NUMBERS = {0, 1, 2, 3, 4, 5, 6, 7, 8, 16, 24, 0xFF, 0xFFFF}   # shift widths and masks that carry meaning
IGNORED_KEYS = {"start", "end", "loc", "range", "raw", "regex", "extra", "comments", "leadingComments", "trailingComments"}
FLAG_KEYS = {"operator", "prefix", "computed", "kind", "async", "generator"}


class HeaderByteError(Exception):
    """The header byte could not be determined reliably."""


@dataclass(frozen=True)
class VmChunk:
    """One VM chunk found in the input and the header byte read from it."""
    part_index: int             # position among the scripts of the blob response (32 in the captures)
    header_byte: int
    instructions: int           # size of the decoded program
    build_function: int         # address of buildToken in the program (differs per build)


# --------------------------------------------------------------------------------------------------------------
# 1. Reading the input
# --------------------------------------------------------------------------------------------------------------


def _decompress(data: bytes) -> bytes:
    """The body as the browser sees it: a file saved straight off the wire may still be gzip or brotli compressed."""
    if data[:2] == b"\x1f\x8b":
        import gzip
        return gzip.decompress(data)
    if MODULE_SEPARATOR not in data and not PROGRAM_PATTERN.search(data):
        try:
            import brotli
            return brotli.decompress(data)
        except Exception:   # not brotli either: let the caller report that no VM chunk was found
            pass
    return data


def _split_parts(body: bytes):
    """The scripts of a blob response, without their type byte."""
    for index, part in enumerate(body.split(MODULE_SEPARATOR)):
        if part and part[0] < 0x20:
            part = part[1:]
        yield index, part


def _program_literal(part: bytes) -> Optional[bytes]:
    match = PROGRAM_PATTERN.search(part)
    return match.group(0)[1:-1] if match else None


# --------------------------------------------------------------------------------------------------------------
# 2. The build profile, derived from the interpreter
# --------------------------------------------------------------------------------------------------------------


def _is_node(value) -> bool:
    return hasattr(value, "type") and hasattr(value, "__dict__")


def _children(node):
    for key in sorted(vars(node)):
        if key != "type" and key not in IGNORED_KEYS:
            yield key, vars(node)[key]


def _walk_tree(root, visit):
    """Calls visit for every syntax node below (and including) root."""
    stack = [root]
    while stack:
        item = stack.pop()
        if isinstance(item, list):
            stack.extend(reversed(item))
        elif _is_node(item):
            visit(item)
            stack.extend(value for _, value in reversed(list(_children(item))))


def _is_number(node) -> bool:
    return node.type == "Literal" and isinstance(node.value, (int, float)) and not isinstance(node.value, bool)


def _is_decoder_call(node) -> bool:
    return node.type == "CallExpression" and node.callee.type == "Identifier" and len(node.arguments) == 1 and _is_number(node.arguments[0])


def _is_register(node) -> bool:
    return node.type == "MemberExpression" and node.computed and _is_number(node.property)


def normalise(root) -> str:
    """Canonical text of a syntax tree, equal for the same handler in different builds: identifiers are renamed by first use,
    property names and numbers that vary are blanked, string-array decoder calls and plain strings are treated alike and
    `var a = b` aliases are resolved."""
    aliases = {}

    def collect(node):
        if node.type == "VariableDeclarator" and node.id.type == "Identifier" and node.init is not None and node.init.type == "Identifier":
            aliases[node.id.name] = node.init.name

    _walk_tree(root, collect)

    def resolve(name):
        hops = 0
        while name in aliases and hops < 5:
            name = aliases[name]
            hops += 1
        return name

    names = {}

    def name_of(name):
        if name not in names:
            names[name] = f"v{len(names)}"
        return names[name]

    def walk(node):
        if isinstance(node, list):
            return ",".join(part for part in (walk(child) for child in node) if part != "")
        if not _is_node(node):
            return json.dumps(node)
        kind = node.type
        if kind == "Identifier":
            return name_of(resolve(node.name))
        if kind == "Literal":
            if _is_number(node):
                return f"#{int(node.value)}" if node.value in KEPT_NUMBERS else "#"
            return "S" + json.dumps(node.value)
        if kind == "CallExpression" and _is_decoder_call(node):
            return f"DEC({name_of(node.callee.name)})"
        if kind == "MemberExpression":
            if not node.computed or (node.property.type == "Literal" and not _is_number(node.property)) or _is_decoder_call(node.property):
                return f"(Member PROP obj:{walk(node.object)})"
        if kind == "VariableDeclaration":
            declarators = [d for d in node.declarations if not (d.id.type == "Identifier" and d.init is not None and d.init.type == "Identifier")]
            return f"(Var {','.join(walk(d) for d in declarators)})" if declarators else ""
        parts = [kind]
        for key, value in _children(node):
            if key in FLAG_KEYS:
                parts.append(f"{key}={value}")
            elif value is not None and (isinstance(value, list) or _is_node(value)):
                parts.append(f"{key}:{walk(value)}")
        return f"({' '.join(parts)})"

    return walk(root)


def fingerprint(node) -> str:
    return hashlib.sha1(normalise(node).encode()).hexdigest()[:12]


def _handlers(ast):
    """The opcode handlers: `table[0xNN] = function () {...}` assignments, of the object that has the most of them."""
    found = []

    def visit(node):
        if (node.type == "AssignmentExpression" and node.left.type == "MemberExpression" and node.left.computed
                and _is_number(node.left.property) and node.left.object.type == "Identifier" and node.right.type == "FunctionExpression"):
            found.append((node.left.object.name, int(node.left.property.value), node.right))

    _walk_tree(ast, visit)
    if not found:
        return []
    table = collections.Counter(name for name, _, _ in found).most_common(1)[0][0]
    return [(opcode, function) for name, opcode, function in found if name == table]


def _registers(ast, handlers):
    """PC is the register the handlers increment while reading operands, RETV the one the run loop ORs into its result, the
    others are set by the start-up sequence."""
    increments = collections.Counter()

    def count(node):
        if node.type == "UpdateExpression" and node.operator == "++" and _is_register(node.argument):
            increments[int(node.argument.property.value)] += 1

    for _, function in handlers:
        _walk_tree(function, count)
    if not increments:
        raise HeaderByteError("no program counter found in the interpreter")
    pc = increments.most_common(1)[0][0]
    registers = {"PC": pc}

    def visit(node):
        if (node.type == "ForStatement" and node.test is not None and node.test.type == "BinaryExpression" and node.test.operator == "<"
                and _is_register(node.test.left) and int(node.test.left.property.value) == pc):
            # the run loop: for (; regs[PC] < program.length;) { ...; result = result || regs[RETV] }
            def find_retv(logical):
                if logical.type == "LogicalExpression" and logical.operator == "||" and _is_register(logical.right) and int(logical.right.property.value) != pc:
                    registers["RETV"] = int(logical.right.property.value)
            _walk_tree(node.body, find_retv)
        if node.type == "SequenceExpression":
            # the start-up sequence: regs[PC] = 0, regs[ZERO] = 0, regs[ONE] = 1, regs[UNDEF] = void 0, regs[THIS] = window
            assignments = [e for e in node.expressions if e.type == "AssignmentExpression" and e.operator == "=" and _is_register(e.left)]
            if not any(int(a.left.property.value) == pc and _is_number(a.right) for a in assignments):
                return
            if not any(a.right.type == "UnaryExpression" and a.right.operator == "void" for a in assignments):
                return
            for assignment in assignments:
                register = int(assignment.left.property.value)
                right = assignment.right
                if register == pc:
                    continue
                if _is_number(right) and right.value == 0:
                    registers["ZERO"] = register
                elif _is_number(right) and right.value == 1:
                    registers["ONE"] = register
                elif right.type == "UnaryExpression" and right.operator == "void":
                    registers["UNDEF"] = register
                elif right.type == "Identifier":
                    registers["THIS"] = register

    _walk_tree(ast, visit)
    return registers


def _string_mask(handlers, known) -> Optional[int]:
    """The XOR key of the string constants: the number XORed with the program bytes in the string-loading handler."""
    for _, function in handlers:
        if known.get(fingerprint(function)) != "STR":
            continue
        mask = []

        def visit(node):
            if node.type == "BinaryExpression" and node.operator == "^":
                mask.extend(int(side.value) for side in (node.left, node.right) if _is_number(side))

        _walk_tree(function, visit)
        return mask[-1] if mask else None
    return None


def _known_handlers() -> dict:
    return json.loads(KNOWN_HANDLERS_FILE.read_text(encoding="utf-8"))


@dataclass(frozen=True)
class Profile:
    opcodes: dict        # byte -> instruction name
    string_mask: int
    registers: dict


def derive_profile(chunk_source: str, known: Optional[dict] = None) -> Profile:
    """Reads the build-specific profile from the interpreter of one chunk."""
    known = _known_handlers() if known is None else known
    try:
        ast = esprima.parseScript(chunk_source)
    except esprima.Error as error:
        raise HeaderByteError(f"the chunk is not parseable JavaScript: {error}") from error
    handlers = _handlers(ast)
    if not handlers:
        raise HeaderByteError("no opcode handler table found in the chunk")
    opcodes, unknown = {}, []
    for opcode, function in handlers:
        name = known.get(fingerprint(function))
        if name:
            opcodes[opcode] = name
        else:
            unknown.append(opcode)
    if unknown:
        raise HeaderByteError(f"{len(unknown)} opcode handlers of this build are not in known_handlers_py.json: "
                              f"{', '.join(hex(o) for o in unknown)}")
    missing = sorted(set(known.values()) - set(opcodes.values()))
    if missing:
        raise HeaderByteError(f"the interpreter has no handler for {', '.join(missing)}")
    mask = _string_mask(handlers, known)
    if mask is None:
        raise HeaderByteError("the string key of the program was not found")
    return Profile(opcodes=opcodes, string_mask=mask, registers=_registers(ast, handlers))


def learn_known_handlers(chunk_source: str, opcode_names: dict) -> dict:
    """Fingerprint -> name table for a build whose opcode numbers are known (used to create known_handlers_py.json)."""
    return {fingerprint(function): opcode_names[opcode] for opcode, function in _handlers(esprima.parseScript(chunk_source)) if opcode in opcode_names}


# --------------------------------------------------------------------------------------------------------------
# 3. Decoding the program
# --------------------------------------------------------------------------------------------------------------

# Operand kinds: r=register, b=byte immediate, w=signed 32-bit immediate, a=32-bit code address, s=string, d=double,
# *=count byte followed by that many bytes (a register list or a byte list).
BINARY_OPERATORS = ("EQ", "NEQ", "SEQ", "SNEQ", "LT", "GT", "LE", "GE", "ADD", "SUB", "MUL", "DIV", "MOD", "AND", "OR", "XOR", "SHL", "SHR", "USHR")
LAYOUTS = {
    "STR": "rs", "BYTE": "rb", "INT": "rw", "DOUBLE": "rd", "ARRAY": "r*", "MOV": "rr", "GETPROP": "rrr", "SETPROP": "rrr",
    "CALL": "rrr*", "NEW": "rr*", "EVAL": "rr", "THROW": "r", "HALT": "", "JMP": "a", "JNZ": "ra", "JZ": "ra",
    "MAKEFN": "ra*", "CALLLOCAL": "ab*", "RET": "r*", "TRY": "raaa",
    **{name: "rrr" for name in BINARY_OPERATORS},
}


@dataclass(frozen=True)
class Instruction:
    offset: int
    name: str
    operands: tuple    # in layout order; registers/immediates/addresses are ints, strings are str, lists are lists
    size: int


def decode_program(program: bytes, profile: Profile) -> list:
    """Linear sweep over the whole program (every opcode has a fixed layout)."""
    instructions = []
    offset, end = 0, len(program)
    while offset < end:
        opcode = program[offset]
        name = profile.opcodes.get(opcode)
        if name is None:
            raise HeaderByteError(f"unknown opcode 0x{opcode:x} at offset {offset}")
        cursor = offset + 1
        operands = []

        def need(count):
            if cursor + count > end:
                raise HeaderByteError(f"program truncated inside {name} at offset {offset}")

        for kind in LAYOUTS[name]:
            if kind in "rb":
                need(1)
                operands.append(program[cursor])
                cursor += 1
            elif kind in "wa":
                need(4)
                (value,) = struct.unpack_from(">i" if kind == "w" else ">I", program, cursor)
                operands.append(value)
                cursor += 4
            elif kind == "s":
                need(2)
                (length,) = struct.unpack_from(">H", program, cursor)
                cursor += 2
                need(length)
                operands.append("".join(chr(profile.string_mask ^ byte) for byte in program[cursor:cursor + length]))
                cursor += length
            elif kind == "d":
                need(8)
                (value,) = struct.unpack_from(">d", program, cursor)
                operands.append(value)
                cursor += 8
            elif kind == "*":
                need(1)
                count = program[cursor]
                cursor += 1
                need(count)
                operands.append(list(program[cursor:cursor + count]))
                cursor += count
        instructions.append(Instruction(offset, name, tuple(operands), cursor - offset))
        offset = cursor
    return instructions


# --------------------------------------------------------------------------------------------------------------
# 4. Finding buildToken and reading the byte
# --------------------------------------------------------------------------------------------------------------


def _function_bodies(instructions: list) -> list:
    """(entry address, instructions) per function: a function starts at every MAKEFN / CALLLOCAL target."""
    entries = set()
    for instruction in instructions:
        if instruction.name == "MAKEFN":
            entries.add(instruction.operands[1])
        elif instruction.name == "CALLLOCAL":
            entries.add(instruction.operands[0])
    bodies, current, entry = [], [], None
    for instruction in instructions:
        if instruction.offset in entries:
            if entry is not None:
                bodies.append((entry, current))
            entry, current = instruction.offset, []
        if entry is not None:
            current.append(instruction)
    if entry is not None:
        bodies.append((entry, current))
    return bodies


def _header_byte_of(body: list) -> Optional[int]:
    """`N` of `chr(3) + chr(N)` at the start of a function, i.e. the shape
         rA = 3; rB = table[rA]; rC = N; rD = table[rC]; rE = rB + rD
    (immediates are loaded with BYTE or INT), or None if the function does not start that way."""
    loads = {}     # register -> immediate loaded into it
    lookups = {}   # register -> (table register, index register)
    for instruction in body[:HEADER_SIGNATURE_LENGTH]:
        if instruction.name in ("BYTE", "INT"):
            loads[instruction.operands[0]] = instruction.operands[1]
            lookups.pop(instruction.operands[0], None)
        elif instruction.name == "GETPROP":
            destination, table, index = instruction.operands
            lookups[destination] = (table, index)
            loads.pop(destination, None)
        elif instruction.name == "ADD":
            _, left, right = instruction.operands
            if left in lookups and right in lookups and lookups[left][0] == lookups[right][0]:
                first, second = loads.get(lookups[left][1]), loads.get(lookups[right][1])
                if first == 3 and second is not None and 0 <= second <= 255:
                    return second
            return None
    return None


def find_header_byte(instructions: list) -> tuple:
    """(header byte, address of buildToken). buildToken is the function that starts with chr(3) + chr(N) and also contains the
    string constants "\\x00\\x04" (the rest of the header) and "btoa" (the base64 encoding of the token)."""
    candidates = []
    for entry, body in _function_bodies(instructions):
        strings = {instruction.operands[1] for instruction in body if instruction.name == "STR"}
        if "\x00\x04" in strings and "btoa" in strings:
            value = _header_byte_of(body)
            if value is not None:
                candidates.append((value, entry))
    if not candidates:
        raise HeaderByteError("buildToken (the function starting with chr(3) + chr(N)) was not found in the program")
    if len(candidates) > 1:
        raise HeaderByteError(f"{len(candidates)} functions look like buildToken: {candidates}")
    return candidates[0]


# --------------------------------------------------------------------------------------------------------------
# API
# --------------------------------------------------------------------------------------------------------------


def read_chunk(part: bytes, program_literal: bytes, index=0) -> VmChunk:
    """Header byte of one VM chunk (its script text and the base64 program literal found in it)."""
    try:
        source = part.decode("utf-8")
    except UnicodeDecodeError as error:
        raise HeaderByteError(f"the VM chunk is not UTF-8 text: {error}") from error
    profile = derive_profile(source)
    try:
        program = base64.b64decode(program_literal, validate=True)
    except ValueError as error:
        raise HeaderByteError(f"the VM program is not valid base64: {error}") from error
    instructions = decode_program(program, profile)
    value, entry = find_header_byte(instructions)
    return VmChunk(part_index=index, header_byte=value, instructions=len(instructions), build_function=entry)


def extract_header_bytes(path) -> list:
    """Every distinct VM chunk in a response-body file, with the header byte read from it."""
    path = Path(path)
    if not path.is_file():
        raise HeaderByteError(f"{path} does not exist")
    try:
        body = _decompress(path.read_bytes())
    except (OSError, EOFError) as error:
        raise HeaderByteError(f"{path} could not be decompressed: {error}") from error
    chunks, seen = [], set()
    for index, part in _split_parts(body):
        literal = _program_literal(part)
        if literal is None:
            continue
        digest = hashlib.sha1(part).digest()
        if digest in seen:
            continue
        seen.add(digest)
        chunks.append(read_chunk(part, literal, index))
    if not chunks:
        raise HeaderByteError(f"{path} contains no VM chunk (no script with a base64 program literal)")
    return chunks


def extract_header_byte(path) -> int:
    """The header byte of the VM chunk in `path`. Raises HeaderByteError if there is none, or if chunks disagree."""
    chunks = extract_header_bytes(path)
    values = sorted({chunk.header_byte for chunk in chunks})
    if len(values) != 1:
        raise HeaderByteError(f"the VM chunks of {path} disagree on the header byte: "
                              + ", ".join(f"{c.header_byte} (part {c.part_index})" for c in chunks))
    return values[0]


def main(argv) -> int:
    if not argv:
        print("usage: header_byte.py <response body file>...", file=sys.stderr)
        return 2
    status = 0
    for name in argv:
        try:
            chunks = extract_header_bytes(name)
            values = sorted({chunk.header_byte for chunk in chunks})
            detail = ", ".join(f"part {c.part_index}: {c.header_byte}" for c in chunks)
            print(f"{name}\t{values[0] if len(values) == 1 else 'CONFLICT'}\t({detail})")
            status |= len(values) != 1
        except HeaderByteError as error:
            print(f"{name}\tERROR\t{error}", file=sys.stderr)
            status = 1
    return status


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
