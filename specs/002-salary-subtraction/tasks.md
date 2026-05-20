---
description: "Task list for 002-salary-subtraction"
---

# Tasks: Configuração de Subtrações no Salário

**Input**: Design documents from `/specs/002-salary-subtraction/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅

**Tests**: Não solicitados — validação manual via quickstart.md.

**Organization**: Tarefas agrupadas por user story para entrega incremental independente.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependências pendentes)
- **[Story]**: A qual user story pertence (US1, US2)

---

## Phase 1: Setup

**Purpose**: Criar o artefato de migração de banco de dados antes de qualquer mudança de código.

- [x] T001 Atualizar schema Mongoose em `src/lib/models/Institution.ts` — `payment_installment` nullable, adicionar campo `abbreviation`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Mudanças de tipo TypeScript que todas as user stories dependem.

**⚠️ CRÍTICO**: Nenhuma user story pode começar antes desta fase.

- [x] T002 Atualizar interface `Institution` em `src/lib/types.ts` — `payment_installment: PaymentInstallment | null` e adicionar campo `abbreviation: string | null`
- [x] T003 [P] Adicionar endpoint PATCH em `src/app/api/institutions/[id]/route.ts` para atualizar `payment_installment` e `abbreviation`

**Checkpoint**: Tipos TypeScript compilam com `payment_installment` nullable; migration aplicada no banco.

---

## Phase 3: User Story 1 — Atribuir Instituições às Parcelas (Priority: P1) 🎯 MVP

**Goal**: O usuário consegue clicar na linha "Subtrai" da seção de salário e escolher
quais instituições pertencem àquela parcela via seletor inline. Mudanças persistem no Supabase.

**Independent Test**: Clicar na linha "Subtrai Parcela 1", selecionar/desselecionar uma
instituição, fechar o seletor e verificar que a mudança persiste após recarregar a página.

### Implementation for User Story 1

- [x] T004 [P] [US1] Criar componente `src/components/InstallmentSelector.tsx` com props `installment`, `institutions`, `onAssign`, `onClose` — lista instituições como checkboxes, fecha ao clicar fora
- [x] T005 [US1] Adicionar mutation `handleInstallmentAssign` em `src/components/BillsApp.tsx` — atualização otimista + PATCH `/api/institutions/${id}`
- [x] T006 [P] [US1] Adicionar mutation `handleAbbreviationChange` em `src/components/BillsApp.tsx` — atualização otimista + PATCH `/api/institutions/${id}`
- [x] T007 [US1] Passar `onInstallmentAssign` como nova prop para `SalarySection` em `src/components/BillsApp.tsx`
- [x] T008 [US1] Integrar `InstallmentSelector` nas linhas "Subtrai" de `src/components/SalarySection.tsx` — estado `activeSelector: 1 | 2 | null`, clique abre seletor inline

**Checkpoint**: User Story 1 funcional e testável — `InstallmentSelector` abre inline,
persiste via Supabase, estado atualiza otimisticamente.

---

## Phase 4: User Story 2 — Rótulo Dinâmico da Linha "Subtrai" (Priority: P2)

**Goal**: A linha "Subtrai" exibe dinamicamente os nomes/abreviações das instituições
atribuídas, no formato "Subtrai A", "Subtrai A e B" ou "Subtrai A, B e C".

**Independent Test**: Atribuir três instituições à Parcela 1 (uma com abreviação definida)
e verificar que o rótulo exibe "Subtrai [abrev], [nome] e [nome]" sem recarregar.

### Implementation for User Story 2

- [x] T009 [P] [US2] Adicionar função `getSubtraiLabel(installment: 1 | 2, institutions)` em `src/lib/utils.ts` — filtra por payment_installment, mapeia para abbreviation ?? name, formata lista em português
- [x] T010 [US2] Atualizar rótulo das linhas "Subtrai" em `src/components/SalarySection.tsx` para chamar `getSubtraiLabel` dinamicamente
- [x] T011 [US2] Adicionar edição inline do campo `abbreviation` em `src/components/InvoicesTable.tsx` — botão hover abre input inline, blur/Enter salva via `onAbbreviationChange`

**Checkpoint**: Rótulos "Subtrai" dinâmicos e abreviações editáveis inline. User Stories
1 e 2 ambas testáveis independentemente.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Verificações finais de qualidade e validação funcional.

- [x] T012 [P] Executar `npm run lint` — 1 erro pré-existente em `BillsApp.tsx:43` (setState em useEffect, fora do escopo desta feature); nenhum erro introduzido por 002
- [x] T013 [P] Executar `npx tsc --noEmit` — 0 erros
- [ ] T014 Validar os 5 cenários de `specs/002-salary-subtraction/quickstart.md` com `npm run dev`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências — pode começar imediatamente
- **Foundational (Phase 2)**: Depende de Setup — BLOQUEIA todas as user stories
- **US1 (Phase 3)**: Depende de Foundational — pode começar após T002 + T003
- **US2 (Phase 4)**: Depende de US1 (T008 entrega SalarySection com suporte a institutions)
- **Polish (Phase 5)**: Depende de todas as user stories completas

### User Story Dependencies

- **US1 (P1)**: Pode começar após Foundational — independente de US2
- **US2 (P2)**: Pode começar após Foundational — T011 depende de T006 (US1)
  - T009 e T010 são independentes de US1 e podem rodar em paralelo com Phase 3

### Parallel Opportunities

```bash
# Phase 2 — rodar em paralelo:
Task: "Atualizar Institution em src/lib/types.ts"         # T002
Task: "Aplicar migration no Supabase SQL Editor"          # T003

# Phase 3 — rodar em paralelo:
Task: "Criar InstallmentSelector.tsx"                     # T004
Task: "Adicionar mutation updateInstitutionAbbreviation"  # T006

# Phase 5 — rodar em paralelo:
Task: "npm run lint"                                      # T012
Task: "npx tsc --noEmit"                                  # T013
```

---

## Implementation Strategy

### MVP First (User Story 1 apenas)

1. Completar Phase 1: Setup (T001)
2. Completar Phase 2: Foundational (T002, T003)
3. Completar Phase 3: US1 (T004–T008)
4. **PARAR e VALIDAR**: clicar na linha "Subtrai" e verificar persistência
5. Prosseguir para US2 se MVP aprovado

### Incremental Delivery

1. Setup + Foundational → banco e tipos prontos
2. US1 → seletor inline funciona, atribuição persiste ✅
3. US2 → rótulos dinâmicos e abreviações ✅
4. Polish → lint, tipos, validação completa ✅

---

## Notes

- [P] = arquivos diferentes, sem dependências pendentes
- T003 é passo manual (Supabase SQL Editor); não bloqueia T002
- T011 (abreviação em InvoicesTable) integra com spec 001-layout-update US2 quando implementada
- Todos os usos existentes de `payment_installment` precisam ser verificados após T002
  para garantir que tratam `null` (especialmente em `BillsApp.tsx` useMemo)
