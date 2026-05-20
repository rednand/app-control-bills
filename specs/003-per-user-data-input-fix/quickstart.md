# Quickstart: Validação da Feature 003

**Branch**: `003-per-user-data-input-fix`

## Pré-requisitos

- `npm run dev` rodando (http://localhost:3000)
- Duas contas Google disponíveis para teste

## Roteiro de validação

### Cenário 1 — Isolamento entre contas

1. Logar com **Conta A**
2. Adicionar instituição "BANCO TESTE A" com qualquer valor
3. Fazer logout
4. Logar com **Conta B**
5. **Esperado**: seção "Controle de Faturas" está vazia ou mostra apenas dados da Conta B (sem "BANCO TESTE A")
6. Adicionar instituição "BANCO TESTE B"
7. Fazer logout e logar novamente com **Conta A**
8. **Esperado**: "BANCO TESTE A" aparece; "BANCO TESTE B" não aparece

### Cenário 2 — Persistência dos próprios dados

1. Logar com **Conta A**
2. Adicionar um valor de fatura e um salário para qualquer mês
3. Fazer logout
4. Logar novamente com **Conta A**
5. **Esperado**: os dados inseridos no passo 2 estão presentes (SC-004: 0% de perda)

### Cenário 3 — Isolamento de salário

1. Logar com **Conta A**, definir salário parcela 1 = R$ 5.000 em Janeiro
2. Logar com **Conta B**, verificar salário de Janeiro
3. **Esperado**: salário da Conta B é R$ 0 (ou seu próprio valor, se tiver configurado)

### Cenário 4 — Bordas dos inputs visíveis

1. Logar com qualquer conta
2. Clicar em "+ Adicionar" na seção "Controle de Faturas"
3. **Esperado**: campos "Nome da instituição", "Dia" e dropdown "Parcela" têm bordas
   cinzas claramente visíveis sobre o fundo azul claro da linha de formulário
4. Clicar em qualquer campo
5. **Esperado**: borda fica mais intensa (foco visível)

### Cenário 5 — Bordas dos inputs em Subtrações

1. Clicar em "+ Adicionar" na seção "Subtrações"
2. **Esperado**: campo "Descrição" tem borda igualmente visível

## Checklist de conclusão

- [ ] Conta A e Conta B não compartilham nenhum dado
- [ ] Dados da Conta A persistem após logout/login
- [ ] Salário da Conta A não aparece para Conta B
- [ ] Bordas dos inputs são visíveis em "Controle de Faturas"
- [ ] Bordas dos inputs são visíveis em "Subtrações"
- [ ] `npm run lint` sem novos erros
- [ ] `npx tsc --noEmit` sem erros
