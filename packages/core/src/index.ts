/**
 * @agent-vfs/core
 *
 * SQLite-backed virtual filesystem for AI coding agents in serverless environments
 */

export { AgentFs, type AgentFsOptions } from './agent-fs.js';
export type {
  IFileSystem,
  ReadFileOptions,
  WriteFileOptions,
  FsStat,
  MkdirOptions,
  RmOptions,
  CpOptions,
  DirentEntry,
  FileContent,
  BufferEncoding,
} from './types.js';
