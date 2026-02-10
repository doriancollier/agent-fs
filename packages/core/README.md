# @sqlite-vfs/core

SQLite-backed virtual filesystem for AI coding agents in serverless environments.

## Installation

```bash
npm install @sqlite-vfs/core
```

## Quick Start

```typescript
import { SqliteFs } from '@sqlite-vfs/core';

// Create filesystem for a user
const fs = new SqliteFs({
  dbPath: './workspaces.db', // or ':memory:' for in-memory
  userId: 'user_123',
});

// Use like normal filesystem
await fs.writeFile('/workspace/hello.txt', 'Hello!');
const content = await fs.readFile('/workspace/hello.txt');
```

## Documentation

See the [main repository](https://github.com/yourusername/sqlite-vfs) for full documentation and examples.

## License

MIT
