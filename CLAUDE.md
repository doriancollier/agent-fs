# AgentVFS Monorepo

## Project Structure

Turborepo monorepo with npm workspaces.

```
apps/
├── website/         # Next.js 16 app (git subtree from dorkian-next-stack)
├── website-old/     # Previous website (deprecated)
packages/            # Shared packages
```

## Common Commands

```bash
npm run dev          # Start all apps
npm run build        # Build all apps
npm run test         # Run all tests
npm run lint         # Lint all apps
npm run typecheck    # Typecheck all apps
npm run clean        # Clean all build artifacts
```

## Git Subtree: apps/website

`apps/website` is a git subtree sourced from `dorkian-next-stack` (https://github.com/doriancollier/dorkian-next-stack). This means the code is embedded directly in this repo but can sync with the upstream source.

**Remote:** `dorkian-next-stack` (already configured)

### Subtree Scripts

```bash
npm run subtree:pull   # Pull latest changes from upstream dorkian-next-stack
npm run subtree:push   # Push local changes back to upstream
npm run subtree:diff   # View diff between local and upstream
```

### Subtree Rules

- **Always use `--squash`** when pulling. The scripts handle this automatically.
- **Never rebase** subtree merge commits. Rebasing breaks subtree metadata and will cause future pull/push operations to fail.
- **Never mix squash modes.** We use squashed pulls exclusively.
- **Keep upstream-worthy changes in separate commits** from project-specific customizations. `subtree:push` sends all subtree commits upstream — it cannot selectively push.
- **Subtree metadata lives only in commit messages** (look for `git-subtree-dir:` and `git-subtree-split:`). There is no config file tracking subtrees.

### When to Sync

- Run `subtree:pull` to bring in upstream template updates (new components, dependency bumps, framework upgrades).
- Run `subtree:diff` to see what's changed locally vs upstream before deciding to push.
- Run `subtree:push` only for general-purpose improvements that belong in the boilerplate, not project-specific code.
