# UI Contract: SalarySection

**Feature**: 002-salary-subtraction | **Date**: 2026-05-20

## Componente: SalarySection

### Props atuais (sem mudança de interface)

```typescript
interface SalarySectionProps {
  months: number[];
  calcs: MonthCalc[];
  salaryConfigs: SalaryConfig[];
  onSalaryChange: (month: number, installment: 1 | 2, value: number) => void;
}
```

### Novas props necessárias

```typescript
interface SalarySectionProps {
  months: number[];
  calcs: MonthCalc[];
  salaryConfigs: SalaryConfig[];
  institutions: Institution[];                                        // NOVO
  onSalaryChange: (month: number, installment: 1 | 2, value: number) => void;
  onInstallmentAssign: (id: string, installment: 1 | 2 | null) => void; // NOVO
}
```

### Linha "Subtrai Parcela 1" — comportamento esperado

| Estado | Aparência |
|--------|-----------|
| Nenhuma instituição atribuída | Rótulo: "Subtrai —" \| Valor: R$ 0,00 para todos os meses |
| 1 instituição (ex.: ITAU) | Rótulo: "Subtrai ITAU" |
| 2 instituições (ex.: ITAU, NUBANK) | Rótulo: "Subtrai ITAU e NUBANK" |
| 3+ instituições | Rótulo: "Subtrai ITAU, NUBANK e SC" |
| Clique na linha | Abre `InstallmentSelector` inline para Parcela 1 |

### Linha "Subtrai Parcela 2" — mesmo comportamento para `payment_installment === 2`

---

## Componente: InstallmentSelector

**Arquivo**: `src/components/InstallmentSelector.tsx`

### Props

```typescript
interface InstallmentSelectorProps {
  installment: 1 | 2;
  institutions: Institution[];
  onAssign: (institutionId: string, installment: 1 | 2 | null) => void;
  onClose: () => void;
}
```

### Estados esperados

| Cenário | Comportamento |
|---------|--------------|
| Instituição marcada (já atribuída) | Checkbox checked; clique → `onAssign(id, null)` |
| Instituição desmarcada | Checkbox unchecked; clique → `onAssign(id, installment)` |
| Clique fora do seletor | `onClose()` chamado |
| Lista vazia (sem instituições) | Mensagem "Nenhuma instituição cadastrada" |

### Regra de exclusividade

Quando o usuário atribui uma instituição à Parcela 1 via `InstallmentSelector` da Parcela 1,
e essa instituição estava na Parcela 2, `BillsApp.tsx` DEVE emitir um único `UPDATE`
definindo `payment_installment = 1`. A exclusividade é garantida pelo campo único
(uma instituição tem um único `payment_installment`).

---

## Mutation: onInstallmentAssign (BillsApp.tsx)

```
onInstallmentAssign(id: string, installment: 1 | 2 | null):
  1. Atualiza institutions state otimisticamente (map → substitui payment_installment)
  2. await supabase.from('bills_institutions').update({ payment_installment: installment }).eq('id', id)
  3. Em caso de erro: reverte state, exibe erro
```
