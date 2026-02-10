# Task Breakdown: Roadmap Management System with MoSCoW Prioritization

**Generated:** 2025-12-09
**Source:** specs/roadmap-management-system/02-specification.md
**Mode:** Full (First-time decompose)
**Last Decompose:** 2025-12-09

---

## Overview

This task breakdown implements a product roadmap management system with:
1. JSON-based roadmap data with schema validation
2. Standalone HTML visualization (independent of Next.js)
3. Claude Code skill for MoSCoW methodology and Python utilities
4. Claude Code agent acting as a startup PM
5. Slash command for roadmap management operations

---

## Phase 1: Core Files

### Task 1.1: Create Roadmap Directory Structure
**Description:** Create the `/roadmap/` directory and establish the file structure
**Size:** Small
**Priority:** High
**Dependencies:** None
**Can run parallel with:** None (foundation task)

**Implementation Steps:**
1. Create `/roadmap/` directory
2. Verify directory is accessible

**Acceptance Criteria:**
- [ ] `/roadmap/` directory exists
- [ ] Directory is git-tracked (not in .gitignore)

---

### Task 1.2: Create JSON Schema
**Description:** Create `schema.json` with complete JSON Schema Draft-07 validation rules
**Size:** Medium
**Priority:** High
**Dependencies:** Task 1.1
**Can run parallel with:** None

**Technical Requirements:**
- JSON Schema Draft-07 format
- Root object with required fields: projectName, projectSummary, lastUpdated, timeHorizons, items
- roadmapItem definition with all required fields
- UUID v4 pattern validation for id field
- Enum validation for moscow, status, health, timeHorizon, type

**Implementation:**

Create `/roadmap/schema.json` with the following content:

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

**Acceptance Criteria:**
- [ ] `/roadmap/schema.json` exists with valid JSON
- [ ] All required fields defined with correct types
- [ ] UUID v4 pattern correctly validates
- [ ] All enum values match specification

---

### Task 1.3: Create Initial Roadmap Data
**Description:** Create `roadmap.json` with example items representing the Dunny project
**Size:** Small
**Priority:** High
**Dependencies:** Task 1.2
**Can run parallel with:** None

**Technical Requirements:**
- Valid structure matching schema.json
- Example items covering different MoSCoW categories
- Items covering different time horizons (now, next, later)
- Items with different statuses and health values
- Realistic data for the Dunny personal finance project

**Implementation:**

Create `/roadmap/roadmap.json` with the following content:

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
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "title": "Add transaction history view",
      "description": "Display paginated list of transactions from linked accounts",
      "type": "feature",
      "moscow": "must-have",
      "status": "not-started",
      "health": "on-track",
      "timeHorizon": "now",
      "effort": 8,
      "dependencies": ["550e8400-e29b-41d4-a716-446655440001"],
      "labels": ["transactions", "plaid"],
      "createdAt": "2025-12-08T10:00:00Z",
      "updatedAt": "2025-12-08T10:00:00Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "title": "Implement account refresh functionality",
      "description": "Allow users to manually refresh account data from Plaid",
      "type": "feature",
      "moscow": "should-have",
      "status": "not-started",
      "health": "on-track",
      "timeHorizon": "next",
      "effort": 3,
      "dependencies": ["550e8400-e29b-41d4-a716-446655440001"],
      "labels": ["plaid", "sync"],
      "createdAt": "2025-12-08T10:00:00Z",
      "updatedAt": "2025-12-08T10:00:00Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440004",
      "title": "Add spending categories visualization",
      "description": "Chart showing spending breakdown by category",
      "type": "feature",
      "moscow": "could-have",
      "status": "not-started",
      "health": "on-track",
      "timeHorizon": "later",
      "effort": 5,
      "dependencies": ["550e8400-e29b-41d4-a716-446655440002"],
      "labels": ["charts", "analytics"],
      "createdAt": "2025-12-08T10:00:00Z",
      "updatedAt": "2025-12-08T10:00:00Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440005",
      "title": "Multi-currency support",
      "description": "Support for accounts in different currencies with conversion",
      "type": "feature",
      "moscow": "wont-have",
      "status": "not-started",
      "health": "on-track",
      "timeHorizon": "later",
      "effort": 13,
      "dependencies": [],
      "labels": ["internationalization"],
      "createdAt": "2025-12-08T10:00:00Z",
      "updatedAt": "2025-12-08T10:00:00Z"
    }
  ]
}
```

**Acceptance Criteria:**
- [ ] `/roadmap/roadmap.json` exists with valid JSON
- [ ] At least one item in each MoSCoW category
- [ ] Items span now, next, and later horizons
- [ ] All items pass schema validation
- [ ] Example demonstrates dependencies

---

### Task 1.4: Create HTML Visualization
**Description:** Create `roadmap.html` with the complete HTML structure for the visualization page
**Size:** Medium
**Priority:** High
**Dependencies:** Task 1.1
**Can run parallel with:** Task 1.2, Task 1.3

**Technical Requirements:**
- Valid HTML5 structure
- Semantic elements for header, sections, and controls
- References external styles.css and scripts.js
- Health dashboard section with metric cards
- View toggle (Kanban/List)
- Filter controls (type, moscow, health)
- Kanban view with Now/Next/Later columns
- List view grouped by MoSCoW priority
- Empty state for no results

**Implementation:**

Create `/roadmap/roadmap.html` with the following content:

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

**Acceptance Criteria:**
- [ ] `/roadmap/roadmap.html` exists with valid HTML5
- [ ] All required sections present (header, health dashboard, controls, views)
- [ ] Both Kanban and List views have proper structure
- [ ] Filter dropdowns have all required options
- [ ] References styles.css and scripts.js correctly

---

### Task 1.5: Create CSS Styles
**Description:** Create `styles.css` following Calm Tech design system with OKLCH colors
**Size:** Large
**Priority:** High
**Dependencies:** Task 1.1
**Can run parallel with:** Task 1.2, Task 1.3, Task 1.4

**Technical Requirements:**
- CSS reset and base styles
- OKLCH color tokens for light and dark mode
- Soft shadow definitions
- Border radius scale (8px, 10px, 12px, 16px)
- Spacing scale (4px base)
- Container styles (max-width 72rem)
- Header styles with responsive layout
- Health dashboard grid
- View toggle and filter controls
- Kanban view with 3-column grid (responsive)
- List view with grouped sections
- Item card styles with hover effects
- Badge styles for MoSCoW, type, health, labels
- Dark mode via prefers-color-scheme
- Responsive adjustments for mobile

**Implementation:**

Create `/roadmap/styles.css` with the complete CSS from the specification (lines 400-916 in 02-specification.md).

**Key CSS Sections:**

1. **CSS Reset & Variables:**
```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --font-sans: 'Geist Sans', system-ui, -apple-system, sans-serif;
  --font-mono: 'Geist Mono', ui-monospace, monospace;
  --background: oklch(0.985 0.002 250);
  --foreground: oklch(0.13 0.004 260);
  /* ... all other color tokens ... */
}
```

2. **Dark Mode:**
```css
@media (prefers-color-scheme: dark) {
  :root {
    --background: oklch(0.098 0.005 260);
    --foreground: oklch(0.98 0.002 250);
    /* ... dark mode overrides ... */
  }
}
```

3. **Component Styles:**
- Container, Header, Health Dashboard, Controls
- Kanban View, List View
- Item Cards, Badges, Labels

**Acceptance Criteria:**
- [ ] `/roadmap/styles.css` exists with valid CSS
- [ ] OKLCH color tokens defined for light mode
- [ ] Dark mode overrides via @media query
- [ ] Soft shadows using custom properties
- [ ] Responsive grid for kanban columns
- [ ] Card hover effects with shadow transition
- [ ] MoSCoW badges color-coded correctly
- [ ] Health badges with semantic colors
- [ ] Mobile responsive at 640px breakpoint

---

### Task 1.6: Create JavaScript Logic
**Description:** Create `scripts.js` with vanilla JS for loading data and rendering views
**Size:** Large
**Priority:** High
**Dependencies:** Task 1.4
**Can run parallel with:** Task 1.5

**Technical Requirements:**
- IIFE pattern for encapsulation
- State management for roadmapData, currentView, filters
- DOM element references cached
- Async init function to fetch roadmap.json
- Header rendering with formatted date
- Health dashboard calculation (Must-Have %, totals, at-risk count)
- Filter application function
- Item card HTML generation with all badges
- Kanban view rendering (grouped by timeHorizon)
- List view rendering (grouped by moscow)
- Event listeners for view toggle and filters
- Helper functions for escaping HTML, formatting enums
- Empty state handling

**Implementation:**

Create `/roadmap/scripts.js` with the complete JavaScript from the specification (lines 920-1231 in 02-specification.md).

**Key Functions:**

```javascript
(function() {
  'use strict';

  // State
  let roadmapData = null;
  let currentView = 'kanban';
  let filters = { type: '', moscow: '', health: '' };

  // DOM Elements (cached)
  const elements = { /* ... all element references ... */ };

  // Initialize - fetch roadmap.json and render
  async function init() { /* ... */ }

  // Render functions
  function renderHeader() { /* ... */ }
  function renderHealthDashboard() { /* ... */ }
  function getFilteredItems() { /* ... */ }
  function createItemCard(item) { /* ... */ }
  function renderRoadmap() { /* ... */ }
  function renderKanbanView(items) { /* ... */ }
  function renderListView(items) { /* ... */ }

  // Event setup
  function setupEventListeners() { /* ... */ }

  // Helpers
  function escapeHtml(text) { /* ... */ }
  function formatMoscow(moscow) { /* ... */ }
  function formatType(type) { /* ... */ }
  function formatStatus(status) { /* ... */ }
  function formatHealth(health) { /* ... */ }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
```

**Acceptance Criteria:**
- [ ] `/roadmap/scripts.js` exists with valid JavaScript
- [ ] Fetches roadmap.json on page load
- [ ] Renders project name, summary, last updated
- [ ] Calculates and displays Must-Have % correctly
- [ ] Shows warning when Must-Have >60%
- [ ] View toggle switches between Kanban and List
- [ ] Filters apply correctly to displayed items
- [ ] Item cards show all metadata (badges, labels, effort)
- [ ] Empty state shows when no items match filters
- [ ] No JavaScript errors in console

---

## Phase 2: Claude Code Integration

### Task 2.1: Create Skill Directory Structure
**Description:** Create `.claude/skills/roadmap-moscow/` directory with required files
**Size:** Small
**Priority:** High
**Dependencies:** None
**Can run parallel with:** Phase 1 tasks

**Implementation Steps:**
1. Create `.claude/skills/roadmap-moscow/` directory
2. Create `.claude/skills/roadmap-moscow/scripts/` subdirectory
3. Verify structure matches skill requirements

**Acceptance Criteria:**
- [ ] `.claude/skills/roadmap-moscow/` directory exists
- [ ] `.claude/skills/roadmap-moscow/scripts/` subdirectory exists

---

### Task 2.2: Create SKILL.md
**Description:** Create the skill definition file with frontmatter and usage documentation
**Size:** Medium
**Priority:** High
**Dependencies:** Task 2.1
**Can run parallel with:** Task 2.3, Task 2.4

**Technical Requirements:**
- YAML frontmatter with name and description
- Clear "When to Use" section
- Roadmap location documentation
- Python utility usage examples
- Reference to methodology guides

**Implementation:**

Create `.claude/skills/roadmap-moscow/SKILL.md` with the following content:

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

**Acceptance Criteria:**
- [ ] `.claude/skills/roadmap-moscow/SKILL.md` exists
- [ ] Valid YAML frontmatter with name and description
- [ ] All Python utility commands documented
- [ ] References to methodology guides included

---

### Task 2.3: Create MoSCoW Methodology Guide
**Description:** Create `moscow-guide.md` with comprehensive MoSCoW prioritization reference
**Size:** Medium
**Priority:** Medium
**Dependencies:** Task 2.1
**Can run parallel with:** Task 2.2, Task 2.4

**Implementation:**

Create `.claude/skills/roadmap-moscow/moscow-guide.md` with the content from specification lines 1333-1406.

**Key Sections:**
- Overview with category table
- The 60% Rule explanation
- How to Categorize (questions for each level)
- Common Mistakes
- Integration with Time Horizons
- Review Cadence

**Acceptance Criteria:**
- [ ] `.claude/skills/roadmap-moscow/moscow-guide.md` exists
- [ ] 60% rule clearly documented
- [ ] Categorization questions for each MoSCoW level
- [ ] Time horizon integration guidance

---

### Task 2.4: Create PM Principles Guide
**Description:** Create `pm-principles.md` with startup product management principles
**Size:** Medium
**Priority:** Medium
**Dependencies:** Task 2.1
**Can run parallel with:** Task 2.2, Task 2.3

**Implementation:**

Create `.claude/skills/roadmap-moscow/pm-principles.md` with the content from specification lines 1408-1495.

**Key Sections:**
- Core Philosophy (speed, value, simplicity, learning)
- Prioritization Heuristics (quick win rule, scope creep detector, dependency rule, 80/20)
- Decision Framework
- Time Horizon Guidelines
- Stakeholder Communication
- Red Flags to Watch

**Acceptance Criteria:**
- [ ] `.claude/skills/roadmap-moscow/pm-principles.md` exists
- [ ] Core philosophy documented
- [ ] Decision framework with questions
- [ ] Time horizon guidelines included

---

### Task 2.5: Create Python Utils Module
**Description:** Create `scripts/utils.py` with shared utilities for all Python scripts
**Size:** Medium
**Priority:** High
**Dependencies:** Task 2.1, Task 1.2, Task 1.3
**Can run parallel with:** Task 2.2, Task 2.3, Task 2.4

**Technical Requirements:**
- Pure Python 3.8+ stdlib (no pip dependencies)
- Project root discovery function
- Path getters for roadmap.json and schema.json
- Load/save roadmap functions with auto-timestamp
- Ordering constants for MoSCoW, status, and horizon
- Sort key generation function

**Implementation:**

Create `.claude/skills/roadmap-moscow/scripts/utils.py`:

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

**Acceptance Criteria:**
- [ ] `.claude/skills/roadmap-moscow/scripts/utils.py` exists
- [ ] `get_project_root()` finds project root correctly
- [ ] `load_roadmap()` returns parsed JSON
- [ ] `save_roadmap()` updates lastUpdated timestamp
- [ ] Sort key functions work for all criteria
- [ ] No external dependencies (stdlib only)

---

### Task 2.6: Create Validation Script
**Description:** Create `scripts/validate_roadmap.py` for schema validation
**Size:** Large
**Priority:** High
**Dependencies:** Task 2.5
**Can run parallel with:** Task 2.7, Task 2.8, Task 2.9

**Technical Requirements:**
- UUID v4 format validation via regex
- ISO 8601 datetime validation
- Enum validation for all enum fields
- Required field checking per item
- Duplicate ID detection
- Dependency reference validation
- Exit code 0 for valid, 1 for invalid

**Implementation:**

Create `.claude/skills/roadmap-moscow/scripts/validate_roadmap.py` with the content from specification lines 1581-1734.

**Key Functions:**
- `validate_uuid(value)` - UUID v4 pattern check
- `validate_datetime(value)` - ISO 8601 format check
- `validate_enum(value, allowed)` - Allowed values check
- `validate_item(item, idx)` - Single item validation
- `validate_roadmap(data)` - Full roadmap validation
- `main()` - Entry point with file loading

**Acceptance Criteria:**
- [ ] Script exists and is executable
- [ ] Validates UUID format correctly
- [ ] Detects missing required fields
- [ ] Catches invalid enum values
- [ ] Finds duplicate IDs
- [ ] Validates dependency references exist
- [ ] Returns exit code 0 for valid roadmap
- [ ] Returns exit code 1 with error list for invalid

---

### Task 2.7: Create Sort Script
**Description:** Create `scripts/sort_items.py` for sorting roadmap items
**Size:** Medium
**Priority:** Medium
**Dependencies:** Task 2.5
**Can run parallel with:** Task 2.6, Task 2.8, Task 2.9

**Technical Requirements:**
- argparse for command-line arguments
- --by flag with choices: moscow, status, horizon
- --save flag to persist changes
- Uses utils.py sort key functions
- Display sorted list or save to file

**Implementation:**

Create `.claude/skills/roadmap-moscow/scripts/sort_items.py` with the content from specification lines 1736-1773.

**Acceptance Criteria:**
- [ ] Script exists and is executable
- [ ] Accepts --by argument with valid choices
- [ ] Sorts by MoSCoW priority correctly
- [ ] Sorts by status correctly
- [ ] Sorts by time horizon correctly
- [ ] --save flag persists sorted order

---

### Task 2.8: Create Health Check Script
**Description:** Create `scripts/check_health.py` for roadmap health analysis
**Size:** Medium
**Priority:** High
**Dependencies:** Task 2.5
**Can run parallel with:** Task 2.6, Task 2.7, Task 2.9

**Technical Requirements:**
- Calculate Must-Have % of total effort
- Warn if Must-Have >60%
- List items at risk or blocked
- List Must-Have items missing effort estimates
- Show summary statistics
- Exit code 1 if unhealthy, 0 if healthy

**Implementation:**

Create `.claude/skills/roadmap-moscow/scripts/check_health.py` with the content from specification lines 1775-1843.

**Acceptance Criteria:**
- [ ] Script exists and is executable
- [ ] Correctly calculates Must-Have percentage
- [ ] Shows WARNING when >60%
- [ ] Lists at-risk and blocked items
- [ ] Identifies missing effort estimates
- [ ] Returns exit code based on health

---

### Task 2.9: Create Summary Script
**Description:** Create `scripts/generate_summary.py` for text summary generation
**Size:** Medium
**Priority:** Medium
**Dependencies:** Task 2.5
**Can run parallel with:** Task 2.6, Task 2.7, Task 2.8

**Technical Requirements:**
- Markdown-formatted output
- Project name and summary as header
- Items grouped by time horizon, then by MoSCoW
- Status and health badges per item
- Statistics section at end

**Implementation:**

Create `.claude/skills/roadmap-moscow/scripts/generate_summary.py` with the content from specification lines 1845-1916.

**Acceptance Criteria:**
- [ ] Script exists and is executable
- [ ] Outputs valid Markdown
- [ ] Groups by time horizon first
- [ ] Sub-groups by MoSCoW within horizon
- [ ] Includes statistics section
- [ ] Truncates long descriptions

---

### Task 2.10: Create Product Manager Agent
**Description:** Create `.claude/agents/product-manager.md` agent definition
**Size:** Large
**Priority:** High
**Dependencies:** Task 2.1 (skill must exist for references)
**Can run parallel with:** Task 2.11

**Technical Requirements:**
- YAML frontmatter with all required fields
- name, description, tools, model, category, displayName, color
- System prompt with core principles
- Workflow for when agent is invoked
- Decision heuristics for adding and prioritizing
- Time horizon assignment guidelines
- Communication style guidance
- Red flags to call out

**Implementation:**

Create `.claude/agents/product-manager.md` with the content from specification lines 1920-2030.

**Frontmatter:**
```yaml
---
name: product-manager
description: Product management expert for roadmap decisions, feature prioritization, and scope management. Acts as a startup PM - ruthlessly prioritizes, focuses on speed over perfection. Use proactively for strategic product decisions.
tools: Read, Write, Edit, Bash, Grep, Glob
model: sonnet
category: product
displayName: Product Manager
color: purple
---
```

**Acceptance Criteria:**
- [ ] `.claude/agents/product-manager.md` exists
- [ ] Valid YAML frontmatter
- [ ] Core principles documented
- [ ] Workflow for context gathering
- [ ] MoSCoW framework application guidance
- [ ] Validation command references
- [ ] Decision heuristics included
- [ ] Red flags documented

---

### Task 2.11: Create Roadmap Slash Command
**Description:** Create `.claude/commands/roadmap.md` slash command definition
**Size:** Large
**Priority:** High
**Dependencies:** Task 2.5, Task 2.6, Task 2.8, Task 2.9
**Can run parallel with:** Task 2.10

**Technical Requirements:**
- YAML frontmatter with description and allowed-tools
- Usage syntax documentation
- Subcommands: show, add, prioritize, analyze, validate
- Implementation details for each subcommand
- References to Python scripts

**Implementation:**

Create `.claude/commands/roadmap.md` with the content from specification lines 2034-2141.

**Subcommands:**
1. `show` - Display roadmap summary (runs generate_summary.py)
2. `add <title>` - Add new item (prompts for details)
3. `prioritize` - Analyze and suggest rebalancing
4. `analyze` - Full health check with details
5. `validate` - Validate JSON structure

**Acceptance Criteria:**
- [ ] `.claude/commands/roadmap.md` exists
- [ ] Valid YAML frontmatter
- [ ] All 5 subcommands documented
- [ ] Each subcommand has implementation details
- [ ] Script references are correct

---

## Phase 3: Polish & Documentation

### Task 3.1: Create Roadmap README
**Description:** Create `/roadmap/README.md` with usage documentation
**Size:** Small
**Priority:** Medium
**Dependencies:** Phase 1, Phase 2 tasks
**Can run parallel with:** Task 3.2

**Technical Requirements:**
- Overview of the roadmap system
- File structure explanation
- How to view the roadmap (HTML)
- How to manage via Claude Code
- Story points explanation
- Quick reference for MoSCoW categories

**Implementation:**

Create `/roadmap/README.md`:

```markdown
# Product Roadmap

This directory contains the product roadmap for the Dunny project, using MoSCoW prioritization.

## Files

| File | Purpose |
|------|---------|
| `roadmap.json` | Main roadmap data |
| `schema.json` | JSON Schema for validation |
| `roadmap.html` | Visualization page |
| `styles.css` | Calm Tech styling |
| `scripts.js` | View rendering logic |

## Viewing the Roadmap

Open `roadmap.html` in any browser:

```bash
open roadmap/roadmap.html
```

Features:
- **Kanban View**: Items grouped by Now/Next/Later time horizons
- **List View**: Items grouped by MoSCoW priority
- **Filters**: Filter by type, priority, or health status
- **Health Dashboard**: Key metrics including Must-Have % warning

## Managing via Claude Code

Use the `/roadmap` command:

```bash
/roadmap show        # Display roadmap summary
/roadmap add "title" # Add a new item
/roadmap prioritize  # Get prioritization suggestions
/roadmap analyze     # Full health analysis
/roadmap validate    # Validate JSON structure
```

## MoSCoW Prioritization

| Priority | Meaning | Guideline |
|----------|---------|-----------|
| **Must Have** | Critical for success | Keep <60% of effort |
| **Should Have** | Important but not critical | Can delay if needed |
| **Could Have** | Nice to have | If time permits |
| **Won't Have** | Out of scope | Prevents scope creep |

## Effort Estimation

Effort uses **story points** on the Fibonacci scale (1, 2, 3, 5, 8, 13).

- **1-2**: Quick tasks (hours)
- **3-5**: Standard tasks (1-2 days)
- **8**: Larger tasks (3-5 days)
- **13**: Epic-sized (should be broken down)

## Time Horizons

| Horizon | Timeframe | Focus |
|---------|-----------|-------|
| **Now** | Current sprint (2 weeks) | Active work |
| **Next** | 2-4 weeks | Planned work |
| **Later** | 1-3 months | Future work |
```

**Acceptance Criteria:**
- [ ] `/roadmap/README.md` exists
- [ ] File structure documented
- [ ] Viewing instructions included
- [ ] Claude Code commands documented
- [ ] MoSCoW explanation included
- [ ] Story points explained

---

### Task 3.2: Update CLAUDE.md
**Description:** Add roadmap commands to the CLAUDE.md documentation
**Size:** Small
**Priority:** Medium
**Dependencies:** Task 2.11
**Can run parallel with:** Task 3.1

**Implementation:**

Add to the Commands table in CLAUDE.md under a new "Roadmap" section:

```markdown
#### Roadmap

| Command | Purpose |
|---------|---------|
| `/roadmap` | Display roadmap summary (default: show) |
| `/roadmap add <title>` | Add a new roadmap item |
| `/roadmap prioritize` | Get prioritization suggestions |
| `/roadmap analyze` | Full health check and analysis |
| `/roadmap validate` | Validate roadmap JSON structure |
```

Also add to the Agents table:

```markdown
| `product-manager` | Product decisions | Roadmap planning, feature prioritization, scope management |
```

And to the Skills table:

```markdown
| `roadmap-moscow` | Roadmap work | MoSCoW prioritization, roadmap utilities |
```

**Acceptance Criteria:**
- [ ] CLAUDE.md updated with roadmap commands
- [ ] Product-manager agent documented
- [ ] Roadmap-moscow skill documented

---

### Task 3.3: Test HTML Visualization
**Description:** Manually test the HTML visualization in a browser
**Size:** Small
**Priority:** High
**Dependencies:** Task 1.4, Task 1.5, Task 1.6, Task 1.3
**Can run parallel with:** Task 3.4

**Test Cases:**
1. Open roadmap.html in browser
2. Verify data loads from roadmap.json
3. Verify project name and summary display
4. Verify health dashboard shows correct metrics
5. Toggle between Kanban and List views
6. Test each filter dropdown
7. Verify item cards display all metadata
8. Test dark mode (if OS supports)
9. Test responsive layout at different widths

**Acceptance Criteria:**
- [ ] Page loads without JavaScript errors
- [ ] All data from roadmap.json displays
- [ ] View toggle works correctly
- [ ] Filters work correctly
- [ ] Dark mode applies correctly
- [ ] Responsive layout works on mobile widths

---

### Task 3.4: Test Python Scripts
**Description:** Test all Python scripts work correctly
**Size:** Medium
**Priority:** High
**Dependencies:** Phase 2 Python tasks
**Can run parallel with:** Task 3.3

**Test Cases:**

1. **validate_roadmap.py**:
   - Run on valid roadmap.json → exit code 0
   - Modify roadmap to have invalid UUID → exit code 1
   - Remove required field → exit code 1

2. **sort_items.py**:
   - Sort by moscow → Must-Have items first
   - Sort by status → In-Progress items first
   - Sort by horizon → Now items first
   - Test --save flag updates file

3. **check_health.py**:
   - Run on current roadmap → check metrics
   - Modify to have >60% Must-Have → verify warning
   - Add at-risk item → verify it's listed

4. **generate_summary.py**:
   - Run and verify Markdown output
   - Verify grouping by horizon then MoSCoW
   - Verify statistics section

**Acceptance Criteria:**
- [ ] All scripts run without Python errors
- [ ] validate_roadmap.py returns correct exit codes
- [ ] sort_items.py sorts correctly by all criteria
- [ ] check_health.py shows warning for >60% Must-Have
- [ ] generate_summary.py outputs valid Markdown

---

### Task 3.5: Test Claude Code Integration
**Description:** Test all Claude Code integration points
**Size:** Medium
**Priority:** High
**Dependencies:** Phase 2 tasks
**Can run parallel with:** Task 3.3, Task 3.4

**Test Cases:**

1. **Skill Discovery**:
   - Verify skill appears in Claude Code when discussing roadmaps
   - Check that Python script commands are suggested

2. **Agent Invocation**:
   - Invoke product-manager agent
   - Verify it reads roadmap.json
   - Verify it runs health check

3. **Slash Commands**:
   - Test `/roadmap show`
   - Test `/roadmap validate`
   - Test `/roadmap analyze`

**Acceptance Criteria:**
- [ ] Skill activates on roadmap-related queries
- [ ] Agent provides PM-style recommendations
- [ ] All slash command subcommands work

---

## Dependency Graph

```
Phase 1 (Core Files):
1.1 (Directory) ─┬─> 1.2 (Schema) ─> 1.3 (Data)
                 ├─> 1.4 (HTML)
                 ├─> 1.5 (CSS)
                 └─> 1.6 (JS) ─> (depends on 1.4)

Phase 2 (Claude Integration):
2.1 (Skill Dir) ─┬─> 2.2 (SKILL.md)
                 ├─> 2.3 (moscow-guide.md)
                 ├─> 2.4 (pm-principles.md)
                 └─> 2.5 (utils.py) ─┬─> 2.6 (validate.py)
                                     ├─> 2.7 (sort.py)
                                     ├─> 2.8 (health.py)
                                     └─> 2.9 (summary.py)

2.10 (Agent) ─> (depends on 2.1)
2.11 (Command) ─> (depends on 2.5-2.9)

Phase 3 (Polish):
3.1 (README) ─> (depends on Phase 1, 2)
3.2 (CLAUDE.md) ─> (depends on 2.11)
3.3 (Test HTML) ─> (depends on 1.3-1.6)
3.4 (Test Python) ─> (depends on 2.5-2.9)
3.5 (Test Claude) ─> (depends on Phase 2)
```

## Parallel Execution Opportunities

**Maximum parallelism per phase:**

- **Phase 1**: Tasks 1.4, 1.5 can run parallel with 1.2
- **Phase 2**: Tasks 2.2, 2.3, 2.4 can run parallel; 2.6-2.9 can run parallel; 2.10, 2.11 can run parallel
- **Phase 3**: Tasks 3.1, 3.2 can run parallel; 3.3, 3.4, 3.5 can run parallel

## Summary

| Phase | Tasks | Priority |
|-------|-------|----------|
| Phase 1: Core Files | 6 tasks | High |
| Phase 2: Claude Integration | 11 tasks | High |
| Phase 3: Polish | 5 tasks | Medium-High |
| **Total** | **22 tasks** | |
