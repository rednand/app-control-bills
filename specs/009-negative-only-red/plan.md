# Implementation Plan: Negative-Only Red Color

**Branch**: `009-negative-only-red` | **Date**: 2026-06-26 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/009-negative-only-red/spec.md`

## Summary

Remove red/rose color from all positive financial values. Red and rose tones must appear exclusively when a displayed value is strictly negative (< 0). The `percentColor` utility currently shows red at ≥ 70% committed — this changes so red appears only when the ratio exceeds 100% (expenses > salary).

## Technical Context

**Language/Version**: TypeScript (strict)

**Primary Dependencies**: React 19, Tailwind CSS

**Storage**: N/A (no data changes)

**Testing**: Manual browser test (`npm run dev`)

**Target Platform**: Web — desktop and mobile viewports

**Project Type**: Next.js 15 web application

**Performance Goals**: No impact (CSS class string changes only)

**Constraints**: No new dependencies, no calculation changes, no DB writes

**Scale/Scope**: 5 targeted changes across 3 files

## Constitution Check

| Principle | Gate Question | Status |
|-----------|---------------|--------|
| I. Calculation Integrity | Are all derived values computed via `useMemo` from source arrays only? | ✅ No calc changes |
| II. Optimistic UI | Does every write update local state immediately before MongoDB persists? | ✅ No writes |
| III. Single-User Simplicity | Does this feature avoid multi-tenancy, auth flows, or routing? | ✅ Yes |
| IV. Data Integrity | Does every new collection/upsert define a unique Mongoose index? | ✅ No DB changes |
| V. No Dead Code | Are there no unused components, types, or duplicate patterns introduced? | ✅ Removing logic only |
| VI. Responsividade | Do all new or refactored components work on mobile (≥375px) and desktop? | ✅ MobileMonthView also patched |

## Project Structure

### Documentation (this feature)

```text
specs/009-negative-only-red/
├── plan.md              ← this file
├── research.md
└── tasks.md             ← /speckit-tasks output
```

### Source Code (files touched)

```text
src/
├── lib/
│   └── utils.ts                    ← percentColor: red only when ratio > 1
└── components/
    ├── SalarySection.tsx           ← inst1Total, inst2Total, totalFaturaLiquida
    └── MobileMonthView.tsx         ← totalFaturaLiquida
```

## Change Map

| File | Line | Current | Change |
|------|------|---------|--------|
| `src/lib/utils.ts` | 26 | `if (ratio >= 0.7) return 'text-red-600 font-bold'` | `if (ratio > 1) return 'text-red-600 font-bold'` |
| `src/components/SalarySection.tsx` | 38 | `v > 0 ? 'text-red-600'` (inst1Total) | `v < 0 ? 'text-red-600'` |
| `src/components/SalarySection.tsx` | 41 | `v > 0 ? 'text-red-600'` (inst2Total) | `v < 0 ? 'text-red-600'` |
| `src/components/SalarySection.tsx` | 53 | `v > 0 ? 'text-rose-400'` (totalFaturaLiquida) | `v < 0 ? 'text-rose-400'` |
| `src/components/MobileMonthView.tsx` | 443 | `> 0 ? 'text-rose-400'` (totalFaturaLiquida) | `< 0 ? 'text-rose-400'` |

**Out of scope** (red already correct or intentional UI element):
- `utils.ts:32` — `balanceColor`: already `< 0` only
- `MobileMonthView.tsx:364,405` — `inst1Total`/`inst2Total`: already `< 0` only
- Delete buttons in `InvoicesTable`, `DeductionsTable`, `MobileMonthView` — UI actions, not values
- `BillsApp.tsx:234` — DB connection error message — UI feedback
