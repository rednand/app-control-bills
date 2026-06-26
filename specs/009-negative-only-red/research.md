# Research: Negative-Only Red Color

**Feature**: 009-negative-only-red | **Date**: 2026-06-26

## Findings

### Color usage audit

| Location | Function/Pattern | Current trigger | Correct? |
|----------|-----------------|-----------------|----------|
| `utils.ts` — `percentColor` | `ratio >= 0.7` → red | Positive value (70% committed) | No — must be `> 1` |
| `utils.ts` — `balanceColor` | `value < 0` → red | Negative value | Yes |
| `SalarySection.tsx:38` | `v > 0` → red (inst1Total) | Positive value | No — must be `< 0` |
| `SalarySection.tsx:41` | `v > 0` → red (inst2Total) | Positive value | No — must be `< 0` |
| `SalarySection.tsx:53` | `v > 0` → rose (totalFaturaLiquida) | Positive value | No — must be `< 0` |
| `MobileMonthView.tsx:443` | `> 0` → rose (totalFaturaLiquida) | Positive value | No — must be `< 0` |
| `MobileMonthView.tsx:364` | `< 0` → red (inst1Total) | Negative value | Yes |
| `MobileMonthView.tsx:405` | `< 0` → red (inst2Total) | Negative value | Yes |
| Delete buttons | `text-red-400` static | UI action | Out of scope |
| DB error message | `text-red-600` static | UI feedback | Out of scope |

### Decision: percentColor threshold

- **Decision**: Red threshold changes from `ratio >= 0.7` to `ratio > 1`
- **Rationale**: A ratio of 0.7 (70% committed) is a positive state. Red should signal that expenses exceed salary — i.e., ratio > 1.0. The amber/green gradient for 0–100% gives enough visual cues without red.
- **Alternatives considered**: `ratio >= 1` (same effect, `> 1` is clearer as "strictly over")

### Decision: inst1Total / inst2Total color

- **Decision**: Change `v > 0` to `v < 0` for both installment subtotals in `SalarySection`
- **Rationale**: These values represent money spent per period. A positive amount means purchases were made — that is normal, not alarming. Red should only appear if somehow the subtotal becomes negative (edge case, but semantically correct).
- **Rationale for mobile**: `MobileMonthView` already uses `< 0` correctly — desktop `SalarySection` was inconsistent.

### Decision: totalFaturaLiquida color

- **Decision**: Change `v > 0 ? 'text-rose-400'` to `v < 0 ? 'text-rose-400'` in both `SalarySection` and `MobileMonthView`
- **Rationale**: The net invoice total is always positive in normal usage (expenses). Showing it in rose/red creates anxiety without information value. Only a negative total (deductions exceeded invoices) warrants a color signal.
