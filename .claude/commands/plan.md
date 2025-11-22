---
allowed-tools: [Read, Write, Grep, Glob, Task, Search]
---

# Plan - Implementation Planning from Issue Requirements

Creates a minimal MVP implementation plan based on issue requirements and understanding context from the codebase.

# Usage

- `/plan` - Creates implementation plan using understanding and requirements documents
- Typically called after `/understand` and `/define-requirements` commands

# Process

## 1. Gather Context

**Use existing session context and search codebase:**
- Use requirements and understanding already in current session context
- Search through relevant code to understand current implementation
- Review any existing documentation in the project
- Identify constraints, dependencies, and existing patterns
- Map requirements to specific implementation tasks that follow codebase conventions

## 2. Generate Plan Document

**Output Directory:** `Documentation/analysis/{YYYY-MM-DD}/`
**Output File:** `PLAN_{TASK_NAME}.md`

Create timestamped directory if it doesn't exist, then create plan document with:

```markdown
# Implementation Plan: {Task Name}

## Context & Motivation
{Clear description of what we're trying to achieve and why. What problem are we solving? What's the current situation and desired outcome?}

## Scope
### Included
- {Specific deliverable 1}
- {Specific deliverable 2}

### Excluded
- {Out of scope item 1}
- {Out of scope item 2}

## Technical Approach
{High-level strategy for achieving the objective}

## Implementation Steps

### Phase 1: {Phase Name}
1. **{Task Name}** - {Task Description}
   - Location: {File/Component paths}
   - Dependencies: {What needs to be in place}
   - Validation: {How to verify completion}

2. **{Task Name}** - {Task Description}
   - Location: {File/Component paths}
   - Dependencies: {What needs to be in place}
   - Validation: {How to verify completion}

### Phase 2: {Phase Name}
{Continue with structured tasks...}

## Testing Requirements

### Unit Tests
- {Component/Function}: {What to test}
- {Component/Function}: {What to test}

### Integration Tests
- {Flow/Feature}: {Test scenario}
- {Flow/Feature}: {Test scenario}

### Manual Validation
- {User scenario to verify}
- {Edge case to check}

## Considerations & Alternatives

### Potential Considerations
- {Thing to keep in mind or watch out for}
- {Possible edge case or future enhancement}
- {Performance or scaling consideration}

### Alternative Approaches
- {Different way this could be implemented}
- {Trade-off that was considered but not chosen}
- {Future optimization opportunity}
```

## Integration with /implement

The plan serves as the execution blueprint for `/implement`:
- Each step becomes a todo item
- Dependencies guide execution order
- Validation criteria ensure quality

## Common Planning Patterns

### Feature Addition Pattern:
1. Domain model updates
2. API endpoint modifications
3. Frontend API client updates
4. UI component implementation
5. State management integration
6. Test coverage

### Bug Fix Pattern:
1. Root cause identification
2. Minimal fix implementation
3. Regression test addition
4. Related issue check

### Refactoring Pattern:
1. Current state analysis
2. Incremental changes
3. Test preservation/updates
4. Performance validation