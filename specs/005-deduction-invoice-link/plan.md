# Implementation Plan: Subtração Vinculada a Fatura Específica

**Branch**: `005-deduction-invoice-link` | **Date**: 2026-05-21 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/005-deduction-invoice-link/spec.md`

## Summary

Substituir a abordagem "Soma" (feature 004) por um modelo onde cada subtração pode ser vinculada a uma instituição específica. O valor dessa instituição na seção de salário passa a ser `fatura_bruta − deduções_vinculadas`, simplificando o cálculo do saldo por período e eliminando as linhas "Soma" redundantes.

## Technical Context

**Language/Version**: TypeScript (strict mode), Next.js 15 App Router, React 19

**Primary Dependencies**: next-auth 4 (Google OAuth), Mongoose (MongoDB)

**Storage**: MongoDB — collection `bills_deductions` (campo `salary_period` substituído por `institution_id`)

**Testing**: `npm run lint` + `npx tsc --noEmit` + validação manual no browser

**Target Platform**: Web (single-page, Next.js App Router)

**Project Type**: Web application (single-page personal finance tool)

**Performance Goals**: Atualização imediata de cálculos após mudança de vínculo (useMemo em <10ms para 12 meses × ~10 instituições)

**Constraints**: Todas as derivações em `useMemo`; sem estado persistido derivado; `EditableCell` como primitivo de edição inline

**Scale/Scope**: Uso pessoal single-user; ~10 instituições, ~5 subtrações, 12 meses

## Constitution Check

| Princípio | Questão Gate | Status |
|-----------|--------------|--------|
| I. Calculation Integrity | `inst1Total`/`inst2Total` continuam derivados via `useMemo` dos arrays-fonte? | [x] |
| II. Optimistic UI | `handleDeductionInstitutionAssign` atualiza estado local antes do fetch? | [x] |
| III. Single-User Simplicity | Nenhum novo fluxo de auth ou rota introduzido? | [x] |
| IV. Data Integrity | Nenhuma nova collection; `institution_id` é campo nullable no documento existente? | [x] |
| V. No Dead Code | `DeductionSelector.tsx`, `getSomaLabel`, `salary_period`, `ded1Total`/`ded2Total` removidos? | [x] |

## Project Structure

### Documentation (this feature)

```text
specs/005-deduction-invoice-link/
├── plan.md              ← este arquivo
├── spec.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── deduction-institution-api.md
├── checklists/
│   └── requirements.md
└── tasks.md             (gerado pelo /speckit-tasks)
```

### Source Code (arquivos afetados)

```text
src/
├── lib/
│   ├── types.ts                          ← Deduction.institution_id; remove ded1Total/ded2Total
│   ├── utils.ts                          ← remove getSomaLabel
│   └── models/
│       └── Deduction.ts                  ← remove salary_period, add institution_id
├── app/api/
│   └── deductions/
│       ├── route.ts                      ← POST response inclui institution_id
│       └── [id]/route.ts                 ← PATCH: salary_period → institution_id
└── components/
    ├── BillsApp.tsx                      ← useMemo atualizado; handleDeductionInstitutionAssign
    ├── SalarySection.tsx                 ← remove somaSlot rows + props relacionadas
    ├── DeductionsTable.tsx               ← add institution display + InstitutionPicker
    ├── InstitutionPicker.tsx             ← NOVO: portal dropdown single-select para instituição
    └── DeductionSelector.tsx             ← DELETAR
```

## Implementation Phases

### Phase A — Data Layer

1. **`src/lib/types.ts`**
   - `Deduction`: remove `salary_period`, add `institution_id: string | null`
   - `MonthCalc`: remove `ded1Total`, `ded2Total`

2. **`src/lib/models/Deduction.ts`**
   - Remove `salary_period` do Schema e da interface `IDeduction`
   - Add `institution_id: { type: String, default: null }`

3. **`src/app/api/deductions/[id]/route.ts`**
   - PATCH handler: lê `institution_id` em vez de `salary_period`
   - `$set: { institution_id: institution_id ?? null }`

4. **`src/app/api/deductions/route.ts`**
   - POST: garantir que `institution_id: null` está na resposta (via `{ ...doc, id }`)

### Phase B — Calculation Update (BillsApp)

5. **`src/components/BillsApp.tsx`** — useMemo
   - `inst1Total`: para cada inst com `payment_installment === 1`, calcula `max(0, invoiceAmount − linkedDeductionsTotal)`
   - `inst2Total`: idem para período 2
   - Remove `ded1Total`, `ded2Total`
   - `saldoPeriodo15 = inst1Salary − inst1Total`
   - `saldoPeriodo30 = inst2Salary − inst2Total`

6. **`src/components/BillsApp.tsx`** — handlers
   - Remove `handleSalaryPeriodAssign`
   - Add `handleDeductionInstitutionAssign(deductionId, institutionId)` — otimista + PATCH `/api/deductions/[id]`
   - Pass `institutions` e `onDeductionInstitutionAssign` para `DeductionsTable`
   - Remove `onSalaryPeriodAssign` e `deductions` prop de `SalarySection`

### Phase C — UI Components

7. **`src/components/InstitutionPicker.tsx`** — NOVO
   - Portal dropdown (mesmo padrão de `InstallmentSelector`)
   - Lista de instituições com clique único (não checkbox)
   - Item "Nenhuma" no topo para remover vínculo
   - Fecha ao clicar fora

8. **`src/components/DeductionsTable.tsx`**
   - Add props: `institutions: Institution[]`, `onDeductionInstitutionAssign: (id: string, institutionId: string | null) => void`
   - Cada linha exibe o nome da instituição vinculada (ou "—") como botão clicável
   - Clique abre `InstitutionPicker`

9. **`src/components/SalarySection.tsx`**
   - Remove props: `deductions`, `onSalaryPeriodAssign`
   - Remove linhas `somaSlot` do array `rows`
   - Remove `activeSomaSelector`, `somaAnchorRect` state
   - Remove import de `DeductionSelector` e `getSomaLabel`

10. **`src/lib/utils.ts`**
    - Remove `getSomaLabel`

11. **`src/components/DeductionSelector.tsx`**
    - **DELETAR** arquivo

## Complexity Tracking

Sem violações do Constitution Check. Nenhuma justificativa necessária.
