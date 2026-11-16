# System Algorithms

These are target algorithms for predictable behavior. The browser code currently implements only portions of them. Every authorization and status decision must be repeated and enforced by trusted Supabase database/RPC policy; frontend checks are for user experience only.

## A-01 — Registration

- **Purpose:** Create a new student identity and associated profile without allowing self-assigned privileged roles.
- **Input:** Full name, registration number, email, password.
- **Processing:** Validate required fields and format; normalize email; create Auth identity; create/verify the student profile through a trusted trigger or constrained operation; handle email confirmation.
- **Decision conditions:** Reject invalid input, duplicate identity/registration number, or any request attempting to set a privileged role.
- **Output:** Confirmation state, or an actionable error.
- **Error handling:** Do not imply profile creation if Auth succeeds but profile persistence fails; log safe diagnostic details without exposing credentials.
- **Pseudocode:**

```text
validate(name, registrationNumber, email, password)
if invalid: return field errors
create Auth user with normalized email and non-privileged metadata
if Auth fails: return safe error
trusted backend creates profile with role = student
if profile creation fails: report recoverable account setup issue
return confirmation-required or registration-complete state
```

## A-02 — Login and logout

- **Purpose:** Establish and terminate an authenticated session and load the authoritative role.
- **Input:** Email/password for login; active session for logout.
- **Processing:** Authenticate through Supabase Auth; fetch the profile; verify the profile is active and role is recognized; sign out on profile/role verification failure.
- **Decision conditions:** Authentication failure, missing/disabled profile, or unknown role denies protected access.
- **Output:** Verified profile and role, or signed-out state.
- **Error handling:** Show a generic recovery message; preserve no unverified fallback role.
- **Pseudocode:**

```text
authenticate(credentials)
if authentication fails: return sign-in error
profile = fetch authoritative profile for authenticated subject
if profile missing, inactive, or role unknown:
    sign out
    return account-not-authorized
return verified profile

logout():
    revoke/clear Auth session
    navigate to sign-in
```

## A-03 — Role-based access

- **Purpose:** Restrict each record operation to a permitted actor and resource.
- **Input:** Authenticated subject, operation, resource.
- **Processing:** Enforce row-level ownership/assignment and action policy in RLS or a secure RPC; check valid state transition.
- **Decision conditions:** Student owns the entry; supervisor is assigned/authorized; administrator action is within explicit policy.
- **Output:** Authorized data/result or denial.
- **Error handling:** Deny by default; return no private row details on denial.
- **Pseudocode:**

```text
require authenticated subject
load authoritative actor role
if operation is student-owned:
    allow only when row.owner_id == subject.id
else if operation is supervisor review:
    allow only when role permits review
      and assignment(subject.id, row.owner_id) is active
      and row.status is reviewable
else if operation is administrative:
    allow only when explicit admin policy permits operation
otherwise deny
```

The actual profile, assignment, and RLS schema must be inspected before translating this pseudocode into SQL.

## A-04 — Student dashboard loading

- **Purpose:** Show counts and recent activity for the signed-in student.
- **Input:** Verified student identity.
- **Processing:** Query only that student's permitted records, preferably with server-side aggregates and bounded recent entries; handle load state.
- **Decision conditions:** Missing session redirects to sign-in; wrong role redirects to the correct page; query error displays recoverable state.
- **Output:** Counts and recent items from authorized rows.
- **Error handling:** Never substitute fabricated figures for failed queries.
- **Pseudocode:**

```text
student = requireVerifiedStudent()
show loading state
result = fetch own aggregate + bounded recent entries
if failed: show retryable error; stop
render database-derived values safely
if empty: show first-entry action
```

## A-05 — Create and save a daily entry

- **Purpose:** Create a student-owned entry with validated activity data.
- **Input:** Date, activity text, optional location/problem/solution/photo.
- **Processing:** Validate client fields for usability; validate again in trusted backend; upload a permitted image; insert the entry with owner from the authenticated session, never from a caller-supplied user ID.
- **Decision conditions:** Valid date/required text, permitted status transition, upload constraints, and authorized student role.
- **Output:** Persisted entry and its actual state.
- **Error handling:** If upload or insert fails, report failure and clean up an orphaned uploaded asset when possible; do not claim a save.
- **Pseudocode:**

```text
validate input
require authenticated student
if image exists:
    validate provider-side file policy
    upload image
insert entry with owner = authenticated subject and initial allowed status
if insert fails:
    clean up uploaded asset if supported
    return error
return saved entry
```

## A-06 — Submit an entry for review

- **Purpose:** Transition an eligible draft to pending review without silently changing review state.
- **Input:** Entry identifier and authenticated student.
- **Processing:** Backend locks/checks entry, verifies ownership and draft state, validates required content, records a transition, and commits atomically.
- **Decision conditions:** Entry belongs to actor and is in a submittable status.
- **Output:** Pending status and submission timestamp.
- **Error handling:** Concurrent or invalid transition is rejected; existing status is unchanged.
- **Pseudocode:**

```text
begin transaction
entry = lock entry by id
require entry.owner == actor.id
require entry.status == draft
validate required fields
set status = pending and submitted_at = now
record audit event
commit
```

## A-07 — Edit and resubmit

- **Purpose:** Let a student correct an eligible rejected entry and submit it again.
- **Input:** Entry ID and corrected fields.
- **Processing:** Backend verifies ownership and rejected state, allows only defined editable fields, preserves prior review history, then creates a new submission transition.
- **Decision conditions:** Rejected entry, required feedback displayed, valid corrected content.
- **Output:** Resubmitted pending entry with prior review history retained.
- **Error handling:** Approved or unrelated entries cannot be edited; concurrent state changes require refresh.
- **Pseudocode:**

```text
require owner == actor.id
require status == rejected
validate correction
update allowed content
append resubmission event; retain previous review
set status = pending
return new state
```

## A-08 — Supervisor review, approval, and rejection

- **Purpose:** Record an authorized, auditable review.
- **Input:** Entry ID, approve/reject decision, feedback.
- **Processing:** Secure RPC verifies actor, assignment, entry state, and transition; rejection requires non-empty feedback; update and audit insert occur atomically.
- **Decision conditions:** Actor is authorized; entry is pending; decision is allowed; feedback is present for rejection.
- **Output:** New status, reviewer identity, timestamp, and feedback.
- **Error handling:** Deny stale/duplicate/unauthorized decisions without changing the entry.
- **Pseudocode:**

```text
begin transaction
entry = lock entry by id
require actor can review entry
require entry.status == pending
if decision == reject and feedback is empty: reject request
set status, feedback, reviewer_id, reviewed_at
append immutable review/audit event
commit
```

## A-09 — Activity photo upload

- **Purpose:** Store supporting evidence under provider-enforced constraints.
- **Input:** Image file and authenticated entry context.
- **Processing:** Check size/type in UI; upload using an appropriately restricted provider configuration; associate the returned asset with an authorized entry.
- **Decision conditions:** Allowed format/size, upload authorization, and successful provider response.
- **Output:** Safe URL/asset identifier, or actionable failure.
- **Error handling:** Do not trust browser MIME metadata alone; reject unexpected provider response and avoid persisting a partial attachment.
- **Pseudocode:**

```text
if no file: return no attachment
check client convenience constraints
upload using restricted preset or trusted signed flow
verify provider response and returned URL
associate asset with entry under backend permission
return attachment metadata
```

## A-10 — Notifications

- **Purpose:** Inform relevant actors about submission and review changes.
- **Input:** Successful audited lifecycle event.
- **Processing:** Create an in-app notification or enqueue an approved delivery through a trusted backend; deduplicate retries.
- **Decision conditions:** Event type has a defined recipient and notification policy.
- **Output:** Notification with safe link and event summary.
- **Error handling:** Notification failure must not roll back a successful review unless product policy explicitly requires it; failures are observable for retry.
- **Pseudocode:**

```text
after committed event:
resolve recipients from authorized relationship
create idempotent notification or enqueue delivery
record delivery outcome
```

## A-11 — Report generation

- **Purpose:** Produce accurate counts only from data the actor is allowed to see.
- **Input:** Verified actor, date range, report type.
- **Processing:** Validate date range and report options; aggregate through a bounded, authorized database query; escape labels/data when rendered.
- **Decision conditions:** Student reports are self-scoped; staff reports are scoped by backend authorization; invalid ranges are rejected.
- **Output:** Report totals and period labels.
- **Error handling:** Show a retryable error, never a fabricated empty report.
- **Pseudocode:**

```text
actor = requireVerifiedUser()
validate date range and report type
query authorized aggregate with explicit bounds/pagination
if query fails: return recoverable error
render only returned aggregates and labels as text
```

## A-12 — User management

- **Purpose:** Let administrators perform explicitly permitted account actions.
- **Input:** Search/filter and requested action.
- **Processing:** Backend verifies administrator permission, validates target/action, applies least-privilege change, and records an audit event.
- **Decision conditions:** Target exists, action is allowed, and protected administrator safeguards are satisfied.
- **Output:** Updated live data and confirmation.
- **Error handling:** Deny self-lockout or prohibited role escalation according to policy; do not display mock success.
- **Pseudocode:**

```text
require backend-confirmed admin
load authorized, paginated user list
for mutation:
    validate target and action
    require explicit confirmation for destructive action
    apply through trusted backend
    record audit event
    return actual result
```

## Flowchart — Entry review

```text
Open entry
    |
Backend verifies session, role, assignment, and current status
    | denied
    +--------------------> Show access/error state; no change
    |
    v allowed
Read entry and evidence
    |
Choose approve or reject
    |
Reject? ---- yes ----> Require non-empty feedback
    |                         |
    no                        v
    |                  Feedback valid?
    |                  no -> Keep form open; explain requirement
    +------------------------+
                             v
Secure atomic transition + audit event
    |
Success? ---- no ----> Keep prior status; show recoverable error
    |
   yes
    v
Show confirmed result and next step to student
```

## Current implementation gap

The repository has Supabase calls for sign-in, entry creation, listing, statistics, and an RPC review request. It does not include the policies or schema needed to establish the security guarantees above. Draft, edit, resubmit, notification, and user-management algorithms are target behavior, not currently implemented features.
