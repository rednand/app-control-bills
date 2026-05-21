'use client';

import { useState } from 'react';
import { Deduction, Institution, MonthlyDeduction } from '@/lib/types';
import { MONTHS_SHORT, formatCurrency } from '@/lib/utils';
import EditableCell from './EditableCell';
import InstitutionPicker from './InstitutionPicker';

interface Props {
  deductions: Deduction[];
  monthlyDeductions: MonthlyDeduction[];
  institutions: Institution[];
  totals: number[];
  onDeductionChange: (deductionId: string, month: number, value: number, note?: string) => void;
  onAddDeduction: (description: string) => void;
  onDeleteDeduction: (id: string) => void;
  onDeductionInstitutionAssign: (deductionId: string, institutionId: string | null) => void;
}

export default function DeductionsTable({
  deductions,
  monthlyDeductions,
  institutions,
  totals,
  onDeductionChange,
  onAddDeduction,
  onDeleteDeduction,
  onDeductionInstitutionAssign,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [newDesc, setNewDesc] = useState('');
  const [activePicker, setActivePicker] = useState<string | null>(null);
  const [pickerAnchor, setPickerAnchor] = useState<DOMRect | null>(null);

  const getEntry = (deductionId: string, month: number) =>
    monthlyDeductions.find((d) => d.deduction_id === deductionId && d.month === month);

  const getInstitutionName = (institutionId: string | null) => {
    if (!institutionId) return null;
    return institutions.find((i) => i.id === institutionId)?.abbreviation?.trim() ||
      institutions.find((i) => i.id === institutionId)?.name ||
      null;
  };

  const handleAdd = () => {
    if (!newDesc.trim()) return;
    onAddDeduction(newDesc.trim());
    setNewDesc('');
    setShowForm(false);
  };

  const openPicker = (dedId: string, e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setPickerAnchor(rect);
    setActivePicker(activePicker === dedId ? null : dedId);
  };

  return (
    <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto" data-table-scroll>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-slate-600 text-white">
              <th className="sticky left-0 z-20 bg-slate-600 text-left px-4 py-3 font-semibold min-w-[255px]">
                SUBTRAÇÕES
              </th>
              {MONTHS_SHORT.map((m) => (
                <th key={m} className="px-3 py-3 text-center font-medium min-w-[90px]">
                  {m}
                </th>
              ))}
              <th className="min-w-[100px]" />
            </tr>
          </thead>
          <tbody>
            {deductions.map((ded, idx) => (
              <tr
                key={ded.id}
                className={`border-b border-slate-100 group hover:bg-slate-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}
              >
                <td className={`sticky left-0 z-10 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} group-hover:bg-slate-100 px-4 py-2 font-medium text-slate-700`}>
                  <div className="flex items-center justify-between gap-2">
                    <span>{ded.description}</span>
                    <button
                      onClick={() => onDeleteDeduction(ded.id)}
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 text-xs transition-opacity flex-shrink-0"
                      title="Remover"
                    >
                      ✕
                    </button>
                  </div>
                  <button
                    onClick={(e) => openPicker(ded.id, e)}
                    className={
                      ded.institution_id
                        ? 'text-[10px] text-slate-400 hover:text-slate-600 text-left transition-colors'
                        : 'text-[10px] text-slate-300 hover:text-slate-500 text-left transition-colors'
                    }
                    title="Clique para vincular a uma fatura"
                  >
                    {getInstitutionName(ded.institution_id) ?? '+ vincular fatura'}
                  </button>
                  {activePicker === ded.id && pickerAnchor && (
                    <InstitutionPicker
                      institutions={institutions}
                      currentId={ded.institution_id}
                      onSelect={(id) => onDeductionInstitutionAssign(ded.id, id)}
                      onClose={() => setActivePicker(null)}
                      anchorRect={pickerAnchor}
                    />
                  )}
                </td>
                {MONTHS_SHORT.map((_, mi) => {
                  const entry = getEntry(ded.id, mi + 1);
                  return (
                    <td key={mi} className="px-2 py-1">
                      <div className="flex flex-col gap-0.5">
                        <EditableCell
                          value={entry?.amount ?? 0}
                          note={entry?.note ?? null}
                          onChange={(val) => onDeductionChange(ded.id, mi + 1, val)}
                        />
                        <NoteToggle
                          note={entry?.note ?? ''}
                          onSave={(note) => onDeductionChange(ded.id, mi + 1, entry?.amount ?? 0, note)}
                        />
                      </div>
                    </td>
                  );
                })}
                <td />
              </tr>
            ))}

            {showForm && (
              <tr className="border-b border-blue-200 bg-blue-50">
                <td className="sticky left-0 z-10 bg-blue-50 px-4 py-2">
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      placeholder="Descrição"
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setShowForm(false); }}
                      className="border border-slate-300 rounded px-2 py-1 text-sm w-48 bg-white text-slate-800 outline-none focus:border-blue-500"
                    />
                    <button onClick={handleAdd} className="bg-blue-600 text-white rounded px-3 py-1 text-xs hover:bg-blue-700">
                      OK
                    </button>
                    <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 text-xs">
                      Cancelar
                    </button>
                  </div>
                </td>
                <td colSpan={13} />
              </tr>
            )}

            <tr className="bg-slate-100 border-t-2 border-slate-300 font-semibold text-slate-700">
              <td className="sticky left-0 z-10 bg-slate-100 px-4 py-2">
                <div className="flex items-center justify-between">
                  <span>TOTAL SUBTRAÇÕES</span>
                  {!showForm && (
                    <button
                      onClick={() => setShowForm(true)}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                    >
                      + Adicionar
                    </button>
                  )}
                </div>
              </td>
              {totals.map((val, mi) => (
                <td key={mi} className="px-2 py-2 text-right text-slate-700">
                  {formatCurrency(val)}
                </td>
              ))}
              <td />
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

function NoteToggle({ note, onSave }: { note: string; onSave: (n: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(note);

  if (!note && !editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="text-[10px] text-slate-300 hover:text-slate-500 text-right w-full"
      >
        + obs
      </button>
    );
  }

  if (editing) {
    return (
      <input
        autoFocus
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={() => { onSave(val); setEditing(false); }}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') { onSave(val); setEditing(false); } }}
        placeholder="Observação"
        className="w-full text-xs border border-amber-300 rounded px-1 py-0.5 outline-none bg-white text-slate-800"
      />
    );
  }

  return (
    <button
      onClick={() => { setVal(note); setEditing(true); }}
      className="text-[10px] text-amber-500 hover:text-amber-700 text-right w-full italic truncate"
    >
      {note}
    </button>
  );
}
