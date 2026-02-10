/**
 * MCP Database Server Main Module
 *
 * Creates and configures the MCP server instance with all database tools.
 * This is the main entry point for the MCP database server feature.
 */

import { createMcpHandler } from 'mcp-handler';
import { registerTools } from './handlers';
import { MCP_CONFIG } from '../config/constants';

/**
 * MCP Handler configuration options
 */
interface McpHandlerConfig {
  basePath?: string;
  redisUrl?: string;
  maxDuration?: number;
  verboseLogs?: boolean;
  disableSse?: boolean;
}

/**
 * MCP Server options
 */
interface McpServerOpts {
  serverInfo?: {
    name: string;
    version: string;
  };
}

/**
 * Create an MCP server instance with all database tools
 *
 * @param options Optional configuration overrides
 * @returns Request handler for Next.js API routes
 */
export function createMcpServer(options?: {
  basePath?: string;
  serverOptions?: McpServerOpts;
  transportOptions?: McpHandlerConfig;
}) {
  const {
    basePath = MCP_CONFIG.BASE_PATH,
    serverOptions = undefined,
    transportOptions = {},
  } = options || {};

  // Create the MCP handler with all tools registered
  // Note: SSE is disabled by default as it requires Redis.
  // Use the stateless HTTP endpoint (/mcp) instead.
  const handler = createMcpHandler(
    (server) => {
      // Register all database tools
      // The server type is McpServer from @modelcontextprotocol/sdk
      registerTools(server as Parameters<typeof registerTools>[0]);
    },
    serverOptions,
    {
      disableSse: true, // Disable SSE to avoid Redis requirement
      ...transportOptions,
      basePath,
    }
  );

  return handler;
}
