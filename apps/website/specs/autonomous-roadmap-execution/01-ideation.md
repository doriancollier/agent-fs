---
slug: autonomous-roadmap-execution
---

# Autonomous Roadmap Execution System

**Slug:** autonomous-roadmap-execution
**Author:** Claude Code
**Date:** 2026-02-01
**Branch:** preflight/autonomous-roadmap-execution
**Related:** N/A (meta-feature for the system itself)

---

## 1) Intent & Assumptions

**Task brief:** Design and implement a system that allows Claude Code to autonomously work through roadmap items—selecting the next item to work on, executing the full development lifecycle (ideate → spec → decompose → execute → test → commit → push → release), self-correcting when bugs are found, and tracking progress throughout.

**Assumptions:**
- The existing command infrastructure (`/ideate`, `/spec:decompose`, `/spec:execute`, etc.) will be leveraged
- We have access to Claude Code's hooks system (Stop, PostToolUse, UserPromptSubmit, etc.)
- The Ralph Wiggum plugin pattern is available for autonomous looping
- Tests and type checking provide automatic verification signals
- The roadmap.json file can be extended with new state fields

**Out of scope:**
- Full AI autonomy without any human oversight (we need safety guardrails)
- Multi-codebase orchestration (focus on single project)
- Cloud-based continuous execution (local CLI focus)
- Real-time monitoring dashboards

---

## 2) Pre-reading Log

### Claude Code Documentation
- **Hooks System**: 12 hook events available (PreToolUse, PostToolUse, Stop, UserPromptSubmit, etc.)
- **Stop Hook**: Key mechanism for autonomous loops—can prevent Claude from stopping
- **Background Agents**: Support for `run_in_background: true` with TaskOutput retrieval
- **Skills**: Reusable instruction sets with `context: fork` for isolated execution
- **Checkpoints**: Automatic session persistence via `.claude/projects/<id>/`

### Existing Codebase Commands
- `.claude/commands/ideate.md` - Parallel discovery with exploration + research agents
- `.claude/commands/spec/decompose.md` - Background analysis with auto-recovery
- `.claude/commands/spec/execute.md` - Parallel batch execution with specialist routing
- `.claude/commands/git/commit.md` - Validation + commit with attribution
- `.claude/commands/git/push.md` - Full validation (lint + typecheck + build) before push
- `.claude/commands/system/release.md` - Changelog backfill + version bump + tag

### State Management
- Task system: `TaskCreate`, `TaskList`, `TaskGet`, `TaskUpdate` for tracking
- Implementation files: `04-implementation.md` preserves session state
- Roadmap: `linkedArtifacts` and `status` fields track spec → roadmap connection

---

## 3) Codebase Map

**Primary Components/Modules:**
- `.claude/hooks-config.json` - Hook configuration (PreToolUse, PostToolUse, Stop, UserPromptSubmit)
- `.claude/commands/` - 48+ slash commands organized by category
- `.claude/skills/managing-roadmap-moscow/` - Roadmap management skill with validation scripts
- `roadmap/roadmap.json` - Source of truth for roadmap items
- `roadmap/scripts/` - Python utilities (update_status, link_spec, etc.)

**Shared Dependencies:**
- Task tools (`TaskCreate`, `TaskList`, `TaskUpdate`)
- Background agent spawning (`Task` tool with `run_in_background: true`)
- Hooks system for automatic validation

**Data Flow:**
```
Roadmap Item (roadmap.json)
    ↓ Select next item
/ideate --roadmap-id <uuid>
    ↓ Status: in-progress
specs/<slug>/01-ideation.md
    ↓
/ideate-to-spec
    ↓
specs/<slug>/02-specification.md
    ↓
/spec:decompose
    ↓
specs/<slug>/03-tasks.md + Task system populated
    ↓
/spec:execute (parallel batches)
    ↓
specs/<slug>/04-implementation.md
    ↓
/debug:browser + /debug:test (verification)
    ↓
/git:commit → /git:push
    ↓ (if release warranted)
/system:release
    ↓ Status: completed
Roadmap Item updated
```

**Potential Blast Radius:**
- Hook configuration changes affect all Claude Code sessions
- Roadmap schema extensions require validation script updates
- New command files need proper tool permissions

---

## 4) Research: Autonomous Agent Patterns

### The Ralph Wiggum Loop

The Ralph Wiggum pattern is the definitive approach for autonomous Claude Code loops. It works via a **Stop hook** that:

1. Intercepts Claude's exit attempts
2. Checks if completion criteria are met (e.g., `<promise>COMPLETE</promise>` in output)
3. If NOT complete: Prevents exit, re-submits original prompt
4. Claude sees previous work in files/git history, tries different approach
5. Repeats until complete OR iteration limit reached

**Key insight**: The prompt never changes—only file state changes. This creates a feedback mechanism where Claude learns from:
- Test failures → tries different fix
- Linting errors → addresses them
- Type errors → corrects types

**Implementation:**
```bash
/ralph-loop "Complete roadmap item: <task>" \
  --completion-promise "COMPLETE" \
  --max-iterations 50
```

**Best practices:**
- Tasks MUST have built-in success signals (passing tests, resolved types)
- Always set `--max-iterations` as safety mechanism
- Avoid tasks requiring human judgment

### Vercel's Ralph Loop Agent (AI SDK Implementation)

A more sophisticated implementation with:

**Two-tier nested loops:**
- **Outer loop (Ralph)**: Verification and feedback injection
- **Inner loop (AI SDK)**: Standard tool calling (LLM ↔ tools ↔ LLM)

**Verification callback:**
```typescript
verifyCompletion: async ({ result, iteration }) => ({
  complete: boolean,
  reason?: string // Injected as feedback if incomplete
})
```

**Stop conditions:**
- `iterationCountIs(n)` - Halt after n iterations
- `tokenCountIs(n)` - Stop when cumulative tokens exceed n
- `costIs(maxCost)` - Terminate at cost threshold

### State Machine for Development Pipeline

Based on research, the optimal state model is:

```
┌─────────────┐
│ not-started │
└──────┬──────┘
       │ /roadmap:next triggers
       ▼
┌──────────────┐
│  ideating    │ ← /ideate in progress
└──────┬───────┘
       │ ideation complete
       ▼
┌──────────────┐
│  specifying  │ ← /ideate-to-spec in progress
└──────┬───────┘
       │ spec complete
       ▼
┌──────────────┐
│ decomposing  │ ← /spec:decompose in progress
└──────┬───────┘
       │ tasks created
       ▼
┌──────────────┐
│ implementing │ ← /spec:execute in progress (may have sub-states)
└──────┬───────┘
       │ all tasks complete
       ▼
┌──────────────┐
│   testing    │ ← /debug:browser + /debug:test
└──────┬───────┘
       │ tests pass
       ▼
┌──────────────┐
│  committing  │ ← /git:commit + /git:push
└──────┬───────┘
       │ pushed
       ▼
┌──────────────┐
│  releasing   │ ← /system:release (if warranted)
└──────┬───────┘
       │ released
       ▼
┌──────────────┐
│  completed   │
└──────────────┘
```

### Self-Improving Systems

**Evaluator Reflect-Refine Loop:**
1. Generator produces output
2. Evaluator reviews using rubric
3. If feedback indicates issues → optimizer revises
4. Loop until criteria met or retry limit

**Feedback Integration:**
- When bugs found during testing → add to roadmap if significant
- When implementation reveals missing requirements → update spec
- When pattern emerges → consider adding to developer guides

### Context Management Strategies

For long-running autonomous tasks:
1. **Observation masking** - Replace older observations with placeholders
2. **Hierarchical summarization** - Compress older segments progressively
3. **External memory** - Offload to filesystem with references
4. **Sub-agent isolation** - Specialized agents with clean context windows

---

## 5) Design: Autonomous Execution Architecture

### Core Components

#### 1. `/roadmap:next` Command (New)

**Purpose:** Intelligently select the next roadmap item to work on.

**Selection algorithm:**
1. Filter to `status: not-started` or `status: on-hold` (if unblocked)
2. Exclude items with unmet dependencies
3. Sort by:
   - MoSCoW priority (must-have first)
   - Time horizon (now > next > later)
   - Health (at-risk items get priority)
   - Dependencies cleared count (items unblocking others first)
4. Return top candidate

**Output:**
- Selected item ID, title, and rationale
- Suggested command: `/roadmap:work <id>`

#### 2. `/roadmap:work <id>` Command (New)

**Purpose:** Orchestrate full development lifecycle for a roadmap item.

**Implementation options:**

**Option A: Sequential Command Chain (Simpler)**
```
1. Set roadmap status to "ideating"
2. Run /ideate --roadmap-id <id>
3. Wait for user approval of ideation
4. Set status to "specifying"
5. Run /ideate-to-spec
6. Wait for user approval of spec
7. Set status to "decomposing"
8. Run /spec:decompose
9. Set status to "implementing"
10. Run /spec:execute (with parallel batches)
11. Set status to "testing"
12. Run /debug:browser + /debug:test
13. If tests fail → loop back to implementing
14. Set status to "committing"
15. Run /git:commit → /git:push
16. Ask if release warranted
17. If yes: /system:release
18. Set status to "completed"
```

**Option B: Ralph Loop with Verification (Autonomous)**
```bash
/ralph-loop "Complete roadmap item $ID following the workflow:
1. If no ideation exists: Run /ideate --roadmap-id $ID
2. If no spec exists: Run /ideate-to-spec
3. If no tasks exist: Run /spec:decompose
4. If tasks incomplete: Run /spec:execute
5. When implementation done: Run tests
6. If tests pass: Run /git:commit and /git:push
7. Output <promise>COMPLETE</promise> when pushed

Current state can be determined from:
- specs/$SLUG/01-ideation.md (ideation done if exists)
- specs/$SLUG/02-specification.md (spec done if exists)
- specs/$SLUG/03-tasks.md (decompose done if exists)
- specs/$SLUG/04-implementation.md (check completed tasks)
- git status (commits pending)
" --max-iterations 100
```

**Option C: Hybrid with Human Checkpoints**
- Autonomous within phases (e.g., auto-retry failing tests)
- Human approval between major phases
- Stop hook prevents exit until phase complete

#### 3. Extended Roadmap Schema

Add `workflowState` to track progress:

```json
{
  "id": "uuid",
  "title": "Feature Name",
  "status": "in-progress",
  "workflowState": {
    "phase": "implementing",
    "specSlug": "feature-name",
    "tasksTotal": 5,
    "tasksCompleted": 3,
    "lastSession": "2026-02-01T15:30:00Z",
    "attempts": 2,
    "blockers": []
  }
}
```

#### 4. Self-Correction Mechanisms

**Test-Driven Feedback Loop:**
```
spec:execute completes
    ↓
Run pnpm test
    ↓
Parse failures
    ↓
If failures detected:
    ↓
Create fix tasks (temporary, not in roadmap)
    ↓
Execute fix tasks
    ↓
Re-run tests
    ↓
Loop until pass or max attempts
```

**Bug Discovery Protocol:**
When bug found during testing:
1. Estimate fix complexity (trivial/small/medium/large)
2. If trivial/small: Fix inline during current work
3. If medium/large:
   - Add to roadmap with type: "bugfix"
   - Link as dependency if blocking current work
   - Continue with workaround if possible

#### 5. Hooks Configuration

```json
{
  "hooks": {
    "Stop": [{
      "hooks": [{
        "type": "command",
        "command": "node .claude/scripts/hooks/autonomous-check.mjs"
      }]
    }]
  }
}
```

The `autonomous-check.mjs` script:
1. Reads current roadmap item's `workflowState`
2. Checks if phase is complete
3. If NOT complete: Returns exit code 2 (blocks stop)
4. If complete: Returns exit code 0 (allows stop)

---

## 6) Clarification Questions

### Critical Decisions

1. **Human oversight level:**
   - **Option A**: Full autonomy (Ralph loop runs until complete)
   - **Option B**: Human approval between major phases (ideate → spec → implement → test → release)
   - **Option C**: Human approval only for releases (autonomous for development)
   - **Recommendation**: Option B initially, with configuration to enable Option C once trust established

2. **Bug handling:**
   - When bugs are discovered, should they be:
     - **Auto-added** to roadmap as bugfix items?
     - **Inline-fixed** if trivial?
     - **Reported** for human decision?
   - **Recommendation**: Complexity-based auto-decision with human notification

3. **Release triggering:**
   - Should releases happen:
     - **Per-feature** (each completed roadmap item)
     - **Batched** (multiple items, then release)
     - **Manual** (human triggers when ready)
   - **Recommendation**: Ask after each feature, batch by default

4. **Context management:**
   - For long-running autonomous work:
     - Should we use **sub-agents** for each phase?
     - Should we **summarize** context between phases?
     - Should we **persist** state to files?
   - **Recommendation**: Phase-based sub-agents with file persistence

5. **Cost controls:**
   - Maximum iterations per phase?
   - Maximum total cost per roadmap item?
   - Alert threshold?
   - **Recommendation**: 20 iterations per phase, $50 total, alert at $25

---

## 7) Potential Solutions

### Solution 1: Minimal - Command Chain Skill

**Approach:** Create a skill that chains existing commands with state tracking.

**Components:**
- New skill: `.claude/skills/autonomous-workflow/SKILL.md`
- State file: `specs/<slug>/workflow-state.json`
- Commands: `/roadmap:next`, `/roadmap:work`

**Pros:**
- Uses existing command infrastructure
- Minimal changes to codebase
- Easy to understand and debug

**Cons:**
- Requires manual phase transitions
- No true autonomous looping
- Limited self-correction

**Complexity:** Low
**Maintenance:** Low

### Solution 2: Ralph Loop Integration

**Approach:** Wrap the workflow in a Ralph loop with verification.

**Components:**
- Ralph plugin installation
- Custom verification function in `.claude/scripts/`
- Extended roadmap schema for `workflowState`
- Commands: `/roadmap:next`, `/roadmap:auto`

**Pros:**
- True autonomous execution
- Self-correcting via iteration
- Industry-proven pattern

**Cons:**
- Token consumption can be high
- Requires careful iteration limits
- Less visibility into progress

**Complexity:** Medium
**Maintenance:** Medium

### Solution 3: Hybrid Orchestrator

**Approach:** Custom orchestrator with phase-based sub-agents and human checkpoints.

**Components:**
- Main orchestrator command: `/roadmap:orchestrate`
- Phase executors (background agents)
- Progress tracking in roadmap.json
- Notification hooks
- Human approval gates

**Pros:**
- Fine-grained control
- Optimized context usage
- Clear human oversight points

**Cons:**
- More complex implementation
- More files to maintain
- Custom patterns (not standard Ralph)

**Complexity:** High
**Maintenance:** Medium-High

### Recommendation

**Start with Solution 2 (Ralph Loop)** for these reasons:
1. It's an established pattern with community support
2. Leverages existing Claude Code infrastructure
3. Provides true autonomy with configurable safety limits
4. Can evolve toward Solution 3 if needed

**Implementation phases:**
1. **Phase 1:** `/roadmap:next` command for intelligent selection
2. **Phase 2:** Extended roadmap schema with `workflowState`
3. **Phase 3:** `/roadmap:work` command with Ralph loop
4. **Phase 4:** Self-correction and bug discovery integration
5. **Phase 5:** Observability and cost controls

---

## 8) What You Might Be Missing

### Considerations Not in Original Request

1. **Recovery from failures:**
   - What happens if Claude crashes mid-workflow?
   - How do we resume from last known good state?
   - **Mitigation:** `workflowState` in roadmap.json + spec files preserve state

2. **Concurrent roadmap items:**
   - Can multiple items be in-progress simultaneously?
   - How to handle resource conflicts?
   - **Mitigation:** Single-item-at-a-time initially, queue system for future

3. **External dependencies:**
   - What if a task requires waiting for external API/service?
   - **Mitigation:** `on-hold` status with `blockers` array

4. **Rollback capability:**
   - If a released feature has critical bugs, how to revert?
   - **Mitigation:** Git tags + roadmap history tracking

5. **Token/cost observability:**
   - How to track cost per roadmap item?
   - **Mitigation:** Cost tracking in `workflowState.metrics`

6. **Learning from patterns:**
   - When same issue appears multiple times, how to prevent recurrence?
   - **Mitigation:** Consider adding to developer guides or creating rules

7. **Test coverage requirements:**
   - Should there be minimum test coverage before release?
   - **Mitigation:** Configurable gates in workflow

8. **Performance regression detection:**
   - How to detect if new code slows down the app?
   - **Mitigation:** `/debug:performance` integration before release

9. **Documentation updates:**
   - When should developer guides be updated?
   - **Mitigation:** `/docs:reconcile` integration post-implementation

10. **Branch strategy:**
    - Work on main vs feature branches?
    - **Mitigation:** Feature branches by default, merge after tests pass

---

## 9) Next Steps

1. **Decide on human oversight level** (clarification question #1)
2. **Review and approve this ideation**
3. **Run `/ideate-to-spec`** to create formal specification
4. **Implement in phases** as outlined in recommendation

---

**End of Ideation Document**
