# Quickstart: Experiência Mobile Focada no Mês

## Dev Environment

```bash
npm run dev      # http://localhost:3000
```

## Validação: Layout Mobile

### 1. View mobile exibe mês atual por padrão

- Abrir DevTools → Toggle device toolbar (Cmd+Shift+M) → iPhone 14 (390px)
- Abrir o app e aguardar carregamento
- **Verificar**: Aparece layout de cards verticais (não tabelas)
- **Verificar**: O mês selecionado é o mês atual (ex: "Junho 2026")
- **Verificar**: As três seções (Faturas, Subtrações, Salário) e o Resumo estão visíveis sem scroll

### 2. Navegação entre meses

- Tocar no botão `‹` (mês anterior)
- **Verificar**: Dados mudam para o mês anterior; label do header atualiza
- Tocar no botão `›` (mês seguinte)
- **Verificar**: Dados voltam ao mês original
- **Verificar**: Em Janeiro, o botão `‹` está desabilitado
- **Verificar**: Em Dezembro, o botão `›` está desabilitado

### 3. Edição inline no mobile

- Tocar em qualquer valor de fatura (ex: "Nubank")
- **Verificar**: Campo entra em modo de edição (mesmo comportamento do desktop)
- Digitar novo valor e confirmar com Enter ou blur
- **Verificar**: Valor atualiza imediatamente (otimista)

### 4. Adição de itens no mobile

- Na seção Faturas, tocar em "+ Adicionar"
- **Verificar**: Formulário inline aparece dentro do card
- Preencher nome, vencimento e parcela → OK
- **Verificar**: Nova instituição aparece na lista com valor zerado

### 5. Salário editável no mobile

- Tocar no valor de "Parcela 1 (dia 15)"
- **Verificar**: EditableCell entra em modo de edição
- Editar e confirmar
- **Verificar**: Seção de Resumo atualiza os valores derivados

### 6. Resumo read-only

- **Verificar**: Os valores da seção Resumo (Fatura Líquida, Saldo Restante, %) não são clicáveis

### 7. Troca de ano no mobile

- Usar os botões de navegação de ano no header (os botões `‹` / `›` existentes)
- **Verificar**: Ao trocar para outro ano, selectedMonth muda para Janeiro
- **Verificar**: Ao voltar para o ano atual, selectedMonth volta para o mês corrente

### 10. Vincular subtração a fatura no mobile (US4)

- No mobile, localizar a seção "SUBTRAÇÕES"
- **Verificar**: Abaixo do nome de cada subtração existe um botão de vínculo ("+vincular fatura" ou o nome da instituição vinculada)
- Tocar no botão "+ vincular fatura" de uma subtração sem vínculo
- **Verificar**: Abre o `InstitutionPicker` com a lista de instituições
- Selecionar uma instituição
- **Verificar**: O botão muda para o nome/abreviação da instituição selecionada
- **Verificar**: Os valores de Saldo Período 15 ou 30 no Resumo são recalculados
- Tocar no nome da instituição vinculada → selecionar "Nenhuma"
- **Verificar**: Vínculo é removido; botão volta para "+ vincular fatura"

### 11. Editar subtração em múltiplos meses (US5)

- No mobile, localizar a seção "SUBTRAÇÕES"
- **Verificar**: Cada linha de subtração tem um botão "▼" (ou similar) à direita
- Tocar no botão "▼" de uma subtração
- **Verificar**: A linha expande mostrando os 12 meses do ano (Jan–Dez) em formato de grade 2 colunas
- **Verificar**: O mês atualmente selecionado está destacado (bg-blue-50)
- Tocar em um valor de outro mês (ex: Fevereiro enquanto está em Junho)
- **Verificar**: O EditableCell daquele mês entra em modo de edição
- Digitar um valor e confirmar
- **Verificar**: O valor de Fevereiro persiste; navegar até Fevereiro confirma
- Tocar novamente no botão "▲" (toggle)
- **Verificar**: A grade colapsa, voltando ao estado normal da linha

## Validação: Layout Desktop (sem regressão)

### 8. Desktop preservado

- Abrir o app sem emulação mobile (janela desktop ≥ 768px)
- **Verificar**: Layout de três tabelas horizontais é exibido normalmente
- **Verificar**: O destaque visual azul está na coluna do mês atual
- **Verificar**: Sync de scroll entre tabelas ainda funciona (rolar uma → outras acompanham)
- **Verificar**: Todas as edições e adições funcionam normalmente

### 9. iPhone SE (375px) — viewport mínimo

- DevTools → iPhone SE (375px)
- **Verificar**: Nenhum overflow horizontal visível
- **Verificar**: Todos os valores e labels ficam legíveis

## Lint e Type Check

```bash
npm run lint
npx tsc --noEmit
```

Ambos devem passar sem erros antes de abrir o PR.
