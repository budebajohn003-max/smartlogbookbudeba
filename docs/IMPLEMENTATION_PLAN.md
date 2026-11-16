# Implementation Plan

This plan follows the initial static repository audit. All work remains on `chore/organize-project-files`; do not commit changes to `main`.

## Phase 1 — Inspect and audit

**Status: Complete (repository-only static audit).**

- Confirm branch and working tree before changing files.
- Inventory application pages, JavaScript modules, Supabase/Cloudinary usage, and available setup/test configuration.
- Record observed behavior, risks, unknown backend dependencies, and a gated improvement plan in [SYSTEM_AUDIT.md](./SYSTEM_AUDIT.md).

## Phase 2 — Requirements and user workflows

**Status: Draft complete from repository evidence.** Product/backend-specific assumptions remain explicitly open.

- Write an IEEE-style SRS that labels requirements as implemented, partially implemented, or proposed.
- Document student, supervisor, and administrator use cases and measurable acceptance criteria.
- Document current and target workflows without claiming unsupported features exist.

Deliverables: [SRS.md](./SRS.md), [SYSTEM_ALGORITHMS.md](./SYSTEM_ALGORITHMS.md), and [USER_FLOWS.md](./USER_FLOWS.md).

**Exit check:** Requirements align with inspected code; unresolved business rules are clearly marked for confirmation.

## Phase 3 — Data model and authorization

**Status: Blocked on actual database definitions for implementation; target algorithms are documented.**

- Obtain the actual Supabase schema, RLS policies, RPC body, and role/assignment rules.
- Document entities, ownership, supervisor authorization, status transitions, and audit requirements.
- Propose reviewable, reversible SQL migrations only after the actual database has been inspected.
- Never rely on client-side role checks as authorization and never weaken existing RLS.

**Exit check:** Student isolation and supervisor/admin permissions are testable at the database/API layer.

## Phase 4 — Core student workflow

- Implement only lifecycle actions supported by the confirmed schema.
- Add validation, progress/loading/error/success states, and a clear status/feedback path.
- Support drafts, editing, and resubmission only after database transition rules are agreed and enforced.

**Exit check:** A test student can complete the agreed workflow without changing another user's data.

## Phase 5 — Supervisor workflow

- Scope pending/recent entries to authorized students.
- Require useful rejection feedback and show review results/history where supported.
- Prevent unauthorized changes to approved records in the backend.

**Exit check:** A supervisor can review only authorized entries; rejected entries have a clear next step.

## Phase 6 — Administrator and reports

- Replace mock totals and sample users with real authorized queries.
- Implement administrative actions only when their backend contract is available.
- Apply bounded/paginated report queries and keep figures tied to actual records.

**Exit check:** No screen presents placeholder values as live production data.

## Phase 7 — UI, accessibility, and reliability

- Improve landing/authentication, page consistency, responsive navigation, semantic forms, focus states, and accessible status feedback.
- Safely render database/user-controlled text and validate file upload restrictions.
- Avoid presenting administrator mock values or inactive controls as live system functionality.
- Preserve existing routes until redirect and navigation coverage is verified.

**Exit check:** Keyboard and small-screen checks pass for the principal journeys.

## Phase 8 — Testing and documentation

- Add focused tests for validation, status transitions, rendering helpers, and local paths using the smallest suitable tooling.
- Run integration scenarios only with configured test services/accounts; record actual results.
- Complete the SRS, algorithms, user flows, database design, installation/user guide, and testing report as evidence allows.

**Exit check:** Documentation distinguishes verified behavior from assumptions, and all remaining risks are listed.

## Current blockers to end-to-end implementation

1. The local configuration template is in place, but the project owner's public Supabase anon key has not been configured.
2. No database schema, RLS policies, migration history, or `review_logbook` RPC definition is included.
3. Cloudinary preset constraints and integration test accounts are not available in the repository.

These are verification gates, not permission to invent a schema, claim integrations pass, or place credentials in tracked files.
