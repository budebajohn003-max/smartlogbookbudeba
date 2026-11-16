# Smart Logbook System Audit

**Audit scope:** Repository contents on `chore/organize-project-files`, inspected before starting feature changes.
**Assessment:** Static code and configuration review only. No Supabase project access, production credentials, database schema, deployment settings, or test users were available.

## System inventory

| Area | What is present |
|---|---|
| Application | Static HTML, CSS, and browser JavaScript modules; no framework or package manifest |
| Authentication | Supabase Auth calls for email/password sign-up, sign-in, user lookup, and sign-out |
| Profiles | Client reads `profiles` fields for name, registration number, email, and role |
| Logbooks | Client reads and inserts `logbook_entries`; fields include date, location, activities, problem, solution, photo metadata, status, and reviewer comment |
| Review | Client calls the Supabase RPC `review_logbook` to change review status |
| Images | Client uploads images directly to Cloudinary using an unsigned upload preset |
| Roles represented in UI | Student, supervisor, and administrator |
| Pages | Login, registration, student dashboard, logbook creation, student logbooks/status, supervisor dashboard/review/list, reports, admin dashboard, and admin user management |
| Verification setup | No automated test suite, dependency manifest, migration directory, or database policy file is present |

## Findings

Severity describes observed application risk. Backend-dependent findings are explicitly marked unverified because the database and policies were not included in this repository.

### Critical

1. **Authorization cannot be verified from this repository.** Browser code checks roles before showing role-specific pages, but those checks are not a security boundary. The repository has no SQL schema, RLS policy, or migration for `profiles`, `logbook_entries`, or `review_logbook`. The application relies on Supabase policies and the RPC to enforce who can read, insert, and review records. Until those backend rules are inspected, isolation between students, supervisors, and administrators is unverified.

### High

1. **The checked-in Supabase client configuration was not usable as supplied.** `scripts/supabase_client.js` contained a masked anon-key placeholder. Follow-up changes now use an ignored `scripts/config.js` and provide `scripts/config.example.js`; the owner must still enter the correct public anon key locally. A browser anon key is public by design; safety must come from restrictive RLS, not from hiding it.
2. **Administrator workflows are not connected to live data.** At the audit baseline, `admin_dashboard.html` displayed fixed user/activity totals and `user_management_page.html` contained sample people and counts. Add/Edit/Delete, report, settings, and backup controls had no connected data operations. Follow-up changes now withhold the fake values and label unavailable administrator data/actions; live functionality remains unimplemented.
3. **Supervisor scope and review authorization depend on unverified backend rules.** Supervisor list and dashboard queries request pending, recent, and aggregate logbook data without an assignment filter in the browser. `review_logbook` is called through an RPC, but its implementation and permissions are absent. Do not enable real supervisor use until RLS and RPC authorization are verified against the intended supervisor-student relationship.

### Medium

1. **Core logbook lifecycle is incomplete.** The current service inserts entries and supports approval/rejection. There is no draft save, edit, or student resubmission operation. The review UI does not require feedback before rejection, and no review history is presented. A rejected-entry correction workflow cannot be completed in the inspected code.
2. **Database-derived values require safe rendering.** At the audit baseline, the supervisor dashboard inserted a student's displayed name into `innerHTML`. Follow-up changes escape dashboard/report labels, encode review-link IDs, and construct review images with DOM APIs while allowing HTTPS URLs only. Other pages should continue to treat all profile and logbook fields as untrusted.
3. **The reports query has no explicit pagination or row cap.** `fetchLogbookStats` selects every row matching the date range before aggregating in the browser. With broad dates and permissive staff policies this can become expensive and return more data than needed.
4. **User-facing operation feedback is inconsistent.** Login, registration, submission, review, and errors use browser alerts; the dashboard logs failures to the developer console without showing an in-page error. Backend error text may be passed directly to users.
5. **Cloudinary upload validation is client-side only.** The browser checks that a file MIME type starts with `image/` and caps size at 10 MB, then uses an unsigned preset. Actual format restrictions, upload limits, and transformations must also be configured in Cloudinary; the preset configuration was not available to audit.
6. **Important behavior is not covered by automated tests.** There is no test runner or test suite, so authentication, record isolation, lifecycle transitions, and rendering have not been verified automatically.

### Low

1. **The entry experience is a login form, not an explanatory landing page.** The purpose of the system, supported roles, and first steps are not introduced before authentication.
2. **Duplicate/legacy page names create ambiguity.** Both spaced and underscored variants exist for student dashboards and logbook forms; the spaced variants redirect or duplicate other pages. Navigation and links should be checked before removing or consolidating any page.
3. **Visual and accessibility patterns are inconsistent.** Pages mix inline styles, shared CSS, Tailwind CDNs, and standalone styles. Several controls have no implemented action, and mobile navigation/layout behavior varies by page.
4. **No setup guide explains backend configuration or database prerequisites.** The README only describes the static server; it does not explain the required Supabase schema/RLS, Cloudinary preset, or test setup.

## Existing user journeys observed

- **Student:** register or log in, create an entry with date/location/activity/problem/solution and optional photo, view entries and their status, see status counts, and request a report.
- **Supervisor:** log in, view pending or recent entries, open a review, and approve or reject it with an optional comment.
- **Administrator:** a role-gated dashboard and user-management page are present, but the inspected statistics and user list are static examples and the user actions are not connected to a backend.

Notifications, supervisor assignments, draft editing, resubmission, account lifecycle management, and audit history are not established by the repository evidence.

## Improvement plan

1. **Requirements and workflow baseline:** Write an SRS, role/use-case flows, and explicit acceptance criteria. Separate existing behavior from planned behavior.
2. **Backend and data contract verification:** Obtain or inspect the live schema, RLS policies, RPC definition, and Cloudinary preset settings. Document the expected role and assignment model before changing data access. Do not create speculative production migrations or weaken policies.
3. **Core lifecycle:** Implement and verify the smallest complete student-to-supervisor lifecycle supported by the confirmed backend: create/save, submit, review, feedback, correction/resubmission, and status history. Add database enforcement for protected transitions before exposing UI controls.
4. **Role-specific data and admin workflows:** Replace hardcoded admin data only after identifying authorized backend operations. Scope supervisor queries and review RPCs to assigned students. Keep unavailable actions clearly unavailable rather than presenting fake functionality.
5. **Safety and usability:** Safely render user-controlled content, validate input and uploads on both client and trusted backend/configuration layers, and provide accessible loading, error, empty, and success states.
6. **Responsive design and navigation:** Consolidate shared page styles and navigation incrementally while preserving existing page URLs until links and redirects are verified.
7. **Verification and delivery docs:** Add focused tests for pure logic and static references, then run authenticated integration scenarios when test credentials/backend access are supplied. Record only tests that actually ran and report any remaining limitations.

## Preconditions and limits

- Do not commit credentials. Supply browser-safe Supabase project URL/anon key through an untracked local configuration mechanism; never use a service-role key in the browser.
- Confirm actual Supabase RLS and `review_logbook` behavior before claiming role isolation or changing the schema.
- The repository can be statically inspected and its local paths checked, but production integration tests require access to a configured Supabase project, Cloudinary settings, and test accounts.

## Follow-up work after the baseline audit

- Login no longer invents a student role when the authenticated account has no verified profile, and unrecognized profile roles fail closed.
- The supervisor dashboard and report output escape database-derived labels; review evidence is inserted with DOM APIs instead of HTML string interpolation.
- Admin sample totals, sample people, fake report dates, and unsupported settings/backup claims are removed or clearly marked as not connected. These pages remain non-operational until an authorized backend service exists.
- Added an ignored local configuration file/template for Supabase and Cloudinary. No real key was added to the repository; the Supabase public anon key still needs to be supplied by the project owner.
- Added draft SRS, algorithm, and user-flow documents; see [SRS.md](./SRS.md), [SYSTEM_ALGORITHMS.md](./SYSTEM_ALGORITHMS.md), and [USER_FLOWS.md](./USER_FLOWS.md).
- Validation run: VS Code reported no problems in changed JavaScript/HTML files; a static check confirmed local HTML assets, relative imports, and documentation links exist. No live integration or end-to-end test was run.
