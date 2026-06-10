# Implementation Plan: Experiência Mobile Focada no Mês

**Branch**: `008-mobile-current-month` | **Date**: 2026-06-10 | **Spec**: specs/008-mobile-current-month/spec.md

**Input**: Feature specification from `specs/008-mobile-current-month/spec.md`

## Summary

Adicionar dois recursos ao `MobileMonthView` já implementado: (1) restaurar o vínculo subtração→fatura via `InstitutionPicker` reutilizado (regressão), e (2) adicionar toggle de expansão por subtração que exibe e permite editar valores para todos os 12 meses inline.

## Technical Context

**Language/Version**: TypeScript / Next.js 15 App Router, React 19

**Primary Dependencies**: Tailwind CSS, `InstitutionPicker` (componente existente com `createPortal`)

**Storage**: N/A — feature exclusivamente de apresentação; mutações via callbacks existentes

**Testing**: `npm run lint` + `npx tsc --noEmit` + validação manual (quickstart.md)

**Target Platform**: Mobile (< 768px) via Tailwind `md:hidden`

**Project Type**: web-app single-page (Next.js)

**Performance Goals**: Zero re-renders adicionais no desktop; expand/collapse < 16ms (state local)

**Constraints**: Viewport mínimo 375px; zero novas dependências; zero modificações em InstitutionPicker

**Scale/Scope**: 2 arquivos modificados (MobileMonthView.tsx, BillsApp.tsx)

## Constitution Check

| Princípio | Gate | Status |
|-----------|------|--------|
| I. Calculation Integrity | `MonthCalc[]` calculado em BillsApp; MobileMonthView é view pura | PASS |
| II. Optimistic UI | Mutações via callbacks existentes (onDeductionChange, onDeductionInstitutionAssign) | PASS |
| III. Single-User Simplicity | Nenhuma mudança de auth/routing | PASS |
| IV. Data Integrity | Nenhuma nova coleção; upsert já existe | PASS |
| V. No Dead Code | InstitutionPicker reutilizado; zero duplicação | PASS |
| VI. Responsividade | Feature é exclusivamente mobile (< 768px) | PASS |

## Project Structure

### Source Code

```text
src/components/
├── MobileMonthView.tsx    ← MODIFY: add onDeductionInstitutionAssign prop,
│                              InstitutionPicker integration, expand-in-place
└── BillsApp.tsx           ← MODIFY: pass onDeductionInstitutionAssign to MobileMonthView
```

Nenhum arquivo novo. Nenhuma mudança em InstitutionPicker, DeductionsTable, ou qualquer outro componente.

## MobileMonthView — Props Interface (atualizada)

```typescript
interface Props {
  year: number;
  institutions: Institution[];
  invoices: MonthlyInvoice[];
  deductions: Deduction[];
  monthlyDeductions: MonthlyDeduction[];
  salaryConfigs: SalaryConfig[];
  calculations: MonthCalc[];
  onInvoiceChange: (institutionId: string, month: number, value: number) => void;
  onDeductionChange: (deductionId: string, month: number, value: number, note?: string) => void;
  onSalaryChange: (month: number, field: 'installment_1' | 'installment_2', value: number) => void;
  onAddInstitution: (name: string, dueDay: number, installment: 1 | 2) => void;
  onDeleteInstitution: (id: string) => void;
  onAddDeduction: (description: string) => void;
  onDeleteDeduction: (id: string) => void;
  onDeductionInstitutionAssign: (deductionId: string, institutionId: string | null) => void;  // ← NEW
}
```

## Estado interno adicional

```typescript
// US4 — InstitutionPicker
const [activePicker, setActivePicker] = useState<string | null>(null);
const [pickerAnchor, setPickerAnchor] = useState<DOMRect | null>(null);

// US5 — expand por subtração
const [expandedDedId, setExpandedDedId] = useState<string | null>(null);
```

## Wireframe: seção Subtrações atualizada

```text
┌─────────────────────────────────────────────┐
│ SUBTRAÇÕES                                  │  ← bg-slate-600
├─────────────────────────────────────────────┤
│ [✕] Airbnb                    [▼] R$1.500  │  ← linha principal
│      + vincular fatura                      │  ← link button (US4)
├─────────────────────────────────────────────┤
│ [✕] Parte Samuel              [▼] R$1.000  │
│      Nubank (abrev/nome)                    │  ← institution linked (US4)
│  ┌──────────────────────────────────────┐   │
│  │ Jan  [R$1.000]   Jul  [—       ]     │   │  ← expanded (US5)
│  │ Fev  [R$1.000]   Ago  [—       ]     │   │
│  │ Mar  [R$1.000]   Set  [—       ]     │   │
│  │ Abr  [R$1.000]   Out  [—       ]     │   │  bg-blue-50 no mês selecionado
│  │ Mai  [R$1.000]   Nov  [—       ]     │   │
│  │ Jun  [R$1.000]   Dez  [—       ]     │   │
│  └──────────────────────────────────────┘   │
├─────────────────────────────────────────────┤
│ TOTAL SUBTRAÇÕES    [+ Adicionar]  R$2.500  │
└─────────────────────────────────────────────┘
```

## Padrão de implementação — US4 (Institution Picker)

Dentro do map de `deductions` em MobileMonthView:

```tsx
// Imports: adicionar InstitutionPicker
import InstitutionPicker from './InstitutionPicker';

// State:
const [activePicker, setActivePicker] = useState<string | null>(null);
const [pickerAnchor, setPickerAnchor] = useState<DOMRect | null>(null);

// Helper:
const getInstitutionName = (institutionId: string | null) => {
  if (!institutionId) return null;
  return institutions.find((i) => i.id === institutionId)?.abbreviation?.trim() ||
    institutions.find((i) => i.id === institutionId)?.name || null;
};

// Por subtração:
<button
  onClick={(e) => {
    const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
    setPickerAnchor(rect);
    setActivePicker(activePicker === ded.id ? null : ded.id);
  }}
  className={ded.institution_id
    ? 'text-[11px] text-slate-400 hover:text-slate-600 text-left'
    : 'text-[11px] text-slate-300 hover:text-slate-500 text-left'
  }
>
  {getInstitutionName(ded.institution_id) ?? '+ vincular fatura'}
</button>
{activePicker === ded.id && pickerAnchor && (
  <InstitutionPicker
    institutions={institutions}
    currentId={ded.institution_id}
    onSelect={(id) => { onDeductionInstitutionAssign(ded.id, id); setActivePicker(null); }}
    onClose={() => setActivePicker(null)}
    anchorRect={pickerAnchor}
  />
)}
```

## Padrão de implementação — US5 (Expand multi-mês)

```tsx
// State:
const [expandedDedId, setExpandedDedId] = useState<string | null>(null);

// Botão toggle na linha principal:
<button
  onClick={() => setExpandedDedId(expandedDedId === ded.id ? null : ded.id)}
  className="text-slate-400 hover:text-slate-600 text-xs px-1"
>
  {expandedDedId === ded.id ? '▲' : '▼'}
</button>

// Grade expandida (após a linha principal da subtração):
{expandedDedId === ded.id && (
  <div className="bg-slate-50 border-t border-slate-100 px-4 py-2">
    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
      {MONTHS_SHORT.map((label, mi) => {
        const m = mi + 1;
        const entry = monthlyDeductions.find(d => d.deduction_id === ded.id && d.month === m);
        const isSelected = m === selectedMonth;
        return (
          <div
            key={m}
            className={`flex items-center justify-between gap-2 py-1 px-2 rounded ${isSelected ? 'bg-blue-50' : ''}`}
          >
            <span className={`text-xs font-medium w-6 ${isSelected ? 'text-blue-700' : 'text-slate-500'}`}>
              {label}
            </span>
            <EditableCell
              value={entry?.amount ?? 0}
              onChange={(val) => onDeductionChange(ded.id, m, val)}
              className="text-xs text-right"
            />
          </div>
        );
      })}
    </div>
  </div>
)}
```

## BillsApp.tsx — prop adicional para MobileMonthView

```tsx
<MobileMonthView
  ...props existentes...
  onDeductionInstitutionAssign={handleDeductionInstitutionAssign}
/>
```

`handleDeductionInstitutionAssign` já existe em BillsApp — basta passar como prop.

## Complexidade

Nenhuma violação de constituição. Nenhum padrão novo introduzido — apenas reutilização de `InstitutionPicker` e `EditableCell` já existentes.
