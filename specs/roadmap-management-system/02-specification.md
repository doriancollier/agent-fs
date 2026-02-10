# Roadmap Management System with MoSCoW Prioritization

**Status:** Draft
**Author:** Claude Code
**Date:** December 9, 2025
**Spec ID:** `roadmap-management-system`

---

## Overview

A project roadmap management system that enables tracking and visualizing product features using MoSCoW prioritization (Must-Have, Should-Have, Could-Have, Won't-Have). The system consists of:

1. A JSON-based roadmap data file with schema validation
2. A standalone HTML visualization page (independent of Next.js)
3. Claude Code skill for MoSCoW methodology and Python utilities
4. Claude Code agent acting as a startup PM
5. Slash command for roadmap management operations

---

## Background/Problem Statement

Product roadmaps are essential for startup teams to prioritize work effectively. Without a structured system:

- Features get added without proper prioritization
- Scope creep causes delays (52% of projects experience this)
- Teams lack visibility into what's planned vs. in-progress
- Must-Have items exceed healthy limits (should be <60% of effort)

This system brings MoSCoW prioritization directly into the development workflow via Claude Code, with a visual HTML page for stakeholder communication that works offline.

---

## Goals

- Provide a JSON-based roadmap format that's human-readable and machine-processable
- Enable offline visualization via standalone HTML (no Next.js dependency)
- Support multiple views: Kanban (Now/Next/Later) and List (grouped by MoSCoW)
- Warn when Must-Have items exceed 60% of total effort
- Enable Claude Code to assist with prioritization decisions as a "startup PM"
- Provide Python utilities for validation, sorting, and analysis

---

## Non-Goals

- Database integration (roadmap lives in JSON file)
- Real-time collaboration or multi-user editing
- Integration with external tools (Jira, Linear, Asana)
- AI-powered effort estimation or auto-prioritization
- Interactive editing in HTML (edits via Claude Code only)

---

## Technical Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| Python | 3.8+ | Utility scripts (stdlib only, no pip) |
| JSON Schema | Draft-07 | Schema validation |
| Claude Code | Current | Skills, agents, slash commands |

**No external libraries required** - HTML visualization uses vanilla JavaScript and inline CSS based on Calm Tech design system.

---

## Detailed Design

### 1. Directory Structure

```
/roadmap/
├── roadmap.json        # Main data file
├── schema.json         # JSON Schema for validation
├── roadmap.html        # Visualization page (entry point)
├── styles.css          # Calm Tech styling
└── scripts.js          # View switching, filtering, rendering

/.claude/
├── skills/
│   └── roadmap-moscow/
│       ├── SKILL.md              # Skill definition
│       ├── moscow-guide.md       # MoSCoW methodology reference
│       ├── pm-principles.md      # Startup PM principles
│       └── scripts/
│           ├── validate_roadmap.py   # Schema validation
│           ├── sort_items.py         # Sort by priority/status
│           ├── check_health.py       # Must-Have % check
│           ├── generate_summary.py   # Text summary generation
│           └── utils.py              # Shared utilities
├── agents/
│   └── product-manager.md        # PM agent definition
└── commands/
    └── roadmap.md                # /roadmap slash command
```

### 2. JSON Schema Design

#### 2.1 Root Schema (`schema.json`)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Product Roadmap",
  "type": "object",
  "required": ["projectName", "projectSummary", "lastUpdated", "timeHorizons", "items"],
  "properties": {
    "projectName": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100,
      "description": "Name of the project"
    },
    "projectSummary": {
      "type": "string",
      "maxLength": 500,
      "description": "Brief description of the project"
    },
    "lastUpdated": {
      "type": "string",
      "format": "date-time",
      "description": "ISO 8601 timestamp of last update"
    },
    "timeHorizons": {
      "type": "object",
      "required": ["now", "next", "later"],
      "properties": {
        "now": {
          "type": "object",
          "required": ["label", "description"],
          "properties": {
            "label": { "type": "string" },
            "description": { "type": "string" }
          }
        },
        "next": {
          "type": "object",
          "required": ["label", "description"],
          "properties": {
            "label": { "type": "string" },
            "description": { "type": "string" }
          }
        },
        "later": {
          "type": "object",
          "required": ["label", "description"],
          "properties": {
            "label": { "type": "string" },
            "description": { "type": "string" }
          }
        }
      }
    },
    "items": {
      "type": "array",
      "items": { "$ref": "#/definitions/roadmapItem" }
    }
  },
  "definitions": {
    "roadmapItem": {
      "type": "object",
      "required": ["id", "title", "type", "moscow", "status", "health", "timeHorizon", "createdAt", "updatedAt"],
      "properties": {
        "id": {
          "type": "string",
          "pattern": "^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$",
          "description": "UUID v4"
        },
        "title": {
          "type": "string",
          "minLength": 3,
          "maxLength": 200
        },
        "description": {
          "type": "string",
          "maxLength": 2000
        },
        "type": {
          "type": "string",
          "enum": ["feature", "bugfix", "technical-debt", "research", "epic"]
        },
        "moscow": {
          "type": "string",
          "enum": ["must-have", "should-have", "could-have", "wont-have"]
        },
        "status": {
          "type": "string",
          "enum": ["not-started", "in-progress", "completed", "on-hold"]
        },
        "health": {
          "type": "string",
          "enum": ["on-track", "at-risk", "off-track", "blocked"]
        },
        "timeHorizon": {
          "type": "string",
          "enum": ["now", "next", "later"]
        },
        "effort": {
          "type": "number",
          "minimum": 0,
          "description": "Story points (1-13 Fibonacci scale recommended)"
        },
        "dependencies": {
          "type": "array",
          "items": { "type": "string" },
          "description": "Array of item IDs this depends on"
        },
        "labels": {
          "type": "array",
          "items": { "type": "string" }
        },
        "createdAt": {
          "type": "string",
          "format": "date-time"
        },
        "updatedAt": {
          "type": "string",
          "format": "date-time"
        }
      }
    }
  }
}
```

#### 2.2 Example Roadmap Data (`roadmap.json`)

```json
{
  "projectName": "Dunny - Personal Finance Manager",
  "projectSummary": "A Next.js application for managing bank accounts and financial data via Plaid integration.",
  "lastUpdated": "2025-12-09T12:00:00Z",
  "timeHorizons": {
    "now": {
      "label": "Now (Current Sprint)",
      "description": "Active work, 2-week sprint"
    },
    "next": {
      "label": "Next (2-4 weeks)",
      "description": "Planned for upcoming sprints"
    },
    "later": {
      "label": "Later (1-3 months)",
      "description": "On the radar but not scheduled"
    }
  },
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "title": "Implement account balance display",
      "description": "Show current balance for linked bank accounts on the dashboard",
      "type": "feature",
      "moscow": "must-have",
      "status": "in-progress",
      "health": "on-track",
      "timeHorizon": "now",
      "effort": 5,
      "dependencies": [],
      "labels": ["dashboard", "plaid"],
      "createdAt": "2025-12-08T10:00:00Z",
      "updatedAt": "2025-12-09T08:00:00Z"
    }
  ]
}
```

### 3. HTML Visualization Design

#### 3.1 File: `roadmap.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Product Roadmap</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <!-- Header -->
    <header class="header">
      <div class="header-content">
        <h1 id="project-name">Loading...</h1>
        <p id="project-summary" class="summary"></p>
      </div>
      <div class="header-meta">
        <span id="last-updated" class="meta-text"></span>
      </div>
    </header>

    <!-- Health Dashboard -->
    <section class="health-dashboard">
      <div class="health-card">
        <span class="health-label">Must-Have Effort</span>
        <span id="must-have-percent" class="health-value">0%</span>
        <div id="must-have-warning" class="health-warning hidden">
          Warning: Exceeds 60% threshold
        </div>
      </div>
      <div class="health-card">
        <span class="health-label">Items</span>
        <span id="total-items" class="health-value">0</span>
      </div>
      <div class="health-card">
        <span class="health-label">In Progress</span>
        <span id="in-progress-count" class="health-value">0</span>
      </div>
      <div class="health-card">
        <span class="health-label">At Risk / Blocked</span>
        <span id="at-risk-count" class="health-value risk">0</span>
      </div>
    </section>

    <!-- Controls -->
    <section class="controls">
      <div class="view-toggle">
        <button id="kanban-btn" class="toggle-btn active">Kanban</button>
        <button id="list-btn" class="toggle-btn">List</button>
      </div>
      <div class="filters">
        <select id="filter-type" class="filter-select">
          <option value="">All Types</option>
          <option value="feature">Feature</option>
          <option value="bugfix">Bugfix</option>
          <option value="technical-debt">Technical Debt</option>
          <option value="research">Research</option>
          <option value="epic">Epic</option>
        </select>
        <select id="filter-moscow" class="filter-select">
          <option value="">All Priorities</option>
          <option value="must-have">Must Have</option>
          <option value="should-have">Should Have</option>
          <option value="could-have">Could Have</option>
          <option value="wont-have">Won't Have</option>
        </select>
        <select id="filter-health" class="filter-select">
          <option value="">All Health</option>
          <option value="on-track">On Track</option>
          <option value="at-risk">At Risk</option>
          <option value="off-track">Off Track</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>
    </section>

    <!-- Kanban View -->
    <section id="kanban-view" class="kanban-view">
      <div class="kanban-column" data-horizon="now">
        <h2 class="column-header">Now</h2>
        <div id="now-items" class="column-items"></div>
      </div>
      <div class="kanban-column" data-horizon="next">
        <h2 class="column-header">Next</h2>
        <div id="next-items" class="column-items"></div>
      </div>
      <div class="kanban-column" data-horizon="later">
        <h2 class="column-header">Later</h2>
        <div id="later-items" class="column-items"></div>
      </div>
    </section>

    <!-- List View -->
    <section id="list-view" class="list-view hidden">
      <div class="list-group" data-moscow="must-have">
        <h2 class="group-header must-have">Must Have</h2>
        <div id="must-have-items" class="group-items"></div>
      </div>
      <div class="list-group" data-moscow="should-have">
        <h2 class="group-header should-have">Should Have</h2>
        <div id="should-have-items" class="group-items"></div>
      </div>
      <div class="list-group" data-moscow="could-have">
        <h2 class="group-header could-have">Could Have</h2>
        <div id="could-have-items" class="group-items"></div>
      </div>
      <div class="list-group" data-moscow="wont-have">
        <h2 class="group-header wont-have">Won't Have</h2>
        <div id="wont-have-items" class="group-items"></div>
      </div>
    </section>

    <!-- Empty State -->
    <div id="empty-state" class="empty-state hidden">
      <p>No items match the current filters.</p>
    </div>
  </div>

  <script src="scripts.js"></script>
</body>
</html>
```

#### 3.2 File: `styles.css`

Follows Calm Tech design language with OKLCH colors, soft shadows, and generous spacing:

```css
/* ==========================================================================
   Roadmap Visualization - Calm Tech Design System
   Standalone CSS (no Tailwind dependency)
   ========================================================================== */

/* CSS Reset & Base */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  /* Typography */
  --font-sans: 'Geist Sans', system-ui, -apple-system, sans-serif;
  --font-mono: 'Geist Mono', ui-monospace, monospace;

  /* Light Mode Colors (OKLCH) */
  --background: oklch(0.985 0.002 250);
  --foreground: oklch(0.13 0.004 260);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.13 0.004 260);
  --muted: oklch(0.965 0.003 260);
  --muted-foreground: oklch(0.55 0.014 260);
  --border: oklch(0.915 0.004 260);
  --primary: oklch(0.205 0.006 260);
  --primary-foreground: oklch(0.985 0.002 250);
  --secondary: oklch(0.965 0.003 260);
  --secondary-foreground: oklch(0.205 0.006 260);
  --destructive: oklch(0.577 0.22 25);
  --success: oklch(0.59 0.17 145);
  --warning: oklch(0.68 0.16 55);
  --info: oklch(0.55 0.2 260);

  /* Shadows */
  --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.06), 0 4px 6px -4px rgb(0 0 0 / 0.06);

  /* Border Radius */
  --radius-sm: 0.5rem;
  --radius-md: 0.625rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;

  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  :root {
    --background: oklch(0.098 0.005 260);
    --foreground: oklch(0.98 0.002 250);
    --card: oklch(0.145 0.005 260);
    --card-foreground: oklch(0.98 0.002 250);
    --muted: oklch(0.185 0.005 260);
    --muted-foreground: oklch(0.65 0.012 260);
    --border: oklch(0.24 0.005 260);
    --primary: oklch(0.98 0.002 250);
    --primary-foreground: oklch(0.145 0.005 260);
    --secondary: oklch(0.22 0.006 260);
    --secondary-foreground: oklch(0.98 0.002 250);
    --destructive: oklch(0.65 0.2 20);
    --success: oklch(0.65 0.16 145);
    --warning: oklch(0.75 0.14 55);
    --info: oklch(0.65 0.17 260);

    --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.5), 0 1px 2px -1px rgb(0 0 0 / 0.5);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.5), 0 2px 4px -2px rgb(0 0 0 / 0.5);
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.5);
  }
}

html {
  font-feature-settings: "rlig" 1, "calt" 1;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: var(--font-sans);
  font-size: 15px;
  line-height: 1.6;
  color: var(--foreground);
  background: var(--background);
  min-height: 100vh;
}

/* Container */
.container {
  max-width: 72rem;
  margin: 0 auto;
  padding: var(--space-6) var(--space-4);
}

@media (min-width: 640px) {
  .container {
    padding: var(--space-8) var(--space-6);
  }
}

/* Header */
.header {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin-bottom: var(--space-8);
}

@media (min-width: 768px) {
  .header {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
  }
}

.header h1 {
  font-size: 1.875rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  color: var(--foreground);
}

.summary {
  color: var(--muted-foreground);
  font-size: 0.9375rem;
  margin-top: var(--space-2);
  max-width: 40rem;
}

.meta-text {
  font-size: 0.8125rem;
  color: var(--muted-foreground);
}

/* Health Dashboard */
.health-dashboard {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);
  margin-bottom: var(--space-8);
}

@media (min-width: 768px) {
  .health-dashboard {
    grid-template-columns: repeat(4, 1fr);
  }
}

.health-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: var(--space-5);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.health-label {
  font-size: 0.8125rem;
  color: var(--muted-foreground);
  font-weight: 500;
}

.health-value {
  font-size: 1.5rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.health-value.risk {
  color: var(--destructive);
}

.health-warning {
  font-size: 0.75rem;
  color: var(--destructive);
  font-weight: 500;
  margin-top: var(--space-1);
  padding: var(--space-2) var(--space-3);
  background: oklch(from var(--destructive) l c h / 0.1);
  border-radius: var(--radius-sm);
}

.health-warning.hidden {
  display: none;
}

/* Controls */
.controls {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

@media (min-width: 768px) {
  .controls {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.view-toggle {
  display: flex;
  background: var(--muted);
  border-radius: var(--radius-md);
  padding: var(--space-1);
}

.toggle-btn {
  padding: var(--space-2) var(--space-4);
  border: none;
  background: transparent;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--muted-foreground);
  cursor: pointer;
  transition: all 150ms ease-out;
}

.toggle-btn:hover {
  color: var(--foreground);
}

.toggle-btn.active {
  background: var(--card);
  color: var(--foreground);
  box-shadow: var(--shadow-sm);
}

.filters {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.filter-select {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--card);
  color: var(--foreground);
  font-size: 0.875rem;
  min-width: 140px;
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--background), 0 0 0 4px var(--info);
}

/* Kanban View */
.kanban-view {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-6);
}

@media (min-width: 1024px) {
  .kanban-view {
    grid-template-columns: repeat(3, 1fr);
  }
}

.kanban-view.hidden {
  display: none;
}

.kanban-column {
  background: var(--muted);
  border-radius: var(--radius-xl);
  padding: var(--space-4);
  min-height: 300px;
}

.column-header {
  font-size: 1rem;
  font-weight: 600;
  color: var(--foreground);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--border);
  margin-bottom: var(--space-4);
}

.column-items {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

/* List View */
.list-view {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.list-view.hidden {
  display: none;
}

.group-header {
  font-size: 1.125rem;
  font-weight: 600;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-4);
}

.group-header.must-have {
  background: oklch(from var(--destructive) l c h / 0.1);
  color: var(--destructive);
}

.group-header.should-have {
  background: oklch(from var(--warning) l c h / 0.1);
  color: var(--warning);
}

.group-header.could-have {
  background: oklch(from var(--info) l c h / 0.1);
  color: var(--info);
}

.group-header.wont-have {
  background: var(--muted);
  color: var(--muted-foreground);
}

.group-items {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

/* Item Card */
.item-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: var(--space-5);
  box-shadow: var(--shadow-sm);
  transition: all 150ms ease-out;
}

.item-card:hover {
  box-shadow: var(--shadow-md);
  border-color: oklch(from var(--border) l c h / 0.8);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}

.item-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--foreground);
}

.item-badges {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.badge {
  font-size: 0.6875rem;
  font-weight: 500;
  padding: var(--space-1) var(--space-2);
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.badge.moscow {
  background: var(--primary);
  color: var(--primary-foreground);
}

.badge.moscow.must-have {
  background: var(--destructive);
  color: white;
}

.badge.moscow.should-have {
  background: var(--warning);
  color: var(--primary);
}

.badge.moscow.could-have {
  background: var(--info);
  color: white;
}

.badge.moscow.wont-have {
  background: var(--muted);
  color: var(--muted-foreground);
}

.badge.type {
  background: var(--secondary);
  color: var(--secondary-foreground);
}

.badge.health {
  font-size: 0.625rem;
}

.badge.health.on-track {
  background: oklch(from var(--success) l c h / 0.15);
  color: var(--success);
}

.badge.health.at-risk {
  background: oklch(from var(--warning) l c h / 0.15);
  color: var(--warning);
}

.badge.health.off-track,
.badge.health.blocked {
  background: oklch(from var(--destructive) l c h / 0.15);
  color: var(--destructive);
}

.item-description {
  font-size: 0.875rem;
  color: var(--muted-foreground);
  line-height: 1.5;
  margin-bottom: var(--space-3);
}

.item-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  font-size: 0.75rem;
  color: var(--muted-foreground);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.item-labels {
  display: flex;
  gap: var(--space-1);
  margin-top: var(--space-3);
  flex-wrap: wrap;
}

.label-tag {
  font-size: 0.6875rem;
  padding: var(--space-1) var(--space-2);
  background: var(--muted);
  color: var(--muted-foreground);
  border-radius: var(--radius-sm);
}

/* Dependencies indicator */
.dependencies-indicator {
  font-size: 0.75rem;
  color: var(--warning);
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: var(--space-12);
  color: var(--muted-foreground);
}

.empty-state.hidden {
  display: none;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .health-dashboard {
    grid-template-columns: 1fr;
  }

  .filters {
    flex-direction: column;
  }

  .filter-select {
    width: 100%;
  }
}
```

#### 3.3 File: `scripts.js`

```javascript
/**
 * Roadmap Visualization - Vanilla JavaScript
 * Loads roadmap.json and renders Kanban/List views
 */

(function() {
  'use strict';

  // State
  let roadmapData = null;
  let currentView = 'kanban';
  let filters = {
    type: '',
    moscow: '',
    health: ''
  };

  // DOM Elements
  const elements = {
    projectName: document.getElementById('project-name'),
    projectSummary: document.getElementById('project-summary'),
    lastUpdated: document.getElementById('last-updated'),
    mustHavePercent: document.getElementById('must-have-percent'),
    mustHaveWarning: document.getElementById('must-have-warning'),
    totalItems: document.getElementById('total-items'),
    inProgressCount: document.getElementById('in-progress-count'),
    atRiskCount: document.getElementById('at-risk-count'),
    kanbanView: document.getElementById('kanban-view'),
    listView: document.getElementById('list-view'),
    kanbanBtn: document.getElementById('kanban-btn'),
    listBtn: document.getElementById('list-btn'),
    filterType: document.getElementById('filter-type'),
    filterMoscow: document.getElementById('filter-moscow'),
    filterHealth: document.getElementById('filter-health'),
    emptyState: document.getElementById('empty-state'),
    // Column containers
    nowItems: document.getElementById('now-items'),
    nextItems: document.getElementById('next-items'),
    laterItems: document.getElementById('later-items'),
    // List containers
    mustHaveItems: document.getElementById('must-have-items'),
    shouldHaveItems: document.getElementById('should-have-items'),
    couldHaveItems: document.getElementById('could-have-items'),
    wontHaveItems: document.getElementById('wont-have-items')
  };

  // Initialize
  async function init() {
    try {
      const response = await fetch('roadmap.json');
      if (!response.ok) throw new Error('Failed to load roadmap.json');
      roadmapData = await response.json();

      renderHeader();
      renderHealthDashboard();
      renderRoadmap();
      setupEventListeners();
    } catch (error) {
      console.error('Error loading roadmap:', error);
      elements.projectName.textContent = 'Error Loading Roadmap';
      elements.projectSummary.textContent = error.message;
    }
  }

  // Render header
  function renderHeader() {
    elements.projectName.textContent = roadmapData.projectName;
    elements.projectSummary.textContent = roadmapData.projectSummary;

    const date = new Date(roadmapData.lastUpdated);
    elements.lastUpdated.textContent = `Last updated: ${date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`;
  }

  // Render health dashboard
  function renderHealthDashboard() {
    const items = roadmapData.items;

    // Calculate Must-Have percentage
    const totalEffort = items.reduce((sum, item) => sum + (item.effort || 0), 0);
    const mustHaveEffort = items
      .filter(item => item.moscow === 'must-have')
      .reduce((sum, item) => sum + (item.effort || 0), 0);

    const mustHavePercent = totalEffort > 0
      ? Math.round((mustHaveEffort / totalEffort) * 100)
      : 0;

    elements.mustHavePercent.textContent = `${mustHavePercent}%`;

    // Show warning if > 60%
    if (mustHavePercent > 60) {
      elements.mustHaveWarning.classList.remove('hidden');
      elements.mustHavePercent.style.color = 'var(--destructive)';
    } else {
      elements.mustHaveWarning.classList.add('hidden');
      elements.mustHavePercent.style.color = '';
    }

    // Other stats
    elements.totalItems.textContent = items.length;
    elements.inProgressCount.textContent = items.filter(i => i.status === 'in-progress').length;
    elements.atRiskCount.textContent = items.filter(i =>
      i.health === 'at-risk' || i.health === 'off-track' || i.health === 'blocked'
    ).length;
  }

  // Get filtered items
  function getFilteredItems() {
    return roadmapData.items.filter(item => {
      if (filters.type && item.type !== filters.type) return false;
      if (filters.moscow && item.moscow !== filters.moscow) return false;
      if (filters.health && item.health !== filters.health) return false;
      return true;
    });
  }

  // Create item card HTML
  function createItemCard(item) {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.dataset.id = item.id;

    const hasDependencies = item.dependencies && item.dependencies.length > 0;

    card.innerHTML = `
      <div class="item-header">
        <span class="item-title">${escapeHtml(item.title)}</span>
        <div class="item-badges">
          <span class="badge health ${item.health}">${formatHealth(item.health)}</span>
        </div>
      </div>
      ${item.description ? `<p class="item-description">${escapeHtml(item.description)}</p>` : ''}
      <div class="item-meta">
        <span class="badge moscow ${item.moscow}">${formatMoscow(item.moscow)}</span>
        <span class="badge type">${formatType(item.type)}</span>
        ${item.effort ? `<span class="meta-item">Effort: ${item.effort}</span>` : ''}
        <span class="meta-item">${formatStatus(item.status)}</span>
        ${hasDependencies ? `<span class="dependencies-indicator">Depends on ${item.dependencies.length} item(s)</span>` : ''}
      </div>
      ${item.labels && item.labels.length > 0 ? `
        <div class="item-labels">
          ${item.labels.map(label => `<span class="label-tag">${escapeHtml(label)}</span>`).join('')}
        </div>
      ` : ''}
    `;

    return card;
  }

  // Render roadmap based on current view
  function renderRoadmap() {
    const filteredItems = getFilteredItems();

    // Show/hide empty state
    if (filteredItems.length === 0) {
      elements.emptyState.classList.remove('hidden');
    } else {
      elements.emptyState.classList.add('hidden');
    }

    if (currentView === 'kanban') {
      renderKanbanView(filteredItems);
    } else {
      renderListView(filteredItems);
    }
  }

  // Render Kanban view
  function renderKanbanView(items) {
    // Clear columns
    elements.nowItems.innerHTML = '';
    elements.nextItems.innerHTML = '';
    elements.laterItems.innerHTML = '';

    // Group by time horizon
    const grouped = {
      now: items.filter(i => i.timeHorizon === 'now'),
      next: items.filter(i => i.timeHorizon === 'next'),
      later: items.filter(i => i.timeHorizon === 'later')
    };

    // Render each group
    grouped.now.forEach(item => elements.nowItems.appendChild(createItemCard(item)));
    grouped.next.forEach(item => elements.nextItems.appendChild(createItemCard(item)));
    grouped.later.forEach(item => elements.laterItems.appendChild(createItemCard(item)));

    // Update column headers with counts
    document.querySelector('[data-horizon="now"] .column-header').textContent =
      `${roadmapData.timeHorizons.now.label} (${grouped.now.length})`;
    document.querySelector('[data-horizon="next"] .column-header').textContent =
      `${roadmapData.timeHorizons.next.label} (${grouped.next.length})`;
    document.querySelector('[data-horizon="later"] .column-header').textContent =
      `${roadmapData.timeHorizons.later.label} (${grouped.later.length})`;
  }

  // Render List view
  function renderListView(items) {
    // Clear groups
    elements.mustHaveItems.innerHTML = '';
    elements.shouldHaveItems.innerHTML = '';
    elements.couldHaveItems.innerHTML = '';
    elements.wontHaveItems.innerHTML = '';

    // Group by MoSCoW
    const grouped = {
      'must-have': items.filter(i => i.moscow === 'must-have'),
      'should-have': items.filter(i => i.moscow === 'should-have'),
      'could-have': items.filter(i => i.moscow === 'could-have'),
      'wont-have': items.filter(i => i.moscow === 'wont-have')
    };

    // Render each group
    grouped['must-have'].forEach(item => elements.mustHaveItems.appendChild(createItemCard(item)));
    grouped['should-have'].forEach(item => elements.shouldHaveItems.appendChild(createItemCard(item)));
    grouped['could-have'].forEach(item => elements.couldHaveItems.appendChild(createItemCard(item)));
    grouped['wont-have'].forEach(item => elements.wontHaveItems.appendChild(createItemCard(item)));
  }

  // Setup event listeners
  function setupEventListeners() {
    // View toggle
    elements.kanbanBtn.addEventListener('click', () => {
      currentView = 'kanban';
      elements.kanbanBtn.classList.add('active');
      elements.listBtn.classList.remove('active');
      elements.kanbanView.classList.remove('hidden');
      elements.listView.classList.add('hidden');
      renderRoadmap();
    });

    elements.listBtn.addEventListener('click', () => {
      currentView = 'list';
      elements.listBtn.classList.add('active');
      elements.kanbanBtn.classList.remove('active');
      elements.listView.classList.remove('hidden');
      elements.kanbanView.classList.add('hidden');
      renderRoadmap();
    });

    // Filters
    elements.filterType.addEventListener('change', (e) => {
      filters.type = e.target.value;
      renderRoadmap();
    });

    elements.filterMoscow.addEventListener('change', (e) => {
      filters.moscow = e.target.value;
      renderRoadmap();
    });

    elements.filterHealth.addEventListener('change', (e) => {
      filters.health = e.target.value;
      renderRoadmap();
    });
  }

  // Helper functions
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function formatMoscow(moscow) {
    const map = {
      'must-have': 'Must',
      'should-have': 'Should',
      'could-have': 'Could',
      'wont-have': "Won't"
    };
    return map[moscow] || moscow;
  }

  function formatType(type) {
    return type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  function formatStatus(status) {
    const map = {
      'not-started': 'Not Started',
      'in-progress': 'In Progress',
      'completed': 'Completed',
      'on-hold': 'On Hold'
    };
    return map[status] || status;
  }

  function formatHealth(health) {
    const map = {
      'on-track': 'On Track',
      'at-risk': 'At Risk',
      'off-track': 'Off Track',
      'blocked': 'Blocked'
    };
    return map[health] || health;
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
```

### 4. Claude Code Skill Design

#### 4.1 File: `.claude/skills/roadmap-moscow/SKILL.md`

```markdown
---
name: roadmap-moscow
description: Manage product roadmaps using MoSCoW prioritization. Use when working with project roadmaps, feature prioritization, or product planning tasks.
---

# Roadmap MoSCoW Management

This skill provides tools and methodology for managing product roadmaps using MoSCoW prioritization (Must-Have, Should-Have, Could-Have, Won't-Have).

## When to Use

- Adding, updating, or reviewing roadmap items
- Analyzing roadmap health and balance
- Validating roadmap JSON structure
- Generating roadmap summaries
- Checking Must-Have percentage (should be <60%)

## Roadmap Location

The roadmap data lives at `/roadmap/roadmap.json`

## Python Utilities

All scripts use Python 3 stdlib only (no pip dependencies).

### Validate Roadmap

```bash
python3 .claude/skills/roadmap-moscow/scripts/validate_roadmap.py
```

Validates `roadmap.json` against the JSON schema. Returns exit code 0 if valid.

### Sort Items

```bash
# Sort by MoSCoW priority (must → should → could → won't)
python3 .claude/skills/roadmap-moscow/scripts/sort_items.py --by moscow

# Sort by status
python3 .claude/skills/roadmap-moscow/scripts/sort_items.py --by status

# Sort by time horizon
python3 .claude/skills/roadmap-moscow/scripts/sort_items.py --by horizon
```

### Check Health

```bash
python3 .claude/skills/roadmap-moscow/scripts/check_health.py
```

Analyzes roadmap health:
- Must-Have % (warns if >60%)
- Items at risk or blocked
- Items missing effort estimates
- Dependency issues

### Generate Summary

```bash
python3 .claude/skills/roadmap-moscow/scripts/generate_summary.py
```

Outputs a text summary of the roadmap suitable for stakeholder communication.

## MoSCoW Methodology

See [moscow-guide.md](moscow-guide.md) for the complete MoSCoW methodology reference.

## PM Principles

See [pm-principles.md](pm-principles.md) for startup product management principles.

## Editing the Roadmap

When making changes to `roadmap.json`:

1. Always update `lastUpdated` timestamp
2. Always update item's `updatedAt` when modifying
3. Run validation after changes
4. Keep Must-Have items <60% of total effort

## JSON Schema

The schema is defined at `/roadmap/schema.json`. Key rules:
- Item IDs must be valid UUID v4
- `moscow` must be one of: must-have, should-have, could-have, wont-have
- `status` must be one of: not-started, in-progress, completed, on-hold
- `health` must be one of: on-track, at-risk, off-track, blocked
- `timeHorizon` must be one of: now, next, later
```

#### 4.2 File: `.claude/skills/roadmap-moscow/moscow-guide.md`

```markdown
# MoSCoW Prioritization Guide

## Overview

MoSCoW is a prioritization method that categorizes requirements into four groups:

| Category | Meaning | Guideline |
|----------|---------|-----------|
| **Must Have** | Critical - without it, the project fails | Keep <60% of total effort |
| **Should Have** | Important but not time-critical | Can be delayed if needed |
| **Could Have** | Desirable but not necessary | Include if time permits |
| **Won't Have** | Explicitly out of scope for now | Prevents scope creep |

## The 60% Rule

**Must-Have items should never exceed 60% of total effort.**

If Must-Haves exceed 60%:
- Project predictability decreases
- Risk of missing deadlines increases
- Team becomes overwhelmed
- Quality suffers

## How to Categorize

### Must Have
Ask: "Will the project fail without this?"
- Core functionality that defines the product
- Regulatory or compliance requirements
- Critical integrations
- Blockers for other Must-Have items

### Should Have
Ask: "Is this important but survivable without?"
- Significant user value but workarounds exist
- Important for user satisfaction
- Can wait for next iteration

### Could Have
Ask: "Would this be nice to have?"
- Quality of life improvements
- Nice-to-have features
- Polish and refinement
- Low effort, incremental value

### Won't Have
Ask: "Should we explicitly defer this?"
- Out of scope for current timeline
- Low priority relative to others
- Requires dependencies not yet built
- Good ideas for future consideration

## Common Mistakes

1. **Everything is Must-Have** - Forces difficult trade-offs later
2. **No Won't-Have items** - Invites scope creep
3. **Skipping Should-Have** - Blurs the line between critical and optional
4. **Not revisiting priorities** - Context changes; priorities should too

## Integration with Time Horizons

| Time Horizon | Typical MoSCoW Mix |
|--------------|-------------------|
| **Now** | Mostly Must-Have, some Should-Have |
| **Next** | Mix of Should-Have and Could-Have |
| **Later** | Could-Have and future Must-Haves |

## Review Cadence

- **Weekly**: Quick health check on Must-Have items
- **Sprint boundary**: Re-evaluate priorities
- **Monthly**: Full roadmap review with stakeholders
```

#### 4.3 File: `.claude/skills/roadmap-moscow/pm-principles.md`

```markdown
# Startup Product Management Principles

## Core Philosophy

As a startup PM, prioritize:
1. **Speed over perfection** - Ship fast, iterate faster
2. **Value over features** - Focus on user outcomes
3. **Simplicity over complexity** - Build the minimum that works
4. **Learning over planning** - Validate assumptions quickly

## Prioritization Heuristics

### The Quick Win Rule
Identify items that are:
- High value to users
- Low effort to implement
- Clear path to completion

**Execute quick wins first** to build momentum.

### The Scope Creep Detector
Watch for:
- "Just one more feature" requests
- Requirements expanding beyond original plan
- Features without clear user benefit

**Counter-move**: Use Won't-Have category actively.

### The Dependency Rule
If Feature B requires Feature A:
- Feature A gets higher priority automatically
- Consider if both should ship together
- Map dependencies explicitly

### The 80/20 Focus
Ask: "What 20% of features deliver 80% of value?"
- Focus Must-Have on that 20%
- Everything else is Should/Could

## Decision Framework

When evaluating a feature request:

```
1. Who is asking? (Customer, stakeholder, team)
2. What problem does it solve?
3. How many users are affected?
4. What's the effort to build?
5. What's the cost of NOT doing it?
6. Does it align with our current goals?
```

## Time Horizon Guidelines

### Now (Current Sprint)
- **2 weeks** of active work
- Only items actively being worked on
- Must-Have and urgent Should-Have only

### Next (2-4 weeks)
- Items planned for upcoming sprints
- Refined enough to estimate
- Dependencies resolved or planned

### Later (1-3 months)
- On the radar but not scheduled
- May need more research/refinement
- Subject to reprioritization

## Stakeholder Communication

When presenting roadmap:
1. Lead with outcomes, not features
2. Explain the "why" behind priorities
3. Be transparent about trade-offs
4. Set expectations (not promises)

## Red Flags to Watch

- Must-Have >60% of effort
- No items in Won't-Have (scope creep risk)
- Too many items At Risk or Blocked
- Dependencies creating bottlenecks
- Items sitting in "In Progress" too long
```

#### 4.4 Python Scripts

##### `scripts/utils.py`

```python
#!/usr/bin/env python3
"""Shared utilities for roadmap scripts."""

import json
import os
from pathlib import Path
from datetime import datetime
from typing import Any

# Find project root (contains roadmap/ directory)
def get_project_root() -> Path:
    """Find the project root directory."""
    current = Path(__file__).resolve()
    while current != current.parent:
        if (current / 'roadmap' / 'roadmap.json').exists():
            return current
        current = current.parent
    raise FileNotFoundError("Could not find project root with roadmap/roadmap.json")

def get_roadmap_path() -> Path:
    """Get path to roadmap.json."""
    return get_project_root() / 'roadmap' / 'roadmap.json'

def get_schema_path() -> Path:
    """Get path to schema.json."""
    return get_project_root() / 'roadmap' / 'schema.json'

def load_roadmap() -> dict[str, Any]:
    """Load and parse roadmap.json."""
    with open(get_roadmap_path(), 'r') as f:
        return json.load(f)

def save_roadmap(data: dict[str, Any]) -> None:
    """Save roadmap data back to file."""
    data['lastUpdated'] = datetime.utcnow().isoformat() + 'Z'
    with open(get_roadmap_path(), 'w') as f:
        json.dump(data, f, indent=2)

def load_schema() -> dict[str, Any]:
    """Load and parse schema.json."""
    with open(get_schema_path(), 'r') as f:
        return json.load(f)

# MoSCoW priority order
MOSCOW_ORDER = ['must-have', 'should-have', 'could-have', 'wont-have']

# Status order
STATUS_ORDER = ['in-progress', 'not-started', 'on-hold', 'completed']

# Horizon order
HORIZON_ORDER = ['now', 'next', 'later']

def get_sort_key(item: dict, sort_by: str) -> tuple:
    """Get sort key for an item based on sort criteria."""
    if sort_by == 'moscow':
        try:
            moscow_idx = MOSCOW_ORDER.index(item.get('moscow', 'wont-have'))
        except ValueError:
            moscow_idx = len(MOSCOW_ORDER)
        return (moscow_idx, item.get('title', ''))

    elif sort_by == 'status':
        try:
            status_idx = STATUS_ORDER.index(item.get('status', 'not-started'))
        except ValueError:
            status_idx = len(STATUS_ORDER)
        return (status_idx, item.get('title', ''))

    elif sort_by == 'horizon':
        try:
            horizon_idx = HORIZON_ORDER.index(item.get('timeHorizon', 'later'))
        except ValueError:
            horizon_idx = len(HORIZON_ORDER)
        return (horizon_idx, item.get('title', ''))

    else:
        return (item.get('title', ''),)
```

##### `scripts/validate_roadmap.py`

```python
#!/usr/bin/env python3
"""Validate roadmap.json against the JSON schema."""

import sys
import json
import re
from utils import load_roadmap, load_schema

def validate_uuid(value: str) -> bool:
    """Validate UUID v4 format."""
    pattern = r'^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$'
    return bool(re.match(pattern, value, re.IGNORECASE))

def validate_datetime(value: str) -> bool:
    """Validate ISO 8601 datetime format."""
    pattern = r'^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z?$'
    return bool(re.match(pattern, value))

def validate_enum(value: str, allowed: list) -> bool:
    """Validate value is in allowed list."""
    return value in allowed

def validate_item(item: dict, idx: int) -> list[str]:
    """Validate a single roadmap item."""
    errors = []

    # Required fields
    required = ['id', 'title', 'type', 'moscow', 'status', 'health', 'timeHorizon', 'createdAt', 'updatedAt']
    for field in required:
        if field not in item:
            errors.append(f"Item {idx}: missing required field '{field}'")

    # ID validation
    if 'id' in item and not validate_uuid(item['id']):
        errors.append(f"Item {idx}: invalid UUID format for 'id'")

    # Title length
    if 'title' in item:
        if len(item['title']) < 3:
            errors.append(f"Item {idx}: title too short (min 3 chars)")
        if len(item['title']) > 200:
            errors.append(f"Item {idx}: title too long (max 200 chars)")

    # Enum validations
    if 'type' in item and not validate_enum(item['type'], ['feature', 'bugfix', 'technical-debt', 'research', 'epic']):
        errors.append(f"Item {idx}: invalid type '{item['type']}'")

    if 'moscow' in item and not validate_enum(item['moscow'], ['must-have', 'should-have', 'could-have', 'wont-have']):
        errors.append(f"Item {idx}: invalid moscow '{item['moscow']}'")

    if 'status' in item and not validate_enum(item['status'], ['not-started', 'in-progress', 'completed', 'on-hold']):
        errors.append(f"Item {idx}: invalid status '{item['status']}'")

    if 'health' in item and not validate_enum(item['health'], ['on-track', 'at-risk', 'off-track', 'blocked']):
        errors.append(f"Item {idx}: invalid health '{item['health']}'")

    if 'timeHorizon' in item and not validate_enum(item['timeHorizon'], ['now', 'next', 'later']):
        errors.append(f"Item {idx}: invalid timeHorizon '{item['timeHorizon']}'")

    # Datetime validation
    for field in ['createdAt', 'updatedAt']:
        if field in item and not validate_datetime(item[field]):
            errors.append(f"Item {idx}: invalid datetime format for '{field}'")

    # Effort must be non-negative
    if 'effort' in item and item['effort'] < 0:
        errors.append(f"Item {idx}: effort must be non-negative")

    # Dependencies must be array of strings
    if 'dependencies' in item:
        if not isinstance(item['dependencies'], list):
            errors.append(f"Item {idx}: dependencies must be an array")
        elif not all(isinstance(d, str) for d in item['dependencies']):
            errors.append(f"Item {idx}: all dependencies must be strings")

    # Labels must be array of strings
    if 'labels' in item:
        if not isinstance(item['labels'], list):
            errors.append(f"Item {idx}: labels must be an array")
        elif not all(isinstance(l, str) for l in item['labels']):
            errors.append(f"Item {idx}: all labels must be strings")

    return errors

def validate_roadmap(data: dict) -> list[str]:
    """Validate the entire roadmap structure."""
    errors = []

    # Required top-level fields
    required = ['projectName', 'projectSummary', 'lastUpdated', 'timeHorizons', 'items']
    for field in required:
        if field not in data:
            errors.append(f"Missing required field '{field}'")

    # Validate timeHorizons
    if 'timeHorizons' in data:
        for horizon in ['now', 'next', 'later']:
            if horizon not in data['timeHorizons']:
                errors.append(f"Missing timeHorizon '{horizon}'")
            elif 'label' not in data['timeHorizons'][horizon]:
                errors.append(f"Missing 'label' for timeHorizon '{horizon}'")

    # Validate items
    if 'items' in data:
        if not isinstance(data['items'], list):
            errors.append("'items' must be an array")
        else:
            # Check for duplicate IDs
            ids = [item.get('id') for item in data['items'] if 'id' in item]
            if len(ids) != len(set(ids)):
                errors.append("Duplicate item IDs found")

            # Validate each item
            for idx, item in enumerate(data['items']):
                errors.extend(validate_item(item, idx))

            # Validate dependency references
            valid_ids = set(ids)
            for idx, item in enumerate(data['items']):
                for dep_id in item.get('dependencies', []):
                    if dep_id not in valid_ids:
                        errors.append(f"Item {idx}: dependency '{dep_id}' references non-existent item")

    return errors

def main():
    """Main entry point."""
    try:
        data = load_roadmap()
    except FileNotFoundError:
        print("ERROR: roadmap.json not found")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"ERROR: Invalid JSON - {e}")
        sys.exit(1)

    errors = validate_roadmap(data)

    if errors:
        print("Validation FAILED:")
        for error in errors:
            print(f"  - {error}")
        sys.exit(1)
    else:
        print("Validation PASSED")
        print(f"  - {len(data.get('items', []))} items validated")
        sys.exit(0)

if __name__ == '__main__':
    main()
```

##### `scripts/sort_items.py`

```python
#!/usr/bin/env python3
"""Sort roadmap items by various criteria."""

import argparse
import sys
from utils import load_roadmap, save_roadmap, get_sort_key

def main():
    parser = argparse.ArgumentParser(description='Sort roadmap items')
    parser.add_argument('--by', choices=['moscow', 'status', 'horizon'], default='moscow',
                        help='Sort criteria (default: moscow)')
    parser.add_argument('--save', action='store_true', help='Save sorted items back to file')
    args = parser.parse_args()

    try:
        data = load_roadmap()
    except FileNotFoundError:
        print("ERROR: roadmap.json not found")
        sys.exit(1)

    items = data.get('items', [])
    sorted_items = sorted(items, key=lambda x: get_sort_key(x, args.by))

    if args.save:
        data['items'] = sorted_items
        save_roadmap(data)
        print(f"Sorted {len(sorted_items)} items by {args.by} and saved")
    else:
        print(f"Sorted {len(sorted_items)} items by {args.by}:")
        for item in sorted_items:
            print(f"  [{item.get('moscow', '?'):12}] [{item.get('timeHorizon', '?'):5}] {item.get('title', 'Untitled')}")

if __name__ == '__main__':
    main()
```

##### `scripts/check_health.py`

```python
#!/usr/bin/env python3
"""Check roadmap health and report issues."""

import sys
from utils import load_roadmap

def main():
    try:
        data = load_roadmap()
    except FileNotFoundError:
        print("ERROR: roadmap.json not found")
        sys.exit(1)

    items = data.get('items', [])

    # Calculate Must-Have percentage
    total_effort = sum(item.get('effort', 0) for item in items)
    must_have_effort = sum(item.get('effort', 0) for item in items if item.get('moscow') == 'must-have')

    must_have_percent = (must_have_effort / total_effort * 100) if total_effort > 0 else 0

    # Find issues
    at_risk = [i for i in items if i.get('health') in ['at-risk', 'off-track', 'blocked']]
    missing_effort = [i for i in items if i.get('effort') is None and i.get('moscow') == 'must-have']
    in_progress = [i for i in items if i.get('status') == 'in-progress']

    # Report
    print("=" * 50)
    print("ROADMAP HEALTH CHECK")
    print("=" * 50)
    print()

    # Must-Have percentage
    status = "WARNING" if must_have_percent > 60 else "OK"
    print(f"Must-Have Effort: {must_have_percent:.1f}% [{status}]")
    if must_have_percent > 60:
        print("  ! Must-Have items exceed 60% threshold")
        print("  ! Consider moving some items to Should-Have")
    print()

    # Items at risk
    print(f"At Risk / Blocked: {len(at_risk)} items")
    for item in at_risk:
        print(f"  - [{item.get('health'):8}] {item.get('title')}")
    print()

    # Missing effort estimates
    print(f"Missing Effort (Must-Have): {len(missing_effort)} items")
    for item in missing_effort:
        print(f"  - {item.get('title')}")
    print()

    # Summary
    print(f"Total Items: {len(items)}")
    print(f"In Progress: {len(in_progress)}")
    print(f"Total Effort: {total_effort}")
    print()

    # Exit code based on health
    if must_have_percent > 60 or len(at_risk) > 0:
        sys.exit(1)
    sys.exit(0)

if __name__ == '__main__':
    main()
```

##### `scripts/generate_summary.py`

```python
#!/usr/bin/env python3
"""Generate a text summary of the roadmap."""

import sys
from utils import load_roadmap, MOSCOW_ORDER, HORIZON_ORDER

def main():
    try:
        data = load_roadmap()
    except FileNotFoundError:
        print("ERROR: roadmap.json not found")
        sys.exit(1)

    items = data.get('items', [])

    print(f"# {data.get('projectName', 'Product Roadmap')}")
    print()
    print(data.get('projectSummary', ''))
    print()
    print(f"Last Updated: {data.get('lastUpdated', 'Unknown')}")
    print()

    # Group by time horizon
    for horizon in HORIZON_ORDER:
        horizon_items = [i for i in items if i.get('timeHorizon') == horizon]
        if not horizon_items:
            continue

        horizon_config = data.get('timeHorizons', {}).get(horizon, {})
        label = horizon_config.get('label', horizon.title())

        print(f"## {label}")
        print()

        # Sub-group by MoSCoW
        for moscow in MOSCOW_ORDER:
            moscow_items = [i for i in horizon_items if i.get('moscow') == moscow]
            if not moscow_items:
                continue

            moscow_label = moscow.replace('-', ' ').title()
            print(f"### {moscow_label}")
            print()

            for item in moscow_items:
                status = item.get('status', 'unknown').replace('-', ' ').title()
                health = item.get('health', 'unknown').replace('-', ' ').title()
                effort = f" ({item.get('effort')} pts)" if item.get('effort') else ""

                print(f"- **{item.get('title')}** [{status}] [{health}]{effort}")
                if item.get('description'):
                    print(f"  {item.get('description')[:100]}...")
            print()

    # Statistics
    total_effort = sum(i.get('effort', 0) for i in items)
    must_have_effort = sum(i.get('effort', 0) for i in items if i.get('moscow') == 'must-have')
    must_have_percent = (must_have_effort / total_effort * 100) if total_effort > 0 else 0

    print("## Statistics")
    print()
    print(f"- Total Items: {len(items)}")
    print(f"- Must-Have %: {must_have_percent:.1f}%")
    print(f"- In Progress: {len([i for i in items if i.get('status') == 'in-progress'])}")
    print(f"- At Risk: {len([i for i in items if i.get('health') in ['at-risk', 'off-track', 'blocked']])}")

if __name__ == '__main__':
    main()
```

### 5. Claude Code Agent Design

#### File: `.claude/agents/product-manager.md`

```markdown
---
name: product-manager
description: Product management expert for roadmap decisions, feature prioritization, and scope management. Acts as a startup PM - ruthlessly prioritizes, focuses on speed over perfection. Use proactively for strategic product decisions.
tools: Read, Write, Edit, Bash, Grep, Glob
model: sonnet
category: product
displayName: Product Manager
color: purple
---

# Startup Product Manager Agent

You are an experienced startup product manager. Your role is to help make strategic decisions about product roadmap, feature prioritization, and scope management.

## Core Principles

1. **Ruthless prioritization** - Focus on what delivers value fastest
2. **Speed over perfection** - Ship fast, iterate faster
3. **Must-Have <60%** - Keep critical items under 60% of total effort
4. **Quick wins first** - High value + low effort = do it now
5. **Challenge scope creep** - Every feature must earn its place

## When Invoked

### 1. Understand the Context

```bash
# Read current roadmap
cat roadmap/roadmap.json

# Check roadmap health
python3 .claude/skills/roadmap-moscow/scripts/check_health.py
```

### 2. Analyze the Request

- Is this about adding new items?
- Is this about reprioritizing existing items?
- Is this about roadmap health/analysis?
- Is this about stakeholder communication?

### 3. Apply MoSCoW Framework

For new items, ask:
- **Must-Have?** Will the project fail without this?
- **Should-Have?** Important but not time-critical?
- **Could-Have?** Nice to have if time permits?
- **Won't-Have?** Explicitly deferred?

### 4. Validate Changes

After any roadmap changes:

```bash
# Validate JSON structure
python3 .claude/skills/roadmap-moscow/scripts/validate_roadmap.py

# Check health metrics
python3 .claude/skills/roadmap-moscow/scripts/check_health.py
```

## Decision Heuristics

### Adding Items

1. Does this align with current goals?
2. What's the effort to build?
3. How many users benefit?
4. What's the cost of NOT doing it?
5. Does it create dependencies?

### Prioritizing Items

1. Must-Haves go to Now/Next
2. Quick wins (high value, low effort) → Now
3. High effort items need strong justification
4. Won't-Have prevents scope creep

### Time Horizon Assignment

| Horizon | Items | Criteria |
|---------|-------|----------|
| **Now** | Active work | Must-Have, in-progress, urgent |
| **Next** | Planned | Should-Have, dependencies resolved |
| **Later** | Future | Could-Have, needs refinement |

## Communication Style

- Be direct and concise
- Lead with recommendations
- Explain trade-offs clearly
- Use data when available
- Challenge assumptions respectfully

## Red Flags to Call Out

- Must-Have exceeds 60% of effort
- Too many items At Risk or Blocked
- No Won't-Have items (scope creep risk)
- Dependencies creating bottlenecks
- Items stuck In Progress too long

## Roadmap Location

- Data: `/roadmap/roadmap.json`
- Schema: `/roadmap/schema.json`
- Visualization: `/roadmap/roadmap.html`
```

### 6. Slash Command Design

#### File: `.claude/commands/roadmap.md`

```markdown
---
description: Manage the product roadmap with MoSCoW prioritization
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Task
---

# Roadmap Management

Manage the product roadmap using MoSCoW prioritization.

## Usage

```
/roadmap [subcommand] [args]
```

## Subcommands

### show

Display the current roadmap summary.

```
/roadmap show
```

**Action**: Run the generate_summary.py script and display output.

```bash
python3 .claude/skills/roadmap-moscow/scripts/generate_summary.py
```

### add <title>

Add a new item to the roadmap. You'll be prompted for details.

```
/roadmap add "Implement user authentication"
```

**Action**:
1. Parse the title from arguments
2. Ask for: type, moscow, timeHorizon, description, effort, labels
3. Generate a UUID for the item
4. Add to roadmap.json with current timestamps
5. Run validation
6. Report result

### prioritize

Analyze priorities and suggest rebalancing.

```
/roadmap prioritize
```

**Action**:
1. Run check_health.py
2. Identify items that could be deprioritized
3. Identify quick wins being missed
4. Suggest moves to balance Must-Have %
5. Use the product-manager agent for strategic analysis

### analyze

Perform a full health check with detailed analysis.

```
/roadmap analyze
```

**Action**:
1. Run check_health.py
2. Run validate_roadmap.py
3. Report:
   - Must-Have % (warn if >60%)
   - Items by status
   - Items at risk/blocked
   - Dependency analysis
   - Missing estimates

### validate

Validate the roadmap JSON structure.

```
/roadmap validate
```

**Action**:

```bash
python3 .claude/skills/roadmap-moscow/scripts/validate_roadmap.py
```

## Implementation

When processing `/roadmap` commands:

1. Parse the subcommand from arguments
2. Execute the appropriate action
3. Report results clearly

If no subcommand provided, default to `show`.
```

---

## User Experience

### Viewing the Roadmap

1. Open `/roadmap/roadmap.html` in any browser
2. Page loads roadmap.json via fetch
3. Toggle between Kanban (Now/Next/Later) and List (MoSCoW groups) views
4. Use filters to narrow by type, priority, or health
5. Health dashboard shows key metrics including Must-Have % warning

### Managing via Claude Code

1. Use `/roadmap show` to see current state
2. Use `/roadmap add "Feature name"` to add items
3. Use `/roadmap prioritize` for strategic suggestions
4. Use `/roadmap analyze` for health checks
5. Use `/roadmap validate` after manual edits

### Design Language

The HTML visualization follows Calm Tech principles:
- Warm off-white background (not pure white)
- Soft shadows for depth
- Generous spacing (24px card padding, 16px gaps)
- OKLCH color tokens
- 16px card radius, 10px button radius
- Automatic dark mode support via `prefers-color-scheme`

---

## Testing Strategy

### Unit Tests (Python Scripts)

Each Python script should be testable:

```python
# test_validate_roadmap.py
def test_valid_uuid():
    """Purpose: Verify UUID v4 validation accepts valid UUIDs."""
    assert validate_uuid('550e8400-e29b-41d4-a716-446655440000') == True

def test_invalid_uuid():
    """Purpose: Verify UUID validation rejects invalid formats."""
    assert validate_uuid('not-a-uuid') == False

def test_missing_required_field():
    """Purpose: Verify validation catches missing required fields."""
    item = {'id': '...', 'title': 'Test'}  # Missing moscow, status, etc.
    errors = validate_item(item, 0)
    assert len(errors) > 0
```

### Integration Tests

1. **Validation Flow**: Create roadmap.json → Run validate → Should pass
2. **Health Check**: Create roadmap with >60% Must-Have → Should warn
3. **Sort Operations**: Add items → Sort by moscow → Verify order

### E2E Tests (Manual)

1. Open roadmap.html in browser
2. Verify data loads from roadmap.json
3. Test view toggle (Kanban ↔ List)
4. Test filters (type, moscow, health)
5. Verify dark mode works
6. Verify Must-Have warning appears when >60%

---

## Performance Considerations

- **JSON file size**: Roadmaps typically have <500 items; JSON parsing is negligible
- **HTML rendering**: Vanilla JS renders items synchronously; for 100+ items, consider pagination
- **Python scripts**: stdlib only, no external dependencies, startup time ~50ms

---

## Security Considerations

- **No server-side processing**: HTML loads JSON via fetch (same-origin)
- **No user input execution**: Read-only HTML; all edits via Claude Code
- **JSON validation**: Python scripts validate structure before processing
- **No sensitive data**: Roadmap contains feature descriptions only

---

## Documentation

### Files to Create

| File | Purpose |
|------|---------|
| `/roadmap/README.md` | Brief usage guide for the roadmap system |

### Files to Update

| File | Update |
|------|--------|
| `CLAUDE.md` | Add roadmap commands to slash command table |

---

## Implementation Phases

### Phase 1: Core Files

1. Create `/roadmap/` directory structure
2. Create `schema.json` with full JSON Schema
3. Create initial `roadmap.json` with example items
4. Create `roadmap.html`, `styles.css`, `scripts.js`

### Phase 2: Claude Code Integration

1. Create `.claude/skills/roadmap-moscow/` with all files
2. Create `.claude/agents/product-manager.md`
3. Create `.claude/commands/roadmap.md`
4. Test Python scripts work correctly

### Phase 3: Polish

1. Test HTML visualization in browser
2. Test all `/roadmap` subcommands
3. Update CLAUDE.md documentation
4. Create `/roadmap/README.md`

---

## Open Questions

1. ~~**Font Loading**: Should roadmap.html include Geist font via CDN, or use system-ui fallback?~~ (RESOLVED)
   **Answer:** Use system-ui fallback for offline compatibility
   **Rationale:** Ensures the roadmap visualization works without internet connection

2. ~~**Effort Unit**: Should effort be story points, hours, or configurable?~~ (RESOLVED)
   **Answer:** Story points
   **Rationale:** Story points are the standard unit for agile teams. Document this in README.

3. ~~**Item History**: Should we track history of changes to items?~~ (RESOLVED)
   **Answer:** No, use git history for now
   **Rationale:** MVP approach keeps schema simple; git provides change tracking

---

## References

- [MoSCoW Method - Wikipedia](https://en.wikipedia.org/wiki/MoSCoW_method)
- [Now-Next-Later Roadmap - ProdPad](https://www.prodpad.com/blog/invented-now-next-later-roadmap/)
- [JSON Schema Draft-07](https://json-schema.org/draft-07/schema)
- [Claude Code Skills Documentation](https://docs.anthropic.com/claude-code/skills)
- [Calm Tech Design System](docs/DESIGN_SYSTEM.md)
