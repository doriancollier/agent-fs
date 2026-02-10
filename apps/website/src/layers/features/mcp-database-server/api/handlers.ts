/**
 * MCP Tool Handler Implementations
 *
 * Implements all database tools available through the MCP server.
 * Each tool performs specific database operations with appropriate
 * security checks and logging.
 *
 * Supports both PostgreSQL and SQLite databases through the query adapter.
 *
 * NOTE: This module requires direct Prisma access for raw SQL operations.
 * This is intentional and necessary for the MCP server functionality.
 */

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import {
  classifySQL,
  isSelectOnly,
  isDMLOnly,
  addLimitToSelect,
  validateSQLSyntax,
  redactSensitiveData,
} from '../lib/sql-parser';
import {
  logMCPOperation,
  logSQL,
  logAccessDenied,
  getTimestamp,
  measureDuration,
} from '../lib/logging';
import {
  isLocalhost,
  getRequestIp,
  isMCPEnabled,
  isDevelopment,
  getConfigInt,
} from '../lib/security';
import { MCP_CONFIG, ERROR_MESSAGES } from '../config/constants';
import {
  getQueryAdapter,
  getDatabaseType,
  getSqliteIndexColumnsQuery,
  transformSqliteIndexColumns,
  type DatabaseQueryAdapter,
  type IndexInfo,
} from '../lib/db-adapter';

// ============================================================================
// Types for MCP Server
// ============================================================================

/**
 * MCP Server interface - matches the mcp-handler server API
 */
interface MCPServer {
  tool<TSchema extends Record<string, z.ZodType>>(
    name: string,
    description: string,
    schema: TSchema,
    handler: (args: z.infer<z.ZodObject<TSchema>>) => Promise<MCPToolResponse>
  ): void;
}

/**
 * MCP Tool response format
 */
interface MCPToolResponse {
  content: Array<{ type: 'text'; text: string | undefined }>;
}

// ============================================================================
// Tool Parameter Types
// ============================================================================

interface TableDetailsParams {
  table: string;
}

interface SelectQueryParams {
  sql: string;
  params?: unknown[];
  rowLimit?: number;
}

interface MutationQueryParams {
  sql: string;
  params?: unknown[];
  requireReason: string;
}

interface ExplainQueryParams {
  sql: string;
}

interface ValidateSqlParams {
  sql: string;
}

// ============================================================================
// Access Validation
// ============================================================================

/**
 * Validate access for all operations
 */
async function validateAccess(): Promise<{
  allowed: boolean;
  error?: string;
  ip?: string;
}> {
  // Check environment
  if (!isDevelopment()) {
    logAccessDenied('Not in development environment');
    return { allowed: false, error: ERROR_MESSAGES.NOT_DEVELOPMENT };
  }

  // Check if MCP is enabled
  if (!isMCPEnabled()) {
    logAccessDenied('MCP_DEV_ONLY_DB_ACCESS is not enabled');
    return { allowed: false, error: ERROR_MESSAGES.NOT_ENABLED };
  }

  // Check localhost
  const isLocal = await isLocalhost();
  if (!isLocal) {
    const ip = await getRequestIp();
    logAccessDenied('Non-localhost access attempt', ip);
    return { allowed: false, error: ERROR_MESSAGES.NOT_LOCALHOST, ip };
  }

  return { allowed: true };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Set statement timeout if supported by the database
 */
async function setStatementTimeout(adapter: DatabaseQueryAdapter): Promise<void> {
  if (!adapter.supportsStatementTimeout()) {
    return;
  }

  const timeoutMs = getConfigInt(
    'MCP_STMT_TIMEOUT_MS',
    MCP_CONFIG.STATEMENT_TIMEOUT_MS
  );
  const query = adapter.getStatementTimeoutQuery(timeoutMs);

  if (query) {
    await prisma.$executeRawUnsafe(query);
  }
}

/**
 * Get row count for a table
 */
async function getRowCount(tableName: string): Promise<number> {
  const result = await prisma.$queryRawUnsafe<Array<{ count: bigint | number }>>(
    `SELECT COUNT(*) as count FROM "${tableName}"`
  );
  return Number(result[0]?.count || 0);
}

/**
 * Get sample rows from a table
 */
async function getSampleRows(
  tableName: string,
  limit: number = 5
): Promise<Record<string, unknown>[]> {
  const rows = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
    `SELECT * FROM "${tableName}" LIMIT ${limit}`
  );
  return Array.isArray(rows) ? rows : [];
}

/**
 * Get index columns for SQLite indexes
 */
async function enrichSqliteIndexes(indexes: IndexInfo[]): Promise<IndexInfo[]> {
  const enriched: IndexInfo[] = [];

  for (const index of indexes) {
    const columnsQuery = getSqliteIndexColumnsQuery(index.name);
    const columnsResult = await prisma.$queryRawUnsafe<unknown[]>(columnsQuery);
    const columns = transformSqliteIndexColumns(columnsResult);

    enriched.push({
      ...index,
      columns,
    });
  }

  return enriched;
}

// ============================================================================
// Tool Registration
// ============================================================================

/**
 * Register all MCP database tools
 */
export function registerTools(server: MCPServer): void {
  const adapter = getQueryAdapter();
  const dbType = getDatabaseType();

  // Health check tool
  server.tool(
    'health',
    'Check MCP server health and configuration',
    {},
    async () => {
      const startTime = performance.now();
      const access = await validateAccess();

      if (!access.allowed) {
        return {
          content: [{ type: 'text', text: access.error }],
        };
      }

      logMCPOperation({
        timestamp: getTimestamp(),
        tool: 'health',
        durationMs: measureDuration(startTime),
      });

      return {
        content: [
          {
            type: 'text',
            text: `MCP server is healthy and ready to accept commands (database: ${dbType})`,
          },
        ],
      };
    }
  );

  // Get schema overview tool
  server.tool(
    'get_schema_overview',
    'Get high-level overview of database schema with table row counts',
    {},
    async () => {
      const startTime = performance.now();
      const access = await validateAccess();

      if (!access.allowed) {
        return {
          content: [{ type: 'text', text: access.error }],
        };
      }

      try {
        // Get tables
        const tablesQuery = adapter.getTablesQuery();
        const tablesResult = await prisma.$queryRawUnsafe<unknown[]>(tablesQuery);
        const tables = adapter.transformTablesResult(tablesResult);

        const schema = [];

        for (const table of tables) {
          // Get columns
          const columnsQuery = adapter.getColumnsQuery(table.name);
          const columnsResult = await prisma.$queryRawUnsafe<unknown[]>(columnsQuery);
          const columns = adapter.transformColumnsResult(columnsResult);

          // Get foreign keys
          const fksQuery = adapter.getForeignKeysQuery(table.name);
          const fksResult = await prisma.$queryRawUnsafe<unknown[]>(fksQuery);
          const foreignKeys = adapter.transformForeignKeysResult(fksResult);

          // Get row count
          const rowCount = await getRowCount(table.name);

          // Extract primary keys from columns
          const primaryKey = columns
            .filter((col) => col.isPrimaryKey)
            .map((col) => col.name);

          schema.push({
            table: table.name,
            rowCount,
            columns: columns.map((col) => ({
              name: col.name,
              type: col.type,
              isNullable: col.isNullable,
              default: col.defaultValue,
            })),
            primaryKey,
            foreignKeys: foreignKeys.map((fk) => ({
              column: fk.column,
              references: {
                table: fk.referencedTable,
                column: fk.referencedColumn,
              },
            })),
          });
        }

        logMCPOperation({
          timestamp: getTimestamp(),
          tool: 'get_schema_overview',
          durationMs: measureDuration(startTime),
          rowCount: schema.length,
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ database: dbType, tables: schema }, null, 2),
            },
          ],
        };
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : 'Unknown error';
        logMCPOperation({
          timestamp: getTimestamp(),
          tool: 'get_schema_overview',
          durationMs: measureDuration(startTime),
          error: errorMsg,
        });

        return {
          content: [
            {
              type: 'text',
              text: `Error getting schema overview: ${errorMsg}`,
            },
          ],
        };
      }
    }
  );

  // Get table details tool
  server.tool(
    'get_table_details',
    'Get detailed information about a specific table',
    {
      table: z.string().describe('Table name to get details for'),
    },
    async ({ table }: TableDetailsParams) => {
      const startTime = performance.now();
      const access = await validateAccess();

      if (!access.allowed) {
        return {
          content: [{ type: 'text', text: access.error }],
        };
      }

      try {
        // Get columns
        const columnsQuery = adapter.getColumnsQuery(table);
        const columnsResult = await prisma.$queryRawUnsafe<unknown[]>(columnsQuery);
        const columns = adapter.transformColumnsResult(columnsResult);

        if (columns.length === 0) {
          throw new Error(`Table '${table}' not found`);
        }

        // Get indexes
        const indexesQuery = adapter.getIndexesQuery(table);
        const indexesResult = await prisma.$queryRawUnsafe<unknown[]>(indexesQuery);
        let indexes = adapter.transformIndexesResult(indexesResult);

        // For SQLite, we need to enrich indexes with their columns
        if (dbType === 'sqlite') {
          indexes = await enrichSqliteIndexes(indexes);
        }

        // Get constraints
        const constraintsQuery = adapter.getConstraintsQuery(table);
        const constraintsResult = await prisma.$queryRawUnsafe<unknown[]>(constraintsQuery);
        const constraints = adapter.transformConstraintsResult(constraintsResult);

        // Get row count
        const rowCount = await getRowCount(table);

        // Get sample rows
        const sampleRows = await getSampleRows(table, 5);

        const details = {
          database: dbType,
          table,
          rowCount,
          columns: columns.map((col) => ({
            name: col.name,
            type: col.type,
            isNullable: col.isNullable,
            default: col.defaultValue,
            isPrimaryKey: col.isPrimaryKey,
          })),
          indexes,
          constraints,
          sampleRows,
        };

        logMCPOperation({
          timestamp: getTimestamp(),
          tool: 'get_table_details',
          durationMs: measureDuration(startTime),
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(details, null, 2),
            },
          ],
        };
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : 'Unknown error';
        logMCPOperation({
          timestamp: getTimestamp(),
          tool: 'get_table_details',
          durationMs: measureDuration(startTime),
          error: errorMsg,
        });

        return {
          content: [
            {
              type: 'text',
              text: `Error getting table details: ${errorMsg}`,
            },
          ],
        };
      }
    }
  );

  // Execute SELECT query tool
  server.tool(
    'execute_sql_select',
    'Execute a SELECT query (read-only)',
    {
      sql: z.string().describe('SELECT SQL query to execute'),
      params: z
        .array(z.unknown())
        .optional()
        .describe('Query parameters for parameterized queries'),
      rowLimit: z
        .number()
        .min(1)
        .max(MCP_CONFIG.MAX_ROWS)
        .optional()
        .describe(
          `Maximum rows to return (default ${MCP_CONFIG.DEFAULT_LIMIT}, max ${MCP_CONFIG.MAX_ROWS})`
        ),
    },
    async ({ sql, params, rowLimit }: SelectQueryParams) => {
      const startTime = performance.now();
      const access = await validateAccess();

      if (!access.allowed) {
        return {
          content: [{ type: 'text', text: access.error }],
        };
      }

      // Validate SQL is SELECT only
      if (!isSelectOnly(sql)) {
        logMCPOperation({
          timestamp: getTimestamp(),
          tool: 'execute_sql_select',
          error: 'Not a SELECT statement',
        });
        return {
          content: [
            {
              type: 'text',
              text: ERROR_MESSAGES.NOT_SELECT,
            },
          ],
        };
      }

      try {
        const limit =
          rowLimit ||
          getConfigInt('MCP_DEFAULT_LIMIT', MCP_CONFIG.DEFAULT_LIMIT);
        const limitedSQL = addLimitToSelect(sql, limit);

        logSQL(limitedSQL, params);

        // Set statement timeout if supported
        await setStatementTimeout(adapter);

        // Execute query
        const result =
          params && params.length > 0
            ? await prisma.$queryRawUnsafe(limitedSQL, ...params)
            : await prisma.$queryRawUnsafe(limitedSQL);

        const rows = Array.isArray(result) ? result : [];

        logMCPOperation({
          timestamp: getTimestamp(),
          tool: 'execute_sql_select',
          statementClass: 'SELECT',
          durationMs: measureDuration(startTime),
          rowCount: rows.length,
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(rows, null, 2),
            },
          ],
        };
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : 'Unknown error';
        logMCPOperation({
          timestamp: getTimestamp(),
          tool: 'execute_sql_select',
          statementClass: 'SELECT',
          durationMs: measureDuration(startTime),
          error: errorMsg,
        });

        return {
          content: [
            {
              type: 'text',
              text: `Error executing SELECT: ${errorMsg}`,
            },
          ],
        };
      }
    }
  );

  // Execute DML mutation tool
  server.tool(
    'execute_sql_mutation',
    'Execute INSERT, UPDATE, or DELETE queries',
    {
      sql: z
        .string()
        .describe('DML SQL query to execute (INSERT, UPDATE, or DELETE)'),
      params: z
        .array(z.unknown())
        .optional()
        .describe('Query parameters for parameterized queries'),
      requireReason: z
        .string()
        .describe('Brief explanation of why this mutation is needed'),
    },
    async ({ sql, params, requireReason }: MutationQueryParams) => {
      const startTime = performance.now();
      const access = await validateAccess();

      if (!access.allowed) {
        return {
          content: [{ type: 'text', text: access.error }],
        };
      }

      // Validate SQL is DML only (not SELECT, not DDL)
      if (!isDMLOnly(sql)) {
        logMCPOperation({
          timestamp: getTimestamp(),
          tool: 'execute_sql_mutation',
          error: 'Not a valid DML statement',
        });
        return {
          content: [
            {
              type: 'text',
              text: ERROR_MESSAGES.NOT_DML,
            },
          ],
        };
      }

      try {
        const classification = classifySQL(sql);

        logSQL(sql, params);
        console.log('[MCP_DB] Mutation reason:', requireReason);

        // Set statement timeout if supported
        await setStatementTimeout(adapter);

        // Check if query has RETURNING clause
        const hasReturning =
          adapter.supportsReturningClause() &&
          sql.toUpperCase().includes('RETURNING');

        let rowCount = 0;
        let returning: unknown[] | undefined = undefined;

        if (hasReturning) {
          // Use queryRaw for RETURNING clause
          const rows =
            params && params.length > 0
              ? await prisma.$queryRawUnsafe(sql, ...params)
              : await prisma.$queryRawUnsafe(sql);

          returning = Array.isArray(rows) ? rows : [];
          rowCount = returning.length;
        } else {
          // Use executeRaw for non-RETURNING
          rowCount =
            params && params.length > 0
              ? await prisma.$executeRawUnsafe(sql, ...params)
              : await prisma.$executeRawUnsafe(sql);
        }

        logMCPOperation({
          timestamp: getTimestamp(),
          tool: 'execute_sql_mutation',
          statementClass: classification.statementType,
          durationMs: measureDuration(startTime),
          rowCount,
          reason: requireReason,
        });

        const response: { rowCount: number; returning?: unknown[] } = {
          rowCount,
        };
        if (returning) {
          response.returning = returning;
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response, null, 2),
            },
          ],
        };
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : 'Unknown error';
        logMCPOperation({
          timestamp: getTimestamp(),
          tool: 'execute_sql_mutation',
          durationMs: measureDuration(startTime),
          error: errorMsg,
          reason: requireReason,
        });

        return {
          content: [
            {
              type: 'text',
              text: `Error executing mutation: ${errorMsg}`,
            },
          ],
        };
      }
    }
  );

  // Explain query tool
  server.tool(
    'explain_query',
    'Explain a SELECT query with execution plan',
    {
      sql: z.string().describe('SELECT SQL query to explain'),
    },
    async ({ sql }: ExplainQueryParams) => {
      const startTime = performance.now();
      const access = await validateAccess();

      if (!access.allowed) {
        return {
          content: [{ type: 'text', text: access.error }],
        };
      }

      // Validate SQL is SELECT only
      if (!isSelectOnly(sql)) {
        logMCPOperation({
          timestamp: getTimestamp(),
          tool: 'explain_query',
          error: 'Not a SELECT statement',
        });
        return {
          content: [
            {
              type: 'text',
              text: 'Error: Only SELECT statements can be explained',
            },
          ],
        };
      }

      try {
        const explainSQL = adapter.getExplainQuery(sql);

        logSQL(redactSensitiveData(explainSQL));

        const result = await prisma.$queryRawUnsafe<unknown[]>(explainSQL);
        const parsed = adapter.parseExplainResult(result);

        logMCPOperation({
          timestamp: getTimestamp(),
          tool: 'explain_query',
          statementClass: 'EXPLAIN',
          durationMs: measureDuration(startTime),
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  database: dbType,
                  format: parsed.format,
                  plan: parsed.plan,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : 'Unknown error';
        logMCPOperation({
          timestamp: getTimestamp(),
          tool: 'explain_query',
          durationMs: measureDuration(startTime),
          error: errorMsg,
        });

        return {
          content: [
            {
              type: 'text',
              text: `Error explaining query: ${errorMsg}`,
            },
          ],
        };
      }
    }
  );

  // Validate SQL tool
  server.tool(
    'validate_sql',
    'Validate SQL syntax without executing',
    {
      sql: z.string().describe('SQL query to validate'),
    },
    async ({ sql }: ValidateSqlParams) => {
      const startTime = performance.now();
      const access = await validateAccess();

      if (!access.allowed) {
        return {
          content: [{ type: 'text', text: access.error }],
        };
      }

      const result = validateSQLSyntax(sql);

      logMCPOperation({
        timestamp: getTimestamp(),
        tool: 'validate_sql',
        statementClass: result.statementType,
        durationMs: measureDuration(startTime),
        error: result.error,
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ database: dbType, ...result }, null, 2),
          },
        ],
      };
    }
  );
}
