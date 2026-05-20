# Implementation Plan: Configuração de Subtrações no Salário

**Branch**: `002-salary-subtraction` | **Date**: 2026-05-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-salary-subtraction/spec.md`

## Summary

Adicionar campo `abbreviation` à tabela de instituições e tornar `payment_installment`
nullable para suportar instituições sem parcela atribuída. Na seção "Salário e
Comprometimento", as linhas "Subtrai" exibem nomes/abreviações dinâmicos das instituições
atribuídas a cada parcela, e o usuário configura a atribuição via edição inline diretamente
naquela linha (sem modal).

## Technical Context

**Language/Version**: TypeScript 5 / Node 20 (Next.js 15)

**Primary Dependencies**: React 19, Tailwind CSS, Mongoose 8

**Storage**: MongoDB (Mongoose) — model `bills_institutions` alterado; sem novos models

**Testing**: Manual via `npm run dev` + validação visual contra planilha de referência

**Target Platform**: Web (navegador desktop)

**Project Type**: Single-page web application

**Performance Goals**: Qualquer alteração de atribuição reflete em < 1 segundo (SC-002)

**Constraints**: Schema change em `bills_institutions` requer migration SQL; campo
`payment_installment` passa de NOT NULL para nullable

**Scale/Scope**: Uso pessoal (< 20 instituições)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate Question | Status |
|-----------|---------------|--------|
| I. Calculation Integrity | inst1Total/inst2Total continuam derivados de useMemo filtrando payment_installment das institutions? | ✅ Pass |
| II. Optimistic UI | A mudança de payment_installment/abbreviation atualiza local state antes do upsert Supabase? | ✅ Pass |
| III. Single-User Simplicity | Feature evita auth, routing, multi-tenancy? | ✅ Pass |
| IV. Data Integrity | Nenhuma nova tabela; alteração em coluna existente sem novo unique constraint necessário | ✅ Pass |
| V. No Dead Code | Reutiliza EditableCell pattern; sem novo componente duplicado | ✅ Pass |

## Project Structure

### Documentation (this feature)

```text
specs/002-salary-subtraction/
├── plan.md              # Este arquivo
├── research.md          # Phase 0 — decisões técnicas
├── data-model.md        # Phase 1 — mudanças de schema e tipos
├── quickstart.md        # Phase 1 — guia de validação
├── contracts/
│   └── salary-section.md  # UI contract para SalarySection
└── tasks.md             # Phase 2 — gerado por /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── BillsApp.tsx          # Mutations: updateInstitutionInstallment, updateInstitutionAbbreviation
│   ├── SalarySection.tsx     # Linhas "Subtrai" dinâmicas + inline multi-select
│   └── InstallmentSelector.tsx  # Novo componente inline para selecionar instituições por parcela
├── lib/
│   ├── types.ts              # Institution: payment_installment nullable, add abbreviation
│   └── supabase.ts           # Sem mudanças
supabase/
└── migrations/
    └── 001_nullable_installment_abbreviation.sql
```

**Structure Decision**: Single project — App Router Next.js sem backend separado. Um novo
componente `InstallmentSelector` é necessário para o multi-select inline; mantém o padrão
de componentes focados e testáveis do projeto.

## Complexity Tracking

> Nenhuma violação de princípio. Sem complexidade adicional a justificar.
