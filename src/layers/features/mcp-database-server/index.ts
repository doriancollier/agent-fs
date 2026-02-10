/**
 * MCP Database Server Feature
 *
 * Public API for the MCP database server feature.
 * This module provides controlled database access for AI agents
 * during development.
 */

// Main server export - the only public API
export { createMcpServer } from './api/server';