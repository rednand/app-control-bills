# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm run lint     # ESLint check
npx tsc --noEmit # TypeScript type check only
```

## Architecture

**Next.js 15 App Router** + TypeScript + Tailwind CSS + Supabase.

Single-page app — no routing needed. All state lives in `src/components/BillsApp.tsx` (client component).

### Data flow

`BillsApp` fetches all data from Supabase on mount and on year change, then passes data + mutation callbacks down to the three table components. All writes are optimistic (local state updated immediately, then persisted to Supabase via upsert).

### Key files

| File | Purpose |
|------|---------|
| `src/components/BillsApp.tsx` | Root client component — state, data fetching, Supabase mutations |
| `src/components/InvoicesTable.tsx` | "Controle de Faturas" section (credit card invoices) |
| `src/components/DeductionsTable.tsx` | "Subtrações" section (deductions from salary) |
| `src/components/SalarySection.tsx` | "Salário e Comprometimento" section with calculated rows |
| `src/components/EditableCell.tsx` | Reusable inline-edit cell (click to edit, blur/Enter to save) |
| `src/lib/types.ts` | All TypeScript interfaces |
| `src/lib/utils.ts` | Currency/percent formatters, month labels, color helpers |
| `src/lib/supabase.ts` | Supabase client (uses NEXT_PUBLIC_* env vars) |

### Database (Supabase)

Schema in `supabase/schema.sql`. Initial data (2025) in `supabase/seed.sql`.

Tables:
- `institutions` — credit cards/banks with `due_day` and `payment_installment` (1=paid on day 15, 2=paid on day 30)
- `monthly_invoices` — invoice amounts per institution per month/year (unique on institution_id + month + year)
- `deductions` — reusable deduction items (Parte Samuel, Airbnb, etc.)
- `monthly_deductions` — deduction amounts per month/year, with optional `note` field (e.g. "NP236" = not paid)
- `salary_config` — two salary installments per month/year (unique on month + year)

### Business logic (calculations in BillsApp)

All computed values (`MonthCalc`) are derived via `useMemo` from the four data arrays:
- `subtotalFatura` = sum of all institution invoices for that month
- `totalSubtracoes` = sum of all deduction amounts for that month
- `totalFaturaLiquida` = subtotalFatura − totalSubtracoes
- `inst1Total` / `inst2Total` = invoice subtotals split by `payment_installment`
- `saldoPeriodo15` = installment_1 salary − inst1Total
- `saldoPeriodo30` = installment_2 salary − inst2Total
- `saldoRestante` = salarioTotal − totalFaturaLiquida
- `percentComprometido` = totalFaturaLiquida / salarioTotal (ratio 0–1)

## Environment

Create `.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Supabase setup

1. Run `supabase/schema.sql` in the Supabase SQL editor
2. Optionally run `supabase/seed.sql` to load the 2025 initial data
3. Set Row Level Security policies as needed (currently open for single-user use)

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan at
specs/006-align-table-columns/plan.md
<!-- SPECKIT END -->
