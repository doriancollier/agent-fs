# Task Breakdown: Autonomous Roadmap Execution System

Generated: 2026-02-01
Source: specs/autonomous-roadmap-execution/02-specification.md
Last Decompose: 2026-02-01

## Overview

Implement an autonomous roadmap execution system that enables Claude Code to intelligently select and work through roadmap items with minimal human intervention. The system uses the Ralph Wiggum loop pattern with human approval checkpoints between major phases.

**Key Components:**
1. Extended roadmap schema with `workflowState` property
2. `/roadmap:next` command for intelligent item selection
3. `/roadmap:work` command for full lifecycle orchestration
4. Stop hook for autonomous looping control
5. Self-correction mechanisms for test failures

---

## Phase 1: Foundation (Schema & Utilities)

### Task 1.1: Extend Roadmap Schema with workflowState Property

**File:** `roadmap/schema.json`

**Description:** Add a `workflowState` property to the roadmapItem definition that tracks the autonomous workflow phase, progress, and session state.

**Implementation:**

Add the following to the `roadmapItem.properties` object in `roadmap/schema.json`:

```json
"workflowState": {
  "type": "object",
  "description": "Tracks autonomous workflow execution state",
  "properties": {
    "phase": {
      "type": "string",
      "enum": ["not-started", "ideating", "specifying", "decomposing", "implementing", "testing", "committing", "releasing", "completed"],
      "description": "Current phase in the autonomous workflow"
    },
    "specSlug": {
      "type": "string",
      "description": "Slug of the associated spec directory (e.g., 'user-auth')"
    },
    "tasksTotal": {
      "type": "integer",
      "minimum": 0,
      "description": "Total tasks from decomposition"
    },
    "tasksCompleted": {
      "type": "integer",
      "minimum": 0,
      "description": "Number of tasks marked complete"
    },
    "lastSession": {
      "type": "string",
      "format": "date-time",
      "description": "ISO timestamp of last work session"
    },
    "attempts": {
      "type": "integer",
      "minimum": 0,
      "description": "Retry attempts for current phase (resets on phase advance)"
    },
    "blockers": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Current blocking issues requiring human intervention"
    }
  },
  "additionalProperties": false
}
```

**Acceptance Criteria:**
- Schema validates with new property
- Existing roadmap items remain valid (property is optional)
- Run `python3 .claude/skills/managing-roadmap-moscow/scripts/validate_roadmap.py` to confirm

---

### Task 1.2: Create update_workflow_state.py Utility Script

**File:** `roadmap/scripts/update_workflow_state.py`

**Description:** Python utility script to update the `workflowState` property of a roadmap item. Supports setting any workflow state field via command-line arguments.

**Implementation:**

```python
#!/usr/bin/env python3
"""Update workflowState for a roadmap item.

Usage:
    python3 roadmap/scripts/update_workflow_state.py <item-id> <key=value> [key=value ...]

Examples:
    # Set phase to implementing
    python3 roadmap/scripts/update_workflow_state.py abc123 phase=implementing

    # Set multiple fields
    python3 roadmap/scripts/update_workflow_state.py abc123 phase=testing attempts=0 tasksCompleted=5

    # Add blockers (JSON array)
    python3 roadmap/scripts/update_workflow_state.py abc123 'blockers=["Test failure in auth.test.ts"]'

    # Reset to not-started
    python3 roadmap/scripts/update_workflow_state.py abc123 phase=not-started attempts=0 blockers=[]
"""

import sys
import json
from datetime import datetime, timezone
from utils import load_roadmap, save_roadmap


def update_workflow_state(item_id: str, updates: dict) -> bool:
    """Update workflowState fields for a roadmap item.

    Args:
        item_id: The UUID of the roadmap item
        updates: Dictionary of workflowState fields to update

    Returns:
        True if item was found and updated, False otherwise
    """
    roadmap = load_roadmap()
    if roadmap is None:
        return False

    for item in roadmap['items']:
        if item['id'] == item_id:
            # Initialize workflowState if not present
            if 'workflowState' not in item:
                item['workflowState'] = {}

            # Apply updates
            item['workflowState'].update(updates)

            # Always update lastSession timestamp
            item['workflowState']['lastSession'] = datetime.now(timezone.utc).isoformat()

            # Update item's updatedAt
            item['updatedAt'] = datetime.now(timezone.utc).isoformat()

            # Update roadmap lastUpdated
            roadmap['lastUpdated'] = datetime.now(timezone.utc).isoformat()

            save_roadmap(roadmap)
            print(f"Updated workflowState for '{item['title']}' ({item_id})")
            print(f"  Current state: {json.dumps(item['workflowState'], indent=2)}")
            return True

    return False


def parse_value(value_str: str):
    """Parse a value string, attempting JSON decode for arrays/objects/numbers."""
    try:
        return json.loads(value_str)
    except json.JSONDecodeError:
        return value_str


if __name__ == '__main__':
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)

    item_id = sys.argv[1]
    updates = {}

    for arg in sys.argv[2:]:
        if '=' not in arg:
            print(f"Error: Invalid argument '{arg}'. Must be in key=value format.")
            sys.exit(1)

        key, value = arg.split('=', 1)
        updates[key] = parse_value(value)

    if update_workflow_state(item_id, updates):
        print("Success!")
    else:
        print(f"Error: Item not found: {item_id}")
        sys.exit(1)
```

**Acceptance Criteria:**
- Script can update any workflowState field
- Script auto-updates lastSession timestamp
- Script handles JSON values (arrays, objects, numbers)
- Script provides clear error messages for invalid input

---

### Task 1.3: Validate Schema Changes

**Description:** Run validation to confirm schema changes are correct and backward compatible with existing roadmap data.

**Steps:**
1. Run schema validation: `python3 .claude/skills/managing-roadmap-moscow/scripts/validate_roadmap.py`
2. Test update script with a test item
3. Verify existing roadmap items still validate

**Acceptance Criteria:**
- Schema validates successfully
- Existing roadmap items pass validation
- New workflowState property is optional (no breaking changes)

---

## Phase 2: Commands

### Task 2.1: Create /roadmap:next Command

**File:** `.claude/commands/roadmap/next.md`

**Description:** Create a command that intelligently selects the next roadmap item to work on based on MoSCoW priority, dependencies, time horizon, and health status.

**Implementation:**

```markdown
---
description: Intelligently select the next roadmap item to work on
argument-hint: "(no arguments)"
allowed-tools: Bash, Read
category: roadmap
---

# Roadmap Next

Analyze the roadmap and recommend the next item to work on based on priority algorithm.

## Selection Algorithm

1. **Filter eligible items:**
   - Status is `not-started` OR `on-hold` (if dependencies now met)
   - Exclude items with unmet dependencies (check `dependencies` array against completed items)

2. **Sort by priority:**
   - MoSCoW: must-have > should-have > could-have > wont-have
   - Time horizon: now > next > later
   - Health: at-risk/blocked items get priority within same MoSCoW (need attention)
   - Dependency impact: items that unblock others first (count how many items depend on each)

3. **Return top candidate with rationale**

## Implementation

1. Load and parse the roadmap:

```bash
cat roadmap/roadmap.json
```

2. Apply the selection algorithm to find the best next item.

3. Output the recommendation in this format:

```markdown
## Next Roadmap Item

**Selected:** {title}
**ID:** {uuid}
**Type:** {type} | **MoSCoW:** {moscow} | **Horizon:** {timeHorizon}
**Health:** {health} | **Effort:** {effort} points

### Rationale
{Explain why this item was selected over others}

### Dependencies
{List any dependencies and their status, or "None"}

### To start work:
\`\`\`
/roadmap:work {uuid}
\`\`\`
```

## Edge Cases

- **No eligible items:** Report "All items are completed, blocked, or have unmet dependencies"
- **All must-haves completed:** Celebrate and move to should-haves
- **Circular dependencies:** Report the cycle and suggest resolution

## Example Output

```markdown
## Next Roadmap Item

**Selected:** User Authentication Flow
**ID:** abc123-def456-...
**Type:** feature | **MoSCoW:** must-have | **Horizon:** now
**Health:** on-track | **Effort:** 8 points

### Rationale
This is the highest priority must-have item in the "now" horizon with no unmet dependencies.
Additionally, 3 other items depend on this being completed first.

### Dependencies
None

### To start work:
\`\`\`
/roadmap:work abc123-def456-...
\`\`\`
```
```

**Acceptance Criteria:**
- Command correctly identifies highest priority item
- Command respects dependency ordering
- Command handles edge cases (empty roadmap, all completed, circular deps)
- Output includes clear rationale and actionable command

---

### Task 2.2: Create /roadmap:work Command

**File:** `.claude/commands/roadmap/work.md`

**Description:** Create the main orchestrator command that executes the full development lifecycle for a roadmap item with human approval checkpoints.

**Implementation:**

```markdown
---
description: Orchestrate the full development lifecycle for a roadmap item
argument-hint: "<item-id>"
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, Task, TaskCreate, TaskUpdate, TaskList, TaskGet, Skill, AskUserQuestion
category: roadmap
---

# Roadmap Work

Orchestrate the complete development lifecycle for a roadmap item, from ideation through release.

## Arguments

- `$ARGUMENTS` - The UUID of the roadmap item to work on

## Workflow State Machine

```
not-started → ideating → specifying → decomposing → implementing → testing → committing → releasing → completed
```

### Phase Details

| Phase | Command | Human Approval | Auto-Retry |
|-------|---------|----------------|------------|
| ideating | `/ideate --roadmap-id <id>` | After completion | No |
| specifying | `/ideate-to-spec <path>` | After completion | No |
| decomposing | `/spec:decompose <path>` | No (automatic) | Yes |
| implementing | `/spec:execute <path>` | No (internal loops) | Yes |
| testing | `pnpm test` | On persistent failure | Yes (3x) |
| committing | `/git:commit` + `/git:push` | No | Yes |
| releasing | `/system:release` | Required | No |

## Implementation

### Step 1: Validate and Load Item

```bash
cat roadmap/roadmap.json
```

Find the item with ID matching `$ARGUMENTS`. If not found, exit with error.

### Step 2: Determine Current Phase

Check `item.workflowState.phase`:
- If not set or `not-started`, begin with `ideating`
- Otherwise, resume from current phase

### Step 3: Execute Phase

For each phase, follow this pattern:

1. **Update workflowState.phase** in roadmap.json:
   ```bash
   python3 roadmap/scripts/update_workflow_state.py <id> phase=<phase>
   ```

2. **Execute the phase command** (see Phase Details above)

3. **Handle failures:**
   - Increment `workflowState.attempts`
   - If attempts < 3: Retry with error context
   - If attempts >= 3: Add to `blockers`, pause for human

4. **On success:**
   - Reset attempts to 0
   - Check if human approval needed (ideating, specifying, releasing)
   - If approval needed: Present output and ask user to approve
   - If approved or no approval needed: Advance to next phase

5. **Output completion signal:**
   ```
   <promise>PHASE_COMPLETE:<phase></promise>
   ```

### Step 4: Human Approval Checkpoints

After `ideating` phase:
```markdown
## Ideation Complete

The ideation document has been created at `specs/<slug>/01-ideation.md`.

**Please review the ideation and approve to proceed to specification.**

- Approve: Type "approve" or "yes" to continue to specification phase
- Revise: Provide feedback and I'll update the ideation
- Abort: Type "abort" to stop work on this item
```

After `specifying` phase:
```markdown
## Specification Complete

The specification has been created at `specs/<slug>/02-specification.md`.

**Please review the specification and approve to proceed to implementation.**

- Approve: Type "approve" or "yes" to continue to decompose and implement
- Revise: Provide feedback and I'll update the specification
- Abort: Type "abort" to stop work on this item
```

Before `releasing` phase:
```markdown
## Implementation Complete

All tasks have been completed and tests are passing.

**Would you like to create a release?**

- Release: Type "release" to run `/system:release`
- Skip: Type "skip" to mark as completed without a release
- Abort: Type "abort" to pause (changes are committed but not released)
```

### Step 5: Completion

When all phases complete:
1. Update status to `completed`:
   ```bash
   python3 roadmap/scripts/update_status.py <id> completed
   python3 roadmap/scripts/update_workflow_state.py <id> phase=completed
   ```

2. Output final summary:
   ```markdown
   ## Work Complete

   **Item:** {title}
   **Phases Completed:** ideating → specifying → decomposing → implementing → testing → committing → completed
   **Spec:** specs/{slug}/
   **Released:** Yes/No

   Run `/roadmap:next` to see the next recommended item.
   ```

## Self-Correction During Testing Phase

After `/spec:execute` completes, run the test suite:

```bash
pnpm test
```

If tests fail:
1. Analyze the test output to identify failures
2. Attempt to fix the failing tests (up to 3 attempts)
3. Re-run tests after each fix attempt
4. If still failing after 3 attempts:
   - Document failures in `workflowState.blockers`
   - Pause for human intervention
   - Output `<promise>ABORT</promise>`

## Error Handling

| Error | Action |
|-------|--------|
| Item not found | Exit with "Item not found: {id}" |
| Phase command fails | Increment attempts, retry with context |
| Max attempts exceeded | Document blockers, pause for human |
| Git push fails | Pause for human, provide recovery commands |
| User types "abort" | Output `<promise>ABORT</promise>`, stop work |

## Resumability

If interrupted, the workflow can be resumed:
1. Run `/roadmap:work <id>` again
2. The command checks `workflowState.phase` and resumes from there
3. All progress is persisted in roadmap.json

## Cost Controls

| Setting | Value |
|---------|-------|
| Max retry attempts per phase | 3 |
| Max total iterations | 100 |
```

**Acceptance Criteria:**
- Command walks through all phases correctly
- Human approval required at specified checkpoints
- State persists to roadmap.json after each phase transition
- Can resume from any phase if interrupted
- Self-correction works for test failures
- Outputs proper completion/abort promises for hook integration

---

## Phase 3: Stop Hook Integration

### Task 3.1: Create autonomous-check.mjs Stop Hook

**File:** `.claude/scripts/hooks/autonomous-check.mjs`

**Description:** Create a Stop hook that prevents Claude from stopping during active autonomous work unless a phase completion or abort signal is detected.

**Implementation:**

```javascript
#!/usr/bin/env node

/**
 * Stop Hook for Autonomous Roadmap Execution
 *
 * This hook implements the Ralph Wiggum loop pattern by preventing
 * Claude from stopping when there's active work in progress.
 *
 * Exit codes:
 * - 0: Allow stop (phase complete, abort signal, or no active work)
 * - 2: Block stop (work in progress, not yet complete)
 *
 * Completion signals:
 * - <promise>PHASE_COMPLETE:<phase></promise> - Phase finished successfully
 * - <promise>ABORT</promise> - User requested abort
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const ROADMAP_PATH = join(process.cwd(), 'roadmap/roadmap.json');

/**
 * Read Claude's output from stdin
 */
async function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', (chunk) => {
      data += chunk;
    });

    process.stdin.on('end', () => {
      resolve(data);
    });
  });
}

/**
 * Check if roadmap has any item with active workflow
 */
function getActiveWorkItem(roadmap) {
  const activePhases = ['ideating', 'specifying', 'decomposing', 'implementing', 'testing', 'committing', 'releasing'];

  return roadmap.items.find(item =>
    item.workflowState?.phase &&
    activePhases.includes(item.workflowState.phase)
  );
}

async function main() {
  const output = await readStdin();

  // Check for explicit completion signal
  if (output.includes('<promise>PHASE_COMPLETE:')) {
    const match = output.match(/<promise>PHASE_COMPLETE:(\w+)<\/promise>/);
    if (match) {
      console.error(`[autonomous-check] Phase complete: ${match[1]}`);
    }
    process.exit(0); // Allow stop
  }

  // Check for explicit abort signal
  if (output.includes('<promise>ABORT</promise>')) {
    console.error('[autonomous-check] Abort signal received');
    process.exit(0); // Allow stop
  }

  // Check roadmap for active work
  try {
    const roadmapContent = readFileSync(ROADMAP_PATH, 'utf8');
    const roadmap = JSON.parse(roadmapContent);

    const activeItem = getActiveWorkItem(roadmap);

    if (activeItem) {
      console.error('');
      console.error('┌─────────────────────────────────────────────────────────────┐');
      console.error('│  AUTONOMOUS WORK IN PROGRESS                                │');
      console.error('├─────────────────────────────────────────────────────────────┤');
      console.error(`│  Item: ${activeItem.title.substring(0, 50).padEnd(50)} │`);
      console.error(`│  Phase: ${activeItem.workflowState.phase.padEnd(49)} │`);
      console.error('├─────────────────────────────────────────────────────────────┤');
      console.error('│  To stop: Output <promise>ABORT</promise>                   │');
      console.error('│  Or complete the current phase                              │');
      console.error('└─────────────────────────────────────────────────────────────┘');
      console.error('');
      process.exit(2); // Block stop
    }
  } catch (e) {
    // If roadmap unreadable, allow stop (fail open)
    console.error(`[autonomous-check] Warning: Could not read roadmap: ${e.message}`);
    process.exit(0);
  }

  // No active work, allow stop
  process.exit(0);
}

main();
```

**Acceptance Criteria:**
- Hook blocks stop when work is in progress (active phase)
- Hook allows stop on PHASE_COMPLETE signal
- Hook allows stop on ABORT signal
- Hook fails gracefully (allows stop) if roadmap unreadable
- Clear console output explains what's happening

---

### Task 3.2: Update hooks-config.json for Stop Hook

**File:** `.claude/hooks-config.json`

**Description:** Add the autonomous-check hook to the Stop hook configuration.

**Implementation:**

Update `.claude/hooks-config.json` to include the Stop hook. The current file contains:
```json
{
  "thinking-level": {
    "level": 2
  },
  "create-checkpoint": {
    "prefix": "claude",
    "maxCheckpoints": 10
  }
}
```

Add the hooks section:
```json
{
  "thinking-level": {
    "level": 2
  },
  "create-checkpoint": {
    "prefix": "claude",
    "maxCheckpoints": 10
  },
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/scripts/hooks/autonomous-check.mjs"
          }
        ]
      }
    ]
  }
}
```

**Acceptance Criteria:**
- Hooks configuration is valid JSON
- Stop hook is registered with empty matcher (matches all)
- Existing configuration preserved

---

### Task 3.3: Test Stop Hook Integration

**Description:** Test the stop hook with various scenarios to ensure it works correctly.

**Test Scenarios:**

1. **No active work:** Should allow stop immediately
2. **Active work without completion signal:** Should block stop
3. **Active work with PHASE_COMPLETE signal:** Should allow stop
4. **Active work with ABORT signal:** Should allow stop
5. **Unreadable roadmap:** Should allow stop (fail gracefully)

**Test Steps:**

1. Create a test item with active workflowState:
   ```bash
   # Manually set an item to "implementing" phase for testing
   python3 roadmap/scripts/update_workflow_state.py <test-id> phase=implementing
   ```

2. Test blocking behavior:
   ```bash
   echo '{"output": "some work in progress"}' | node .claude/scripts/hooks/autonomous-check.mjs
   echo "Exit code: $?"  # Should be 2
   ```

3. Test PHASE_COMPLETE:
   ```bash
   echo '{"output": "<promise>PHASE_COMPLETE:implementing</promise>"}' | node .claude/scripts/hooks/autonomous-check.mjs
   echo "Exit code: $?"  # Should be 0
   ```

4. Test ABORT:
   ```bash
   echo '{"output": "<promise>ABORT</promise>"}' | node .claude/scripts/hooks/autonomous-check.mjs
   echo "Exit code: $?"  # Should be 0
   ```

5. Reset test item:
   ```bash
   python3 roadmap/scripts/update_workflow_state.py <test-id> phase=not-started
   ```

**Acceptance Criteria:**
- All test scenarios pass with expected exit codes
- Hook integrates correctly with Claude Code

---

## Phase 4: Self-Correction & Bug Discovery

### Task 4.1: Add Test Feedback Loop to /roadmap:work

**Description:** Enhance the testing phase in `/roadmap:work` to include automatic retry and self-correction logic.

This task involves updating the `/roadmap:work` command created in Task 2.2 to include detailed test feedback loop logic:

**Add to the Testing Phase section:**

```markdown
### Testing Phase Details

After `/spec:execute` completes, run the test feedback loop:

1. **Run test suite:**
   ```bash
   pnpm test 2>&1 | tee .temp/test-output.txt
   TEST_EXIT_CODE=${PIPESTATUS[0]}
   ```

2. **Check results:**
   - If `TEST_EXIT_CODE == 0`: Tests pass, proceed to committing phase
   - If `TEST_EXIT_CODE != 0`: Enter self-correction loop

3. **Self-correction loop (max 3 attempts):**

   For each attempt:
   a. Parse test output to identify failures:
      - Look for "FAIL" lines
      - Extract file paths and test names
      - Capture error messages and stack traces

   b. Analyze failure and attempt fix:
      - Read the failing test file
      - Read the source file being tested
      - Identify the issue (implementation bug vs test bug)
      - Make targeted fix

   c. Re-run tests:
      ```bash
      pnpm test
      ```

   d. If fixed: Exit loop, proceed to committing

   e. If still failing after 3 attempts:
      - Update workflowState:
        ```bash
        python3 roadmap/scripts/update_workflow_state.py <id> \
          'blockers=["Test failures after 3 correction attempts"]' \
          attempts=3
        ```
      - Output:
        ```markdown
        ## Self-Correction Failed

        Tests are still failing after 3 correction attempts.

        **Failing tests:**
        - {list of failing tests}

        **Last error:**
        {error message}

        Please review and fix manually, then run `/roadmap:work <id>` to resume.
        ```
      - Output: `<promise>ABORT</promise>`
```

**Acceptance Criteria:**
- Tests are run after implementation phase
- Failures trigger automatic fix attempts
- Max 3 retry attempts before pausing for human
- Blockers documented in workflowState

---

### Task 4.2: Implement Bug Discovery Protocol

**Description:** When a bug is discovered during testing that is too complex to fix inline, add it to the roadmap as a new item.

**Add to the Testing Phase section in `/roadmap:work`:**

```markdown
### Bug Discovery Protocol

When a bug is discovered during testing:

1. **Estimate complexity:**
   - **Trivial** (< 5 min): Fix inline, continue
   - **Small** (< 30 min): Fix inline, continue
   - **Medium** (< 2 hours): Consider adding to roadmap
   - **Large** (> 2 hours): Must add to roadmap

2. **For medium/large bugs:**

   a. Create new roadmap item:
   ```bash
   # Use /roadmap:add to create the bug item
   /roadmap:add "Bug: {description}"
   ```

   Set properties:
   - `type`: "bugfix"
   - `moscow`: "must-have"
   - `timeHorizon`: "now"
   - `health`: "at-risk"

   b. If bug blocks current work:
   - Add current item's ID to the bug's blockers
   - Add bug's ID to current item's dependencies
   - Pause current work with explanation

   c. If bug doesn't block (workaround possible):
   - Continue current work with workaround
   - Note the workaround in implementation notes

3. **Output for discovered bugs:**
   ```markdown
   ## Bug Discovered

   **Title:** {bug description}
   **Estimated Complexity:** {trivial/small/medium/large}
   **Blocking:** {yes/no}

   {If blocking}
   This bug blocks further progress. A new roadmap item has been created.
   Please fix the bug first, then resume with `/roadmap:work <original-id>`.

   {If not blocking}
   A workaround has been applied. The bug has been added to the roadmap for later.
   ```
```

**Acceptance Criteria:**
- Bug complexity is estimated
- Medium/large bugs are added to roadmap
- Blocking bugs pause current work correctly
- Non-blocking bugs get documented for later

---

## Phase 5: Testing & Documentation

### Task 5.1: Create Manual Test Checklist

**File:** `specs/autonomous-roadmap-execution/test-checklist.md`

**Description:** Create a comprehensive test checklist for manual testing of the autonomous system.

**Content:**

```markdown
# Autonomous Roadmap Execution - Test Checklist

## Schema Tests

- [ ] Schema validates with workflowState property
- [ ] Existing roadmap items still validate
- [ ] Can add workflowState to existing item
- [ ] All workflowState enum values are valid

## /roadmap:next Tests

- [ ] Selects highest priority must-have item
- [ ] Respects dependency ordering
- [ ] Handles empty roadmap gracefully
- [ ] Handles all-completed roadmap gracefully
- [ ] Reports circular dependencies
- [ ] Skips on-hold items with unmet dependencies
- [ ] Includes items that unblock others

## /roadmap:work Tests

### Phase Transitions
- [ ] Transitions from not-started to ideating
- [ ] Transitions from ideating to specifying (with approval)
- [ ] Transitions from specifying to decomposing (with approval)
- [ ] Transitions from decomposing to implementing (automatic)
- [ ] Transitions from implementing to testing
- [ ] Transitions from testing to committing (on pass)
- [ ] Transitions from committing to releasing
- [ ] Transitions from releasing to completed

### Human Approval
- [ ] Approval prompt appears after ideating
- [ ] Approval prompt appears after specifying
- [ ] Release decision prompt appears before releasing
- [ ] "abort" stops work correctly
- [ ] "revise" triggers update flow

### Self-Correction
- [ ] Failing tests trigger fix attempts
- [ ] Fix attempts limited to 3
- [ ] Blockers documented after max attempts
- [ ] ABORT signal sent after max attempts

### Resumability
- [ ] Can resume from ideating phase
- [ ] Can resume from specifying phase
- [ ] Can resume from implementing phase
- [ ] Can resume from testing phase
- [ ] State correctly persisted across sessions

## Stop Hook Tests

- [ ] Blocks stop during active work
- [ ] Allows stop on PHASE_COMPLETE
- [ ] Allows stop on ABORT
- [ ] Fails gracefully on unreadable roadmap
- [ ] Clear console output when blocking

## Integration Tests

- [ ] Full workflow: not-started → completed
- [ ] Workflow with test failure and self-correction
- [ ] Workflow with bug discovery (blocking)
- [ ] Workflow with bug discovery (non-blocking)
- [ ] Workflow resume after interruption
```

**Acceptance Criteria:**
- Checklist covers all major functionality
- Clear pass/fail criteria for each test
- Tests can be executed manually

---

### Task 5.2: Update CLAUDE.md with New Commands

**File:** `CLAUDE.md`

**Description:** Add documentation for the new `/roadmap:next` and `/roadmap:work` commands to the project CLAUDE.md file.

**Add to the Commands section under Roadmap:**

```markdown
| `/roadmap:next` | Intelligently select next roadmap item to work on |
| `/roadmap:work <id>` | Orchestrate full development lifecycle for an item |
```

**Add new section for Autonomous Workflow:**

```markdown
## Autonomous Roadmap Execution

The roadmap system supports autonomous execution of development workflows with human oversight at key checkpoints.

### Commands

| Command | Purpose |
|---------|---------|
| `/roadmap:next` | Analyze roadmap and recommend next item based on priority algorithm |
| `/roadmap:work <id>` | Execute full development lifecycle for a roadmap item |

### Workflow Phases

```
not-started → ideating → specifying → decomposing → implementing → testing → committing → releasing → completed
```

| Phase | Human Approval | Description |
|-------|----------------|-------------|
| ideating | After | Creates ideation document via `/ideate` |
| specifying | After | Transforms to spec via `/ideate-to-spec` |
| decomposing | No | Breaks down via `/spec:decompose` |
| implementing | No | Executes via `/spec:execute` |
| testing | On failure | Runs `pnpm test` with auto-retry |
| committing | No | Commits and pushes via `/git:commit` + `/git:push` |
| releasing | Required | Optional release via `/system:release` |

### State Tracking

Workflow state is persisted in `roadmap.json` under each item's `workflowState` property:
- `phase`: Current workflow phase
- `specSlug`: Linked spec directory
- `tasksTotal`/`tasksCompleted`: Progress tracking
- `lastSession`: ISO timestamp of last work
- `attempts`: Retry count for current phase
- `blockers`: Issues requiring human intervention

### Resumability

If interrupted, run `/roadmap:work <id>` again to resume from the current phase.

### Self-Correction

During the testing phase, failing tests trigger automatic fix attempts (max 3). If still failing, work pauses for human intervention.
```

**Acceptance Criteria:**
- Commands documented in Commands section
- New Autonomous Workflow section added
- All phases and their approval requirements documented

---

### Task 5.3: Update Developer Guide Index

**File:** `developer-guides/INDEX.md`

**Description:** Add entries for the autonomous roadmap execution system to the developer guides index.

**Add to the appropriate section:**

```markdown
| Autonomous Roadmap Execution | `02-specification.md` | `/roadmap:work`, workflowState | 2026-02-01 |
```

**Acceptance Criteria:**
- Index updated with new coverage area
- Last-reviewed date set to implementation date

---

## Dependency Graph

```
P1: Task 1.1 (Schema)
    ↓
P1: Task 1.2 (update_workflow_state.py) ─────────┐
    ↓                                            │
P1: Task 1.3 (Validation) ←──────────────────────┘
    ↓
P2: Task 2.1 (/roadmap:next) ─────┐
                                  ├─→ P3: Task 3.1 (Stop Hook)
P2: Task 2.2 (/roadmap:work) ─────┘       ↓
                                     P3: Task 3.2 (hooks-config)
                                          ↓
                                     P3: Task 3.3 (Test Hook)
                                          ↓
                                     P4: Task 4.1 (Test Loop)
                                          ↓
                                     P4: Task 4.2 (Bug Discovery)
                                          ↓
                                     P5: Task 5.1 (Test Checklist)
                                          ↓
                                     P5: Task 5.2 (CLAUDE.md)
                                          ↓
                                     P5: Task 5.3 (Index)
```

## Parallel Execution Opportunities

- **Phase 1 Tasks:** 1.1 and 1.2 can run in parallel, then 1.3 after both
- **Phase 2 Tasks:** 2.1 and 2.2 can run in parallel
- **Phase 3-5:** Sequential due to dependencies

## Summary

| Phase | Tasks | Dependencies |
|-------|-------|--------------|
| Phase 1: Foundation | 3 | None |
| Phase 2: Commands | 2 | Phase 1 |
| Phase 3: Stop Hook | 3 | Phase 2 |
| Phase 4: Self-Correction | 2 | Phase 3 |
| Phase 5: Documentation | 3 | Phase 4 |

**Total Tasks:** 13
