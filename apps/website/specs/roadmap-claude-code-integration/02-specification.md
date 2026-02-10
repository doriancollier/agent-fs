# Roadmap-Claude Code Integration

**Status:** Draft
**Authors:** Claude Code
**Date:** 2025-12-09
**Slug:** roadmap-claude-code-integration
**Related:** [Ideation Document](./01-ideation.md), [Roadmap Management System](../roadmap-management-system/02-specification.md)

---

## Overview

Integrate the roadmap HTML visualization with Claude Code's development workflow to enable seamless transitions from roadmap planning to implementation. This feature provides one-click ideation initiation, bidirectional linking between roadmap items and spec files, and automatic status updates as work progresses through the ideation → specification → implementation lifecycle.

---

## Background/Problem Statement

Currently, the roadmap system and Claude Code's spec workflow operate independently:

1. **Manual workflow initiation**: Users must manually construct `/ideate` commands by reading roadmap items and typing prompts
2. **No traceability**: No connection between roadmap items and their generated spec files
3. **Manual status updates**: Users must remember to update roadmap status as work progresses
4. **Context loss**: Rich context from roadmap items (goals, constraints) doesn't automatically flow into ideation

This creates friction, reduces productivity, and risks incomplete tracking of work progress.

---

## Goals

- Enable one-click copy of `/ideate` command from roadmap HTML visualization
- Establish bidirectional linking between roadmap items and spec files
- Automatically update roadmap status when ideation starts and implementation completes
- Preserve rich context (target users, pain points, success criteria) in generated ideation prompts
- Display clickable links to associated spec files in the roadmap visualization
- Maintain backward compatibility with existing roadmap functionality

---

## Non-Goals

- Real-time collaboration or multi-user editing
- Database-backed roadmap storage (file-based only)
- Integration with external tools (Jira, Linear, Notion)
- Mobile-optimized UI
- Email/push notifications for status changes
- Multi-project roadmap support

---

## Technical Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| Python | 3.8+ | Utility scripts (stdlib only) |
| JSON Schema | Draft-07 | Schema validation |
| Vanilla JS | ES6+ | Browser interactivity |
| Clipboard API | Modern browsers | Copy functionality |

No external npm packages or pip dependencies required.

---

## Detailed Design

### 1. Schema Extensions

Extend `roadmap/schema.json` with two new optional fields:

#### `linkedArtifacts` Object

Tracks associated spec files for a roadmap item:

```json
{
  "linkedArtifacts": {
    "type": "object",
    "properties": {
      "specSlug": {
        "type": "string",
        "description": "Slug used for spec directory (e.g., 'transaction-sync')"
      },
      "ideationPath": {
        "type": "string",
        "description": "Path to ideation file (e.g., 'specs/transaction-sync/01-ideation.md')"
      },
      "specPath": {
        "type": "string",
        "description": "Path to specification file"
      },
      "tasksPath": {
        "type": "string",
        "description": "Path to tasks breakdown file"
      },
      "implementationPath": {
        "type": "string",
        "description": "Path to implementation summary file"
      }
    },
    "additionalProperties": false
  }
}
```

#### `ideationContext` Object

Stores rich context for generating ideation prompts:

```json
{
  "ideationContext": {
    "type": "object",
    "properties": {
      "targetUsers": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Who benefits from this feature"
      },
      "painPoints": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Problems this solves"
      },
      "successCriteria": {
        "type": "array",
        "items": { "type": "string" },
        "description": "How we measure success"
      },
      "constraints": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Explicit limitations or out-of-scope items"
      }
    },
    "additionalProperties": false
  }
}
```

### 2. HTML Visualization Updates

#### Card Layout Changes

Add action buttons and spec links to each roadmap card:

```html
<!-- New elements in item-card -->
<div class="item-actions">
  <button class="action-btn ideate-btn" data-id="{item.id}" title="Copy ideation command">
    Start Ideation
  </button>
</div>

<!-- Spec links section (shown when linkedArtifacts exists) -->
<div class="spec-links">
  <a href="{ideationPath}" class="spec-link">Ideation</a>
  <a href="{specPath}" class="spec-link">Spec</a>
  <a href="{implementationPath}" class="spec-link">Implementation</a>
</div>
```

#### Toast Notification

Show confirmation when command is copied:

```html
<div id="toast" class="toast hidden">
  <span class="toast-message">Copied to clipboard!</span>
</div>
```

### 3. JavaScript Enhancements

#### Ideation Prompt Generator

```javascript
function generateIdeationPrompt(item) {
  const parts = [item.title];

  if (item.description) {
    parts.push(item.description);
  }

  if (item.ideationContext) {
    const ctx = item.ideationContext;

    if (ctx.targetUsers?.length) {
      parts.push(`Target users: ${ctx.targetUsers.join(', ')}.`);
    }
    if (ctx.painPoints?.length) {
      parts.push(`Pain points: ${ctx.painPoints.join('; ')}.`);
    }
    if (ctx.successCriteria?.length) {
      parts.push(`Success criteria: ${ctx.successCriteria.join('; ')}.`);
    }
    if (ctx.constraints?.length) {
      parts.push(`Constraints: ${ctx.constraints.join('; ')}.`);
    }
  }

  return `/ideate --roadmap-id ${item.id} ${parts.join(' ')}`;
}
```

#### Copy to Clipboard Handler

```javascript
async function copyIdeationCommand(itemId) {
  const item = roadmapData.items.find(i => i.id === itemId);
  if (!item) return;

  const command = generateIdeationPrompt(item);

  try {
    await navigator.clipboard.writeText(command);
    showToast('Copied to clipboard!');
  } catch (err) {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = command;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast('Copied to clipboard!');
  }
}
```

#### Spec Links Rendering

```javascript
function renderSpecLinks(item) {
  if (!item.linkedArtifacts) return '';

  const links = [];
  const artifacts = item.linkedArtifacts;

  // Use relative paths - served via HTTP server at same origin
  if (artifacts.ideationPath) {
    links.push(`<a href="../${artifacts.ideationPath}" class="spec-link" target="_blank">Ideation</a>`);
  }
  if (artifacts.specPath) {
    links.push(`<a href="../${artifacts.specPath}" class="spec-link" target="_blank">Spec</a>`);
  }
  if (artifacts.implementationPath) {
    links.push(`<a href="../${artifacts.implementationPath}" class="spec-link" target="_blank">Implementation</a>`);
  }

  return links.length > 0
    ? `<div class="spec-links">${links.join('')}</div>`
    : '';
}
```

### 4. CSS Additions

```css
/* Action buttons */
.item-actions {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-3);
  padding-top: var(--space-3);
  border-top: 1px solid var(--border);
}

.action-btn {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--card);
  color: var(--foreground);
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms ease-out;
}

.action-btn:hover {
  background: var(--muted);
  border-color: var(--primary);
}

.action-btn.ideate-btn {
  background: var(--primary);
  color: var(--primary-foreground);
  border-color: var(--primary);
}

.action-btn.ideate-btn:hover {
  opacity: 0.9;
}

/* Spec links */
.spec-links {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-3);
  flex-wrap: wrap;
}

.spec-link {
  font-size: 0.75rem;
  color: var(--info);
  text-decoration: none;
  padding: var(--space-1) var(--space-2);
  background: oklch(from var(--info) l c h / 0.1);
  border-radius: var(--radius-sm);
  transition: all 150ms ease-out;
}

.spec-link:hover {
  background: oklch(from var(--info) l c h / 0.2);
  text-decoration: underline;
}

/* Toast notification */
.toast {
  position: fixed;
  bottom: var(--space-6);
  left: 50%;
  transform: translateX(-50%);
  background: var(--primary);
  color: var(--primary-foreground);
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  opacity: 1;
  transition: opacity 300ms ease-out;
}

.toast.hidden {
  opacity: 0;
  pointer-events: none;
}
```

### 5. Python Utilities

#### `update_status.py`

Updates a roadmap item's status:

```python
#!/usr/bin/env python3
"""Update roadmap item status."""

import sys
from datetime import datetime, timezone
from utils import load_roadmap, save_roadmap

VALID_STATUSES = ['not-started', 'in-progress', 'completed', 'on-hold']

def update_status(item_id: str, new_status: str) -> bool:
    """Update status of a roadmap item by ID."""
    if new_status not in VALID_STATUSES:
        print(f"Error: Invalid status '{new_status}'. Valid: {VALID_STATUSES}")
        return False

    roadmap = load_roadmap()
    if not roadmap:
        print("Error: Could not load roadmap.json")
        return False

    for item in roadmap.get('items', []):
        if item.get('id') == item_id:
            old_status = item.get('status')
            item['status'] = new_status
            item['updatedAt'] = datetime.now(timezone.utc).isoformat()
            roadmap['lastUpdated'] = datetime.now(timezone.utc).isoformat()

            if save_roadmap(roadmap):
                print(f"Updated '{item.get('title')}': {old_status} -> {new_status}")
                return True
            else:
                print("Error: Failed to save roadmap.json")
                return False

    print(f"Error: Item with ID '{item_id}' not found")
    return False

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Usage: python3 update_status.py <item-id> <new-status>")
        print(f"Valid statuses: {VALID_STATUSES}")
        sys.exit(1)

    success = update_status(sys.argv[1], sys.argv[2])
    sys.exit(0 if success else 1)
```

#### `link_spec.py`

Links a spec directory to a roadmap item:

```python
#!/usr/bin/env python3
"""Link spec files to a roadmap item."""

import sys
import os
from datetime import datetime, timezone
from utils import load_roadmap, save_roadmap, get_project_root

def link_spec(item_id: str, spec_slug: str) -> bool:
    """Link spec files to a roadmap item by ID."""
    roadmap = load_roadmap()
    if not roadmap:
        print("Error: Could not load roadmap.json")
        return False

    project_root = get_project_root()
    spec_dir = os.path.join(project_root, 'specs', spec_slug)

    if not os.path.isdir(spec_dir):
        print(f"Warning: Spec directory '{spec_dir}' does not exist yet")

    for item in roadmap.get('items', []):
        if item.get('id') == item_id:
            # Build linkedArtifacts object
            linked = {'specSlug': spec_slug}

            # Check which files exist
            ideation_path = f"specs/{spec_slug}/01-ideation.md"
            spec_path = f"specs/{spec_slug}/02-specification.md"
            tasks_path = f"specs/{spec_slug}/03-tasks.md"
            impl_path = f"specs/{spec_slug}/04-implementation.md"

            if os.path.isfile(os.path.join(project_root, ideation_path)):
                linked['ideationPath'] = ideation_path
            if os.path.isfile(os.path.join(project_root, spec_path)):
                linked['specPath'] = spec_path
            if os.path.isfile(os.path.join(project_root, tasks_path)):
                linked['tasksPath'] = tasks_path
            if os.path.isfile(os.path.join(project_root, impl_path)):
                linked['implementationPath'] = impl_path

            item['linkedArtifacts'] = linked
            item['updatedAt'] = datetime.now(timezone.utc).isoformat()
            roadmap['lastUpdated'] = datetime.now(timezone.utc).isoformat()

            if save_roadmap(roadmap):
                print(f"Linked '{item.get('title')}' to specs/{spec_slug}/")
                for key, value in linked.items():
                    print(f"  - {key}: {value}")
                return True
            else:
                print("Error: Failed to save roadmap.json")
                return False

    print(f"Error: Item with ID '{item_id}' not found")
    return False

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Usage: python3 link_spec.py <item-id> <spec-slug>")
        print("Example: python3 link_spec.py 550e8400-... transaction-sync")
        sys.exit(1)

    success = link_spec(sys.argv[1], sys.argv[2])
    sys.exit(0 if success else 1)
```

#### `slugify.py`

Generates URL-safe slugs from titles:

```python
#!/usr/bin/env python3
"""Generate URL-safe slug from roadmap item title."""

import sys
import re
from utils import load_roadmap

def slugify(text: str) -> str:
    """Convert text to URL-safe slug."""
    # Convert to lowercase
    slug = text.lower()
    # Replace spaces and underscores with hyphens
    slug = re.sub(r'[\s_]+', '-', slug)
    # Remove non-alphanumeric characters (except hyphens)
    slug = re.sub(r'[^a-z0-9-]', '', slug)
    # Remove multiple consecutive hyphens
    slug = re.sub(r'-+', '-', slug)
    # Remove leading/trailing hyphens
    slug = slug.strip('-')
    return slug

def get_slug_for_item(item_id: str) -> str | None:
    """Get slug for a roadmap item by ID."""
    roadmap = load_roadmap()
    if not roadmap:
        return None

    for item in roadmap.get('items', []):
        if item.get('id') == item_id:
            return slugify(item.get('title', ''))

    return None

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python3 slugify.py <text-or-item-id>")
        sys.exit(1)

    arg = sys.argv[1]

    # Check if it's a UUID (roadmap item ID)
    uuid_pattern = r'^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$'
    if re.match(uuid_pattern, arg):
        slug = get_slug_for_item(arg)
        if slug:
            print(slug)
        else:
            print(f"Error: Item with ID '{arg}' not found", file=sys.stderr)
            sys.exit(1)
    else:
        print(slugify(arg))
```

#### `find_by_title.py`

Finds roadmap items by title (case-insensitive partial match):

```python
#!/usr/bin/env python3
"""Find roadmap items by title."""

import sys
import json
from utils import load_roadmap

def find_by_title(query: str) -> list[dict]:
    """Find roadmap items matching title query (case-insensitive)."""
    roadmap = load_roadmap()
    if not roadmap:
        return []

    query_lower = query.lower()
    matches = []

    for item in roadmap.get('items', []):
        title = item.get('title', '').lower()
        if query_lower in title:
            matches.append({
                'id': item.get('id'),
                'title': item.get('title'),
                'status': item.get('status'),
                'moscow': item.get('moscow')
            })

    return matches

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python3 find_by_title.py <title-query>")
        sys.exit(1)

    query = ' '.join(sys.argv[1:])
    matches = find_by_title(query)

    if not matches:
        print(f"No items found matching '{query}'", file=sys.stderr)
        sys.exit(1)
    elif len(matches) == 1:
        print(matches[0]['id'])
    else:
        # Multiple matches - output JSON for caller to handle
        print(json.dumps(matches, indent=2))
        sys.exit(2)  # Exit code 2 = multiple matches
```

### Error Handling

All Python utilities follow consistent error handling patterns:

| Scenario | Behavior | Exit Code |
|----------|----------|-----------|
| `roadmap.json` not found | Error: "Could not load roadmap.json" | 1 |
| Invalid item ID format | Error: "Invalid UUID format" | 1 |
| Item ID not found | Error: "Item with ID 'xxx' not found" | 1 |
| Spec directory doesn't exist | Warning (not error), creates partial link | 0 |
| JSON parse error | Error: "Failed to parse roadmap.json: {details}" | 1 |
| Write permission denied | Error: "Failed to save roadmap.json: {details}" | 1 |
| Multiple title matches | Outputs JSON array of matches | 2 |
| Invalid status value | Error: "Invalid status '{value}'. Valid: [list]" | 1 |
| Invalid status transition | Error: "Cannot transition from '{old}' to '{new}'" | 1 |

#### Status Transition Rules

The `update_status.py` script enforces valid status transitions:

```python
VALID_TRANSITIONS = {
    'not-started': ['in-progress', 'on-hold'],
    'in-progress': ['completed', 'on-hold', 'not-started'],  # Allow restart
    'completed': ['in-progress'],  # Allow reopening
    'on-hold': ['not-started', 'in-progress']
}

def validate_transition(current: str, new: str, force: bool = False) -> bool:
    """Validate status transition is allowed."""
    if force:
        return True
    if current == new:
        return True  # No change
    allowed = VALID_TRANSITIONS.get(current, [])
    return new in allowed
```

Use `--force` flag to bypass transition validation if needed:

```bash
python3 update_status.py <item-id> completed --force
```

#### Failure Detection for `/ideate`

The `/ideate` command is considered failed if:

1. The `specs/{slug}/01-ideation.md` file is not created
2. The command exits with an error before completing Step 7
3. Python script calls return non-zero exit codes

On failure:
- Status remains "in-progress" (not reverted to "not-started")
- `linkedArtifacts.specSlug` is set but paths remain empty
- User can re-run `/ideate` to retry or manually update status

### 6. Command Modifications

#### `/ideate` Command Updates

Update the command frontmatter to accept roadmap parameters:

```yaml
# .claude/commands/ideate.md frontmatter update
---
description: Structured ideation with documentation
allowed-tools: Read, Grep, Glob, Bash(git:*), Bash(npm:*), Bash(npx:*), Task(playwright-expert)
argument-hint: "[--roadmap-id <uuid> | --roadmap-item \"<title>\"] <task-brief>"
category: workflow
---
```

Add `--roadmap-id` or `--roadmap-item` flag parsing and status update:

```markdown
<!-- Add to ideate.md after Step 1 -->

### Step 0: Parse Roadmap Integration (Optional)

If the command includes `--roadmap-id <uuid>` or `--roadmap-item "<title>"`:

**For `--roadmap-id <uuid>`:**
1. Extract the UUID from the command arguments
2. Store as `ROADMAP_ITEM_ID` for later use
3. Remove `--roadmap-id <uuid>` from the task brief

**For `--roadmap-item "<title>"` (title-based lookup):**
1. Search roadmap.json for items with matching title (case-insensitive partial match)
2. If exactly one match, use that item's ID as `ROADMAP_ITEM_ID`
3. If multiple matches, prompt user to select using AskUserQuestion
4. If no matches, warn and proceed without linking
5. Remove `--roadmap-item "<title>"` from the task brief

**After Step 1 (slug creation), if `ROADMAP_ITEM_ID` is set:**
1. Run status update:
   ```bash
   python3 .claude/skills/roadmap-moscow/scripts/update_status.py $ROADMAP_ITEM_ID in-progress
   python3 .claude/skills/roadmap-moscow/scripts/link_spec.py $ROADMAP_ITEM_ID $SLUG
   ```
2. Add frontmatter to generated ideation file:
   ```markdown
   ---
   roadmapId: {ROADMAP_ITEM_ID}
   ---
   ```
```

#### `/spec:execute` Completion Updates

Add roadmap status update on completion:

```markdown
<!-- Add to spec/execute.md after final task completion -->

### Roadmap Integration (If Applicable)

After all tasks are completed:

1. Check if `specs/{slug}/01-ideation.md` contains `roadmapId` in frontmatter
2. If found, update roadmap status:
   ```bash
   python3 .claude/skills/roadmap-moscow/scripts/update_status.py $ROADMAP_ID completed
   python3 .claude/skills/roadmap-moscow/scripts/link_spec.py $ROADMAP_ID $SLUG
   ```
3. The link_spec.py will update linkedArtifacts with all existing spec file paths
```

#### `/ideate-to-spec` Updates

Preserve roadmap linking through the spec transformation:

```markdown
<!-- Add to ideate-to-spec.md when generating specification -->

### Roadmap Context Preservation

When transforming ideation to specification:

1. Check if `specs/{slug}/01-ideation.md` contains `roadmapId` in frontmatter
2. If found, include the same `roadmapId` in `02-specification.md` frontmatter:
   ```markdown
   ---
   roadmapId: {ROADMAP_ITEM_ID}
   ---
   ```
3. This ensures the roadmap link is preserved through the full lifecycle:
   - `01-ideation.md` → `02-specification.md` → `03-tasks.md` → `04-implementation.md`
4. Update linkedArtifacts when spec is created:
   ```bash
   python3 .claude/skills/roadmap-moscow/scripts/link_spec.py $ROADMAP_ID $SLUG
   ```
```

### 7. `/roadmap enrich` Command

Add a new subcommand to populate ideationContext for existing items:

```markdown
### enrich <item-id>

Enrich an existing roadmap item with ideationContext.

Usage: `/roadmap enrich <item-id>` or `/roadmap enrich <item-title>`

**Workflow:**
1. Load the roadmap item by ID or title match
2. Analyze existing title and description
3. Suggest inferred values for:
   - targetUsers (who benefits)
   - painPoints (problems solved)
   - successCriteria (how to measure success)
   - constraints (explicit limitations)
4. Present suggestions to user for approval/modification
5. Update roadmap.json with approved ideationContext
6. Run validation

**Example:**
```
/roadmap enrich "Transaction sync and storage"

I found: "Transaction sync and storage"
Description: "Fetch transactions from Plaid and store them locally..."

Based on this, I suggest:
- Target users: ["users tracking personal spending", "first-time users setting up accounts"]
- Pain points: ["manual tracking is tedious", "no visibility into transaction history"]
- Success criteria: ["transactions auto-import", "no duplicate entries", "< 5s sync time"]
- Constraints: ["read-only (no payment initiation)", "US banks only initially"]

Would you like to modify any of these before saving?
```
```

### 8. Skill Updates

#### `SKILL.md` Additions

```markdown
## Roadmap-Claude Code Integration

### Automatic Activation Triggers

The roadmap-moscow skill is automatically applied when:
- User mentions "roadmap" in prompts
- Working on files in `roadmap/` directory
- Running `/ideate` with `--roadmap-id` or `--roadmap-item` flag
- Running `/spec:execute` on specs with `roadmapId` frontmatter
- Running `/roadmap` commands (view, add, enrich, etc.)
- Editing `roadmap.json` or `schema.json`

When working with roadmap items that have associated specs:

### Automatic Status Updates

The roadmap skill can autonomously update item status when:
- **Starting ideation**: Set status to `in-progress` when `/ideate --roadmap-id` is run
- **Completing implementation**: Set status to `completed` when `/spec:execute` finishes all tasks

### Linking Specs to Roadmap Items

When creating specs for roadmap items:
1. Use the item's UUID with `--roadmap-id` flag
2. The slug will be derived from the item title
3. Links will be automatically added to the roadmap item

### Utility Commands

```bash
# Update item status
python3 .claude/skills/roadmap-moscow/scripts/update_status.py <item-id> <status>

# Link spec to item
python3 .claude/skills/roadmap-moscow/scripts/link_spec.py <item-id> <spec-slug>

# Generate slug from title
python3 .claude/skills/roadmap-moscow/scripts/slugify.py <title-or-item-id>
```

### Best Practices

1. Always use `--roadmap-id` when ideating from a roadmap item
2. Check linkedArtifacts before starting work (avoid duplicate specs)
3. Run validation after any roadmap updates
4. Keep ideationContext fields populated for better ideation prompts
```

---

## User Experience

### Workflow: Roadmap Item to Implementation

1. **View Roadmap**: User opens `http://localhost:8765/roadmap.html`
2. **Find Item**: User locates the roadmap item they want to work on
3. **Start Ideation**: User clicks "Start Ideation" button on the card
4. **Copy Confirmation**: Toast appears confirming command copied to clipboard
5. **Paste in Terminal**: User pastes `/ideate --roadmap-id ... <context>` into Claude Code
6. **Automatic Updates**:
   - Status changes to "in-progress"
   - linkedArtifacts populated with ideation path
7. **Continue Workflow**: User runs `/ideate-to-spec`, `/spec:decompose`, `/spec:execute`
8. **Completion**: When `/spec:execute` finishes, status changes to "completed"
9. **View Progress**: User returns to roadmap HTML to see linked spec files

### Visual Feedback

- Cards with linked specs show clickable links to spec files
- "Start Ideation" button disabled (or shows "View Spec") for items with existing linkedArtifacts
- Status badges update to reflect workflow progress

---

## Testing Strategy

### Unit Tests

| Test | Purpose | Expected Result |
|------|---------|-----------------|
| `test_slugify` | Verify slug generation from titles | "Transaction sync and storage" → "transaction-sync-and-storage" |
| `test_slugify_special_chars` | Handle special characters | "User's Dashboard (v2)" → "users-dashboard-v2" |
| `test_update_status_valid` | Update status with valid value | Status changes, timestamps updated |
| `test_update_status_invalid` | Reject invalid status | Error message, no changes |
| `test_link_spec_existing` | Link to existing spec directory | linkedArtifacts populated correctly |
| `test_link_spec_nonexistent` | Handle missing spec directory | Warning printed, partial link created |
| `test_generate_ideation_prompt` | Generate prompt from item data | Includes title, description, context |

### Integration Tests

| Test | Purpose | Expected Result |
|------|---------|-----------------|
| `test_full_workflow` | End-to-end: ideate → spec → execute | Status transitions correctly, all links populated |
| `test_clipboard_copy` | Browser copy functionality | Command in clipboard matches expected format |
| `test_spec_links_render` | Spec links display in HTML | Links appear, are clickable |
| `test_backward_compatibility` | Items without new fields still render | No errors, graceful degradation |
| `test_enrich_by_id` | Enrich item with ideationContext by ID | Context populated, validation passes |
| `test_enrich_by_title` | Enrich item by title match | Correct item found, context populated |
| `test_enrich_nonexistent` | Enrich missing item | Error message, no changes to roadmap |
| `test_enrich_modify` | User modifies suggested context | Modified values saved correctly |
| `test_title_lookup_single` | Find item by title (one match) | Returns correct item ID |
| `test_title_lookup_multiple` | Find item by title (multiple matches) | Returns JSON array, exit code 2 |
| `test_title_lookup_none` | Find item by title (no matches) | Error message, exit code 1 |
| `test_status_transition_valid` | Valid status transitions | Status updated successfully |
| `test_status_transition_invalid` | Invalid status transition without --force | Error, no change |
| `test_status_transition_force` | Invalid transition with --force | Status updated despite invalid transition |

### Manual Testing

1. Add ideationContext to a roadmap item
2. Open roadmap in browser
3. Click "Start Ideation" button
4. Verify clipboard contains correct command
5. Paste and run in Claude Code
6. Verify roadmap status updated
7. Complete spec workflow
8. Verify final status and all links

---

## Performance Considerations

- **JSON parsing**: Roadmap file is small (<100 items expected), no performance concern
- **Clipboard API**: Modern browsers handle this efficiently
- **File I/O**: Python scripts read/write single JSON file, minimal overhead
- **No external network calls**: All operations are local

---

## Security Considerations

- **HTML escaping**: All user-provided content escaped before rendering
- **Clipboard API**: Requires secure context (HTTPS or localhost)
- **File paths**: Sanitized to prevent path traversal
- **No sensitive data**: Roadmap contains project metadata, not credentials

---

## Documentation

### Updates Required

| Document | Changes |
|----------|---------|
| `CLAUDE.md` | Add roadmap integration workflow section |
| `roadmap/README.md` | Document new fields and integration features |
| `.claude/skills/roadmap-moscow/SKILL.md` | Add integration guidance, automatic activation triggers |
| `.claude/commands/ideate.md` | Document `--roadmap-id` and `--roadmap-item` flags |
| `.claude/commands/ideate-to-spec.md` | Document roadmapId preservation in spec frontmatter |
| `.claude/commands/spec/execute.md` | Document completion status update |
| `.claude/commands/roadmap.md` | Document new `enrich` subcommand |

---

## Alternative Implementation: Hook-Based Automation

An alternative to modifying slash commands directly is to use PostToolUse hooks for automatic roadmap updates. This approach is more loosely coupled but less explicit.

### Hook-Based Approach

```json
// .claude/settings.json hook configuration
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write",
        "command": "python3 .claude/skills/roadmap-moscow/scripts/detect_spec_creation.py \"$FILE_PATH\""
      }
    ]
  }
}
```

### `detect_spec_creation.py`

```python
#!/usr/bin/env python3
"""Detect spec file creation and update roadmap accordingly."""

import sys
import re
from pathlib import Path

def detect_and_update(file_path: str) -> None:
    path = Path(file_path)

    # Check if this is a spec file
    if not path.match('specs/*/0[1-4]-*.md'):
        return

    # Extract slug from path
    slug = path.parent.name

    # Read file to check for roadmapId in frontmatter
    content = path.read_text()
    match = re.search(r'^roadmapId:\s*([a-f0-9-]+)', content, re.MULTILINE)

    if not match:
        return

    roadmap_id = match.group(1)
    file_type = path.name

    if file_type == '01-ideation.md':
        # Ideation created -> set status to in-progress
        os.system(f'python3 .claude/skills/roadmap-moscow/scripts/update_status.py {roadmap_id} in-progress')
    elif file_type == '04-implementation.md':
        # Check if implementation is complete
        if 'Status:** Complete' in content:
            os.system(f'python3 .claude/skills/roadmap-moscow/scripts/update_status.py {roadmap_id} completed')

    # Always update links
    os.system(f'python3 .claude/skills/roadmap-moscow/scripts/link_spec.py {roadmap_id} {slug}')

if __name__ == '__main__':
    if len(sys.argv) > 1:
        detect_and_update(sys.argv[1])
```

### Trade-offs

| Aspect | Command Modification | Hook-Based |
|--------|---------------------|------------|
| **Explicitness** | Clear, intentional | Implicit, automatic |
| **Coupling** | Commands depend on roadmap | Loosely coupled |
| **Debugging** | Easier to trace | Harder to debug |
| **Flexibility** | Requires opt-in via flags | Always active |
| **Reliability** | Guaranteed execution order | Depends on hook timing |

**Recommendation:** Use the command modification approach (primary) for reliability, but document the hook approach as an optional enhancement for teams preferring automatic updates.

---

## Implementation Phases

### Phase 1: Schema & Data Model

**Tasks:**
1. Extend `roadmap/schema.json` with `linkedArtifacts` and `ideationContext` definitions
2. Add new fields to `roadmap/roadmap.json` for existing items (optional/empty initially)
3. Create `slugify.py` utility
4. Create `update_status.py` utility
5. Create `link_spec.py` utility
6. Update `utils.py` with any needed helpers
7. Run validation to ensure schema changes work

### Phase 2: HTML Visualization Updates

**Tasks:**
1. Update `roadmap.html` with toast container element
2. Add action button rendering to `createItemCard()` in `scripts.js`
3. Implement `generateIdeationPrompt()` function
4. Implement `copyIdeationCommand()` with clipboard API
5. Implement `showToast()` function
6. Add spec links rendering (`renderSpecLinks()`)
7. Add CSS for buttons, toast, and spec links to `styles.css`
8. Test in browser with sample data

### Phase 3: Command Integration

**Tasks:**
1. Update `/ideate` command frontmatter to accept `--roadmap-id` and `--roadmap-item` flags
2. Add roadmap parameter parsing to `/ideate` workflow (Step 0)
3. Add `find_by_title.py` utility for title-based lookup
4. Add roadmap status update call to `/ideate` workflow
5. Add spec linking call to `/ideate` workflow
6. Add frontmatter generation with roadmapId
7. Update `/ideate-to-spec` to preserve roadmapId in spec frontmatter
8. Update `/spec:execute` to detect roadmapId in spec files
9. Add completion status update to `/spec:execute`
10. Add `/roadmap enrich` subcommand to `.claude/commands/roadmap.md`
11. Test full workflow end-to-end

### Phase 4: Documentation & Testing

**Tasks:**
1. Update `CLAUDE.md` with integration workflow
2. Update `roadmap/README.md` with new features
3. Update `SKILL.md` with integration guidance
4. Write Python utility tests
5. Manual testing of full workflow
6. Fix any issues discovered during testing

---

## Open Questions

1. ~~**Browser file:// links**~~ (RESOLVED)
   **Answer:** Use HTTP server for spec links
   **Rationale:** Already using server for roadmap.html; consistent and reliable across browsers.

2. ~~**Existing items migration**~~ (RESOLVED)
   **Answer:** Agent-based approach via `/roadmap enrich <item-id>` command
   **Rationale:** Claude can infer ideationContext from existing description/title, provide intelligent suggestions, and handle edits conversationally. A script would be rigid and require users to think of all context from scratch. Agent approach leverages Claude's understanding of the project context.

3. ~~**Status rollback**~~ (RESOLVED)
   **Answer:** Keep status as "in-progress" on failure
   **Rationale:** User can decide whether to resume, mark as blocked, or take other action. Reverting to "not-started" would lose progress tracking.

---

## References

- [Ideation Document](./01-ideation.md)
- [Roadmap Management System Spec](../roadmap-management-system/02-specification.md)
- [Clipboard API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API)
- [JSON Schema Draft-07](https://json-schema.org/specification-links.html#draft-7)

---

## Changelog

| Date | Author | Changes |
|------|--------|---------|
| 2025-12-09 | Claude Code | Initial specification |
| 2025-12-09 | Claude Code | Added: `--roadmap-item` title-based lookup as alternative to UUID |
| 2025-12-09 | Claude Code | Added: `/ideate-to-spec` integration to preserve roadmapId through lifecycle |
| 2025-12-09 | Claude Code | Added: `find_by_title.py` utility script |
| 2025-12-09 | Claude Code | Added: Error handling documentation with exit codes |
| 2025-12-09 | Claude Code | Added: Status transition validation rules with `--force` override |
| 2025-12-09 | Claude Code | Added: Skill automatic activation triggers section |
| 2025-12-09 | Claude Code | Added: Hook-based alternative implementation as optional approach |
| 2025-12-09 | Claude Code | Added: Additional integration tests for enrich, title lookup, status transitions |
| 2025-12-09 | Claude Code | Fixed: Section numbering (7, 8) |
| 2025-12-09 | Claude Code | Updated: Phase 3 tasks to include new requirements |
| 2025-12-09 | Claude Code | Updated: Documentation table with new files |
