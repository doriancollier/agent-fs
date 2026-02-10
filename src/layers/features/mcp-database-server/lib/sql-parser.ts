/**
 * SQL Parser and Validator for MCP Database Server
 * 
 * Provides SQL statement classification, validation, and safety checks
 * to prevent dangerous operations in development environment.
 */

import { 
  STATEMENT_TYPES, 
  ALLOWED_DML, 
  ERROR_MESSAGES,
  type StatementType 
} from '../config/constants';

interface ParseResult {
  valid: boolean;
  statementType?: StatementType;
  error?: string;
  isAllowedDML?: boolean;
  isAllowedDDL?: boolean;
}

export function classifySQL(sql: string): ParseResult {
  try {
    // Remove comments and normalize whitespace
    const cleanSQL = sql
      .replace(/--.*$/gm, '') // Remove single-line comments
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
      .trim()
      .toUpperCase();

    if (!cleanSQL) {
      return {
        valid: false,
        error: ERROR_MESSAGES.INVALID_SQL,
      };
    }

    // Determine statement type by first keyword
    let statementType: StatementType = STATEMENT_TYPES.UNKNOWN;

    if (/^\s*SELECT\s/i.test(sql)) {
      statementType = STATEMENT_TYPES.SELECT;
    } else if (/^\s*INSERT\s/i.test(sql)) {
      statementType = STATEMENT_TYPES.INSERT;
    } else if (/^\s*UPDATE\s/i.test(sql)) {
      statementType = STATEMENT_TYPES.UPDATE;
    } else if (/^\s*DELETE\s/i.test(sql)) {
      statementType = STATEMENT_TYPES.DELETE;
    } else if (/^\s*CREATE\s/i.test(sql)) {
      statementType = STATEMENT_TYPES.CREATE;
    } else if (/^\s*ALTER\s/i.test(sql)) {
      statementType = STATEMENT_TYPES.ALTER;
    } else if (/^\s*DROP\s/i.test(sql)) {
      statementType = STATEMENT_TYPES.DROP;
    } else if (/^\s*TRUNCATE\s/i.test(sql)) {
      statementType = STATEMENT_TYPES.TRUNCATE;
    } else if (/^\s*GRANT\s/i.test(sql)) {
      statementType = STATEMENT_TYPES.GRANT;
    } else if (/^\s*REVOKE\s/i.test(sql)) {
      statementType = STATEMENT_TYPES.REVOKE;
    } else if (/^\s*WITH\s/i.test(sql)) {
      // CTEs usually start with WITH, followed by SELECT
      if (/WITH\s+.*\s+SELECT\s/i.test(cleanSQL)) {
        statementType = STATEMENT_TYPES.SELECT;
      }
    } else if (/^\s*EXPLAIN\s/i.test(sql)) {
      // EXPLAIN is allowed for SELECT statements
      if (/EXPLAIN\s+.*\s+SELECT\s/i.test(cleanSQL)) {
        statementType = STATEMENT_TYPES.SELECT;
      }
    }

    // Additional safety check: scan entire SQL for dangerous keywords
    const dangerousPatterns = [
      /\bCREATE\s+(TABLE|DATABASE|SCHEMA|VIEW|INDEX|FUNCTION|PROCEDURE|TRIGGER|ROLE|USER)\b/i,
      /\bALTER\s+(TABLE|DATABASE|SCHEMA|VIEW|INDEX|FUNCTION|PROCEDURE|TRIGGER|ROLE|USER)\b/i,
      /\bDROP\s+(TABLE|DATABASE|SCHEMA|VIEW|INDEX|FUNCTION|PROCEDURE|TRIGGER|ROLE|USER|CASCADE)\b/i,
      /\bTRUNCATE\s+TABLE\b/i,
      /\bGRANT\s+/i,
      /\bREVOKE\s+/i,
      /\bCOPY\s+.*\s+(FROM|TO)\s+PROGRAM\b/i, // Prevent command execution
      /\bEXECUTE\s+/i, // Prevent dynamic SQL
      /\bSET\s+ROLE\b/i,
      /\bRESET\s+ROLE\b/i,
      /\bCREATE\s+EXTENSION\b/i,
      /\bDROP\s+EXTENSION\b/i,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(cleanSQL)) {
        return {
          valid: false,
          error: ERROR_MESSAGES.FORBIDDEN_DDL,
          statementType,
        };
      }
    }

    return {
      valid: true,
      statementType,
      isAllowedDML: (ALLOWED_DML as readonly StatementType[]).includes(statementType),
      isAllowedDDL: false, // We never allow DDL
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Failed to parse SQL',
    };
  }
}

export function validateSQLSyntax(sql: string): ParseResult {
  return classifySQL(sql);
}

export function isSelectOnly(sql: string): boolean {
  const result = classifySQL(sql);
  return result.valid && result.statementType === STATEMENT_TYPES.SELECT;
}

export function isDMLOnly(sql: string): boolean {
  const result = classifySQL(sql);
  return (
    result.valid &&
    result.isAllowedDML === true &&
    result.statementType !== STATEMENT_TYPES.SELECT
  );
}

export function addLimitToSelect(sql: string, limit: number): string {
  // Simple approach: if no LIMIT exists, add one
  const upperSQL = sql.toUpperCase();
  if (!upperSQL.includes('LIMIT')) {
    // Remove trailing semicolon if present
    const cleanSQL = sql.replace(/;\s*$/, '');
    return `${cleanSQL} LIMIT ${limit}`;
  }
  return sql;
}

export function redactSensitiveData(sql: string): string {
  // Redact potential passwords, tokens, and sensitive data
  let redacted = sql;

  // Redact password-like patterns
  redacted = redacted.replace(
    /password\s*=\s*'[^']*'/gi,
    "password='[REDACTED]'"
  );
  redacted = redacted.replace(/token\s*=\s*'[^']*'/gi, "token='[REDACTED]'");
  redacted = redacted.replace(/secret\s*=\s*'[^']*'/gi, "secret='[REDACTED]'");
  redacted = redacted.replace(
    /api_key\s*=\s*'[^']*'/gi,
    "api_key='[REDACTED]'"
  );

  // Redact email addresses (keep format visible)
  redacted = redacted.replace(
    /([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
    (match, local, domain) => `${local.substring(0, 2)}***@${domain}`
  );

  // Redact phone numbers (keep format visible for E.164)
  redacted = redacted.replace(
    /\+1\d{10}/g,
    (match) => `${match.substring(0, 5)}***${match.substring(match.length - 2)}`
  );

  return redacted;
}