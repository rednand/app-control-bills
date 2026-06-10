# Tasks: Experiência Mobile Focada no Mês

**Input**: Design documents from `/specs/008-mobile-current-month/`

**Prerequisites**: plan.md, spec.md, research.md, quickstart.md

**Organization**: Tasks agrupadas por user story para implementação e teste independentes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência entre si)
- **[Story]**: User story a que pertence (US1–US5)
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

## Phase 6: User Story 4 — Vincular Subtração a Fatura no Mobile (Priority: P1 fix)

**Goal**: Restaurar o botão de vínculo subtração→instituição que existia no desktop mas foi omitido do MobileMonthView. Regressão crítica que afeta os cálculos de `inst1Total`/`inst2Total`.

**Independent Test**: No mobile, abrir seção Subtrações. Verificar botão "+ vincular fatura" abaixo de cada subtração. Tocar → InstitutionPicker abre. Selecionar instituição → nome/abreviação aparece abaixo da subtração. Saldo Período 15/30 recalculado.

### Implementation for User Story 4

- [x] T019 [US4] Adicionar prop `onDeductionInstitutionAssign: (deductionId: string, institutionId: string | null) => void` à interface `Props` de `src/components/MobileMonthView.tsx` — adicionar no destructuring e na lista de parâmetros da função
- [x] T020 [US4] Implementar InstitutionPicker no mobile em `src/components/MobileMonthView.tsx`: importar `InstitutionPicker` de `./InstitutionPicker`; adicionar estados `const [activePicker, setActivePicker] = useState<string | null>(null)` e `const [pickerAnchor, setPickerAnchor] = useState<DOMRect | null>(null)`; adicionar helper `getInstitutionName(institutionId: string | null)` que retorna `institutions.find(i => i.id === institutionId)?.abbreviation?.trim() || institutions.find(i => i.id === institutionId)?.name || null`; dentro do map de `deductions`, abaixo do `<span>` com o nome, adicionar `<button onClick={(e) => { const rect = ...; setPickerAnchor(rect); setActivePicker(activePicker === ded.id ? null : ded.id); }} className={ded.institution_id ? 'text-[11px] text-slate-400 ...' : 'text-[11px] text-slate-300 ...'}>{getInstitutionName(ded.institution_id) ?? '+ vincular fatura'}</button>`; após o button, adicionar `{activePicker === ded.id && pickerAnchor && (<InstitutionPicker institutions={institutions} currentId={ded.institution_id} onSelect={(id) => { onDeductionInstitutionAssign(ded.id, id); setActivePicker(null); }} onClose={() => setActivePicker(null)} anchorRect={pickerAnchor} />)}`
- [x] T021 [US4] Passar `onDeductionInstitutionAssign={handleDeductionInstitutionAssign}` como prop no `<MobileMonthView>` em `src/components/BillsApp.tsx` — `handleDeductionInstitutionAssign` já existe no componente

**Checkpoint**: No mobile, abrir Subtrações. Cada subtração tem botão de vínculo. Picker abre ao tocar. Seleção persiste. Desktop intocado.

---

## Phase 7: User Story 5 — Edição Multi-Mês de Subtrações (Priority: P2)

**Goal**: Cada linha de subtração no mobile pode ser expandida para exibir e editar os valores de todos os 12 meses do ano inline, sem precisar navegar mês a mês.

**Independent Test**: No mobile, tocar no botão ▼ de uma subtração. Grade de 12 meses aparece com valores atuais. Editar um mês diferente do selecionado. Navegar até aquele mês confirma o valor salvo.

### Implementation for User Story 5

- [x] T022 [US5] Implementar expand multi-mês em `src/components/MobileMonthView.tsx`: adicionar estado `const [expandedDedId, setExpandedDedId] = useState<string | null>(null)`; na linha principal de cada subtração, adicionar botão toggle `<button onClick={() => setExpandedDedId(expandedDedId === ded.id ? null : ded.id)} className="text-slate-400 hover:text-slate-600 text-xs px-1 flex-shrink-0">{expandedDedId === ded.id ? '▲' : '▼'}</button>` ao lado do `EditableCell` principal; após a linha principal da subtração (mas ainda dentro do container da subtração), adicionar o bloco expandido condicionalmente: `{expandedDedId === ded.id && (<div className="bg-slate-50 border-t border-slate-100 px-4 py-2"><div className="grid grid-cols-2 gap-x-4 gap-y-1">{MONTHS_SHORT.map((label, mi) => { const m = mi + 1; const entry = monthlyDeductions.find(d => d.deduction_id === ded.id && d.month === m); const isSelected = m === selectedMonth; return (<div key={m} className={`flex items-center justify-between gap-2 py-1 px-2 rounded ${isSelected ? 'bg-blue-50' : ''}`}><span className={`text-xs font-medium w-6 ${isSelected ? 'text-blue-700' : 'text-slate-500'}`}>{label}</span><EditableCell value={entry?.amount ?? 0} onChange={(val) => onDeductionChange(ded.id, m, val)} className="text-xs text-right" /></div>); })}</div></div>)}`

**Checkpoint**: Botão ▼/▲ em cada subtração. Grade expande com 12 meses. Mês selecionado destaca em azul. Edição de qualquer mês persiste. Colapso ao tocar ▲. Desktop intocado.

---

## Phase 8: Polish & Validação Final

- [x] T016 Executar `npm run lint` — MobileMonthView.tsx sem novos erros
- [x] T017 Executar `npx tsc --noEmit` — zero erros de tipo
- [ ] T018 Validação manual completa dos passos 1–9 em `specs/008-mobile-current-month/quickstart.md` (390px, 375px, desktop)
- [x] T023 Executar `npm run lint` após T019–T022 — zero novos erros em `src/components/MobileMonthView.tsx` e `src/components/BillsApp.tsx`
- [x] T024 Executar `npx tsc --noEmit` após T019–T022 — zero erros de tipo para as props novas
- [ ] T025 Validação manual dos passos 10–11 em `specs/008-mobile-current-month/quickstart.md` — vincular subtração (passo 10) e editar multi-mês (passo 11)

---

## Dependencies & Execution Order

### Phase Dependencies

- **US4 (Phase 6)**: Independente — pode começar imediatamente (T019 → T020 → T021)
- **US5 (Phase 7)**: Independente — pode começar imediatamente ou em paralelo com US4 no mesmo arquivo
- **Polish (Phase 8)**: T023/T024 após US4+US5 completos; T025 após T023/T024

### Within User Story 4

- T019 ANTES de T020 (prop na interface antes de usar no JSX)
- T020 ANTES de T021 (componente pronto antes de BillsApp passar a prop)

### Within User Story 5

- T022 é uma única tarefa (estado + JSX adicionados juntos no MobileMonthView)

### Parallel Opportunities

```bash
# US4 e US5 podem rodar sequencialmente (mesmo arquivo MobileMonthView.tsx):
T019 → T020 → T022 → T021 (BillsApp separado, pode ser paralelo após T020)

# US4: T019 → T020 → T021
# US5: T022 (pode ser feito após T020, já que modifica a mesma seção de deductions)
```

---

## Implementation Strategy

### Sequência Recomendada

1. T019: Adicionar prop à interface (1 linha)
2. T020: Adicionar InstitutionPicker à seção de deductions (US4)
3. T022: Adicionar expand multi-mês à seção de deductions (US5)
4. T021: Passar nova prop em BillsApp
5. T023/T024: Lint + typecheck
6. T018/T025: Validação manual

### Notes

- T019–T022 modificam `src/components/MobileMonthView.tsx` — executar sequencialmente (mesmo arquivo)
- T021 modifica `src/components/BillsApp.tsx` — pode rodar em paralelo com T022
- `InstitutionPicker` usa `createPortal` → funciona no mobile sem modificação
- O `expandedDedId` é independente de `activePicker` — podem coexistir sem conflito
- Manter o padrão de `text-[11px]` para o link de vínculo (consistência com desktop)
