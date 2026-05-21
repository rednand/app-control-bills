# Data Model: Alinhamento das Colunas entre Tabelas

## Sem mudanças de dados

Esta feature é exclusivamente de apresentação (layout/CSS). Nenhuma entidade,
campo de banco de dados, API route ou tipo TypeScript é alterado.

## Mudanças de Layout (resumo técnico)

| Componente | Mudança |
|------------|---------|
| `InvoicesTable.tsx` | `min-w-[180px]` → `min-w-[260px]` na `<th>` sticky e nas `<td>` sticky de rótulo |
| `DeductionsTable.tsx` | `min-w-[180px]` → `min-w-[260px]` na sticky header; remover `<th>FATURA</th>` (110px); mover indicador de instituição para dentro da célula de descrição |
| `SalarySection.tsx` | Já usa `min-w-[260px]` — sem alteração de largura |

## Estrutura da célula de descrição em DeductionsTable (depois)

```
<td sticky> 
  <div>
    <div class="flex justify-between">
      <span>{ded.description}</span>
      <button delete>✕</button>
    </div>
    {ded.institution_id && (
      <button onClick={openPicker} class="text-[10px] text-slate-400 hover:text-slate-600">
        {institutionName}
      </button>
    )}
    {!ded.institution_id && (
      <button onClick={openPicker} class="text-[10px] text-slate-300 hover:text-slate-500">
        + vincular fatura
      </button>
    )}
  </div>
  {picker open → <InstitutionPicker />}
</td>
```
