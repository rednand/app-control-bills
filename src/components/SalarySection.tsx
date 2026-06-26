'use client';

import { useState } from 'react';
import { Institution, MonthCalc, PaymentInstallment, SalaryConfig } from '@/lib/types';
import { MONTHS_SHORT, formatCurrency, formatPercent, percentColor, balanceColor, getSubtraiLabel } from '@/lib/utils';
import EditableCell from './EditableCell';
import InstallmentSelector from './InstallmentSelector';

interface Props {
  institutions: Institution[];
  calculations: MonthCalc[];
  salaryConfigs: SalaryConfig[];
  currentMonth?: number;
  onSalaryChange: (month: number, field: 'installment_1' | 'installment_2', value: number) => void;
  onInstallmentAssign: (institutionId: string, installment: PaymentInstallment | null) => void;
}

export default function SalarySection({
  institutions, calculations, salaryConfigs, currentMonth,
  onSalaryChange, onInstallmentAssign,
}: Props) {
  const [activeSelector, setActiveSelector] = useState<1 | 2 | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  const getSalary = (month: number, field: 'installment_1' | 'installment_2') =>
    salaryConfigs.find((s) => s.month === month)?.[field] ?? 0;

  const periodRows: Array<{
    label: string | (() => string);
    getValue: (calc: MonthCalc) => number | null;
    isEditable?: boolean;
    editField?: 'installment_1' | 'installment_2';
    isBold?: boolean;
    colorFn?: (val: number) => string;
    installmentSlot?: 1 | 2;
  }> = [
    { label: 'Salário Parcela 1 (dia 15)', getValue: (c) => getSalary(c.month, 'installment_1'), isEditable: true, editField: 'installment_1' },
    { label: () => getSubtraiLabel(1, institutions), getValue: (c) => c.inst1Total, colorFn: (v) => v < 0 ? 'text-red-600' : 'text-slate-800', installmentSlot: 1 },
    { label: 'Saldo Período 15', getValue: (c) => c.saldoPeriodo15, colorFn: balanceColor, isBold: true },
    { label: 'Salário Parcela 2 (dia 30)', getValue: (c) => getSalary(c.month, 'installment_2'), isEditable: true, editField: 'installment_2' },
    { label: () => getSubtraiLabel(2, institutions), getValue: (c) => c.inst2Total, colorFn: (v) => v < 0 ? 'text-red-600' : 'text-slate-800', installmentSlot: 2 },
    { label: 'Saldo Período 30', getValue: (c) => c.saldoPeriodo30, colorFn: balanceColor, isBold: true },
    { label: 'SALÁRIO TOTAL', getValue: (c) => c.salarioTotal, isBold: true },
  ];

  const summaryRows: Array<{
    label: string;
    getValue: (calc: MonthCalc) => number | null;
    isBold?: boolean;
    colorFn?: (val: number) => string;
    isPercent?: boolean;
  }> = [
    { label: 'Total Fatura Líquida', getValue: (c) => c.totalFaturaLiquida, colorFn: (v) => v < 0 ? 'text-rose-400' : 'text-slate-400' },
    { label: 'Saldo Restante', getValue: (c) => c.saldoRestante, colorFn: (v) => v < 0 ? 'text-red-400' : v > 0 ? 'text-emerald-400' : 'text-slate-500', isBold: true },
    { label: '% Comprometido', getValue: (c) => c.percentComprometido, isPercent: true, colorFn: percentColor, isBold: true },
  ];

  return (
    <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-700 text-white px-4 py-3">
        <span className="font-semibold text-sm">SALÁRIO E COMPROMETIMENTO</span>
      </div>
      <div className="overflow-x-auto" data-table-scroll>
        <table className="w-full text-sm border-separate border-spacing-0 table-fixed">
          <thead>
            <tr className="bg-slate-700 text-white">
              <th className="sticky left-0 z-20 bg-slate-700 w-[180px]" />
              {MONTHS_SHORT.map((m, mi) => (
                <th
                  key={m}
                  className={`px-3 py-3 text-center font-medium w-[90px] border-b border-slate-600${mi + 1 === currentMonth ? ' bg-blue-700 font-bold' : ''}`}
                >
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {periodRows.map((row, rowIdx) => {
              const label = typeof row.label === 'function' ? row.label() : row.label;
              const isSeparator = !!(row.isBold && !row.isEditable);
              const cellBg = isSeparator ? 'bg-slate-100' : row.isEditable ? 'bg-emerald-50 hover:bg-emerald-100' : 'hover:bg-slate-50';
              const stickyBg = isSeparator ? 'bg-slate-100' : row.isEditable ? 'bg-emerald-50' : 'bg-white';
              const stickyHover = isSeparator ? '' : row.isEditable ? 'group-hover:bg-emerald-100' : 'group-hover:bg-slate-50';
              const borderTop = isSeparator ? 'border-t-2 border-t-slate-300' : '';

              return (
                <tr key={rowIdx} className="group">
                  <td className={`sticky left-0 z-10 ${stickyBg} ${stickyHover} px-4 py-2 border-b border-slate-100 ${borderTop} ${row.isBold ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>
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
                    ) : label}
                  </td>
                  {calculations.map((calc) => {
                    const raw = row.getValue(calc);
                    const isCurrentMonth = calc.month === currentMonth;
                    const currentMonthBg = isCurrentMonth ? ' bg-blue-50' : '';
                    if (raw === null) return <td key={calc.month} className={`px-2 py-2 border-b border-slate-100 ${borderTop} ${cellBg}${currentMonthBg}`} />;
                    const colorClass = row.colorFn ? row.colorFn(raw) : 'text-slate-800';
                    if (row.isEditable && row.editField) {
                      return (
                        <td key={calc.month} className={`px-2 py-1 border-b border-slate-100 ${cellBg}${currentMonthBg}`}>
                          <EditableCell value={raw} dimZero={false} onChange={(val) => onSalaryChange(calc.month, row.editField!, val)} className={`font-medium text-slate-800 ${colorClass}`} />
                        </td>
                      );
                    }
                    return (
                      <td key={calc.month} className={`px-2 py-2 text-right border-b border-slate-100 ${borderTop} ${cellBg}${currentMonthBg} ${colorClass} ${row.isBold ? 'font-semibold' : ''}`}>
                        {raw === 0 ? <span className="text-slate-300">—</span> : formatCurrency(raw)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}

            {/* Spacer */}
            <tr aria-hidden="true">
              <td colSpan={1 + calculations.length} className="h-3 p-0 bg-white" />
            </tr>

            {/* Summary card rows */}
            {summaryRows.map((row, rowIdx) => {
              const isFirst = rowIdx === 0;
              const isLast = rowIdx === summaryRows.length - 1;
              const borderB = !isLast ? 'border-b border-slate-700' : '';

              return (
                <tr key={rowIdx}>
                  <td className={`sticky left-0 z-10 bg-slate-800 px-4 py-3 font-semibold text-slate-200 ${borderB} ${isLast ? 'rounded-bl-xl' : ''}`}>
                    {row.label}
                  </td>
                  {calculations.map((calc, ci) => {
                    const raw = row.getValue(calc);
                    const colorClass = raw !== null && row.colorFn ? row.colorFn(raw) : 'text-slate-300';
                    const isLastCol = ci === calculations.length - 1;
                    return (
                      <td key={calc.month} className={`px-2 py-3 text-right bg-slate-800 ${borderB} ${colorClass} ${row.isBold ? 'font-semibold' : ''} ${isLast && isLastCol ? 'rounded-br-xl' : ''}`}>
                        {raw === null || raw === 0
                          ? <span className="text-slate-600">—</span>
                          : row.isPercent ? formatPercent(raw) : formatCurrency(raw)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}

            {/* Bottom spacer */}
            <tr aria-hidden="true">
              <td colSpan={1 + calculations.length} className="h-3 p-0 bg-white" />
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
