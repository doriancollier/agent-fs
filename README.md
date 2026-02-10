# AgentVFS Monorepo

SQLite-backed virtual filesystem for running AI coding agents in serverless environments.

## What's Inside

This Turborepo includes:

### Apps

- **`website`**: Next.js marketing site with interactive demo

### Packages

- **`@agent-vfs/core`**: The core AgentVFS virtual filesystem library

## Quick Start

```bash
# Install dependencies
npm install

# Start development (all apps/packages)
npm run dev

# Build everything
npm run build
```

## Development

```bash
# Run website in dev mode
cd apps/website
npm run dev

# Build core package
cd packages/core
npm run build
```

## Interactive Demo

The website includes a live two-pane demo:
- **Left**: Terminal interface for entering bash commands
- **Right**: Live SQLite database viewer showing real-time updates

Visit `http://localhost:3000` after running `npm run dev`

## Use Cases

- Run Claude Code/Codex in Vercel serverless functions
- Multi-tenant AI coding agents with isolated workspaces
- Serverless code execution environments
- AI agents that maintain memory via files

## Documentation

See individual package READMEs:
- [`packages/core/README.md`](./packages/core/README.md) - Core library docs

## Turborepo

This monorepo uses [Turborepo](https://turbo.build/repo) for:
- Fast, cached builds
- Parallel task execution
- Optimized development workflows

Learn more about Turborepo at [turbo.build/repo](https://turbo.build/repo)

## License

MIT
