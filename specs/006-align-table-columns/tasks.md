# Tasks: Alinhamento das Colunas entre Tabelas

**Input**: Design documents from `specs/006-align-table-columns/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅

**Tests**: Não solicitados. Validação via `npx tsc --noEmit`, `npm run lint`,
`npm run build` e inspeção visual no browser.

**Organization**: Tasks agrupadas por user story.

## Format: `[ID] [P?] [Story] Descrição`

- **[P]**: Pode rodar em paralelo (arquivos diferentes)
- **[US1]**: Colunas de mês alinhadas verticalmente
- **[US2]**: Indicador de fatura inline em Subtrações

---

## Phase 1: Setup

- [x] T001 Confirmar estado atual: abrir `http://localhost:3000` e observar o desalinhamento das colunas de mês entre as três seções

---

## Phase 2: Foundational

**Purpose**: Não há pré-requisitos bloqueantes — as duas user stories são independentes.
Nenhum pré-requisito de dados ou de outros componentes.

---

## Phase 3: User Story 1 — Colunas de Mês Alinhadas (Priority: P1) 🎯 MVP

**Goal**: A coluna de rótulo sticky de todas as três seções passa a ter `min-w-[260px]`,
fazendo as colunas de mês Jan–Dez se alinharem verticalmente na página.

**Independent Test**: Após a mudança, a distância da borda esquerda até a
coluna "Jan" é idêntica nas três seções ao inspecionar o DOM ou medir visualmente.

### Implementation for User Story 1

- [x] T002 [P] [US1] Alterar `min-w-[180px]` → `min-w-[260px]` na `<th>` sticky (header) em `src/components/InvoicesTable.tsx` (linha com `bg-slate-800 text-left px-4 py-3 font-semibold`)
- [x] T003 [P] [US1] Alterar `min-w-[180px]` → `min-w-[260px]` na `<th>` sticky (header) em `src/components/DeductionsTable.tsx` (linha com `bg-slate-600 text-left px-4 py-3 font-semibold`)
- [x] T004 [US1] Verificar que `src/components/SalarySection.tsx` já usa `min-w-[260px]` na `<th>` sticky — sem alteração necessária (confirmação)
- [x] T005 [US1] Executar `npx tsc --noEmit` e `npm run lint` — zero erros

**Checkpoint**: Abrir o browser e confirmar que Jan em Controle de Faturas,
Subtrações e Salário e Comprometimento estão visualmente alinhados. US1 concluída.

---

## Phase 4: User Story 2 — Indicador de Fatura Inline (Priority: P2)

**Goal**: A coluna "FATURA" separada em Subtrações é removida. O nome da
instituição vinculada (ou o botão "+ vincular fatura") aparece inline dentro
da célula de descrição da subtração, preservando o `InstitutionPicker`.

**Independent Test**: A tabela de Subtrações não tem mais a coluna "FATURA".
Clicar na área de instituição dentro de uma célula de descrição abre o picker.
Vincular ou desvincular uma instituição continua funcionando.

### Implementation for User Story 2

- [x] T006 [US2] Em `src/components/DeductionsTable.tsx`: remover o `<th>` com texto "FATURA" e classe `min-w-[110px]` do cabeçalho da tabela
- [x] T007 [US2] Em `src/components/DeductionsTable.tsx`: remover o `<td>` da coluna FATURA de cada linha de subtração (o bloco que contém o `<button>` com `getInstitutionName` e o `<InstitutionPicker>` renderizado condicionalmente)
- [x] T008 [US2] Em `src/components/DeductionsTable.tsx`: dentro da `<td>` sticky de descrição de cada subtração, adicionar o indicador de instituição inline logo abaixo da linha do nome + botão excluir — se `ded.institution_id` existe: botão com classe `text-[10px] text-slate-400 hover:text-slate-600 text-left` exibindo o nome da instituição; se não existe: botão com classe `text-[10px] text-slate-300 hover:text-slate-500 text-left` com texto `+ vincular fatura`; ambos abrem `InstitutionPicker` ao clicar (reusar `activePicker`/`pickerAnchor` já existentes, mover a lógica de renderização do picker para esta célula)
- [x] T009 [US2] Em `src/components/DeductionsTable.tsx`: ajustar `colSpan` do formulário de adição de subtração (linha `<tr>` de adição): de `colSpan={14}` para `colSpan={13}` (uma coluna a menos após remover FATURA)
- [x] T010 [US2] Em `src/components/DeductionsTable.tsx`: verificar e ajustar o footer "TOTAL SUBTRAÇÕES" — confirmar que o número de `<td>` corresponde ao número de colunas restantes (sem a coluna FATURA)
- [x] T011 [US2] Executar `npx tsc --noEmit` e `npm run lint` — zero erros

**Checkpoint**: Tabela de Subtrações sem coluna FATURA; indicador de
instituição inline; picker funciona; US2 concluída.

---

## Phase 5: Polish & Validação Final

- [x] T012 Executar `npm run build` — build de produção passa sem erros
- [x] T013 Validação visual no browser: colunas Jan–Dez alinhadas nas três seções; no DevTools 375px as seções scrollam horizontalmente sem overflow; InstitutionPicker abre ao clicar na área de instituição inline

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Sem dependências
- **Phase 2 (Foundational)**: N/A — sem pré-requisitos
- **Phase 3 (US1)**: T002 e T003 são independentes entre si (arquivos diferentes)
- **Phase 4 (US2)**: Depende de T003 (DeductionsTable já com min-w-[260px])
- **Phase 5 (Polish)**: Depende de US1 e US2 completas

### User Story Dependencies

- **US1 (P1)**: Pode iniciar imediatamente
- **US2 (P2)**: Pode iniciar após T003 (ou em paralelo com T002)

### Parallel Opportunities

- T002 e T003 podem rodar em paralelo (arquivos diferentes: InvoicesTable e DeductionsTable)
- T005 deve rodar após T002 e T003

---

## Parallel Example: Phase 3

```
# Rodar em paralelo:
Task T002: InvoicesTable.tsx — min-w-[260px]
Task T003: DeductionsTable.tsx — min-w-[260px]
```

---

## Implementation Strategy

### MVP (User Story 1 — Phase 3)

1. Confirmar estado atual (T001)
2. Alterar largura em InvoicesTable e DeductionsTable (T002+T003)
3. Confirmar SalarySection (T004)
4. Lint + tsc (T005)
5. **VALIDAR no browser** — colunas alinhadas

### Entrega Completa

1. MVP pronto → US2 (T006–T011) → remover coluna FATURA e indicador inline
2. Build final (T012) → validação visual (T013)

---

## Notes

- [P] = arquivos diferentes, sem dependências entre si
- US1 é o MVP — já resolve o problema principal de alinhamento
- US2 é necessária para o alinhamento ser perfeito (a coluna FATURA adicionava 110px extras)
- `SalarySection.tsx` não requer nenhuma mudança de largura
