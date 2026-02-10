---
slug: autonomous-roadmap-execution
---

# Specification: Autonomous Roadmap Execution System

## Overview

Implement a system that enables Claude Code to autonomously work through roadmap items by intelligently selecting the next task, executing the full development lifecycle, self-correcting when issues arise, and tracking progress throughout. The system uses the Ralph Wiggum loop pattern with human approval checkpoints between major phases.

### Goals

1. **Intelligent Selection**: Automatically choose the next roadmap item based on MoSCoW priority, dependencies, time horizon, and health
2. **Automated Execution**: Chain existing commands (`/ideate` → `/ideate-to-spec` → `/spec:decompose` → `/spec:execute` → tests → `/git:commit` → `/git:push` → `/system:release`) with minimal human intervention
3. **Self-Correction**: Automatically retry failing tests, fix lint/type errors, and handle recoverable failures
4. **State Persistence**: Track workflow progress in roadmap items, enabling session recovery and visibility
5. **Human Oversight**: Require approval between major phases while allowing autonomy within phases

### Non-Goals (Out of Scope)

- Full autonomy without any human checkpoints
- Multi-codebase orchestration
- Cloud-based continuous execution
- Real-time monitoring dashboards
- Cost tracking per roadmap item (deferred to future enhancement)

---

## Technical Design

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Interaction                          │
│   /roadmap:next → /roadmap:work <id> → Human checkpoints        │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                    Orchestrator Layer                            │
│   .claude/commands/roadmap/next.md                              │
│   .claude/commands/roadmap/work.md                              │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                    Ralph Loop Layer                              │
│   Stop Hook: .claude/scripts/hooks/autonomous-check.mjs         │
│   Completion: <promise>PHASE_COMPLETE</promise>                 │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                    Existing Commands                             │
│   /ideate → /ideate-to-spec → /spec:decompose → /spec:execute  │
│   /debug:test → /git:commit → /git:push → /system:release      │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                    State Management                              │
│   roadmap.json: workflowState { phase, progress, attempts }     │
│   specs/{slug}/04-implementation.md: session state              │
└─────────────────────────────────────────────────────────────────┘
```

### Component 1: `/roadmap:next` Command

**Purpose:** Intelligently select the next roadmap item to work on.

**File:** `.claude/commands/roadmap/next.md`

**Selection Algorithm:**
1. Filter to `status: not-started` OR `status: on-hold` (if unblocked)
2. Exclude items with unmet dependencies (check `dependencies` array against completed items)
3. Sort by:
   - MoSCoW priority (must-have > should-have > could-have > wont-have)
   - Time horizon (now > next > later)
   - Health (at-risk/blocked items get priority within same MoSCoW)
   - Dependency impact (items that unblock others first)
4. Return top candidate with rationale

**Output Format:**
```markdown
## Next Roadmap Item

**Selected:** {title}
**ID:** {uuid}
**Rationale:** {why this item was selected}

**To start work:**
```
/roadmap:work {uuid}
```
```

### Component 2: `/roadmap:work <id>` Command

**Purpose:** Orchestrate the full development lifecycle for a roadmap item.

**File:** `.claude/commands/roadmap/work.md`

**Workflow State Machine:**
```
┌─────────────┐
│ not-started │
└──────┬──────┘
       │ /roadmap:work triggers
       ▼
┌──────────────┐
│  ideating    │ ← /ideate --roadmap-id <id>
└──────┬───────┘
       │ Human approval
       ▼
┌──────────────┐
│  specifying  │ ← /ideate-to-spec
└──────┬───────┘
       │ Human approval
       ▼
┌──────────────┐
│ decomposing  │ ← /spec:decompose
└──────┬───────┘
       │ Automatic
       ▼
┌──────────────┐
│ implementing │ ← /spec:execute (Ralph loop within)
└──────┬───────┘
       │ All tasks complete
       ▼
┌──────────────┐
│   testing    │ ← pnpm test + /debug:browser
└──────┬───────┘
       │ Tests pass (self-correct if not)
       ▼
┌──────────────┐
│  committing  │ ← /git:commit + /git:push
└──────┬───────┘
       │ Pushed
       ▼
┌──────────────┐
│  releasing   │ ← Human decides if release warranted
└──────┬───────┘
       │ Optional: /system:release
       ▼
┌──────────────┐
│  completed   │
└──────────────┘
```

**Phase Execution Pattern:**
```markdown
For each phase:
1. Update workflowState.phase in roadmap.json
2. Execute phase command
3. If command fails:
   - Increment workflowState.attempts
   - If attempts < maxAttempts: retry with error context
   - If attempts >= maxAttempts: pause for human intervention
4. On success:
   - Reset attempts to 0
   - Human approval checkpoint (if required for phase)
   - Proceed to next phase
5. Output <promise>PHASE_COMPLETE:{phase}</promise> when done
```

### Component 3: Extended Roadmap Schema

**Changes to `roadmap/schema.json`:**

Add `workflowState` property to items:

```json
{
  "workflowState": {
    "type": "object",
    "properties": {
      "phase": {
        "type": "string",
        "enum": ["not-started", "ideating", "specifying", "decomposing", "implementing", "testing", "committing", "releasing", "completed"]
      },
      "specSlug": {
        "type": "string",
        "description": "Slug of the associated spec directory"
      },
      "tasksTotal": {
        "type": "integer",
        "description": "Total tasks from decomposition"
      },
      "tasksCompleted": {
        "type": "integer",
        "description": "Tasks marked complete"
      },
      "lastSession": {
        "type": "string",
        "format": "date-time",
        "description": "ISO timestamp of last work session"
      },
      "attempts": {
        "type": "integer",
        "description": "Retry attempts for current phase"
      },
      "blockers": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Current blocking issues"
      }
    }
  }
}
```

### Component 4: Stop Hook for Autonomous Looping

**File:** `.claude/scripts/hooks/autonomous-check.mjs`

**Purpose:** Prevent Claude from stopping until phase completion criteria are met.

```javascript
#!/usr/bin/env node

/**
 * Stop Hook for Autonomous Roadmap Execution
 *
 * Exit codes:
 * - 0: Allow stop (phase complete or no active work)
 * - 2: Block stop (work in progress, not complete)
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const ROADMAP_PATH = join(process.cwd(), 'roadmap/roadmap.json');

function main() {
  // Read Claude's output from stdin
  let output = '';
  process.stdin.setEncoding('utf8');

  process.stdin.on('data', (chunk) => {
    output += chunk;
  });

  process.stdin.on('end', () => {
    // Check for completion promise
    if (output.includes('<promise>PHASE_COMPLETE:')) {
      process.exit(0); // Allow stop
    }

    // Check for explicit abort
    if (output.includes('<promise>ABORT</promise>')) {
      process.exit(0); // Allow stop
    }

    // Check roadmap for active work
    try {
      const roadmap = JSON.parse(readFileSync(ROADMAP_PATH, 'utf8'));
      const activeItem = roadmap.items.find(
        item => item.workflowState?.phase &&
                !['not-started', 'completed'].includes(item.workflowState.phase)
      );

      if (activeItem) {
        console.error(`[autonomous-check] Work in progress: ${activeItem.title}`);
        console.error(`[autonomous-check] Phase: ${activeItem.workflowState.phase}`);
        console.error(`[autonomous-check] Complete the phase or output <promise>ABORT</promise> to stop`);
        process.exit(2); // Block stop
      }
    } catch (e) {
      // If roadmap unreadable, allow stop
      console.error(`[autonomous-check] Warning: Could not read roadmap: ${e.message}`);
    }

    process.exit(0); // Allow stop
  });
}

main();
```

### Component 5: Self-Correction Mechanisms

**Test-Driven Feedback Loop:**

```markdown
After /spec:execute completes:

1. Run test suite:
   ```bash
   pnpm test
   ```

2. Parse test output for failures

3. If failures detected:
   a. Create temporary fix tasks (not added to roadmap)
   b. Attempt fix using test error context
   c. Re-run tests
   d. Loop until pass OR max attempts (3) reached

4. If max attempts reached:
   a. Document failures in workflowState.blockers
   b. Pause for human intervention
   c. Output <promise>ABORT</promise>
```

**Bug Discovery Protocol:**

When bug found during testing:
1. Estimate complexity: trivial (< 5 min), small (< 30 min), medium (< 2 hours), large (> 2 hours)
2. If trivial/small: Fix inline during current work
3. If medium/large:
   - Add to roadmap with `type: "bugfix"`, `moscow: "must-have"`, `timeHorizon: "now"`
   - Link as dependency if blocking current work
   - Continue with workaround if possible

### Component 6: Python Utility Scripts

**File:** `roadmap/scripts/update_workflow_state.py`

```python
#!/usr/bin/env python3
"""Update workflowState for a roadmap item."""

import sys
import json
from datetime import datetime, timezone
from utils import load_roadmap, save_roadmap

def update_workflow_state(item_id: str, updates: dict) -> bool:
    roadmap = load_roadmap()

    for item in roadmap['items']:
        if item['id'] == item_id:
            if 'workflowState' not in item:
                item['workflowState'] = {}

            item['workflowState'].update(updates)
            item['workflowState']['lastSession'] = datetime.now(timezone.utc).isoformat()
            item['updatedAt'] = datetime.now(timezone.utc).isoformat()

            save_roadmap(roadmap)
            return True

    return False

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: update_workflow_state.py <item-id> <key=value> [key=value ...]")
        sys.exit(1)

    item_id = sys.argv[1]
    updates = {}
    for arg in sys.argv[2:]:
        key, value = arg.split('=', 1)
        # Parse JSON values
        try:
            updates[key] = json.loads(value)
        except json.JSONDecodeError:
            updates[key] = value

    if update_workflow_state(item_id, updates):
        print(f"Updated workflowState for {item_id}")
    else:
        print(f"Item not found: {item_id}")
        sys.exit(1)
```

---

## Implementation Phases

### Phase 1: Schema & Utilities (Foundation)

**Tasks:**
1. Update `roadmap/schema.json` to include `workflowState` property
2. Create `roadmap/scripts/update_workflow_state.py` utility
3. Update `roadmap/scripts/utils.py` if needed for new schema
4. Run validation to ensure schema changes are correct

**Acceptance Criteria:**
- Schema validates with new `workflowState` property
- Utility script can update workflow state for any item
- Existing roadmap items remain valid (backward compatible)

### Phase 2: `/roadmap:next` Command

**Tasks:**
1. Create `.claude/commands/roadmap/next.md` command file
2. Implement selection algorithm with all criteria
3. Test with various roadmap states (empty, all completed, dependencies)

**Acceptance Criteria:**
- Command returns sensible next item based on priority algorithm
- Handles edge cases (no eligible items, circular dependencies)
- Output includes clear rationale and actionable command

### Phase 3: `/roadmap:work` Command (Core)

**Tasks:**
1. Create `.claude/commands/roadmap/work.md` command file
2. Implement phase state machine
3. Add human approval checkpoints between phases
4. Integrate with existing commands (/ideate, /ideate-to-spec, etc.)
5. Update roadmap status as work progresses

**Acceptance Criteria:**
- Command walks through all phases from ideating to completed
- Human approval required between ideating→specifying, specifying→decomposing, testing→releasing
- State persists to roadmap.json after each phase
- Can resume from any phase if interrupted

### Phase 4: Stop Hook Integration

**Tasks:**
1. Create `.claude/scripts/hooks/autonomous-check.mjs`
2. Update `.claude/hooks-config.json` to include Stop hook
3. Test hook with various scenarios (complete, incomplete, error)

**Acceptance Criteria:**
- Hook blocks stop when work is in progress
- Hook allows stop when phase complete (PHASE_COMPLETE promise)
- Hook allows stop when explicitly aborted (ABORT promise)
- Hook fails gracefully if roadmap unreadable

### Phase 5: Self-Correction & Bug Discovery

**Tasks:**
1. Add test-driven feedback loop to `/roadmap:work` after implementing phase
2. Implement bug complexity estimation logic
3. Add bug creation flow for medium/large bugs
4. Test self-correction with intentionally failing tests

**Acceptance Criteria:**
- Automatically retries failing tests up to 3 times
- Documents blockers when max attempts reached
- Creates roadmap items for significant bugs discovered
- Links bug items as dependencies when blocking

---

## Configuration

### Hooks Configuration

Add to `.claude/hooks-config.json`:

```json
{
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

### Cost Controls

| Setting | Value | Configurable |
|---------|-------|--------------|
| Max iterations per phase | 20 | Yes (in command) |
| Max total iterations | 100 | Yes (in command) |
| Max retry attempts | 3 | Yes (in command) |
| Alert threshold | Manual review prompt | N/A |

---

## Testing Strategy

### Unit Tests

1. **Selection Algorithm:**
   - Test priority ordering (MoSCoW, time horizon, health)
   - Test dependency filtering
   - Test empty roadmap handling

2. **State Transitions:**
   - Test each phase transition
   - Test backward transitions on failure
   - Test resume from each phase

### Integration Tests

1. **End-to-End Workflow:**
   - Create test roadmap item
   - Run `/roadmap:work` through all phases
   - Verify final state and artifacts

2. **Self-Correction:**
   - Introduce test failures
   - Verify retry behavior
   - Verify bug discovery and creation

### Manual Testing

1. **Human Checkpoint Flow:**
   - Verify approval prompts appear at correct points
   - Verify work pauses until approval given
   - Verify rejection handling

---

## Error Handling

| Error | Handling |
|-------|----------|
| Roadmap file unreadable | Exit with clear error message |
| Item not found | Exit with "Item not found: {id}" |
| Phase command fails | Increment attempts, retry with context |
| Max attempts exceeded | Document blockers, pause for human |
| Dependency not complete | Skip item in selection, explain why |
| Git push fails | Pause for human, provide recovery commands |

---

## Future Enhancements (Deferred)

1. **Full Autonomy Mode (Option C):** Human approval only for releases
2. **Cost Tracking:** Track tokens/cost per roadmap item in `workflowState.metrics`
3. **Performance Regression Detection:** Integrate `/debug:performance` before release
4. **Documentation Updates:** Auto-run `/docs:reconcile` after implementation
5. **Concurrent Items:** Queue system for multiple items in parallel
6. **Learning from Patterns:** Auto-add recurring issues to developer guides

---

## Dependencies

### Existing Commands Required

| Command | Purpose |
|---------|---------|
| `/ideate` | Generate ideation document |
| `/ideate-to-spec` | Transform ideation to spec |
| `/spec:decompose` | Break spec into tasks |
| `/spec:execute` | Implement tasks |
| `/git:commit` | Stage and commit changes |
| `/git:push` | Push to remote |
| `/system:release` | Create release |

### Existing Infrastructure

| Component | Purpose |
|-----------|---------|
| Task tools | Track implementation progress |
| Background agents | Parallel execution |
| Hooks system | Autonomous looping |
| roadmap.json | State persistence |

---

## Rollback Plan

If the autonomous system causes issues:

1. **Disable Stop Hook:** Remove or comment out the Stop hook in `.claude/hooks-config.json`
2. **Manual Override:** Use `/roadmap:work --manual` flag to disable autonomy
3. **Reset State:** Run `python3 roadmap/scripts/update_workflow_state.py <id> phase=not-started attempts=0`
4. **Remove Commands:** Delete the new command files to fully revert

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Items completed autonomously | 80%+ complete without manual intervention |
| Human checkpoints triggered | At expected phase boundaries only |
| Self-correction success rate | 70%+ tests fixed automatically |
| State recovery success | 100% resume from interruption |
| False positives (unnecessary stops) | < 5% |
