---
allowed-tools: [Read, Write, Grep, Glob, LS, Task, Bash]
---

# Resume From Checkpoint

Continues work from a previously saved checkpoint.

# Usage

- `resume-from-checkpoint {{CHECKPOINT_FILE}}` - Resume from specific file
- `resume-from-checkpoint` - Resume from CHECKPOINT.md in root

# Process

1. **Read checkpoint** - Load the saved session state
2. **Review key files** - Read files mentioned in "Resume Context"
3. **Understand changes** - Review what was modified and why
4. **Learn from attempts** - Understand what was tried and outcomes
5. **Continue work** - Start with the next prioritized step

**Output summary:**
```markdown
## Restored Context
- **Goal**: {{problem being solved}}
- **Status**: {{where we left off}}
- **Key insights**: {{what we learned}}
- **Next action**: {{priority step to take}}
```

Ready to continue seamlessly from where the previous session ended.