# Implementation Tasks: Migrate ClaudeKit Hooks to Built-in Scripts

## Overview

This document breaks down the specification into atomic, actionable tasks. Each task is designed to be completable in a single focused session.

---

## Phase 1: Create Hook Scripts Directory and Configuration

### Task 1.1: Create hooks directory structure

**Description:** Create the new directory structure for local hook scripts.

**Files to create:**
- `.claude/scripts/hooks/` (directory)

**Acceptance criteria:**
- [ ] Directory `.claude/scripts/hooks/` exists
- [ ] Directory is tracked by git (not ignored)

**Estimated effort:** 2 minutes

---

### Task 1.2: Create hooks-config.json

**Description:** Create the configuration file that stores hook-specific settings (thinking level, checkpoint settings).

**Files to create:**
- `.claude/hooks-config.json`

**Content:**
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

**Acceptance criteria:**
- [ ] File exists at `.claude/hooks-config.json`
- [ ] File contains valid JSON
- [ ] Contains `thinking-level` section with `level: 2`
- [ ] Contains `create-checkpoint` section with `prefix` and `maxCheckpoints`

**Estimated effort:** 5 minutes

---

### Task 1.3: Add ignore package as devDependency

**Description:** Install the `ignore` npm package for gitignore-style pattern matching in file-guard hook.

**Files to modify:**
- `package.json`

**Commands:**
```bash
pnpm add -D ignore
```

**Acceptance criteria:**
- [ ] `ignore` package listed in devDependencies
- [ ] `pnpm-lock.yaml` updated
- [ ] Package version is ^6.0.0 or later

**Estimated effort:** 2 minutes

---

## Phase 2: Implement Shell Script Hooks

### Task 2.1: Create typecheck-changed.sh

**Description:** Create shell script that runs TypeScript type checking on changed `.ts/.tsx` files.

**Files to create:**
- `.claude/scripts/hooks/typecheck-changed.sh`

**Implementation details:**
- Read JSON from stdin, extract `tool_input.file_path`
- Skip if file is not `.ts` or `.tsx`
- Run `pnpm tsc --noEmit`
- Exit 2 on failure (blocking), exit 0 on success
- Use `#!/usr/bin/env bash` shebang

**Acceptance criteria:**
- [ ] Script exists and is executable (`chmod +x`)
- [ ] Reads JSON input from stdin correctly
- [ ] Only processes `.ts` and `.tsx` files
- [ ] Exits 0 for non-TypeScript files (skip)
- [ ] Exits 0 when typecheck passes
- [ ] Exits 2 when typecheck fails
- [ ] Outputs progress/result to stderr

**Manual test:**
```bash
echo '{"tool_input":{"file_path":"src/app/page.tsx"}}' | .claude/scripts/hooks/typecheck-changed.sh
```

**Estimated effort:** 15 minutes

---

### Task 2.2: Create lint-changed.sh

**Description:** Create shell script that runs Biome linting on changed files.

**Files to create:**
- `.claude/scripts/hooks/lint-changed.sh`

**Implementation details:**
- Read JSON from stdin, extract `tool_input.file_path`
- Skip if file is not `.ts`, `.tsx`, `.js`, or `.jsx`
- Run `pnpm biome check <file>`
- Exit 2 on failure, exit 0 on success
- Use `#!/usr/bin/env bash` shebang

**Acceptance criteria:**
- [ ] Script exists and is executable
- [ ] Reads JSON input from stdin correctly
- [ ] Only processes `.ts`, `.tsx`, `.js`, `.jsx` files
- [ ] Exits 0 for non-lintable files
- [ ] Exits 0 when lint passes
- [ ] Exits 2 when lint fails
- [ ] Outputs progress/result to stderr

**Manual test:**
```bash
echo '{"tool_input":{"file_path":"src/app/page.tsx"}}' | .claude/scripts/hooks/lint-changed.sh
```

**Estimated effort:** 15 minutes

---

### Task 2.3: Create test-changed.sh

**Description:** Create shell script that runs related tests for changed files using Vitest.

**Files to create:**
- `.claude/scripts/hooks/test-changed.sh`

**Implementation details:**
- Read JSON from stdin, extract `tool_input.file_path`
- Skip if file is not `.ts`, `.tsx`, `.js`, or `.jsx`
- Skip if file is itself a test file (`.test.*` or `.spec.*`)
- Check if vitest is available, skip silently if not
- Run `pnpm vitest related <file> --run --passWithNoTests`
- Exit 2 on failure, exit 0 on success
- Use `#!/usr/bin/env bash` shebang

**Acceptance criteria:**
- [ ] Script exists and is executable
- [ ] Reads JSON input from stdin correctly
- [ ] Only processes TypeScript/JavaScript files
- [ ] Skips test files themselves
- [ ] Gracefully handles missing vitest
- [ ] Exits 0 when tests pass or no related tests
- [ ] Exits 2 when tests fail
- [ ] Outputs progress/result to stderr

**Manual test:**
```bash
echo '{"tool_input":{"file_path":"src/app/page.tsx"}}' | .claude/scripts/hooks/test-changed.sh
```

**Estimated effort:** 15 minutes

---

### Task 2.4: Create create-checkpoint.sh

**Description:** Create shell script that creates git stash checkpoints when Claude stops.

**Files to create:**
- `.claude/scripts/hooks/create-checkpoint.sh`

**Implementation details:**
- Read config from `.claude/hooks-config.json` (prefix, maxCheckpoints)
- Check if there are uncommitted changes
- Create git stash with timestamp-based message
- Clean up old checkpoints exceeding maxCheckpoints
- Use `#!/usr/bin/env bash` shebang

**Acceptance criteria:**
- [ ] Script exists and is executable
- [ ] Reads config from hooks-config.json
- [ ] Falls back to defaults if config missing
- [ ] Does nothing if no uncommitted changes
- [ ] Creates stash with correct naming format
- [ ] Cleans up old checkpoints correctly
- [ ] Exits 0 on success

**Manual test:**
```bash
# Make a change first, then:
.claude/scripts/hooks/create-checkpoint.sh
git stash list  # Should see new checkpoint
```

**Estimated effort:** 20 minutes

---

### Task 2.5: Create thinking-level.sh

**Description:** Create shell script that injects thinking level keywords based on configuration.

**Files to create:**
- `.claude/scripts/hooks/thinking-level.sh`

**Implementation details:**
- Read level from `.claude/hooks-config.json`
- Map level to keyword: 0=none, 1=think, 2=megathink, 3=ultrathink
- Output JSON response with additionalContext
- Use `#!/usr/bin/env bash` shebang

**Acceptance criteria:**
- [ ] Script exists and is executable
- [ ] Reads level from hooks-config.json
- [ ] Falls back to level 2 if config missing
- [ ] Maps levels correctly to keywords
- [ ] Outputs valid JSON to stdout for non-zero levels
- [ ] Outputs nothing for level 0
- [ ] Exits 0

**Manual test:**
```bash
echo '{}' | .claude/scripts/hooks/thinking-level.sh
# Should output: {"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"megathink"}}
```

**Estimated effort:** 10 minutes

---

## Phase 3: Implement Node.js Hooks

### Task 3.1: Create file-guard.mjs

**Description:** Create Node.js script that enforces file access restrictions based on deny patterns.

**Files to create:**
- `.claude/scripts/hooks/file-guard.mjs`

**Implementation details:**
- Read JSON payload from stdin
- Extract file paths from:
  - `tool_input.file_path` for Read/Write/Edit tools
  - `tool_input.command` for Bash tool (parse file paths from command)
- Load deny patterns from `.claude/settings.json` denyFiles field
- Use `ignore` package for gitignore-style pattern matching
- Handle both absolute and relative paths
- Detect sensitive pipeline patterns (find | xargs | cat with sensitive files)
- Return JSON with decision (allow/deny)

**Acceptance criteria:**
- [ ] Script exists at `.claude/scripts/hooks/file-guard.mjs`
- [ ] Successfully reads JSON from stdin
- [ ] Extracts file paths from Read/Write/Edit operations
- [ ] Parses Bash commands to extract file paths
- [ ] Loads deny patterns from settings.json
- [ ] Correctly matches patterns using ignore package
- [ ] Blocks access to denied files (exit 2)
- [ ] Allows access to permitted files (exit 0)
- [ ] Handles relative and absolute paths
- [ ] Detects sensitive pipeline patterns

**Manual tests:**
```bash
# Should deny
echo '{"tool_name":"Read","tool_input":{"file_path":".env"}}' | node .claude/scripts/hooks/file-guard.mjs

# Should allow
echo '{"tool_name":"Read","tool_input":{"file_path":"src/app/page.tsx"}}' | node .claude/scripts/hooks/file-guard.mjs

# Bash with sensitive file
echo '{"tool_name":"Bash","tool_input":{"command":"cat .env"}}' | node .claude/scripts/hooks/file-guard.mjs
```

**Estimated effort:** 1.5 hours

---

### Task 3.2: Create check-any-changed.mjs

**Description:** Create Node.js script that detects forbidden `any` type usage in TypeScript files.

**Files to create:**
- `.claude/scripts/hooks/check-any-changed.mjs`

**Implementation details:**
- Read JSON payload from stdin
- Extract file path from `tool_input.file_path`
- Skip if not a `.ts` or `.tsx` file
- Read the file content
- Strip strings and comments to avoid false positives
- Scan for forbidden `any` patterns (`: any`, `as any`, `<any>`)
- Report errors with line numbers
- Exit 2 if violations found, exit 0 otherwise

**Acceptance criteria:**
- [ ] Script exists at `.claude/scripts/hooks/check-any-changed.mjs`
- [ ] Successfully reads JSON from stdin
- [ ] Only processes `.ts` and `.tsx` files
- [ ] Correctly strips string literals before scanning
- [ ] Correctly strips comments (single-line and multi-line)
- [ ] Detects `: any` patterns
- [ ] Detects `as any` patterns
- [ ] Detects `<any>` patterns
- [ ] Reports line numbers for violations
- [ ] Exits 2 when violations found
- [ ] Exits 0 when no violations

**Manual tests:**
```bash
# Create a test file with `any`, then:
echo '{"tool_input":{"file_path":"test-any.ts"}}' | node .claude/scripts/hooks/check-any-changed.mjs
```

**Estimated effort:** 45 minutes

---

## Phase 4: Update settings.json

### Task 4.1: Update hooks configuration in settings.json

**Description:** Replace all `claudekit-hooks run X` commands with local script paths.

**Files to modify:**
- `.claude/settings.json`

**Changes:**
1. Update PreToolUse hooks to use `node .claude/scripts/hooks/file-guard.mjs`
2. Update PostToolUse hooks to use local scripts:
   - `.claude/scripts/hooks/typecheck-changed.sh`
   - `.claude/scripts/hooks/lint-changed.sh`
   - `node .claude/scripts/hooks/check-any-changed.mjs`
   - `.claude/scripts/hooks/test-changed.sh`
3. Update Stop hooks:
   - `.claude/scripts/hooks/create-checkpoint.sh`
   - Keep `.claude/scripts/check-docs-changed.sh` (existing)
   - **Remove check-todos hook entirely**
4. Update UserPromptSubmit hooks to use `.claude/scripts/hooks/thinking-level.sh`

**Acceptance criteria:**
- [ ] No `claudekit-hooks` or `claudekit` strings in hooks configuration
- [ ] No `claudeflow` strings in hooks configuration
- [ ] PreToolUse uses file-guard.mjs
- [ ] PostToolUse uses all 4 local scripts
- [ ] Stop uses create-checkpoint.sh and check-docs-changed.sh (no check-todos)
- [ ] UserPromptSubmit uses thinking-level.sh
- [ ] settings.json is valid JSON

**Estimated effort:** 15 minutes

---

## Phase 5: Update Documentation

### Task 5.1: Update .claude/README.md

**Description:** Remove ClaudeKit references and document the new local hooks system.

**Files to modify:**
- `.claude/README.md`

**Changes:**
- Remove any instructions about installing ClaudeKit globally
- Document the new `.claude/scripts/hooks/` directory
- Document `.claude/hooks-config.json` configuration options
- Explain how hooks work with local scripts
- Update any hook-related troubleshooting

**Acceptance criteria:**
- [ ] No `claudekit` or `claudeflow` strings in README.md
- [ ] Documents new hooks directory structure
- [ ] Documents hooks-config.json options
- [ ] Explains how to test hooks manually

**Estimated effort:** 20 minutes

---

### Task 5.2: Update CLAUDE.md hooks section

**Description:** Update the hooks documentation in CLAUDE.md if it references ClaudeKit.

**Files to modify:**
- `CLAUDE.md` (if needed)

**Changes:**
- Remove any ClaudeKit references
- Update hooks section to reflect local scripts
- Ensure hooks documentation is accurate

**Acceptance criteria:**
- [ ] No `claudekit` or `claudeflow` strings
- [ ] Hooks section accurately describes current implementation

**Estimated effort:** 10 minutes

---

### Task 5.3: Update command files that reference claudekit

**Description:** Search and update any `.claude/commands/` files that reference claudekit.

**Files to modify:**
- Any files in `.claude/commands/` containing `claudekit`

**Process:**
1. Search for files: `grep -r "claudekit" .claude/commands/`
2. Update each file found
3. Remove or update references

**Acceptance criteria:**
- [ ] No `claudekit` strings in any command files
- [ ] Commands still work correctly

**Estimated effort:** 15 minutes

---

## Phase 6: Clean Up References

### Task 6.1: Remove claudekit references from specs

**Description:** Clean up any claudekit references in spec files (except this migration spec itself).

**Files to check/modify:**
- `specs/migrate-stm-to-builtin-tasks/` files
- Any other spec files

**Process:**
1. Search: `grep -r "claudekit\|claudeflow" specs/`
2. Update references that are no longer accurate
3. Leave historical references in completed specs if they're just describing past state

**Acceptance criteria:**
- [ ] No actionable claudekit references in active specs
- [ ] Migration spec can reference claudekit (it's about the migration)

**Estimated effort:** 15 minutes

---

### Task 6.2: Final verification and cleanup

**Description:** Comprehensive search for any remaining claudekit/claudeflow references.

**Process:**
1. Search entire `.claude/` directory: `grep -r "claudekit\|claudeflow" .claude/`
2. Search root config files
3. Verify all hooks work with manual testing
4. Run the verification commands from the spec

**Acceptance criteria:**
- [ ] No `claudekit` strings in `.claude/` directory (except specs)
- [ ] No `claudeflow` strings anywhere
- [ ] All 7 hooks execute successfully
- [ ] Manual tests pass for each hook

**Verification commands:**
```bash
# Test file-guard
echo '{"tool_name":"Read","tool_input":{"file_path":".env"}}' | node .claude/scripts/hooks/file-guard.mjs

# Test typecheck-changed
echo '{"tool_input":{"file_path":"src/app/page.tsx"}}' | .claude/scripts/hooks/typecheck-changed.sh

# Test thinking-level
echo '{}' | .claude/scripts/hooks/thinking-level.sh
```

**Estimated effort:** 30 minutes

---

## Summary

| Phase | Tasks | Estimated Total |
|-------|-------|-----------------|
| Phase 1 | 3 tasks | 10 minutes |
| Phase 2 | 5 tasks | 1 hour 15 minutes |
| Phase 3 | 2 tasks | 2 hours 15 minutes |
| Phase 4 | 1 task | 15 minutes |
| Phase 5 | 3 tasks | 45 minutes |
| Phase 6 | 2 tasks | 45 minutes |
| **Total** | **16 tasks** | **~5.5 hours** |

## Task Execution Order

**Recommended order for dependencies:**

1. Task 1.3 (add ignore package) - needed for Task 3.1
2. Task 1.1 (create directory)
3. Task 1.2 (create config)
4. Tasks 2.1-2.5 (shell scripts - can be done in parallel)
5. Tasks 3.1-3.2 (Node.js scripts - can be done in parallel)
6. Task 4.1 (update settings.json) - after all scripts created
7. Tasks 5.1-5.3 (documentation - can be done in parallel)
8. Tasks 6.1-6.2 (cleanup and verification - must be last)

## Success Criteria Summary

From the specification:

1. All 7 hooks execute successfully with local scripts
2. No `claudekit` or `claudeflow` strings in `.claude/` directory (except specs)
3. Clone fresh repo -> hooks work without any global installs
4. Same behavior as before for all preserved hooks
5. `check-todos` hook removed from configuration
