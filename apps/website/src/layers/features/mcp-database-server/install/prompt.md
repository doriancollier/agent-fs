# MCP Database Server Installation Instructions

You have been provided with the MCP database server feature module in `/src/features/mcp-database-server/`. Please complete the installation by following these steps:

## 1. Install Required Dependencies

Install the necessary npm packages:

```bash
npm install mcp-handler@^1.0.1 @modelcontextprotocol/sdk@^1.17.2 zod@^3
```

## 2. Create API Route

Create the API route handler at `src/app/api/mcp/[transport]/route.ts`:

```typescript
/**
 * MCP Database Server API Route
 *
 * This is a thin route handler that delegates all functionality
 * to the MCP database server feature module.
 *
 * The MCP server provides development-only database access for AI agents.
 */

import { createMcpServer } from '@/features/mcp-database-server';

// Create the MCP server handler
const handler = createMcpServer();

// Export handlers for Next.js API route
export const GET = handler;
export const POST = handler;
```

## 3. Configure Environment Variables

Add the following to your `.env.local` file (create it if it doesn't exist):

```bash
# Enable MCP database access (required)
MCP_DEV_ONLY_DB_ACCESS=true

# Optional configuration (defaults shown)
MCP_DEFAULT_LIMIT=200        # Default row limit for SELECT queries
MCP_MAX_ROWS=2000           # Maximum allowed rows
MCP_STMT_TIMEOUT_MS=10000   # Query timeout in milliseconds
```

## 4. Verify Prisma Setup

Ensure you have Prisma configured in your project. Check for the existence of:

1. **Prisma Client**: Look for `src/lib/prisma.ts` or similar. If it doesn't exist, create it:

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

2. **Prisma Schema**: Verify `prisma/schema.prisma` exists and is configured for PostgreSQL
3. **Database Connection**: Ensure `DATABASE_URL` is set in your `.env.local` file

## 5. Update TypeScript Configuration (if needed)

Verify your `tsconfig.json` includes the proper path alias for features:

```json
{
  "compilerOptions": {
    "paths": {
      "@/features/*": ["src/features/*"],
      "@/*": ["src/*"]
    }
  }
}
```

## 6. (Optional) Configure T3 Env

If your project uses T3 Env for type-safe environment variables, add these to your env configuration file (usually `src/env.ts` or `src/env.mjs`):

```typescript
// Add to your env schema
export const env = createEnv({
  server: {
    // ... existing config
    MCP_DEV_ONLY_DB_ACCESS: z
      .string()
      .optional()
      .transform((val) => val === 'true'),
    MCP_DEFAULT_LIMIT: z
      .string()
      .optional()
      .default('200')
      .transform((val) => parseInt(val, 10)),
    MCP_MAX_ROWS: z
      .string()
      .optional()
      .default('2000')
      .transform((val) => parseInt(val, 10)),
    MCP_STMT_TIMEOUT_MS: z
      .string()
      .optional()
      .default('10000')
      .transform((val) => parseInt(val, 10)),
  },
  // Add to runtimeEnv if using T3 Env v3+
  runtimeEnv: {
    // ... existing runtime env
    MCP_DEV_ONLY_DB_ACCESS: process.env.MCP_DEV_ONLY_DB_ACCESS,
    MCP_DEFAULT_LIMIT: process.env.MCP_DEFAULT_LIMIT,
    MCP_MAX_ROWS: process.env.MCP_MAX_ROWS,
    MCP_STMT_TIMEOUT_MS: process.env.MCP_STMT_TIMEOUT_MS,
  },
});
```

## 7. Test the Installation

1. **Start your development server**:

```bash
npm run dev
```

2. **Test the health endpoint** using curl or your browser:

```bash
curl -X POST http://localhost:3000/api/mcp/http \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "health",
      "arguments": {}
    },
    "id": 1
  }'
```

You should receive a response indicating the MCP server is healthy.

## 8. (Optional) Configure Claude Desktop

If you want to use this with Claude Desktop, add to your Claude Desktop configuration:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
**Linux**: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "your-project-db": {
      "command": "npx",
      "args": ["mcp-server-http", "http://localhost:3000/api/mcp"],
      "env": {}
    }
  }
}
```

After updating the config, restart Claude Desktop.

## Troubleshooting

### Common Issues and Solutions:

1. **"MCP database access is disabled"**
   - Ensure `MCP_DEV_ONLY_DB_ACCESS=true` is in `.env.local`
   - Restart your development server after adding the environment variable

2. **"Cannot find module '@/features/mcp-database-server'"**
   - Check that the TypeScript path alias is configured correctly in `tsconfig.json`
   - Ensure the feature folder is in the correct location: `src/features/mcp-database-server/`

3. **"Cannot find module '@/lib/prisma'"**
   - Create the Prisma client file as shown in step 4
   - Run `npx prisma generate` if you haven't already

4. **"Access denied: localhost only"**
   - Ensure you're accessing from localhost/127.0.0.1
   - Check that no proxy or tunnel service is modifying request headers

5. **Database connection errors**
   - Verify `DATABASE_URL` is set correctly in `.env.local`
   - Ensure PostgreSQL is running and accessible
   - Run `npx prisma db push` or `npx prisma migrate dev` if needed

## Security Notes

⚠️ **IMPORTANT**: This MCP server is for DEVELOPMENT ONLY. It will refuse to run in production environments.

- Never set `MCP_DEV_ONLY_DB_ACCESS=true` in production
- The server only accepts connections from localhost
- All SQL operations are logged for auditing
- DDL operations (CREATE, DROP, ALTER, etc.) are blocked
- DML operations (INSERT, UPDATE, DELETE) require a reason

## Verification Checklist

After installation, verify:

- [ ] Dependencies installed (`mcp-handler`, `@modelcontextprotocol/sdk`, `zod`)
- [ ] API route created at `src/app/api/mcp/[transport]/route.ts`
- [ ] Environment variable `MCP_DEV_ONLY_DB_ACCESS=true` set in `.env`
- [ ] Prisma client available at `@/lib/prisma`
- [ ] TypeScript paths configured for `@/features/*`
- [ ] Development server running without errors
- [ ] Health check endpoint responding successfully
- [ ] (Optional) Claude Desktop configured and recognizing the MCP server

## Additional Resources

For more information about the MCP database server features and usage, see the README at:
`src/features/mcp-database-server/README.md`
