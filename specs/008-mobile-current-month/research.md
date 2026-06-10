# Research: Experiência Mobile Focada no Mês

**Feature**: 008-mobile-current-month
**Date**: 2026-06-10

---

## Decision 1: Detecção de viewport mobile — CSS vs JavaScript

**Decision**: Usar exclusivamente Tailwind responsive prefixes (`md:hidden` / `hidden md:block`), sem JS-based viewport detection.

**Rationale**: Tailwind resolve no CSS puro, sem flash de conteúdo (FOWC) no SSR do Next.js 15. JS-based detection (`window.innerWidth`, `useMediaQuery`) causa layout shift e exige lógica extra de hidratação. O breakpoint `md:` (768px) é o ponto padrão onde tablets e desktops se distinguem de phones.

**Alternatives considered**:
- `useWindowSize` hook: causa layout shift e adiciona estado desnecessário. Descartado.
- `next/headers` + User-Agent: frágil, não funciona em App Router client components. Descartado.
- Tailwind responsive prefixes: **escolhido**.

---

## Decision 2: Layout mobile — card vertical por mês vs scroll horizontal adaptado

**Decision**: Criar `MobileMonthView.tsx` com layout vertical de cards, mostrando um mês por vez.

**Rationale**: Em mobile (375–430px), a tabela horizontal deixa <175px visíveis para conteúdo real (255px sticky + 90px por coluna). O usuário mal consegue ver 1 mês, não consegue editar confortavelmente, e adicionar dados é impraticável. Cards verticais eliminam toda a fricção: nomes de instituições têm espaço completo, valores são claramente visíveis, e toque para editar é natural.

Padrão consolidado em apps de finanças pessoais mobile (Nubank, Mobills, Organizze, Guiabolso): sempre exibem dados por período, não por grade horizontal.

**Alternatives considered**:
- Auto-scroll para mês atual na tabela existente: resolve apenas onde o olho pousa, não a falta de espaço para conteúdo. A tabela ainda seria inutilizável para edição. Descartado.
- Tabela compacta com colunas menores (ex: 60px): diminui legibilidade e impossibilita edição via `EditableCell`. Descartado.
- Tabela com scroll horizontal melhorado (momentum, snap): melhora a navegação mas não resolve o problema fundamental de espaço por célula. Descartado.

---

## Decision 3: Estado `selectedMonth` — onde vive

**Decision**: Estado interno de `MobileMonthView` — não hoistado para `BillsApp`.

**Rationale**: O desktop não usa `selectedMonth`. Manter em BillsApp adicionaria estado que o componente pai não precisa gerenciar. `MobileMonthView` é autossuficiente: recebe dados e callbacks, gerencia sua própria navegação de mês. Princípio V (simplicidade) aplicado.

Quando `year` prop muda, um `useEffect` interno reseta `selectedMonth` para `CURRENT_MONTH` (se ano corrente) ou `1` (se outro ano).

**Alternatives considered**:
- Estado em BillsApp: permite persistência se o usuário redimensionar a janela entre mobile/desktop. Descartado (caso de uso irrelevante para app financeiro pessoal).

---

## Decision 4: Novo componente vs extensão dos existentes

**Decision**: Criar `src/components/MobileMonthView.tsx` como componente dedicado. `BillsApp` usa `hidden md:block` / `md:hidden` para alternar entre os layouts.

**Rationale**: Os três componentes existentes (InvoicesTable, DeductionsTable, SalarySection) estão otimizados para layout de tabela com `table-fixed` e scroll horizontal. Adicionar branches internos para mobile aumentaria complexidade e violaria Princípio V. Um componente separado mantém cada arquivo com uma única responsabilidade.

**Alternatives considered**:
- Modificar InvoicesTable/DeductionsTable/SalarySection com props `isMobile`: duplica lógica de renderização em arquivos que já são complexos. Descartado.

---

## Decision 5: Reutilização de EditableCell e callbacks

**Decision**: `EditableCell` é reutilizado diretamente. Os callbacks de mutação do BillsApp (`onInvoiceChange`, `onDeductionChange`, `onSalaryChange`) são repassados sem modificação.

**Rationale**: `EditableCell` já funciona em contexto de lista vertical (não é específico de tabela). A constituição (Princípio V): "EditableCell is the canonical inline-edit primitive; do not duplicate its click-to-edit behaviour elsewhere." Os callbacks já são otimistas — nenhuma mudança necessária.

---

## Decision 6: Dados calculados — reutilização via props

**Decision**: `MobileMonthView` recebe `calculations: MonthCalc[]` de BillsApp e filtra por `selectedMonth`. Nenhum cálculo novo no componente mobile.

**Rationale**: Princípio I (Calculation Integrity): derived values são calculados exclusivamente via `useMemo` em BillsApp. `MobileMonthView` é uma view pura que apenas apresenta os dados já computados.

---

## Decision 7: Navegação entre meses

**Decision**: Botões `‹` (anterior) e `›` (próximo) no header do `MobileMonthView`. Label central mostra mês/ano atual. Botão anterior desabilitado em Janeiro, próximo desabilitado em Dezembro.

**Rationale**: Padrão de navegação mais simples e universalmente compreendido em apps mobile. Não requer biblioteca externa. Implementação direta com `selectedMonth - 1` / `selectedMonth + 1`.

**Alternatives considered**:
- Swipe gesture: requer biblioteca ou event listeners customizados. Viola Princípio V. Descartado.
- Dropdown com 12 meses: mais cliques para chegar ao mês desejado. Pode ser adicionado como melhoria futura. Descartado para esta iteração.

---

## Decision 8: Adição de instituições e subtrações no mobile

**Decision**: Reutilizar exatamente os mesmos formulários inline dos componentes desktop, expostos via `onAddInstitution` e `onAddDeduction` callbacks passados para `MobileMonthView`.

**Rationale**: O formulário de adição já existe e funciona. Replicar no contexto mobile mantém a consistência e evita duplicação de código. O usuário pediu explicitamente "facil de adicionar informações".

---

## Decision 10: Institution picker no mobile (vincular subtração a fatura)

**Decision**: Reutilizar o componente `InstitutionPicker` existente sem modificação. Adicionar `onDeductionInstitutionAssign` como prop de `MobileMonthView`. Adicionar `activePicker`/`pickerAnchor` como estado interno do componente mobile.

**Rationale**: `InstitutionPicker` já usa `createPortal` para renderizar no `document.body` com `position: fixed` — portanto funciona corretamente em mobile (posição relativa ao viewport). O mesmo padrão de `anchorRect` capturado no `onClick` do botão funciona em telas touch. Reutilizar sem modificação mantém Princípio V (sem duplicação) e garante comportamento idêntico ao desktop.

**Pattern no mobile**: Abaixo do nome de cada subtração, mostrar o mesmo botão de vínculo que existe no `DeductionsTable` desktop:
- Sem vínculo: texto `+ vincular fatura` em `text-slate-300`
- Com vínculo: nome/abreviação da instituição em `text-slate-400`
- Ao tocar: captura `getBoundingClientRect()` e abre `InstitutionPicker`

**Alternatives considered**:
- `<select>` nativo com todas as instituições: mais simples mas sem a opção "desvincular", sem mostrar abreviações, e visual inconsistente com desktop. Descartado.
- Bottom sheet customizado: mais complexo, viola Princípio V. Descartado.

---

## Decision 11: Edição multi-mês de subtrações no mobile (expand-in-place)

**Decision**: Cada linha de subtração tem um toggle de expansão. Ao expandir, exibe uma grade compacta de 12 meses (2 colunas: mês | valor) inline, logo abaixo da linha da subtração. Cada valor é um `EditableCell` que chama `onDeductionChange(ded.id, month, val)`.

**Rationale**:
- O usuário quer configurar rapidamente subtrações recorrentes (ex: salário parte Samuel = R$1.000/mês em todos os meses)
- Expand-in-place evita navegação — o contexto da visão principal permanece visível
- Layout 2 colunas (mês + EditableCell) é compacto o suficiente para 375px: mês (3 letras ~30px) + espaço + valor (~100px) = ~140px, 2 colunas = ~280px em 375px
- `expandedDedId: string | null` como estado interno de MobileMonthView — simples, sem estado externo

**UX do expand**:
```
[Airbnb]              [▼]     ← linha principal (mês atual = R$ 1.500)
  Jan  [R$ 1.500]  Jul  [R$ 1.500]
  Fev  [R$ 1.500]  Ago  [—     ]
  Mar  [R$ 1.500]  Set  [—     ]
  Abr  [R$ 1.500]  Out  [—     ]
  Mai  [R$ 1.500]  Nov  [—     ]
  Jun  [R$ 1.500]  Dez  [—     ]
```

**Highlight do mês atual**: O par de células do `selectedMonth` recebe `bg-blue-50` para indicar qual mês está atualmente em foco na visão principal.

**Alternatives considered**:
- Modal/bottom sheet com tabela: mais disruptivo, requer backdrop/overlay, mais código. Descartado.
- Botão "aplicar a todos os meses": menos controle granular, não atende ao pedido de "escolher pra qual mês". Descartado.
- Navegar prev/next automaticamente: não resolve o problema, o usuário teria que navegar 12 vezes. Descartado.

---

## Decision 9: Limpeza do código anterior (scroll auto)

**Decision**: Remover o código de auto-scroll do `useEffect` de sincronização em BillsApp. Remover atributo `data-current-month` dos componentes de tabela. Manter os highlights visuais (`bg-blue-700`, `bg-blue-50`) nos componentes de tabela desktop.

**Rationale**:
- Auto-scroll: resolvido pela abordagem de um mês por vez no mobile; desnecessário no desktop (onde todos os meses são visíveis)
- `data-current-month`: era usado apenas para `querySelector` no auto-scroll; sem mais utilidade
- Highlights desktop: já implementados, não causam regressão, melhoram a identificação do mês atual no desktop
