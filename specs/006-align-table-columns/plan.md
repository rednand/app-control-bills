# Implementation Plan: Alinhamento das Colunas entre Tabelas

**Branch**: `006-align-table-columns` | **Date**: 2026-05-21 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/006-align-table-columns/spec.md`

## Summary

Padronizar a largura da coluna de rótulo (sticky) em `min-w-[260px]` nas três
seções da página, e mover o indicador de instituição vinculada para dentro da
célula de descrição em `DeductionsTable` (removendo a coluna "FATURA" separada).
Resultado: colunas de mês perfeitamente alinhadas entre Controle de Faturas,
Subtrações e Salário e Comprometimento.

## Technical Context

**Language/Version**: TypeScript (strict mode), Next.js 15 App Router, React 19

**Primary Dependencies**: Tailwind CSS (classes de largura e layout)

**Storage**: N/A — sem mudanças de dados

**Testing**: `npm run lint` + `npx tsc --noEmit` + inspeção visual no browser

**Target Platform**: Web (single-page, Next.js App Router)

**Project Type**: Web application (single-page personal finance tool)

**Performance Goals**: Nenhuma nova computação; mudança é puramente de classes CSS

**Constraints**: `min-w-[260px]` na coluna sticky; `overflow-x-auto` mantido;
funcional em ≥375px (Princípio VI)

**Scale/Scope**: 2 componentes editados; sem mudança de API ou banco

## Constitution Check

| Princípio | Questão Gate | Status |
|-----------|--------------|--------|
| I. Calculation Integrity | Nenhum cálculo alterado — mudança é só de CSS/layout? | [x] |
| II. Optimistic UI | Nenhum write introduzido — sem mudança de estado persistido? | [x] |
| III. Single-User Simplicity | Nenhum novo fluxo de auth ou rota? | [x] |
| IV. Data Integrity | Nenhuma nova collection ou upsert? | [x] |
| V. No Dead Code | Coluna FATURA removida; sem código morto adicionado? | [x] |
| VI. Responsividade | Layout funciona em ≥375px com overflow-x-auto existente? | [x] |

## Project Structure

### Documentation (this feature)

```text
specs/006-align-table-columns/
├── plan.md              ← este arquivo
├── spec.md
├── research.md
├── data-model.md
├── quickstart.md
├── checklists/
│   └── requirements.md
└── tasks.md             (gerado pelo /speckit-tasks)
```

### Source Code (arquivos afetados)

```text
src/components/
├── InvoicesTable.tsx    ← min-w-[180px] → min-w-[260px] na sticky <th>
├── DeductionsTable.tsx  ← min-w-[180px] → min-w-[260px]; remove coluna FATURA;
│                           indicador de instituição inline na célula de descrição
└── SalarySection.tsx    ← já usa min-w-[260px]; sem alteração necessária
```

**Structure Decision**: Single Next.js web app. Apenas componentes de UI.

## Implementation Phases

### Phase A — InvoicesTable

1. **`src/components/InvoicesTable.tsx`**:
   - Alterar a classe da `<th>` sticky: `min-w-[180px]` → `min-w-[260px]`
   - As `<td>` sticky não têm `min-w` explícito — elas herdam a largura da coluna
     via CSS table layout; confirmar que o alinhamento está correto após a mudança

### Phase B — DeductionsTable

2. **`src/components/DeductionsTable.tsx`**:
   - Alterar a classe da `<th>` sticky: `min-w-[180px]` → `min-w-[260px]`
   - Remover a `<th>` com `FATURA` (min-w-[110px])
   - Remover a `<td>` da coluna FATURA de cada linha de subtração (o bloco que
     renderiza o botão de institution e o `InstitutionPicker` com `relative`)
   - Ajustar `colSpan` do formulário de adição: `colSpan={14}` → `colSpan={13}`
   - Ajustar `colSpan` do footer TOTAL SUBTRAÇÕES: adicionar `<td />` extra
     se necessário para cobrir corretamente as colunas
   - Dentro da `<td>` sticky de descrição de cada subtração, adicionar
     o indicador de instituição inline:
     - Wrapper `<div>` que agrupa: nome + botão excluir (existente) + nova linha de instituição
     - Se `ded.institution_id`: botão `text-[10px] text-slate-400 hover:text-slate-600`
       mostrando `getInstitutionName(ded.institution_id)`, que ao clicar abre `InstitutionPicker`
     - Se não: botão `text-[10px] text-slate-300 hover:text-slate-500`
       com texto `+ vincular fatura`, que ao clicar abre `InstitutionPicker`
   - O `InstitutionPicker` e os estados `activePicker`/`pickerAnchor` permanecem
     na mesma célula — apenas o trigger muda de lugar

### Phase C — Validação

3. Executar `npx tsc --noEmit` — zero erros de tipo
4. Executar `npm run lint` — zero warnings
5. Executar `npm run build` — build de produção passa

## Complexity Tracking

Sem violações do Constitution Check. Nenhuma justificativa necessária.
