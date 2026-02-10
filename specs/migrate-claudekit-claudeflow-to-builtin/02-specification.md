---
slug: migrate-claudekit-claudeflow-to-builtin
---

# Specification: Migrate ClaudeKit Hooks to Built-in Scripts

## Overview

Replace all external ClaudeKit dependencies with self-contained local scripts. This migration eliminates the need for globally-installed npm packages while maintaining all existing hook functionality (except check-todos, which is being removed per user decision).

### Goals

1. **Remove external dependency** - No more `npm install -g claudekit` requirement
2. **Maintain functionality** - All existing hooks work identically
3. **Improve portability** - Clone repo and hooks work immediately
4. **Simplify maintenance** - All hook code lives in the repository

### Non-Goals

- Adding new hook functionality
- Changing the hook configuration format
- Performance optimization
- Supporting additional ignore file formats (.agentignore, etc.)

## Technical Design

### Architecture Decision: Hybrid Approach

Use **shell scripts** for simple command wrappers and **Node.js scripts** for complex logic:

| Hook | Implementation | Rationale |
|------|---------------|-----------|
| `file-guard` | Node.js (.mjs) | Complex bash command parsing, gitignore pattern matching |
| `check-any-changed` | Node.js (.mjs) | Regex parsing with string/comment stripping |
| `typecheck-changed` | Shell (.sh) | Simple `pnpm tsc --noEmit` wrapper |
| `lint-changed` | Shell (.sh) | Simple `pnpm biome check` wrapper |
| `test-changed` | Shell (.sh) | Simple `pnpm vitest related` wrapper |
| `create-checkpoint` | Shell (.sh) | Git stash commands |
| `thinking-level` | Shell (.sh) | JSON config read + output |

### Directory Structure

```
.claude/
├── hooks-config.json              # NEW: Hook configuration
├── settings.json                  # MODIFIED: Point to local scripts
├── README.md                      # MODIFIED: Remove ClaudeKit references
└── scripts/
    ├── check-docs-changed.sh      # EXISTING: No changes
    └── hooks/                     # NEW: Directory for hook scripts
        ├── file-guard.mjs
        ├── check-any-changed.mjs
        ├── typecheck-changed.sh
        ├── lint-changed.sh
        ├── test-changed.sh
        ├── create-checkpoint.sh
        └── thinking-level.sh
```

### Hook Input/Output Protocol

All hooks follow Claude Code's hook protocol:

**Input (stdin):**
```json
{
  "tool_name": "Write|Edit|Bash|Read",
  "tool_input": {
    "file_path": "/path/to/file.ts",
    "command": "some bash command"
  },
  "transcript_path": "/path/to/transcript.jsonl",
  "session_id": "abc123"
}
```

**Output:**
- **stderr**: Progress messages, errors (shown to user)
- **stdout**: JSON responses (for structured control)
- **Exit code 0**: Success
- **Exit code 2**: Blocking error (prevents tool execution)

### Configuration File

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

## Implementation Phases

### Phase 1: Create Hook Scripts Directory

1. Create `.claude/scripts/hooks/` directory
2. Create `.claude/hooks-config.json` with default values

### Phase 2: Implement Shell Script Hooks

#### 2.1: typecheck-changed.sh

```bash
#!/bin/bash
# Runs TypeScript type checking on changed .ts/.tsx files

# Read JSON from stdin
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8')); console.log(d.tool_input?.file_path || '')")

# Skip if not a TypeScript file
if [[ ! "$FILE_PATH" =~ \.(ts|tsx)$ ]]; then
  exit 0
fi

echo "📘 Type-checking $FILE_PATH" >&2

# Run TypeScript compiler
if ! pnpm tsc --noEmit 2>&1; then
  echo "❌ TypeScript compilation failed" >&2
  exit 2
fi

echo "✅ TypeScript check passed!" >&2
exit 0
```

#### 2.2: lint-changed.sh

```bash
#!/bin/bash
# Runs Biome linting on changed files

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8')); console.log(d.tool_input?.file_path || '')")

# Skip if not a lintable file
if [[ ! "$FILE_PATH" =~ \.(ts|tsx|js|jsx)$ ]]; then
  exit 0
fi

echo "🔍 Running Biome on $FILE_PATH..." >&2

if ! pnpm biome check "$FILE_PATH" 2>&1; then
  echo "❌ Biome check failed" >&2
  exit 2
fi

echo "✅ Biome check passed!" >&2
exit 0
```

#### 2.3: test-changed.sh

```bash
#!/bin/bash
# Runs tests related to changed files

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8')); console.log(d.tool_input?.file_path || '')")

# Skip if not a TypeScript/JavaScript file
if [[ ! "$FILE_PATH" =~ \.(ts|tsx|js|jsx)$ ]]; then
  exit 0
fi

# Skip if file is a test file itself
if [[ "$FILE_PATH" =~ \.(test|spec)\.(ts|tsx|js|jsx)$ ]]; then
  exit 0
fi

# Check if vitest is available
if ! command -v pnpm &> /dev/null || ! pnpm vitest --version &> /dev/null 2>&1; then
  exit 0  # Skip silently if no test framework
fi

echo "🧪 Running tests related to $FILE_PATH..." >&2

if ! pnpm vitest related "$FILE_PATH" --run --passWithNoTests 2>&1; then
  echo "❌ Tests failed" >&2
  exit 2
fi

echo "✅ Tests passed!" >&2
exit 0
```

#### 2.4: create-checkpoint.sh

```bash
#!/bin/bash
# Creates git stash checkpoint on stop

# Read config
CONFIG_FILE=".claude/hooks-config.json"
PREFIX="claude"
MAX_CHECKPOINTS=10

if [ -f "$CONFIG_FILE" ]; then
  PREFIX=$(node -e "const c=require('./$CONFIG_FILE'); console.log(c['create-checkpoint']?.prefix || 'claude')" 2>/dev/null || echo "claude")
  MAX_CHECKPOINTS=$(node -e "const c=require('./$CONFIG_FILE'); console.log(c['create-checkpoint']?.maxCheckpoints || 10)" 2>/dev/null || echo "10")
fi

# Check for changes
if [ -z "$(git status --porcelain 2>/dev/null)" ]; then
  exit 0  # No changes, exit silently
fi

# Create checkpoint
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
MESSAGE="${PREFIX}-checkpoint: Auto-save at ${TIMESTAMP}"

# Add all files and create stash
git add -A
STASH_SHA=$(git stash create "$MESSAGE")

if [ -n "$STASH_SHA" ]; then
  git stash store -m "$MESSAGE" "$STASH_SHA"
  git reset  # Unstage files

  # Clean up old checkpoints
  CHECKPOINT_COUNT=$(git stash list | grep -c "${PREFIX}-checkpoint" || echo "0")
  if [ "$CHECKPOINT_COUNT" -gt "$MAX_CHECKPOINTS" ]; then
    # Drop oldest checkpoints
    git stash list | grep "${PREFIX}-checkpoint" | tail -n +$((MAX_CHECKPOINTS + 1)) | while read -r line; do
      INDEX=$(echo "$line" | grep -o 'stash@{[0-9]*}')
      git stash drop "$INDEX" 2>/dev/null
    done
  fi
fi

exit 0
```

#### 2.5: thinking-level.sh

```bash
#!/bin/bash
# Injects thinking level keywords based on configuration

CONFIG_FILE=".claude/hooks-config.json"
LEVEL=2  # Default to megathink

if [ -f "$CONFIG_FILE" ]; then
  LEVEL=$(node -e "const c=require('./$CONFIG_FILE'); console.log(c['thinking-level']?.level ?? 2)" 2>/dev/null || echo "2")
fi

# Map level to keyword
case "$LEVEL" in
  0) KEYWORD="" ;;
  1) KEYWORD="think" ;;
  2) KEYWORD="megathink" ;;
  3) KEYWORD="ultrathink" ;;
  *) KEYWORD="megathink" ;;
esac

# Output JSON response if keyword is set
if [ -n "$KEYWORD" ]; then
  cat << EOF
{"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"$KEYWORD"}}
EOF
fi

exit 0
```

### Phase 3: Implement Node.js Hooks

#### 3.1: file-guard.mjs

A Node.js script that:
1. Reads JSON payload from stdin
2. Extracts file paths from tool_input (for Read/Write/Edit) or command (for Bash)
3. Checks paths against deny patterns from settings.json
4. Returns allow/deny decision as JSON

Key features:
- Parse bash commands to extract file paths
- Support gitignore-style patterns using the `ignore` npm package
- Handle both absolute and relative paths
- Detect sensitive pipeline patterns (find | xargs | cat)

#### 3.2: check-any-changed.mjs

A Node.js script that:
1. Reads JSON payload from stdin
2. Extracts file path
3. Reads file content
4. Strips strings and comments to avoid false positives
5. Scans for forbidden `any` type patterns
6. Reports errors with line numbers

### Phase 4: Update settings.json

Replace all `claudekit-hooks run X` commands with local script paths:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Read|Edit|MultiEdit|Write|Bash",
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/scripts/hooks/file-guard.mjs"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/scripts/hooks/typecheck-changed.sh"
          },
          {
            "type": "command",
            "command": ".claude/scripts/hooks/lint-changed.sh"
          },
          {
            "type": "command",
            "command": "node .claude/scripts/hooks/check-any-changed.mjs"
          },
          {
            "type": "command",
            "command": ".claude/scripts/hooks/test-changed.sh"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": ".claude/scripts/hooks/create-checkpoint.sh"
          },
          {
            "type": "command",
            "command": ".claude/scripts/check-docs-changed.sh"
          }
        ]
      }
    ],
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": ".claude/scripts/hooks/thinking-level.sh"
          }
        ]
      }
    ]
  }
}
```

**Note:** `check-todos` hook is removed from Stop event per user decision.

### Phase 5: Update Documentation

1. **`.claude/README.md`**: Remove ClaudeKit references, document local hooks
2. **`.claude/commands/system/*.md`**: Remove `claudekit` references
3. **`CLAUDE.md`**: Update hooks documentation if needed

### Phase 6: Clean Up Other References

Search and remove `claudekit` references from:
- `specs/migrate-stm-to-builtin-tasks/` files
- Any other command files that reference claudekit

## Dependencies

### New Package

Add to `package.json` devDependencies:
```json
{
  "ignore": "^6.0.0"
}
```

The `ignore` package provides gitignore-style pattern matching for the file-guard hook.

## Testing Strategy

### Manual Testing

For each hook:

1. **typecheck-changed**: Edit a `.ts` file with a type error → should block
2. **lint-changed**: Edit a file with lint errors → should block
3. **check-any-changed**: Add `any` type to a `.ts` file → should block
4. **test-changed**: Edit code that breaks a test → should block
5. **file-guard**: Try to read `.env` file → should deny
6. **create-checkpoint**: Make changes, stop session → should create stash
7. **thinking-level**: Start session → should inject megathink keyword

### Verification Commands

```bash
# Test file-guard
echo '{"tool_name":"Read","tool_input":{"file_path":".env"}}' | node .claude/scripts/hooks/file-guard.mjs

# Test typecheck-changed
echo '{"tool_input":{"file_path":"src/app/page.tsx"}}' | .claude/scripts/hooks/typecheck-changed.sh

# Test thinking-level
echo '{}' | .claude/scripts/hooks/thinking-level.sh
```

## Rollback Plan

If issues arise:
1. Revert `.claude/settings.json` to use `claudekit-hooks` commands
2. Delete `.claude/scripts/hooks/` directory
3. Delete `.claude/hooks-config.json`

ClaudeKit remains installed globally and can be used immediately.

## Success Criteria

1. All 7 hooks execute successfully with local scripts
2. No `claudekit` or `claudeflow` strings in `.claude/` directory (except specs)
3. Clone fresh repo → hooks work without any global installs
4. Same behavior as before for all preserved hooks
5. `check-todos` hook removed from configuration

## Open Questions (Resolved)

1. ~~**Should we add the `ignore` package as a dev dependency or bundle it?**~~ (RESOLVED)
   **Answer:** Add as devDependency
   **Rationale:** Standard npm approach, auto-updates, maintainable

   Original context preserved:
   - Option A: Add as devDependency (simpler, standard approach)
   - Option B: Bundle the code inline (no dependency, but more code)
   - Recommendation: Option A - standard npm dependency

2. ~~**Should shell scripts use `#!/bin/bash` or `#!/usr/bin/env bash`?**~~ (RESOLVED)
   **Answer:** `#!/usr/bin/env bash`
   **Rationale:** More portable across different systems (macOS, Linux, NixOS)

   Original context preserved:
   - Option A: `#!/bin/bash` (simpler, works on most systems)
   - Option B: `#!/usr/bin/env bash` (more portable across systems)
   - Recommendation: Option B - more portable

## Timeline Estimate

| Phase | Estimated Effort |
|-------|------------------|
| Phase 1: Directory setup | 5 min |
| Phase 2: Shell scripts (5) | 1 hour |
| Phase 3: Node.js scripts (2) | 2 hours |
| Phase 4: Update settings.json | 15 min |
| Phase 5: Update documentation | 30 min |
| Phase 6: Clean up references | 30 min |
| Testing | 1 hour |
| **Total** | **~5-6 hours** |
