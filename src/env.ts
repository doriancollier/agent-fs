import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    // Accepts both PostgreSQL URLs and SQLite file paths (file:./path/to/db.sqlite)
    DATABASE_URL: z.string().min(1),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

    // Authentication (BetterAuth)
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.string().url().optional(),

    // MCP Database Server (development only)
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
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    MCP_DEV_ONLY_DB_ACCESS: process.env.MCP_DEV_ONLY_DB_ACCESS,
    MCP_DEFAULT_LIMIT: process.env.MCP_DEFAULT_LIMIT,
    MCP_MAX_ROWS: process.env.MCP_MAX_ROWS,
    MCP_STMT_TIMEOUT_MS: process.env.MCP_STMT_TIMEOUT_MS,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  // Skip validation in edge cases
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
})
