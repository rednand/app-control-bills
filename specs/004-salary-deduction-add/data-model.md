# Data Model: Soma de Subtrações no Período do Salário

**Date**: 2026-05-20 | **Branch**: `004-salary-deduction-add`

## Schema Changes

### Deduction — alteração

| Campo | Antes | Depois | Motivo |
|-------|-------|--------|--------|
| `salary_period` | — | `Number NULL enum [1,2,null]` | Vincula subtração a um período do salário |

```typescript
salary_period: { type: Number, enum: [1, 2, null], default: null }
```

Nenhuma outra collection alterada. Nenhum índice novo necessário.

---

## TypeScript — src/lib/types.ts

### Deduction (alterado)

```typescript
export interface Deduction {
  id: string;
  description: string;
  position: number;
  salary_period: 1 | 2 | null;   // novo campo
}
```

### MonthCalc (alterado)

```typescript
export interface MonthCalc {
  month: number;
  subtotalFatura: number;
  totalSubtracoes: number;
  totalFaturaLiquida: number;
  inst1Salary: number;
  inst2Salary: number;
  salarioTotal: number;
  inst1Total: number;
  inst2Total: number;
  ded1Total: number;              // novo: soma das subtrações vinculadas ao período 1
  ded2Total: number;              // novo: soma das subtrações vinculadas ao período 2
  saldoPeriodo15: number;
  saldoPeriodo30: number;
  saldoRestante: number;
  percentComprometido: number;
}
```

---

## Lógica de Cálculo — BillsApp.tsx useMemo

```typescript
const ded1Total = deductions
  .filter(d => d.salary_period === 1)
  .reduce((sum, ded) => {
    const md = monthlyDeductions.find(m => m.deduction_id === ded.id && m.month === month);
    return sum + (md?.amount ?? 0);
  }, 0);

const ded2Total = deductions
  .filter(d => d.salary_period === 2)
  .reduce((sum, ded) => {
    const md = monthlyDeductions.find(m => m.deduction_id === ded.id && m.month === month);
    return sum + (md?.amount ?? 0);
  }, 0);

// Fórmulas atualizadas:
saldoPeriodo15: inst1Salary - inst1Total + ded1Total,   // era: inst1Salary - inst1Total
saldoPeriodo30: inst2Salary - inst2Total + ded2Total,   // era: inst2Salary - inst2Total
```

`totalFaturaLiquida`, `totalSubtracoes`, `subtotalFatura`, `saldoRestante` e
`percentComprometido` **não mudam**.

---

## Novo Componente — DeductionSelector

**Arquivo**: `src/components/DeductionSelector.tsx`

**Props**:
```typescript
interface Props {
  period: 1 | 2;
  deductions: Deduction[];
  onAssign: (deductionId: string, period: 1 | 2 | null) => void;
  onClose: () => void;
  anchorRect: DOMRect;
}
```

Renderiza via `createPortal` com `position: fixed` — idêntico ao `InstallmentSelector`.
Lista deductions com checkbox. Ao marcar: `onAssign(id, period)`. Ao desmarcar: `onAssign(id, null)`.
