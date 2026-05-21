# Quickstart: Subtração Vinculada a Fatura Específica

## O que muda

A abordagem de "Soma" da feature 004 é substituída. Em vez de linhas extras na seção de salário, cada subtração pode ser vinculada a uma instituição específica. O valor dessa instituição exibido na seção de salário já vem reduzido pela subtração.

## Como configurar um vínculo

1. Na tabela **SUBTRAÇÕES**, cada linha exibe o nome da instituição vinculada (ou "—" se sem vínculo).
2. Clique no nome da instituição (ou "—") para abrir o seletor.
3. Selecione uma instituição da lista, ou clique em **Nenhuma** para remover o vínculo.
4. O saldo dos períodos na seção de salário é atualizado imediatamente.

## Como verificar o efeito

Na seção **SALÁRIO E COMPROMETIMENTO**:

```
Salário Parcela 1 (dia 15)    3.038,00
Subtrai ITAÚ, MP e SC        -3.929,20   ← já descontada "Parte Samuel" da fatura ITAÚ
Saldo Período 15               -891,20
```

Se "Parte Samuel" (R$ 300) estiver vinculada a ITAÚ:
- ITAÚ bruto: R$ 1.000 → ITAÚ ajustado: R$ 700
- inst1Total reduz de R$ 4.219,20 para R$ 3.919,20

## Migração de dados

Se você usava a funcionalidade "Soma" da feature 004, os vínculos de período precisam ser reconfigurados como vínculos de instituição na nova seção de subtrações.

## Desenvolvimento local

```bash
npm run dev      # http://localhost:3000
npx tsc --noEmit # verificar tipos após mudanças
npm run lint     # verificar lint
```
