# Feature Specification: Soma de Subtrações no Período do Salário

**Feature Branch**: `004-salary-deduction-add`

**Created**: 2026-05-20

**Status**: Draft

**Input**: "Na parte de Salário e Comprometimento, preciso da opção de adicionar a subtração abaixo do Subtrai, para adicionar uma das subtrações da listagem acima (ex.: Parte Samuel) no valor da fatura — porque não sou eu que vou pagar, e sim ele — então não vai subtrair do meu saldo, vai somar."

## User Scenarios & Testing

### User Story 1 - Associar Subtração a um Período do Salário (Priority: P1)

O usuário pode vincular itens de subtração (ex.: "Parte Samuel") a um dos dois períodos do
salário (dia 15 ou dia 30). Quando vinculado, o valor mensal daquela subtração é SOMADO
ao saldo do período correspondente — porque a outra pessoa paga diretamente ao usuário,
então esse valor entra como receita no período.

Exemplo visual desejado na seção "Salário e Comprometimento":
```
Salário Parcela 1 (dia 15)    3.038,00
Subtrai ITAÚ, MP e SC        -4.219,20
Soma Parte Samuel              +390,00   ← NOVO
Saldo Período 15               -791,20
```

**Why this priority**: Sem essa adição, o saldo do período subestima o quanto o usuário
tem disponível quando terceiros pagam sua parte das faturas diretamente a ele.

**Independent Test**: Vincular "Parte Samuel" ao Período 1. Verificar que:
1. A linha "Soma Parte Samuel" aparece abaixo de "Subtrai [instituições]" da Parcela 1
2. O valor de Samuel para aquele mês é somado (não subtraído) no cálculo do Saldo Período 15
3. O Total Fatura Líquida e o Total Subtrações NÃO mudam (a subtração continua existindo)

**Acceptance Scenarios**:

1. **Given** o usuário está na seção "Salário e Comprometimento", **When** clica na linha "Soma" de uma parcela, **Then** aparece um seletor inline mostrando todos os itens de subtração cadastrados para escolher quais somam naquele período.
2. **Given** "Parte Samuel" está vinculado ao Período 1 e tem R$ 390 em Abril, **When** o usuário visualiza o Saldo Período 15 de Abril, **Then** o saldo inclui +R$ 390 em relação ao cálculo sem a soma.
3. **Given** uma subtração vinculada ao Período 1, **When** o usuário a move para o Período 2, **Then** ela some do grupo do Período 1 e aparece no grupo do Período 2.
4. **Given** uma subtração sem valor lançado para um mês, **When** visualiza a linha "Soma", **Then** o valor contribuído por ela é zero para aquele mês (rótulo permanece visível).
5. **Given** nenhuma subtração vinculada a um período, **When** visualiza a seção, **Then** a linha "Soma —" exibe valor zero.

---

### User Story 2 - Rótulo Dinâmico da Linha "Soma" (Priority: P2)

A linha "Soma" exibe dinamicamente os nomes das subtrações vinculadas ao período, no
mesmo formato da linha "Subtrai": "Soma A", "Soma A e B" ou "Soma A, B e C".

**Why this priority**: O usuário precisa saber de relance quem está somando ao período
sem precisar abrir o seletor.

**Independent Test**: Vincular dois itens ao Período 1. Verificar que o rótulo exibe
"Soma [Nome A] e [Nome B]" com os valores somados para cada mês.

**Acceptance Scenarios**:

1. **Given** uma subtração no Período 1, **When** visualiza, **Then** rótulo é "Soma [Descrição]".
2. **Given** duas subtrações no Período 1, **When** visualiza, **Then** rótulo é "Soma [A] e [B]".
3. **Given** três ou mais subtrações, **When** visualiza, **Then** rótulo é "Soma [A], [B] e [C]".

---

### Edge Cases

- Uma subtração pode estar simultaneamente na seção "Subtrações" (reduzindo Total Fatura Líquida) E vinculada a um período do salário (somando ao Saldo do período). Os dois efeitos são independentes e corretos — a subtração reduz o que o usuário deve pagar, e a soma representa o dinheiro que o terceiro repassa ao usuário.
- Uma subtração pode ser vinculada a exatamente um período (1 ou 2) ou a nenhum. Não pode estar nos dois.
- Se uma subtração for removida da listagem, ela some automaticamente do período ao qual estava vinculada.
- Meses sem valor lançado para a subtração contribuem zero à linha "Soma" daquele mês.

## Requirements

### Functional Requirements

- **FR-001**: Cada item de subtração DEVE poder ser associado ao Período 1 (dia 15), ao Período 2 (dia 30), ou a nenhum.
- **FR-002**: Na seção "Salário e Comprometimento", abaixo de cada linha "Subtrai [instituições]", DEVE aparecer uma linha "Soma [subtrações]" com o total mensal das subtrações vinculadas a esse período.
- **FR-003**: O usuário DEVE poder configurar a vinculação de subtrações a períodos clicando na linha "Soma" (edição inline, sem modal), com um seletor de checkboxes igual ao da linha "Subtrai".
- **FR-004**: O rótulo da linha "Soma" DEVE exibir dinamicamente as descrições das subtrações vinculadas, no formato "Soma [A], [B] e [C]".
- **FR-005**: O cálculo de "Saldo Período 15" DEVE ser: salário parcela 1 − total instituições período 1 + total subtrações somadas período 1.
- **FR-006**: O cálculo de "Saldo Período 30" DEVE ser: salário parcela 2 − total instituições período 2 + total subtrações somadas período 2.
- **FR-007**: O "Total Subtrações" e o "Total Fatura Líquida" NÃO DEVEM ser afetados pela vinculação de subtrações a períodos — essa é uma operação exclusiva da seção de salário.
- **FR-008**: Uma subtração vinculada a um período DEVE ser removida automaticamente do outro quando movida.

### Key Entities

- **Vinculação de Período de Soma**: Relacionamento entre um item de subtração e um período do salário (1, 2 ou nulo). Campo novo no item de subtração, global (vale para todos os meses).
- **Total de Soma por Período**: Soma dos valores mensais de todos os itens de subtração vinculados àquele período para um dado mês.

## Success Criteria

### Measurable Outcomes

- **SC-001**: O Saldo Período 15 com "Parte Samuel" vinculado é matematicamente igual a: salário1 − inst1Total + valorSamuelNoMês.
- **SC-002**: O Total Fatura Líquida permanece idêntico independente de quais subtrações estão vinculadas a períodos.
- **SC-003**: O usuário configura a vinculação de todas as suas subtrações em menos de 1 minuto.
- **SC-004**: A linha "Soma" atualiza rótulo e valores imediatamente após qualquer mudança de vinculação, sem recarregar.

## Assumptions

- A vinculação de subtração a período é global (não por mês/ano) — se "Parte Samuel" está no Período 1, vale para todos os meses.
- Subtrações sem vinculação não afetam o Saldo por Período (apenas o Total Fatura Líquida via a seção de Subtrações normal).
- A linha "Soma" sempre aparece na seção de salário (mesmo vazia) para tornar a funcionalidade descobrível.
- Subtrações vinculadas a um período somam o valor do mês atual (não um valor fixo) — se o valor de Samuel for diferente em cada mês, a soma reflete o valor real daquele mês.
