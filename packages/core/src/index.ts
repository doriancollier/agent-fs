/**
 * @sqlite-vfs/core
 * 
 * SQLite-backed virtual filesystem for AI coding agents in serverless environments
 */

export { SqliteFs, type SqliteFsOptions } from './sqlite-fs.js';
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
