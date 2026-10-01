import base64
import sys
from pathlib import Path

import pytest

current_directory = Path(__file__).parent.absolute()
source_directory = (current_directory / "..").resolve()
sys.path.insert(0, str(source_directory / "main"))

import header_byte  # noqa: E402
from header_byte import HeaderByteError, extract_header_byte, extract_header_bytes  # noqa: E402

# header byte of the build in each capture (site version 16504 -> 72, 16520 and 16528 -> 73)
EXPECTED = {"flows": 72, "flows2": 73, "flows3": 73, "flows4": 73}


def find_flows(name):
    """The flows files are git-ignored captures that live in the repository root (also found from a worktree)."""
    for directory in [current_directory, *current_directory.parents]:
        if (directory / name).is_file():
            return directory / name
    return None


def needs_flows(name):
    return pytest.mark.skipif(find_flows(name) is None, reason=f"the capture {name} is not available")


flows_params = [pytest.param(name, marks=needs_flows(name)) for name in EXPECTED]


def module_bodies(name):
    """The (decoded body, body as sent on the wire) of the /Api/1/Blob response that carries the VM chunk, from a capture."""
    from mitmproxy import io
    with find_flows(name).open("rb") as handle:
        for flow in io.FlowReader(handle).stream():
            if flow.type == "http" and flow.response and "/Api/1/Blob" in flow.request.path and "gen5base" in flow.request.path:
                return flow.response.content, flow.response.raw_content
    raise AssertionError("no blob response")


@pytest.fixture(scope="module")
def body_files(tmp_path_factory):
    directory = tmp_path_factory.mktemp("bodies")
    files = {}
    for name in EXPECTED:
        if find_flows(name) is not None:
            decoded, wire = module_bodies(name)
            (directory / f"{name}.body").write_bytes(decoded)
            (directory / f"{name}.wire").write_bytes(wire)
            files[name] = directory / f"{name}.body", directory / f"{name}.wire"
    return files


@pytest.mark.parametrize("name", flows_params)
def test_every_response_body_gives_its_builds_header_byte(name, body_files):
    decoded, wire = body_files[name]
    assert extract_header_byte(decoded) == EXPECTED[name]
    chunks = extract_header_bytes(decoded)
    assert [c.part_index for c in chunks] == [32]   # found by content, and it is the chunk 32 of the blob response
    assert extract_header_byte(wire) == EXPECTED[name]   # still brotli compressed, as saved off the wire


@pytest.mark.parametrize("name", flows_params)
def test_it_equals_byte_1_of_the_real_tokens_sent_in_the_same_capture(name, body_files):
    """Independent oracle: the x-net-sync-term headers the browser really sent carry the header bytes `03 xx 00 04`."""
    from mitmproxy import io
    seen = set()
    with find_flows(name).open("rb") as handle:
        for flow in io.FlowReader(handle).stream():
            if flow.type == "http" and flow.request.headers.get("x-net-sync-term"):
                raw = base64.b64decode(flow.request.headers["x-net-sync-term"])
                assert raw[0] == 3 and raw[2:4] == b"\x00\x04"
                seen.add(raw[1])
    assert seen == {extract_header_byte(body_files[name][0])}


@needs_flows("flows2")
def test_the_program_decodes_completely_and_the_profile_is_derived_per_build(body_files):
    assert extract_header_bytes(body_files["flows2"][0])[0].instructions == 7358   # the 16520 program of data/notes/x-net-sync-term.md section 4
    for name, (decoded, _wire) in body_files.items():
        for _index, part in header_byte._split_parts(decoded.read_bytes()):
            if header_byte._program_literal(part):
                profile = header_byte.derive_profile(part.decode())
                assert len(profile.opcodes) == 39 and set(profile.opcodes.values()) == set(header_byte.LAYOUTS)
                assert {"PC", "RETV", "ZERO", "ONE", "UNDEF", "THIS"} <= set(profile.registers)
                if name == "flows":    # the numbers of 16504 (data/notes/x-net-sync-term.md section 4)
                    assert profile.string_mask == 0x56 and profile.registers["PC"] == 0x8D and profile.registers["ZERO"] == 0x84
                if name == "flows2":   # 16520
                    assert profile.string_mask == 0x32 and profile.registers["PC"] == 0x41 and profile.registers["ZERO"] == 0x81


def vm_part(body_file):
    for _index, part in header_byte._split_parts(body_file.read_bytes()):
        if header_byte._program_literal(part):
            return part
    raise AssertionError("no VM chunk")


@pytest.mark.parametrize("name", flows_params)
def test_a_single_chunk_file_gives_the_same_value(name, body_files, tmp_path):
    chunk_file = tmp_path / "chunk.js"
    chunk_file.write_bytes(vm_part(body_files[name][0]))
    assert extract_header_byte(chunk_file) == EXPECTED[name]


@needs_flows("flows2")
def test_a_changed_handler_is_reported_not_guessed(body_files, tmp_path):
    part = vm_part(body_files["flows2"][0]).decode()
    mutated = part.replace("<<0x8|", ">>0x8|", 1)   # the 16-bit string length of the STR handler is read with a different operator
    assert mutated != part
    path = tmp_path / "chunk.js"
    path.write_text(mutated)
    with pytest.raises(HeaderByteError, match="not in known_handlers_py.json|no handler for"):
        extract_header_byte(path)


def test_errors_are_clear(tmp_path):
    with pytest.raises(HeaderByteError, match="does not exist"):
        extract_header_byte(tmp_path / "missing")
    no_vm = tmp_path / "blob"
    no_vm.write_bytes(b"\x04var a = 1;\x03\x06\x05\x04var b = 2;")
    with pytest.raises(HeaderByteError, match="no VM chunk"):
        extract_header_byte(no_vm)


@needs_flows("flows")
@needs_flows("flows2")
def test_chunks_that_disagree_are_reported(body_files, tmp_path):
    both = tmp_path / "blob"
    both.write_bytes(b"\x04" + vm_part(body_files["flows"][0]) + b"\x03\x06\x05\x04" + vm_part(body_files["flows2"][0]))
    assert sorted(c.header_byte for c in extract_header_bytes(both)) == [72, 73]
    with pytest.raises(HeaderByteError, match="disagree"):
        extract_header_byte(both)


def instruction(offset, name, *operands):
    return header_byte.Instruction(offset, name, operands, 1)


def test_build_token_is_found_by_its_shape_not_its_address():
    # a function that starts chr(3) + chr(N) but has no "\x00\x04" and "btoa" is not buildToken
    body = [instruction(100, "BYTE", 1, 3), instruction(101, "GETPROP", 2, 9, 1), instruction(102, "BYTE", 3, 99),
            instruction(103, "GETPROP", 4, 9, 3), instruction(104, "ADD", 5, 2, 4)]
    assert header_byte._header_byte_of(body) == 99
    assert header_byte._header_byte_of([instruction(0, "BYTE", 1, 4), *body[1:]]) is None   # first character is not chr(3)
    with pytest.raises(HeaderByteError, match="not found"):
        header_byte.find_header_byte([instruction(0, "MAKEFN", 7, 100, []), *body])
