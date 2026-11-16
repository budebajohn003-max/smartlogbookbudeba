# User Flows

Flows distinguish current repository behavior from the target journey. Backend permissions and workflows are not verified until the Supabase schema/RLS/RPC are inspected.

## Student journey

**Starting point:** Login page (`index.html`) or registration page (`register.html`).

| Step | User action | System response / next screen | Possible error | Current state |
|---|---|---|---|---|
| 1 | Open the site | Login form is displayed; it does not currently explain the product | Missing configuration or network failure is not clearly surfaced | Present |
| 2 | Choose register or sign in | Registration form or login form | Invalid input/Auth error may appear in an alert | Present, basic |
| 3 | Register and confirm account if requested | Supabase Auth sign-up; message instructs user to check email | Auth/profile persistence behavior depends on project configuration | Partial |
| 4 | Sign in | Client loads profile and redirects based on role | Missing profile may fall back to a student-shaped object; this must be corrected before relying on role | Partial/risk |
| 5 | View dashboard | Student page requests own logbooks and displays counts | Data errors are only logged in the dashboard script | Partial |
| 6 | Create an entry | Form accepts date, location, activities, optional problem/solution/photo | Upload or database errors can interrupt submission | Present, no draft |
| 7 | Submit entry | Service uploads the optional photo and inserts the entry | No explicit submission confirmation if the operation returns a database error in all cases | Partial |
| 8 | Track status | Student can view entry/status pages and request reports | RLS isolation has not been verified | Partial |
| 9 | Read feedback and correct a rejection | Target is to show actionable feedback and allow a controlled resubmission | Editing/resubmission is not implemented in inspected code | Planned |
| 10 | View approved records/report | Report page aggregates rows selected by date range | Report is client-aggregated and unbounded; generated-file download is not established | Partial |

**Successful completion target:** Student can create an entry, see its actual state, understand feedback, correct a rejected entry when allowed, and verify an approved result without accessing another student's records.

## Supervisor journey

**Starting point:** Supervisor sign-in and dashboard.

| Step | User action | System response / next screen | Possible error | Current state |
|---|---|---|---|---|
| 1 | Sign in | Role-based redirect to supervisor dashboard | Incorrect/missing profile handling must deny access | Partial |
| 2 | View dashboard | Requests pending entries and overall stats | Query scope depends on RLS; dashboard errors are console-only | Partial |
| 3 | Open pending/all logbooks | Table shows returned entries; review link opens the selected entry | Staff assignment scope is not visible in client query; backend must enforce it | Partial |
| 4 | Inspect entry and evidence | Review page displays fields and optional photo | Provider URL and database policy assumptions need verification | Partial |
| 5 | Approve or reject | Client calls `review_logbook` RPC | RPC implementation, assignment check, and state transition are unavailable | Partial |
| 6 | Provide rejection feedback | Target requires a clear, non-empty reason | Current UI makes the comment optional for rejection | Planned |
| 7 | Confirm outcome and follow up | Target gives supervisor a saved result and student next step | Browser alert is used; review history/notifications are not established | Partial |

**Successful completion target:** Supervisor can review only authorized students, record an auditable decision, and give actionable feedback on rejection.

## Administrator journey

**Starting point:** Administrator sign-in and role-gated admin dashboard.

| Step | User action | System response / next screen | Possible error | Current state |
|---|---|---|---|---|
| 1 | Sign in | Role-based redirect to admin page | Profile/role verification must be authoritative | Partial |
| 2 | View system statistics | Target loads live authorized counts | Existing dashboard displays fixed example values | Not operational |
| 3 | Open user management | Target shows live searchable/paginated users | Current page displays sample users/counts | Not operational |
| 4 | Create, edit, disable, or manage an account | Target confirms permitted operation and records audit event | Current controls are not connected to a backend | Not implemented |
| 5 | Review activity/settings/reports | Target displays only implemented, data-backed functions | Several dashboard navigation controls are visual only | Not operational |

**Successful completion target:** Administrator can perform only explicitly permitted management actions and see data-backed statistics; each consequential change is auditable.

## Cross-cutting recovery behavior

- **Where am I?** Each page should identify its title and provide role-appropriate navigation and a return path.
- **Did it work?** Every database or upload action should show success only after the backend confirms it.
- **What next?** A rejected entry should show feedback and the permitted correction/resubmission action.
- **Network/backend error:** Preserve form data when safe, show a non-technical recovery message, and do not change displayed status optimistically.
- **Access denied:** Explain that the requested item is unavailable without revealing whether another user's private record exists.
- **No records:** Show an empty state with a valid next action, not sample/demo records.

## Decisions requiring product/backend confirmation

1. How supervisors are assigned to students and whether administrators may review all entries.
2. Whether drafts are stored in the database, and which states allow editing.
3. Whether a student may resubmit indefinitely or under a defined review policy.
4. Which profile/account states exist (active, suspended, confirmation pending).
5. Whether notifications are in-app, email, or both, and what events trigger them.
6. Which reports users may export and what data-retention rules apply.
