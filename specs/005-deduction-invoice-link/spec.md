# Feature Specification: Subtração Vinculada a Fatura Específica

**Feature Branch**: `005-deduction-invoice-link`

**Created**: 2026-05-21

**Status**: Draft

**Input**: "ao inves de somar na fatura embaixo de subtrai, eu qro que ao informar subtracoes eu informe de qual fatura irei tirar, ai qndo eu subtrair de salario e comprometimento, ja subtrai o valor da fatura com as substracoes feitas ja"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Vincular Subtração a uma Fatura ao Cadastrar (Priority: P1)

Ao cadastrar ou editar uma subtração (ex.: "Parte Samuel"), o usuário pode informar de qual
fatura (instituição) aquele valor será descontado. Com isso, quando a seção "Salário e
Comprometimento" for exibida, o valor daquela instituição já aparece reduzido pelo valor
da subtração, refletindo o valor real que o usuário precisará pagar.

Exemplo:
```
Fatura ITAÚ (bruto):   R$ 1.000
Subtração Parte Samuel: R$ 300 → vinculada à ITAÚ
ITAÚ efetivo no salário: R$ 700
```

**Why this priority**: É a mudança central do fluxo — sem ela, o cálculo do saldo por período
não reflete os valores reais das faturas líquidas por instituição.

**Independent Test**: Vincular "Parte Samuel" (R$ 300) à instituição ITAÚ. Verificar que
o valor de ITAÚ exibido na seção de salário passa a ser R$ 1.000 − R$ 300 = R$ 700, e
que o Saldo Período correspondente é calculado com base nesse valor ajustado.

**Acceptance Scenarios**:

1. **Given** o usuário está cadastrando ou editando uma subtração, **When** associa a subtração
   a uma instituição específica, **Then** a instituição selecionada é exibida junto à
   subtração na listagem de subtrações.
2. **Given** uma subtração está vinculada à instituição ITAÚ com valor R$ 300 em Maio,
   **When** o usuário visualiza a seção "Salário e Comprometimento" de Maio, **Then**
   o valor de ITAÚ usado no cálculo do período é R$ (valor bruto ITAÚ) − R$ 300.
3. **Given** uma subtração sem vínculo de instituição, **When** visualiza o salário,
   **Then** o comportamento atual é mantido — nenhuma fatura é alterada.
4. **Given** uma subtração vinculada a uma instituição sem fatura lançada naquele mês,
   **When** visualiza o salário, **Then** o valor ajustado da instituição é R$ 0 (não negativo).

---

### User Story 2 - Remoção de Vínculo de Instituição (Priority: P2)

O usuário pode remover o vínculo entre uma subtração e uma fatura, voltando ao comportamento
padrão onde a subtração reduz apenas o Total Fatura Líquida sem afetar nenhuma fatura individualmente.

**Why this priority**: Garante que o usuário possa corrigir vinculações feitas por engano.

**Independent Test**: Remover o vínculo de instituição de uma subtração e verificar que
o valor da fatura daquela instituição volta ao valor bruto original.

**Acceptance Scenarios**:

1. **Given** uma subtração vinculada a uma instituição, **When** o usuário remove o vínculo,
   **Then** o valor da fatura daquela instituição retorna ao valor bruto no cálculo do salário.

---

### Edge Cases

- Uma subtração pode estar vinculada a no máximo uma instituição.
- Uma mesma instituição pode ter múltiplas subtrações vinculadas; os valores são somados e
  descontados do bruto da instituição.
- O valor ajustado de uma instituição nunca deve ser negativo (limitado a zero).
- A seção "Subtrações" continua exibindo todos os itens sem alteração — o vínculo de
  instituição afeta apenas a seção "Salário e Comprometimento".
- O "Total Subtrações" e "Total Fatura Líquida" permanecem calculados da mesma forma atual.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Cada item de subtração DEVE ter um campo opcional para indicar de qual
  instituição (fatura) aquele valor será deduzido.
- **FR-002**: Na seção "Salário e Comprometimento", o valor de cada instituição usado no
  cálculo do período DEVE ser: valor bruto da fatura − soma das subtrações vinculadas àquela
  instituição para o mesmo mês.
- **FR-003**: O valor ajustado de uma instituição NUNCA pode ser negativo; o mínimo é zero.
- **FR-004**: O "Total Subtrações", "Subtotal Fatura" e "Total Fatura Líquida" NÃO DEVEM
  ser afetados pelo vínculo de instituição — continuam calculados como atualmente.
- **FR-005**: O usuário DEVE poder vincular ou desvincular a instituição de uma subtração
  a qualquer momento, com efeito imediato nos cálculos exibidos.
- **FR-006**: A listagem de subtrações DEVE exibir, ao lado de cada item, a instituição
  vinculada (quando houver), para que o usuário identifique rapidamente os vínculos.

### Key Entities

- **Subtração** (deduction): Item de desconto mensal. Ganha campo opcional `institution_id`
  indicando de qual fatura será subtraída.
- **Valor Ajustado por Instituição**: Valor calculado = fatura bruta da instituição no mês −
  soma das subtrações vinculadas àquela instituição naquele mês (mínimo zero).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O Saldo Período de uma parcela, com subtração vinculada à sua instituição,
  é matematicamente igual a: salário da parcela − (soma das faturas ajustadas das
  instituições daquela parcela).
- **SC-002**: O "Total Fatura Líquida" permanece idêntico independente de quais subtrações
  estão vinculadas a instituições.
- **SC-003**: O usuário consegue vincular uma subtração a uma instituição em menos de
  30 segundos.
- **SC-004**: Os valores ajustados de todas as instituições são recalculados e exibidos
  imediatamente após qualquer mudança de vínculo, sem recarregar a página.

## Assumptions

- O vínculo de subtração a instituição é global (não por mês/ano): se "Parte Samuel"
  está vinculada à ITAÚ, vale para todos os meses.
- Subtrações sem vínculo de instituição continuam funcionando exatamente como hoje.
- A configuração de vínculo substitui a abordagem de "Soma" prevista na feature 004
  (que adicionava linhas extras na seção de salário) — essa abordagem é descartada.
- Uma subtração vinculada a uma instituição do Período 1 afeta o Saldo Período 15;
  se a instituição for do Período 2, afeta o Saldo Período 30.
