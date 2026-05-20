# Feature Specification: Isolamento de Dados por Usuário + Correção de Inputs

**Feature Branch**: `003-per-user-data-input-fix`

**Created**: 2026-05-20

**Status**: Draft

**Input**: "Toda vez que logo com outra conta aparecem os mesmos dados. Preciso que os dados sejam populados de acordo com o login do Google — cada um tem o seu. O salário e as faturas não podem ser os mesmos. Além disso, as cores dos inputs não estão aparecendo quando eu clico para incluir um novo item."

## User Scenarios & Testing

### User Story 1 - Dados Isolados por Conta Google (Priority: P1)

Cada usuário que faz login com sua conta Google vê exclusivamente os dados que ele mesmo cadastrou (instituições, faturas, subtrações e salário). Ao logar com uma conta diferente, os dados são totalmente distintos — como se fosse um arquivo Excel separado para cada pessoa.

**Why this priority**: Sem isolamento, dados financeiros pessoais de um usuário são visíveis a qualquer outro usuário que acesse o sistema — violação crítica de privacidade.

**Independent Test**: Logar com a Conta A, cadastrar uma instituição "BANCO A". Fazer logout. Logar com a Conta B. Verificar que "BANCO A" não aparece na lista de instituições da Conta B.

**Acceptance Scenarios**:

1. **Given** o usuário A está logado, **When** visualiza qualquer seção do app, **Then** vê apenas dados cadastrados por ele (instituições, subtrações, salário e faturas).
2. **Given** o usuário A cadastrou instituições e valores, **When** o usuário B faz login com outra conta Google, **Then** o usuário B vê o app vazio (ou com seus próprios dados anteriores, se houver).
3. **Given** dois usuários diferentes logam em sessões simultâneas, **When** cada um edita seus dados, **Then** as alterações de um não afetam os dados do outro.
4. **Given** o usuário faz logout e login novamente com a mesma conta, **When** carrega o app, **Then** todos os seus dados anteriores estão preservados exatamente como deixou.

---

### User Story 2 - Inputs Visíveis no Formulário de Adição (Priority: P2)

Quando o usuário clica em "+ Adicionar" para incluir uma nova instituição ou subtração, os campos de input do formulário devem ter bordas claramente visíveis e contrastantes com o fundo, para que o usuário saiba onde está digitando.

**Why this priority**: Campos sem borda visível prejudicam a usabilidade — o usuário não consegue identificar facilmente onde clicar para digitar.

**Independent Test**: Clicar em "+ Adicionar" na seção "Controle de Faturas". Verificar visualmente que os campos de entrada (nome, dia de vencimento, parcela) têm bordas visíveis e distintas do fundo azul da linha de formulário.

**Acceptance Scenarios**:

1. **Given** o formulário de adição de instituição está visível, **When** o usuário olha para os campos, **Then** as bordas dos inputs são claramente distintas do fundo, sem necessidade de clicar para percebê-las.
2. **Given** o formulário está ativo, **When** o usuário clica em um campo, **Then** o campo recebe um destaque visual (borda ou sombra mais intensa) indicando foco.
3. **Given** o formulário de adição de subtração está visível, **When** o usuário olha para o campo de descrição, **Then** a borda é igualmente visível.

---

### Edge Cases

- O que acontece quando um novo usuário loga pela primeira vez? O app inicia completamente vazio para ele, sem dados pré-carregados.
- O que acontece se o usuário revogar o acesso Google e tentar logar novamente? O app trata como novo login; os dados anteriores associados àquela conta ainda existem e são exibidos.
- O que acontece se o mesmo usuário logar por navegadores diferentes simultaneamente? Ambas as sessões exibem e editam os mesmos dados (isolados das outras contas).
- O que acontece com dados que existiam antes do isolamento ser implementado? Um script de migração pontual atribui esses dados ao e-mail do usuário principal antes do deploy — nenhum dado existente é perdido.

## Requirements

### Functional Requirements

- **FR-001**: Todos os dados do app (instituições, faturas mensais, subtrações, subtrações mensais e configurações de salário) DEVEM ser associados exclusivamente à conta Google do usuário que os criou.
- **FR-002**: Ao carregar o app, o sistema DEVE exibir apenas os dados pertencentes ao usuário autenticado.
- **FR-003**: Operações de criação (adicionar instituição, subtração, valor) DEVEM associar o novo registro ao usuário autenticado.
- **FR-004**: Operações de leitura, edição e exclusão DEVEM ser restritas aos dados do próprio usuário — nenhum usuário pode ver ou modificar dados de outro.
- **FR-005**: Os campos de input nos formulários de adição DEVEM ter bordas com contraste suficiente para serem visíveis sobre o fundo da linha de formulário, em estado normal e em foco.
- **FR-006**: O destaque de foco (estado ativo) dos inputs DEVE ser visualmente distinto do estado normal.
- **FR-007**: Um script de migração pontual DEVE ser fornecido para atribuir todos os documentos existentes sem `owner` a um e-mail especificado pelo operador, a ser executado uma única vez antes do deploy.

### Key Entities

- **Usuário**: Identificado pelo e-mail ou identificador único da conta Google. Proprietário de todos os seus registros.
- **Vínculo de Propriedade**: Relacionamento implícito entre um usuário e cada registro de dados (instituição, subtração, salário, faturas).

## Success Criteria

### Measurable Outcomes

- **SC-001**: 100% dos dados exibidos ao usuário A pertencem exclusivamente ao usuário A — nenhum dado de outro usuário é visível.
- **SC-002**: Um novo usuário vê o app totalmente vazio após o primeiro login, em menos de 2 segundos de carregamento.
- **SC-003**: Os inputs do formulário de adição são identificáveis como campos de texto por 100% dos usuários sem instrução adicional (bordas visíveis a olho nu).
- **SC-004**: Após fazer logout e login novamente com a mesma conta, todos os dados cadastrados anteriormente estão presentes (0% de perda de dados).

## Clarifications

### Session 2026-05-20

- Q: O que deve acontecer com os dados existentes (sem owner) ao fazer o deploy? → A: Script de migração pontual atribui os dados existentes ao e-mail do usuário principal antes do deploy — nenhum dado é perdido.

## Assumptions

- O identificador único do usuário é o e-mail da conta Google (imutável para fins práticos).
- Antes do deploy, um script pontual atribui todos os documentos sem `owner` ao e-mail do usuário principal — preservando o histórico existente.
- Após o deploy, novos registros sem `owner` não são criados (o sistema sempre associa ao usuário logado).
- Não há compartilhamento de dados entre usuários (sem feature de "colaboração").
- A correção de bordas dos inputs aplica-se a todos os formulários de adição de linha (instituições e subtrações).
- O contraste mínimo aceitável segue o padrão visual do restante do app (bordas escuras/coloridas claramente visíveis sobre qualquer fundo de formulário).
