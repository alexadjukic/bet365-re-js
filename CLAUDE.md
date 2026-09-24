# CLAUDE.md

## Hard rules

### Always look for `x-net-sync-term`

Whenever I ask you (or any agent/subagent) to analyze, inspect, or look into a deobfuscated chunk of code, you MUST look out for:

1. Any mention of a header called `x-net-sync-term` (including string-split, concatenated, encoded, or otherwise indirectly constructed forms of that name).
2. Any clues as to how its value is set or computed: the code that assigns it, the inputs it depends on, and any functions, variables, or state feeding into it.

Report what you find (or explicitly state that nothing was found) in every analysis. This rule applies to every such task, even when I don't mention the header. Pass it along when delegating to subagents.

### Work on `main`, don't create branches or worktrees

When editing code, do NOT create new git branches or worktrees. Work directly on the `main` branch whenever it is possible. Only create a branch or worktree if I explicitly ask for one, or if something makes working on `main` impossible (in which case say so and explain why).

### Record chunk explanations in `data/notes/`

Whenever I ask you to explain, summarize, or analyze what a deobfuscated chunk (or group of chunks) does, also record the result in a markdown file in `data/notes/` (gitignored). Use one section per capture timestamp (the prefix of the chunk file names, e.g. `## Capture \`1789578235.2926745\``) in `data/notes/chunk-explanations.md`, with the chunks enumerated in numbered "Part" subsections, nicely formatted (tables are fine). If the timestamp's section already exists, update it instead of duplicating it. Include the `x-net-sync-term` findings.

### Also look for the token events `xcftr`, `xrtt`, `xcft<n>`, `xrctt<n>`

Alongside `x-net-sync-term`, whenever you (or any agent/subagent) analyze a deobfuscated chunk, also search it for these custom `window` CustomEvents, both listeners (`addEventListener`) and dispatchers (`dispatchEvent(new CustomEvent(...))`), including string-split, concatenated, or otherwise indirectly built names (note the `<n>` suffix is an instance counter appended to the name):

- `xcftr` (detail: instance counter `n`): request for the main token.
- `xcft<n>` (detail: the token): reply to `xcftr`.
- `xrtt` (detail: instance counter `n`): request for the second token.
- `xrctt<n>` (detail: the second token): reply to `xrtt`.

**Why:** In `received-6.js` (DataLib), the value of the `X-Net-Sync-Term` header (and `X-Net-Sync-Token`) is not computed. `vmTokenFlow` dispatches `xcftr` (and `xrtt` when the second token is enabled) and waits up to 5 s for `xcft<n>` (and `xrctt<n>`) whose `detail` is the token. These names are custom to the app, not a browser or library convention. Some other script, not found yet, must listen for the request events and dispatch the reply events, so that script is where the token is really generated. Finding it is the key to understanding how the header value is computed.

**When you find a match:** stop and tell me right away in your report, even if it isn't what the task was about. Explain that this is the token provider/consumer, quote the relevant code with file and line, describe what it computes and from which inputs, and record it in `data/notes/chunk-explanations.md`. Pass this rule along when delegating to subagents.
