# Research: Soma de Subtrações no Período do Salário

**Date**: 2026-05-20 | **Branch**: `004-salary-deduction-add`

## Decision 1: Campo salary_period no model Deduction

**Decision**: Adicionar `salary_period: { type: Number, enum: [1, 2, null], default: null }`
ao schema Mongoose de `Deduction`.

**Rationale**: Espelha exatamente o campo `payment_installment` em `Institution` (feature 002).
A semântica é análoga: `payment_installment` = qual período sofre a subtração das faturas;
`salary_period` = qual período recebe a soma das subtrações.

**Alternatives considered**: Campo em `MonthlyDeduction` (por mês) — rejeitado porque a
vinculação é global (igual ao `payment_installment` de `Institution`). Se Samuel pagará
sempre no dia 15, a configuração vale para todos os meses.

---

## Decision 2: Novos campos ded1Total e ded2Total em MonthCalc

**Decision**: Adicionar `ded1Total` e `ded2Total` ao tipo `MonthCalc` em `src/lib/types.ts`.
Calculados no `useMemo` de `BillsApp.tsx` filtrando deductions com `salary_period === 1`
ou `=== 2` e somando seus `monthlyDeductions` para o mês.

**Rationale**: Segue o mesmo padrão de `inst1Total` / `inst2Total`. Os valores derivados
devem estar em `MonthCalc` para serem passados às componentes via props sem re-cálculo.

**Impact em fórmulas**:
- `saldoPeriodo15` = `inst1Salary − inst1Total + ded1Total` (era `inst1Salary − inst1Total`)
- `saldoPeriodo30` = `inst2Salary − inst2Total + ded2Total` (era `inst2Salary − inst2Total`)
- `totalFaturaLiquida`, `totalSubtracoes`, `subtotalFatura`, `percentComprometido`: sem mudança

---

## Decision 3: Componente DeductionSelector

**Decision**: Criar `src/components/DeductionSelector.tsx` baseado em `InstallmentSelector`
mas aceitando `deductions: Deduction[]` e `period: 1 | 2` em vez de `institutions` e
`installment`.

**Rationale**: O `InstallmentSelector` tem assinatura específica para `Institution` com
campos `name`, `abbreviation`, `payment_installment`. Criar um componente separado para
`Deduction` (campos `description`, `salary_period`) é mais claro e evita acoplamento.
Ambos usam a mesma técnica de `createPortal` + `position: fixed` + `anchorRect`.

---

## Decision 4: API — PATCH em /api/deductions/[id]

**Decision**: Adicionar handler `PATCH` em `src/app/api/deductions/[id]/route.ts` para
atualizar `salary_period`. Segue o padrão do PATCH de `institutions/[id]`.

**Rationale**: O endpoint já tem `DELETE`; adicionar `PATCH` é a extensão natural. O payload
aceita `{ salary_period: 1 | 2 | null }`.

---

## Decision 5: getSomaLabel em utils.ts

**Decision**: Adicionar função `getSomaLabel(period: 1 | 2, deductions)` em
`src/lib/utils.ts`, análoga a `getSubtraiLabel`. Usa `deduction.description` (sem campo
de abreviação em deductions).

**Rationale**: Reutiliza a lógica de formatação de lista em português já validada.
Fallback quando vazio: `"Soma —"` (igual a `"Subtrai —"`).
