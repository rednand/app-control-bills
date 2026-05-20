---
description: "Task list for 004-salary-deduction-add"
---

# Tasks: Soma de Subtrações no Período do Salário

**Input**: Design documents from `/specs/004-salary-deduction-add/`

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

**Purpose**: Alterações de model e tipos que bloqueiam todas as user stories.

**⚠️ CRÍTICO**: Nenhuma user story pode começar antes desta fase.

- [x] T001 Adicionar `salary_period` ao schema e à interface `IDeduction` em `src/lib/models/Deduction.ts`
- [x] T002 Atualizar `src/lib/types.ts` — `salary_period` em `Deduction`; `ded1Total`, `ded2Total` em `MonthCalc`
- [x] T003 [P] Adicionar handler PATCH em `src/app/api/deductions/[id]/route.ts`
- [x] T004 [P] Atualizar lean type de Deduction em `src/app/api/data/route.ts`

**Checkpoint**: Models e tipos compilam sem erro. `npx tsc --noEmit` sem erros.

---

## Phase 3: User Story 1 — Associar Subtração a Período e Calcular Soma (Priority: P1) 🎯 MVP

**Goal**: O usuário consegue clicar na linha "Soma" da seção de salário, selecionar
subtrações via seletor inline, e o Saldo do período inclui os valores somados.

**Independent Test**: Vincular "Parte Samuel" ao Período 1. Verificar que o Saldo Período 15
aumenta em R$ 390 (valor de Samuel em abril) e que o Total Fatura Líquida não muda.

### Implementation for User Story 1

- [x] T005 [P] [US1] Adicionar `getSomaLabel` em `src/lib/utils.ts`
- [x] T006 [P] [US1] Criar `src/components/DeductionSelector.tsx` com createPortal + position fixed
- [x] T007 [US1] Adicionar mutation `handleSalaryPeriodAssign` em `src/components/BillsApp.tsx`
- [x] T008 [US1] Atualizar `useMemo` em `src/components/BillsApp.tsx` — ded1Total, ded2Total, saldoPeriodo15/30 atualizados
- [x] T009 [US1] Passar deductions e onSalaryPeriodAssign como props para SalarySection
- [x] T010 [US1] Adicionar linhas "Soma" em `src/components/SalarySection.tsx` com DeductionSelector

**Checkpoint**: User Story 1 funcional — linha "Soma" aparece, seletor abre, cálculo atualiza.

---

## Phase 4: User Story 2 — Rótulo Dinâmico da Linha "Soma" (Priority: P2)

**Goal**: Rótulo da linha "Soma" exibe dinamicamente as descrições das subtrações vinculadas.

**Note**: US2 é implementada como parte de T005 (getSomaLabel) e T010 (uso do rótulo na linha).
Não requer tarefas adicionais além do checkpoint de validação.

**Checkpoint**: Vincular 3 subtrações ao Período 1 e verificar rótulo "Soma A, B e C".

---

## Phase 5: Polish & Cross-Cutting Concerns

- [x] T011 [P] Executar `npx tsc --noEmit` — 0 erros
- [x] T012 [P] Executar `npm run lint` — 0 erros novos (pré-existente BillsApp.tsx:43 permanece)
- [ ] T013 Validar os 5 cenários de `specs/004-salary-deduction-add/quickstart.md` com `npm run dev`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: T001-T004 — T001 e T002 sequenciais (mesmo arquivo base); T003 e T004 paralelos
- **US1 (Phase 3)**: Depende de toda a Phase 2; T005 e T006 paralelos; T007 e T008 paralelos; T009 depende de T007+T008; T010 depende de T005+T006+T009
- **US2 (Phase 4)**: Coberta por T005 + T010 — sem tarefas adicionais
- **Polish (Phase 5)**: Depende de Phase 3 completa

### Parallel Opportunities

```bash
# Phase 2:
T001 (Deduction model) → T002 (types.ts) → sequencial

# Após T001+T002:
T003 (deductions/[id] PATCH) | T004 (data/route lean type)

# Phase 3:
T005 (getSomaLabel) | T006 (DeductionSelector)
T007 (handleSalaryPeriodAssign) | T008 (useMemo update)
# Após T005+T006+T007+T008:
T009 → T010

# Phase 5:
T011 (tsc) | T012 (lint)
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Completar Phase 2 (T001–T004)
2. Completar Phase 3 (T005–T010)
3. **PARAR e VALIDAR**: clicar em "Soma", verificar cálculo e rótulo
4. Prosseguir para Polish

### US2 Note

US2 (rótulo dinâmico) é automaticamente coberta pela implementação de US1 — `getSomaLabel`
(T005) e seu uso em T010 implementam o rótulo dinâmico diretamente.

---

## Notes

- [P] = arquivos diferentes, sem dependências pendentes
- T008 requer que T002 esteja completo (MonthCalc com ded1Total/ded2Total)
- `DeductionSelector` em T006 deve usar `createPortal(document.body)` — mesmo padrão do `InstallmentSelector` para evitar clipping por overflow-hidden
- Subtrações com `salary_period === undefined` (documentos antigos sem o campo) são tratadas como `null` pelo filtro `salary_period === 1/2`
