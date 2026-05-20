'use client';

import { useState } from 'react';
import { Deduction, Institution, MonthCalc, PaymentInstallment, SalaryConfig } from '@/lib/types';
import { MONTHS_SHORT, formatCurrency, formatPercent, percentColor, balanceColor, getSubtraiLabel, getSomaLabel } from '@/lib/utils';
import EditableCell from './EditableCell';
import InstallmentSelector from './InstallmentSelector';
import DeductionSelector from './DeductionSelector';

interface Props {
  institutions: Institution[];
  calculations: MonthCalc[];
  salaryConfigs: SalaryConfig[];
  deductions: Deduction[];
  onSalaryChange: (month: number, field: 'installment_1' | 'installment_2', value: number) => void;
  onInstallmentAssign: (institutionId: string, installment: PaymentInstallment | null) => void;
  onSalaryPeriodAssign: (deductionId: string, period: 1 | 2 | null) => void;
}

export default function SalarySection({
  institutions, calculations, salaryConfigs, deductions,
  onSalaryChange, onInstallmentAssign, onSalaryPeriodAssign,
}: Props) {
  const [activeSelector, setActiveSelector] = useState<1 | 2 | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const [activeSomaSelector, setActiveSomaSelector] = useState<1 | 2 | null>(null);
  const [somaAnchorRect, setSomaAnchorRect] = useState<DOMRect | null>(null);

  const getSalary = (month: number, field: 'installment_1' | 'installment_2') =>
    salaryConfigs.find((s) => s.month === month)?.[field] ?? 0;

  const rows: Array<{
    label: string | (() => string);
    getValue: (calc: MonthCalc) => number | null;
    isEditable?: boolean;
    editField?: 'installment_1' | 'installment_2';
    isBold?: boolean;
    colorFn?: (val: number) => string;
    isPercent?: boolean;
    installmentSlot?: 1 | 2;
    somaSlot?: 1 | 2;
  }> = [
    {
      label: 'Salário Parcela 1 (dia 15)',
      getValue: (c) => getSalary(c.month, 'installment_1'),
      isEditable: true,
      editField: 'installment_1',
    },
    {
      label: () => getSubtraiLabel(1, institutions),
      getValue: (c) => c.inst1Total,
      colorFn: (v) => v > 0 ? 'text-red-600' : 'text-slate-800',
      installmentSlot: 1,
    },
    {
      label: () => getSomaLabel(1, deductions),
      getValue: (c) => c.ded1Total,
      colorFn: (v) => v > 0 ? 'text-emerald-600' : 'text-slate-800',
      somaSlot: 1,
    },
    {
      label: 'Saldo Período 15',
      getValue: (c) => c.saldoPeriodo15,
      colorFn: balanceColor,
      isBold: true,
    },
    {
      label: 'Salário Parcela 2 (dia 30)',
      getValue: (c) => getSalary(c.month, 'installment_2'),
      isEditable: true,
      editField: 'installment_2',
    },
    {
      label: () => getSubtraiLabel(2, institutions),
      getValue: (c) => c.inst2Total,
      colorFn: (v) => v > 0 ? 'text-red-600' : 'text-slate-800',
      installmentSlot: 2,
    },
    {
      label: () => getSomaLabel(2, deductions),
      getValue: (c) => c.ded2Total,
      colorFn: (v) => v > 0 ? 'text-emerald-600' : 'text-slate-800',
      somaSlot: 2,
    },
    {
      label: 'Saldo Período 30',
      getValue: (c) => c.saldoPeriodo30,
      colorFn: balanceColor,
      isBold: true,
    },
    {
      label: 'SALÁRIO TOTAL',
      getValue: (c) => c.salarioTotal,
      isBold: true,
    },
    {
      label: 'Total Fatura Líquida',
      getValue: (c) => c.totalFaturaLiquida,
      colorFn: (v) => v > 0 ? 'text-rose-700' : 'text-slate-400',
    },
    {
      label: 'Saldo Restante',
      getValue: (c) => c.saldoRestante,
      colorFn: balanceColor,
      isBold: true,
    },
    {
      label: '% Comprometido do Salário',
      getValue: (c) => c.percentComprometido,
      isPercent: true,
      colorFn: percentColor,
      isBold: true,
    },
  ];

  return (
    <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-slate-700 text-white">
              <th className="sticky left-0 z-20 bg-slate-700 text-left px-4 py-3 font-semibold min-w-[260px]">
                SALÁRIO E COMPROMETIMENTO
              </th>
              {MONTHS_SHORT.map((m) => (
                <th key={m} className="px-3 py-3 text-center font-medium min-w-[90px]">
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => {
              const label = typeof row.label === 'function' ? row.label() : row.label;
              const isSeparator = row.isBold && !row.isEditable;

              return (
                <tr
                  key={rowIdx}
                  className={`border-b border-slate-100 ${
                    isSeparator
                      ? 'bg-slate-100 border-t-2 border-slate-300'
                      : row.isEditable
                      ? 'bg-emerald-50/30 hover:bg-emerald-50'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <td
                    className={`sticky left-0 z-10 bg-inherit px-4 py-2 ${
                      row.isBold ? 'font-semibold text-slate-800' : 'text-slate-600'
                    }`}
                  >
                    {row.installmentSlot ? (
                      <>
                        <button
                          onClick={(e) => {
                            const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
                            setAnchorRect(rect);
                            setActiveSelector(activeSelector === row.installmentSlot ? null : row.installmentSlot!);
                          }}
                          className="text-left hover:text-slate-900 hover:underline decoration-dashed underline-offset-2 transition-colors"
                          title="Clique para configurar instituições desta parcela"
                        >
                          {label}
                        </button>
                        {activeSelector === row.installmentSlot && anchorRect && (
                          <InstallmentSelector
                            installment={row.installmentSlot}
                            institutions={institutions}
                            onAssign={onInstallmentAssign}
                            onClose={() => setActiveSelector(null)}
                            anchorRect={anchorRect}
                          />
                        )}
                      </>
                    ) : row.somaSlot ? (
                      <>
                        <button
                          onClick={(e) => {
                            const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
                            setSomaAnchorRect(rect);
                            setActiveSomaSelector(activeSomaSelector === row.somaSlot ? null : row.somaSlot!);
                          }}
                          className="text-left hover:text-slate-900 hover:underline decoration-dashed underline-offset-2 transition-colors"
                          title="Clique para configurar subtrações que somam nesta parcela"
                        >
                          {label}
                        </button>
                        {activeSomaSelector === row.somaSlot && somaAnchorRect && (
                          <DeductionSelector
                            period={row.somaSlot}
                            deductions={deductions}
                            onAssign={onSalaryPeriodAssign}
                            onClose={() => setActiveSomaSelector(null)}
                            anchorRect={somaAnchorRect}
                          />
                        )}
                      </>
                    ) : (
                      label
                    )}
                  </td>
                  {calculations.map((calc) => {
                    const raw = row.getValue(calc);
                    if (raw === null) return <td key={calc.month} className="px-2 py-2" />;

                    const colorClass = row.colorFn ? row.colorFn(raw) : 'text-slate-800';

                    if (row.isEditable && row.editField) {
                      return (
                        <td key={calc.month} className="px-2 py-1">
                          <EditableCell
                            value={raw}
                            dimZero={false}
                            onChange={(val) => onSalaryChange(calc.month, row.editField!, val)}
                            className={`font-medium text-slate-800 ${colorClass}`}
                          />
                        </td>
                      );
                    }

                    return (
                      <td key={calc.month} className={`px-2 py-2 text-right ${colorClass} ${row.isBold ? 'font-semibold' : ''}`}>
                        {row.isPercent
                          ? raw > 0 ? formatPercent(raw) : <span className="text-slate-300">—</span>
                          : raw === 0 ? <span className="text-slate-300">—</span> : formatCurrency(raw)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
