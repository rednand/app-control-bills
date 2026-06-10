'use client';

import { useState } from 'react';
import { Deduction, Institution, MonthCalc, MonthlyDeduction, MonthlyInvoice, SalaryConfig } from '@/lib/types';
import { MONTHS_SHORT, formatCurrency, formatPercent, balanceColor, percentColor } from '@/lib/utils';
import EditableCell from './EditableCell';
import InstitutionPicker from './InstitutionPicker';

const CURRENT_YEAR = new Date().getFullYear();
const CURRENT_MONTH = new Date().getMonth() + 1;

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
  onDeductionInstitutionAssign: (deductionId: string, institutionId: string | null) => void;
}

export default function MobileMonthView({
  year, institutions, invoices, deductions, monthlyDeductions,
  salaryConfigs, calculations,
  onInvoiceChange, onDeductionChange, onSalaryChange,
  onAddInstitution, onDeleteInstitution, onAddDeduction, onDeleteDeduction,
  onDeductionInstitutionAssign,
}: Props) {
  const [monthOverride, setMonthOverride] = useState<{ year: number; month: number } | null>(null);
  const selectedMonth = monthOverride?.year === year
    ? monthOverride.month
    : (year === CURRENT_YEAR ? CURRENT_MONTH : 1);

  const setSelectedMonth = (month: number) => setMonthOverride({ year, month });

  const [showInstForm, setShowInstForm] = useState(false);
  const [newInstName, setNewInstName] = useState('');
  const [newInstDueDay, setNewInstDueDay] = useState('');
  const [newInstInstallment, setNewInstInstallment] = useState<1 | 2>(1);

  const [showDedForm, setShowDedForm] = useState(false);
  const [newDedDesc, setNewDedDesc] = useState('');

  const [activePicker, setActivePicker] = useState<string | null>(null);
  const [pickerAnchor, setPickerAnchor] = useState<DOMRect | null>(null);
  const [expandedDedId, setExpandedDedId] = useState<string | null>(null);

  const calc = calculations.find((c) => c.month === selectedMonth);

  const getInvoiceAmount = (institutionId: string) =>
    invoices.find((i) => i.institution_id === institutionId && i.month === selectedMonth)?.amount ?? 0;

  const getDeductionAmount = (deductionId: string) =>
    monthlyDeductions.find((d) => d.deduction_id === deductionId && d.month === selectedMonth)?.amount ?? 0;

  const getInstitutionName = (institutionId: string | null) => {
    if (!institutionId) return null;
    return institutions.find((i) => i.id === institutionId)?.abbreviation?.trim() ||
      institutions.find((i) => i.id === institutionId)?.name || null;
  };

  const getSalary = (field: 'installment_1' | 'installment_2') =>
    salaryConfigs.find((s) => s.month === selectedMonth)?.[field] ?? 0;

  const handleAddInstitution = () => {
    const day = parseInt(newInstDueDay);
    if (!newInstName.trim() || isNaN(day) || day < 1 || day > 31) return;
    onAddInstitution(newInstName.trim().toUpperCase(), day, newInstInstallment);
    setNewInstName('');
    setNewInstDueDay('');
    setShowInstForm(false);
  };

  const handleAddDeduction = () => {
    if (!newDedDesc.trim()) return;
    onAddDeduction(newDedDesc.trim());
    setNewDedDesc('');
    setShowDedForm(false);
  };

  const isCurrentMonth = year === CURRENT_YEAR && selectedMonth === CURRENT_MONTH;

  return (
    <div className="flex flex-col gap-4 px-1">
      <div className="flex items-center justify-between bg-slate-800 text-white rounded-xl px-4 py-3">
        <button
          onClick={() => setSelectedMonth(Math.max(1, selectedMonth - 1))}
          disabled={selectedMonth === 1}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-xl transition-colors"
        >
          ‹
        </button>
        <div className="text-center">
          <div className="font-bold text-lg leading-tight">
            {MONTHS_SHORT[selectedMonth - 1]} {year}
          </div>
          {isCurrentMonth && (
            <div className="text-xs text-blue-300 font-medium">mês atual</div>
          )}
        </div>
        <button
          onClick={() => setSelectedMonth(Math.min(12, selectedMonth + 1))}
          disabled={selectedMonth === 12}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-xl transition-colors"
        >
          ›
        </button>
      </div>

      <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-800 text-white px-4 py-3">
          <span className="font-semibold text-sm">CONTROLE DE FATURAS</span>
        </div>
        <div className="divide-y divide-slate-100">
          {institutions.map((inst) => (
            <div key={inst.id} className="flex items-center justify-between px-4 py-3 gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <button
                  onClick={() => onDeleteInstitution(inst.id)}
                  className="text-red-300 hover:text-red-500 text-xs flex-shrink-0"
                  title="Remover"
                >
                  ✕
                </button>
                <span className="text-sm text-slate-700 truncate">{inst.name}</span>
              </div>
              <EditableCell
                value={getInvoiceAmount(inst.id)}
                onChange={(val) => onInvoiceChange(inst.id, selectedMonth, val)}
                className="text-sm text-right"
              />
            </div>
          ))}

          {showInstForm && (
            <div className="px-4 py-3 bg-blue-50 flex flex-col gap-2">
              <input
                autoFocus
                placeholder="Nome da instituição"
                value={newInstName}
                onChange={(e) => setNewInstName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddInstitution(); if (e.key === 'Escape') setShowInstForm(false); }}
                className="border border-slate-300 rounded px-3 py-2 text-sm bg-white text-slate-800 outline-none focus:border-blue-500 w-full"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Vencimento"
                  min="1"
                  max="31"
                  value={newInstDueDay}
                  onChange={(e) => setNewInstDueDay(e.target.value)}
                  className="border border-slate-300 rounded px-3 py-2 text-sm bg-white text-slate-800 outline-none focus:border-blue-500 w-28"
                />
                <select
                  value={newInstInstallment}
                  onChange={(e) => setNewInstInstallment(Number(e.target.value) as 1 | 2)}
                  className="border border-slate-300 rounded px-3 py-2 text-sm bg-white text-slate-800 outline-none focus:border-blue-500 flex-1"
                >
                  <option value={1}>Parcela dia 15</option>
                  <option value={2}>Parcela dia 30</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={handleAddInstitution} className="bg-blue-600 text-white rounded px-4 py-2 text-sm hover:bg-blue-700 flex-1">
                  OK
                </button>
                <button onClick={() => setShowInstForm(false)} className="text-slate-500 hover:text-slate-700 text-sm px-3">
                  Cancelar
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between px-4 py-3 bg-slate-100 border-t-2 border-slate-300">
            <span className="text-sm font-semibold text-slate-700">SUBTOTAL FATURA</span>
            <div className="flex items-center gap-3">
              {!showInstForm && (
                <button
                  onClick={() => setShowInstForm(true)}
                  className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                >
                  + Adicionar
                </button>
              )}
              <span className="text-sm font-semibold text-slate-700">
                {formatCurrency(calc?.subtotalFatura ?? 0)}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-600 text-white px-4 py-3">
          <span className="font-semibold text-sm">SUBTRAÇÕES</span>
        </div>
        <div className="divide-y divide-slate-100">
          {deductions.map((ded) => (
            <div key={ded.id}>
              <div className="flex items-center justify-between px-4 py-3 gap-3">
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onDeleteDeduction(ded.id)}
                      className="text-red-300 hover:text-red-500 text-xs flex-shrink-0"
                      title="Remover"
                    >
                      ✕
                    </button>
                    <span className="text-sm text-slate-700 truncate">{ded.description}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
                      setPickerAnchor(rect);
                      setActivePicker(activePicker === ded.id ? null : ded.id);
                    }}
                    className={`text-left mt-0.5 ml-4 ${ded.institution_id ? 'text-[11px] text-slate-400 hover:text-slate-600' : 'text-[11px] text-slate-300 hover:text-slate-500'}`}
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
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <EditableCell
                    value={getDeductionAmount(ded.id)}
                    onChange={(val) => onDeductionChange(ded.id, selectedMonth, val)}
                    className="text-sm text-right"
                  />
                  <button
                    onClick={() => setExpandedDedId(expandedDedId === ded.id ? null : ded.id)}
                    className="text-slate-400 hover:text-slate-600 text-xs px-1 flex-shrink-0"
                  >
                    {expandedDedId === ded.id ? '▲' : '▼'}
                  </button>
                </div>
              </div>
              {expandedDedId === ded.id && (
                <div className="bg-slate-50 border-t border-slate-100 px-4 py-2">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {MONTHS_SHORT.map((label, mi) => {
                      const m = mi + 1;
                      const entry = monthlyDeductions.find((d) => d.deduction_id === ded.id && d.month === m);
                      const isSelected = m === selectedMonth;
                      return (
                        <div
                          key={m}
                          className={`flex items-center justify-between gap-2 py-1 px-2 rounded ${isSelected ? 'bg-blue-50' : ''}`}
                        >
                          <span className={`text-xs font-medium w-6 flex-shrink-0 ${isSelected ? 'text-blue-700' : 'text-slate-500'}`}>
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
            </div>
          ))}

          {showDedForm && (
            <div className="px-4 py-3 bg-blue-50 flex flex-col gap-2">
              <input
                autoFocus
                placeholder="Descrição"
                value={newDedDesc}
                onChange={(e) => setNewDedDesc(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddDeduction(); if (e.key === 'Escape') setShowDedForm(false); }}
                className="border border-slate-300 rounded px-3 py-2 text-sm bg-white text-slate-800 outline-none focus:border-blue-500 w-full"
              />
              <div className="flex gap-2">
                <button onClick={handleAddDeduction} className="bg-blue-600 text-white rounded px-4 py-2 text-sm hover:bg-blue-700 flex-1">
                  OK
                </button>
                <button onClick={() => setShowDedForm(false)} className="text-slate-500 hover:text-slate-700 text-sm px-3">
                  Cancelar
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between px-4 py-3 bg-slate-100 border-t-2 border-slate-300">
            <span className="text-sm font-semibold text-slate-700">TOTAL SUBTRAÇÕES</span>
            <div className="flex items-center gap-3">
              {!showDedForm && (
                <button
                  onClick={() => setShowDedForm(true)}
                  className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                >
                  + Adicionar
                </button>
              )}
              <span className="text-sm font-semibold text-slate-700">
                {formatCurrency(calc?.totalSubtracoes ?? 0)}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-700 text-white px-4 py-3">
          <span className="font-semibold text-sm">SALÁRIO</span>
        </div>
        <div className="divide-y divide-slate-100">
          <div className="flex items-center justify-between px-4 py-3 gap-3">
            <span className="text-sm text-slate-600">Parcela 1 (dia 15)</span>
            <EditableCell
              value={getSalary('installment_1')}
              dimZero={false}
              onChange={(val) => onSalaryChange(selectedMonth, 'installment_1', val)}
              className="text-sm text-right"
            />
          </div>
          <div className="flex items-center justify-between px-4 py-3 gap-3">
            <span className="text-sm text-slate-600">Parcela 2 (dia 30)</span>
            <EditableCell
              value={getSalary('installment_2')}
              dimZero={false}
              onChange={(val) => onSalaryChange(selectedMonth, 'installment_2', val)}
              className="text-sm text-right"
            />
          </div>
          <div className="flex items-center justify-between px-4 py-3 bg-slate-100 border-t-2 border-slate-300">
            <span className="text-sm font-semibold text-slate-700">TOTAL</span>
            <span className="text-sm font-semibold text-slate-700">
              {formatCurrency(calc?.salarioTotal ?? 0)}
            </span>
          </div>
        </div>
      </section>

      <section className="bg-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="bg-slate-700 text-white px-4 py-3">
          <span className="font-semibold text-sm">RESUMO</span>
        </div>
        <div className="divide-y divide-slate-700">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-slate-300">Saldo Período 15</span>
            <span className={`text-sm font-medium ${balanceColor(calc?.saldoPeriodo15 ?? 0)}`}>
              {calc?.saldoPeriodo15 === 0 ? <span className="text-slate-600">—</span> : formatCurrency(calc?.saldoPeriodo15 ?? 0)}
            </span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-slate-300">Saldo Período 30</span>
            <span className={`text-sm font-medium ${balanceColor(calc?.saldoPeriodo30 ?? 0)}`}>
              {calc?.saldoPeriodo30 === 0 ? <span className="text-slate-600">—</span> : formatCurrency(calc?.saldoPeriodo30 ?? 0)}
            </span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-slate-300">Total Fatura Líquida</span>
            <span className={`text-sm font-medium ${(calc?.totalFaturaLiquida ?? 0) > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
              {calc?.totalFaturaLiquida === 0 ? <span className="text-slate-600">—</span> : formatCurrency(calc?.totalFaturaLiquida ?? 0)}
            </span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-semibold text-slate-200">Saldo Restante</span>
            <span className={`text-sm font-semibold ${balanceColor(calc?.saldoRestante ?? 0)}`}>
              {calc?.saldoRestante === 0 ? <span className="text-slate-600">—</span> : formatCurrency(calc?.saldoRestante ?? 0)}
            </span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-semibold text-slate-200">% Comprometido</span>
            <span className={`text-sm font-semibold ${percentColor(calc?.percentComprometido ?? 0)}`}>
              {(calc?.percentComprometido ?? 0) === 0 ? <span className="text-slate-600">—</span> : formatPercent(calc?.percentComprometido ?? 0)}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
