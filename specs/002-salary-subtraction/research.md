# Research: Configuração de Subtrações no Salário

**Date**: 2026-05-20 | **Branch**: `002-salary-subtraction`

## Decision 1: payment_installment como nullable

**Decision**: Alterar `payment_installment` de `NOT NULL CHECK (1,2)` para `INTEGER CHECK
(payment_installment IN (1, 2)) NULL` na tabela `bills_institutions`.

**Rationale**: A spec requer que instituições possam não ter parcela atribuída (FR-007:
"instituições sem parcela NÃO DEVEM influenciar os cálculos de saldo por período"). O
schema atual força o valor 1 ou 2, impossibilitando essa condição. Tornar a coluna nullable
é a mudança mínima necessária.

**Impact em TypeScript**: `Institution.payment_installment` muda de `PaymentInstallment`
(type alias de `1 | 2`) para `PaymentInstallment | null`.

**Impact em cálculo**: `inst1Total` e `inst2Total` já filtram por `payment_installment === 1`
e `=== 2` respectivamente; com nullable, instituições com `null` simplesmente não entram
em nenhum dos dois filtros. Sem mudança na lógica de cálculo.

**Alternatives considered**:
- Adicionar flag `exclude_from_period boolean` — rejeitado por duplicar semântica já
  expressa pelo campo `payment_installment`.
- Valor sentinela (ex.: `payment_installment = 0`) — rejeitado por violar a constraint
  existente e ser menos expressivo que null.

---

## Decision 2: Campo abbreviation

**Decision**: Adicionar coluna `abbreviation TEXT NULL` à tabela `bills_institutions`.

**Rationale**: A planilha de referência usa abreviações ("MP" para Mercado Pago, "SC" para
Sams Club). A spec (FR-004, clarificação Q2) requer que o rótulo "Subtrai" use a abreviação
quando disponível. Campo opcional preserva retrocompatibilidade com dados existentes.

**Fallback**: Quando `abbreviation IS NULL`, usa-se `name` completo no rótulo.

**Alternatives considered**:
- Abreviação automática (iniciais) — rejeitada; as abreviações da planilha não são
  deriváveis das iniciais (ex.: "MP" não vem de "Mercado Pago" de forma inequívoca).
- Campo separado em nova tabela — rejeitado; é propriedade simples da instituição.

---

## Decision 3: UI de edição inline para InstallmentSelector

**Decision**: Criar componente `InstallmentSelector` que renderiza um dropdown com lista
de checkboxes das instituições. Ativado por clique na linha "Subtrai". Fecha ao clicar
fora (onBlur/clickaway). Usa `position: absolute` ancorado à linha.

**Rationale**: A spec (clarificação Q1) definiu edição inline sem modal. O app já tem o
padrão `EditableCell` para edição de valores simples; o `InstallmentSelector` segue a
mesma filosofia (clique ativa edição, blur/Enter salva) mas para seleção múltipla.

**Behavior**:
1. Usuário clica na linha "Subtrai Parcela 1"
2. `InstallmentSelector` abre abaixo da linha com lista de instituições
3. Instituições já atribuídas à Parcela 1 aparecem marcadas
4. Usuário marca/desmarca → estado local atualiza imediatamente (optimistic)
5. Ao fechar, persiste mudanças via `UPDATE bills_institutions SET payment_installment`
6. Instituição desmarcada de Parcela 1: `payment_installment = NULL` (ou = 2 se atribuída
   a Parcela 2 via interação com o seletor da Parcela 2)

**Alternatives considered**:
- Multi-select nativo HTML (`<select multiple>`) — rejeitado; UX inadequada para
  checkboxes visuais.
- Modal com confirmação — rejeitado pela spec (clarificação Q1 escolheu A = inline).

---

## Decision 4: Mutation para payment_installment

**Decision**: Adicionar `updateInstitutionInstallment(id, installment: 1 | 2 | null)` em
`BillsApp.tsx`. Usa `supabase.from('bills_institutions').update(...)` por `id`. Atualiza
`institutions` state otimisticamente antes do await.

**Rationale**: Segue o mesmo padrão de mutations existentes no `BillsApp.tsx`. Sem novo
service layer — Supabase é acessado diretamente conforme padrão do projeto.

---

## Decision 5: Migration SQL

**Decision**: Criar arquivo `supabase/migrations/001_nullable_installment_abbreviation.sql`
com:
```sql
ALTER TABLE bills_institutions
  ALTER COLUMN payment_installment DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS abbreviation TEXT;
```

O `CHECK` original é mantido (permite NULL pois a constraint só valida valores não-nulos
com a semântica padrão do PostgreSQL). Dados existentes não são afetados (todos têm
valores 1 ou 2).

**Alternatives considered**: Recriar a tabela — desnecessário; ALTER TABLE é suficiente e
não destrói dados.
