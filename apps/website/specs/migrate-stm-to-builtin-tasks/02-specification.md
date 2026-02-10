# Migrate STM to Built-in Task Tools

**Status:** Draft
**Authors:** Claude Code
**Date:** 2026-01-30
**Slug:** migrate-stm-to-builtin-tasks
**Related:** [Ideation Document](./01-ideation.md)

---

## Overview

Migrate all Simple Task Manager (STM) usage in `.claude/commands/` to Claude Code's built-in task tools (TaskCreate, TaskGet, TaskUpdate, TaskList), then remove all STM references from the codebase. This simplifies the command infrastructure by leveraging native Claude Code capabilities instead of external tooling.

---

## Background/Problem Statement

The current spec workflow commands (`decompose.md`, `execute.md`, `feedback.md`, `migrate.md`, `ideate-to-spec.md`) rely on Simple Task Manager (STM), an external CLI tool, for task creation, tracking, and orchestration. This creates several issues:

1. **External dependency**: STM must be installed separately (`npm install -g simple-task-master`)
2. **Availability checks**: Commands include `!claudekit status stm` checks and TodoWrite fallback logic
3. **Feature mismatch**: STM has tags, but built-in tools handle this differently via subject prefixes
4. **Maintenance burden**: Two task management paradigms to understand and maintain
5. **Redundancy**: Claude Code now provides equivalent built-in task tools

Claude Code's built-in task tools (TaskCreate, TaskGet, TaskUpdate, TaskList) provide the same core functionality without external dependencies.

---

## Goals

- Replace all STM commands with equivalent built-in task tool calls
- Remove all `!claudekit status stm` availability checks
- Remove all TodoWrite fallback logic (built-in tools are always available)
- Establish a subject-prefix convention for feature filtering: `[<slug>] [P<phase>] Title`
- Maintain all existing workflow functionality (decompose, execute, feedback, migrate)
- Clean removal of all STM references from the codebase

---

## Non-Goals

- Adding new features to the spec workflow
- Changing the overall spec workflow structure
- Backwards compatibility with STM (clean break)
- Supporting TodoWrite as a fallback (unnecessary with built-in tools)
- Implementing a tag system in the task tools (use subject prefix convention instead)

---

## Technical Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| Claude Code | Latest | Built-in task tools (TaskCreate, TaskGet, TaskUpdate, TaskList) |
| Markdown | N/A | Command file format |

No external dependencies required (that's the point!).

---

## Detailed Design

### 1. API Mapping Reference

The following table defines the exact mapping from STM commands to built-in task tools:

| STM Command | Built-in Equivalent | Notes |
|-------------|---------------------|-------|
| `stm add "title" --description "..." --details "..." --tags "..."` | `TaskCreate({ subject, description })` | Combine --description and --details into description field. Tags → subject prefix |
| `stm list --tags "feature:x"` | `TaskList()` + filter subjects containing `[x]` | Filter in prompt logic, not API |
| `stm list --status pending` | `TaskList()` + filter by status | Filter in prompt logic |
| `stm list -f json` | `TaskList()` | Already returns structured data |
| `stm show "$id"` | `TaskGet({ taskId })` | Direct equivalent |
| `stm update "$id" --status done` | `TaskUpdate({ taskId, status: "completed" })` | Status value differs: "done" → "completed" |
| `stm update "$id" --status in-progress` | `TaskUpdate({ taskId, status: "in_progress" })` | Status value differs: "in-progress" → "in_progress" |
| `stm update "$id" --add-tags "..."` | `TaskUpdate({ taskId, subject: "..." })` | Update subject to add tag prefix |
| `stm update "$id" --details "..."` | `TaskUpdate({ taskId, description: "..." })` | Details map to description |
| `stm delete "$id"` | N/A (mark completed instead) | Built-in tools don't support delete |
| `!claudekit status stm` | Remove entirely | Built-in tools are always available |

### 2. Subject Prefix Convention

Since built-in tools lack native tags, use structured subjects for filtering:

**Format:** `[<feature-slug>] [P<phase>] <imperative-title>`

**Examples:**
- `[add-user-auth] [P1] Create login form component`
- `[add-user-auth] [P2] Implement session management`
- `[migrate-stm] [P1] Update decompose.md to use TaskCreate`

**Filtering approach:**
- Feature filter: Check if subject contains `[feature-slug]`
- Phase filter: Check if subject contains `[P1]`, `[P2]`, etc.
- Status filter: Use status field directly from TaskList results

**Tag replacement mapping:**
| STM Tag | Subject Prefix |
|---------|---------------|
| `feature:<slug>` | `[<slug>]` |
| `phase1`, `phase2`, etc. | `[P1]`, `[P2]`, etc. |
| `feedback`, `deferred` | Include in description, not subject |
| `incremental` | Include in description |

### 3. Status Value Mapping

| STM Status | Built-in Status |
|------------|-----------------|
| `pending` | `pending` |
| `in-progress` | `in_progress` (underscore) |
| `done` | `completed` |

### 4. File-by-File Migration

#### 4.1 decompose.md (HIGH complexity)

**Current STM usage:**
- `!claudekit status stm` - availability check
- `stm init` - initialization
- `stm add "[P1.3] Title" --description "..." --details "..." --validation "..." --tags "feature:<slug>,phase1,..."` - task creation
- `stm list --tags "feature:<slug>" -f json` - list tasks for feature
- `stm list --tags "feature:<slug>" --status done -f json` - list completed tasks
- `stm update "$id" --status done` - mark complete
- `stm update "$id" --details "..."` - update details
- `stm show "$id"` - get task details
- TodoWrite fallback

**Migration changes:**

1. **Remove availability check block:**
   ```markdown
   <!-- DELETE this section -->
   !claudekit status stm

   0. **Task Management System**:
      - Check the STM_STATUS output above
      - If status is "Available but not initialized", run: `stm init`
      - If status is "Available and initialized", use STM for task management
      - If status is "Not installed", fall back to TodoWrite
   ```

2. **Replace task creation pattern:**
   ```markdown
   <!-- OLD -->
   stm add "[P1.3] Implement common hook utilities" \
     --description "Create shared utilities module for all hooks" \
     --details "$(cat /tmp/stm-task-details.txt)" \
     --validation "$(cat /tmp/stm-task-validation.txt)" \
     --tags "feature:<slug>,phase1,infrastructure,utilities"

   <!-- NEW -->
   TaskCreate({
     subject: "[<slug>] [P1] Implement common hook utilities",
     description: "Create shared utilities module for all hooks\n\n## Details\n<full details>\n\n## Validation\n<validation criteria>",
     activeForm: "Implementing common hook utilities"
   })
   ```

3. **Replace task listing:**
   ```markdown
   <!-- OLD -->
   stm list --tags "feature:<slug>" -f json

   <!-- NEW -->
   TaskList()
   # Then filter: tasks where subject contains "[<slug>]"
   ```

4. **Replace incremental mode detection:**
   ```markdown
   <!-- OLD -->
   stm list --tags "feature:<slug>" -f json
   # Check if result is empty

   <!-- NEW -->
   TaskList()
   # Filter tasks where subject contains "[<slug>]"
   # If filtered list is empty → Full mode
   ```

5. **Remove TodoWrite fallback:**
   ```markdown
   <!-- DELETE all TodoWrite fallback sections -->
   If STM is not available, use TodoWrite:
   ```javascript
   [
     {
       id: "1",
       content: "Phase 1: Set up TypeScript project structure",
       ...
     }
   ]
   ```
   ```

6. **Update post-creation validation:**
   ```markdown
   <!-- OLD -->
   stm show [task-id] | grep -E "(as specified|from spec|see specification)"
   stm list --format json | jq '.[] | select(.details | length < 500) | {id, title}'
   stm grep "```" | wc -l

   <!-- NEW -->
   TaskGet({ taskId: "[task-id]" })
   # Check description doesn't contain "as specified", "from spec", etc.
   # Check description length is substantial
   ```

#### 4.2 execute.md (HIGH complexity)

**Current STM usage:**
- `!claudekit status stm` - availability check
- `stm list --tags "feature:$slug" -f json` - list feature tasks
- `stm list --tags "feature:$slug" --status pending -f json` - pending tasks
- `stm list --tags "feature:$slug" --status done -f json` - completed tasks
- `stm show "$id" -f json` - get task details
- `stm update "$id" --status done` - mark complete
- `stm update "$id" --status in-progress` - mark in progress
- Cross-reference between STM and implementation summary

**Migration changes:**

1. **Remove availability check and fallback:**
   ```markdown
   <!-- DELETE -->
   !claudekit status stm

   1. **Check Task Management**:
      - If STM shows "Available but not initialized" → Run `stm init` first...
      - If STM shows "Available and initialized" → Use STM for tasks
      - If STM shows "Not installed" → Use TodoWrite instead
   ```

2. **Replace task filtering in session resume:**
   ```markdown
   <!-- OLD -->
   build_filtered_task_list() {
     ALL_TASKS=$(stm list --tags "feature:$slug" -f json)
     FILTERED_TASKS=$(echo "$ALL_TASKS" | jq -r '...')
   }

   <!-- NEW (prompt-based approach) -->
   Use TaskList() to get all tasks
   Filter tasks where subject contains "[<slug>]"
   Further filter by status field
   ```

3. **Replace cross-reference status check:**
   ```markdown
   <!-- OLD -->
   STM_DONE=$(stm list --tags "feature:$slug" --status done -f json | jq -r '.[].id')

   <!-- NEW -->
   Use TaskList()
   Filter tasks where subject contains "[<slug>]" AND status is "completed"
   ```

4. **Replace agent context building:**
   ```markdown
   <!-- OLD -->
   TASK_INFO=$(stm show "$task_id" -f json)
   TASK_TITLE=$(echo "$TASK_INFO" | jq -r '.title')

   <!-- NEW -->
   Use TaskGet({ taskId: "$task_id" })
   Extract subject and description from result
   ```

5. **Replace progress tracking:**
   ```markdown
   <!-- OLD -->
   stm list --pretty --tag feature:<slug>
   stm list --status pending --tag feature:<slug>

   <!-- NEW -->
   Use TaskList()
   Filter and display tasks where subject contains "[<slug>]"
   ```

#### 4.3 feedback.md (MEDIUM complexity)

**Current STM usage:**
- `!claudekit status stm` - availability check
- `stm list --tags "feature:<slug>" --status in-progress` - check incomplete tasks
- `stm add "<title>" --details "<full-details>" --tags "feature:<slug>,feedback,deferred,<priority>" --status pending` - create deferred task

**Migration changes:**

1. **Remove availability check:**
   ```markdown
   <!-- DELETE -->
   !claudekit status stm
   ```

2. **Update incomplete tasks check:**
   ```markdown
   <!-- OLD -->
   stm list --tags "feature:<slug>" --status in-progress

   <!-- NEW -->
   Use TaskList()
   Filter tasks where subject contains "[<slug>]" AND status is "in_progress"
   ```

3. **Replace deferred task creation:**
   ```markdown
   <!-- OLD -->
   stm add "<title>" \
     --details "<full-details>" \
     --tags "feature:<slug>,feedback,deferred,<priority>" \
     --status pending

   <!-- NEW -->
   TaskCreate({
     subject: "[<slug>] <title (max 80 chars)>",
     description: "## Feedback Type\n<feedback|deferred>\n\n## Priority\n<priority>\n\n## Details\n<full feedback description>\n\n## Exploration Findings\n<summary>\n\n## Research Insights\n<if any>\n\n## Recommended Approach\n<approach>\n\n## Implementation Scope\n<scope>\n\n## Reference\nSee specs/<slug>/05-feedback.md",
     activeForm: "Creating deferred feedback task"
   })
   ```

4. **Update query commands in output:**
   ```markdown
   <!-- OLD -->
   View task: stm show <task-id>
   List deferred feedback: stm list --tags feature:<slug>,feedback,deferred

   <!-- NEW -->
   View task: TaskGet({ taskId: "<task-id>" })
   List deferred feedback: TaskList() then filter subjects containing "[<slug>]" and descriptions containing "Feedback Type"
   ```

#### 4.4 migrate.md (LOW complexity)

**Current STM usage:**
- `command -v stm` - availability check
- `stm update <task-id> --add-tags "feature:<slug>"` - add feature tag

**Migration changes:**

1. **Remove availability check:**
   ```markdown
   <!-- OLD -->
   1. **Check if STM is available:** `command -v stm`

   <!-- DELETE this step entirely -->
   ```

2. **Replace tag update with subject update:**
   ```markdown
   <!-- OLD -->
   stm update <task-id> --add-tags "feature:<slug>"

   <!-- NEW -->
   # Get current task
   TaskGet({ taskId: "<task-id>" })
   # Update subject to include feature prefix
   TaskUpdate({
     taskId: "<task-id>",
     subject: "[<slug>] " + <original-subject>
   })
   ```

3. **Update migration report:**
   ```markdown
   <!-- OLD -->
   - ✅ STM tasks: 5 tasks tagged with feature:feat-user-auth

   <!-- NEW -->
   - ✅ Tasks: 5 tasks updated with [feat-user-auth] subject prefix
   ```

#### 4.5 ideate-to-spec.md (LOW complexity)

**Current STM usage:**
- Reference in Step 7 output: `stm list --pretty --tag feature:{slug}`

**Migration changes:**

1. **Update next steps output:**
   ```markdown
   <!-- OLD -->
   5. [ ] {Track progress with: stm list --pretty --tag feature:{slug}}

   <!-- NEW -->
   5. [ ] {Track progress with: TaskList() filtered by "[{slug}]" in subject}
   ```

### 5. Content Migration Strategy

When migrating STM task content to built-in tools:

**STM fields → Built-in fields mapping:**

| STM Field | Built-in Field | Notes |
|-----------|---------------|-------|
| title | subject | Add feature prefix |
| description | description (first paragraph) | Brief summary |
| details | description (main body) | Full implementation details |
| validation | description (## Validation section) | Acceptance criteria |
| tags | subject prefix + description metadata | See tag replacement mapping |
| status | status | Map values per status table |
| deps | addBlockedBy | Task dependencies |

**Description structure for migrated tasks:**

```markdown
<Brief description from STM --description>

## Details
<Full content from STM --details>

## Validation
<Content from STM --validation>

## Metadata
- Feature: <slug>
- Phase: <phase>
- Type: <feedback|incremental|standard>
```

### 6. Removal Checklist

After migration, search and remove all occurrences of:

| Pattern | Files to Check |
|---------|---------------|
| `stm ` (stm commands) | All `.md` files in `.claude/commands/` |
| `STM` (references) | All `.md` files in `.claude/commands/` |
| `Simple Task Manager` | All `.md` files |
| `claudekit status stm` | All `.md` files in `.claude/commands/` |
| `TodoWrite` fallback logic | `decompose.md`, `execute.md` |
| `--tags` (STM tag syntax) | All `.md` files in `.claude/commands/` |

---

## Implementation Phases

### Phase 1: Core Infrastructure (decompose.md)

**Tasks:**
1. Remove `!claudekit status stm` availability check
2. Remove STM initialization logic
3. Replace `stm add` with `TaskCreate` pattern
4. Replace `stm list --tags` with `TaskList` + filtering
5. Replace `stm update` with `TaskUpdate`
6. Remove TodoWrite fallback logic
7. Update incremental mode detection to use built-in tools
8. Update incremental mode task creation/update functions
9. Update post-creation validation examples

**Acceptance Criteria:**
- decompose.md contains no STM references
- decompose.md contains no TodoWrite fallback
- Task creation uses TaskCreate with subject prefix convention
- Task listing uses TaskList with prompt-based filtering

### Phase 2: Orchestration (execute.md)

**Tasks:**
1. Remove `!claudekit status stm` availability check
2. Remove STM/TodoWrite fallback logic
3. Update session detection to use built-in tools
4. Update `build_filtered_task_list` function to use TaskList + filtering
5. Update `cross_reference_task_status` function
6. Update agent context building to use TaskGet
7. Update progress tracking examples
8. Update implementation summary update functions

**Acceptance Criteria:**
- execute.md contains no STM references
- execute.md contains no TodoWrite references
- Session resume works with built-in tools
- Cross-reference reconciliation works

### Phase 3: Supporting Commands

**Tasks:**
1. **feedback.md**: Remove availability check, update incomplete tasks query, replace deferred task creation
2. **migrate.md**: Remove availability check, replace tag updates with subject updates
3. **ideate-to-spec.md**: Update next steps output to reference TaskList

**Acceptance Criteria:**
- All three files contain no STM references
- Deferred task creation works with TaskCreate
- Migration tag updates work via subject modification

### Phase 4: Cleanup & Verification

**Tasks:**
1. Search entire codebase for remaining STM references
2. Search for remaining TodoWrite fallback logic
3. Search for remaining `claudekit status stm` references
4. Update any documentation that references STM
5. Verify all spec workflow commands function correctly

**Acceptance Criteria:**
- Zero STM references in codebase
- Zero TodoWrite fallback logic related to STM
- All workflows (decompose, execute, feedback, migrate) function correctly

---

## Testing Strategy

### Manual Testing

| Test | Steps | Expected Result |
|------|-------|-----------------|
| Full decompose | Run `/spec:decompose` on a spec | Tasks created with subject prefixes, no errors |
| Incremental decompose | Run `/spec:decompose` on previously decomposed spec | Completed tasks preserved, new tasks added |
| Session resume | Run `/spec:execute`, interrupt, re-run | Resumes from previous progress |
| Deferred feedback | Run `/spec:feedback`, select "Defer" | Task created with correct subject and description |
| Spec migration | Run `/spec:migrate` | Tasks updated with feature prefix |

### Verification Commands

After migration, these commands should work correctly:

```
# List all tasks
TaskList()

# Get task details
TaskGet({ taskId: "..." })

# Update task status
TaskUpdate({ taskId: "...", status: "completed" })

# Create new task
TaskCreate({ subject: "[slug] [P1] Title", description: "..." })
```

---

## Rollback Plan

If issues are discovered after migration:

1. **Git-based rollback**: All command files are version controlled
   ```bash
   git checkout HEAD~1 -- .claude/commands/
   ```

2. **Selective rollback**: Restore individual files as needed

No data migration is required since tasks are session-specific and not persisted across projects.

---

## Security Considerations

- No security implications - this is internal tooling migration
- No credentials or sensitive data involved
- No external network calls added or removed

---

## Performance Considerations

- Built-in tools should have equal or better performance than external STM CLI
- No additional latency from external process spawning
- Task filtering happens in prompt logic rather than CLI flags (no performance impact)

---

## Documentation Updates

| Document | Changes |
|----------|---------|
| `.claude/commands/spec/decompose.md` | Full migration |
| `.claude/commands/spec/execute.md` | Full migration |
| `.claude/commands/spec/feedback.md` | Migration |
| `.claude/commands/spec/migrate.md` | Migration |
| `.claude/commands/ideate-to-spec.md` | Update STM reference in output |

No changes needed to `CLAUDE.md` since it doesn't reference STM directly in spec workflow sections.

---

## Open Questions

All questions resolved in ideation:

1. ~~**Feature Filtering Approach**~~ (RESOLVED)
   **Answer:** Subject prefix convention `[<slug>] [P<phase>] Title`
   **Rationale:** Simple, visible, searchable without complex parsing

2. ~~**Availability Checks**~~ (RESOLVED)
   **Answer:** Remove ALL availability checks AND TodoWrite fallback
   **Rationale:** Built-in tools are always available, no fallback needed

3. ~~**Backwards Compatibility**~~ (RESOLVED)
   **Answer:** Clean break - fully migrate, remove all STM references
   **Rationale:** Internal tooling with no external users, clean codebase preferred

---

## References

- [Ideation Document](./01-ideation.md)
- Claude Code Built-in Task Tools Documentation
- Current command files in `.claude/commands/`

---

## Changelog

| Date | Author | Changes |
|------|--------|---------|
| 2026-01-30 | Claude Code | Initial specification |
