# Tasks: Experiência Mobile Focada no Mês

**Input**: Design documents from `/specs/008-mobile-current-month/`

**Prerequisites**: plan.md, spec.md, research.md, quickstart.md

**Organization**: Tasks agrupadas por user story para implementação e teste independentes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência entre si)
- **[Story]**: User story a que pertence (US1–US5, US6 para novo fix)
- Caminhos de arquivo exatos em cada descrição

---

## Phase 2: Foundational — Limpeza do Código Anterior ✅ COMPLETO

- [x] T001 [P] Remover lógica de auto-scroll do `useEffect` em `src/components/BillsApp.tsx`
- [x] T002 [P] Remover o atributo `data-current-month` dos `<th>` de mês em `src/components/InvoicesTable.tsx`
- [x] T003 [P] Remover o atributo `data-current-month` dos `<th>` de mês em `src/components/DeductionsTable.tsx`
- [x] T004 [P] Remover o atributo `data-current-month` dos `<th>` de mês em `src/components/SalarySection.tsx`

---

## Phase 3: User Story 1 — Layout Mobile Dedicado (Priority: P1) ✅ COMPLETO

**Goal**: No mobile (< 768px), exibir os dados de um único mês por vez em cards verticais com navegação prev/next, edição inline via EditableCell, e delete de itens.

**Independent Test**: DevTools → iPhone 14 (390px). Cards verticais aparecem, mês atual selecionado, EditableCell funciona, ‹/› navegam.

- [x] T005 [US1] Criar `src/components/MobileMonthView.tsx` com esqueleto: estado, navegação, header
- [x] T006 [US1] Adicionar seção "CONTROLE DE FATURAS" em `src/components/MobileMonthView.tsx`
- [x] T007 [US1] Adicionar seção "SUBTRAÇÕES" em `src/components/MobileMonthView.tsx`
- [x] T008 [US1] Adicionar seção "SALÁRIO" em `src/components/MobileMonthView.tsx`
- [x] T009 [US1] Adicionar seção "RESUMO" (read-only) em `src/components/MobileMonthView.tsx`
- [x] T010 [US1] Integrar `MobileMonthView` em `src/components/BillsApp.tsx` com `hidden md:block` / `md:hidden`

---

## Phase 4: User Story 2 — Adição de Dados no Mobile (Priority: P2) ✅ COMPLETO

**Goal**: O usuário consegue adicionar novas instituições e subtrações diretamente na visão mobile.

- [x] T011 [US2] Adicionar formulário de nova instituição à seção CONTROLE DE FATURAS em `src/components/MobileMonthView.tsx`
- [x] T012 [US2] Adicionar formulário de nova subtração à seção SUBTRAÇÕES em `src/components/MobileMonthView.tsx`

---

## Phase 5: User Story 3 — Destaque Visual no Desktop (Priority: P3) ✅ COMPLETO

**Goal**: No desktop (≥ 768px), a coluna do mês atual tem cabeçalho azul e células com fundo levemente azulado.

- [x] T013 [P] [US3] Confirmar highlight em `src/components/InvoicesTable.tsx`
- [x] T014 [P] [US3] Confirmar highlight em `src/components/DeductionsTable.tsx`
- [x] T015 [P] [US3] Confirmar highlight em `src/components/SalarySection.tsx`

---

## Phase 6: User Story 4 — Vincular Subtração a Fatura no Mobile (Priority: P1 fix) ✅ COMPLETO

**Goal**: Restaurar o botão de vínculo subtração→instituição que existia no desktop mas foi omitido do MobileMonthView. Regressão crítica que afeta os cálculos de `inst1Total`/`inst2Total`.

**Independent Test**: No mobile, abrir seção Subtrações. Verificar botão "+ vincular fatura" abaixo de cada subtração. Tocar → InstitutionPicker abre. Selecionar instituição → nome/abreviação aparece abaixo da subtração. Saldo Período 15/30 recalculado.

### Implementation for User Story 4

- [x] T019 [US4] Adicionar prop `onDeductionInstitutionAssign: (deductionId: string, institutionId: string | null) => void` à interface `Props` de `src/components/MobileMonthView.tsx`
- [x] T020 [US4] Implementar InstitutionPicker no mobile em `src/components/MobileMonthView.tsx`: importar `InstitutionPicker`; adicionar estados `activePicker`/`pickerAnchor`; adicionar helper `getInstitutionName`; botão de vínculo abaixo do nome de cada subtração
- [x] T021 [US4] Passar `onDeductionInstitutionAssign={handleDeductionInstitutionAssign}` ao `<MobileMonthView>` em `src/components/BillsApp.tsx`

**Checkpoint**: No mobile, abrir Subtrações. Cada subtração tem botão de vínculo. Picker abre ao tocar. Seleção persiste. Desktop intocado.

---

## Phase 7: User Story 5 — Edição Multi-Mês de Subtrações (Priority: P2) ✅ COMPLETO

**Goal**: Cada linha de subtração no mobile pode ser expandida para exibir e editar os valores de todos os 12 meses do ano inline, sem precisar navegar mês a mês.

**Independent Test**: No mobile, tocar no botão ▼ de uma subtração. Grade de 12 meses aparece com valores atuais. Editar um mês diferente do selecionado. Navegar até aquele mês confirma o valor salvo.

### Implementation for User Story 5

- [x] T022 [US5] Implementar expand multi-mês em `src/components/MobileMonthView.tsx`: estado `expandedDedId`; botão toggle ▼/▲; bloco expandido com grade 2 colunas de 12 meses; EditableCell por mês; destaque `bg-blue-50` no mês selecionado

**Checkpoint**: Botão ▼/▲ em cada subtração. Grade expande com 12 meses. Mês selecionado destaca em azul. Edição de qualquer mês persiste. Colapso ao tocar ▲. Desktop intocado.

---

## Phase 8: User Story 6 — InstallmentSelector no SALÁRIO Mobile (Priority: P1 fix)

**Goal**: Adicionar as linhas interativas "Subtrai das faturas parcela 1/2" com `InstallmentSelector` na seção SALÁRIO do `MobileMonthView`, replicando o comportamento do desktop `SalarySection`.

**Problema**: A seção SALÁRIO mobile mostra apenas Parcela 1 / Parcela 2 / TOTAL. Faltam as linhas que exibem `inst1Total`/`inst2Total` e permitem configurar quais instituições pertencem a cada parcela via `InstallmentSelector`. Sem isso, o usuário não consegue configurar o desconto por parcela no mobile.

**Independent Test**: No mobile (390px), abrir seção SALÁRIO. Verificar que aparecem as linhas "Subtrai parcela 1" e "Subtrai parcela 2". Tocar em uma delas → `InstallmentSelector` abre com checkboxes. Marcar uma instituição → `inst1Total` atualiza → `Saldo Período 15` recalcula. Desktop intocado.

### Implementation for User Story 6

- [x] T026 [US6] Adicionar `onInstallmentAssign: (institutionId: string, installment: PaymentInstallment | null) => void` à interface `Props` de `src/components/MobileMonthView.tsx`; adicionar `PaymentInstallment` ao import de `@/lib/types`; adicionar no destructuring e nos parâmetros da função
- [x] T027 [US6] Em `src/components/MobileMonthView.tsx`: importar `InstallmentSelector` de `./InstallmentSelector`; importar `getSubtraiLabel` e `balanceColor` de `@/lib/utils`; adicionar estados `const [activeInstSelector, setActiveInstSelector] = useState<1 | 2 | null>(null)` e `const [instSelectorAnchor, setInstSelectorAnchor] = useState<DOMRect | null>(null)`
- [x] T028 [US6] Em `src/components/MobileMonthView.tsx`, na seção SALÁRIO, após a linha "Parcela 1 (dia 15)", adicionar linhas Subtrai parcela 1 + Saldo Período 15 + Subtrai parcela 2 + Saldo Período 30 com InstallmentSelector; valor em neutral (red só se negativo)
- [x] T029 [US6] Em `src/components/BillsApp.tsx`, adicionar `onInstallmentAssign={handleInstallmentAssign}` ao `<MobileMonthView>`
- [x] T030 Executar `npm run lint` — zero novos erros em `src/components/MobileMonthView.tsx` e `src/components/BillsApp.tsx` (erro pré-existente em BillsApp:47 não relacionado)
- [x] T031 Executar `npx tsc --noEmit` — zero erros de tipo para as props novas
- [ ] T032 Validação manual (quickstart passo 12): no mobile (390px), seção SALÁRIO mostra "Subtrai parcela 1" e "Subtrai parcela 2"; tocar abre InstallmentSelector; selecionar/desmarcar instituição; verificar que `Saldo Período 15/30` recalcula imediatamente; desktop intocado

**Checkpoint**: Seção SALÁRIO no mobile funciona igual ao desktop. O usuário consegue configurar quais faturas descontam de cada parcela de salário.

---

## Phase 9: Polish & Validação Final

- [x] T016 Executar `npm run lint` — MobileMonthView.tsx sem novos erros
- [x] T017 Executar `npx tsc --noEmit` — zero erros de tipo
- [ ] T018 Validação manual completa dos passos 1–9 em `specs/008-mobile-current-month/quickstart.md` (390px, 375px, desktop)
- [x] T023 Executar `npm run lint` após T019–T022 — zero novos erros
- [x] T024 Executar `npx tsc --noEmit` após T019–T022 — zero erros de tipo
- [ ] T025 Validação manual dos passos 10–11 em `specs/008-mobile-current-month/quickstart.md` — vincular subtração (passo 10) e editar multi-mês (passo 11)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phases 2–7**: Completas
- **Phase 8 (US6)**: Independente — pode começar imediatamente (T026 → T027 → T028 → T029 → T030 → T031 → T032)
- **Phase 9 (Polish)**: T030/T031 após Phase 8 completa; T018/T025/T032 após tudo completo

### Within User Story 6

- T026 ANTES de T027 (prop na interface antes de usar no JSX)
- T027 ANTES de T028 (importações e estados antes do JSX)
- T028 e T029 podem rodar em paralelo (arquivos diferentes)
- T030/T031 após T028 e T029

### Parallel Opportunities

```bash
# T028 e T029 podem rodar em paralelo:
T026 → T027 → [T028 ∥ T029] → T030 → T031 → T032
```

---

## Implementation Strategy

### Scope restante (MVP: Phase 8)

1. T026: Adicionar prop e tipo (1 linha)
2. T027: Importações e estados (4 linhas)
3. T028: 4 novas linhas na seção SALÁRIO de MobileMonthView
4. T029: 1 linha em BillsApp
5. T030–T032: Validação

### Notes

- `InstallmentSelector` usa `createPortal` → funciona no mobile sem modificação
- `getSubtraiLabel` e `balanceColor` já existem em `@/lib/utils` — sem código novo
- `handleInstallmentAssign` já existe em `BillsApp` — apenas passa a prop
- Modificações em `MobileMonthView.tsx` são sequenciais (mesmo arquivo)
