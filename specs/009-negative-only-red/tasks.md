# Tasks: Negative-Only Red Color

**Input**: Design documents from `/specs/009-negative-only-red/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅

**Tests**: Not requested — changes are pure CSS class string substitutions, verifiable visually.

**Organization**: 5 targeted edits across 3 files, grouped by component. No setup or foundational phase needed — changes are self-contained CSS class updates.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)

---

## Phase 1: Shared Utility Fix (Blocking)

**Purpose**: Fix `percentColor` in the shared utility before touching components that call it. Both `SalarySection` and `MobileMonthView` import `percentColor` — this fix must land first.

**⚠️ CRITICAL**: Components depend on this utility. Fix utility before component edits.

- [x] T001 Fix `percentColor` in `src/lib/utils.ts` line 26: change `ratio >= 0.7` to `ratio > 1` — red only when expenses exceed salary

**Checkpoint**: `percentColor` now returns red only for ratio > 1 (> 100% committed)

---

## Phase 2: User Story 1 — Desktop SalarySection (Priority: P1)

**Goal**: Remove red from positive `inst1Total`, `inst2Total`, and `totalFaturaLiquida` values in the desktop table.

**Independent Test**: Open the app on desktop, navigate to any month where all balances are positive. Verify no red appears in the "Subtrai …" rows and "Total Fatura Líquida" row.

### Implementation for User Story 1

- [x] T002 [US1] Fix `inst1Total` color in `src/components/SalarySection.tsx` line 38: change `v > 0 ? 'text-red-600'` to `v < 0 ? 'text-red-600'`
- [x] T003 [US1] Fix `inst2Total` color in `src/components/SalarySection.tsx` line 41: change `v > 0 ? 'text-red-600'` to `v < 0 ? 'text-red-600'`
- [x] T004 [US1] Fix `totalFaturaLiquida` color in `src/components/SalarySection.tsx` line 53: change `v > 0 ? 'text-rose-400'` to `v < 0 ? 'text-rose-400'`

**Checkpoint**: Desktop view — all positive values render in neutral color; red/rose appears only on negative values.

---

## Phase 3: User Story 2 — Mobile MobileMonthView (Priority: P2)

**Goal**: Apply the same rule to the mobile RESUMO section's `totalFaturaLiquida` display.

**Independent Test**: Open the app on mobile (or narrow viewport), navigate to RESUMO section. Verify "Total Fatura Líquida" is not rose/red when the value is positive.

### Implementation for User Story 2

- [x] T005 [P] [US2] Fix `totalFaturaLiquida` color in `src/components/MobileMonthView.tsx` line 443: change `> 0 ? 'text-rose-400'` to `< 0 ? 'text-rose-400'`

**Note**: T005 can run in parallel with T002-T004 (different file).

**Checkpoint**: Mobile view matches desktop — rose appears only when `totalFaturaLiquida < 0`.

---

## Phase 4: Polish & Validation

**Purpose**: Confirm no type errors or lint violations were introduced.

- [x] T006 Run `npm run lint` and resolve any issues (1 pre-existing error in BillsApp.tsx, not introduced by this feature)
- [x] T007 [P] Run `npx tsc --noEmit` and resolve any type errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1** (T001): No dependencies — start immediately
- **Phase 2** (T002–T004): Depends on T001 (shared utility must be patched first)
- **Phase 3** (T005): Depends on T001 — can run in parallel with Phase 2 (different file)
- **Phase 4** (T006–T007): Depends on all implementation tasks complete

### Parallel Opportunities

```
T001 (utils.ts)
  ├── T002 → T003 → T004  (SalarySection.tsx — sequential, same file)
  └── T005                 (MobileMonthView.tsx — parallel with SalarySection work)
```

---

## Implementation Strategy

### MVP (single session)

1. Apply T001 (utils.ts fix)
2. Apply T002–T004 in one edit pass on SalarySection.tsx
3. Apply T005 on MobileMonthView.tsx
4. Run T006–T007 to verify

**Expected total effort**: < 15 minutes — all changes are operator flips (`>` → `<`) on existing color conditionals.
