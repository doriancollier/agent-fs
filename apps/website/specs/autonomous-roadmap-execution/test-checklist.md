# Autonomous Roadmap Execution - Test Checklist

**Feature:** Autonomous Roadmap Execution System
**Created:** 2026-02-01
**Last Tested:** _____________

## Pre-Test Setup

- [ ] Dev server running (`pnpm dev`)
- [ ] At least one roadmap item exists with status `not-started`
- [ ] Clean git state (`git status` shows clean working tree)

---

## 1. Schema Tests

### 1.1 Schema Validation
| Test | Steps | Expected | Pass |
|------|-------|----------|------|
| Schema validates with workflowState | Run `python3 .claude/skills/managing-roadmap-moscow/scripts/validate_roadmap.py` | No errors | [ ] |
| Existing items still validate | Check items without workflowState | Should pass validation | [ ] |
| workflowState can be added | Run `python3 roadmap/scripts/update_workflow_state.py <id> phase=ideating` | Item updated, validates | [ ] |
| All phase enums valid | Set phase to each: not-started, ideating, specifying, decomposing, implementing, testing, committing, releasing, completed | All should validate | [ ] |

---

## 2. /roadmap:next Tests

### 2.1 Priority Selection
| Test | Steps | Expected | Pass |
|------|-------|----------|------|
| Selects must-have over should-have | Have items with different MoSCoW | Must-have selected | [ ] |
| Respects time horizon | Same MoSCoW, different horizon | "now" selected before "next" | [ ] |
| Prioritizes at-risk items | Same MoSCoW/horizon | at-risk selected first | [ ] |
| Items that unblock others | Item A blocks B, C, D | A selected (unblocks more) | [ ] |

### 2.2 Dependency Handling
| Test | Steps | Expected | Pass |
|------|-------|----------|------|
| Skips items with unmet deps | Item depends on incomplete item | Not selected | [ ] |
| Includes items when deps met | All dependencies completed | Can be selected | [ ] |
| Reports circular dependencies | A→B→A cycle exists | Reports cycle, suggests fix | [ ] |

### 2.3 Edge Cases
| Test | Steps | Expected | Pass |
|------|-------|----------|------|
| Empty roadmap | Remove all items | "No eligible items" message | [ ] |
| All items completed | Set all to completed | Celebrates, reports completion | [ ] |
| All items on-hold | Set all to on-hold | Reports blockers need resolution | [ ] |

---

## 3. /roadmap:work Tests

### 3.1 Phase Transitions

| Phase Transition | Trigger | Verification | Pass |
|------------------|---------|--------------|------|
| not-started → ideating | Start `/roadmap:work <id>` | workflowState.phase = "ideating" | [ ] |
| ideating → specifying | Approve ideation | Human approval checkpoint, then phase updates | [ ] |
| specifying → decomposing | Approve specification | Human approval checkpoint, then phase updates | [ ] |
| decomposing → implementing | Automatic | No approval needed | [ ] |
| implementing → testing | Automatic | `pnpm test` runs | [ ] |
| testing → committing | Tests pass | `/git:commit` runs | [ ] |
| committing → releasing | Automatic | Human approval for release | [ ] |
| releasing → completed | Approve release | Status = completed | [ ] |

### 3.2 Human Approval Checkpoints

| Checkpoint | Options | Expected Behavior | Pass |
|------------|---------|-------------------|------|
| After ideating | Approve / Revise / Abort | Correct option leads to correct action | [ ] |
| After specifying | Approve / Revise / Abort | Correct option leads to correct action | [ ] |
| Before releasing | Create / Skip / Review | Correct option leads to correct action | [ ] |

### 3.3 Self-Correction (Testing Phase)

| Test | Steps | Expected | Pass |
|------|-------|----------|------|
| Failing tests trigger fix | Make test fail | Claude attempts to fix | [ ] |
| Fix attempts limited to 3 | Test keeps failing | Stops after 3 attempts | [ ] |
| Blockers documented | Max attempts reached | workflowState.blockers populated | [ ] |
| Outputs ABORT on max fail | 3 failed attempts | `<promise>ABORT</promise>` output | [ ] |
| Successful fix continues | Fix works on attempt 2 | Proceeds to committing | [ ] |

### 3.4 Resumability

| Test | Steps | Expected | Pass |
|------|-------|----------|------|
| Resume from ideating | Stop mid-ideation, restart | Continues from ideating | [ ] |
| Resume from implementing | Stop mid-implementation, restart | Continues from implementing | [ ] |
| Resume from testing | Stop during tests, restart | Continues from testing | [ ] |
| Session context preserved | Resume after restart | Previous progress intact | [ ] |

---

## 4. Stop Hook Tests

### 4.1 Hook Behavior

| Test | Input/State | Expected Exit Code | Pass |
|------|-------------|-------------------|------|
| No active work | No item in active phase | 0 (allow stop) | [ ] |
| Active work in progress | Item in "implementing" phase | 2 (block stop) | [ ] |
| PHASE_COMPLETE signal | Output contains `<promise>PHASE_COMPLETE:implementing</promise>` | 0 (allow stop) | [ ] |
| ABORT signal | Output contains `<promise>ABORT</promise>` | 0 (allow stop) | [ ] |
| Unreadable roadmap | Corrupt/missing roadmap.json | 0 (fail open) | [ ] |

### 4.2 User Experience

| Test | Steps | Expected | Pass |
|------|-------|----------|------|
| Blocking message displayed | Try to stop during work | Shows item title, phase, instructions | [ ] |
| Instructions are clear | Read blocking message | User knows how to complete/abort | [ ] |

---

## 5. Integration Tests

### 5.1 Full Workflow (Happy Path)

Run complete workflow on a test item:

1. [ ] Create test roadmap item (type: feature, moscow: should-have)
2. [ ] Run `/roadmap:next` - selects test item
3. [ ] Run `/roadmap:work <id>` - starts ideating
4. [ ] Complete ideation, approve
5. [ ] Complete specification, approve
6. [ ] Decomposition runs automatically
7. [ ] Implementation runs (may take time)
8. [ ] Tests run and pass
9. [ ] Commit created
10. [ ] Release decision - skip for test
11. [ ] Item status = completed
12. [ ] `<promise>PHASE_COMPLETE:completed</promise>` output

### 5.2 Abort Workflow

1. [ ] Start `/roadmap:work <id>` on new item
2. [ ] During ideation approval, select "Abort"
3. [ ] Verify `<promise>ABORT</promise>` output
4. [ ] Verify stop hook allows stop
5. [ ] Item status remains (not corrupted)

---

## 6. Error Handling

| Scenario | Expected Behavior | Pass |
|----------|-------------------|------|
| Item not found | Clear error: "Item not found: {id}" | [ ] |
| Invalid phase in workflowState | Reset to last valid, report error | [ ] |
| Git push fails | Pause, provide recovery commands | [ ] |
| Phase command fails | Increment attempts, retry with context | [ ] |
| Max cost exceeded | Graceful shutdown, state preserved | [ ] |

---

## Test Results Summary

| Section | Passed | Failed | Total |
|---------|--------|--------|-------|
| Schema Tests | | | 4 |
| /roadmap:next Tests | | | 10 |
| /roadmap:work Tests | | | 21 |
| Stop Hook Tests | | | 7 |
| Integration Tests | | | 14 |
| Error Handling | | | 6 |
| **Total** | | | **62** |

**Tester:** _____________
**Date:** _____________
**Notes:**

---

## Known Limitations

- Stop hook only works with Claude Code's built-in hook system
- Requires Node.js for hook execution
- roadmap.json must be accessible at project root
- Human must be present for approval checkpoints
