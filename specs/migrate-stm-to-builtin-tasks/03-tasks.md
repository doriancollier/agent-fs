# Task Breakdown: Migrate STM to Built-in Task Tools

**Generated:** 2026-01-30
**Source:** specs/migrate-stm-to-builtin-tasks/02-specification.md
**Last Decompose:** 2026-01-30
**Mode:** Full

---

## Overview

Migrate all Simple Task Manager (STM) usage in `.claude/commands/` to Claude Code's built-in task tools (TaskCreate, TaskGet, TaskUpdate, TaskList), then remove all STM references. This eliminates external dependencies and leverages native Claude Code capabilities.

**Total Tasks:** 15
**Phases:** 4

---

## Phase 1: Core Infrastructure (decompose.md)

### Task 1.1: Remove STM availability check from decompose.md
**Description:** Delete the `!claudekit status stm` block and STM initialization logic
**Size:** Small
**Priority:** High
**Dependencies:** None
**Can run parallel with:** None (must complete before other Phase 1 tasks)

**Technical Requirements:**
Remove the entire availability check section that looks for:
```markdown
!claudekit status stm

0. **Task Management System**:
   - Check the STM_STATUS output above
   - If status is "Available but not initialized", run: `stm init`
   - If status is "Available and initialized", use STM for task management
   - If status is "Not installed", fall back to TodoWrite
```

Also remove any `stm init` references.

**Implementation Steps:**
1. Read `.claude/commands/spec/decompose.md`
2. Locate and remove the `!claudekit status stm` line
3. Remove the "Task Management System" section (Step 0)
4. Remove any `stm init` calls
5. Verify no orphaned references to STM_STATUS remain

**Acceptance Criteria:**
- [ ] No `!claudekit status stm` in decompose.md
- [ ] No `stm init` references
- [ ] No STM_STATUS variable references
- [ ] File still parses as valid markdown

---

### Task 1.2: Remove TodoWrite fallback from decompose.md
**Description:** Delete all TodoWrite fallback logic since built-in tools are always available
**Size:** Small
**Priority:** High
**Dependencies:** Task 1.1
**Can run parallel with:** None

**Technical Requirements:**
Remove all sections that reference TodoWrite as a fallback, including:
- "If STM is not available, use TodoWrite" blocks
- TodoWrite JSON examples
- Conditional logic checking for STM availability

**Implementation Steps:**
1. Search for "TodoWrite" in decompose.md
2. Remove all fallback sections and conditional logic
3. Remove any TodoWrite JSON examples
4. Simplify instructions to assume task tools are always available

**Acceptance Criteria:**
- [ ] No "TodoWrite" references in decompose.md
- [ ] No "If STM is not available" conditional logic
- [ ] Clean, unconditional task tool usage

---

### Task 1.3: Replace stm add with TaskCreate in decompose.md
**Description:** Convert all `stm add` commands to TaskCreate tool calls
**Size:** Large
**Priority:** High
**Dependencies:** Task 1.2
**Can run parallel with:** None

**Technical Requirements:**

**Old pattern:**
```bash
stm add "[P1.3] Implement common hook utilities" \
  --description "Create shared utilities module for all hooks" \
  --details "$(cat /tmp/stm-task-details.txt)" \
  --validation "$(cat /tmp/stm-task-validation.txt)" \
  --tags "feature:<slug>,phase1,infrastructure,utilities"
```

**New pattern:**
```markdown
TaskCreate({
  subject: "[<slug>] [P1] Implement common hook utilities",
  description: "Create shared utilities module for all hooks\n\n## Details\n<full details content>\n\n## Validation\n<validation criteria>",
  activeForm: "Implementing common hook utilities"
})
```

**Content mapping:**
- STM `--description` + `--details` → Built-in `description` (combined)
- STM `--validation` → Built-in `description` (as "## Validation" section)
- STM `--tags "feature:<slug>,phase1"` → Built-in `subject` prefix `[<slug>] [P1]`
- STM title `"[P1.3] Title"` → Built-in `subject: "[<slug>] [P1] Title"`

**Implementation Steps:**
1. Find all `stm add` patterns in decompose.md
2. For each occurrence:
   - Extract title, description, details, validation, tags
   - Map tags to subject prefix format
   - Combine description + details + validation into single description field
   - Convert to TaskCreate call format
3. Update any heredoc/temp file patterns for large content
4. Test that examples are syntactically correct

**Acceptance Criteria:**
- [ ] No `stm add` commands in decompose.md
- [ ] All task creation uses TaskCreate format
- [ ] Subject prefix convention `[<slug>] [P<phase>]` applied
- [ ] Description field contains combined details and validation
- [ ] activeForm provided for user feedback

---

### Task 1.4: Replace stm list with TaskList in decompose.md
**Description:** Convert all `stm list` commands to TaskList with filtering
**Size:** Medium
**Priority:** High
**Dependencies:** Task 1.3
**Can run parallel with:** None

**Technical Requirements:**

**Old patterns:**
```bash
stm list --tags "feature:<slug>" -f json
stm list --tags "feature:<slug>" --status done -f json
stm list --status pending --tag feature:<slug>
```

**New patterns:**
```markdown
TaskList()
# Then filter: tasks where subject contains "[<slug>]"
# For status: filter by status field ("pending", "in_progress", "completed")
```

**Filtering approach (prompt-based):**
```markdown
Use TaskList() to get all tasks
Filter results where:
- subject contains "[<slug>]" (for feature filtering)
- status equals "completed" (instead of --status done)
- status equals "pending" (instead of --status pending)
```

**Implementation Steps:**
1. Find all `stm list` patterns in decompose.md
2. Replace with TaskList() call
3. Add prompt-based filtering instructions:
   - `--tags "feature:<slug>"` → filter subject contains `[<slug>]`
   - `--status done` → filter status equals "completed"
   - `--status pending` → filter status equals "pending"
   - `-f json` → remove (TaskList already returns structured data)
4. Update incremental mode detection logic

**Acceptance Criteria:**
- [ ] No `stm list` commands in decompose.md
- [ ] All listing uses TaskList() with prompt-based filtering
- [ ] Feature filtering uses subject prefix `[<slug>]`
- [ ] Status filtering uses correct values (completed, not done)

---

### Task 1.5: Replace stm update with TaskUpdate in decompose.md
**Description:** Convert all `stm update` commands to TaskUpdate tool calls
**Size:** Medium
**Priority:** High
**Dependencies:** Task 1.4
**Can run parallel with:** None

**Technical Requirements:**

**Old patterns:**
```bash
stm update "$task_id" --status done
stm update "$task_id" --status in-progress
stm update "$task_id" --details "..."
stm update "$task_id" --add-tags "..."
```

**New patterns:**
```markdown
TaskUpdate({
  taskId: "$task_id",
  status: "completed"  // "done" → "completed"
})

TaskUpdate({
  taskId: "$task_id",
  status: "in_progress"  // "in-progress" → "in_progress"
})

TaskUpdate({
  taskId: "$task_id",
  description: "..."  // --details → description
})

TaskUpdate({
  taskId: "$task_id",
  subject: "[<slug>] [P1] ..."  // --add-tags → update subject prefix
})
```

**Status mapping:**
| STM Status | Built-in Status |
|------------|-----------------|
| `done` | `completed` |
| `in-progress` | `in_progress` |
| `pending` | `pending` |

**Implementation Steps:**
1. Find all `stm update` patterns in decompose.md
2. Map status values (done→completed, in-progress→in_progress)
3. Map --details to description field
4. Map --add-tags to subject updates
5. Convert to TaskUpdate call format

**Acceptance Criteria:**
- [ ] No `stm update` commands in decompose.md
- [ ] All updates use TaskUpdate format
- [ ] Status values correctly mapped
- [ ] Tag updates converted to subject prefix updates

---

### Task 1.6: Update incremental mode functions in decompose.md
**Description:** Rewrite incremental mode detection and task update functions
**Size:** Large
**Priority:** High
**Dependencies:** Task 1.5
**Can run parallel with:** None

**Technical Requirements:**

The decompose.md has incremental mode functions that need updating:
- `update_stm_tasks()` → use TaskUpdate
- `create_incremental_stm_tasks()` → use TaskCreate
- Mode detection logic → use TaskList

**Old incremental detection:**
```bash
stm list --tags "feature:<slug>" -f json
# Check if result is empty
```

**New incremental detection:**
```markdown
Use TaskList() to get all tasks
Filter tasks where subject contains "[<slug>]"
If filtered list is empty → Full mode (first-time decompose)
```

**Old update function:**
```bash
stm update "$task_id" --details "$updated_details"
```

**New update function:**
```markdown
TaskUpdate({
  taskId: "$task_id",
  description: "$updated_details\n\n## Incremental Update\n..."
})
```

**Implementation Steps:**
1. Locate incremental mode detection logic
2. Replace STM list check with TaskList + filtering
3. Rewrite `update_stm_tasks` function using TaskUpdate
4. Rewrite `create_incremental_stm_tasks` function using TaskCreate
5. Update mode decision logic and user feedback messages

**Acceptance Criteria:**
- [ ] Incremental detection uses TaskList with subject filtering
- [ ] Update functions use TaskUpdate
- [ ] Create functions use TaskCreate
- [ ] Mode messages updated (no STM references)

---

## Phase 2: Orchestration (execute.md)

### Task 2.1: Remove STM availability check from execute.md
**Description:** Delete the `!claudekit status stm` block and fallback logic
**Size:** Small
**Priority:** High
**Dependencies:** Phase 1 complete
**Can run parallel with:** Task 2.2

**Technical Requirements:**
Remove the entire availability check section including:
- `!claudekit status stm` line
- "Check Task Management" section
- STM initialization instructions
- TodoWrite fallback logic

**Implementation Steps:**
1. Read `.claude/commands/spec/execute.md`
2. Remove `!claudekit status stm` line
3. Remove "Check Task Management" section
4. Remove all TodoWrite fallback references
5. Simplify to assume built-in tools always available

**Acceptance Criteria:**
- [ ] No `!claudekit status stm` in execute.md
- [ ] No TodoWrite fallback logic
- [ ] No STM initialization instructions

---

### Task 2.2: Replace task filtering functions in execute.md
**Description:** Update `build_filtered_task_list` and similar functions
**Size:** Large
**Priority:** High
**Dependencies:** Task 2.1
**Can run parallel with:** None

**Technical Requirements:**

**Old pattern:**
```bash
build_filtered_task_list() {
  ALL_TASKS=$(stm list --tags "feature:$slug" -f json)
  FILTERED_TASKS=$(echo "$ALL_TASKS" | jq -r '...')
}
```

**New pattern:**
```markdown
Use TaskList() to get all tasks
Filter tasks where subject contains "[$slug]"
Further filter by status field as needed
```

**Old cross-reference:**
```bash
STM_DONE=$(stm list --tags "feature:$slug" --status done -f json | jq -r '.[].id')
```

**New cross-reference:**
```markdown
Use TaskList()
Filter tasks where subject contains "[$slug]" AND status is "completed"
Extract task IDs from results
```

**Implementation Steps:**
1. Find all task filtering functions
2. Replace STM list calls with TaskList
3. Convert jq filtering to prompt-based filtering instructions
4. Update cross-reference status check functions
5. Update session resume logic

**Acceptance Criteria:**
- [ ] No `stm list` commands in execute.md
- [ ] Filtering uses TaskList with subject contains `[slug]`
- [ ] Status filtering uses correct values
- [ ] Cross-reference functions work correctly

---

### Task 2.3: Replace stm show with TaskGet in execute.md
**Description:** Convert all `stm show` commands to TaskGet
**Size:** Medium
**Priority:** High
**Dependencies:** Task 2.2
**Can run parallel with:** None

**Technical Requirements:**

**Old pattern:**
```bash
TASK_INFO=$(stm show "$task_id" -f json)
TASK_TITLE=$(echo "$TASK_INFO" | jq -r '.title')
TASK_DETAILS=$(echo "$TASK_INFO" | jq -r '.details')
```

**New pattern:**
```markdown
Use TaskGet({ taskId: "$task_id" })
Extract subject and description from result
```

**Implementation Steps:**
1. Find all `stm show` patterns
2. Replace with TaskGet calls
3. Update field extraction:
   - `.title` → `subject`
   - `.details` → `description`
4. Update agent context building logic

**Acceptance Criteria:**
- [ ] No `stm show` commands in execute.md
- [ ] All task retrieval uses TaskGet
- [ ] Field names correctly mapped (title→subject, details→description)

---

### Task 2.4: Replace stm update in execute.md
**Description:** Convert all `stm update` commands to TaskUpdate
**Size:** Medium
**Priority:** High
**Dependencies:** Task 2.3
**Can run parallel with:** None

**Technical Requirements:**

Same mapping as Task 1.5:
- `--status done` → `status: "completed"`
- `--status in-progress` → `status: "in_progress"`

**Implementation Steps:**
1. Find all `stm update` patterns
2. Apply status value mapping
3. Convert to TaskUpdate format
4. Update progress tracking examples

**Acceptance Criteria:**
- [ ] No `stm update` commands in execute.md
- [ ] All updates use TaskUpdate format
- [ ] Status values correctly mapped

---

## Phase 3: Supporting Commands

### Task 3.1: Update feedback.md
**Description:** Remove STM checks and replace task creation
**Size:** Medium
**Priority:** Medium
**Dependencies:** Phase 2 complete
**Can run parallel with:** Task 3.2, Task 3.3

**Technical Requirements:**

**Changes needed:**
1. Remove `!claudekit status stm` check
2. Update incomplete tasks query:
   - Old: `stm list --tags "feature:<slug>" --status in-progress`
   - New: `TaskList()` filtered by subject contains `[<slug>]` AND status is "in_progress"
3. Replace deferred task creation:

**Old:**
```bash
stm add "<title>" \
  --details "<full-details>" \
  --tags "feature:<slug>,feedback,deferred,<priority>" \
  --status pending
```

**New:**
```markdown
TaskCreate({
  subject: "[<slug>] <title (max 80 chars)>",
  description: "## Feedback Type\ndeferred\n\n## Priority\n<priority>\n\n## Details\n<full description>",
  activeForm: "Creating deferred feedback task"
})
```

4. Update query command examples in output

**Implementation Steps:**
1. Remove availability check
2. Replace task listing with TaskList + filtering
3. Replace stm add with TaskCreate
4. Update output instructions for viewing tasks

**Acceptance Criteria:**
- [ ] No `stm` commands in feedback.md
- [ ] No `!claudekit status stm` check
- [ ] Deferred task creation uses TaskCreate
- [ ] Query instructions use TaskList/TaskGet

---

### Task 3.2: Update migrate.md
**Description:** Remove availability check and replace tag updates
**Size:** Small
**Priority:** Medium
**Dependencies:** Phase 2 complete
**Can run parallel with:** Task 3.1, Task 3.3

**Technical Requirements:**

**Changes needed:**
1. Remove `command -v stm` availability check
2. Replace tag update with subject update:

**Old:**
```bash
stm update <task-id> --add-tags "feature:<slug>"
```

**New:**
```markdown
# Get current task
TaskGet({ taskId: "<task-id>" })
# Update subject to include feature prefix
TaskUpdate({
  taskId: "<task-id>",
  subject: "[<slug>] " + <original-subject>
})
```

3. Update migration report text

**Implementation Steps:**
1. Remove availability check step
2. Replace stm update --add-tags with TaskGet + TaskUpdate
3. Update success message format

**Acceptance Criteria:**
- [ ] No `stm` commands in migrate.md
- [ ] No `command -v stm` check
- [ ] Tag updates use subject prefix via TaskUpdate

---

### Task 3.3: Update ideate-to-spec.md
**Description:** Replace STM reference in next steps output
**Size:** Small
**Priority:** Low
**Dependencies:** Phase 2 complete
**Can run parallel with:** Task 3.1, Task 3.2

**Technical Requirements:**

**Old:**
```markdown
5. [ ] {Track progress with: stm list --pretty --tag feature:{slug}}
```

**New:**
```markdown
5. [ ] {Track progress with: TaskList() filtered by "[{slug}]" in subject}
```

**Implementation Steps:**
1. Find the "Recommended Next Steps" section in Step 7
2. Replace the STM tracking command with TaskList instruction
3. Verify no other STM references exist

**Acceptance Criteria:**
- [ ] No `stm` references in ideate-to-spec.md
- [ ] Next steps reference TaskList for tracking

---

## Phase 4: Cleanup & Verification

### Task 4.1: Search and remove remaining STM references
**Description:** Comprehensive search and removal of all STM references
**Size:** Medium
**Priority:** High
**Dependencies:** Phase 3 complete
**Can run parallel with:** None

**Technical Requirements:**

Search patterns to find and remove:
| Pattern | Expected Locations |
|---------|-------------------|
| `stm ` (stm commands) | Should be zero after Phase 1-3 |
| `STM` (references) | Documentation, comments |
| `Simple Task Manager` | Documentation text |
| `claudekit status stm` | Availability checks |
| `TodoWrite` fallback | Removed in Phase 1-2 |
| `--tags` (STM syntax) | Task creation |

**Implementation Steps:**
1. Run grep for each pattern across `.claude/commands/`
2. Review and remove any remaining matches
3. Update any documentation that mentions STM
4. Verify CLAUDE.md doesn't need updates (spec says it doesn't reference STM)

**Acceptance Criteria:**
- [ ] Zero matches for `stm ` in .claude/commands/
- [ ] Zero matches for `STM` in .claude/commands/
- [ ] Zero matches for `Simple Task Manager`
- [ ] Zero matches for `claudekit status stm`
- [ ] Zero matches for TodoWrite fallback logic

---

### Task 4.2: Verify workflows function correctly
**Description:** Test all spec workflow commands end-to-end
**Size:** Large
**Priority:** High
**Dependencies:** Task 4.1
**Can run parallel with:** None

**Technical Requirements:**

Manual testing checklist:

| Test | Steps | Expected Result |
|------|-------|-----------------|
| Full decompose | Run `/spec:decompose` on a spec | Tasks created with subject prefixes, no errors |
| Incremental decompose | Run `/spec:decompose` on previously decomposed spec | Completed tasks preserved, new tasks added |
| Session resume | Run `/spec:execute`, interrupt, re-run | Resumes from previous progress |
| Deferred feedback | Run `/spec:feedback`, select "Defer" | Task created with correct subject and description |
| Spec migration | Run `/spec:migrate` | Tasks updated with feature prefix |

**Verification commands:**
```markdown
# List all tasks
TaskList()

# Get task details
TaskGet({ taskId: "..." })

# Update task status
TaskUpdate({ taskId: "...", status: "completed" })

# Create new task
TaskCreate({ subject: "[slug] [P1] Title", description: "..." })
```

**Implementation Steps:**
1. Test decompose workflow on a sample spec
2. Verify tasks are created with correct format
3. Test execute workflow with task state management
4. Test feedback workflow with deferred task creation
5. Document any issues found and fix

**Acceptance Criteria:**
- [ ] `/spec:decompose` creates tasks with `[slug] [P<phase>]` subjects
- [ ] `/spec:execute` correctly lists and updates tasks
- [ ] `/spec:feedback` creates deferred tasks correctly
- [ ] All workflows complete without STM-related errors
- [ ] Task filtering by subject prefix works correctly

---

## Dependency Graph

```
Phase 1 (Sequential):
  1.1 → 1.2 → 1.3 → 1.4 → 1.5 → 1.6

Phase 2 (Sequential, after Phase 1):
  2.1 → 2.2 → 2.3 → 2.4

Phase 3 (Parallel, after Phase 2):
  3.1 ─┬─ (can run in parallel)
  3.2 ─┤
  3.3 ─┘

Phase 4 (Sequential, after Phase 3):
  4.1 → 4.2
```

---

## Execution Strategy

### Critical Path
1. **Phase 1** is the critical path - decompose.md is the most complex
2. **Phase 2** builds on Phase 1 patterns
3. **Phase 3** tasks are simpler and can run in parallel
4. **Phase 4** is verification - must be last

### Parallel Opportunities
- Tasks 3.1, 3.2, 3.3 can run in parallel (different files)
- Within phases 1-2, tasks must be sequential (same file, dependent changes)

### Risk Areas
- **decompose.md complexity**: Largest file with most STM usage
- **Incremental mode**: Complex logic that may need careful testing
- **execute.md session resume**: State management complexity

### Recommended Order
1. Complete Phase 1 fully (decompose.md is foundational)
2. Complete Phase 2 (execute.md patterns mirror Phase 1)
3. Parallelize Phase 3 if possible
4. Run Phase 4 cleanup and verification last

---

## Summary

| Phase | Tasks | Complexity | Parallelizable |
|-------|-------|------------|----------------|
| Phase 1: decompose.md | 6 | High | No (sequential) |
| Phase 2: execute.md | 4 | High | No (sequential) |
| Phase 3: Supporting | 3 | Low-Medium | Yes |
| Phase 4: Cleanup | 2 | Medium | No (sequential) |
| **Total** | **15** | | |
