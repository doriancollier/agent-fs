/**
 * MCP Database Server API Route
 *
 * This is a thin route handler that delegates all functionality
 * to the MCP database server feature module.
 *
 * The MCP server provides development-only database access for AI agents.
 */

import { createMcpServer } from '@/layers/features/mcp-database-server';

// Create the MCP server handler
const handler = createMcpServer();

// Export handlers for Next.js API route
export const GET = handler;
export const POST = handler;
