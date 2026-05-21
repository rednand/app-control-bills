# Feature Specification: Alinhamento das Colunas entre Tabelas

**Feature Branch**: `006-align-table-columns`

**Created**: 2026-05-21

**Status**: Draft

**Input**: "deixar os nomes com o mesmo tamanho para as colunas baterem, por exemplo CONTROLE DE FATURAS, SALARIO E COMPROMETIMENTO, tem q ter tudo o mesmo tamanho"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Colunas de Mês Alinhadas Verticalmente (Priority: P1)

Ao visualizar as três seções da página (Controle de Faturas, Subtrações e
Salário e Comprometimento), as colunas de cada mês devem estar perfeitamente
alinhadas verticalmente entre as seções — como se formassem uma grade única.
Hoje, cada seção tem uma coluna de rótulo com largura diferente, o que faz as
colunas de mês "descasarem" ao rolar a página horizontalmente.

**Why this priority**: O desalinhamento das colunas dificulta a leitura e comparação
de valores entre as seções para o mesmo mês.

**Independent Test**: Abrir a página e verificar visualmente que Jan, Fev, Mar…
em Controle de Faturas estão exatamente acima dos Jan, Fev, Mar… em Subtrações
e em Salário e Comprometimento.

**Acceptance Scenarios**:

1. **Given** o usuário abre a página, **When** visualiza as três seções
   empilhadas verticalmente, **Then** a coluna "Jan" de Controle de Faturas
   está alinhada com "Jan" de Subtrações e de Salário e Comprometimento.
2. **Given** o usuário faz scroll horizontal, **When** os rótulos fixos ficam
   à esquerda, **Then** todas as colunas de mês continuam alinhadas entre as
   seções.
3. **Given** a viewport está em mobile (≥375px), **When** o usuário rola
   horizontalmente, **Then** o alinhamento é mantido e nenhum conteúdo fica
   cortado ou sobreposto.

---

### User Story 2 - Indicador de Fatura Inline na Tabela de Subtrações (Priority: P2)

A informação de qual fatura está vinculada a cada subtração atualmente ocupa
uma coluna separada ("FATURA"), o que causa desalinhamento. Essa informação
deve ser exibida inline dentro da célula de descrição da subtração, mantendo
a funcionalidade de seleção, mas sem ocupar uma coluna adicional.

**Why this priority**: A coluna extra "FATURA" é a principal causa do
desalinhamento em Subtrações versus as outras seções.

**Independent Test**: Verificar que a tabela de Subtrações não tem mais uma
coluna "FATURA" separada, mas que ainda é possível ver e alterar a instituição
vinculada de cada subtração clicando na célula de descrição.

**Acceptance Scenarios**:

1. **Given** uma subtração com instituição vinculada, **When** o usuário
   visualiza a tabela de Subtrações, **Then** o nome da instituição aparece
   dentro da própria célula de descrição (ex.: abaixo ou ao lado do nome
   da subtração), sem coluna separada.
2. **Given** o usuário clica na área de instituição dentro da célula de
   descrição, **When** o picker abre, **Then** pode alterar ou remover o
   vínculo normalmente.
3. **Given** uma subtração sem vínculo, **When** o usuário visualiza,
   **Then** não há texto de instituição exibido (sem "—" ocupando espaço).

---

### Edge Cases

- Textos de rótulo muito longos (ex.: nome de instituição ou subtração longo)
  não devem quebrar o alinhamento — devem truncar com `text-ellipsis`.
- Em telas pequenas (375px), o scroll horizontal deve funcionar em todas as
  três seções de forma consistente.
- A largura padronizada deve acomodar o texto mais longo entre todos os
  cabeçalhos de seção ("SALÁRIO E COMPROMETIMENTO").

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A coluna de rótulo fixo (sticky) de cada seção DEVE ter a mesma
  largura mínima, tornando as colunas de mês visualmente alinhadas entre
  Controle de Faturas, Subtrações e Salário e Comprometimento.
- **FR-002**: A tabela de Subtrações NÃO DEVE ter uma coluna separada para
  exibir a instituição vinculada; essa informação DEVE ser exibida inline
  dentro da célula de descrição da subtração.
- **FR-003**: A funcionalidade de vincular/desvincular instituição DEVE ser
  preservada — o picker deve continuar acessível a partir da célula de
  descrição.
- **FR-004**: Textos longos nas células de rótulo DEVEM ser truncados
  (`text-ellipsis`) e não quebrar o layout.
- **FR-005**: O layout DEVE funcionar em mobile (viewport ≥375px) e desktop,
  com scroll horizontal disponível em todos os tamanhos de tela.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Ao inspecionar a página, a distância da borda esquerda até o
  início da primeira coluna de mês é idêntica nas três seções.
- **SC-002**: A tabela de Subtrações tem exatamente o mesmo número de colunas
  antes das colunas de mês que as outras duas seções.
- **SC-003**: A funcionalidade de vínculo de instituição continua operacional
  após a mudança (picker abre, seleção persiste).
- **SC-004**: Em viewport de 375px, nenhuma seção apresenta conteúdo cortado
  ou overflow horizontal não-controlado.

## Assumptions

- A largura padronizada será determinada pelo texto mais longo entre os
  cabeçalhos: "SALÁRIO E COMPROMETIMENTO" (~260px com padding atual).
- O indicador de instituição inline na célula de descrição usará um estilo
  secundário (texto menor, cor diferente) para não confundir com o nome
  da subtração.
- Nenhuma alteração de banco de dados é necessária — é uma mudança exclusiva
  de apresentação e layout.
