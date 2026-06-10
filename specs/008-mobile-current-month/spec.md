# Feature Specification: Experiência Mobile Focada no Mês

**Feature Branch**: `008-mobile-current-month`

**Created**: 2026-06-10
**Updated**: 2026-06-10

**Status**: Revised v2

**Input**: "quando eu estiver no mesmo mes, no mobile, eu qro que mostre o mes da melhor forma possivel pro usuario" + "pode mudar totalmente a estrutura quando for mobile, na tem problema, mas precisa ser facil adicionar e ver as informações, principalmente as do mes" + "vc tirou do mobile os dropdown pra eu escolher as subtrações, outra coisa, eu gostaria de poderia escolher pra qual mes eu qro fazer tal subtracao"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Layout Mobile Dedicado com Foco no Mês Atual (Priority: P1)

No mobile, a visão padrão exibe todos os dados de **um único mês por vez** em formato de cards verticais, em vez da tabela horizontal com scroll. O mês atual é selecionado por padrão. O usuário pode navegar entre meses com botões anterior/próximo.

**Why this priority**: Em mobile com 375–430px de largura, uma tabela com coluna sticky de 255px deixa menos de 175px para dados — menos que 2 colunas visíveis. Não é viável mostrar, editar ou adicionar valores de forma confortável na estrutura de tabela horizontal. Um layout vertical focado no mês elimina toda a fricção.

**Independent Test**: Abrir o app em DevTools mobile (390px, iPhone 14). Verificar que ao invés das tabelas horizontais, aparece uma visão em cards com os dados do mês atual. Verificar que os botões de mês anterior/próximo funcionam. Verificar que edição inline de valores ainda funciona.

**Acceptance Scenarios**:

1. **Given** o usuário abre o app no mobile no ano corrente, **When** os dados carregam, **Then** aparece a visão mobile com os dados do mês atual (ex: Junho) visíveis de imediato, sem scroll
2. **Given** o usuário está no layout mobile, **When** toca no botão "Mês Anterior", **Then** os dados exibidos mudam para o mês anterior (sem recarregar dados)
3. **Given** o usuário está no layout mobile, **When** toca em um valor de fatura ou subtração, **Then** o campo entra em modo de edição inline (mesmo comportamento do desktop)
4. **Given** o usuário está visualizando outro ano no mobile, **When** os dados carregam, **Then** o mês 1 (Janeiro) é selecionado por padrão
5. **Given** o usuário abre o app no desktop (≥ 768px), **When** a página carrega, **Then** o layout existente de três tabelas horizontais é exibido normalmente, sem nenhuma mudança

---

### User Story 2 - Adição de Dados no Mobile (Priority: P2)

O usuário consegue adicionar novas instituições e subtrações diretamente na visão mobile, com o mesmo formulário já existente no desktop.

**Why this priority**: "Facil de adicionar informações" foi explicitamente pedido. O layout mobile mostrará botões "Adicionar" nas seções de faturas e subtrações, igual ao comportamento desktop.

**Independent Test**: No mobile, tocar em "+ Adicionar" na seção de faturas e verificar que o formulário inline aparece e funciona corretamente.

**Acceptance Scenarios**:

1. **Given** o usuário está na visão mobile na seção de Faturas, **When** toca em "+ Adicionar", **Then** o formulário de nova instituição aparece inline
2. **Given** o usuário preenche o formulário no mobile, **When** confirma, **Then** a nova instituição aparece na lista com valor zerado para o mês selecionado
3. **Given** o usuário está na seção de Subtrações no mobile, **When** toca em "+ Adicionar", **Then** o formulário de nova subtração aparece inline

---

### User Story 4 - Vincular Subtração a Fatura no Mobile (Priority: P1 fix)

O usuário consegue vincular (ou desvincular) uma subtração a uma instituição diretamente no layout mobile, da mesma forma que no desktop. Esse vínculo afeta o cálculo de `inst1Total`/`inst2Total` e portanto o saldo por período.

**Why this priority**: Esta é uma regressão — a funcionalidade de vincular subtração a fatura existia no desktop mas foi omitida do MobileMonthView. Sem esse vínculo no mobile, o usuário não consegue configurar corretamente o desconto de faturas por parcela.

**Independent Test**: No mobile, tocar no botão de vínculo abaixo de uma subtração. Verificar que um seletor de instituições aparece. Selecionar uma instituição. Verificar que o texto de vínculo atualiza. Verificar que os cálculos de Saldo Período 15/30 refletem a mudança.

**Acceptance Scenarios**:

1. **Given** uma subtração está no mobile sem vínculo, **When** o usuário toca no botão "+ vincular fatura", **Then** abre o seletor de instituições (mesmo componente `InstitutionPicker` do desktop)
2. **Given** uma subtração já está vinculada, **When** o usuário toca no nome da instituição vinculada, **Then** o seletor abre com a instituição atual marcada, permitindo mudar ou desvincular
3. **Given** o usuário seleciona uma instituição no picker, **When** confirma, **Then** o vínculo é salvo e os cálculos derivados (saldoPeriodo15/30) são recalculados imediatamente

---

### User Story 5 - Edição de Subtração em Múltiplos Meses (Priority: P2)

O usuário consegue ver e editar os valores de uma subtração para qualquer mês do ano, sem precisar navegar mês a mês, diretamente do layout mobile.

**Why this priority**: Para subtrações recorrentes (ex: Airbnb, Parte Samuel), o usuário precisa preencher o mesmo valor em vários meses. Navegar prev/next 12 vezes é tedioso. O usuário pediu explicitamente: "escolher pra qual mês eu quero fazer tal subtração".

**Independent Test**: No mobile, tocar no nome de uma subtração. Verificar que a linha expande mostrando todos os 12 meses com seus valores. Editar um mês diferente do selecionado. Verificar que o valor persiste ao navegar para aquele mês.

**Acceptance Scenarios**:

1. **Given** o usuário está na seção de Subtrações no mobile, **When** toca no nome de uma subtração, **Then** a linha expande exibindo os 12 meses do ano com seus valores atuais
2. **Given** a linha de subtração está expandida, **When** o usuário toca em um valor de mês diferente do selecionado, **Then** o EditableCell do respectivo mês entra em modo de edição
3. **Given** o usuário edita um valor para um mês diferente do exibido, **When** confirma, **Then** o valor é salvo para aquele mês e a visão principal (mês selecionado) permanece inalterada
4. **Given** a linha está expandida, **When** o usuário toca novamente no nome da subtração, **Then** a linha colapsa de volta ao estado normal

---

### User Story 3 - Destaque Visual do Mês Atual no Desktop (Priority: P3)

No desktop, a coluna do mês atual recebe destaque visual (cabeçalho azul) para identificação rápida mesmo após o usuário rolar horizontalmente.

**Why this priority**: Complementa a experiência desktop existente — o usuário identifica o mês corrente sem contar colunas. Já está parcialmente implementado na branch atual.

**Independent Test**: No desktop (≥ 768px), verificar que o cabeçalho da coluna do mês atual tem cor azul distinta e que as células do mês têm fundo levemente azulado.

**Acceptance Scenarios**:

1. **Given** o usuário está no desktop no ano corrente, **When** a tabela é exibida, **Then** o cabeçalho do mês atual tem destaque visual azul
2. **Given** o usuário está no desktop em ano diferente do atual, **When** a tabela é exibida, **Then** nenhum mês tem destaque especial

---

### Edge Cases

- Mês Janeiro no ano corrente: no mobile, o mês 1 é selecionado por padrão (mesmo que seja o mês atual) — nenhuma lógica especial
- Mês Dezembro: a navegação "próximo" deve ser desabilitada em Dezembro
- Tela entre 640px–767px (tablet pequeno): usará a visão mobile (padrão `md:` = 768px)
- Sem dados para o mês selecionado: exibir zeros/traços (mesmo comportamento do desktop)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: No mobile (viewport < 768px), o sistema DEVE exibir os dados em layout vertical de cards, um mês por vez, em vez das tabelas horizontais com scroll
- **FR-002**: O mês atual DEVE ser selecionado por padrão quando o ano visualizado é o ano corrente; mês 1 (Janeiro) quando for outro ano
- **FR-003**: O usuário DEVE conseguir navegar entre meses com botões "anterior" e "próximo" no layout mobile
- **FR-004**: Todos os valores de faturas e subtrações DEVEM ser editáveis inline no layout mobile, usando o componente `EditableCell` existente
- **FR-005**: O salário (parcelas 1 e 2) DEVE ser editável inline no layout mobile
- **FR-006**: O layout mobile DEVE exibir os valores calculados derivados (subtotal, total fatura líquida, saldo, % comprometido) em seção de resumo read-only
- **FR-007**: O usuário DEVE conseguir adicionar novas instituições e subtrações no layout mobile
- **FR-008**: No desktop (viewport ≥ 768px), o layout de tabelas horizontais DEVE ser preservado sem nenhuma alteração
- **FR-009**: O destaque visual da coluna do mês atual no desktop (cabeçalho azul, células com fundo azulado) DEVE ser preservado/implementado
- **FR-010**: O usuário DEVE conseguir vincular (ou desvincular) uma subtração a uma instituição no layout mobile, usando o `InstitutionPicker` existente
- **FR-011**: O usuário DEVE conseguir expandir uma subtração para ver e editar seus valores em todos os 12 meses do ano, sem sair da visão mobile atual

### Key Entities

- **Mês Selecionado**: O mês (1–12) atualmente em exibição no layout mobile — estado interno do componente mobile
- **Ano Corrente**: `new Date().getFullYear()` — determina qual mês é padrão ao inicializar
- **Card de Faturas**: Representação mobile de uma linha da InvoicesTable para o mês selecionado
- **Card de Subtrações**: Representação mobile de uma linha da DeductionsTable para o mês selecionado

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O usuário vê os dados do mês atual imediatamente ao abrir o app no mobile — zero scroll necessário
- **SC-002**: O usuário consegue editar qualquer valor no mobile em 2 toques (tap para selecionar, digitar valor)
- **SC-003**: O usuário consegue navegar entre meses no mobile em 1 toque
- **SC-004**: O layout desktop (≥ 768px) permanece funcionalmente idêntico ao que estava antes da implementação
- **SC-005**: Nenhum dado financeiro fica inacessível no mobile — todas as faturas, subtrações e salário de todos os meses são acessíveis via navegação prev/next

---

## Assumptions & Constraints

- O breakpoint mobile é `< 768px` (Tailwind `md:` = 768px) — tablets e desktop veem o layout de tabelas
- O mês/ano atual é determinado no cliente no momento do primeiro render (sem server-side)
- Nenhuma mudança de schema de banco de dados — feature exclusivamente de apresentação
- `EditableCell` existente é reutilizado sem modificação
- Os três callbacks de mutação existentes (`onInvoiceChange`, `onDeductionChange`, `onSalaryChange`) são reutilizados diretamente
- Os cálculos de `MonthCalc[]` são feitos em `BillsApp` via `useMemo` — o componente mobile recebe valores já calculados
