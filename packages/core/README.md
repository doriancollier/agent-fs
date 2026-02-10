# @agent-vfs/core

SQLite-backed virtual filesystem for AI coding agents in serverless environments.

## Installation

```bash
npm install @agent-vfs/core
```

## Quick Start

```typescript
import { AgentFs } from '@agent-vfs/core';

// Create filesystem for a user
const fs = new AgentFs({
  dbPath: './workspaces.db', // or ':memory:' for in-memory
  userId: 'user_123',
});

// Use like normal filesystem
await fs.writeFile('/workspace/hello.txt', 'Hello!');
const content = await fs.readFile('/workspace/hello.txt');
```

## Documentation

See the [main repository](https://github.com/yourusername/agent-vfs) for full documentation and examples.

## License

MIT
