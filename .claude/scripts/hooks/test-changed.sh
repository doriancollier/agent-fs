#!/usr/bin/env bash
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
