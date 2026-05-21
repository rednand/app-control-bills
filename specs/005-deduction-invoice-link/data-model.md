# Data Model: Subtração Vinculada a Fatura Específica

## Entidades Modificadas

### Deduction (`src/lib/models/Deduction.ts`)

| Campo | Tipo | Mudança |
|-------|------|---------|
| `description` | `string` | sem alteração |
| `position` | `number` | sem alteração |
| `owner` | `string` | sem alteração |
| ~~`salary_period`~~ | ~~`1 \| 2 \| null`~~ | **REMOVIDO** |
| `institution_id` | `string \| null` | **ADICIONADO** — referência ao `_id` de uma Institution, ou null se sem vínculo |

**Index**: sem alteração (`owner` permanece indexado; `institution_id` não precisa de índice próprio — a consulta é feita no lado cliente via `useMemo`).

### TypeScript Interface (`src/lib/types.ts`)

```ts
// ANTES
export interface Deduction {
  id: string;
  description: string;
  position: number;
  salary_period: 1 | 2 | null;
}

// DEPOIS
export interface Deduction {
  id: string;
  description: string;
  position: number;
  institution_id: string | null;
}
```

### MonthCalc (`src/lib/types.ts`)

| Campo | Mudança |
|-------|---------|
| ~~`ded1Total`~~ | **REMOVIDO** |
| ~~`ded2Total`~~ | **REMOVIDO** |
| `inst1Total` | Significado alterado: agora é o valor ajustado (bruto − deduções vinculadas) |
| `inst2Total` | Idem para período 2 |
| `saldoPeriodo15` | Fórmula simplificada: `inst1Salary − inst1Total` |
| `saldoPeriodo30` | Fórmula simplificada: `inst2Salary − inst2Total` |

## Cálculo Atualizado (useMemo em BillsApp)

```
Para cada mês:
  inst1Total = Σ max(0, fatura_bruta(inst) − Σ deduções_vinculadas(inst, mês))
               para todas as inst com payment_installment = 1

  inst2Total = Σ max(0, fatura_bruta(inst) − Σ deduções_vinculadas(inst, mês))
               para todas as inst com payment_installment = 2

  saldoPeriodo15 = inst1Salary − inst1Total
  saldoPeriodo30 = inst2Salary − inst2Total

  (totalSubtracoes, totalFaturaLiquida, saldoRestante, percentComprometido: sem alteração)
```

## Entidades Não Alteradas

- `Institution` — sem mudança de schema
- `MonthlyInvoice` — sem mudança
- `MonthlyDeduction` — sem mudança
- `SalaryConfig` — sem mudança

## Migração de Dados

Ao fazer deploy, executar update no MongoDB:
```
bills_deductions.updateMany({}, { $unset: { salary_period: "" }, $set: { institution_id: null } })
```

Isso remove o campo `salary_period` de todos os documentos existentes e inicializa `institution_id` como null.
