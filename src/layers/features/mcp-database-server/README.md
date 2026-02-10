# MCP Database Server

A development-only Model Context Protocol (MCP) server that provides AI agents with controlled access to your database. This allows AI assistants like Claude to query and manipulate your database during development.

**Supports both PostgreSQL and SQLite** - the server automatically detects which database you're using from your `DATABASE_URL` and adapts its queries accordingly.

## Features

- **Multi-database support**: Works with both PostgreSQL and SQLite
- **Automatic detection**: Detects database type from connection string
- **Development-only**: Automatically disabled in production environments
- **Localhost-only**: Rejects requests from non-local sources
- **SQL validation**: Prevents dangerous DDL operations (DROP, ALTER, etc.)
- **Row limits**: Automatic limiting of query results (default 200, max 2000)
- **Audit logging**: All operations are logged with timestamps and details
- **Mutation reasoning**: Requires explanations for data modifications

## Available Tools

1. **`health`** - Check server status and configuration
2. **`get_schema_overview`** - List all tables with structure and row counts
3. **`get_table_details`** - Detailed information about a specific table
4. **`execute_sql_select`** - Run SELECT queries (read-only)
5. **`execute_sql_mutation`** - Execute INSERT/UPDATE/DELETE operations
6. **`explain_query`** - Get PostgreSQL query execution plans
7. **`validate_sql`** - Check SQL syntax without executing

## Installation

### 1. Install Dependencies

```bash
npm install mcp-handler@^1.0.1 @modelcontextprotocol/sdk@^1.17.2 zod@^3
```

### 2. Copy Feature Module

Copy the entire `mcp-database-server` feature folder to your project's features directory:

```
src/features/mcp-database-server/
├── api/
│   ├── server.ts         # Main MCP server implementation
│   └── handlers.ts       # Tool handler implementations
├── lib/
│   ├── sql-parser.ts     # SQL validation and parsing
│   ├── logging.ts        # Audit logging utilities
│   └── security.ts       # Access control utilities
├── config/
│   └── constants.ts      # Configuration constants
├── index.ts              # Public API exports
└── README.md            # This file
```

### 3. Create API Route

Create a Next.js API route at `src/app/api/mcp/[transport]/route.ts`:

```typescript
import { createMcpServer } from '@/features/mcp-database-server';

const handler = createMcpServer();

export const GET = handler;
export const POST = handler;
```

### 4. Configure Environment Variables

Add these to your `.env.local` file:

```bash
# Required to enable MCP server
MCP_DEV_ONLY_DB_ACCESS=true

# Optional configuration
MCP_DEFAULT_LIMIT=200        # Default row limit for SELECT queries
MCP_MAX_ROWS=2000           # Maximum allowed rows
MCP_STMT_TIMEOUT_MS=10000   # Query timeout in milliseconds
```

### 5. Update TypeScript Configuration (if needed)

Ensure your `tsconfig.json` includes proper path aliases:

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

### 6. Configure T3 Env (Optional but Recommended)

If using T3 Env for type-safe environment variables, add to your env configuration:

```typescript
// src/env.ts
export const env = createEnv({
  server: {
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
  }
});
```

## Database Requirements

This server requires:
- **PostgreSQL** or **SQLite** database
- Prisma ORM configured and initialized
- Access to `prisma` client instance

### Database Detection

The server automatically detects your database type from `DATABASE_URL`:

| URL Pattern | Database Type |
|-------------|---------------|
| `file:./path/to/db.sqlite` | SQLite |
| `*.db` or `*.sqlite` | SQLite |
| `postgresql://...` or `postgres://...` | PostgreSQL |

### Prisma Setup

Ensure you have Prisma 7 configured with the appropriate driver adapter:

**For SQLite:**
```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@/generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./.data/dev.db',
});
export const prisma = new PrismaClient({ adapter });
```

**For PostgreSQL:**
```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
export const prisma = new PrismaClient({ adapter });
```

## Usage with Claude Desktop

### 1. Configure Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

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

### 2. Start Your Development Server

```bash
npm run dev
```

### 3. Restart Claude Desktop

After configuration, restart Claude Desktop to load the MCP server.

### 4. Verify Connection

In Claude, you should see your MCP server listed in the available tools. Test with:
- "Check the health of the database connection"
- "Show me the database schema"
- "List all tables in the database"

## Security Considerations

### Built-in Protections

1. **Environment Check**: Only runs when `NODE_ENV === 'development'`
2. **Feature Flag**: Requires explicit `MCP_DEV_ONLY_DB_ACCESS=true`
3. **Localhost Validation**: Checks request headers for local origin
4. **SQL Parsing**: Blocks dangerous operations (DROP, TRUNCATE, ALTER, etc.)
5. **Row Limits**: Prevents excessive data retrieval
6. **Timeout Protection**: Queries timeout after configured duration
7. **Sensitive Data Redaction**: Passwords, tokens, and PII are redacted in logs

### Forbidden Operations

The following SQL operations are blocked:
- `CREATE/ALTER/DROP` (TABLE, DATABASE, SCHEMA, etc.)
- `TRUNCATE TABLE`
- `GRANT/REVOKE`
- `COPY ... FROM/TO PROGRAM` (command execution)
- `EXECUTE` (dynamic SQL)
- `SET/RESET ROLE`
- Extension management commands

### Best Practices

1. **Never enable in production** - The server will refuse to start
2. **Don't commit `.env.local`** - Keep MCP_DEV_ONLY_DB_ACCESS local
3. **Review mutations** - All mutations require a reason parameter
4. **Monitor logs** - Check console output for audit trail
5. **Use parameterized queries** - Pass parameters separately from SQL

## Customization

### Adding Custom Tools

Add new tools in `api/handlers.ts`:

```typescript
export function registerCustomTools(server: any) {
  server.tool(
    'my_custom_tool',
    'Description of what it does',
    {
      // Zod schema for parameters
      param1: z.string().describe('Parameter description'),
    },
    async ({ param1 }) => {
      // Implementation
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }]
      };
    }
  );
}
```

### Modifying SQL Restrictions

Edit `lib/sql-parser.ts` to adjust SQL validation rules:

```typescript
// Add to ALLOWED_DML array for new statement types
const ALLOWED_DML = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'YOUR_TYPE'];

// Add to dangerousPatterns for additional blocks
const dangerousPatterns = [
  // ... existing patterns
  /\bYOUR_PATTERN\b/i,
];
```

### Changing Row Limits

Modify defaults in `config/constants.ts`:

```typescript
export const MCP_CONFIG = {
  DEFAULT_LIMIT: 200,
  MAX_ROWS: 2000,
  STATEMENT_TIMEOUT_MS: 10000,
};
```

## Troubleshooting

### "MCP database access is disabled"

- Ensure `MCP_DEV_ONLY_DB_ACCESS=true` is in `.env.local`
- Restart your Next.js development server
- Verify you're running in development mode

### "Access denied: localhost only"

- Check you're accessing from localhost/127.0.0.1
- Verify no proxy is modifying request headers
- Ensure you're not accessing through a tunnel service

### "Not a SELECT statement" error

- Check your SQL syntax
- Ensure the query starts with SELECT (or WITH for CTEs)
- Remove any semicolons at the beginning

### Connection Issues with Claude

- Verify your development server is running
- Check the URL in Claude Desktop config matches your server
- Restart Claude Desktop after config changes
- Check browser console for CORS errors

## Testing

### Manual Testing Script

Create `scripts/test-mcp.js`:

```javascript
async function testMCP() {
  const response = await fetch('http://localhost:3000/api/mcp/http', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: 'health',
        arguments: {}
      },
      id: 1
    })
  });
  
  const result = await response.json();
  console.log('MCP Health Check:', result);
}

testMCP();
```

## Migration from Inline Implementation

If migrating from an inline implementation:

1. Move SQL parser logic to `lib/sql-parser.ts`
2. Move logging utilities to `lib/logging.ts`
3. Move security checks to `lib/security.ts`
4. Move tool implementations to `api/handlers.ts`
5. Update imports in your route file
6. Test all tools still function correctly

## License

This MCP server implementation is designed for development use only. Ensure you understand the security implications before using it with sensitive data.

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review security considerations
3. Ensure all dependencies are installed
4. Verify environment configuration

## Additional Resources

- [MCP Documentation](https://modelcontextprotocol.io/)
- [mcp-handler npm package](https://www.npmjs.com/package/mcp-handler)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)