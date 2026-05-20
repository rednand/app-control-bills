# Implementation Plan: Isolamento de Dados por Usuário + Correção de Inputs

**Branch**: `003-per-user-data-input-fix` | **Date**: 2026-05-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-per-user-data-input-fix/spec.md`

## Summary

Adicionar campo `owner` (e-mail Google) a todos os 5 models MongoDB para isolar dados por
usuário. Todas as queries e mutations passam a filtrar/incluir o owner da sessão. Atualizar
o índice único de `SalaryConfig`. Corrigir contraste das bordas dos inputs no formulário
de adição de instituição e subtração.

## Technical Context

**Language/Version**: TypeScript 5 / Node 20 (Next.js 15)

**Primary Dependencies**: React 19, Tailwind CSS, Mongoose 8, next-auth 4

**Storage**: MongoDB (Mongoose) — campo `owner: String` adicionado a todos os 5 models;
índice de `SalaryConfig` atualizado

**Testing**: Manual via `npm run dev` + dois logins Google distintos

**Target Platform**: Web (navegador desktop)

**Project Type**: Single-page web application

**Performance Goals**: Carregamento inicial < 2 segundos por usuário (SC-002)

**Constraints**: Dados órfãos pré-existentes (sem `owner`) não aparecem para nenhum
usuário após a implementação — conforme spec Assumptions

**Scale/Scope**: Uso pessoal (< 5 usuários simultâneos esperados)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate Question | Status |
|-----------|---------------|--------|
| I. Calculation Integrity | Cálculos derivados via useMemo são afetados? | ✅ Pass — sem mudança nos cálculos |
| II. Optimistic UI | Mutations continuam atualizando estado local antes do servidor? | ✅ Pass — owner é tratado server-side |
| III. Single-User Simplicity | Feature evita multi-tenancy complexo, auth flows novos? | ✅ Pass — usa session já existente |
| IV. Data Integrity | Novo índice `{ month, year, owner }` em SalaryConfig evita conflitos? | ✅ Pass |
| V. No Dead Code | Sem novos componentes, apenas filter propagation nas APIs? | ✅ Pass |

## Project Structure

### Documentation (this feature)

```text
specs/003-per-user-data-input-fix/
├── plan.md              # Este arquivo
├── research.md          # Phase 0 — decisões de owner strategy
├── data-model.md        # Phase 1 — mudanças em todos os models
├── quickstart.md        # Phase 1 — validação com duas contas
├── contracts/
│   └── api-owner-filter.md  # Contrato de todas as rotas com owner
└── tasks.md             # Phase 2 — gerado por /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── lib/
│   └── models/
│       ├── Institution.ts      # + owner field
│       ├── Invoice.ts          # + owner field
│       ├── Deduction.ts        # + owner field
│       ├── MonthlyDeduction.ts # + owner field
│       └── SalaryConfig.ts     # + owner field, índice atualizado
├── app/
│   └── api/
│       ├── data/route.ts               # filter by owner
│       ├── institutions/route.ts       # POST inclui owner
│       ├── institutions/[id]/route.ts  # DELETE/PATCH verifica owner
│       ├── invoices/route.ts           # PUT com owner
│       ├── deductions/route.ts         # POST com owner
│       ├── deductions/[id]/route.ts    # DELETE verifica owner
│       ├── monthly-deductions/route.ts # PUT com owner
│       └── salary/route.ts             # PUT com owner
└── components/
    ├── InvoicesTable.tsx    # fix bordas: border-blue-300 → border-slate-300
    └── DeductionsTable.tsx  # fix bordas: idem
```

**Structure Decision**: Single project. Sem novas rotas — apenas propagação de `owner`
nas existentes. A correção de CSS é localizada em dois componentes.

## Complexity Tracking

> Nenhuma violação de princípio. Sem complexidade adicional a justificar.
