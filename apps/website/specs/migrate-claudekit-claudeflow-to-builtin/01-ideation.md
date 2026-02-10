# Migrate ClaudeKit and ClaudeFlow to Built-in Hooks

**Slug:** migrate-claudekit-claudeflow-to-builtin
**Author:** Claude Code
**Date:** 2026-01-30
**Branch:** preflight/migrate-claudekit-claudeflow-to-builtin
**Related:** N/A

---

## 1) Intent & Assumptions

- **Task brief:** Remove all external dependencies on ClaudeKit and ClaudeFlow by migrating their functionality to be self-contained within this repository. The goal is to maintain all existing functionality while eliminating the need for globally-installed npm packages.

- **Assumptions:**
  - ClaudeKit is installed globally (`npm install -g claudekit`) and provides the `claudekit-hooks` CLI
  - The project uses ClaudeKit hooks but does NOT have ClaudeKit as a local dependency in package.json
  - All hook functionality can be replicated with simple shell scripts since Claude Code hooks accept any shell command
  - The existing hooks are relatively simple and follow predictable patterns (typecheck, lint, test, file guard, etc.)

- **Out of scope:**
  - Adding new hook functionality beyond what ClaudeKit currently provides
  - Changing the hook configuration format in `.claude/settings.json`
  - Migrating ClaudeKit's CLI commands (only hooks are used in this project)
  - Performance optimization beyond maintaining current functionality

## 2) Pre-reading Log

| File | Takeaways |
|------|-----------|
| `.claude/settings.json` | Contains 9 hooks using `claudekit-hooks run <hook-name>` commands across PreToolUse, PostToolUse, Stop, and UserPromptSubmit events |
| `.claude/README.md` | Documents the hook system, references ClaudeKit for hook execution, lists all hook purposes |
| `.claude/scripts/check-docs-changed.sh` | Example of an existing local script hook - simple bash script that runs on Stop event |
| `/tmp/package/cli/hooks/file-guard/index.ts` | File guard hook - complex, parses bash commands to detect access to sensitive files using gitignore-style patterns |
| `/tmp/package/cli/hooks/typecheck-changed.ts` | Simple - runs `pnpm tsc --noEmit` on TypeScript file changes |
| `/tmp/package/cli/hooks/lint-changed.ts` | Runs Biome and/or ESLint on changed files, detects which linters are available |
| `/tmp/package/cli/hooks/check-any-changed.ts` | Scans TypeScript files for forbidden `any` types using regex |
| `/tmp/package/cli/hooks/test-changed.ts` | (File not found - may not be used or named differently) |
| `/tmp/package/cli/hooks/create-checkpoint.ts` | Creates git stash checkpoints with timestamps, manages max checkpoint count |
| `/tmp/package/cli/hooks/check-todos.ts` | Parses Claude transcript to find incomplete todos, blocks stop if any remain |
| `/tmp/package/cli/hooks/thinking-level.ts` | Injects thinking level keywords (think/megathink/ultrathink) based on config |
| `/tmp/package/cli/hooks/base.ts` | Base class providing common utilities: exec, file operations, skip conditions |
| `/tmp/package/cli/hooks/sensitive-patterns.ts` | Default patterns for protecting sensitive files (.env, .key, .pem, etc.) |

## 3) Codebase Map

- **Primary components/modules:**
  - `.claude/settings.json` - Hook configuration (9 hooks total)
  - `.claude/scripts/` - Existing local scripts directory (has `check-docs-changed.sh`)
  - `.claude/README.md` - Documentation referencing ClaudeKit

- **Hooks currently configured:**
  | Event | Hook | Purpose |
  |-------|------|---------|
  | PreToolUse | file-guard | Block access to sensitive files |
  | PostToolUse | typecheck-changed | Run TypeScript type checking |
  | PostToolUse | lint-changed | Run Biome/ESLint linting |
  | PostToolUse | check-any-changed | Forbid `any` types |
  | PostToolUse | test-changed | Run tests for changed files |
  | Stop | create-checkpoint | Git stash auto-save |
  | Stop | check-todos | Block if todos incomplete |
  | Stop | check-docs-changed (local) | Already a local script! |
  | UserPromptSubmit | thinking-level | Inject thinking keywords |

- **Shared dependencies:**
  - All hooks read JSON payload from stdin
  - All hooks output to stderr for messages, stdout for JSON responses
  - Many hooks detect package manager (npm/yarn/pnpm)
  - Many hooks find project root via git

- **Data flow:**
  1. Claude Code triggers hook event
  2. Claude Code pipes JSON payload to hook command's stdin
  3. Hook executes, outputs messages to stderr
  4. Hook exits with code (0=success, 2=blocking error)
  5. Optional: Hook outputs JSON to stdout for structured responses

- **Feature flags/config:**
  - `.claudekit/config.json` - ClaudeKit-specific config (not present in this project)
  - Hooks can be configured per-hook in the config
  - This project uses default configurations

- **Potential blast radius:**
  - `.claude/settings.json` - Hook command paths
  - `.claude/README.md` - Documentation
  - `.claude/commands/system/*.md` - Reference ClaudeKit in docs
  - `specs/migrate-stm-to-builtin-tasks/` - References `claudekit status stm`
  - Various command files - Reference ClaudeKit

## 4) Root Cause Analysis

N/A - This is a migration/feature task, not a bug fix.

## 5) Research

### ClaudeKit Overview

ClaudeKit (v0.9.4) is an npm package providing:
- A hook execution system (`claudekit-hooks` CLI)
- Pre-built hooks for common validations
- Setup and configuration utilities

The `claudekit-hooks run <hook-name>` command:
1. Reads JSON payload from stdin
2. Finds project root
3. Detects package manager
4. Runs the specified hook
5. Outputs results (stderr for messages, stdout for JSON)

### ClaudeFlow Overview

ClaudeFlow (v1.2.0) is a separate package that depends on ClaudeKit. This project appears to only use ClaudeKit directly.

### Potential Solutions

#### Solution 1: Node.js Scripts (Recommended)

**Pros:**
- Can directly port ClaudeKit's TypeScript logic
- Full access to Node.js ecosystem
- Handles complex parsing (file-guard needs bash command parsing)
- Consistent with existing project tech stack (Next.js/TypeScript)
- Can be type-checked with the rest of the project

**Cons:**
- Requires `node` in PATH (already required for project)
- More code than shell scripts
- Needs to handle JSON stdin parsing

#### Solution 2: Shell Scripts (Simpler cases only)

**Pros:**
- No dependencies
- Simple and portable
- Easy to understand and modify

**Cons:**
- Complex logic (like file-guard) is very difficult in shell
- JSON parsing is awkward
- Harder to maintain for complex hooks

#### Solution 3: Hybrid Approach (Best of both)

**Pros:**
- Use shell scripts for simple hooks (typecheck, lint)
- Use Node.js for complex hooks (file-guard, check-any)
- Minimizes code while handling complexity

**Cons:**
- Mixed implementation languages
- Need to maintain both

### Recommendation: Hybrid Approach

Use **shell scripts** for hooks that are essentially command wrappers:
- `typecheck-changed` - Just runs `pnpm tsc --noEmit`
- `lint-changed` - Just runs `pnpm biome check`
- `test-changed` - Just runs `pnpm vitest related`
- `create-checkpoint` - Git commands
- `thinking-level` - Simple JSON output

Use **Node.js scripts** for hooks with complex logic:
- `file-guard` - Needs bash command parsing and gitignore matching
- `check-any-changed` - Needs AST-like string parsing

Use **existing** local script:
- `check-docs-changed` - Already implemented!
- `check-todos` - Parses transcript, but simple enough for shell or Node.js

## 6) Clarification (Resolved)

| Question | Decision | Rationale |
|----------|----------|-----------|
| Thinking level configuration | **New config file** (`.claude/hooks-config.json`) | Provides flexibility to adjust thinking level without code changes |
| File guard ignore patterns | **Settings.json only** | Already configured, simpler implementation, no need for additional ignore files |
| Test changed command | Use `pnpm vitest related` | Project uses Vitest; skip if no test framework detected |
| Create checkpoint behavior | **Keep as git stashes** | Current behavior is useful for recovery; maintains 10 checkpoint limit |
| Check todos hook | **Skip this hook** | Let Claude manage its own todos; reduces complexity |

---

## Summary of Hooks to Implement

| Hook | Approach | Complexity | Dependencies | Notes |
|------|----------|------------|--------------|-------|
| file-guard | Node.js | High | `ignore` npm package | Complex bash parsing for sensitive file detection |
| typecheck-changed | Shell | Low | pnpm, tsc | Simple wrapper |
| lint-changed | Shell | Low | pnpm, biome | Simple wrapper |
| check-any-changed | Node.js | Medium | None | Regex parsing for `any` types |
| test-changed | Shell | Low | pnpm, vitest | Simple wrapper |
| create-checkpoint | Shell | Low | git | Git stash management |
| ~~check-todos~~ | ~~Skipped~~ | - | - | **Removed per user decision** |
| check-docs-changed | Shell | Low | Already exists! | No changes needed |
| thinking-level | Shell | Medium | None | Reads config file, outputs JSON |

## Files to Create

```
.claude/
├── hooks-config.json           # NEW: Hook configuration (thinking-level, etc.)
└── scripts/
    └── hooks/
        ├── file-guard.mjs          # Node.js - complex bash parsing
        ├── typecheck-changed.sh    # Shell - simple tsc wrapper
        ├── lint-changed.sh         # Shell - biome/eslint wrapper
        ├── check-any-changed.mjs   # Node.js - regex parsing
        ├── test-changed.sh         # Shell - vitest wrapper
        ├── create-checkpoint.sh    # Shell - git stash
        └── thinking-level.sh       # Shell - reads config, outputs JSON
```

Note: `check-docs-changed.sh` already exists and will be kept as-is.

## Files to Update

1. `.claude/settings.json` - Change hook commands from `claudekit-hooks run X` to `.claude/scripts/hooks/X.sh` or `.mjs`
2. `.claude/settings.json` - Remove `check-todos` hook from Stop event
3. `.claude/README.md` - Remove ClaudeKit references, document local hooks
4. Various command files - Remove `claudekit` references

## Configuration File

Create `.claude/hooks-config.json`:

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

## Dependencies

Add to `package.json` devDependencies:
- `ignore` - For gitignore-style pattern matching in file-guard hook

## Migration Notes

1. **No breaking changes** - All existing functionality preserved (except check-todos removal)
2. **No global installs required** - Everything runs from project directory
3. **Portable** - Clone repo and hooks work immediately
4. **Testable** - Can test hooks locally without Claude Code
