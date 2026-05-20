# Quickstart: Validação da Feature 002

**Branch**: `002-salary-subtraction`

## Pré-requisitos

1. Migration aplicada no Supabase SQL Editor:
   ```sql
   ALTER TABLE bills_institutions
     ALTER COLUMN payment_installment DROP NOT NULL,
     ADD COLUMN IF NOT EXISTS abbreviation TEXT;
   ```
2. App rodando: `npm run dev` (http://localhost:3000)

## Roteiro de validação

### Cenário 1 — Rótulo dinâmico com uma instituição

1. Acesse a seção "Salário e Comprometimento"
2. Verifique que a linha "Subtrai" da Parcela 1 mostra o(s) nome(s) das instituições
   já cadastradas com `payment_installment = 1`
3. **Esperado**: Rótulo "Subtrai [Nome]" e valor = soma das faturas daquelas instituições

### Cenário 2 — Edição inline

1. Clique na linha "Subtrai" da Parcela 1
2. **Esperado**: `InstallmentSelector` abre inline com lista de instituições
3. Marque/desmarque uma instituição
4. **Esperado**: Rótulo e valores atualizam imediatamente (optimistic)
5. Clique fora do seletor
6. **Esperado**: Seletor fecha; estado persistido no Supabase

### Cenário 3 — Abreviação

1. Edite uma instituição para adicionar abreviação (ex.: "MP" para Mercado Pago)
2. Acesse "Salário e Comprometimento"
3. **Esperado**: Rótulo "Subtrai" usa "MP" em vez de "Mercado Pago"

### Cenário 4 — Instituição sem parcela

1. Via `InstallmentSelector`, desmarque uma instituição de ambas as parcelas
   (ou defina `payment_installment = NULL` diretamente no Supabase)
2. **Esperado**: Instituição desaparece dos rótulos "Subtrai" e não afeta
   os cálculos de Saldo Período 15 / Saldo Período 30
3. **Esperado**: Fatura da instituição ainda aparece no SUBTOTAL FATURA

### Cenário 5 — Verificação de cálculos

Use os dados de abril da planilha de referência:
- ITAU (Parcela 1): R$ 779,00
- Mercado Pago (Parcela 1): R$ 1.623,48
- Sams Club (Parcela 1): R$ 1.816,72
- Subtotal Parcela 1: R$ 4.219,20
- Salário Parcela 1 (dia 15): R$ 3.038,00
- **Esperado** Saldo Período 15: (1.181,20) — negativo, exibido em vermelho entre parênteses

## Checklist de conclusão

- [ ] Rótulos "Subtrai" exibem nomes/abreviações corretos
- [ ] Edição inline funciona sem modal
- [ ] Cálculos batem com a planilha de referência
- [ ] Instituição sem parcela não afeta saldo por período
- [ ] `npm run lint` e `npx tsc --noEmit` sem erros
