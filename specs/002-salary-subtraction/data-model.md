# Data Model: Configuração de Subtrações no Salário

**Date**: 2026-05-20 | **Branch**: `002-salary-subtraction`

## Schema Changes

### bills_institutions — alterações

| Coluna | Antes | Depois | Motivo |
|--------|-------|--------|--------|
| `payment_installment` | `INTEGER NOT NULL CHECK (1,2)` | `INTEGER NULL CHECK (1,2)` | Permitir instituição sem parcela atribuída |
| `abbreviation` | — (não existe) | `TEXT NULL` | Nome curto para rótulo "Subtrai" |

**Migration**: `supabase/migrations/001_nullable_installment_abbreviation.sql`

```sql
ALTER TABLE bills_institutions
  ALTER COLUMN payment_installment DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS abbreviation TEXT;
```

Nenhuma outra tabela é modificada. Nenhuma nova tabela é criada.

---

## TypeScript Types — src/lib/types.ts

### Institution (alterado)

```typescript
export interface Institution {
  id: string;
  name: string;
  due_day: number;
  payment_installment: PaymentInstallment | null;  // era: PaymentInstallment
  position: number;
  abbreviation: string | null;                      // novo campo
}
```

### PaymentInstallment (sem mudança)

```typescript
export type PaymentInstallment = 1 | 2;
```

### MonthCalc (sem mudança)

Os campos `inst1Total` e `inst2Total` continuam válidos — o filtro por
`payment_installment === 1` e `=== 2` naturalmente ignora `null`.

---

## Lógica de Cálculo — BillsApp.tsx (useMemo)

Nenhuma mudança necessária nas fórmulas. O filtro existente:

```typescript
inst1Total = invoices
  .filter(inv => institution.payment_installment === 1)
  .reduce(...)
```

...já exclui instituições com `payment_installment = null`. ✅

---

## Lógica do Rótulo "Subtrai" — SalarySection.tsx

Nova função utilitária (derivada do estado `institutions`):

```
getSubtraiLabel(installment: 1 | 2, institutions: Institution[]): string
  → filtra institutions com payment_installment === installment
  → mapeia cada uma para abbreviation ?? name
  → formata: "Subtrai A", "Subtrai A e B", "Subtrai A, B e C"
  → se vazio: "Subtrai —"
```

---

## Novo Componente — InstallmentSelector

**Arquivo**: `src/components/InstallmentSelector.tsx`

**Props**:
```typescript
interface InstallmentSelectorProps {
  installment: 1 | 2;
  institutions: Institution[];
  onAssign: (institutionId: string, installment: 1 | 2 | null) => void;
  onClose: () => void;
}
```

**Comportamento**:
- Lista todas as instituições
- Marca as que têm `payment_installment === installment`
- Toggle de checkbox: chama `onAssign(id, installment)` para marcar ou `onAssign(id, null)` para desmarcar
- Fecha ao clicar fora (evento `mousedown` no document)

---

## Relacionamentos (sem mudança estrutural)

```
bills_institutions (1) ──── (N) bills_monthly_invoices
```

O campo `payment_installment` é atributo da instituição, não das faturas mensais.
Mudar a parcela de uma instituição afeta todos os meses retroativamente nos cálculos
(comportamento esperado pela spec — Assumption: "global, não por mês/ano").
