# UI/UX Review - Dunny Personal Finance Manager

**Date:** December 14, 2025
**Reviewer:** Claude
**App Version:** Current development build

---

## Executive Summary

This document captures UI/UX issues, bugs, and improvement recommendations discovered during a comprehensive review of the Dunny personal finance application. The review covered all three main pages (Dashboard, Transactions, Accounts), dark mode, mobile responsiveness, and console warnings.

**Key Findings:**
- 1 Critical bug (Cash Available calculation)
- 2 High-priority issues (mobile responsiveness, accessibility)
- 8 Medium-priority UX improvements
- 5 Low-priority polish items

---

## Critical Bugs

### BUG-001: Astronomical Cash Available Display
- **Location:** Dashboard > Account Balances card
- **Severity:** Critical
- **Description:** The "Cash Available" field shows `$10,001,106,009,210.00` (over $10 trillion), which is clearly incorrect. The individual account balances sum to approximately $7,329.
- **Root Cause:** Likely a data issue - either duplicate accounts being summed, balances stored incorrectly in the database, or a numeric overflow issue.
- **Expected:** Should show the sum of depository account balances (~$7,329)
- **Screenshot:** `review/01-dashboard.png`

### BUG-002: Mobile Layout Overlap
- **Location:** Dashboard > Account Balances card (mobile viewport)
- **Severity:** High
- **Description:** On mobile (375px width), the "Cash Available" and "Credit Used" values overlap and become unreadable. The grid layout doesn't properly stack on narrow screens.
- **Screenshot:** `review/14-mobile-dark.png`

---

## High Priority Issues

### ISSUE-001: Chart Dimension Warnings on Mobile
- **Location:** Dashboard (mobile viewport)
- **Severity:** High
- **Description:** Console shows repeated warnings: "The width(0) and height(0) of chart should be greater than 0". Charts fail to render properly when viewport is resized to mobile dimensions.
- **Console Output:**
  ```
  [WARNING] The width(0) and height(0) of chart should be greater than 0,
         please check the style of container...
  ```
- **Recommendation:** Add minimum dimensions or conditional rendering for charts on mobile.

### ISSUE-002: Missing Dialog Accessibility
- **Location:** Transaction Filters dialog
- **Severity:** High
- **Description:** Console warning about missing `Description` or `aria-describedby` for DialogContent, which affects screen reader accessibility.
- **Console Output:**
  ```
  [WARNING] Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}
  ```
- **Recommendation:** Add proper aria attributes to all dialog components.

---

## Medium Priority Issues

### Dashboard Page

#### ISSUE-003: Grammar Error - "1 txns"
- **Location:** Top Merchants card, Spending Breakdown card
- **Description:** Text shows "1 txns" instead of "1 txn" (singular)
- **Recommendation:** Use proper pluralization logic: `${count} txn${count === 1 ? '' : 's'}`

#### ISSUE-004: Redundant Month Display
- **Location:** Spending Breakdown card
- **Description:** "December 2025" appears twice - once as a subtitle under the card title and again in the month navigator on the right
- **Screenshot:** `review/02-dashboard-scrolled.png`
- **Recommendation:** Remove the subtitle instance, keep only the interactive navigator

#### ISSUE-005: Inconsistent Month Navigation Placement
- **Location:** Multiple cards (Monthly Summary, Spending Breakdown, Month Comparison)
- **Description:** Month navigation arrows appear in different positions across cards - some centered at top, some right-aligned
- **Recommendation:** Standardize navigation placement - suggest right-aligned for all cards

#### ISSUE-006: "Unknown Merchant" Styling
- **Location:** Top Merchants card
- **Description:** Shows "Unknown Merchant" with $1,000.00 (90.4%) but without rank number (#4) or interactive chevron like other merchants
- **Screenshot:** `review/04-dashboard-bottom.png`
- **Recommendation:** Either exclude unknown merchants from ranking or style consistently with numbered ranks and interaction affordances

#### ISSUE-007: Currency Formatting Inconsistency
- **Location:** Recurring Charges card
- **Description:** Amount shows "$89.4" instead of "$89.40" - missing trailing zero
- **Recommendation:** Ensure all currency displays use consistent 2 decimal places via formatCurrency utility

### Transactions Page

#### ISSUE-008: Inconsistent Amount Sign Display
- **Location:** Transactions list vs Transaction detail modal
- **Description:** In the list, expenses show without sign ($12.00) while income shows with plus (+$500.00). In the detail modal, expenses show with minus (-$12.00). This inconsistency can confuse users.
- **Screenshot:** `review/06-transactions.png`, `review/08-transaction-detail.png`
- **Recommendation:** Standardize: either always show signs for both, or use color alone to differentiate

#### ISSUE-009: Missing Transaction List Headers
- **Location:** Transactions page
- **Description:** The transaction list has no column headers explaining what Date | Merchant | Category | Account | Amount represent
- **Recommendation:** Add a header row or at minimum add subtle labels on first load

### Accounts Page

#### ISSUE-010: Inconsistent Account Type Capitalization
- **Location:** Accounts page - account cards
- **Description:** "depository" is lowercase but "Loan" is title case
- **Screenshot:** `review/09-accounts.png`
- **Recommendation:** Standardize to title case for all account types: "Depository", "Loan", "Credit"

---

## Low Priority Issues

### ISSUE-011: ResponsiveContainer Console Warning
- **Location:** Dashboard charts
- **Description:** Recharts warning about using ResponsiveContainer with fixed width/height values
- **Console Output:**
  ```
  [WARNING] The width(533) and height(300) are both fixed numbers,
         maybe you don't need to use a ResponsiveContainer.
  ```
- **Recommendation:** Either remove ResponsiveContainer or use percentage-based dimensions

### ISSUE-012: "Confirmed" Status Label
- **Location:** Transaction Filters > Status
- **Description:** The status option "Confirmed" might be clearer as "Posted" or "Completed" to match banking terminology
- **Recommendation:** Consider renaming to "Posted" for clarity

### ISSUE-013: Quick Actions Section Placement
- **Location:** Dashboard bottom
- **Description:** "Quick Actions" section with Connect Bank and Sync buttons is at the very bottom of the dashboard, requiring scroll to access
- **Recommendation:** Consider moving to top right of dashboard or making it sticky/floating

### ISSUE-014: Trend Lines Redundancy
- **Location:** Month Comparison card > By Category table
- **Description:** The "Trend" column shows sparkline-style lines, but the "Change" column already shows the same information textually
- **Recommendation:** Either remove trend lines or make them show multi-month trends to add value

### ISSUE-015: Transaction Merchant Name Truncation
- **Location:** Transactions page (desktop)
- **Description:** Account names like "Plaid Checking ..." are truncated with ellipsis, losing useful information
- **Recommendation:** Show full account names or use tooltip on hover to reveal full name

---

## What's Working Well

### Positive Observations

1. **Dark Mode Implementation** - Excellent dark mode support with proper color tokens, readable text, and maintained visual hierarchy
2. **Transaction Detail Modal** - Clean, well-designed with merchant logo, clear information hierarchy, and useful "See all from [merchant]" action
3. **Account Options Menu** - Good use of destructive styling (red) for "Disconnect" option
4. **Month Comparison Alert** - Helpful contextual warning about partial month comparison
5. **Donut Chart** - Visually appealing with clear center label and good color differentiation
6. **Sidebar Navigation** - Clean, minimal, with appropriate icons and clear active state
7. **Mobile Transaction List** - Adapts well, hiding less critical columns while maintaining usability

---

## Screenshots Reference

| File | Description |
|------|-------------|
| `review/01-dashboard.png` | Dashboard with critical cash balance bug |
| `review/02-dashboard-scrolled.png` | Monthly summary and spending breakdown |
| `review/03-dashboard-more.png` | Spending breakdown donut chart |
| `review/04-dashboard-bottom.png` | Top merchants and recurring charges |
| `review/05-month-comparison.png` | Month comparison card |
| `review/06-transactions.png` | Transactions list page |
| `review/07-transactions-filters.png` | Filters slide-out panel |
| `review/08-transaction-detail.png` | Transaction detail modal |
| `review/09-accounts.png` | Accounts page listing |
| `review/10-account-menu.png` | Account options dropdown |
| `review/11-dark-mode.png` | Accounts page in dark mode |
| `review/12-dashboard-dark.png` | Dashboard in dark mode |
| `review/13-dashboard-dark-charts.png` | Charts in dark mode |
| `review/14-mobile-dark.png` | Mobile layout bug (overlap) |
| `review/15-mobile-scrolled.png` | Mobile spending breakdown |
| `review/16-mobile-merchants.png` | Mobile merchants list |
| `review/17-mobile-transactions.png` | Mobile transactions page |

---

## Recommendations Summary

| Priority | Count | Key Items |
|----------|-------|-----------|
| Critical | 1 | Cash Available calculation bug |
| High | 2 | Mobile responsiveness, Accessibility warnings |
| Medium | 8 | Grammar, redundancy, consistency issues |
| Low | 5 | Polish and minor UX improvements |

### Suggested Fix Order

1. **Immediate:** Fix BUG-001 (Cash Available calculation) - this is user-facing and shows incorrect financial data
2. **This Sprint:** Fix BUG-002 and ISSUE-001 (mobile responsiveness issues)
3. **This Sprint:** Fix ISSUE-002 (accessibility - important for compliance)
4. **Next Sprint:** Address medium-priority consistency issues (ISSUE-003 through ISSUE-010)
5. **Backlog:** Low-priority polish items

---

## Technical Notes

### Console Warnings Observed
1. ResponsiveContainer fixed dimensions warning (Recharts)
2. Dialog accessibility warning (Radix UI)
3. Chart zero dimensions on mobile resize
4. `scroll-behavior: smooth` detection warning

### Code Locations for Key Fixes
- Cash Available: `src/layers/features/account-balances/ui/TotalBalanceHeader.tsx`
- Currency formatting: `src/layers/features/account-balances/model/utils.ts`
- Charts: Look for Recharts ResponsiveContainer usage
- Dialogs: Check Shadcn Dialog components for missing aria attributes

---

*Review completed December 14, 2025*
