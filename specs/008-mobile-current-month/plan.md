# Implementation Plan: Experiência Mobile Focada no Mês

**Branch**: `008-mobile-current-month` | **Date**: 2026-06-17 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/008-mobile-current-month/spec.md`

## Summary

O `MobileMonthView` está faltando as linhas "Subtrai das faturas parcela 1/2" com o `InstallmentSelector` na seção SALÁRIO — funcionalidade presente no `SalarySection` desktop que permite ao usuário configurar quais instituições pertencem a cada parcela. A prop `onInstallmentAssign` não é passada de `BillsApp` para `MobileMonthView` e o componente não importa nem renderiza `InstallmentSelector`. Fix: adicionar prop, import, dois estados e duas linhas interativas na seção SALÁRIO do mobile.

## Technical Context

**Language/Version**: TypeScript 5 / Next.js 15 App Router / React 19

**Primary Dependencies**: Tailwind CSS, Supabase

**Storage**: Supabase (PostgreSQL)

**Testing**: lint + `npx tsc --noEmit` + validação manual no browser

**Target Platform**: Web (mobile viewport 375–430px, desktop ≥ 768px)

**Project Type**: web-app (single-page, client component)

**Performance Goals**: N/A — purely presentation change, no new data fetching

**Constraints**: nenhuma mudança de schema; sem novas dependências; `InstallmentSelector` já usa `createPortal` → funciona em mobile sem modificação

**Scale/Scope**: 2 arquivos modificados, ~20 linhas de código adicionadas

## Constitution Check

| Principle | Gate Question | Status |
|-----------|---------------|--------|
| I. Calculation Integrity | Derived values via `useMemo` em BillsApp; MobileMonthView recebe `calculations` prontos | ✅ |
| II. Optimistic UI | Nenhuma mutação nova — `onInstallmentAssign` já existe e é otimista | ✅ |
| III. Single-User Simplicity | Sem autenticação, sem rota nova | ✅ |
| IV. Data Integrity | Nenhuma escrita nova; upsert existente em `handleInstallmentAssign` inalterado | ✅ |
| V. No Dead Code | Reutiliza `InstallmentSelector` e `getSubtraiLabel` existentes; sem duplicação | ✅ |
| VI. Responsividade | Fix é exclusivamente para o viewport mobile; desktop intocado | ✅ |

## Project Structure

### Documentation (this feature)

```text
specs/008-mobile-current-month/
├── plan.md              ← este arquivo
├── research.md          ← decisões de design (existente + contexto novo)
├── spec.md              ← especificação de feature
├── quickstart.md        ← guia de validação manual
└── tasks.md             ← lista de tasks (fases 2–8 existentes + nova fase 9)
```

### Source Code (arquivos modificados por este fix)

```text
src/components/
├── MobileMonthView.tsx   ← prop onInstallmentAssign + import InstallmentSelector
│                           + estado activeInstSelector/instSelectorAnchor
│                           + 2 linhas interativas na seção SALÁRIO
└── BillsApp.tsx          ← passar onInstallmentAssign={handleInstallmentAssign}
                            ao MobileMonthView
```

## Complexity Tracking

> Nenhuma violação de constituição.

---

## Phase 9: Fix — InstallmentSelector no Mobile (novo)

**Problema identificado em**: 2026-06-17

**Descrição**: A seção SALÁRIO do `MobileMonthView` mostra apenas Parcela 1, Parcela 2 e TOTAL. Faltam as duas linhas interativas presentes no desktop `SalarySection`:
- "Subtrai das faturas parcela 1" → exibe `calc.inst1Total` → abre `InstallmentSelector` para slot 1
- "Subtrai das faturas parcela 2" → exibe `calc.inst2Total` → abre `InstallmentSelector` para slot 2

Sem essas linhas, o usuário não consegue configurar quais instituições descontam de cada parcela de salário no mobile.

**Causa raiz**:
1. `MobileMonthView` Props não tem `onInstallmentAssign`
2. `BillsApp` não passa `onInstallmentAssign` para `MobileMonthView`
3. `InstallmentSelector` não é importado em `MobileMonthView`
4. A seção SALÁRIO não renderiza as linhas de `inst1Total`/`inst2Total`

### Tasks

- [ ] T026 Adicionar `onInstallmentAssign: (institutionId: string, installment: PaymentInstallment | null) => void` à interface `Props` de `src/components/MobileMonthView.tsx`; adicionar `PaymentInstallment` ao import de `@/lib/types`; adicionar no destructuring e nos parâmetros da função
- [ ] T027 Em `src/components/MobileMonthView.tsx`: importar `InstallmentSelector` de `./InstallmentSelector`; importar `getSubtraiLabel` de `@/lib/utils`; adicionar estados `const [activeInstSelector, setActiveInstSelector] = useState<1 | 2 | null>(null)` e `const [instSelectorAnchor, setInstSelectorAnchor] = useState<DOMRect | null>(null)`
- [ ] T028 Em `src/components/MobileMonthView.tsx`, na seção SALÁRIO, adicionar após a linha "Parcela 1 (dia 15)":
  - Linha "Subtrai parcela 1": botão que mostra `getSubtraiLabel(1, institutions)`, ao clicar captura `anchorRect` e abre `InstallmentSelector` para installment=1; exibe `formatCurrency(calc?.inst1Total ?? 0)` em `text-red-600` (se > 0) ou `text-slate-400`
  - Linha "Saldo Período 15": read-only com `balanceColor(calc?.saldoPeriodo15 ?? 0)` e `formatCurrency`
  - Após a linha "Parcela 2 (dia 30)", adicionar equivalentes para installment=2 e `inst2Total`/`saldoPeriodo30`
- [ ] T029 Em `src/components/BillsApp.tsx`, adicionar `onInstallmentAssign={handleInstallmentAssign}` ao `<MobileMonthView>` (linha ~307)
- [ ] T030 Executar `npm run lint` e `npx tsc --noEmit` — zero erros
- [ ] T031 Validação manual: no mobile (390px), abrir seção SALÁRIO. Verificar que "Subtrai parcela 1" aparece com o label das instituições configuradas. Tocar → InstallmentSelector abre. Checkbox de instituição → marca. Fechar → `inst1Total` atualiza e `Saldo Período 15` recalcula imediatamente.

### Sequência de execução

```
T026 → T027 → T028 → T029 → T030 → T031
```

T026 e T027 modificam o mesmo arquivo e são sequenciais; T029 (BillsApp) pode rodar em paralelo com T028.
