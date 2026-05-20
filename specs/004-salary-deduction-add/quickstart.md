# Quickstart: Validação da Feature 004

**Branch**: `004-salary-deduction-add`

## Pré-requisitos

- `npm run dev` rodando (http://localhost:3000)
- Dados existentes com pelo menos 1 item de subtração e valores lançados

## Roteiro de validação

### Cenário 1 — Linha "Soma" aparece na seção de salário

1. Abrir a seção "Salário e Comprometimento"
2. **Esperado**: abaixo de "Subtrai [instituições Parcela 1]" há uma linha "Soma —"
3. **Esperado**: abaixo de "Subtrai [instituições Parcela 2]" há outra linha "Soma —"

### Cenário 2 — Vincular "Parte Samuel" ao Período 1

1. Clicar na linha "Soma —" da Parcela 1
2. **Esperado**: seletor abre com lista de subtrações cadastradas
3. Marcar "Parte Samuel"
4. **Esperado**: rótulo muda para "Soma Parte Samuel"
5. **Esperado**: valores de abril e maio mostram os valores de Samuel somados

### Cenário 3 — Cálculo do Saldo Período 15

Usando valores de abril da planilha de referência:
- Salário Parcela 1: R$ 3.038,00
- Subtrai ITAU + MP + SC: R$ 4.219,20
- Soma Parte Samuel: R$ 390,00
- **Esperado** Saldo Período 15: 3.038 - 4.219,20 + 390 = -791,20

### Cenário 4 — Total Fatura Líquida não muda

1. Anotar o Total Fatura Líquida de abril antes de vincular
2. Vincular "Parte Samuel" ao Período 1
3. **Esperado**: Total Fatura Líquida de abril é idêntico ao valor anotado no passo 1

### Cenário 5 — Mover subtração de Período 1 para Período 2

1. Com "Parte Samuel" no Período 1, clicar na linha "Soma" do Período 2
2. Marcar "Parte Samuel"
3. **Esperado**: "Parte Samuel" some da "Soma" do Período 1 e aparece na "Soma" do Período 2

## Checklist de conclusão

- [ ] Linhas "Soma" aparecem corretamente abaixo de "Subtrai" em ambos os períodos
- [ ] Seletor abre ao clicar, fecha ao clicar fora
- [ ] Cálculo do Saldo Período 15 e 30 inclui a soma das subtrações vinculadas
- [ ] Total Fatura Líquida não é afetado
- [ ] Rótulo dinâmico exibe nomes das subtrações vinculadas
- [ ] `npx tsc --noEmit` e `npm run lint` sem novos erros
