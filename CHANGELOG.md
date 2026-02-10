# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Added

### Changed

### Fixed

---

## [0.2.0-alpha.10] - 2026-02-02

### Added

- Add template update system for upstream synchronization

### Fixed

- Make workflow visual more compact to prevent overflow

---

## [0.2.0-alpha.9] - 2026-02-02

### Added

- Enhance system landing page with world-class design

---

## [0.2.0-alpha.8] - 2026-02-01

### Added

- Add GitHub link to system sidebar

---

## [0.2.0-alpha.7] - 2026-02-01

### Added

- Render developer guides as HTML pages at /system/guides

---

## [0.2.0-alpha.6] - 2026-02-01

### Added

- Add roadmap clearing functionality
- Add autonomous roadmap execution system

### Changed

- Add roadmap:clear command to documentation
- Add comprehensive documentation for autonomous roadmap execution

---

## [0.2.0-alpha.5] - 2026-02-01

### Changed

- Expand roadmap page to full-width layout for better use of screen space
- Improve roadmap header styling with breadcrumb element and consistent typography

### Fixed

- Correct harness documentation (command counts, removed deleted commands)

---

## [0.2.0-alpha.4] - 2026-02-01

### Added

- Integrate roadmap visualization into Next.js app as React-based feature at `/roadmap`
- Add three view modes: Timeline (Now/Next/Later), Status, and Priority (MoSCoW)
- Add Health Dashboard with must-have %, in-progress, and at-risk metrics
- Add filtering by type, priority, status, and hide completed toggle
- Add item detail modal with dependencies, linked specs, and ideation context
- Add URL state persistence for view mode and filters
- Modernize roadmap commands (`/roadmap:open` now uses Next.js app)

---

## [0.2.0-alpha.3] - 2026-02-01

### Added

- Add centralized site configuration system with feature toggles and env overrides

---

## [0.2.0-alpha.2] - 2026-02-01

### Changed

- Restructure layout architecture with (system) route group

---

## [0.2.0-alpha.1] - 2026-02-01

### Added

- Add orchestrating-parallel-work skill for coordinating concurrent agents
- Add developer guide on parallel execution patterns, anti-patterns, and troubleshooting
- Integrate background agent execution with dependency-aware batch scheduling

---

## [0.1.0-alpha.1] - 2026-02-01

### Added

- Integrate PostHog analytics into Next.js application
- Add vectorizing-images skill, logo generation docs, and metadata guide
- Add Replicate MCP image generation skill and sync harness docs
- Add standard pages for errors, legal compliance, and cookie consent
- Add writing-developer-guides skill and restructure all guides
- Implement BetterAuth authentication with Email OTP
- Add documentation drift detection and reconciliation system
- Add /system template documentation hub with Claude Code harness docs
- Add multi-database support to MCP server (PostgreSQL + SQLite)
- Switch to SQLite for local development + add /db:studio command
- Implement design system showcase with interactive components
- Migrate from Radix UI to Base UI (via basecn)
- Add Knip for dead code detection with /app:cleanup command
- Add /app:upgrade command for comprehensive dependency management
- Add /system:learn command for experimental learning workflows
- Add calculation rules and IDE color scheme commands
- Add proactive clarification skill for improved prompt analysis
- Add argument support to git:commit command
- Add path-specific rules system for contextual code guidance
- Add notification sound management commands
- Add background agent execution patterns for parallel workflows
- Integrate Context7 for up-to-date library documentation
- Add release system with changelog automation

### Changed

- Migrate from ClaudeKit to built-in scripts and task tools
- Restructure spec workflow with parallel background agents
- Update Next.js version to 16.1.0 in Technology Stack
- Clarify Explore vs code-search agent usage
- Comprehensive Claude Code harness documentation
- Use claude-code-guide for official Claude Code documentation
- Add Developer Guides section to CLAUDE.md and fix FSD skill reference

### Fixed

- Resolve lint errors in system UI patterns page
- Use better-sqlite3 adapter for Prisma 7 with SQLite
- Resolve Base UI context errors in overlay components
- Upgrade next to 16.1.0 for security patches

---
