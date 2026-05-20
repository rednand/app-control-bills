# Feature Specification: Layout Visual + Configuração Dinâmica

**Feature Branch**: `001-layout-update`

**Created**: 2026-05-20

**Status**: Draft

**Input**: "Atualizar o layout para ficar igual à imagem da planilha Excel, com instituições e subtrações configuráveis dinamicamente pelo usuário."

## User Scenarios & Testing

### User Story 1 - Layout Visual Fiel à Planilha (Priority: P1)

O usuário abre o app e vê três seções empilhadas verticalmente, idênticas à planilha de referência:
1. **CONTROLE DE FATURAS** — cabeçalho azul escuro; linhas por instituição; colunas por mês; última coluna com dia de vencimento; linha de subtotal em azul claro.
2. **SUBTRAÇÕES** — cabeçalho vermelho; linhas por item de subtração; mesmas colunas de mês; linha de total em vermelho claro.
3. **SALÁRIO E COMPROMETIMENTO** — fundo roxo/cinza; linhas de parcela 1 (dia 15), subtração, saldo período 15, parcela 2 (dia 30), subtração, saldo período 30, salário total, fatura líquida, saldo restante e % comprometido.

**Why this priority**: É a entrega de maior impacto visual e funcional. O usuário precisa reconhecer o app como a versão digital da sua planilha.

**Independent Test**: Abrir o app e comparar visualmente com a imagem de referência em `.specify/assets/layout-template.png`. Todas as seções, cores e posição das colunas devem coincidir.

**Acceptance Scenarios**:

1. **Given** o app carregado com dados, **When** o usuário visualiza a página, **Then** vê exatamente três seções com os títulos "CONTROLE DE FATURAS", "SUBTRAÇÕES" e "SALÁRIO E COMPROMETIMENTO" na mesma ordem da planilha.
2. **Given** qualquer seção, **When** o usuário olha para os meses, **Then** os meses aparecem como colunas horizontais (não linhas).
3. **Given** a seção de faturas, **When** há valores preenchidos, **Then** a linha "SUBTOTAL FATURA" exibe o total em azul e a linha "TOTAL SUBTRAÇÕES" exibe o total em vermelho.
4. **Given** a seção de comprometimento, **When** o percentual comprometido for alto (>= 80%), **Then** a célula de percentual é destacada em vermelho; entre 50–79% em amarelo; abaixo de 50% em verde.

---

### User Story 2 - Gerenciar Instituições Dinamicamente (Priority: P2)

O usuário pode adicionar, editar e remover as instituições (cartões/bancos) que aparecem como linhas na seção "CONTROLE DE FATURAS" — sem precisar alterar código ou banco de dados manualmente.

**Why this priority**: O nome e a quantidade de instituições é pessoal; o app não pode ter nomes fixos.

**Independent Test**: Adicionar uma nova instituição pelo app, verificar que ela aparece como nova linha na tabela de faturas para todos os meses. Remover e confirmar que a linha desaparece.

**Acceptance Scenarios**:

1. **Given** o usuário quer adicionar um novo cartão, **When** clica em "Adicionar Instituição", **Then** um formulário pede nome, dia de vencimento e parcela de pagamento (dia 15 ou dia 30).
2. **Given** uma instituição existente, **When** o usuário edita o nome, **Then** o novo nome aparece imediatamente na tabela sem recarregar a página.
3. **Given** uma instituição sem lançamentos no ano corrente, **When** o usuário solicita excluir, **Then** a instituição é removida e sua linha desaparece da tabela.
4. **Given** uma instituição com lançamentos existentes, **When** o usuário tenta excluir, **Then** o app exibe um aviso pedindo confirmação antes de excluir todos os dados associados.

---

### User Story 3 - Gerenciar Itens de Subtração Dinamicamente (Priority: P3)

O usuário pode adicionar, editar e remover os itens de subtração (ex.: "Parte Samuel", "Airbnb") que aparecem como linhas na seção "SUBTRAÇÕES".

**Why this priority**: Os motivos de subtração variam por pessoa e mudam ao longo do tempo.

**Independent Test**: Adicionar um novo item de subtração, verificar que aparece na tabela. Editar a descrição e confirmar que atualiza. Remover e confirmar que desaparece.

**Acceptance Scenarios**:

1. **Given** o usuário quer registrar uma nova subtração recorrente, **When** clica em "Adicionar Subtração", **Then** um formulário pede apenas a descrição do item.
2. **Given** um item de subtração existente, **When** o usuário edita a descrição, **Then** o novo nome aparece na linha correspondente.
3. **Given** um item sem lançamentos no ano corrente, **When** o usuário solicita excluir, **Then** o item é removido e sua linha desaparece da seção.

---

### Edge Cases

- O que acontece quando não há nenhuma instituição cadastrada? A seção "CONTROLE DE FATURAS" exibe mensagem orientando o usuário a adicionar a primeira instituição.
- O que acontece quando o salário não está configurado para um mês? Os campos de saldo mostram zero e o percentual comprometido mostra "—".
- O que acontece se o valor de fatura ou subtração for deixado em branco? O campo é tratado como R$ 0,00.
- Como exibir valores negativos (ex.: "Saldo Período 15" quando fatura > parcela)? Exibir entre parênteses em vermelho, ex.: (319,20).

## Requirements

### Functional Requirements

- **FR-001**: O app DEVE exibir as três seções em ordem: Controle de Faturas → Subtrações → Salário e Comprometimento, com as mesmas cores e estrutura da planilha de referência.
- **FR-002**: Os meses DEVEM ser exibidos como colunas horizontais em todas as seções.
- **FR-003**: A coluna "Vencimento" DEVE aparecer na última posição da seção "CONTROLE DE FATURAS" com o dia de vencimento de cada instituição.
- **FR-004**: O usuário DEVE poder adicionar novas instituições informando: nome, dia de vencimento e parcela de pagamento (1 = dia 15, 2 = dia 30).
- **FR-005**: O usuário DEVE poder editar o nome de uma instituição existente inline (clique para editar).
- **FR-006**: O usuário DEVE poder remover uma instituição, com confirmação obrigatória se houver lançamentos associados.
- **FR-007**: O usuário DEVE poder adicionar novos itens de subtração informando apenas a descrição.
- **FR-008**: O usuário DEVE poder editar a descrição de um item de subtração inline.
- **FR-009**: O usuário DEVE poder remover um item de subtração.
- **FR-010**: Valores negativos de saldo DEVEM ser exibidos entre parênteses e em vermelho.
- **FR-011**: A célula "% Comprometido do Salário" DEVE ter cor dinâmica: verde (< 50%), amarelo (50–79%), vermelho (>= 80%).
- **FR-012**: Células com nota "NP" (não pago) DEVEM exibir o texto da nota em vez do valor numérico, igual à planilha.

### Key Entities

- **Instituição**: Representa um cartão ou banco. Atributos: nome, dia de vencimento, parcela de pagamento (1 ou 2).
- **Fatura Mensal**: Valor cobrado por uma instituição em um determinado mês/ano.
- **Item de Subtração**: Descrição de um motivo de desconto (ex.: "Parte Samuel").
- **Subtração Mensal**: Valor descontado de um item em um determinado mês/ano, com nota opcional.
- **Configuração de Salário**: Duas parcelas (dia 15 e dia 30) por mês/ano.

## Success Criteria

### Measurable Outcomes

- **SC-001**: O usuário reconhece o layout como fiel à planilha de referência sem necessidade de treinamento.
- **SC-002**: Adicionar ou remover uma instituição ou item de subtração leva menos de 30 segundos.
- **SC-003**: Qualquer edição de valor ou nome é refletida visualmente em menos de 1 segundo.
- **SC-004**: Todos os cálculos de saldo, fatura líquida e percentual comprometido são idênticos aos da planilha para os mesmos dados de entrada.

## Assumptions

- Aplicativo de uso pessoal (único usuário); não há necessidade de controle de acesso.
- O ano exibido é selecionável; os meses exibidos como colunas são sempre janeiro a dezembro do ano selecionado.
- Instituições e itens de subtração são compartilhados entre todos os anos (não são por ano).
- A remoção de uma instituição com lançamentos exclui também todos os lançamentos associados (cascade delete).
- O campo "nota" em subtrações mensais (ex.: "NP236") é editável inline como qualquer célula de valor.
