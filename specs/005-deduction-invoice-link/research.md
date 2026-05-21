# Research: Subtração Vinculada a Fatura Específica

## Decision 1: Campo de vínculo no modelo Deduction

**Decision**: Substituir o campo `salary_period: 1 | 2 | null` pelo campo `institution_id: string | null` no modelo `Deduction`.

**Rationale**: O novo modelo vincula a subtração a uma instituição específica (e não a um período do salário). O período fica implícito pela propriedade `payment_installment` da própria instituição vinculada.

**Alternatives considered**:
- Manter `salary_period` e adicionar `institution_id`: duplicaria a configuração e violaria o Princípio V.
- Usar uma collection separada para o vínculo: desnecessário para um campo simples e global por item.

## Decision 2: Cálculo de inst1Total / inst2Total

**Decision**: Atualizar o `useMemo` em `BillsApp.tsx` para subtrair as deduções vinculadas a cada instituição antes de somá-las ao total do período.

```
inst1Total = sum(max(0, invoice_amount - linked_deductions) for inst in period_1)
inst2Total = sum(max(0, invoice_amount - linked_deductions) for inst in period_2)
```

**Rationale**: Mantém o padrão `useMemo` com dados derivados dos arrays-fonte (Princípio I). O valor exibido na seção de salário já reflete o valor líquido de cada fatura.

**Alternatives considered**:
- Novo campo calculado `adjustedInvoice` por mês: duplicaria estado e violaria o Princípio I.
- Calcular ajuste apenas na exibição (não no useMemo): inconsistente com o padrão do projeto.

## Decision 3: Remoção das linhas "Soma" do SalarySection

**Decision**: Remover as linhas `somaSlot` (ded1Total / ded2Total) da seção de salário. O saldo de cada período passa a ser `salário − inst_total_ajustado` sem linha intermediária de "Soma".

**Rationale**: O ajuste está embutido nos valores de `inst1Total` / `inst2Total`. Manter as linhas de "Soma" seria informação redundante e confusa para o usuário (o spec 004 é descartado).

**Alternatives considered**:
- Manter linhas de "Soma" mostrando o valor deduzido: redundante e inconsistente com a nova semântica.

## Decision 4: UI de seleção de instituição na tabela de subtrações

**Decision**: Adicionar um novo componente `InstitutionPicker.tsx` — portal dropdown com uma lista de rádio/clique único para selecionar qual instituição está vinculada à subtração, ou "Nenhuma" para remover o vínculo.

**Rationale**: O padrão de portal dropdown já existe nos componentes `InstallmentSelector` e `DeductionSelector`. Um novo componente específico para esta seleção mantém o código organizado sem quebrar a convenção existente.

**Alternatives considered**:
- Inline select HTML: menos consistente visualmente com o restante da UI.
- Reutilizar DeductionSelector adaptado: lógica diferente (radio vs. checkbox); forçaria uma abstração prematura.

## Decision 5: Migração de dados

**Decision**: Via API route `/api/migrate` ou script de seed, zerar `salary_period` de todas as deduções existentes ao adicionar o campo `institution_id: null`. Não há migração automática de mapeamento salary_period → institution_id pois a semântica é diferente (período vs. instituição específica).

**Rationale**: O campo `salary_period` passa a ser morto. Zerá-lo garante que não haja lixo de dados enquanto o Mongoose Schema é atualizado para remover o campo.

**Alternatives considered**:
- Manter `salary_period` no Schema mas ignorar no código: violaria Princípio V (sem código morto).

## Decision 6: Remoção do DeductionSelector

**Decision**: Deletar `src/components/DeductionSelector.tsx` inteiramente, pois era usado exclusivamente para vincular deduções ao período do salário (abordagem descartada).

**Rationale**: Componente sem uso após a remoção das linhas "Soma". Princípio V exige remoção.
