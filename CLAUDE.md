# CLAUDE.md

## Hard rules

### Always look for `x-net-sync-term`

Whenever I ask you (or any agent/subagent) to analyze, inspect, or look into a deobfuscated chunk of code, you MUST look out for:

1. Any mention of a header called `x-net-sync-term` (including string-split, concatenated, encoded, or otherwise indirectly constructed forms of that name).
2. Any clues as to how its value is set or computed: the code that assigns it, the inputs it depends on, and any functions, variables, or state feeding into it.

Report what you find (or explicitly state that nothing was found) in every analysis. This rule applies to every such task, even when I don't mention the header. Pass it along when delegating to subagents.
