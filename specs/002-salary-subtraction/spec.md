# Feature Specification: Configuração de Subtrações no Salário

**Feature Branch**: `002-salary-subtraction`

**Created**: 2026-05-20

**Status**: Draft

**Input**: "Precisa ter em salário e comprometimento a opção de subtrair, aí eu adiciono quais faturas eu vou excluir do salário."

## User Scenarios & Testing

### User Story 1 - Atribuir Instituições às Parcelas do Salário (Priority: P1)

O usuário define, para cada parcela do salário (dia 15 e dia 30), quais instituições (cartões/bancos) serão descontadas daquela parcela. A seção "Salário e Comprometimento" exibe dinamicamente os nomes das instituições na linha "Subtrai" de cada período e calcula o saldo subtraindo apenas as instituições configuradas para aquele período.

Exemplo visual (baseado na planilha de referência):
- **Subtrai Itau, MP e SC**: linha que mostra ITAU + Mercado Pago + Sams Club descontados da Parcela 1
- **Subtrai Fatura Nu e Digio**: linha que mostra Nubank + Digio descontados da Parcela 2

**Why this priority**: Sem essa configuração, os cálculos de saldo por período não refletem a realidade do usuário. É o coração da seção de comprometimento.

**Independent Test**: Configurar ITAU e NUBANK para Parcela 1, e MERCADO PAGO para Parcela 2. Verificar que a linha "Subtrai" da Parcela 1 mostra "ITAU e NUBANK" com o valor somado, e a da Parcela 2 mostra "MERCADO PAGO" com seu valor.

**Acceptance Scenarios**:

1. **Given** o usuário está na seção "Salário e Comprometimento", **When** clica na linha "Subtrai" de uma parcela, **Then** a linha entra em modo de edição inline exibindo um seletor com todas as instituições cadastradas para escolher quais pertencem àquela parcela.
2. **Given** o usuário adicionou ITAU e NUBANK à Parcela 1, **When** visualiza a seção, **Then** a linha "Subtrai" da Parcela 1 exibe "Subtrai ITAU e NUBANK" com o valor somado dos dois para aquele mês.
3. **Given** uma instituição atribuída à Parcela 1, **When** o usuário a move para a Parcela 2, **Then** ela desaparece do grupo da Parcela 1 e aparece no da Parcela 2 imediatamente.
4. **Given** o usuário remove todas as instituições de uma parcela, **When** visualiza a seção, **Then** a linha "Subtrai" dessa parcela exibe valor zero e sem nomes.

---

### User Story 2 - Visualização Dinâmica da Linha "Subtrai" (Priority: P2)

A linha "Subtrai" de cada período exibe dinamicamente os nomes das instituições atribuídas a ele, separadas por " e " (quando duas) ou vírgulas + "e" (quando três ou mais), igual ao padrão da planilha de referência.

**Why this priority**: A leitura visual do "Subtrai ITAU, MP e SC" é parte essencial da experiência de uso — o usuário precisa identificar de onde vêm os números sem precisar memorizar a configuração.

**Independent Test**: Atribuir três instituições à Parcela 1 e verificar que o rótulo da linha exibe "Subtrai [A], [B] e [C]".

**Acceptance Scenarios**:

1. **Given** uma instituição na Parcela 1, **When** visualiza, **Then** rótulo é "Subtrai [Nome]".
2. **Given** duas instituições na Parcela 1, **When** visualiza, **Then** rótulo é "Subtrai [A] e [B]".
3. **Given** três ou mais instituições na Parcela 1, **When** visualiza, **Then** rótulo é "Subtrai [A], [B] e [C]".

---

### Edge Cases

- O que acontece se nenhuma instituição for atribuída a uma parcela? A linha "Subtrai" mostra valor zero e rótulo neutro (ex.: "Subtrai —").
- O que acontece se uma nova instituição for adicionada ao sistema? Ela aparece no seletor sem parcela atribuída, não afeta nenhum cálculo até o usuário a atribuir.
- Uma instituição pode estar em ambas as parcelas ao mesmo tempo? Não — cada instituição pertence a exatamente uma parcela (ou a nenhuma).
- O que acontece com meses onde a instituição não tem valor lançado? O valor da linha "Subtrai" para aquele mês é zero, mas o nome ainda aparece no rótulo.

## Requirements

### Functional Requirements

- **FR-001**: Cada instituição DEVE poder ser atribuída a Parcela 1 (dia 15), Parcela 2 (dia 30), ou nenhuma.
- **FR-002**: O usuário DEVE poder gerenciar a atribuição de instituições às parcelas diretamente na linha "Subtrai" da seção "Salário e Comprometimento" via edição inline (clique na linha abre seletor de instituições, sem modal separado).
- **FR-003**: A linha "Subtrai" de cada parcela DEVE calcular automaticamente a soma dos valores mensais de todas as instituições atribuídas àquela parcela.
- **FR-004**: O rótulo da linha "Subtrai" DEVE exibir dinamicamente os nomes das instituições atribuídas no formato "Subtrai [A], [B] e [C]", usando a abreviação da instituição quando disponível, ou o nome completo caso contrário.
- **FR-005**: Uma instituição atribuída a uma parcela DEVE ser removida automaticamente da outra quando movida.
- **FR-006**: O saldo de cada período (Saldo Período 15 / Saldo Período 30) DEVE recalcular imediatamente ao alterar a atribuição de qualquer instituição.
- **FR-007**: Instituições sem parcela atribuída NÃO DEVEM influenciar nenhum dos dois cálculos de saldo por período.

### Key Entities

- **Atribuição de Parcela**: Relacionamento entre uma Instituição e uma Parcela do Salário (1 = dia 15, 2 = dia 30, nula = sem atribuição).
- **Abreviação**: Campo opcional na Instituição. Quando preenchido (ex.: "MP" para Mercado Pago), substitui o nome completo no rótulo da linha "Subtrai".
- **Grupo de Subtração**: Conjunto de instituições associadas a uma parcela, usado para calcular o valor da linha "Subtrai" e compor seu rótulo dinâmico.

## Success Criteria

### Measurable Outcomes

- **SC-001**: O usuário consegue configurar a atribuição de todas as suas instituições às parcelas em menos de 1 minuto.
- **SC-002**: Qualquer alteração de atribuição reflete nos cálculos e no rótulo da linha em menos de 1 segundo, sem recarregar a página.
- **SC-003**: Os valores de saldo por período (Saldo 15 e Saldo 30) coincidem com os da planilha de referência para os mesmos dados.
- **SC-004**: O rótulo "Subtrai [nomes]" está correto e atualizado para 100% das configurações possíveis de 0 a N instituições por parcela.

## Clarifications

### Session 2026-05-20

- Q: Como o usuário acessa a configuração de atribuição de parcela na tela? → A: Edição inline — clique na linha "Subtrai" abre seletor de instituições diretamente naquela linha, sem modal separado.
- Q: O rótulo "Subtrai" exibe nome completo ou abreviação da instituição? → A: Cada instituição tem um campo de abreviação opcional; se preenchido, usa a abreviação no rótulo; caso contrário usa o nome completo.

## Assumptions

- A atribuição de parcela é uma propriedade da instituição (global, não por mês/ano) — se ITAU está na Parcela 1, vale para todos os meses.
- Instituições sem atribuição de parcela não aparecem no cálculo de saldo por período, mas continuam somando no SUBTOTAL FATURA e no Total Fatura Líquida.
- A configuração de atribuição é feita uma vez e persiste; o usuário só altera quando muda a lógica de pagamento das suas faturas.
- O campo de abreviação é opcional; se não preenchido o nome completo é usado no rótulo sem truncamento automático.
- Aplica-se somente às instituições da seção "Controle de Faturas" — itens de subtração da seção "Subtrações" não entram neste agrupamento.
