# Tasks: Subtração Vinculada a Fatura Específica

**Input**: Design documents from `specs/005-deduction-invoice-link/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅

**Tests**: Não solicitados no spec. Validação via `npx tsc --noEmit`, `npm run lint` e inspeção manual no browser.

**Organization**: Tasks agrupadas por user story para entrega incremental e testável.

## Format: `[ID] [P?] [Story] Descrição`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependências)
- **[US1]**: User Story 1 — Vincular Subtração a Fatura
- **[US2]**: User Story 2 — Remoção de Vínculo de Instituição

---

## Phase 1: Setup

**Purpose**: Nenhuma configuração nova necessária — projeto já existente. Esta fase confirma o ponto de partida.

- [x] T001 Confirmar que `npm run dev` inicia sem erros e que a UI atual está funcionando (`http://localhost:3000`)

---

## Phase 2: Foundational (Data Layer — bloqueia todas as user stories)

**Purpose**: Atualizar o modelo de dados (`Deduction`) de `salary_period` para `institution_id`. Essas mudanças são pré-requisito para todos os cálculos e componentes UI.

**⚠️ CRÍTICO**: Nenhuma user story pode ser implementada antes desta fase estar completa.

- [x] T002 Atualizar interface `Deduction` em `src/lib/types.ts`: remover campo `salary_period: 1 | 2 | null`; adicionar `institution_id: string | null`
- [x] T003 Atualizar interface `MonthCalc` em `src/lib/types.ts`: remover campos `ded1Total` e `ded2Total`
- [x] T004 Atualizar Mongoose model em `src/lib/models/Deduction.ts`: remover `salary_period` do schema e da interface `IDeduction`; adicionar `institution_id: { type: String, default: null }`
- [x] T005 Atualizar PATCH handler em `src/app/api/deductions/[id]/route.ts`: ler `institution_id` do body em vez de `salary_period`; usar `$set: { institution_id: institution_id ?? null }`
- [x] T006 Verificar POST handler em `src/app/api/deductions/route.ts`: confirmar que `institution_id: null` está presente na resposta serializada
- [x] T007 Executar `npx tsc --noEmit` — corrigir todos os erros de tipo resultantes das mudanças T002/T003 (principalmente referências a `salary_period`, `ded1Total`, `ded2Total`)

**Checkpoint**: Tipos compilam sem erros. API aceita `institution_id`. Foundation pronta.

---

## Phase 3: User Story 1 — Vincular Subtração a Fatura (Priority: P1) 🎯 MVP

**Goal**: O usuário consegue vincular uma subtração a uma instituição específica; o valor dessa instituição na seção de salário já reflete a dedução.

**Independent Test**: Vincular "Parte Samuel" (com valor em algum mês) a ITAÚ. Verificar que o `inst1Total` ou `inst2Total` do mês correspondente diminui pelo valor de Samuel, e que o Saldo Período reflete o valor corrigido. O "Total Subtrações" e "Total Fatura Líquida" NÃO devem mudar.

### Implementation for User Story 1

- [x] T008 [US1] Atualizar `useMemo` em `src/components/BillsApp.tsx`: recalcular `inst1Total` como soma de `max(0, fatura_bruta(inst) − deduções_vinculadas(inst, mês))` para todas as institutions com `payment_installment === 1`; idem para `inst2Total`; simplificar `saldoPeriodo15 = inst1Salary − inst1Total` e `saldoPeriodo30 = inst2Salary − inst2Total`
- [x] T009 [US1] Adicionar handler `handleDeductionInstitutionAssign(deductionId: string, institutionId: string | null)` em `src/components/BillsApp.tsx`: atualiza `deductions` local otimisticamente; faz `PATCH /api/deductions/[deductionId]` com `{ institution_id: institutionId }`
- [x] T010 [US1] Criar componente `src/components/InstitutionPicker.tsx`: portal dropdown (mesmo padrão de `InstallmentSelector`); lista todas as institutions recebidas via prop; item "Nenhuma" no topo para remover vínculo (chama `onSelect(null)`); clique em uma institution chama `onSelect(institutionId)`; fecha ao clicar fora via `mousedown` listener; props: `{ institutions: Institution[], currentId: string | null, onSelect: (id: string | null) => void, onClose: () => void, anchorRect: DOMRect }`
- [x] T011 [P] [US1] Atualizar `src/components/DeductionsTable.tsx`: adicionar props `institutions: Institution[]` e `onDeductionInstitutionAssign: (id: string, institutionId: string | null) => void`; em cada linha de subtração, exibir o nome da institution vinculada (ou "—") como botão clicável ao lado da descrição; clique no botão abre `InstitutionPicker`; ao selecionar, chama `onDeductionInstitutionAssign`
- [x] T012 [P] [US1] Atualizar `src/components/BillsApp.tsx`: passar `institutions` e `onDeductionInstitutionAssign={handleDeductionInstitutionAssign}` para `<DeductionsTable>`
- [x] T013 [US1] Executar `npm run lint` e `npx tsc --noEmit` — corrigir quaisquer erros de tipo ou lint introduzidos nesta fase

**Checkpoint**: Vincular uma subtração a uma institution na tabela de subtrações; verificar no browser que o saldo do período é atualizado imediatamente. US1 funcionando.

---

## Phase 4: User Story 2 — Remoção de Vínculo (Priority: P2)

**Goal**: O usuário pode remover o vínculo entre uma subtração e uma fatura, voltando ao comportamento padrão.

**Independent Test**: Remover o vínculo de "Parte Samuel" da institution ITAÚ clicando no nome da institution e selecionando "Nenhuma". Verificar que o valor de ITAÚ volta ao valor bruto original e que o saldo do período reflete isso.

### Implementation for User Story 2

- [x] T014 [US2] Verificar que o item "Nenhuma" em `InstitutionPicker` chama `onSelect(null)` e que `handleDeductionInstitutionAssign` com `null` zera `institution_id` no estado local e persiste `null` na API
- [x] T015 [US2] Testar no browser: vincular subtração → verificar efeito → remover vínculo → verificar que fatura retorna ao valor bruto

**Checkpoint**: Vínculo pode ser adicionado e removido. US2 funcionando.

---

## Phase 5: Polish & Remoção de Código Morto

**Purpose**: Remover todos os artefatos da abordagem "Soma" (feature 004) que não têm mais uso.

- [x] T016 [P] Remover arquivo `src/components/DeductionSelector.tsx` (não tem mais consumidores)
- [x] T017 [P] Remover função `getSomaLabel` de `src/lib/utils.ts`
- [x] T018 [P] Atualizar `src/components/SalarySection.tsx`: remover props `deductions` e `onSalaryPeriodAssign`; remover as duas linhas `somaSlot` do array `rows`; remover estado `activeSomaSelector` e `somaAnchorRect`; remover import de `DeductionSelector` e `getSomaLabel`
- [x] T019 Atualizar `src/components/BillsApp.tsx`: remover handler `handleSalaryPeriodAssign`; remover props `deductions` e `onSalaryPeriodAssign` passadas para `<SalarySection>`
- [x] T020 Executar `npm run lint` e `npx tsc --noEmit` — zero erros e zero warnings
- [x] T021 Executar `npm run build` — build de produção deve completar sem erros

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Sem dependências — iniciar imediatamente
- **Phase 2 (Foundational)**: Depende da Phase 1 — BLOQUEIA todas as user stories
- **Phase 3 (US1)**: Depende da Phase 2 — MVP entregável
- **Phase 4 (US2)**: Depende da Phase 3 (InstitutionPicker já criado)
- **Phase 5 (Polish)**: Depende das Phases 3 e 4

### User Story Dependencies

- **US1 (P1)**: Inicia após Phase 2. Independente.
- **US2 (P2)**: Inicia após T010 (InstitutionPicker criado). Depende de US1.

### Within Each Phase

- T002 e T003 podem ser feitas em paralelo (mesmo arquivo, mas mudanças independentes dentro de `types.ts`)
- T004, T005, T006 podem ser feitas em paralelo (arquivos diferentes)
- T010, T011 podem ser feitas em paralelo (arquivos diferentes)
- T016, T017, T018 podem ser feitas em paralelo (arquivos diferentes)

---

## Parallel Example: Phase 2

```bash
# Pode rodar em paralelo:
Task T004: "Atualizar Mongoose model em src/lib/models/Deduction.ts"
Task T005: "Atualizar PATCH handler em src/app/api/deductions/[id]/route.ts"
Task T006: "Verificar POST handler em src/app/api/deductions/route.ts"
```

## Parallel Example: Phase 3

```bash
# Após T010 (InstitutionPicker criado):
Task T011: "Atualizar DeductionsTable.tsx"
Task T012: "Atualizar BillsApp.tsx props para DeductionsTable"
```

---

## Implementation Strategy

### MVP (User Story 1 — Phase 1+2+3)

1. Confirmar setup (T001)
2. Completar data layer (T002–T007)
3. Completar US1 (T008–T013)
4. **PARAR e VALIDAR**: vincular subtração a institution no browser; conferir cálculos

### Entrega Completa

1. MVP pronto → adicionar US2 (T014–T015) → testar remoção de vínculo
2. Polish (T016–T021) → remover DeductionSelector, getSomaLabel, somaSlot rows
3. Build passa → PR pronto

---

## Notes

- [P] = arquivos diferentes, sem dependências entre si
- Toda mudança de cálculo em `BillsApp.tsx` deve ser validada no browser com um caso real
- `DeductionSelector.tsx` só pode ser deletado APÓS `SalarySection.tsx` ter o import removido (T018 antes de T016, ou T016+T018 juntos)
- A migração de dados no MongoDB (`$unset salary_period`, `$set institution_id: null`) pode ser executada manualmente via Compass ou via a route `/api/migrate` existente — não está nas tasks pois é operação one-time de produção
