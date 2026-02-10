# Task Breakdown: Roadmap-Claude Code Integration

**Generated:** 2025-12-09
**Source:** specs/roadmap-claude-code-integration/02-specification.md
**Slug:** roadmap-claude-code-integration
**Task Management:** Built-in task tools (TaskCreate, TaskList, TaskGet, TaskUpdate)

---

## Overview

This task breakdown decomposes the Roadmap-Claude Code Integration specification into actionable implementation tasks. The feature enables seamless transitions from roadmap planning to implementation through:

- One-click ideation command copying from roadmap HTML visualization
- Bidirectional linking between roadmap items and spec files
- Automatic status updates as work progresses through the lifecycle
- Rich context preservation in generated ideation prompts

---

## Decompose Metadata

### Decompose History
| Session | Date | Mode | New Tasks | Notes |
|---------|------|------|-----------|-------|
| 1 | 2025-12-09 | Full | 32 | Initial decomposition |

### Last Decompose
2025-12-09

---

## Phase 1: Schema & Data Model

### Task 1.1: Extend roadmap schema with linkedArtifacts definition

**Description:** Add the `linkedArtifacts` object definition to `roadmap/schema.json` for tracking associated spec files.

**Size:** Small
**Priority:** High
**Dependencies:** None
**Can run parallel with:** Task 1.2

**Technical Requirements:**
- Add `linkedArtifacts` to the `properties` section of the item schema
- All fields are optional (partial linking supported)
- Use JSON Schema Draft-07 syntax

**Implementation:**

Add to `roadmap/schema.json` under the item definition's `properties`:

```json
"linkedArtifacts": {
  "type": "object",
  "description": "Associated spec files for this roadmap item",
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
```

**Acceptance Criteria:**
- [ ] `linkedArtifacts` field added to schema with all 5 subfields
- [ ] All fields are optional (not in `required` array)
- [ ] Schema validation passes: `python3 .claude/skills/roadmap-moscow/scripts/validate.py`
- [ ] Existing roadmap.json items still validate after schema update

---

### Task 1.2: Extend roadmap schema with ideationContext definition

**Description:** Add the `ideationContext` object definition to `roadmap/schema.json` for storing rich context for ideation prompts.

**Size:** Small
**Priority:** High
**Dependencies:** None
**Can run parallel with:** Task 1.1

**Technical Requirements:**
- Add `ideationContext` to the `properties` section of the item schema
- All fields are arrays of strings
- Use JSON Schema Draft-07 syntax

**Implementation:**

Add to `roadmap/schema.json` under the item definition's `properties`:

```json
"ideationContext": {
  "type": "object",
  "description": "Rich context for generating ideation prompts",
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
```

**Acceptance Criteria:**
- [ ] `ideationContext` field added to schema with all 4 array fields
- [ ] All fields are optional
- [ ] Schema validation passes
- [ ] Existing roadmap.json items still validate after schema update

---

### Task 1.3: Create slugify.py utility script

**Description:** Create a Python utility to generate URL-safe slugs from roadmap item titles.

**Size:** Small
**Priority:** High
**Dependencies:** None
**Can run parallel with:** Task 1.1, 1.2, 1.4, 1.5

**Technical Requirements:**
- Python 3.8+ with stdlib only (no pip dependencies)
- Handle special characters, spaces, underscores
- Support both direct text input and item ID lookup
- Detect UUID format for item ID mode

**Implementation:**

Create `roadmap/scripts/slugify.py`:

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

**Acceptance Criteria:**
- [ ] Script runs: `python3 roadmap/scripts/slugify.py "Test Title"` outputs `test-title`
- [ ] Special characters handled: `"User's Dashboard (v2)"` → `users-dashboard-v2`
- [ ] UUID mode works: looks up item title and slugifies it
- [ ] Error handling: exits 1 if item ID not found
- [ ] Tests pass (if using project test framework)

---

### Task 1.4: Create update_status.py utility script

**Description:** Create a Python utility to update a roadmap item's status with transition validation.

**Size:** Medium
**Priority:** High
**Dependencies:** None
**Can run parallel with:** Task 1.1, 1.2, 1.3, 1.5

**Technical Requirements:**
- Python 3.8+ with stdlib only
- Validate status values: not-started, in-progress, completed, on-hold
- Enforce status transition rules (with --force override)
- Update timestamps (updatedAt on item, lastUpdated on roadmap)

**Implementation:**

Create `roadmap/scripts/update_status.py`:

```python
#!/usr/bin/env python3
"""Update roadmap item status."""

import sys
from datetime import datetime, timezone
from utils import load_roadmap, save_roadmap

VALID_STATUSES = ['not-started', 'in-progress', 'completed', 'on-hold']

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

def update_status(item_id: str, new_status: str, force: bool = False) -> bool:
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
            old_status = item.get('status', 'not-started')

            if not validate_transition(old_status, new_status, force):
                print(f"Error: Cannot transition from '{old_status}' to '{new_status}'")
                print(f"Valid transitions from '{old_status}': {VALID_TRANSITIONS.get(old_status, [])}")
                print("Use --force to override transition validation")
                return False

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
    if len(sys.argv) < 3:
        print("Usage: python3 update_status.py <item-id> <new-status> [--force]")
        print(f"Valid statuses: {VALID_STATUSES}")
        sys.exit(1)

    force = '--force' in sys.argv
    args = [a for a in sys.argv[1:] if a != '--force']

    if len(args) != 2:
        print("Usage: python3 update_status.py <item-id> <new-status> [--force]")
        sys.exit(1)

    success = update_status(args[0], args[1], force)
    sys.exit(0 if success else 1)
```

**Acceptance Criteria:**
- [ ] Valid status update works: `python3 update_status.py <id> in-progress`
- [ ] Invalid status rejected with error message
- [ ] Invalid transition rejected: `not-started` → `completed` fails without --force
- [ ] Force flag works: `--force` bypasses transition validation
- [ ] Timestamps updated: both item.updatedAt and roadmap.lastUpdated
- [ ] Exit codes: 0 for success, 1 for failure

---

### Task 1.5: Create link_spec.py utility script

**Description:** Create a Python utility to link spec files to a roadmap item.

**Size:** Medium
**Priority:** High
**Dependencies:** None
**Can run parallel with:** Task 1.1, 1.2, 1.3, 1.4

**Technical Requirements:**
- Python 3.8+ with stdlib only
- Check which spec files exist and populate paths accordingly
- Handle missing spec directory with warning (not error)
- Update timestamps

**Implementation:**

Create `roadmap/scripts/link_spec.py`:

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

**Acceptance Criteria:**
- [ ] Links created for existing files: `python3 link_spec.py <id> my-feature`
- [ ] Missing directory shows warning but still creates partial link
- [ ] Only existing files get paths populated
- [ ] Timestamps updated
- [ ] Output shows which files were linked

---

### Task 1.6: Create find_by_title.py utility script

**Description:** Create a Python utility to find roadmap items by title with case-insensitive partial matching.

**Size:** Small
**Priority:** High
**Dependencies:** None
**Can run parallel with:** Task 1.1-1.5

**Technical Requirements:**
- Case-insensitive partial title matching
- Return single ID if one match
- Return JSON array if multiple matches (exit code 2)
- Return error if no matches (exit code 1)

**Implementation:**

Create `roadmap/scripts/find_by_title.py`:

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

**Acceptance Criteria:**
- [ ] Single match returns just the ID (exit 0)
- [ ] Multiple matches return JSON array (exit 2)
- [ ] No matches return error message (exit 1)
- [ ] Case-insensitive: "transaction" matches "Transaction Sync"
- [ ] Partial match: "sync" matches "Transaction sync and storage"

---

### Task 1.7: Update utils.py with get_project_root helper

**Description:** Add `get_project_root()` function to the existing utils.py if not present.

**Size:** Small
**Priority:** High
**Dependencies:** None
**Can run parallel with:** Task 1.1-1.6

**Technical Requirements:**
- Find project root by looking for .git directory or roadmap/ directory
- Fall back to current working directory
- Used by link_spec.py and other utilities

**Implementation:**

Add to `roadmap/scripts/utils.py` (if not already present):

```python
def get_project_root() -> str:
    """Find the project root directory."""
    import subprocess
    try:
        result = subprocess.run(
            ['git', 'rev-parse', '--show-toplevel'],
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout.strip()
    except (subprocess.CalledProcessError, FileNotFoundError):
        # Fallback: walk up from script location
        current = os.path.dirname(os.path.abspath(__file__))
        while current != '/':
            if os.path.isdir(os.path.join(current, 'roadmap')):
                return current
            current = os.path.dirname(current)
        return os.getcwd()
```

**Acceptance Criteria:**
- [ ] `get_project_root()` returns correct path from any subdirectory
- [ ] Works when run from project root
- [ ] Works when run from roadmap/scripts/
- [ ] Fallback works if git is not available

---

### Task 1.8: Run schema validation after changes

**Description:** Validate that all schema changes work correctly with existing data.

**Size:** Small
**Priority:** High
**Dependencies:** Task 1.1, 1.2
**Can run parallel with:** None (depends on schema tasks)

**Technical Requirements:**
- Run existing validation script
- Ensure no regression in existing roadmap items
- Test with a sample item containing new fields

**Implementation Steps:**

1. Run validation:
   ```bash
   python3 roadmap/scripts/validate.py
   ```

2. Test new fields by temporarily adding to an item in roadmap.json:
   ```json
   {
     "id": "...",
     "title": "Test Item",
     "linkedArtifacts": {
       "specSlug": "test-feature"
     },
     "ideationContext": {
       "targetUsers": ["developers"],
       "painPoints": ["manual process"],
       "successCriteria": ["automated"],
       "constraints": ["no external deps"]
     }
   }
   ```

3. Run validation again to confirm new fields validate

4. Remove test data (or keep if it's a real item)

**Acceptance Criteria:**
- [ ] Validation passes with no errors
- [ ] Existing items still valid
- [ ] New fields can be added and validate correctly
- [ ] Empty new fields validate (they're optional)

---

## Phase 2: HTML Visualization Updates

### Task 2.1: Add toast notification container to roadmap.html

**Description:** Add a toast notification element for clipboard copy feedback.

**Size:** Small
**Priority:** High
**Dependencies:** None
**Can run parallel with:** Task 2.2, 2.7

**Technical Requirements:**
- Add toast element at end of body
- Initially hidden
- Will be shown/hidden by JavaScript

**Implementation:**

Add before closing `</body>` tag in `roadmap/roadmap.html`:

```html
<!-- Toast notification -->
<div id="toast" class="toast hidden">
  <span class="toast-message">Copied to clipboard!</span>
</div>
```

**Acceptance Criteria:**
- [ ] Toast element present in HTML
- [ ] Has correct ID and classes
- [ ] Initially hidden (has `hidden` class)

---

### Task 2.2: Implement generateIdeationPrompt() function

**Description:** Create JavaScript function to generate the ideation command with rich context.

**Size:** Medium
**Priority:** High
**Dependencies:** None
**Can run parallel with:** Task 2.1, 2.3

**Technical Requirements:**
- Combine title, description, and ideationContext fields
- Generate `/ideate --roadmap-id <uuid> <context>` format
- Handle missing optional fields gracefully

**Implementation:**

Add to `roadmap/scripts.js`:

```javascript
/**
 * Generate ideation prompt command from roadmap item data
 * @param {Object} item - Roadmap item object
 * @returns {string} The /ideate command to copy
 */
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

**Acceptance Criteria:**
- [ ] Function generates correct command format
- [ ] Includes title and description
- [ ] Includes ideationContext fields when present
- [ ] Handles missing fields gracefully (no undefined in output)
- [ ] Output can be pasted directly into Claude Code

---

### Task 2.3: Implement copyIdeationCommand() function

**Description:** Create JavaScript function to copy ideation command to clipboard with fallback.

**Size:** Small
**Priority:** High
**Dependencies:** Task 2.2
**Can run parallel with:** Task 2.4

**Technical Requirements:**
- Use modern Clipboard API with fallback
- Show toast notification on success
- Handle errors gracefully

**Implementation:**

Add to `roadmap/scripts.js`:

```javascript
/**
 * Copy ideation command to clipboard
 * @param {string} itemId - The roadmap item ID
 */
async function copyIdeationCommand(itemId) {
  const item = roadmapData.items.find(i => i.id === itemId);
  if (!item) {
    console.error('Item not found:', itemId);
    return;
  }

  const command = generateIdeationPrompt(item);

  try {
    await navigator.clipboard.writeText(command);
    showToast('Copied to clipboard!');
  } catch (err) {
    // Fallback for older browsers or non-secure contexts
    const textarea = document.createElement('textarea');
    textarea.value = command;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showToast('Copied to clipboard!');
    } catch (e) {
      console.error('Copy failed:', e);
      showToast('Copy failed - please copy manually');
    }
    document.body.removeChild(textarea);
  }
}
```

**Acceptance Criteria:**
- [ ] Modern Clipboard API used when available
- [ ] Fallback works in older browsers
- [ ] Toast shown on successful copy
- [ ] Error handled gracefully with user feedback

---

### Task 2.4: Implement showToast() function

**Description:** Create JavaScript function to display and auto-hide toast notifications.

**Size:** Small
**Priority:** High
**Dependencies:** Task 2.1
**Can run parallel with:** Task 2.3

**Technical Requirements:**
- Show toast with message
- Auto-hide after delay
- Support custom messages

**Implementation:**

Add to `roadmap/scripts.js`:

```javascript
/**
 * Show a toast notification
 * @param {string} message - Message to display
 * @param {number} duration - Duration in ms (default 2000)
 */
function showToast(message, duration = 2000) {
  const toast = document.getElementById('toast');
  const messageEl = toast.querySelector('.toast-message');

  if (messageEl) {
    messageEl.textContent = message;
  }

  toast.classList.remove('hidden');

  setTimeout(() => {
    toast.classList.add('hidden');
  }, duration);
}
```

**Acceptance Criteria:**
- [ ] Toast appears with message
- [ ] Toast auto-hides after duration
- [ ] Custom messages work
- [ ] Multiple calls reset the timer

---

### Task 2.5: Add action button rendering to createItemCard()

**Description:** Update the card rendering function to include the "Start Ideation" button.

**Size:** Medium
**Priority:** High
**Dependencies:** Task 2.2, 2.3
**Can run parallel with:** Task 2.6

**Technical Requirements:**
- Add action buttons section to card
- Button should call copyIdeationCommand() on click
- Disable/change button for items with existing linkedArtifacts

**Implementation:**

Update `createItemCard()` in `roadmap/scripts.js` to add action buttons:

```javascript
// Add after the existing card content, before closing the card div

// Action buttons section
const hasLinkedSpec = item.linkedArtifacts?.specSlug;
const buttonText = hasLinkedSpec ? 'Copy Command' : 'Start Ideation';
const buttonClass = hasLinkedSpec ? 'action-btn' : 'action-btn ideate-btn';

cardHtml += `
  <div class="item-actions">
    <button class="${buttonClass}" onclick="copyIdeationCommand('${item.id}')" title="Copy ideation command to clipboard">
      ${buttonText}
    </button>
  </div>
`;
```

**Acceptance Criteria:**
- [ ] "Start Ideation" button appears on cards without linked specs
- [ ] "Copy Command" button appears on cards with linked specs
- [ ] Button click copies command to clipboard
- [ ] Button has proper styling classes

---

### Task 2.6: Implement renderSpecLinks() function

**Description:** Create JavaScript function to render clickable spec file links on cards.

**Size:** Medium
**Priority:** High
**Dependencies:** None
**Can run parallel with:** Task 2.5

**Technical Requirements:**
- Show links only when linkedArtifacts exists
- Use relative paths (served via HTTP)
- Open in new tab

**Implementation:**

Add to `roadmap/scripts.js`:

```javascript
/**
 * Render spec links for a roadmap item
 * @param {Object} item - Roadmap item object
 * @returns {string} HTML for spec links or empty string
 */
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
  if (artifacts.tasksPath) {
    links.push(`<a href="../${artifacts.tasksPath}" class="spec-link" target="_blank">Tasks</a>`);
  }
  if (artifacts.implementationPath) {
    links.push(`<a href="../${artifacts.implementationPath}" class="spec-link" target="_blank">Implementation</a>`);
  }

  return links.length > 0
    ? `<div class="spec-links">${links.join('')}</div>`
    : '';
}
```

Then update `createItemCard()` to call this function and include the output.

**Acceptance Criteria:**
- [ ] Links render for items with linkedArtifacts
- [ ] No links section for items without linkedArtifacts
- [ ] Links open in new tab
- [ ] Only existing paths are shown as links

---

### Task 2.7: Add CSS styles for buttons, toast, and spec links

**Description:** Add CSS styles for the new UI elements to styles.css.

**Size:** Medium
**Priority:** High
**Dependencies:** None
**Can run parallel with:** Task 2.1, 2.2

**Technical Requirements:**
- Use existing CSS variables for consistency
- Match the Calm Tech design system
- Responsive and accessible

**Implementation:**

Add to `roadmap/styles.css`:

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

**Acceptance Criteria:**
- [ ] Buttons styled consistently with design system
- [ ] Primary button has highlighted style
- [ ] Toast positioned correctly at bottom center
- [ ] Toast fade animation works
- [ ] Spec links have hover effects
- [ ] Responsive on smaller screens

---

### Task 2.8: Test HTML visualization in browser

**Description:** Manually test all new HTML features work correctly.

**Size:** Small
**Priority:** High
**Dependencies:** Task 2.1-2.7
**Can run parallel with:** None

**Testing Steps:**

1. Start the dev server:
   ```bash
   python3 -m http.server 8765 --directory .
   ```

2. Open `http://localhost:8765/roadmap/roadmap.html`

3. Test cases:
   - [ ] Cards render with "Start Ideation" button
   - [ ] Click button shows toast notification
   - [ ] Check clipboard contains correct `/ideate` command
   - [ ] Cards with linkedArtifacts show spec links
   - [ ] Spec links open correct files in new tab
   - [ ] Toast auto-hides after 2 seconds
   - [ ] Styling matches design system

4. Test with sample data:
   - Add `ideationContext` to a roadmap item
   - Verify the generated command includes context

**Acceptance Criteria:**
- [ ] All interactive elements work
- [ ] No JavaScript console errors
- [ ] Visual appearance matches spec
- [ ] Copy functionality works across browsers

---

## Phase 3: Command Integration

### Task 3.1: Update /ideate command frontmatter

**Description:** Update the /ideate command to accept roadmap parameters.

**Size:** Small
**Priority:** High
**Dependencies:** Phase 1 complete
**Can run parallel with:** None

**Technical Requirements:**
- Add `--roadmap-id` and `--roadmap-item` flag documentation
- Update argument-hint

**Implementation:**

Update `.claude/commands/ideate.md` frontmatter:

```yaml
---
description: Structured ideation with documentation
allowed-tools: Read, Grep, Glob, Bash(git:*), Bash(npm:*), Bash(npx:*), Task(playwright-expert)
argument-hint: "[--roadmap-id <uuid> | --roadmap-item \"<title>\"] <task-brief>"
category: workflow
---
```

**Acceptance Criteria:**
- [ ] Frontmatter updated with new flags
- [ ] Argument hint shows new options
- [ ] Command still works without roadmap flags

---

### Task 3.2: Add roadmap parameter parsing to /ideate

**Description:** Add Step 0 to /ideate command for parsing roadmap integration flags.

**Size:** Medium
**Priority:** High
**Dependencies:** Task 3.1, Task 1.6
**Can run parallel with:** None

**Technical Requirements:**
- Parse `--roadmap-id <uuid>` flag
- Parse `--roadmap-item "<title>"` flag
- Handle multiple matches with user prompt
- Store ROADMAP_ITEM_ID for later use
- Remove flags from task brief

**Implementation:**

Add new Step 0 to `.claude/commands/ideate.md` (before existing Step 1):

```markdown
### Step 0: Parse Roadmap Integration (Optional)

If the command includes `--roadmap-id <uuid>` or `--roadmap-item "<title>"`:

**For `--roadmap-id <uuid>`:**
1. Extract the UUID from the command arguments
2. Store as `ROADMAP_ITEM_ID` for later use
3. Remove `--roadmap-id <uuid>` from the task brief

**For `--roadmap-item "<title>"` (title-based lookup):**
1. Run: `python3 roadmap/scripts/find_by_title.py "<title>"`
2. If exit code 0 (single match): Use the returned ID as `ROADMAP_ITEM_ID`
3. If exit code 2 (multiple matches): Parse JSON output and prompt user to select using AskUserQuestion
4. If exit code 1 (no matches): Warn user and proceed without linking
5. Remove `--roadmap-item "<title>"` from the task brief

Store `ROADMAP_ITEM_ID` for use in Step 1.5 (after slug creation).
```

**Acceptance Criteria:**
- [ ] `--roadmap-id` flag parsed correctly
- [ ] `--roadmap-item` flag triggers title lookup
- [ ] Multiple matches prompt user selection
- [ ] No matches shows warning
- [ ] Flags removed from task brief

---

### Task 3.3: Add roadmap status update to /ideate

**Description:** Add roadmap status update and linking calls after slug creation in /ideate.

**Size:** Medium
**Priority:** High
**Dependencies:** Task 3.2, Task 1.4, Task 1.5
**Can run parallel with:** None

**Technical Requirements:**
- Update status to "in-progress" when roadmap item is linked
- Link spec to roadmap item
- Add roadmapId to ideation file frontmatter

**Implementation:**

Add Step 1.5 to `.claude/commands/ideate.md` (after Step 1 slug creation, before Step 2):

```markdown
### Step 1.5: Roadmap Integration (If ROADMAP_ITEM_ID is set)

If `ROADMAP_ITEM_ID` was captured in Step 0:

1. Update roadmap status to in-progress:
   ```bash
   python3 roadmap/scripts/update_status.py $ROADMAP_ITEM_ID in-progress
   ```

2. Link the spec directory to the roadmap item:
   ```bash
   python3 roadmap/scripts/link_spec.py $ROADMAP_ITEM_ID $SLUG
   ```

3. When creating the ideation file, add to the frontmatter:
   ```markdown
   ---
   roadmapId: {ROADMAP_ITEM_ID}
   slug: {SLUG}
   ---
   ```

This ensures the roadmap item is tracked through the entire spec lifecycle.
```

**Acceptance Criteria:**
- [ ] Status updated to in-progress on ideation start
- [ ] Spec linked to roadmap item
- [ ] roadmapId in ideation file frontmatter
- [ ] Works when no roadmap flag provided (skip this step)

---

### Task 3.4: Update /ideate-to-spec for roadmapId preservation

**Description:** Update /ideate-to-spec command to preserve roadmapId through spec transformation.

**Size:** Small
**Priority:** High
**Dependencies:** Task 3.3
**Can run parallel with:** Task 3.5

**Technical Requirements:**
- Check ideation file for roadmapId in frontmatter
- Copy roadmapId to specification file frontmatter
- Update linkedArtifacts when spec is created

**Implementation:**

Add to `.claude/commands/ideate-to-spec.md`:

```markdown
### Roadmap Context Preservation

When transforming ideation to specification:

1. Check if `specs/{slug}/01-ideation.md` contains `roadmapId` in frontmatter
2. If found, include the same `roadmapId` in `02-specification.md` frontmatter:
   ```markdown
   ---
   roadmapId: {ROADMAP_ITEM_ID}
   slug: {SLUG}
   ---
   ```
3. After creating the spec, update linkedArtifacts:
   ```bash
   python3 roadmap/scripts/link_spec.py $ROADMAP_ID $SLUG
   ```
4. This ensures the roadmap link is preserved through:
   `01-ideation.md` → `02-specification.md` → `03-tasks.md` → `04-implementation.md`
```

**Acceptance Criteria:**
- [ ] roadmapId preserved from ideation to spec
- [ ] linkedArtifacts updated with specPath
- [ ] Works when no roadmapId present (skip linking)

---

### Task 3.5: Update /spec:execute for completion status

**Description:** Add roadmap completion status update to /spec:execute command.

**Size:** Small
**Priority:** High
**Dependencies:** Task 3.3
**Can run parallel with:** Task 3.4

**Technical Requirements:**
- Check spec files for roadmapId in frontmatter
- Update status to "completed" when all tasks done
- Update linkedArtifacts with all file paths

**Implementation:**

Add to `.claude/commands/spec/execute.md` (after final task completion section):

```markdown
### Roadmap Integration (If Applicable)

After all tasks are completed:

1. Check if `specs/{slug}/01-ideation.md` or `specs/{slug}/02-specification.md` contains `roadmapId` in frontmatter
2. If found, extract the roadmapId value
3. Update roadmap status to completed:
   ```bash
   python3 roadmap/scripts/update_status.py $ROADMAP_ID completed
   ```
4. Update all linked artifacts:
   ```bash
   python3 roadmap/scripts/link_spec.py $ROADMAP_ID $SLUG
   ```
5. The link_spec.py will populate linkedArtifacts with all existing spec file paths
```

**Acceptance Criteria:**
- [ ] Status updated to completed on spec execution finish
- [ ] All spec file paths linked
- [ ] Works when no roadmapId present (skip)

---

### Task 3.6: Add /roadmap enrich subcommand

**Description:** Add the `enrich` subcommand to populate ideationContext for existing roadmap items.

**Size:** Large
**Priority:** Medium
**Dependencies:** Task 1.1, 1.2
**Can run parallel with:** None

**Technical Requirements:**
- Accept item ID or title as argument
- Analyze existing title and description
- Suggest inferred values for ideationContext
- Allow user to modify suggestions before saving
- Update roadmap.json with approved context

**Implementation:**

Add to `.claude/commands/roadmap.md`:

```markdown
### enrich <item-id-or-title>

Enrich an existing roadmap item with ideationContext.

**Usage:** `/roadmap enrich <item-id>` or `/roadmap enrich "<item-title>"`

**Workflow:**

1. **Identify the item:**
   - If argument looks like UUID, use directly
   - Otherwise, run `python3 roadmap/scripts/find_by_title.py "<title>"`
   - Handle multiple matches with user selection

2. **Load current item data:**
   ```bash
   python3 -c "import json; data=json.load(open('roadmap/roadmap.json')); item=[i for i in data['items'] if i['id']=='$ITEM_ID'][0]; print(json.dumps(item, indent=2))"
   ```

3. **Analyze and suggest context:**
   Based on the item's title and description, suggest:
   - **targetUsers**: Who would benefit from this feature
   - **painPoints**: What problems does this solve
   - **successCriteria**: How do we measure success
   - **constraints**: Any limitations or out-of-scope items

4. **Present suggestions to user:**
   Use AskUserQuestion to confirm or modify each field

5. **Save updates:**
   Create a Python script call to update the item:
   ```bash
   python3 -c "
   import json
   from datetime import datetime, timezone

   with open('roadmap/roadmap.json', 'r') as f:
       data = json.load(f)

   for item in data['items']:
       if item['id'] == '$ITEM_ID':
           item['ideationContext'] = {
               'targetUsers': $TARGET_USERS,
               'painPoints': $PAIN_POINTS,
               'successCriteria': $SUCCESS_CRITERIA,
               'constraints': $CONSTRAINTS
           }
           item['updatedAt'] = datetime.now(timezone.utc).isoformat()
           break

   data['lastUpdated'] = datetime.now(timezone.utc).isoformat()

   with open('roadmap/roadmap.json', 'w') as f:
       json.dump(data, f, indent=2)
   "
   ```

6. **Validate:**
   ```bash
   python3 roadmap/scripts/validate.py
   ```

**Example:**
```
/roadmap enrich "Transaction sync"

Found: "Transaction sync and storage"
Description: "Fetch transactions from Plaid and store them locally..."

Based on this, I suggest:
- Target users: ["users tracking personal spending", "first-time users setting up accounts"]
- Pain points: ["manual tracking is tedious", "no visibility into transaction history"]
- Success criteria: ["transactions auto-import", "no duplicate entries", "< 5s sync time"]
- Constraints: ["read-only (no payment initiation)", "US banks only initially"]

Would you like to modify any of these before saving?
```
```

**Acceptance Criteria:**
- [ ] Works with item ID input
- [ ] Works with title input (with fuzzy matching)
- [ ] Suggests reasonable context based on item
- [ ] User can modify suggestions before saving
- [ ] Validation passes after update
- [ ] Handles item not found gracefully

---

### Task 3.7: Update SKILL.md with integration guidance

**Description:** Update the roadmap-moscow skill documentation with integration guidance.

**Size:** Small
**Priority:** Medium
**Dependencies:** Task 3.1-3.6
**Can run parallel with:** Task 3.8

**Technical Requirements:**
- Document automatic activation triggers
- Document status update behavior
- Document utility commands

**Implementation:**

Add to `.claude/skills/roadmap-moscow/SKILL.md`:

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
python3 roadmap/scripts/update_status.py <item-id> <status>

# Link spec to item
python3 roadmap/scripts/link_spec.py <item-id> <spec-slug>

# Generate slug from title
python3 roadmap/scripts/slugify.py <title-or-item-id>

# Find item by title
python3 roadmap/scripts/find_by_title.py "<title-query>"
```

### Best Practices

1. Always use `--roadmap-id` when ideating from a roadmap item
2. Check linkedArtifacts before starting work (avoid duplicate specs)
3. Run validation after any roadmap updates
4. Keep ideationContext fields populated for better ideation prompts
```

**Acceptance Criteria:**
- [ ] Activation triggers documented
- [ ] Status update behavior documented
- [ ] All utility commands documented
- [ ] Best practices included

---

### Task 3.8: Update roadmap/README.md with new features

**Description:** Document the new integration features in the roadmap README.

**Size:** Small
**Priority:** Medium
**Dependencies:** Phase 2 complete
**Can run parallel with:** Task 3.7

**Technical Requirements:**
- Document new schema fields
- Document HTML visualization features
- Include usage examples

**Implementation:**

Add section to `roadmap/README.md`:

```markdown
## Claude Code Integration

The roadmap integrates with Claude Code's spec workflow for seamless transitions from planning to implementation.

### New Schema Fields

#### linkedArtifacts
Tracks associated spec files for a roadmap item:
- `specSlug`: Slug used for spec directory
- `ideationPath`: Path to ideation file
- `specPath`: Path to specification file
- `tasksPath`: Path to tasks breakdown file
- `implementationPath`: Path to implementation summary file

#### ideationContext
Stores rich context for generating ideation prompts:
- `targetUsers`: Array of user types who benefit
- `painPoints`: Array of problems this solves
- `successCriteria`: Array of success measurements
- `constraints`: Array of limitations

### HTML Visualization Features

- **Start Ideation button**: Click to copy `/ideate --roadmap-id ...` command
- **Spec links**: Clickable links to associated spec files
- **Toast notifications**: Confirmation when command is copied

### Usage

1. Open the roadmap visualization
2. Find the item you want to work on
3. Click "Start Ideation" to copy the command
4. Paste in Claude Code terminal
5. Status automatically updates to "in-progress"
6. Complete the spec workflow
7. Status updates to "completed" when done

### Commands

- `/roadmap enrich <item>`: Add ideationContext to an item
- `/ideate --roadmap-id <uuid> <brief>`: Start ideation with roadmap linking
- `/ideate --roadmap-item "<title>" <brief>`: Start ideation by title match
```

**Acceptance Criteria:**
- [ ] New fields documented
- [ ] Features explained
- [ ] Usage workflow clear
- [ ] Examples provided

---

## Phase 4: Documentation & Testing

### Task 4.1: Update CLAUDE.md with integration workflow

**Description:** Add roadmap integration section to the main project documentation.

**Size:** Small
**Priority:** Medium
**Dependencies:** Phase 3 complete
**Can run parallel with:** Task 4.2, 4.3

**Technical Requirements:**
- Add workflow overview
- Link to detailed docs
- Keep concise

**Implementation:**

Add to `CLAUDE.md` in appropriate section:

```markdown
## Roadmap Integration

The roadmap system integrates with the spec workflow for seamless planning-to-implementation transitions.

### Quick Start

1. Open roadmap: `http://localhost:8765/roadmap/roadmap.html`
2. Click "Start Ideation" on a roadmap item
3. Paste the copied command in Claude Code
4. Complete the spec workflow normally
5. Status updates automatically

### Commands

| Command | Purpose |
|---------|---------|
| `/roadmap enrich <item>` | Add context to a roadmap item |
| `/ideate --roadmap-id <uuid>` | Start ideation with roadmap linking |
| `/ideate --roadmap-item "<title>"` | Start ideation by title match |

See `roadmap/README.md` for detailed documentation.
```

**Acceptance Criteria:**
- [ ] Workflow overview added
- [ ] Commands listed
- [ ] Links to detailed docs

---

### Task 4.2: Write Python utility unit tests

**Description:** Create unit tests for the Python utility scripts.

**Size:** Medium
**Priority:** Medium
**Dependencies:** Phase 1 complete
**Can run parallel with:** Task 4.1, 4.3

**Technical Requirements:**
- Test each utility function
- Cover edge cases
- Use project test framework if available

**Test Cases:**

Create `roadmap/scripts/test_utilities.py`:

```python
#!/usr/bin/env python3
"""Unit tests for roadmap utility scripts."""

import unittest
import json
import os
import tempfile
from slugify import slugify, get_slug_for_item
from find_by_title import find_by_title

class TestSlugify(unittest.TestCase):
    def test_basic_slug(self):
        self.assertEqual(slugify("Test Title"), "test-title")

    def test_special_chars(self):
        self.assertEqual(slugify("User's Dashboard (v2)"), "users-dashboard-v2")

    def test_multiple_spaces(self):
        self.assertEqual(slugify("Too   many   spaces"), "too-many-spaces")

    def test_underscores(self):
        self.assertEqual(slugify("snake_case_title"), "snake-case-title")

    def test_leading_trailing(self):
        self.assertEqual(slugify("  trimmed  "), "trimmed")

class TestFindByTitle(unittest.TestCase):
    def test_single_match(self):
        # Mock roadmap data
        pass  # Would need to mock load_roadmap()

    def test_multiple_matches(self):
        pass

    def test_no_match(self):
        pass

    def test_case_insensitive(self):
        pass

if __name__ == '__main__':
    unittest.main()
```

**Acceptance Criteria:**
- [ ] Tests for slugify function
- [ ] Tests for find_by_title function
- [ ] Tests for update_status validation
- [ ] Tests for link_spec file detection
- [ ] All tests pass

---

### Task 4.3: Manual end-to-end testing

**Description:** Perform manual testing of the complete workflow.

**Size:** Medium
**Priority:** High
**Dependencies:** Phase 2, Phase 3 complete
**Can run parallel with:** Task 4.1, 4.2

**Test Workflow:**

1. **Setup:**
   - Ensure roadmap has at least one item
   - Add ideationContext to the item using `/roadmap enrich`

2. **Test roadmap visualization:**
   - Start HTTP server: `python3 -m http.server 8765`
   - Open `http://localhost:8765/roadmap/roadmap.html`
   - Verify "Start Ideation" button appears
   - Click button, verify toast appears
   - Check clipboard contents

3. **Test ideation flow:**
   - Paste command in Claude Code
   - Verify status changes to "in-progress" in roadmap.json
   - Verify linkedArtifacts created
   - Verify roadmapId in ideation file

4. **Test spec flow:**
   - Run `/ideate-to-spec` on the ideation file
   - Verify roadmapId preserved in spec
   - Verify linkedArtifacts updated

5. **Test completion:**
   - Run `/spec:execute` (or simulate completion)
   - Verify status changes to "completed"
   - Verify all paths in linkedArtifacts

6. **Verify HTML updates:**
   - Refresh roadmap visualization
   - Verify spec links appear
   - Click links, verify they open correct files

**Acceptance Criteria:**
- [ ] Clipboard copy works
- [ ] Status transitions correctly
- [ ] Links populated at each stage
- [ ] Spec links work in HTML
- [ ] No errors in console or terminal

---

### Task 4.4: Update /ideate command documentation

**Description:** Add documentation for the new roadmap flags to the /ideate command.

**Size:** Small
**Priority:** Medium
**Dependencies:** Task 3.1-3.3
**Can run parallel with:** Task 4.5

**Implementation:**

Add usage examples to `.claude/commands/ideate.md`:

```markdown
## Roadmap Integration

### Starting ideation from a roadmap item

**By UUID (from "Start Ideation" button):**
```
/ideate --roadmap-id 550e8400-e29b-41d4-a716-446655440000 Build a transaction sync feature
```

**By title (manual entry):**
```
/ideate --roadmap-item "Transaction sync" Build a transaction sync feature
```

When a roadmap flag is provided:
1. The roadmap item's status is set to "in-progress"
2. The spec directory is linked to the roadmap item
3. The ideation file includes a `roadmapId` frontmatter field
4. Completion of `/spec:execute` will mark the item as "completed"

### Without roadmap integration

Standard usage without roadmap linking:
```
/ideate Build a new feature
```
```

**Acceptance Criteria:**
- [ ] Usage examples clear
- [ ] Both flag types documented
- [ ] Behavior explained
- [ ] Examples work when run

---

### Task 4.5: Fix any issues discovered during testing

**Description:** Address any bugs or issues found during testing phases.

**Size:** Variable
**Priority:** High
**Dependencies:** Task 4.3
**Can run parallel with:** None

**Process:**

1. Review all test results
2. Document any issues found
3. Prioritize by severity
4. Fix each issue
5. Re-test affected functionality
6. Update documentation if behavior changes

**Common Issues to Watch For:**
- Path resolution issues between directories
- JSON parsing errors with special characters
- Clipboard API failures in different browsers
- Status transition edge cases
- Missing error handling

**Acceptance Criteria:**
- [ ] All critical issues resolved
- [ ] All tests pass after fixes
- [ ] Documentation updated if needed

---

### Task 4.6: Create implementation summary

**Description:** Create the 04-implementation.md file summarizing the completed work.

**Size:** Small
**Priority:** Medium
**Dependencies:** All other tasks complete
**Can run parallel with:** None

**Implementation:**

Create `specs/roadmap-claude-code-integration/04-implementation.md`:

```markdown
# Implementation Summary: Roadmap-Claude Code Integration

**Status:** Complete
**Date Completed:** [DATE]
**Implementer:** Claude Code

## Overview

Successfully implemented roadmap-Claude Code integration enabling:
- One-click ideation command copying from HTML visualization
- Bidirectional linking between roadmap items and spec files
- Automatic status updates through the spec lifecycle

## Components Implemented

### Phase 1: Schema & Data Model
- Extended `roadmap/schema.json` with `linkedArtifacts` and `ideationContext`
- Created utility scripts: `slugify.py`, `update_status.py`, `link_spec.py`, `find_by_title.py`
- Updated `utils.py` with `get_project_root()`

### Phase 2: HTML Visualization
- Added toast notification system
- Implemented "Start Ideation" button on cards
- Added spec links rendering
- Updated CSS for new components

### Phase 3: Command Integration
- Updated `/ideate` with `--roadmap-id` and `--roadmap-item` flags
- Updated `/ideate-to-spec` for roadmapId preservation
- Updated `/spec:execute` for completion status
- Added `/roadmap enrich` subcommand

### Phase 4: Documentation
- Updated CLAUDE.md, README.md, SKILL.md
- Created unit tests
- Completed manual testing

## Files Modified

- `roadmap/schema.json`
- `roadmap/roadmap.html`
- `roadmap/styles.css`
- `roadmap/scripts.js`
- `roadmap/scripts/slugify.py` (new)
- `roadmap/scripts/update_status.py` (new)
- `roadmap/scripts/link_spec.py` (new)
- `roadmap/scripts/find_by_title.py` (new)
- `roadmap/scripts/utils.py`
- `.claude/commands/ideate.md`
- `.claude/commands/ideate-to-spec.md`
- `.claude/commands/spec/execute.md`
- `.claude/commands/roadmap.md`
- `.claude/skills/roadmap-moscow/SKILL.md`
- `roadmap/README.md`
- `CLAUDE.md`

## Testing Results

- Unit tests: PASS
- Integration tests: PASS
- Manual testing: PASS

## Known Limitations

- Requires HTTP server for spec links (file:// not supported)
- Single-project support only
- No real-time updates (manual refresh required)
```

**Acceptance Criteria:**
- [ ] Summary accurately reflects work done
- [ ] All files listed
- [ ] Status marked complete
- [ ] Known limitations documented

---

## Summary

### Total Tasks: 32

### By Phase:
- **Phase 1 (Schema & Data Model):** 8 tasks
- **Phase 2 (HTML Visualization):** 8 tasks
- **Phase 3 (Command Integration):** 8 tasks
- **Phase 4 (Documentation & Testing):** 8 tasks

### Parallel Execution Opportunities:

**Phase 1:**
- Tasks 1.1-1.7 can all run in parallel (no dependencies)
- Task 1.8 depends on 1.1 and 1.2

**Phase 2:**
- Tasks 2.1, 2.2, 2.7 can run in parallel
- Tasks 2.3, 2.4, 2.5, 2.6 have some dependencies
- Task 2.8 depends on all Phase 2 tasks

**Phase 3:**
- Tasks must be mostly sequential (command dependencies)
- Tasks 3.4 and 3.5 can run in parallel
- Tasks 3.7 and 3.8 can run in parallel

**Phase 4:**
- Tasks 4.1, 4.2, 4.3 can run in parallel
- Task 4.5 depends on 4.3
- Task 4.6 depends on all other tasks

### Critical Path:
1. Complete Phase 1 schema tasks (1.1, 1.2)
2. Complete Phase 1 utility scripts (1.3-1.7)
3. Complete Phase 2 HTML updates
4. Complete Phase 3 command integration
5. Complete Phase 4 testing and documentation

### Recommended Execution Order:
1. Start all Phase 1 tasks in parallel
2. Once schema done, start Phase 2 in parallel with remaining Phase 1
3. Once Phase 1 complete and Phase 2 HTML/JS done, start Phase 3
4. Complete Phase 4 as final validation
