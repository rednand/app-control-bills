# Research: Alinhamento das Colunas entre Tabelas

## Decision 1: Largura padronizada da coluna de rótulo

**Decision**: Usar `min-w-[260px]` para a coluna de rótulo (sticky) nas três seções.

**Rationale**: `min-w-[260px]` já é o valor de `SalarySection`. É o mínimo
necessário para acomodar o texto "SALÁRIO E COMPROMETIMENTO" com `px-4` de
padding. Padronizar para cima (não para baixo) evita truncamento do cabeçalho
mais longo.

**Alternatives considered**:
- `min-w-[220px]`: insuficiente para "SALÁRIO E COMPROMETIMENTO" sem truncar.
- CSS Grid nas três tabelas: excesso de complexidade para uma mudança de width.

## Decision 2: Remover coluna "FATURA" separada em DeductionsTable

**Decision**: Remover a coluna `<th>FATURA</th>` (min-w-[110px]) e exibir
o nome da instituição vinculada inline dentro da célula de descrição da
subtração — logo abaixo do nome, em texto menor e cor secundária.

**Rationale**: A coluna extra desloca todas as colunas de mês em 110px,
impossibilitando o alinhamento. Exibir inline mantém a informação visível
sem comprometer a grade.

**Alternatives considered**:
- Adicionar coluna fantasma nas outras duas tabelas: adiciona DOM desnecessário
  e viola Princípio V (No Dead Code).
- Ocultar a coluna FATURA em vez de removê-la: mantém o DOM e o problema.

## Decision 3: Posicionamento do indicador de instituição inline

**Decision**: Dentro da célula `<td>` de descrição de cada subtração, exibir:
1. Linha 1: nome da subtração (comportamento atual)
2. Linha 2 (quando houver vínculo): nome da instituição em `text-[10px]
   text-slate-400`, como botão clicável que abre o `InstitutionPicker`

Quando não houver vínculo, a linha 2 mostra `text-[10px] text-slate-300
hover:text-slate-500` com "vincular fatura" ou simplesmente fica oculta.

**Rationale**: Consistente com o padrão de `NoteToggle` já existente na
tabela — texto secundário abaixo da célula principal, clicável.

**Alternatives considered**:
- Badge ao lado do nome (inline, mesma linha): texto longo de instituição
  empurraria a célula para cima e quebraria a altura das linhas.
- Tooltip ao hover: não descobrível no mobile.

## Decision 4: Responsividade

**Decision**: Manter `overflow-x-auto` já existente em todas as seções.
A largura padronizada de 260px não afeta mobile — a tabela já rola
horizontalmente quando necessário.

**Rationale**: Princípio VI exige funcionamento em ≥375px. A mudança é
aditiva (aumenta a coluna que já era menor), não quebra o scroll.
