/**
 * MCP Database Server Configuration Constants
 */

export const MCP_CONFIG = {
  // Default row limit for SELECT queries
  DEFAULT_LIMIT: 200,
  
  // Maximum allowed rows to return
  MAX_ROWS: 2000,
  
  // Statement timeout in milliseconds
  STATEMENT_TIMEOUT_MS: 10000,
  
  // Base path for the API route
  BASE_PATH: '/api/mcp',
} as const;

// SQL statement types
export const STATEMENT_TYPES = {
  SELECT: 'SELECT',
  INSERT: 'INSERT',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  CREATE: 'CREATE',
  ALTER: 'ALTER',
  DROP: 'DROP',
  TRUNCATE: 'TRUNCATE',
  GRANT: 'GRANT',
  REVOKE: 'REVOKE',
  UNKNOWN: 'UNKNOWN',
} as const;

export type StatementType = (typeof STATEMENT_TYPES)[keyof typeof STATEMENT_TYPES];

// Allowed DML operations
export const ALLOWED_DML = [
  STATEMENT_TYPES.SELECT,
  STATEMENT_TYPES.INSERT,
  STATEMENT_TYPES.UPDATE,
  STATEMENT_TYPES.DELETE,
] as const;

// Error messages
export const ERROR_MESSAGES = {
  NOT_DEVELOPMENT: 'MCP server is only available in development environment',
  NOT_ENABLED: 'MCP database access is disabled. Set MCP_DEV_ONLY_DB_ACCESS=true in your .env.local file to enable it.',
  NOT_LOCALHOST: 'MCP server only accepts requests from localhost',
  NOT_SELECT: 'Only SELECT statements are allowed',
  NOT_DML: 'Only INSERT, UPDATE, or DELETE statements are allowed',
  FORBIDDEN_DDL: 'SQL contains forbidden DDL or administrative commands',
  INVALID_SQL: 'No valid SQL statements found',
} as const;