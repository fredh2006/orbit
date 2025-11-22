---
allowed-tools: [Read, Write, Grep, Glob, Task, Search]
---

# Understand Feature - Comprehensive Feature Analysis

Thoroughly analyzes a feature implementation by reading relevant documentation, design documents, and code to provide a comprehensive understanding summary.

# Usage

- `/understand {{FEATURE_PATH}}` - Analyzes the specified feature/component/module
- Can be used with any codebase to understand implementation details

**Example:**
- `/understand authentication`
- `/understand api/users`
- `/understand components/Header`

# Process

## 1. Determine Feature Type & Location

**Locate the feature/component/codebase area:**

- Search for the feature/component name across the project structure
- Identify the main directories containing relevant code
- Verify the feature exists by checking for expected files and structure
- Adapt analysis approach based on project type (monorepo, microservice, library, etc.)

## 2. Documentation Discovery & Reading Order

**Step 1 - Read Core Documentation:**

- Check for project README files
- Look for architecture documentation (ARCHITECTURE.md, DESIGN.md, etc.)
- Read any main documentation files in the root or docs/ directory

**Step 2 - Read Feature-Specific Documentation:**

- Search for documentation near the feature code (docs/ subdirectories, inline comments)
- Look for README files in feature directories
- Check for design documents or specifications
- Read API documentation if available
- Note if documentation is missing - this indicates areas to explore through code

**Step 3 - Check for Additional Context:**

- Look for related documentation in adjacent features/modules
- Check for test documentation that explains behavior
- Review any diagrams or visualization files

## 3. Code Implementation Analysis

**Identify key directories and analyze:**

```
{FEATURE_PATH}/
├── docs/            # Documentation if present
├── src/ or lib/     # Main source code
├── tests/           # Test files
├── types/ or models/ # Type definitions or data models
└── config/          # Configuration files
```

**Adapt analysis to project structure - common patterns:**

- **API/Backend**: Routes/endpoints, business logic, data models, database interactions
- **Frontend**: Components, state management, API integrations, UI patterns
- **Library**: Public API, core functionality, utilities, type definitions
- **CLI**: Commands, parsers, output formatting, configuration

**Key Analysis Areas:**

- **Data Flow**: How data moves through the system
- **Integration Points**: Dependencies on other features and external services
- **State Management**: How state is handled (databases, caches, global state, etc.)
- **Access Control**: Permission patterns and security if applicable
- **Error Handling**: How errors are managed and communicated
- **Testing Strategy**: Coverage and testing patterns used

## 4. Implementation Pattern Analysis

**Common Patterns to Identify:**

- **Architectural patterns**: MVC, layered architecture, dependency injection, etc.
- **Design patterns**: Factory, observer, strategy, etc.
- **Data access patterns**: Repository, ORM usage, query builders, etc.
- **Error handling patterns**: Try/catch conventions, error types, logging
- **Testing patterns**: Unit test structure, mocking approaches, test utilities
- **Code organization**: Module structure, naming conventions, separation of concerns
- **Integration patterns**: How external services/APIs are integrated
- **Configuration patterns**: Environment variables, config files, feature flags

## 5. Generate Understanding Document

**Output Directory:** `Documentation/analysis/{YYYY-MM-DD}/`
**Output File:** `UNDERSTANDING_{FEATURE_NAME}.md`

**Directory Structure:**
```
Documentation/
└── analysis/
    ├── {YYYY-MM-DD}/              # Dated directory
    │   ├── UNDERSTANDING_{FEATURE}.md
    │   ├── PLAN_{TASK}.md
    │   └── ... (other analysis docs)
    └── archive/                    # Completed work
        └── {YYYY-MM-DD}/
            └── ... (archived artifacts)
```

**Directory Creation:**
Create the timestamped directory if it doesn't exist before writing the document.

### Document Structure

```markdown
# Understanding: {Feature/Component Name}

## Overview
**Type**: {Feature|Component|Service|Library|CLI|etc.}
**Location**: {Primary directory path}
**Purpose**: {What problem this solves - 1-2 lines}
**Status**: {Active|Legacy|Experimental|Deprecated}

## Architecture

### Core Components
- **{Component Name}**: {Path} - {Responsibility}
- **{Component Name}**: {Path} - {Responsibility}

### Data Flow
1. {Step 1: How data enters the system}
2. {Step 2: Processing/transformation}
3. {Step 3: Storage/response}

### Key Files
- `{filename}`: {What it does, why it's important}
- `{filename}`: {What it does, why it's important}

## Implementation Details

### Patterns & Conventions
- **{Pattern Name}**: {How it's used in this feature}
- **{Pattern Name}**: {How it's used in this feature}

### State Management
- **Storage**: {How/where data is persisted}
- **Caching**: {Caching strategy if any}
- **Session**: {Session/state handling approach}

### Integration Points
- **Internal**:
  - {Feature}: {How they integrate}
  - {Feature}: {How they integrate}
- **External**:
  - {Service}: {Integration method and purpose}
  - {Service}: {Integration method and purpose}

## Technical Constraints

### Current Limitations
- {Limitation and why it exists}
- {Limitation and why it exists}

### Dependencies
- **Required**: {Library/Service} - {Version if relevant}
- **Required**: {Library/Service} - {Version if relevant}

### Performance Considerations
- {Any known performance patterns or concerns}
- {Optimization strategies in use}

## Testing & Quality

### Test Coverage
- **Unit Tests**: {Coverage level and location}
- **Integration Tests**: {What's tested}
- **E2E Tests**: {If applicable}

### Known Issues
- {Issue/Gotcha}: {Impact and workaround if any}
- {Issue/Gotcha}: {Impact and workaround if any}

## Documentation Status
- **README or main docs**: {Exists/Missing} - {Quality if exists}
- **Architecture docs**: {Exists/Missing} - {Key decisions if exists}
- **API docs**: {Exists/Missing} - {Coverage if exists}
- **Test docs**: {Exists/Missing} - {Test coverage if exists}
- **Inline code documentation**: {Quality level}

## Summary
{2-3 line summary of the feature's role, current state, and implementation approach}

## Notes for Requirements Definition
- **Existing Patterns to Follow**: {Key patterns that new work should align with}
- **Constraints to Consider**: {Technical/architectural constraints}
- **Integration Considerations**: {How new changes might affect integrations}
```

## 6. Analysis Questions to Answer

**Business Logic:**

- What core business problem does this feature solve?
- What are the key use cases and user journeys?
- How does this feature integrate with the overall application flow?

**Technical Implementation:**

- How does this feature follow the established architecture patterns?
- What makes this implementation unique or complex?
- Are there any deviations from standard patterns, and why?

**Data & State:**

- How is data persisted and retrieved?
- What is the state management strategy?
- How are data transformations handled?

**Integration & Dependencies:**

- What other features does this integrate with?
- What external services does it depend on?
- How are errors from dependencies handled?

## 7. Completion

**Deliverables:**

1. **Understanding Document**: `UNDERSTANDING_{FEATURE_NAME}.md` saved to project root or feature directory
2. **Verbal Summary**: Brief confirmation of analysis completion

**Final Output:**

Confirm completion with the path to the generated understanding document.

## Success Criteria

- ✅ All relevant documentation has been read and understood
- ✅ Code implementation patterns have been analyzed
- ✅ Integration points and dependencies are clear
- ✅ Architecture decisions and trade-offs are understood
- ✅ Testing and quality patterns are identified
- ✅ Understanding document created and saved
- ✅ Ready for requirements definition phase

The goal is to provide a comprehensive, structured understanding document that serves as the foundation for requirements definition and subsequent implementation planning.
