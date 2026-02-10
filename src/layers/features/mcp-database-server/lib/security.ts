/**
 * Security Utilities for MCP Database Server
 * 
 * Provides access control and validation for MCP server requests
 * to ensure only authorized local development access.
 */

import { headers } from 'next/headers';

/**
 * Check if request is from localhost
 */
export async function isLocalhost(): Promise<boolean> {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const xForwardedFor = headersList.get('x-forwarded-for');
  const xRealIp = headersList.get('x-real-ip');

  // Check if host is localhost
  const isLocalHost =
    host.startsWith('localhost') ||
    host.startsWith('127.0.0.1') ||
    host.startsWith('[::1]');

  // If we have forwarded headers, check those too
  if (xForwardedFor || xRealIp) {
    const forwardedIp = xForwardedFor?.split(',')[0] || xRealIp;
    const isLocalForwarded =
      forwardedIp === '127.0.0.1' ||
      forwardedIp === '::1' ||
      forwardedIp === 'localhost';
    return isLocalHost && isLocalForwarded;
  }

  return isLocalHost;
}

/**
 * Get request IP address for logging
 */
export async function getRequestIp(): Promise<string> {
  const headersList = await headers();
  const xForwardedFor = headersList.get('x-forwarded-for');
  const xRealIp = headersList.get('x-real-ip');
  return xForwardedFor?.split(',')[0] || xRealIp || 'unknown';
}

/**
 * Check if MCP is enabled via environment variable
 */
export function isMCPEnabled(): boolean {
  // Try to use T3 Env if available, fall back to process.env
  try {
    // Dynamic import to avoid dependency if not using T3 Env
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { env } = require('@/env');
    return !!env.MCP_DEV_ONLY_DB_ACCESS;
  } catch {
    // Fall back to process.env if T3 Env is not available
    const envValue = 
      process.env.MCP_DEV_ONLY_DB_ACCESS || 
      process.env.NEXT_PUBLIC_MCP_DEV_ONLY_DB_ACCESS;
    
    return envValue === 'true';
  }
}

/**
 * Check if running in development environment
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Parse integer configuration with fallback
 */
export function getConfigInt(key: string, defaultValue: number): number {
  try {
    // Try to use T3 Env if available
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { env } = require('@/env');
    const value = env[key];
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? defaultValue : parsed;
    }
    return defaultValue;
  } catch {
    // Fall back to process.env
    const value = process.env[key];
    if (!value) return defaultValue;
    
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }
}