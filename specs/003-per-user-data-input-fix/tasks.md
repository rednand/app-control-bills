---
description: "Task list for 003-per-user-data-input-fix"
---

# Tasks: Isolamento de Dados por Usuário + Correção de Inputs

**Input**: Design documents from `/specs/003-per-user-data-input-fix/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅

**Tests**: Não solicitados — validação manual via quickstart.md.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependências pendentes)
- **[Story]**: A qual user story pertence (US1, US2)

---

## Phase 1: Setup

Nenhuma tarefa de setup — projeto já inicializado.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Adicionar campo `owner` a todos os Mongoose models antes de qualquer rota ser atualizada.

**⚠️ CRÍTICO**: Nenhuma user story pode começar antes desta fase estar completa.

- [x] T001 [P] Adicionar `owner: { type: String, required: true, index: true }` ao schema em `src/lib/models/Institution.ts` e à interface `IInstitution`
- [x] T002 [P] Adicionar `owner: { type: String, required: true, index: true }` ao schema em `src/lib/models/Invoice.ts` e à interface `IInvoice`
- [x] T003 [P] Adicionar `owner: { type: String, required: true, index: true }` ao schema em `src/lib/models/Deduction.ts` e à interface `IDeduction`
- [x] T004 [P] Adicionar `owner: { type: String, required: true, index: true }` ao schema em `src/lib/models/MonthlyDeduction.ts` e à interface `IMonthlyDeduction`
- [x] T005 Adicionar `owner` ao schema de `src/lib/models/SalaryConfig.ts` e atualizar o índice único de `{ month: 1, year: 1 }` para `{ month: 1, year: 1, owner: 1 }`

**Checkpoint**: Todos os 5 models compilam com o campo `owner: String required`. `npx tsc --noEmit` não reporta erros nos models.

---

## Phase 3: User Story 1 — Isolamento de Dados por Conta Google (Priority: P1) 🎯 MVP

**Goal**: Cada usuário autenticado vê apenas os próprios dados. Operações de escrita associam o registro ao e-mail do usuário logado.

**Independent Test**: Logar com Conta A, adicionar instituição. Logar com Conta B. Verificar que a instituição da Conta A não aparece.

### Implementation for User Story 1

- [x] T006 [US1] Atualizar `src/app/api/data/route.ts` — filtrar todas as collections por owner
- [x] T007 [P] [US1] Atualizar `src/app/api/institutions/route.ts` — POST inclui owner
- [x] T008 [P] [US1] Atualizar `src/app/api/institutions/[id]/route.ts` — DELETE e PATCH com owner
- [x] T009 [P] [US1] Atualizar `src/app/api/invoices/route.ts` — filtro e $set com owner
- [x] T010 [P] [US1] Atualizar `src/app/api/deductions/route.ts` — POST inclui owner
- [x] T011 [P] [US1] Atualizar `src/app/api/deductions/[id]/route.ts` — DELETE com owner
- [x] T012 [P] [US1] Atualizar `src/app/api/monthly-deductions/route.ts` — filtro e $set com owner
- [x] T013 [P] [US1] Atualizar `src/app/api/salary/route.ts` — filtro e $set com owner
- [x] T019 [US1] Criar `src/app/api/migrate/route.ts` — POST migra documentos sem owner (FR-007)
- [x] Atualizar `src/app/api/seed/route.ts` — incluir `owner: seedOwner` em todos os insertMany

**Checkpoint**: User Story 1 totalmente funcional — dados isolados por conta Google.

---

## Phase 4: User Story 2 — Inputs Visíveis no Formulário de Adição (Priority: P2)

**Goal**: Campos de input nos formulários de adição têm bordas claramente visíveis sobre o fundo azul claro.

**Independent Test**: Clicar em "+ Adicionar" na seção "Controle de Faturas" e verificar que os inputs têm bordas cinzas visíveis.

### Implementation for User Story 2

- [x] T014 [P] [US2] Atualizar `src/components/InvoicesTable.tsx` — substituir `border border-blue-300` por `border border-slate-300`
- [x] T015 [P] [US2] Atualizar `src/components/DeductionsTable.tsx` — substituir `border border-blue-300` por `border border-slate-300`

**Checkpoint**: Bordas dos inputs visíveis em ambos os formulários de adição.

---

## Phase 5: Polish & Cross-Cutting Concerns

- [x] T016 [P] Executar `npm run lint` — 0 erros novos; 1 erro pré-existente em BillsApp.tsx:43
- [x] T017 [P] Executar `npx tsc --noEmit` — 0 erros
- [ ] T018 Validar os 5 cenários de `specs/003-per-user-data-input-fix/quickstart.md` com `npm run dev` e dois logins Google distintos

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: T001–T005 podem rodar em paralelo entre si — BLOQUEIA US1
- **US1 (Phase 3)**: Depende de todos T001–T005; T006 deve vir antes de T007–T013 (T006 testa o fluxo completo)
- **US2 (Phase 4)**: Independente de US1 — pode começar imediatamente após Phase 2
- **Polish (Phase 5)**: Depende de US1 e US2 completos

### Parallel Opportunities

```bash
# Phase 2 — todos em paralelo:
T001 (Institution.ts) | T002 (Invoice.ts) | T003 (Deduction.ts) | T004 (MonthlyDeduction.ts)
T005 (SalaryConfig.ts) — sequencial por cautela com mudança de índice

# Phase 3 — após T006:
T007 (institutions POST) | T008 (institutions [id]) | T009 (invoices PUT)
T010 (deductions POST)   | T011 (deductions [id])   | T012 (monthly-deductions PUT)
T013 (salary PUT)

# Phase 4 — em paralelo entre si e com Phase 3:
T014 (InvoicesTable) | T015 (DeductionsTable)

# Phase 5 — em paralelo:
T016 (lint) | T017 (tsc)
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Completar Phase 2 (T001–T005)
2. Completar Phase 3 (T006–T013)
3. **PARAR e VALIDAR**: logar com duas contas e confirmar isolamento
4. Prosseguir para US2 se MVP aprovado

### Incremental Delivery

1. Foundational → models com owner prontos
2. US1 → dados isolados por conta ✅
3. US2 → bordas dos inputs corrigidas ✅
4. Polish → lint, tipos, validação completa ✅

---

## Notes

- [P] = arquivos diferentes, sem dependências pendentes
- T005 (SalaryConfig) deve ser feito com cuidado — a mudança do índice único pode exigir `db.bills_salary_config.dropIndex(...)` manualmente no MongoDB Atlas em desenvolvimento
- T006 é o primeiro a ser executado em US1 pois é o ponto central de leitura — valida o fluxo de dados completo
- Os campos `owner` em Invoice e MonthlyDeduction são redundantes em termos de segurança (filtro indireto já funciona via institution_id/deduction_id), mas foram incluídos para simplicidade de queries futuras
