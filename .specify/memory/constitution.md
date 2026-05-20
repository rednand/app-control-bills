<!--
SYNC IMPACT REPORT
==================
Version change: 1.0.0 → 1.0.1

Modified principles:
- II. Optimistic UI: "Supabase upsert" → "MongoDB write"; "Supabase error" → "API/MongoDB error"
- III. Single-User Simplicity: Removed RLS reference (Supabase concept); replaced with next-auth session note
- IV. Data Integrity: "write to Supabase" → "write to MongoDB"; "tables" → "collections";
  collection names updated to actual Mongoose model names; unique constraint updated to
  include `owner` in salary_config (per feature 003)

Added sections: N/A

Removed sections: N/A

Templates requiring updates:
- .specify/templates/plan-template.md ✅ (Constitution Check gates already aligned)
- .specify/templates/spec-template.md ✅ (no structural changes required)
- .specify/templates/tasks-template.md ✅ (no structural changes required)

Follow-up TODOs:
- None.
-->

# Control Bills Constitution

## Core Principles

### I. Calculation Integrity (NON-NEGOTIABLE)

All financial computations MUST be deterministic and derived exclusively from
the four source data arrays (invoices, deductions, salary config, institutions).
Derived values (`MonthCalc`) MUST be computed via `useMemo` and MUST NOT be
stored in persistent state — they are always recalculated on the fly.

- `totalFaturaLiquida` = `subtotalFatura` − `totalSubtracoes` (never short-circuit)
- `percentComprometido` = `totalFaturaLiquida / salarioTotal` (ratio 0–1, no rounding in logic)
- Split totals (`inst1Total`, `inst2Total`) MUST respect the `payment_installment` field
- A change to any source array MUST trigger recalculation of all derived values

### II. Optimistic UI

All user writes (invoice edits, deduction edits, salary updates) MUST update
local React state immediately before the MongoDB write completes.

- Local state is the source of truth for rendering; MongoDB is the persistence layer
- On API/MongoDB error, the UI MUST revert local state and surface an error message
- No operation should leave the UI in a loading/blocked state for routine edits

### III. Single-User Simplicity

This is a personal finance tool for one user per account. Features MUST NOT introduce
role-based access or complex multi-tenancy unless explicitly requested.

- Access is controlled via session-based authentication (next-auth); each Google account
  sees only its own data — no additional access control layers are needed
- No routing is required; the entire app is a single page (`src/app/page.tsx`)
- New sections or tables follow the existing three-component pattern
  (InvoicesTable, DeductionsTable, SalarySection)

### IV. Data Integrity via Unique Constraints

Every write to MongoDB MUST use upsert semantics against the defined unique
Mongoose indexes to prevent duplicate records.

- `bills_monthly_invoices` unique on `(institution_id, month, year)`
- `bills_monthly_deductions` unique on `(deduction_id, month, year)`
- `bills_salary_config` unique on `(month, year, owner)`
- New collections MUST define a comparable Mongoose index before shipping

### V. No Dead Code / Simplicity

The codebase MUST stay lean and purposeful.

- Remove unused components, types, or utilities before merging
- Do not abstract prematurely: three similar patterns are acceptable before extracting
- `EditableCell` is the canonical inline-edit primitive; do not duplicate its
  click-to-edit behaviour elsewhere
- Comments in source code are prohibited unless documenting a non-obvious
  constraint or external workaround

## Technology Stack

**Runtime**: Next.js 15 App Router, React 19, TypeScript (strict mode)

**Styling**: Tailwind CSS — utility-first, no CSS Modules or styled-components

**Database**: MongoDB (Mongoose) — models in `src/lib/models/`

**Auth**: next-auth 4 with Google OAuth — session available in all API routes via
`getServerSession(authOptions)`

**State**: React `useState` + `useMemo` in `BillsApp.tsx` — no external
state management library (Redux, Zustand, etc.) unless explicitly needed

**Environment**: `.env.local` with `MONGODB_URI`, `GOOGLE_CLIENT_ID`,
`GOOGLE_CLIENT_SECRET`, and `NEXTAUTH_SECRET`

Any introduction of a new dependency MUST be justified by a concrete gap in
the existing stack and reviewed against Principle V (Simplicity).

## Development Workflow

- **Lint gate**: `npm run lint` MUST pass before any PR is opened
- **Type gate**: `npx tsc --noEmit` MUST pass before any PR is opened
- **Dev server**: `npm run dev` (http://localhost:3000) for local validation
- **Production build**: `npm run build` MUST succeed before merging to `main`
- **No comments in code** — violations of Principle V (No Dead Code) are
  blocking review findings
- **No emojis in source code** — emojis are permitted only in `console.log`
  statements if explicitly requested

## Governance

This constitution supersedes all other informal agreements about project
structure, code style, and business logic. Amendments require:

1. A clear rationale documenting why the existing principle is insufficient
2. A version bump following semantic versioning:
   - **MAJOR**: Principle removed, renamed, or incompatibly redefined
   - **MINOR**: New principle or section added
   - **PATCH**: Clarifications, wording, or non-semantic refinements
3. Update to `LAST_AMENDED_DATE` and `CONSTITUTION_VERSION` in this file
4. Propagation check across all templates in `.specify/templates/`

All PRs MUST be verified against the Constitution Check section in
`plan-template.md` before approval. Complexity violations MUST be justified
in the Complexity Tracking table of the relevant `plan.md`.

**Version**: 1.0.1 | **Ratified**: 2026-05-20 | **Last Amended**: 2026-05-20
