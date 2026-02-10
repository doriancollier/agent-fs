/**
 * SQLite-backed Virtual Filesystem for just-bash
 * 
 * Implements the IFileSystem interface from just-bash, storing all file data
 * in a SQLite database instead of actual disk files.
 * 
 * Perfect for:
 * - Serverless/cloud environments (Vercel, Lambda)
 * - Multi-tenant AI coding agents
 * - Per-user isolated workspaces
 */

import Database from 'better-sqlite3';
import * as path from 'node:path';
import type {
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

export interface AgentFsOptions {
  /** Database file path (or ':memory:' for in-memory) */
  dbPath: string;
  /** Optional user ID for multi-tenant scenarios */
  userId?: string;
}

interface DbFileRow {
  path: string;
  type: 'file' | 'directory' | 'symlink';
  content: Buffer | null;
  target: string | null;
  mode: number;
  mtime: number;
}

export class AgentFs implements IFileSystem {
  private db: Database.Database;
  private userId: string;

  constructor(options: AgentFsOptions) {
    this.db = new Database(options.dbPath);
    this.userId = options.userId || 'default';
    this.initSchema();
  }

  private initSchema(): void {
    // Create files table with user isolation
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS files (
        user_id TEXT NOT NULL,
        path TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('file', 'directory', 'symlink')),
        content BLOB,
        target TEXT,
        mode INTEGER NOT NULL DEFAULT 420,
        mtime INTEGER NOT NULL,
        PRIMARY KEY (user_id, path)
      );

      CREATE INDEX IF NOT EXISTS idx_files_user_path ON files(user_id, path);
      CREATE INDEX IF NOT EXISTS idx_files_user_parent ON files(user_id, path) 
        WHERE type = 'directory';
    `);

    // Initialize root directory if it doesn't exist
    const root = this.getRow('/');
    if (!root) {
      this.insertRow({
        path: '/',
        type: 'directory',
        content: null,
        target: null,
        mode: 0o755,
        mtime: Date.now(),
      });
    }
  }

  private getRow(filePath: string): DbFileRow | undefined {
    const stmt = this.db.prepare(
      'SELECT * FROM files WHERE user_id = ? AND path = ?'
    );
    return stmt.get(this.userId, filePath) as DbFileRow | undefined;
  }

  private insertRow(row: Omit<DbFileRow, 'user_id'>): void {
    const stmt = this.db.prepare(`
      INSERT INTO files (user_id, path, type, content, target, mode, mtime)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      this.userId,
      row.path,
      row.type,
      row.content,
      row.target,
      row.mode,
      row.mtime
    );
  }

  private updateRow(filePath: string, updates: Partial<Omit<DbFileRow, 'path'>>): void {
    const sets: string[] = [];
    const values: any[] = [];

    if (updates.content !== undefined) {
      sets.push('content = ?');
      values.push(updates.content);
    }
    if (updates.mode !== undefined) {
      sets.push('mode = ?');
      values.push(updates.mode);
    }
    if (updates.mtime !== undefined) {
      sets.push('mtime = ?');
      values.push(updates.mtime);
    }

    if (sets.length === 0) return;

    values.push(this.userId, filePath);
    const stmt = this.db.prepare(`
      UPDATE files SET ${sets.join(', ')} WHERE user_id = ? AND path = ?
    `);
    stmt.run(...values);
  }

  private deleteRow(filePath: string): void {
    const stmt = this.db.prepare('DELETE FROM files WHERE user_id = ? AND path = ?');
    stmt.run(this.userId, filePath);
  }

  private normalizePath(filePath: string): string {
    // Normalize to absolute path
    if (!filePath.startsWith('/')) {
      filePath = '/' + filePath;
    }
    return path.posix.normalize(filePath);
  }

  async readFile(
    filePath: string,
    options?: ReadFileOptions | BufferEncoding
  ): Promise<string> {
    filePath = this.normalizePath(filePath);
    const row = this.getRow(filePath);

    if (!row) {
      throw new Error(`ENOENT: no such file or directory, open '${filePath}'`);
    }
    if (row.type !== 'file') {
      throw new Error(`EISDIR: illegal operation on a directory, read '${filePath}'`);
    }

    const encoding =
      typeof options === 'string' ? options : options?.encoding || 'utf8';

    if (!row.content) {
      return '';
    }

    return row.content.toString(encoding as BufferEncoding);
  }

  async readFileBuffer(filePath: string): Promise<Uint8Array> {
    filePath = this.normalizePath(filePath);
    const row = this.getRow(filePath);

    if (!row) {
      throw new Error(`ENOENT: no such file or directory, open '${filePath}'`);
    }
    if (row.type !== 'file') {
      throw new Error(`EISDIR: illegal operation on a directory, read '${filePath}'`);
    }

    return row.content || new Uint8Array(0);
  }

  async writeFile(
    filePath: string,
    content: FileContent,
    options?: WriteFileOptions | BufferEncoding
  ): Promise<void> {
    filePath = this.normalizePath(filePath);
    const buffer = typeof content === 'string'
      ? Buffer.from(content, (options as BufferEncoding) || 'utf8')
      : Buffer.from(content);

    const row = this.getRow(filePath);

    if (row) {
      if (row.type !== 'file') {
        throw new Error(`EISDIR: illegal operation on a directory, write '${filePath}'`);
      }
      this.updateRow(filePath, { content: buffer, mtime: Date.now() });
    } else {
      // Ensure parent directory exists
      const parent = path.posix.dirname(filePath);
      if (parent !== '/' && !(await this.exists(parent))) {
        await this.mkdir(parent, { recursive: true });
      }

      this.insertRow({
        path: filePath,
        type: 'file',
        content: buffer,
        target: null,
        mode: 0o644,
        mtime: Date.now(),
      });
    }
  }

  async appendFile(
    filePath: string,
    content: FileContent,
    options?: WriteFileOptions | BufferEncoding
  ): Promise<void> {
    filePath = this.normalizePath(filePath);
    const buffer = typeof content === 'string'
      ? Buffer.from(content, (options as BufferEncoding) || 'utf8')
      : Buffer.from(content);

    const row = this.getRow(filePath);

    if (row) {
      if (row.type !== 'file') {
        throw new Error(`EISDIR: illegal operation on a directory, append '${filePath}'`);
      }
      const newContent = row.content
        ? Buffer.concat([row.content, buffer])
        : buffer;
      this.updateRow(filePath, { content: newContent, mtime: Date.now() });
    } else {
      await this.writeFile(filePath, content, options);
    }
  }

  async exists(filePath: string): Promise<boolean> {
    filePath = this.normalizePath(filePath);
    return !!this.getRow(filePath);
  }

  async stat(filePath: string): Promise<FsStat> {
    filePath = this.normalizePath(filePath);
    const row = this.getRow(filePath);

    if (!row) {
      throw new Error(`ENOENT: no such file or directory, stat '${filePath}'`);
    }

    return {
      isFile: row.type === 'file',
      isDirectory: row.type === 'directory',
      isSymbolicLink: row.type === 'symlink',
      mode: row.mode,
      size: row.content?.length || 0,
      mtime: new Date(row.mtime),
    };
  }

  async mkdir(filePath: string, options?: MkdirOptions): Promise<void> {
    filePath = this.normalizePath(filePath);

    if (await this.exists(filePath)) {
      throw new Error(`EEXIST: file already exists, mkdir '${filePath}'`);
    }

    const parent = path.posix.dirname(filePath);

    if (parent !== '/' && !(await this.exists(parent))) {
      if (options?.recursive) {
        await this.mkdir(parent, options);
      } else {
        throw new Error(`ENOENT: no such file or directory, mkdir '${filePath}'`);
      }
    }

    this.insertRow({
      path: filePath,
      type: 'directory',
      content: null,
      target: null,
      mode: 0o755,
      mtime: Date.now(),
    });
  }

  async readdir(filePath: string): Promise<string[]> {
    filePath = this.normalizePath(filePath);
    const row = this.getRow(filePath);

    if (!row) {
      throw new Error(`ENOENT: no such file or directory, readdir '${filePath}'`);
    }
    if (row.type !== 'directory') {
      throw new Error(`ENOTDIR: not a directory, readdir '${filePath}'`);
    }

    const prefix = filePath === '/' ? '/' : filePath + '/';
    const stmt = this.db.prepare(`
      SELECT path FROM files 
      WHERE user_id = ? AND path LIKE ? AND path != ?
    `);
    const rows = stmt.all(this.userId, prefix + '%', filePath) as { path: string }[];

    // Only return direct children
    const children = new Set<string>();
    for (const row of rows) {
      const relative = row.path.substring(prefix.length);
      const firstSlash = relative.indexOf('/');
      const child = firstSlash === -1 ? relative : relative.substring(0, firstSlash);
      if (child) children.add(child);
    }

    return Array.from(children);
  }

  async readdirWithFileTypes(filePath: string): Promise<DirentEntry[]> {
    const names = await this.readdir(filePath);
    const entries: DirentEntry[] = [];

    for (const name of names) {
      const fullPath = path.posix.join(filePath, name);
      const row = this.getRow(fullPath);
      if (row) {
        entries.push({
          name,
          isFile: row.type === 'file',
          isDirectory: row.type === 'directory',
          isSymbolicLink: row.type === 'symlink',
        });
      }
    }

    return entries;
  }

  async rm(filePath: string, options?: RmOptions): Promise<void> {
    filePath = this.normalizePath(filePath);
    const row = this.getRow(filePath);

    if (!row) {
      if (options?.force) return;
      throw new Error(`ENOENT: no such file or directory, rm '${filePath}'`);
    }

    if (row.type === 'directory') {
      const children = await this.readdir(filePath);
      if (children.length > 0) {
        if (!options?.recursive) {
          throw new Error(`ENOTEMPTY: directory not empty, rm '${filePath}'`);
        }
        for (const child of children) {
          await this.rm(path.posix.join(filePath, child), options);
        }
      }
    }

    this.deleteRow(filePath);
  }

  async cp(src: string, dest: string, options?: CpOptions): Promise<void> {
    src = this.normalizePath(src);
    dest = this.normalizePath(dest);

    const srcRow = this.getRow(src);
    if (!srcRow) {
      throw new Error(`ENOENT: no such file or directory, cp '${src}'`);
    }

    if (srcRow.type === 'directory') {
      if (!options?.recursive) {
        throw new Error(`EISDIR: illegal operation on a directory, cp '${src}'`);
      }

      await this.mkdir(dest);
      const children = await this.readdir(src);
      for (const child of children) {
        await this.cp(
          path.posix.join(src, child),
          path.posix.join(dest, child),
          options
        );
      }
    } else {
      // Copy file or symlink
      this.insertRow({
        path: dest,
        type: srcRow.type,
        content: srcRow.content,
        target: srcRow.target,
        mode: srcRow.mode,
        mtime: Date.now(),
      });
    }
  }

  async mv(src: string, dest: string): Promise<void> {
    src = this.normalizePath(src);
    dest = this.normalizePath(dest);

    const srcRow = this.getRow(src);
    if (!srcRow) {
      throw new Error(`ENOENT: no such file or directory, mv '${src}'`);
    }

    // Copy to destination
    await this.cp(src, dest, { recursive: true });

    // Remove source
    await this.rm(src, { recursive: true });
  }

  resolvePath(base: string, filePath: string): string {
    return this.normalizePath(path.posix.resolve(base, filePath));
  }

  getAllPaths(): string[] {
    const stmt = this.db.prepare('SELECT path FROM files WHERE user_id = ?');
    const rows = stmt.all(this.userId) as { path: string }[];
    return rows.map(r => r.path);
  }

  async chmod(filePath: string, mode: number): Promise<void> {
    filePath = this.normalizePath(filePath);
    const row = this.getRow(filePath);

    if (!row) {
      throw new Error(`ENOENT: no such file or directory, chmod '${filePath}'`);
    }

    this.updateRow(filePath, { mode });
  }

  async symlink(target: string, linkPath: string): Promise<void> {
    linkPath = this.normalizePath(linkPath);

    if (await this.exists(linkPath)) {
      throw new Error(`EEXIST: file already exists, symlink '${linkPath}'`);
    }

    this.insertRow({
      path: linkPath,
      type: 'symlink',
      content: null,
      target,
      mode: 0o777,
      mtime: Date.now(),
    });
  }

  async link(existingPath: string, newPath: string): Promise<void> {
    existingPath = this.normalizePath(existingPath);
    newPath = this.normalizePath(newPath);

    const existingRow = this.getRow(existingPath);
    if (!existingRow || existingRow.type !== 'file') {
      throw new Error(`ENOENT: no such file, link '${existingPath}'`);
    }

    if (await this.exists(newPath)) {
      throw new Error(`EEXIST: file already exists, link '${newPath}'`);
    }

    // Hard link: duplicate the file row
    this.insertRow({
      path: newPath,
      type: existingRow.type,
      content: existingRow.content,
      target: existingRow.target,
      mode: existingRow.mode,
      mtime: Date.now(),
    });
  }

  async readlink(filePath: string): Promise<string> {
    filePath = this.normalizePath(filePath);
    const row = this.getRow(filePath);

    if (!row) {
      throw new Error(`ENOENT: no such file or directory, readlink '${filePath}'`);
    }
    if (row.type !== 'symlink') {
      throw new Error(`EINVAL: invalid argument, readlink '${filePath}'`);
    }

    return row.target || '';
  }

  async lstat(filePath: string): Promise<FsStat> {
    // For now, lstat is the same as stat (no symlink following)
    return this.stat(filePath);
  }

  async realpath(filePath: string): Promise<string> {
    // Simplified: just normalize the path
    // In a full implementation, would need to resolve all symlinks
    return this.normalizePath(filePath);
  }

  async utimes(filePath: string, atime: Date, mtime: Date): Promise<void> {
    filePath = this.normalizePath(filePath);
    const row = this.getRow(filePath);

    if (!row) {
      throw new Error(`ENOENT: no such file or directory, utimes '${filePath}'`);
    }

    this.updateRow(filePath, { mtime: mtime.getTime() });
  }

  /**
   * Close the database connection
   */
  close(): void {
    this.db.close();
  }
}
