# UI Contract: Linhas "Soma" em SalarySection

**Feature**: 004-salary-deduction-add | **Date**: 2026-05-20

## Novas props em SalarySection

```typescript
interface Props {
  institutions: Institution[];
  calculations: MonthCalc[];
  salaryConfigs: SalaryConfig[];
  deductions: Deduction[];                                          // NOVO
  monthlyDeductions: MonthlyDeduction[];                            // NOVO (para preview inline)
  onSalaryChange: (month, field, value) => void;
  onInstallmentAssign: (id, installment) => void;
  onSalaryPeriodAssign: (deductionId, period: 1 | 2 | null) => void; // NOVO
}
```

## Estrutura de linhas na seção (ordem)

```
Salário Parcela 1 (dia 15)      [editável]
Subtrai [instituições P1]       [clicável → InstallmentSelector]
Soma [subtrações P1]            [clicável → DeductionSelector]   ← NOVO
Saldo Período 15                [calculado: inst1Salary - inst1Total + ded1Total]

Salário Parcela 2 (dia 30)      [editável]
Subtrai [instituições P2]       [clicável → InstallmentSelector]
Soma [subtrações P2]            [clicável → DeductionSelector]   ← NOVO
Saldo Período 30                [calculado: inst2Salary - inst2Total + ded2Total]

SALÁRIO TOTAL
Total Fatura Líquida
Saldo Restante
% Comprometido do Salário
```

## Estados das linhas "Soma"

| Estado | Aparência |
|--------|-----------|
| Sem subtrações vinculadas | "Soma —" / valor R$ 0 ou — |
| 1 subtração vinculada | "Soma Parte Samuel" / valor somado |
| 2+ subtrações vinculadas | "Soma A e B" / valor total somado |
| Clique na linha | Abre `DeductionSelector` com checkboxes das subtrações |

## getSomaLabel

```typescript
getSomaLabel(period: 1 | 2, deductions: Deduction[]): string
// Filtra deductions com salary_period === period
// Mapeia para description
// Formata: "Soma —", "Soma A", "Soma A e B", "Soma A, B e C"
```

## PATCH /api/deductions/[id]

```
Body: { salary_period: 1 | 2 | null }
Behavior: findOneAndUpdate({ _id: id, owner }, { $set: { salary_period } }, { new: true })
```

## Mutation: onSalaryPeriodAssign (BillsApp.tsx)

```
onSalaryPeriodAssign(id, period):
  1. setDeductions(prev => prev.map(d => d.id === id ? {...d, salary_period: period} : d))
  2. PATCH /api/deductions/${id} { salary_period: period }
```
