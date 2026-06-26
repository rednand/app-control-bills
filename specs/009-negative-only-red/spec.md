# Feature Specification: Negative-Only Red Color

**Feature Branch**: `009-negative-only-red`

**Created**: 2026-06-26

**Status**: Draft

**Input**: User description: "tire o que tiver de vermelho e deixe apenas qndo tiver o - de negativo"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visualizar saldos sem destaque vermelho desnecessário (Priority: P1)

O usuário abre o aplicativo e visualiza os valores monetários da tabela de faturas, subtrações e seção de salário. Atualmente, alguns valores aparecem em vermelho apenas por convenção visual, mesmo quando representam valores válidos e positivos. O usuário quer que o vermelho seja reservado exclusivamente para indicar valores negativos (com sinal `-`).

**Why this priority**: A cor vermelha tem significado semântico forte — indica problema ou alerta. Usá-la em valores positivos cria ruído visual e pode confundir o usuário sobre a saúde financeira do mês.

**Independent Test**: Abrir o app com dados de um mês normal (sem valores negativos) e verificar que nenhum valor aparece em vermelho.

**Acceptance Scenarios**:

1. **Given** um valor positivo qualquer exibido na tela, **When** o usuário visualiza o campo, **Then** o valor NÃO é exibido em vermelho (usa a cor padrão ou neutra)
2. **Given** um valor negativo (com sinal `-`) exibido na tela, **When** o usuário visualiza o campo, **Then** o valor É exibido em vermelho
3. **Given** um valor igual a zero exibido na tela, **When** o usuário visualiza o campo, **Then** o valor NÃO é exibido em vermelho

---

### User Story 2 - Identificar imediatamente quando um saldo está negativo (Priority: P2)

O usuário consulta o saldo do período (ex: `saldoPeriodo15`, `saldoPeriodo30`, `saldoRestante`) e quer saber de relance se algum saldo ficou negativo no mês.

**Why this priority**: Com a remoção do vermelho genérico, o vermelho passa a ser um sinal exclusivo de alerta real — saldo negativo. O usuário confia mais na cor quando ela aparece.

**Independent Test**: Editar um valor de fatura para que o saldo fique negativo e verificar que apenas esse campo fica vermelho.

**Acceptance Scenarios**:

1. **Given** o saldo do período é positivo, **When** o usuário visualiza a linha de saldo, **Then** o valor aparece na cor neutra/padrão
2. **Given** o saldo do período é negativo, **When** o usuário visualiza a linha de saldo, **Then** o valor aparece em vermelho
3. **Given** o percentual comprometido está acima de 100%, **When** o usuário visualiza a célula, **Then** o valor é exibido em vermelho (representa situação negativa/de alerta)

---

### Edge Cases

- O que acontece quando o valor é `-0` ou `-0,00`? → Tratar como zero, sem vermelho.
- O que acontece em células editáveis durante a digitação de um valor negativo? → A cor só muda ao salvar/confirmar o valor.
- Percentuais acima de 100% devem ser tratados como situação negativa para fins de cor?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE exibir em vermelho SOMENTE valores que sejam estritamente negativos (menores que zero)
- **FR-002**: O sistema NÃO DEVE exibir em vermelho valores positivos ou iguais a zero, independentemente de seu contexto semântico
- **FR-003**: O sistema DEVE manter a cor neutra/padrão para todos os valores não-negativos em todas as seções (Faturas, Subtrações, Salário)
- **FR-004**: O sistema DEVE aplicar a regra de cor negativa de forma consistente em todas as células de valor monetário e percentual do aplicativo
- **FR-005**: O sistema DEVE tratar percentuais acima de 100% como valor negativo para fins de coloração (situação de comprometimento excessivo)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Ao visualizar um mês com todos os valores positivos, nenhum campo de valor exibe a cor vermelha
- **SC-002**: Ao visualizar um mês com pelo menos um saldo negativo, apenas os campos com valor negativo exibem a cor vermelha
- **SC-003**: A regra de coloração é aplicada de forma idêntica na versão desktop e na versão mobile do aplicativo
- **SC-004**: O usuário consegue identificar imediatamente campos negativos sem ambiguidade visual com outros campos

---

## Assumptions & Constraints

- A regra se aplica a todos os campos de valor numérico/monetário/percentual já existentes no app (InvoicesTable, DeductionsTable, SalarySection)
- Células em modo de edição (EditableCell) não mudam de cor durante a digitação — a cor é aplicada apenas ao valor exibido
- Percentuais acima de 100% são considerados situação negativa e devem ser exibidos em vermelho
- Nenhuma outra mudança de comportamento ou layout está no escopo desta especificação
- O valor `-0` ou `-0,00` é tratado como zero (não negativo)
