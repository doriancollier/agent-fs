/**
 * Logging Utilities for MCP Database Server
 * 
 * Provides audit logging and monitoring capabilities for all database
 * operations performed through the MCP server.
 */

import { redactSensitiveData } from './sql-parser';

interface LogEntry {
  timestamp: string;
  tool: string;
  statementClass?: string;
  durationMs?: number;
  rowCount?: number;
  error?: string;
  reason?: string;
  requestIp?: string;
}

/**
 * Log an MCP operation with structured data
 */
export function logMCPOperation(entry: LogEntry): void {
  const parts = ['[MCP_DB]', `[${entry.timestamp}]`, `[${entry.tool}]`];

  if (entry.statementClass) {
    parts.push(`[${entry.statementClass}]`);
  }

  if (entry.durationMs !== undefined) {
    parts.push(`[${entry.durationMs}ms]`);
  }

  if (entry.rowCount !== undefined) {
    parts.push(`[${entry.rowCount} rows]`);
  }

  if (entry.error) {
    parts.push(`[ERROR: ${entry.error}]`);
  }

  if (entry.reason) {
    parts.push(`[Reason: ${entry.reason}]`);
  }

  if (entry.requestIp) {
    parts.push(`[IP: ${entry.requestIp}]`);
  }

  console.log(parts.join(' '));
}

/**
 * Log SQL query with sensitive data redaction
 */
export function logSQL(sql: string, params?: unknown[]): void {
  const redacted = redactSensitiveData(sql);
  const truncated =
    redacted.length > 500 ? redacted.substring(0, 497) + '...' : redacted;

  console.log('[MCP_DB] SQL:', truncated);

  if (params && params.length > 0) {
    console.log(
      '[MCP_DB] Params:',
      params.map((p) =>
        typeof p === 'string' && p.length > 50 ? p.substring(0, 47) + '...' : p
      )
    );
  }
}

/**
 * Log access denial with reason
 */
export function logAccessDenied(reason: string, requestIp?: string): void {
  console.error(
    '[MCP_DB] Access Denied:',
    reason,
    requestIp ? `[IP: ${requestIp}]` : ''
  );
}

/**
 * Get current ISO timestamp
 */
export function getTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Measure duration from start time
 */
export function measureDuration(startTime: number): number {
  return Math.round(performance.now() - startTime);
}