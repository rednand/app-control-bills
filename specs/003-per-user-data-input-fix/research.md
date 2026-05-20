# Research: Isolamento de Dados por Usuário + Correção de Inputs

**Date**: 2026-05-20 | **Branch**: `003-per-user-data-input-fix`

## Decision 1: Identificador do usuário

**Decision**: Usar `session.user.email` (string) como campo `owner` em todos os documents.

**Rationale**: O e-mail Google é único, imutável para fins práticos, e já está disponível
via `getServerSession(authOptions)` em todas as rotas. Não requer mudança em `authOptions`.

**Alternatives considered**:
- `session.user.id` — não disponível por padrão no next-auth com Google sem configuração
  adicional de callbacks. Rejeitado para evitar complexidade.
- Sub do Google (JWT `sub`) — disponível via callback JWT, mas requer configuração extra.
  Rejeitado pela mesma razão.

---

## Decision 2: Estratégia de adição do campo owner

**Decision**: Adicionar `owner: { type: String, required: true, index: true }` a todos os
5 models. Todas as queries filtram por `{ owner }`. Todas as mutations (create/upsert)
incluem `{ owner }`.

**Rationale**: A adição em todos os models permite queries simples e diretas sem joins.
Para `Invoice` e `MonthlyDeduction`, o `owner` é redundante (já implícito via
`institution_id` / `deduction_id` scoped), mas simplifica enormemente as queries e
elimina a necessidade de joins entre collections.

**Alternatives considered**:
- Adicionar `owner` apenas em Institution, Deduction e SalaryConfig — rejeitado porque
  queries em Invoice/MonthlyDeduction precisariam de lookups na institution/deduction para
  filtrar por owner, aumentando complexidade.

---

## Decision 3: Índice único de SalaryConfig

**Decision**: Substituir `{ month, year }` por `{ month, year, owner }` como índice único
em `SalaryConfig`.

**Rationale**: Com múltiplos usuários, dois users podem ter SalaryConfig para o mesmo
mês/ano. O índice global `{ month, year }` causaria conflito na criação. O novo índice
permite um SalaryConfig por `(month, year, owner)`.

**Impact**: A operação `findOneAndUpdate` com `upsert: true` na rota `/api/salary` deve
incluir `owner` no filtro para funcionar corretamente.

**Alternatives considered**: Nenhuma — mudança obrigatória para garantir integridade (FR-001, FR-004).

---

## Decision 4: Índices de Invoice e MonthlyDeduction

**Decision**: Manter os índices existentes sem mudança:
- `Invoice`: `{ institution_id, month, year }` — único porque `institution_id` é um
  ObjectId único (gerado por MongoDB), naturalmente scoped ao usuário que criou a institution.
- `MonthlyDeduction`: `{ deduction_id, month, year }` — mesmo raciocínio.

**Rationale**: Não há risco de colisão entre usuários nesses índices porque os ObjectIds
de institutions e deductions são gerados no momento da criação e são únicos globalmente.

---

## Decision 5: Helper de owner nas rotas

**Decision**: Extrair o owner em cada rota diretamente de `session.user?.email`. Sem
helper ou middleware centralizado.

**Rationale**: São 8 rotas no total. O padrão é simples: `const owner = session.user?.email!`.
Criar um middleware/helper introduziria abstração desnecessária para um app single-user
(Princípio V — No Dead Code).

**Alternatives considered**: Next.js middleware route para injetar owner — rejeitado por
ser excessivo para a escala do projeto.

---

## Decision 6: CSS fix para inputs

**Decision**: Substituir `border-blue-300` por `border-slate-300` nos inputs dos
formulários de adição em `InvoicesTable.tsx` e `DeductionsTable.tsx`.

**Rationale**: `border-blue-300` sobre fundo `bg-blue-50` tem contraste insuficiente
(cores muito próximas na paleta Tailwind). `border-slate-300` é neutro e visível sobre
qualquer fundo claro. O estado de foco permanece `focus:border-blue-500` para feedback
de interação.

**Alternatives considered**:
- `border-blue-500` (mais escuro na mesma família) — funciona mas rompe a coerência visual
  ao misturar estado normal com intensidade de foco.
- `ring` em vez de `border` — desnecessário, apenas mudar a cor resolve.
