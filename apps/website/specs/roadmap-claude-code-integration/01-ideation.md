# Roadmap-Claude Code Integration

**Slug:** roadmap-claude-code-integration
**Author:** Claude Code
**Date:** 2025-12-09
**Branch:** preflight/roadmap-claude-code-integration
**Related:** [Roadmap Management System Spec](../roadmap-management-system/02-specification.md)

---

## 1) Intent & Assumptions

**Task brief:** Update the roadmap HTML visualization and supporting system (instructions, agents, skills, documentation) to deeply integrate with Claude Code's development workflow. Enable users to (1) view roadmap items and understand them, (2) easily start ideation by copying a pre-generated command with context, (3) have bidirectional linking between roadmap items and generated spec files, and (4) automatically update roadmap status as work progresses through ideation, specification, and implementation phases.

**Assumptions:**
- The existing roadmap system (JSON data, HTML visualization, Python scripts) is functional
- Claude Code slash commands (`/ideate`, `/spec:create`, `/spec:execute`) are the primary workflow tools
- Roadmap items need additional fields to store spec associations (schema extension)
- Spec files can include YAML frontmatter to link back to roadmap items
- File-based linking is sufficient (no database needed for the roadmap itself)
- Single-user development workflow (no concurrent editing concerns)
- The HTML visualization runs via local HTTP server (CORS limitation solved)

**Out of scope:**
- Real-time collaboration features
- Database-backed roadmap storage
- Integration with external project management tools (Jira, Linear, etc.)
- Notifications or email alerts for roadmap changes
- Mobile-optimized roadmap UI
- Multi-project roadmap support

---

## 2) Pre-reading Log

| File | Takeaway |
|------|----------|
| `.claude/commands/ideate.md` | Takes task brief as argument, creates `specs/{slug}/01-ideation.md` with 7-step workflow. Needs rich context: user type, pain points, success criteria |
| `.claude/commands/ideate-to-spec.md` | Transforms ideation → spec via interactive decisions. Outputs `02-specification.md` |
| `.claude/commands/spec/create.md` | Creates comprehensive 17-section spec. Requires pre-validation, context discovery |
| `.claude/commands/spec/execute.md` | Implements spec with multi-session support, creates `04-implementation.md` |
| `roadmap/roadmap.json` | Current schema has: id, title, description, type, moscow, status, health, effort, dependencies, labels, timestamps. No spec linking fields |
| `roadmap/schema.json` | JSON Schema Draft-07 with UUID pattern, enum validations. Needs extension for linkedArtifacts |
| `roadmap/scripts.js` | Vanilla JS IIFE, renders cards via `createItemCard()`. Can extend with copy button |
| `roadmap/styles.css` | Calm Tech design system, OKLCH colors. Has badge and button styling |
| `specs/bank-account-import/01-ideation.md` | Example ideation with comprehensive task brief including assumptions, pain points |
| `specs/account-card-features/01-ideation.md` | Shows how related specs cross-reference each other via `**Related:**` header |

---

## 3) Codebase Map

### Primary Components/Modules

| Path | Role |
|------|------|
| `roadmap/roadmap.json` | Central roadmap data |
| `roadmap/schema.json` | JSON Schema validation |
| `roadmap/roadmap.html` | HTML visualization |
| `roadmap/scripts.js` | Client-side rendering and interaction |
| `roadmap/styles.css` | Calm Tech styling |
| `.claude/commands/ideate.md` | Ideation slash command |
| `.claude/commands/spec/*.md` | Spec lifecycle commands |
| `.claude/skills/roadmap-moscow/` | Roadmap skill with utilities |

### Shared Dependencies

| Type | Path | Usage |
|------|------|-------|
| Schema | `roadmap/schema.json` | Validates roadmap.json structure |
| Utils | `.claude/skills/roadmap-moscow/scripts/*.py` | validate, sort, health_check, summary |
| Agent | `.claude/agents/product-manager.md` | Strategic roadmap decisions |
| Skill | `.claude/skills/roadmap-moscow/SKILL.md` | MoSCoW methodology guidance |

### Data Flow

```
Current Flow (No Integration):
  Roadmap Item (roadmap.json)
    → User manually reads item
    → User manually types /ideate command
    → Specs created in specs/{slug}/
    → No link back to roadmap
    → Manual status updates

Proposed Flow (Integrated):
  Roadmap Item (roadmap.json)
    → View in HTML, click "Start Ideation" button
    → Copy pre-generated /ideate command with context
    → Paste into Claude Code
    → /ideate creates specs/{slug}/01-ideation.md with roadmapId frontmatter
    → Roadmap status auto-updates to "in-progress"
    → /spec:execute creates implementation
    → Roadmap status auto-updates to "completed"
    → Roadmap linkedArtifacts field populated with paths
```

### Feature Flags/Config

- No feature flags currently
- Python scripts use stdlib only (no external dependencies)

### Potential Blast Radius

| Component | Impact |
|-----------|--------|
| `roadmap/schema.json` | Add `linkedArtifacts` object with optional fields |
| `roadmap/roadmap.json` | Add linkedArtifacts to existing items |
| `roadmap/scripts.js` | Add ideation prompt generation, copy functionality |
| `roadmap/styles.css` | Add button styles for copy/ideate actions |
| `roadmap/roadmap.html` | Add action buttons to card layout |
| `.claude/commands/ideate.md` | Accept roadmapId, update roadmap status |
| `.claude/commands/spec/create.md` | Accept roadmapId, link to roadmap item |
| `.claude/commands/spec/execute.md` | Update roadmap status on completion |
| `.claude/skills/roadmap-moscow/scripts/` | Add `update_status.py`, `link_spec.py` utilities |

---

## 4) Root Cause Analysis

N/A - This is a new feature integration, not a bug fix.

---

## 5) Research

### What Makes a Good Ideation Prompt?

Based on analysis of existing successful ideation files:

**Essential Elements:**
1. **Clear task brief** - What are we building/fixing? (1-3 sentences)
2. **Target users** - Who benefits from this?
3. **Pain points** - What problem does this solve?
4. **Success criteria** - How do we know it's working?
5. **Technical context** - What systems does this touch?
6. **Constraints** - What are we explicitly NOT doing?

**Current roadmap item fields:**
- `title` - Short name (good for slug generation)
- `description` - Brief context (often insufficient for ideation)

**Gap:** Current descriptions are too short. Example:
> "Fetch transactions from Plaid and store them locally. This is the foundation - without transaction data, nothing else works."

**Better ideation prompt would include:**
> "Build transaction sync from Plaid to local database. Target users: single users tracking personal spending. Pain points: users don't know where money goes, manual tracking is tedious. Success: transactions auto-import, deduplicated, categorized by Plaid. Technical context: Plaid SDK, Prisma ORM, existing User model. Constraints: read-only (no payment initiation), US banks only initially."

### Schema Extension Options

**Option A: Embed ideation context in description**
```json
{
  "description": "...",
  "ideationContext": {
    "targetUsers": "...",
    "painPoints": ["..."],
    "successCriteria": ["..."],
    "constraints": ["..."]
  }
}
```

**Option B: Generate ideation prompt dynamically**
- Use existing fields (title, description, labels, type)
- Generate template with placeholders for Claude to fill

**Option C: Store pre-written ideation prompt**
```json
{
  "ideationPrompt": "/ideate Build transaction sync from Plaid..."
}
```

### Automatic Status Update Strategies

**Strategy 1: Command-based triggers**
- `/ideate <roadmapId>` → Sets status to "in-progress"
- `/spec:execute` completion → Sets status to "completed"
- Requires modifying slash commands

**Strategy 2: File-based detection**
- Python script scans `specs/*/` for roadmapId in frontmatter
- Updates roadmap.json based on which files exist
- Can run on-demand or via git hook

**Strategy 3: Claude Code hooks**
- PostToolUse hook detects spec file creation
- Triggers roadmap status update
- Requires hook configuration

### Research Sources

- [Atlassian Product Roadmaps](https://www.atlassian.com/agile/product-management/product-roadmaps) - Roadmap-to-epic hierarchy
- [ClickUp AI Prompts for User Stories](https://clickup.com/templates/ai-prompts/user-stories) - Structured prompt templates
- [Aha! Progress Reporting](https://www.aha.io/roadmapping/guide/product-roadmap/report-on-progress) - Automatic status updates based on linked artifacts
- [GitHub YAML Frontmatter](https://docs.github.com/en/contributing/writing-for-github-docs/using-yaml-frontmatter) - Linking metadata in markdown

---

## 6) Clarification

### Questions for User Decision

1. **Ideation prompt source:** Should we (A) extend the roadmap schema with additional context fields (targetUsers, painPoints, etc.) that get filled when adding items, or (B) generate a template prompt from existing fields and let Claude fill in context during ideation?

2. **Copy mechanism:** When the user clicks "Start Ideation", should it (A) copy the complete `/ideate <prompt>` command to clipboard, or (B) open a modal showing the generated prompt for review/editing before copying?

3. **Bidirectional linking:** Should linked specs appear as (A) clickable links in the HTML visualization, or (B) just shown as text paths in the card?

4. **Status automation:** Preferred trigger for automatic status updates: (A) Modify slash commands to accept roadmapId parameter and update status, (B) Use file-based detection (Python script scans for spec files), or (C) Manual status updates only (no automation)?

5. **Spec directory naming:** Should spec directories match (A) the roadmap item ID (UUID), (B) a slug derived from the title, or (C) user-specified slug during ideation?

---

## 7) Proposed Solution Summary

### Recommended Approach

Based on research and codebase analysis, I recommend:

1. **Extend schema with `linkedArtifacts`** - Add optional object to track spec paths
2. **Add `ideationContext` field** - Optional structured context for richer prompts
3. **Generate ideation command from item data** - Combine title + description + context into prompt
4. **Copy button in HTML** - One-click copy of `/ideate <generated-prompt>`
5. **Modify `/ideate` to accept `--roadmap-id`** - Enable status auto-update
6. **Add `link_spec.py` utility** - Python script to update linkedArtifacts
7. **Update `/spec:execute` completion** - Mark roadmap item as completed

### New Schema Fields

```json
{
  "linkedArtifacts": {
    "specSlug": "bank-account-import",
    "ideationPath": "specs/bank-account-import/01-ideation.md",
    "specPath": "specs/bank-account-import/02-specification.md",
    "implementationPath": "specs/bank-account-import/04-implementation.md"
  },
  "ideationContext": {
    "targetUsers": ["first-time users", "returning users"],
    "painPoints": ["manual tracking is tedious", "no visibility into spending"],
    "successCriteria": ["transactions auto-import", "< 2s sync time"],
    "constraints": ["read-only (no payments)", "US banks only"]
  }
}
```

### HTML Additions

1. **"Start Ideation" button** on each card
2. **Spec links section** showing linked documents
3. **Status badge colors** reflecting workflow stage
4. **Copy confirmation toast** after clipboard copy

### Command Modifications

1. **`/ideate --roadmap-id <id>`** - Optional flag to link to roadmap item
2. **Auto-status-update** in `/ideate` and `/spec:execute` when roadmapId provided
3. **Frontmatter** in generated specs containing `roadmapId` for back-linking

---

## 8) Implementation Phases

### Phase 1: Schema & Data Model
- Extend `schema.json` with `linkedArtifacts` and `ideationContext`
- Update existing roadmap items with new fields
- Add `link_spec.py` utility script

### Phase 2: HTML Visualization Updates
- Add "Start Ideation" button with copy functionality
- Add spec links display section
- Add copy confirmation feedback
- Responsive styling

### Phase 3: Command Integration
- Modify `/ideate` to accept `--roadmap-id` flag
- Add frontmatter to generated specs with roadmapId
- Modify `/spec:execute` to update roadmap on completion

### Phase 4: Documentation & Testing
- Update CLAUDE.md with new workflow
- Update roadmap README
- Test full workflow end-to-end
