#!/usr/bin/env bash
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
