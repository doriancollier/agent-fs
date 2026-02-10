# Proposal: Dual AI Tooling (Claude Code + Cursor)

## Executive Summary

This proposal outlines how to make the Next.js 16 boilerplate work seamlessly with **both Claude Code and Cursor**. The goal is to maintain Claude Code as the primary orchestration tool while enabling Cursor for day-to-day coding assistance.

---

## Current State Analysis

### What We Have (Claude Code)

```
.claude/
├── commands/           # 30+ slash commands (/ideate, /spec:create, etc.)
├── skills/             # 6 auto-invoked skills (designing-frontend, etc.)
├── agents/             # 7 specialized agents (prisma-expert, etc.)
├── settings.json       # Hooks, permissions, env vars
└── README.md

CLAUDE.md               # Project memory (676 lines)
.mcp.json               # MCP server configuration
```

### What Cursor Needs

```
.cursor/
└── rules/
    ├── always/         # Rules applied to every chat
    ├── auto/           # Rules applied intelligently based on context
    ├── file-scoped/    # Rules applied when matching files are referenced
    └── manual/         # Rules invoked via @mention
```

### Key Differences

| Feature | Claude Code | Cursor |
|---------|-------------|--------|
| **Memory files** | `CLAUDE.md` | `.cursor/rules/*.mdc` or `RULE.md` |
| **Commands** | `.claude/commands/*.md` | Not directly supported (use rules) |
| **Skills** | `.claude/skills/*/SKILL.md` | Not supported |
| **Hooks** | `.claude/settings.json` | Not supported |
| **File targeting** | Not native (use path imports) | Native via `globs` frontmatter |
| **Rule application** | Always on (memory) | Always / Auto / File / Manual |
| **Agents** | `.claude/agents/*.md` | Not supported |

---

## Strategy: Layered Compatibility

Rather than trying to make everything work identically in both tools, we'll use a **layered approach**:

### Layer 1: Shared Knowledge (Both Tools)
Core project knowledge that both tools should have:
- Tech stack and versions
- Directory structure
- Code conventions
- Architecture patterns (FSD, DAL)
- Common commands

### Layer 2: Claude Code Exclusive
Features that only work in Claude Code:
- Slash commands
- Skills (auto-invoked)
- Hooks (validation)
- Agents (specialized subprocesses)
- MCP servers

### Layer 3: Cursor Exclusive
Features optimized for Cursor:
- File-scoped rules (e.g., apply to `*.prisma` files)
- Inline autocomplete context
- Manual rules for specific workflows

---

## Proposed File Structure

```
project-root/
├── CLAUDE.md                    # Claude Code: Full project memory
│
├── .claude/                     # Claude Code: Commands, skills, agents
│   ├── commands/
│   ├── skills/
│   ├── agents/
│   └── settings.json
│
├── .cursor/                     # Cursor: Project rules
│   └── rules/
│       ├── 000-project-overview/RULE.md       # Always: Core context
│       ├── 001-code-conventions/RULE.md       # Always: Standards
│       ├── 002-architecture-fsd/RULE.md       # Auto: FSD guidance
│       ├── 003-database-prisma/RULE.md        # Auto: Prisma patterns
│       ├── 004-styling-tailwind/RULE.md       # Auto: Styling
│       ├── 005-forms-zod/RULE.md              # Auto: Forms
│       └── file-scopes/
│           ├── prisma-schema/RULE.md          # When *.prisma files
│           ├── api-routes/RULE.md             # When app/api/** files
│           └── components/RULE.md             # When *.tsx files
│
├── .shared-rules/               # NEW: Source of truth for shared rules
│   ├── project-overview.md      # Extracted from CLAUDE.md
│   ├── code-conventions.md
│   ├── architecture-fsd.md
│   ├── database-prisma.md
│   ├── styling-tailwind.md
│   └── forms-zod.md
│
├── .mcp.json                    # Claude Code: MCP servers
└── AGENTS.md                    # Cursor: Simple agent instructions (optional)
```

---

## Implementation Plan

### Phase 1: Extract Shared Rules

Create `.shared-rules/` with modular, reusable content extracted from `CLAUDE.md`:

**`.shared-rules/project-overview.md`**
```markdown
# Project Overview

Next.js 16 boilerplate with:
- React 19.2, TypeScript 5.9+
- Tailwind CSS 4.x, Shadcn UI
- Prisma 7.x (Neon PostgreSQL)
- TanStack Query 5.90+
- React Hook Form + Zod 4.x

## Directory Structure
[content from CLAUDE.md]

## Common Commands
[content from CLAUDE.md]
```

### Phase 2: Generate Cursor Rules

Create `.cursor/rules/` with rules that reference or adapt shared content:

**`.cursor/rules/000-project-overview/RULE.md`**
```yaml
---
description: Core project context for Next.js 16 boilerplate
alwaysApply: true
---

# Project Overview

[Import or duplicate content from .shared-rules/project-overview.md]
```

**`.cursor/rules/003-database-prisma/RULE.md`**
```yaml
---
description: Prisma 7 database patterns and DAL conventions. Apply when working with database, queries, or Prisma files.
alwaysApply: false
---

# Database: Prisma 7 Patterns

## Import Path
- Use `@/generated/prisma` (not `@prisma/client`)
- Generator: `prisma-client` (not `prisma-client-js`)

## Data Access Layer
- All queries go through `entities/*/api/`
- Never import prisma directly in components
- Always check auth in DAL functions

[Additional Prisma patterns...]
```

**`.cursor/rules/file-scopes/prisma-schema/RULE.md`**
```yaml
---
description: Rules for editing Prisma schema files
globs: ["prisma/**/*.prisma"]
---

# Prisma Schema Conventions

## Naming
- Models: PascalCase (e.g., `User`, `BlogPost`)
- Tables: snake_case via `@@map("blog_posts")`
- Fields: camelCase in Prisma, snake_case in DB via `@map("field_name")`

## Required Patterns
- Always add `createdAt` and `updatedAt` to models
- Use `@default(cuid())` for string IDs
- Add indexes for foreign keys

[Schema examples...]
```

### Phase 3: Update CLAUDE.md

Modify `CLAUDE.md` to import shared rules:

```markdown
# Next.js 16 Boilerplate

See @.shared-rules/project-overview.md for project overview.
See @.shared-rules/code-conventions.md for conventions.

## Claude Code Specific

### Commands
[Keep existing command documentation]

### Skills
[Keep existing skill documentation]

### Agents
[Keep existing agent documentation]
```

### Phase 4: Add Sync Script (Optional)

Create a simple script to keep rules in sync:

**`scripts/sync-rules.ts`**
```typescript
/**
 * Syncs .shared-rules/ content to both .cursor/rules/ and CLAUDE.md
 * Run after editing shared rules
 */
```

---

## Rule Design Guidelines

### For Cursor Rules

1. **Keep rules under 500 lines** (Cursor recommendation)
2. **Use descriptive descriptions** - Cursor uses these for auto-application
3. **Prefer globs for file-scoped rules** - More efficient than always-on
4. **Don't duplicate Claude Code commands** - Cursor can't execute them

### For Claude Code

1. **Use imports (`@path`)** - Reference shared rules
2. **Keep commands/skills/agents in .claude/** - Cursor ignores them
3. **Document commands in CLAUDE.md** - For discoverability

### Shared Content

1. **Write tool-agnostic markdown** - No tool-specific syntax
2. **Be concrete and specific** - Both tools benefit from specificity
3. **Include code examples** - Universal value

---

## What NOT to Share

Keep these Claude Code-only:

| Feature | Reason |
|---------|--------|
| Slash commands | Cursor doesn't support |
| Skills | Auto-invocation is Claude-specific |
| Hooks | Cursor has no hook system |
| Agents | Subagent spawning is Claude-specific |
| MCP configuration | Claude-specific feature |

---

## Workflow Recommendations

### When to Use Each Tool

| Task | Recommended Tool | Reason |
|------|------------------|--------|
| **Complex refactoring** | Claude Code | Better reasoning, agents |
| **Architecture decisions** | Claude Code | Skills, planning mode |
| **Spec-driven development** | Claude Code | /ideate, /spec:* commands |
| **Quick code fixes** | Cursor | Faster inline edits |
| **Autocomplete while typing** | Cursor | Real-time suggestions |
| **Multi-file exploration** | Either | Both handle well |
| **Database schema changes** | Claude Code | prisma-expert agent |
| **Component styling** | Either | Both know Tailwind |

### Avoiding Conflicts

1. **Don't use both simultaneously on the same files**
2. **Commit changes before switching tools**
3. **Run lint/typecheck after AI edits** (Claude Code does this via hooks)

---

## Implementation Checklist

- [ ] Create `.shared-rules/` directory
- [ ] Extract modular content from `CLAUDE.md`
- [ ] Create `.cursor/rules/` structure
- [ ] Write `000-project-overview/RULE.md` (always-on)
- [ ] Write `001-code-conventions/RULE.md` (always-on)
- [ ] Write auto-apply rules (FSD, Prisma, Tailwind, Forms)
- [ ] Write file-scoped rules (Prisma schema, API routes, components)
- [ ] Update `CLAUDE.md` to import shared rules
- [ ] Add `.cursor/` to `.gitignore` patterns in Claude Code settings
- [ ] Test both tools with sample tasks
- [ ] Document workflow in README

---

## Alternative: Rulesync Tool

For fully automated synchronization, consider the [rulesync](https://github.com/dyoshikawa/rulesync) tool:

```bash
npm install -g rulesync
rulesync init
```

**Pros:**
- Single source of truth in `.rulesync/rules/`
- Auto-generates tool-specific configs
- Supports Claude Code, Cursor, Gemini CLI, Copilot

**Cons:**
- Another dependency to maintain
- May not support all Claude Code features (skills, agents, hooks)
- Less control over output format

**Recommendation:** Start with manual approach, evaluate rulesync if maintenance becomes burdensome.

---

## Next Steps

1. **Approve this proposal** or request modifications
2. **Phase 1**: Extract shared rules (1-2 hours)
3. **Phase 2**: Create Cursor rules (2-3 hours)
4. **Phase 3**: Update CLAUDE.md imports (30 min)
5. **Test**: Verify both tools work correctly

---

## Sources

- [Cursor Official Docs - Rules](https://cursor.com/docs/context/rules)
- [awesome-cursorrules](https://github.com/PatrickJS/awesome-cursorrules) - Community rules collection
- [agent-rules](https://github.com/steipete/agent-rules) - Cross-tool rule patterns
- [rulesync](https://github.com/dyoshikawa/rulesync) - Unified rule management
- [Claude Code + Cursor workflow](https://www.starkinsider.com/2025/10/claude-vs-cursor-dual-ai-coding-workflow.html) - Dual-tool strategies
