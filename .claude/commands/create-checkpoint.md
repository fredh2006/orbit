---
allowed-tools: [Read, Write, Grep, Glob, LS, Task, Bash]
---

# Create Checkpoint

Creates a session summary for resuming work later.

# Usage

- `create-checkpoint` - Creates CHECKPOINT.md with current session state

# Process

1. **Remove old checkpoint** - If `CHECKPOINT.md` already exists in the project root, delete it first to ensure the new checkpoint reflects the latest session state
2. **Analyze current session** - What problem we're solving and current progress
3. **Show directory structure** - Tree view of areas being worked on
4. **Summarize changes** - Files modified/created and why
5. **Document approaches tried** - What worked, what didn't, lessons learned
6. **List next steps** - Prioritized actions to continue

**Create `CHECKPOINT.md` with:**

```markdown
# Session Checkpoint - {{TIMESTAMP}}

## Current Problem

- **Goal**: [What we're trying to achieve]
- **Status**: [Where we are now]

## Directory Structure

[Tree view of relevant areas]

## Changes This Session

- **{{file}}**: {{what changed and why}}

## Approaches Tried

- **{{approach}}**: {{outcome and lesson}}

## Next Steps

1. {{priority action}}
2. {{alternative approach}}

## Resume Context

- **Key files**: {{files to read first}}
- **Important notes**: {{critical discoveries}}
```

Save to project root as `CHECKPOINT.md`.
