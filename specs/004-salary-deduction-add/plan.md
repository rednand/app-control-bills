# Implementation Plan: Soma de Subtrações no Período do Salário

**Branch**: `004-salary-deduction-add` | **Date**: 2026-05-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-salary-deduction-add/spec.md`

## Summary

Adicionar campo `salary_period` ao model `Deduction` (espelhando `payment_installment` em
`Institution`). Na seção "Salário e Comprometimento", inserir linhas "Soma [subtrações]"
abaixo de cada "Subtrai [instituições]". O valor mensal das subtrações vinculadas é somado
ao Saldo do período correspondente. Total Fatura Líquida e Total Subtrações não são
afetados.

## Technical Context

**Language/Version**: TypeScript 5 / Node 20 (Next.js 15)

**Primary Dependencies**: React 19, Tailwind CSS, Mongoose 8

**Storage**: MongoDB — campo `salary_period` adicionado ao model `Deduction`; sem novas collections

**Testing**: Manual via `npm run dev`

**Target Platform**: Web (navegador desktop)

**Project Type**: Single-page web application

**Performance Goals**: Atualização imediata ao vincular/desvincular subtrações (< 1s)

**Constraints**: Implementação espelha simetricamente a feature 002 (salary-subtraction).
Máximo de reuso de padrões existentes (InstallmentSelector → DeductionSelector)

**Scale/Scope**: Uso pessoal (< 20 itens de subtração)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate Question | Status |
|-----------|---------------|--------|
| I. Calculation Integrity | ded1Total e ded2Total derivados via useMemo dos arrays de fonte? | ✅ Pass |
| II. Optimistic UI | handleSalaryPeriodAssign atualiza estado local antes do PATCH? | ✅ Pass |
| III. Single-User Simplicity | Sem auth, routing, ou multi-tenancy? | ✅ Pass |
| IV. Data Integrity | salary_period nullable no model; sem novo índice único necessário | ✅ Pass |
| V. No Dead Code | DeductionSelector segue padrão existente; getSomaLabel espelha getSubtraiLabel | ✅ Pass |

## Project Structure

### Documentation (this feature)

```text
specs/004-salary-deduction-add/
├── plan.md              # Este arquivo
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/
│   └── salary-section-soma.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── models/
│   │   └── Deduction.ts        # + salary_period: { type: Number, enum: [1,2,null], default: null }
│   ├── types.ts                # Deduction + salary_period; MonthCalc + ded1Total, ded2Total
│   └── utils.ts                # + getSomaLabel(period, deductions)
├── app/
│   └── api/
│       └── deductions/
│           └── [id]/route.ts   # + PATCH handler para salary_period
├── components/
│   ├── BillsApp.tsx            # + handleSalaryPeriodAssign; useMemo atualizado; nova prop para SalarySection
│   ├── SalarySection.tsx       # + linhas "Soma" com DeductionSelector
│   └── DeductionSelector.tsx   # novo componente (espelha InstallmentSelector)
```

**Structure Decision**: Single project. Um novo componente `DeductionSelector` é necessário
para o seletor de subtrações (segue o padrão de `InstallmentSelector` mas com tipos `Deduction`).

## Complexity Tracking

> Nenhuma violação de princípio.
