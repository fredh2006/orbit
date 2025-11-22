---
allowed-tools: [Read, Write, Grep, Glob, Task]
---

# Update Documentation - Comprehensive Documentation Update

Updates or creates all relevant documentation files in docs folder of the relevant feature slice or other directory (README.md, CLAUDE.md, DESIGN.md) based on recent implementation work to maximize both human and AI understanding. Creates GitHub-visible READMEs for navigation and detailed docs for implementation.

# Usage

Call at the end of an implementation session:

- `update-docs` - Analyzes current AI session changes and updates relevant documentation
- `update-docs {{FEATURE_NAME}}` - Updates specific feature documentation based on session changes

# Process

## 1. Identify Changed Areas

- **Review this AI session only** - Look at all files created, modified, or discussed in current conversation
- **Focus on session-specific changes** - Ignore git status since multiple features may be in progress across different sessions
- **Map session files to modules/features** - Determine which areas were affected in THIS session:
  - Identify the main modules, features, or components that were modified
  - Group related changes together by functional area
  - Determine appropriate documentation locations based on project structure
- **Identify session complexity** - Look for complex implementations or difficult bugs solved specifically in this session that warrant design documentation

## 2. Analyze Implementation Changes

For each module/feature modified in this session:

- **Read existing documentation** (README.md, architecture docs, design docs) for affected areas
- **Analyze the specific changes made** in this session to understand:
  - New patterns introduced during this work
  - Integration points that were added or changed
  - Non-obvious behaviors discovered while implementing
  - Issues encountered and how they were solved
  - Architecture decisions made during this session
  - **Complex solutions or unique approaches implemented this session**
  - **Difficult bugs solved and their root causes**

## 3. Create/Update Design Documentation

**When to create or update design documents:**

- **Architectural decisions** that required choosing between multiple viable approaches
- **Design trade-offs** where significant benefits were gained at the cost of other aspects
- **Pattern innovations** where new approaches were developed to solve specific challenges
- **Integration strategies** that required careful consideration of system-wide impacts
- **Performance/security design choices** that influenced the overall architecture
- **Rejected alternatives** where understanding why something wasn't chosen is valuable

**Design Document Management:**

- **One design doc per module/feature** - Named appropriately based on project conventions
- **Objective and direct** - Focus on design rationale, not implementation history
- **Complement main docs** - Cover "WHY" decisions were made, not "HOW" they work
- **Update when design evolves** - Add new architecture decisions as the module grows
- **Location**: Place design documents near related code or in a docs/ subdirectory

**Design Document Structure:**

- **Overview**: High-level design philosophy and approach (3-5 lines)
- **Core Design Principles**: Key principles that guided the implementation approach (5-10 lines)
- **Architecture Decisions**: Major architectural choices made:
  - **{{Decision Name}}**:
    - **Problem**: What design challenge was addressed (2-3 lines)
    - **Approaches Considered**: Alternative design solutions with pros/cons (5-15 lines)
    - **Chosen Approach**: Selected design and rationale (5-10 lines)
    - **Trade-offs**: What was gained/sacrificed (3-5 lines)
- **Pattern Innovations**: Unique patterns developed specifically for this module (5-15 lines)
- **Integration Philosophy**: How this module's design integrates with the overall system (3-5 lines)

## 4. Update/Create Module Documentation

For each module/feature needing updates:

### Typical Documentation Structure

**Module root:**
- **README.md**: Overview with structure, usage examples, and links to detailed docs

**Docs subdirectory (if exists):**
- **Implementation guide**: How the module works (API, architecture, patterns)
- **Design documentation**: Architecture decisions and rationale
- **API documentation**: Public interfaces, endpoints, or exported functions
- **Test documentation**: Test strategy and scenarios

### Adapt to Project Structure

- **Monorepo**: Update docs at package/workspace level
- **Library**: Update API docs and usage examples
- **API service**: Update endpoint docs and integration guides
- **CLI tool**: Update command docs and usage examples
- **Frontend**: Update component docs and state management guides

## 5. Update Project-Level Documentation If Needed

If new patterns were introduced that affect the entire codebase:

- Update architecture documentation for system-wide patterns
- Update main README.md if core functionality changed
- Update CONTRIBUTING.md if development workflow changed
- Update any project-wide documentation that covers cross-cutting concerns

## 6. Validation Checklist

### For README.md Files:

- ✓ Clear and concise (typically 50-150 lines)
- ✓ Contains installation/setup instructions
- ✓ Includes usage examples
- ✓ Shows project structure if helpful
- ✓ Links to additional documentation
- ✓ Shows how to run tests
- ✓ Well-formatted and readable

### For Implementation/Architecture Documentation:

- ✓ Reasonable length based on complexity (100-300 lines typical)
- ✓ Core concepts clearly explained
- ✓ Architecture and data flow documented
- ✓ Integration points identified
- ✓ Key patterns and conventions documented
- ✓ Common issues and solutions included
- ✓ Focuses on HOW the system works

### For Design Documentation:

- ✓ Concise and focused (50-150 lines typical)
- ✓ Captures WHY design decisions were made
- ✓ Explains alternative approaches considered
- ✓ Documents trade-offs objectively
- ✓ No overlap with implementation details
- ✓ Focuses on design rationale

### For Test Documentation:

- ✓ Concise (50-100 lines typical)
- ✓ Defines test strategy (unit, integration, e2e)
- ✓ Lists key test scenarios
- ✓ Includes coverage goals
- ✓ Documents test data requirements

## Key Principles

1. **Concise but Complete**: Every line should provide unique value
2. **Implementation-Driven**: Document what actually exists, not plans
3. **AI-Optimized**: Focus on context that helps AI understand and extend the code
4. **Boundary Clarity**: Clear about what each feature handles vs delegates
5. **Living Documentation**: Reflects current state, not history
6. **Decision Preservation**: DESIGN docs capture the reasoning that might otherwise be lost

## Documentation Purpose Distinction

### Implementation Documentation (Focus on "HOW"):

✓ **Purpose**: What problem this solves
✓ **Core Requirements**: Scope and boundaries
✓ **Architecture**: Request flow, key components, data models
✓ **Integration Points**: External services, dependencies, APIs
✓ **Key Patterns**: Non-obvious implementation patterns and behaviors
✓ **Common Issues & Solutions**: Gotchas, debugging tips, known problems

**Goal**: Help developers understand and work with the existing implementation

### Design Documentation (Focus on "WHY"):

✓ **Design Philosophy**: Overall approach and principles
✓ **Architecture Decisions**: Why specific designs were chosen over alternatives
✓ **Trade-off Analysis**: What was gained/sacrificed in design choices
✓ **Pattern Innovations**: Unique patterns developed for specific challenges
✓ **Alternative Approaches**: What was considered but rejected and why
✓ **Integration Philosophy**: How this module's design fits the overall system

**Goal**: Preserve the reasoning behind design decisions for future reference

## What NOT to Document

### In Implementation Documentation:

✗ Code that can be read directly from the implementation
✗ Standard framework patterns
✗ Step-by-step implementation details
✗ Obvious naming conventions or standard structures
✗ Simple bug fixes or routine implementations

### In Design Documentation:

✗ **Implementation details** (those belong in implementation docs)
✗ **Historical changelog entries** or "what changed when"
✗ **Simple technical choices** with obvious single solutions
✗ **Standard design patterns** unless uniquely applied
✗ **Detailed code examples** or implementation specifics
✗ **Process documentation** unrelated to technical design

**Remember**: Design documentation should be timeless rationale, not implementation history.

The goal is to create documentation that serves as a force multiplier for developers, providing essential context without redundancy, while preserving critical decision-making rationale for future reference.
