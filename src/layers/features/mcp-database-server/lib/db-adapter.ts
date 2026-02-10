/**
 * Database Query Adapter
 *
 * Provides database-agnostic query generation for the MCP server.
 * Supports both PostgreSQL and SQLite with automatic detection.
 */

// ============================================================================
// Types
// ============================================================================

export type DatabaseType = 'postgresql' | 'sqlite';

export interface TableInfo {
  name: string;
}

export interface ColumnInfo {
  name: string;
  type: string;
  isNullable: boolean;
  defaultValue: string | null;
  isPrimaryKey?: boolean;
}

export interface ForeignKeyInfo {
  column: string;
  referencedTable: string;
  referencedColumn: string;
}

export interface IndexInfo {
  name: string;
  columns: string[];
  isUnique: boolean;
  isPrimary: boolean;
}

export interface ConstraintInfo {
  name: string;
  type: string;
}

export interface ExplainResult {
  plan: unknown;
  format: 'json' | 'text';
}

// ============================================================================
// Database Detection
// ============================================================================

/**
 * Detect database type from connection URL
 */
export function detectDatabaseType(url?: string): DatabaseType {
  const dbUrl = url || process.env.DATABASE_URL || '';

  if (dbUrl.startsWith('file:') || dbUrl.endsWith('.db') || dbUrl.endsWith('.sqlite')) {
    return 'sqlite';
  }

  if (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')) {
    return 'postgresql';
  }

  // Default to SQLite for local development if no clear indicator
  if (dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1')) {
    return 'postgresql';
  }

  // Fallback based on presence of certain patterns
  return 'sqlite';
}

/**
 * Get current database type (cached for performance)
 */
let cachedDbType: DatabaseType | null = null;

export function getDatabaseType(): DatabaseType {
  if (cachedDbType === null) {
    cachedDbType = detectDatabaseType();
  }
  return cachedDbType;
}

/**
 * Reset cached database type (useful for testing)
 */
export function resetDatabaseTypeCache(): void {
  cachedDbType = null;
}

// ============================================================================
// Query Adapter Interface
// ============================================================================

export interface DatabaseQueryAdapter {
  readonly type: DatabaseType;

  // Schema introspection
  getTablesQuery(): string;
  getColumnsQuery(tableName: string): string;
  getPrimaryKeysQuery(tableName: string): string;
  getForeignKeysQuery(tableName: string): string;
  getIndexesQuery(tableName: string): string;
  getConstraintsQuery(tableName: string): string;

  // Query execution features
  supportsStatementTimeout(): boolean;
  getStatementTimeoutQuery(timeoutMs: number): string | null;
  supportsReturningClause(): boolean;

  // Explain query
  getExplainQuery(sql: string): string;
  parseExplainResult(result: unknown[]): ExplainResult;

  // Result transformers (normalize different DB outputs to common format)
  transformTablesResult(rows: unknown[]): TableInfo[];
  transformColumnsResult(rows: unknown[]): ColumnInfo[];
  transformForeignKeysResult(rows: unknown[]): ForeignKeyInfo[];
  transformIndexesResult(rows: unknown[]): IndexInfo[];
  transformConstraintsResult(rows: unknown[]): ConstraintInfo[];
}

// ============================================================================
// PostgreSQL Adapter
// ============================================================================

export const PostgresAdapter: DatabaseQueryAdapter = {
  type: 'postgresql',

  getTablesQuery(): string {
    return `
      SELECT table_name as name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
  },

  getColumnsQuery(tableName: string): string {
    return `
      SELECT
        c.column_name as name,
        c.data_type as type,
        c.is_nullable as is_nullable,
        c.column_default as default_value,
        CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END as is_primary_key
      FROM information_schema.columns c
      LEFT JOIN (
        SELECT kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.constraint_type = 'PRIMARY KEY'
        AND tc.table_schema = 'public'
        AND tc.table_name = '${tableName}'
      ) pk ON c.column_name = pk.column_name
      WHERE c.table_schema = 'public'
      AND c.table_name = '${tableName}'
      ORDER BY c.ordinal_position
    `;
  },

  getPrimaryKeysQuery(tableName: string): string {
    return `
      SELECT kcu.column_name as name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.constraint_type = 'PRIMARY KEY'
      AND tc.table_schema = 'public'
      AND tc.table_name = '${tableName}'
      ORDER BY kcu.ordinal_position
    `;
  },

  getForeignKeysQuery(tableName: string): string {
    return `
      SELECT
        kcu.column_name as column,
        ccu.table_name as referenced_table,
        ccu.column_name as referenced_column
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
      AND tc.table_name = '${tableName}'
      ORDER BY kcu.ordinal_position
    `;
  },

  getIndexesQuery(tableName: string): string {
    return `
      SELECT
        i.relname AS index_name,
        a.attname AS column_name,
        ix.indisunique AS is_unique,
        ix.indisprimary AS is_primary
      FROM pg_class t
      JOIN pg_index ix ON t.oid = ix.indrelid
      JOIN pg_class i ON ix.indexrelid = i.oid
      JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
      JOIN pg_namespace n ON n.oid = t.relnamespace
      WHERE n.nspname = 'public'
      AND t.relname = '${tableName}'
      AND t.relkind = 'r'
      ORDER BY i.relname, a.attnum
    `;
  },

  getConstraintsQuery(tableName: string): string {
    return `
      SELECT constraint_name as name, constraint_type as type
      FROM information_schema.table_constraints
      WHERE table_schema = 'public'
      AND table_name = '${tableName}'
      ORDER BY constraint_name
    `;
  },

  supportsStatementTimeout(): boolean {
    return true;
  },

  getStatementTimeoutQuery(timeoutMs: number): string | null {
    return `SET statement_timeout = ${timeoutMs}`;
  },

  supportsReturningClause(): boolean {
    return true;
  },

  getExplainQuery(sql: string): string {
    return `EXPLAIN (FORMAT JSON, ANALYZE FALSE, COSTS TRUE) ${sql}`;
  },

  parseExplainResult(result: unknown[]): ExplainResult {
    const row = result[0] as Record<string, unknown> | undefined;
    return {
      plan: row?.['QUERY PLAN'] || row,
      format: 'json',
    };
  },

  transformTablesResult(rows: unknown[]): TableInfo[] {
    return (rows as Array<{ name: string }>).map((row) => ({
      name: row.name,
    }));
  },

  transformColumnsResult(rows: unknown[]): ColumnInfo[] {
    return (rows as Array<{
      name: string;
      type: string;
      is_nullable: string;
      default_value: string | null;
      is_primary_key: boolean;
    }>).map((row) => ({
      name: row.name,
      type: row.type,
      isNullable: row.is_nullable === 'YES',
      defaultValue: row.default_value,
      isPrimaryKey: row.is_primary_key,
    }));
  },

  transformForeignKeysResult(rows: unknown[]): ForeignKeyInfo[] {
    return (rows as Array<{
      column: string;
      referenced_table: string;
      referenced_column: string;
    }>).map((row) => ({
      column: row.column,
      referencedTable: row.referenced_table,
      referencedColumn: row.referenced_column,
    }));
  },

  transformIndexesResult(rows: unknown[]): IndexInfo[] {
    const indexMap = new Map<string, IndexInfo>();

    for (const row of rows as Array<{
      index_name: string;
      column_name: string;
      is_unique: boolean;
      is_primary: boolean;
    }>) {
      const existing = indexMap.get(row.index_name);
      if (existing) {
        existing.columns.push(row.column_name);
      } else {
        indexMap.set(row.index_name, {
          name: row.index_name,
          columns: [row.column_name],
          isUnique: row.is_unique,
          isPrimary: row.is_primary,
        });
      }
    }

    return Array.from(indexMap.values());
  },

  transformConstraintsResult(rows: unknown[]): ConstraintInfo[] {
    return (rows as Array<{ name: string; type: string }>).map((row) => ({
      name: row.name,
      type: row.type,
    }));
  },
};

// ============================================================================
// SQLite Adapter
// ============================================================================

export const SqliteAdapter: DatabaseQueryAdapter = {
  type: 'sqlite',

  getTablesQuery(): string {
    return `
      SELECT name
      FROM sqlite_master
      WHERE type = 'table'
      AND name NOT LIKE 'sqlite_%'
      AND name NOT LIKE '_prisma_%'
      ORDER BY name
    `;
  },

  getColumnsQuery(tableName: string): string {
    // SQLite uses PRAGMA for column info - we'll handle this specially
    return `PRAGMA table_info('${tableName}')`;
  },

  getPrimaryKeysQuery(tableName: string): string {
    // Primary keys are included in PRAGMA table_info (pk column > 0)
    return `PRAGMA table_info('${tableName}')`;
  },

  getForeignKeysQuery(tableName: string): string {
    return `PRAGMA foreign_key_list('${tableName}')`;
  },

  getIndexesQuery(tableName: string): string {
    return `PRAGMA index_list('${tableName}')`;
  },

  getConstraintsQuery(_tableName: string): string {
    // SQLite doesn't have a direct constraints query
    // Constraints are embedded in table definition
    // Return empty - we'll derive from other queries
    return `SELECT '' as name, '' as type WHERE 0`;
  },

  supportsStatementTimeout(): boolean {
    return false;
  },

  getStatementTimeoutQuery(_timeoutMs: number): string | null {
    return null;
  },

  supportsReturningClause(): boolean {
    // SQLite 3.35+ supports RETURNING, but we'll be conservative
    return true;
  },

  getExplainQuery(sql: string): string {
    return `EXPLAIN QUERY PLAN ${sql}`;
  },

  parseExplainResult(result: unknown[]): ExplainResult {
    // SQLite EXPLAIN QUERY PLAN returns rows with: id, parent, notused, detail
    const steps = (result as Array<{
      id?: number;
      parent?: number;
      detail?: string;
      selectid?: number;
      order?: number;
      from?: number;
    }>).map((row) => ({
      id: row.id ?? row.selectid,
      parent: row.parent ?? row.order,
      detail: row.detail ?? row.from?.toString() ?? '',
    }));

    return {
      plan: steps,
      format: 'text',
    };
  },

  transformTablesResult(rows: unknown[]): TableInfo[] {
    return (rows as Array<{ name: string }>).map((row) => ({
      name: row.name,
    }));
  },

  transformColumnsResult(rows: unknown[]): ColumnInfo[] {
    // PRAGMA table_info returns: cid, name, type, notnull, dflt_value, pk
    return (rows as Array<{
      cid: number;
      name: string;
      type: string;
      notnull: number;
      dflt_value: string | null;
      pk: number;
    }>).map((row) => ({
      name: row.name,
      type: row.type,
      isNullable: row.notnull === 0,
      defaultValue: row.dflt_value,
      isPrimaryKey: row.pk > 0,
    }));
  },

  transformForeignKeysResult(rows: unknown[]): ForeignKeyInfo[] {
    // PRAGMA foreign_key_list returns: id, seq, table, from, to, on_update, on_delete, match
    return (rows as Array<{
      id: number;
      seq: number;
      table: string;
      from: string;
      to: string;
    }>).map((row) => ({
      column: row.from,
      referencedTable: row.table,
      referencedColumn: row.to,
    }));
  },

  transformIndexesResult(rows: unknown[]): IndexInfo[] {
    // PRAGMA index_list returns: seq, name, unique, origin, partial
    // We need to query each index for its columns separately
    return (rows as Array<{
      seq: number;
      name: string;
      unique: number;
      origin: string;
      partial: number;
    }>).map((row) => ({
      name: row.name,
      columns: [], // Will be populated by separate query
      isUnique: row.unique === 1,
      isPrimary: row.origin === 'pk',
    }));
  },

  transformConstraintsResult(_rows: unknown[]): ConstraintInfo[] {
    // SQLite doesn't have named constraints in the same way
    return [];
  },
};

// ============================================================================
// Factory
// ============================================================================

/**
 * Get the appropriate query adapter for the current database
 */
export function getQueryAdapter(dbType?: DatabaseType): DatabaseQueryAdapter {
  const type = dbType ?? getDatabaseType();
  return type === 'postgresql' ? PostgresAdapter : SqliteAdapter;
}

// ============================================================================
// Helper Functions for Complex Queries
// ============================================================================

/**
 * Get index columns for SQLite (requires separate PRAGMA call per index)
 */
export function getSqliteIndexColumnsQuery(indexName: string): string {
  return `PRAGMA index_info('${indexName}')`;
}

/**
 * Transform SQLite index_info result to column names
 */
export function transformSqliteIndexColumns(rows: unknown[]): string[] {
  return (rows as Array<{
    seqno: number;
    cid: number;
    name: string;
  }>).map((row) => row.name);
}
