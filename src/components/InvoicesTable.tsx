'use client';

import { useState } from 'react';
import { Institution, MonthlyInvoice } from '@/lib/types';
import { MONTHS_SHORT, formatCurrency } from '@/lib/utils';
import EditableCell from './EditableCell';

interface Props {
  institutions: Institution[];
  invoices: MonthlyInvoice[];
  subtotals: number[];
  onInvoiceChange: (institutionId: string, month: number, value: number) => void;
  onAddInstitution: (name: string, dueDay: number, installment: 1 | 2) => void;
  onDeleteInstitution: (id: string) => void;
  onAbbreviationChange: (institutionId: string, abbreviation: string | null) => void;
}

export default function InvoicesTable({
  institutions,
  invoices,
  subtotals,
  onInvoiceChange,
  onAddInstitution,
  onDeleteInstitution,
  onAbbreviationChange,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDueDay, setNewDueDay] = useState('');
  const [newInstallment, setNewInstallment] = useState<1 | 2>(1);
  const [editingAbbr, setEditingAbbr] = useState<string | null>(null);
  const [abbrDraft, setAbbrDraft] = useState('');

  const getAmount = (institutionId: string, month: number) =>
    invoices.find((i) => i.institution_id === institutionId && i.month === month)?.amount ?? 0;

  const handleAdd = () => {
    const day = parseInt(newDueDay);
    if (!newName.trim() || isNaN(day) || day < 1 || day > 31) return;
    onAddInstitution(newName.trim().toUpperCase(), day, newInstallment);
    setNewName('');
    setNewDueDay('');
    setShowForm(false);
  };

  return (
    <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto" data-table-scroll>
        <table className="w-full text-sm border-collapse table-fixed">
          <thead>
            <tr className="bg-slate-800 text-white">
              <th className="sticky left-0 z-20 bg-slate-800 text-left px-4 py-3 font-semibold w-[255px]">
                CONTROLE DE FATURAS
              </th>
              {MONTHS_SHORT.map((m) => (
                <th key={m} className="px-3 py-3 text-center font-medium w-[90px]">
                  {m}
                </th>
              ))}
              <th className="sticky right-0 z-20 bg-slate-800 text-center px-3 py-3 font-medium w-[100px] shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.3)]">
                Vencimento
              </th>
            </tr>
          </thead>
          <tbody>
            {institutions.map((inst, idx) => (
              <tr
                key={inst.id}
                className={`border-b border-slate-100 group hover:bg-slate-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}
              >
                <td className={`sticky left-0 z-10 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} group-hover:bg-slate-100 px-4 py-2 font-medium text-slate-700`}>
                  <div className="flex items-center justify-between gap-2">
                    <span>{inst.name}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {editingAbbr === inst.id ? (
                        <input
                          autoFocus
                          value={abbrDraft}
                          onChange={(e) => setAbbrDraft(e.target.value)}
                          onBlur={() => {
                            onAbbreviationChange(inst.id, abbrDraft.trim() || null);
                            setEditingAbbr(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              onAbbreviationChange(inst.id, abbrDraft.trim() || null);
                              setEditingAbbr(null);
                            }
                            if (e.key === 'Escape') setEditingAbbr(null);
                          }}
                          placeholder="Abrev."
                          className="border border-slate-300 rounded px-1 py-0.5 text-xs w-16 bg-white text-slate-800 outline-none focus:border-slate-500"
                        />
                      ) : (
                        <button
                          onClick={() => { setEditingAbbr(inst.id); setAbbrDraft(inst.abbreviation ?? ''); }}
                          className="text-slate-400 hover:text-slate-600 text-xs"
                          title={inst.abbreviation ? `Abrev: ${inst.abbreviation}` : 'Definir abreviação'}
                        >
                          {inst.abbreviation ? inst.abbreviation : 'Ab.'}
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteInstitution(inst.id)}
                        className="text-red-400 hover:text-red-600 text-xs"
                        title="Remover"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </td>
                {MONTHS_SHORT.map((_, mi) => (
                  <td key={mi} className="px-2 py-1">
                    <EditableCell
                      value={getAmount(inst.id, mi + 1)}
                      onChange={(val) => onInvoiceChange(inst.id, mi + 1, val)}
                    />
                  </td>
                ))}
                <td className={`sticky right-0 z-10 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} group-hover:bg-slate-100 text-center px-3 py-2 text-slate-500 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)]`}>
                  Dia {inst.due_day}
                </td>
              </tr>
            ))}

            {showForm && (
              <tr className="border-b border-blue-200 bg-blue-50">
                <td className="sticky left-0 z-10 bg-blue-50 px-4 py-2">
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      placeholder="Nome da instituição"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setShowForm(false); }}
                      className="border border-slate-300 rounded px-2 py-1 text-sm w-36 bg-white text-slate-800 outline-none focus:border-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Vencimento"
                      min="1"
                      max="31"
                      value={newDueDay}
                      onChange={(e) => setNewDueDay(e.target.value)}
                      className="border border-slate-300 rounded px-2 py-1 text-sm w-14 bg-white text-slate-800 outline-none focus:border-blue-500"
                    />
                    <select
                      value={newInstallment}
                      onChange={(e) => setNewInstallment(Number(e.target.value) as 1 | 2)}
                      className="border border-slate-300 rounded px-2 py-1 text-sm bg-white text-slate-800 outline-none focus:border-blue-500"
                    >
                      <option value={1}>Parcela dia 15</option>
                      <option value={2}>Parcela dia 30</option>
                    </select>
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
                  <span>SUBTOTAL FATURA</span>
                  {!showForm && (
                    <button
                      onClick={() => setShowForm(true)}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                      title="Adicionar instituição"
                    >
                      + Adicionar
                    </button>
                  )}
                </div>
              </td>
              {subtotals.map((val, mi) => (
                <td key={mi} className="px-2 py-2 text-right text-slate-700">
                  {formatCurrency(val)}
                </td>
              ))}
              <td className="sticky right-0 z-10 bg-slate-100 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)]" />
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
