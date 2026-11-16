# Software Requirements Specification

## Document control

| Item | Value |
|---|---|
| System | Smart Logbook Management System |
| Version | Draft 0.1 |
| Status | Baseline derived from repository inspection; backend requirements require validation |
| Scope | Student, supervisor, and administrator workflows for field-training logbooks |

Requirement status labels: **Observed** means supported by repository code; **Partial** means only part of the behavior is present or backend-dependent; **Planned** means it is a target, not a verified feature.

## 1. Introduction

### 1.1 Purpose

This specification defines the observable behavior and target requirements for a web system that records student field-training activity and supports supervisor review. It separates existing implementation from desired behavior so planned functionality is not mistaken for delivered functionality.

### 1.2 Scope

The current application is a static HTML/CSS/JavaScript client using Supabase Auth and database calls, plus a direct Cloudinary image upload. Its intended scope includes account access, logbook creation and status tracking, supervisor review, reports, and administrator functions. Database authorization, actual deployment configuration, and some administrative screens are not verifiable from the repository.

### 1.3 Intended audience

Students, supervisors, administrators, project owners, developers, database administrators, and testers.

### 1.4 Definitions and abbreviations

- **Entry:** A dated student logbook record describing activities and optionally challenges, solutions, and a supporting image.
- **RLS:** PostgreSQL Row Level Security.
- **Supabase Auth:** The authentication service used by the browser client.
- **Supervisor assignment:** A backend-authorized relationship between a supervisor and one or more students; its schema is not present in the repository.
- **Observed / Partial / Planned:** Implementation status labels used in this document.

### 1.5 References

- Repository implementation: `scripts/auth.js`, `scripts/logbook_service.js`, `scripts/reports.js`, `scripts/review.js`, and root-level HTML pages.
- Repository assessment: [SYSTEM_AUDIT.md](./SYSTEM_AUDIT.md).
- Planned workflows: [USER_FLOWS.md](./USER_FLOWS.md).
- Planned business algorithms: [SYSTEM_ALGORITHMS.md](./SYSTEM_ALGORITHMS.md).

### 1.6 Overview

Section 2 describes the product context and constraints. Section 3 states functional and quality requirements. Sections 4–6 define interfaces, representative use cases, and measurable acceptance criteria. Requirements that depend on unseen backend configuration remain explicitly unverified.

## 2. Overall system description

### 2.1 Product perspective

The product is a browser-based frontend served as static files. It imports the Supabase JavaScript client from a CDN, uses Supabase Auth and database tables through the anon client, and uploads selected images to Cloudinary. No server application, schema migration, RLS policy, automated test suite, or dependency manifest is present in the repository.

### 2.2 Product functions

Repository-observed functions include:

- Register and authenticate by email/password through Supabase Auth.
- Read a user profile and role from `profiles`.
- Create a student logbook entry with date, location, activities, optional problem/solution, and optional photo.
- Display a student's entries and status.
- List entries for supervisor review and request approve/reject through `review_logbook`.
- Aggregate report counts from queried logbook rows.
- Display administrator pages, although the inspected dashboard/user directory include static sample figures or users and nonfunctional actions.

Draft management, editing/resubmission, notifications, supervisor assignment management, and production-grade administration are not established by the current repository.

### 2.3 User classes

| User class | Intended capability | Current evidence/limitation |
|---|---|---|
| Student | Manage own training entries and view review outcomes | Entry creation, own-list/status pages, and reports are present; backend ownership policy is unverified |
| Supervisor | Review entries for assigned students and provide feedback | Review/list pages and RPC call are present; assignment model and database authorization are unverified |
| Administrator | Manage accounts and monitor system activity | Role-gated UI exists, but sample data and incomplete actions are present |

### 2.4 Operating environment

- Modern browser with JavaScript modules, network access, and HTTPS in deployment.
- Static HTTP server for local development; opening files directly with `file://` is not sufficient for module loading.
- Configured Supabase project and Cloudinary upload preset.

### 2.5 Design and implementation constraints

- Browser code is public and must never contain a Supabase service-role key or other server secret.
- Client-side role checks improve navigation only; all data permissions and status transitions must be enforced by trusted database/backend logic.
- Existing static routes should be preserved until navigation and redirects are verified.
- The database schema, RLS policies, review RPC body, and Cloudinary preset configuration must be inspected before production access-control or migration claims can be made.

### 2.6 Assumptions and dependencies

- Supabase is intended to remain the authentication and database provider.
- Cloudinary is intended to remain the image host unless the product owner decides otherwise.
- A project's browser anon key may be public, but only with correctly configured RLS and restricted storage/upload configuration.
- Student/supervisor assignment rules, institutional retention policy, notification channels, and administrator powers require confirmation.

## 3. Specific requirements

### 3.1 Functional requirements

| ID | Requirement | Status |
|---|---|---|
| FR-001 | The system shall allow a user to register with the required identity fields and a valid email/password. | Partial — client sign-up exists; profile persistence and confirmation behavior depend on Supabase configuration. |
| FR-002 | The system shall authenticate users and end the active session on logout. | Partial — Supabase calls exist; runtime credentials/configuration are incomplete in the checked-in client. |
| FR-003 | The system shall load a user's profile and role from an authoritative data source and deny access when the profile cannot be verified. | Partial — client now fails closed for missing/unknown profiles; backend role enforcement is unverified. |
| FR-004 | The system shall prevent students from reading or changing another student's records, including through direct API requests. | Planned/unverified — must be enforced and tested by RLS/backend policies. |
| FR-005 | The system shall allow an authorized student to create a dated entry containing activity details and optional supporting information. | Partial — insert form/service exist; backend constraints and authorization are unverified. |
| FR-006 | The system shall validate required entry fields and reject invalid or oversized uploads with actionable feedback. | Partial — basic browser validation and a 10 MB client limit exist; server/provider restrictions are unverified. |
| FR-007 | The system shall allow a student to save a draft, edit a permitted entry, submit it for review, and resubmit a rejected entry when that lifecycle is enabled. | Planned — these transitions are not implemented in the inspected service. |
| FR-008 | The system shall keep entry status unchanged unless an authorized status-transition operation succeeds. | Partial — review is delegated to an RPC; its transaction rules and permissions are unavailable for inspection. |
| FR-009 | The system shall allow an authorized supervisor to view and review only entries from students they are permitted to supervise. | Partial/unverified — supervisor screens and queries exist; no assignment-aware frontend filter or backend policy is included. |
| FR-010 | The system shall require a clear reason when a supervisor rejects an entry and make that reason visible to its student. | Planned — comment is currently optional in the review client. |
| FR-011 | The system shall protect approved entries from unauthorized editing and preserve who reviewed them and when. | Planned/unverified — a reviewed timestamp is mapped, but schema enforcement and audit history are not included. |
| FR-012 | The system shall show each student the current status and any supervisor feedback for their own entries. | Partial — status and reviewer comment are mapped; complete correction/resubmission guidance is absent. |
| FR-013 | The system shall calculate reports from authorized, bounded data and identify the selected date range. | Partial — client-side aggregation exists without pagination or a row cap. |
| FR-014 | The system shall display administrative statistics and user records from live authorized data rather than sample values. | Planned — current pages contain hardcoded demo values. |
| FR-015 | The system shall allow administrators to perform only explicitly authorized user-management actions and record important changes. | Planned — current buttons are not connected to backend operations. |
| FR-016 | The system shall notify users of important status changes when notification channels and policies are defined. | Planned — no notification implementation is present. |
| FR-017 | The system shall provide in-context loading, success, empty, and recoverable error states for important operations. | Partial — loading/empty/error handling varies; browser alerts and console-only errors are used. |

### 3.2 Non-functional requirements

| ID | Requirement | Acceptance measure |
|---|---|---|
| NFR-001 Security | The browser shall contain no service-role key, password, or other privileged secret. | Repository secret scan and configuration review find no privileged credentials. |
| NFR-002 Authorization | Every protected read and mutation shall be authorized by backend/database policy, not only page navigation. | Automated or documented integration tests with at least two students and two differently scoped staff users demonstrate allowed and denied access. |
| NFR-003 Data integrity | Status changes shall be atomic and restricted to valid lifecycle transitions. | Database tests reject invalid actor/status transitions and preserve prior status on failure. |
| NFR-004 Input safety | User-controlled text shall be rendered as text or safely encoded. | Stored test strings containing HTML/script syntax render inert on each affected page. |
| NFR-005 Performance | List/report requests shall be bounded or paginated and avoid loading unrelated records. | Each list query has an explicit limit/page strategy and is covered with a dataset larger than one page. |
| NFR-006 Usability | A user shall receive confirmation or a recoverable error for each important save, submission, and review action. | Manual workflow checklist confirms outcome and next step at each operation. |
| NFR-007 Accessibility | Core workflows shall have labelled controls, keyboard-operable actions, visible focus, and announced validation/status messages. | Keyboard-only walkthrough and automated accessibility checks on core pages, with remaining violations documented. |
| NFR-008 Compatibility | Core pages shall work on current desktop and mobile browsers with JavaScript modules enabled. | Smoke checks at 360 px and 1280 px viewports plus supported-browser manual checks. |
| NFR-009 Reliability | A failed upload or database operation shall not report success or silently change status. | Failure-injection/manual test verifies unchanged state and an actionable message. |
| NFR-010 Maintainability | Shared business logic and page assets shall have documented locations and repeatable setup instructions. | New developer can follow README setup using documented non-secret configuration and checks. |
| NFR-011 Backup/recovery | Production database and uploaded evidence shall have documented provider backup/retention and restore procedures. | Operations owner supplies and tests a recovery procedure; currently unresolved. |
| NFR-012 Scalability | Reports and dashboards shall aggregate data at the database/API layer when record volume makes client-side full-table aggregation unsuitable. | Query plan/load validation at agreed expected record volume. |

## 4. External interface requirements

### 4.1 User interface

The application shall provide role-appropriate pages with clear navigation, labelled forms, responsive layouts, and visible operation states. Current screens use plain HTML/CSS with some CDN-provided Tailwind and icon libraries.

### 4.2 Database interface

The browser currently expects Supabase resources named `profiles` and `logbook_entries`, a foreign-key relationship used to select profile names, and an RPC named `review_logbook`. Their actual definitions, constraints, grants, and RLS policies are not included and must be confirmed before implementation depends on them.

### 4.3 Software interfaces

- Supabase Auth for email/password identity and session management.
- Supabase PostgREST/RPC through `@supabase/supabase-js`.
- Cloudinary image upload endpoint using an unsigned preset.
- External CDNs for client libraries, CSS frameworks, and icons on some pages.

### 4.4 Communication interfaces

All production API traffic and static application delivery shall use HTTPS. The application requires browser network access to its configured Supabase, Cloudinary, and selected CDN hosts.

## 5. Use-case specifications

### UC-01 — Student creates an entry

- **Actor:** Authenticated student.
- **Preconditions:** A valid session and verified student profile exist; backend policy allows the operation.
- **Main flow:** Student opens the entry form, supplies required date/activity fields, optionally adds details/photo, submits, and receives a result.
- **Alternative flow:** Student omits optional fields or photo; the entry is saved without them.
- **Errors:** Invalid fields, expired session, upload failure, or database rejection; no false success is shown and the user can recover.
- **Postconditions:** One entry owned by that student exists in the expected initial status, or no entry is created.
- **Status:** Partially implemented; draft support is not established.

### UC-02 — Student checks status and feedback

- **Actor:** Authenticated student.
- **Preconditions:** Student has access to their own entries.
- **Main flow:** Student opens status/list view, sees entries and current states, opens feedback, and follows the indicated correction/resubmission action where enabled.
- **Alternative flow:** No entries exist; a helpful empty state offers the next action.
- **Errors:** Data load failure is shown without exposing another user's data.
- **Postconditions:** No data mutation occurs.
- **Status:** Status viewing is present; complete resubmission journey is planned.

### UC-03 — Supervisor reviews an entry

- **Actor:** Authenticated supervisor authorized for the student, or administrator if explicitly permitted.
- **Preconditions:** Session and staff role are verified by the backend; entry is reviewable and within that actor's scope.
- **Main flow:** Actor opens an entry, inspects text/evidence, chooses approve or reject, supplies required feedback for rejection, confirms the action, and sees the result.
- **Alternative flow:** Actor leaves without submitting; status remains unchanged.
- **Errors:** Unauthorized entry, stale status, invalid transition, or RPC failure; operation fails safely and reports the outcome.
- **Postconditions:** Exactly one authorized transition is recorded, including reviewer and timestamp where required.
- **Status:** Review UI/RPC invocation exists; authorization and state guarantees are unverified.

### UC-04 — Administrator manages users

- **Actor:** Authenticated administrator.
- **Preconditions:** Backend confirms administrator permission for the requested operation.
- **Main flow:** Administrator views live user records, selects an allowed action, reviews its impact, confirms, and receives the result.
- **Alternative flow:** Search/filter has no matches; an empty state is shown.
- **Errors:** Unauthorized action, duplicate/invalid input, or service failure; no mock success is presented.
- **Postconditions:** Only the permitted user record changes and the action is auditable.
- **Status:** Current user management is sample data and is not operational.

## 6. Acceptance criteria

1. A registered test student can sign in and out; failed authentication does not open a protected screen.
2. A profile lookup failure cannot silently grant a student role or permit data access.
3. Student A cannot read, update, review, or infer Student B's private entries by changing a URL or API parameter.
4. An authorized student can create an entry with required fields; invalid submissions and failed uploads do not create misleading success states.
5. Student status reflects the database result; rejected feedback is visible and explains the next permitted action.
6. Only a supervisor authorized for an entry can review it; an unauthorized supervisor's direct RPC/API attempt is denied.
7. Rejection without required feedback is rejected by the trusted backend; invalid or repeated status transitions are denied.
8. Approved records cannot be changed by an unauthorized actor, and review metadata is retained according to the agreed policy.
9. Dashboard/report counts are calculated from live records within the viewer's authorization scope; no fixed demo totals are presented as actuals.
10. Core workflows work at 360 px and 1280 px and can be completed using keyboard navigation with visible focus.
11. User-controlled text is inert when it contains markup-like characters.
12. Integration tests and limitations are documented with actual outcomes; unavailable backend tests are marked not run rather than passed.
