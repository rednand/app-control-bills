# Quickstart: Alinhamento das Colunas entre Tabelas

## O que muda

As três seções da página (Controle de Faturas, Subtrações, Salário e
Comprometimento) passam a ter a coluna de rótulo com a mesma largura (260px).
As colunas de mês ficam perfeitamente alinhadas verticalmente.

A coluna "FATURA" da tabela de Subtrações é removida. A instituição vinculada
aparece como texto secundário dentro da própria célula de descrição.

## Como verificar

1. Abra `http://localhost:3000` após login
2. Observe as três seções — Jan, Fev, Mar… devem estar alinhadas verticalmente
3. Em Subtrações, clique em um nome de subtração com instituição vinculada
   → o `InstitutionPicker` deve abrir normalmente
4. Em mobile (DevTools 375px), scroll horizontal deve funcionar em todas as seções

## Desenvolvimento local

```bash
npm run dev      # http://localhost:3000
npx tsc --noEmit # verificar tipos
npm run lint     # verificar lint
```
