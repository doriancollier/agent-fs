# Ideation: Migrate STM to Built-in Task Tools

## Intent & Assumptions

### Goal
Replace all Simple Task Manager (STM) usage in `.claude/commands/` with Claude Code's built-in task tools (TaskCreate, TaskGet, TaskUpdate, TaskList), then remove all STM references from the codebase.

### Assumptions
1. Built-in task tools provide equivalent functionality to STM for the spec workflow
2. Commands using STM can be adapted to use the new API without breaking workflows
3. TodoWrite remains available as a lighter-weight fallback when needed
4. Migration can be done incrementally (one command at a time)

---

## Pre-reading Log

| File | Lines | Key Observations |
|------|-------|------------------|
| `.claude/commands/spec/decompose.md` | 1077 | Heavy STM usage for task creation with tags, phases, validation. Uses `stm add`, `stm list`, `stm update` extensively. |
| `.claude/commands/spec/execute.md` | 1182 | Uses STM for task orchestration, session resume, cross-referencing. Key patterns: `stm list --tags`, `stm show`, `stm update --status`. |
| `.claude/commands/spec/feedback.md` | 810 | Creates deferred tasks via STM with priority tags. Uses `stm add` with `--details` and `--tags`. |
| `.claude/commands/spec/migrate.md` | 170 | Uses `stm update --add-tags` for task tagging during spec migration. |
| `.claude/commands/ideate-to-spec.md` | 837 | References STM in "next steps" output: `stm list --pretty --tag feature:{slug}`. |

---

## Codebase Map

### Files Requiring Modification

```
.claude/commands/
├── spec/
│   ├── decompose.md      [HEAVY] - Task creation, listing, updating
│   ├── execute.md        [HEAVY] - Task orchestration, status tracking
│   ├── feedback.md       [MEDIUM] - Deferred task creation
│   └── migrate.md        [LIGHT] - Task tagging
└── ideate-to-spec.md     [LIGHT] - STM reference in output
```

### Impact Analysis

| File | STM Commands Used | Migration Complexity |
|------|-------------------|---------------------|
| `decompose.md` | `stm add`, `stm list`, `stm update` | High - core task creation logic |
| `execute.md` | `stm list`, `stm show`, `stm update` | High - orchestration depends on task state |
| `feedback.md` | `stm add` | Medium - single use case |
| `migrate.md` | `stm update --add-tags` | Low - simple tag update |
| `ideate-to-spec.md` | Reference only | Low - text replacement |

---

## Research Findings

### Built-in Task Tools API

#### TaskCreate
Creates a new task with `pending` status and no owner.

```typescript
TaskCreate({
  subject: "Brief title in imperative form",      // Required
  description: "Detailed description",             // Required
  activeForm: "Present continuous spinner text"    // Optional but recommended
})
```

**Returns**: Task object with `id`, `subject`, `description`, `status: "pending"`

#### TaskList
Lists all tasks with summary information.

```typescript
TaskList({})  // No parameters
```

**Returns**: Array of tasks with `id`, `subject`, `status`, `owner`, `blockedBy`

#### TaskGet
Retrieves full task details including description.

```typescript
TaskGet({ taskId: "task-id" })
```

**Returns**: Full task object with `subject`, `description`, `status`, `blocks`, `blockedBy`

#### TaskUpdate
Modifies task properties.

```typescript
TaskUpdate({
  taskId: "task-id",
  status: "in_progress" | "completed",   // Optional
  subject: "New title",                  // Optional
  description: "New description",        // Optional
  activeForm: "New spinner text",        // Optional
  owner: "agent-name",                   // Optional
  addBlockedBy: ["blocking-task-id"],    // Optional - adds dependencies
  addBlocks: ["dependent-task-id"]       // Optional
})
```

### Status Workflow
```
pending → in_progress → completed
```

- Tasks start as `pending` with no owner
- Claiming a task: set `status: "in_progress"` and `owner`
- Completing: set `status: "completed"`
- Dependencies auto-unblock when blocking task completes

### Key Differences from STM

| STM Feature | Built-in Equivalent | Notes |
|-------------|---------------------|-------|
| `stm add "title" --description "..." --tags "..."` | `TaskCreate({ subject, description })` | No native tags support |
| `stm list --tags "feature:x"` | `TaskList()` + filter in prompt | Filter via description content |
| `stm list --status pending` | `TaskList()` + filter | Status filtering in prompt |
| `stm show "$id"` | `TaskGet({ taskId })` | Direct equivalent |
| `stm update "$id" --status done` | `TaskUpdate({ taskId, status: "completed" })` | Direct equivalent |
| `stm update "$id" --add-tags "..."` | N/A | Use description or metadata |
| `stm list -f json` | `TaskList()` | Returns structured data already |
| `!claudekit status stm` | Always available | Built-in tools don't need availability check |

### Tag Replacement Strategy

STM uses tags for:
1. **Feature grouping**: `feature:<slug>` - Include slug in task subject prefix: `[<slug>]`
2. **Phase tracking**: `phase1`, `phase2` - Include in subject: `[P1]`, `[P2]`
3. **Priority**: `P1`, `P2` - Include in subject prefix
4. **Type**: `feedback`, `deferred` - Include in description

**Proposed convention**: `[<slug>] [P<phase>] Task title`

Example: `[auth-flow] [P1] Create login form component`

---

## Migration Strategy

### Approach: Subject-Based Filtering

Since built-in tools lack native tags, use structured subjects for filtering:

```
Subject format: [<feature-slug>] [P<phase>] <imperative-title>
Example: [migrate-stm] [P1] Update decompose.md to use TaskCreate
```

**Filtering in prompts**:
```
TaskList() → filter tasks where subject contains "[migrate-stm]"
```

### Phase 1: Core Infrastructure (decompose.md)
1. Replace `stm add` with `TaskCreate`
2. Replace `stm list --tags` with `TaskList` + subject filtering
3. Replace `stm update` with `TaskUpdate`
4. Remove `!claudekit status stm` availability checks
5. Update incremental mode functions

### Phase 2: Orchestration (execute.md)
1. Update task listing and filtering logic
2. Update session resume to use `TaskList` + `TaskGet`
3. Update status tracking with `TaskUpdate`
4. Update cross-reference functions

### Phase 3: Supporting Commands
1. `feedback.md`: Replace deferred task creation
2. `migrate.md`: Replace tag updates (use description updates)
3. `ideate-to-spec.md`: Update next steps output

### Phase 4: Cleanup
1. Search for any remaining STM references
2. Remove STM-related comments and dead code
3. Update documentation if needed

---

## Clarifications

### Decision 1: Feature Filtering Approach

How should we filter tasks by feature without native tags?

**Options**:
1. **Subject prefix convention** (Recommended)
   - Format: `[feature-slug] [P1] Task title`
   - Filter: Check if subject contains `[feature-slug]`
   - Pros: Simple, visible, searchable
   - Cons: Clutters subject slightly

2. **Description metadata**
   - Add `Feature: <slug>` line at start of description
   - Filter: Parse description for metadata
   - Pros: Cleaner subjects
   - Cons: More complex parsing

3. **Metadata field**
   - Use `metadata` parameter on TaskCreate/TaskUpdate
   - Filter: Check metadata in results
   - Pros: Structured, clean
   - Cons: Need to verify metadata support in TaskList results

**Recommendation**: Option 1 (Subject prefix) - simplest and most visible.

### Decision 2: Availability Checks

Current commands check `!claudekit status stm` before using STM. Since built-in tools are always available, should we:

**Options**:
1. **Remove all availability checks** (Recommended)
   - Built-in tools don't require external dependencies
   - Simplifies command logic

2. **Keep checks for TodoWrite fallback**
   - Some edge cases might benefit from lighter-weight tracking
   - More defensive

**Recommendation**: Option 1 - Remove checks. Built-in tools are reliable; TodoWrite can be used separately when explicitly needed.

### Decision 3: Backwards Compatibility

Should we maintain any STM compatibility during transition?

**Options**:
1. **Clean break** (Recommended)
   - Fully migrate to built-in tools
   - Remove all STM references
   - Simpler, cleaner codebase

2. **Gradual deprecation**
   - Support both STM and built-in during transition
   - More complex but safer
   - Unnecessary since STM is internal tooling

**Recommendation**: Option 1 - Clean break. This is internal tooling with no external users.

---

## Open Questions

1. **Task persistence**: Do built-in tasks persist across sessions? (Research indicates yes - stored in `~/.claude/tasks/`)

2. **Task ID format**: Are task IDs stable strings that can be referenced in prompts? (Research indicates yes)

3. **Concurrent access**: How do built-in tools handle multiple agents updating same task? (Uses status + owner for coordination)

---

## Next Steps

1. [ ] Review clarifications with user
2. [ ] Create specification from this ideation
3. [ ] Decompose into implementation tasks
4. [ ] Execute migration in phases
