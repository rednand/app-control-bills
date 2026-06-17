'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Deduction, Institution, MonthCalc, MonthlyDeduction, MonthlyInvoice, SalaryConfig } from '@/lib/types';
import InvoicesTable from './InvoicesTable';
import DeductionsTable from './DeductionsTable';
import SalarySection from './SalarySection';
import MobileMonthView from './MobileMonthView';
import LoginPage from './LoginPage';

const CURRENT_YEAR = new Date().getFullYear();
const CURRENT_MONTH = new Date().getMonth() + 1;

export default function BillsApp() {
  const { data: session, status } = useSession();
  const [year, setYear] = useState(new Date().getFullYear());
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [invoices, setInvoices] = useState<MonthlyInvoice[]>([]);
  const [deductions, setDeductions] = useState<Deduction[]>([]);
  const [monthlyDeductions, setMonthlyDeductions] = useState<MonthlyDeduction[]>([]);
  const [salaryConfigs, setSalaryConfigs] = useState<SalaryConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/data?year=${year}`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setInstitutions(data.institutions);
      setInvoices(data.invoices);
      setDeductions(data.deductions);
      setMonthlyDeductions(data.monthlyDeductions);
      setSalaryConfigs(data.salaryConfigs);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [year, session]);

  useEffect(() => {
    if (session) fetchData();
  }, [fetchData, session]);

  const handleInvoiceChange = async (institutionId: string, month: number, value: number) => {
    setInvoices((prev) => {
      const existing = prev.find((i) => i.institution_id === institutionId && i.month === month);
      if (existing) return prev.map((i) => i.institution_id === institutionId && i.month === month ? { ...i, amount: value } : i);
      return [...prev, { id: crypto.randomUUID(), institution_id: institutionId, month, year, amount: value }];
    });
    fetch('/api/invoices', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ institutionId, month, year, amount: value }) });
  };

  const handleDeductionChange = async (deductionId: string, month: number, value: number, note?: string) => {
    setMonthlyDeductions((prev) => {
      const existing = prev.find((d) => d.deduction_id === deductionId && d.month === month);
      const noteVal = note !== undefined ? note : existing?.note ?? null;
      if (existing) return prev.map((d) => d.deduction_id === deductionId && d.month === month ? { ...d, amount: value, note: noteVal } : d);
      return [...prev, { id: crypto.randomUUID(), deduction_id: deductionId, month, year, amount: value, note: noteVal }];
    });
    fetch('/api/monthly-deductions', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ deductionId, month, year, amount: value, note }) });
  };

  const handleSalaryChange = async (month: number, field: 'installment_1' | 'installment_2', value: number) => {
    setSalaryConfigs((prev) => {
      const existing = prev.find((s) => s.month === month);
      if (existing) return prev.map((s) => s.month === month ? { ...s, [field]: value } : s);
      return [...prev, { id: crypto.randomUUID(), month, year, installment_1: 0, installment_2: 0, [field]: value }];
    });
    fetch('/api/salary', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ month, year, field, value }) });
  };

  const handleAddInstitution = async (name: string, dueDay: number, installment: 1 | 2) => {
    const res = await fetch('/api/institutions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, due_day: dueDay, payment_installment: installment, position: institutions.length }),
    });
    if (res.ok) {
      const data = await res.json();
      setInstitutions((prev) => [...prev, data]);
    }
  };

  const handleDeleteInstitution = async (id: string) => {
    setInstitutions((prev) => prev.filter((i) => i.id !== id));
    setInvoices((prev) => prev.filter((i) => i.institution_id !== id));
    fetch(`/api/institutions/${id}`, { method: 'DELETE' });
  };

  const handleDeductionInstitutionAssign = (deductionId: string, institutionId: string | null) => {
    setDeductions((prev) =>
      prev.map((d) => (d.id === deductionId ? { ...d, institution_id: institutionId } : d))
    );
    fetch(`/api/deductions/${deductionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ institution_id: institutionId }),
    });
  };

  const handleInstallmentAssign = (institutionId: string, installment: 1 | 2 | null) => {
    setInstitutions((prev) =>
      prev.map((i) => (i.id === institutionId ? { ...i, payment_installment: installment } : i))
    );
    fetch(`/api/institutions/${institutionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payment_installment: installment }),
    });
  };

  const handleAbbreviationChange = (institutionId: string, abbreviation: string | null) => {
    setInstitutions((prev) =>
      prev.map((i) => (i.id === institutionId ? { ...i, abbreviation } : i))
    );
    fetch(`/api/institutions/${institutionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ abbreviation }),
    });
  };

  const handleAddDeduction = async (description: string) => {
    const res = await fetch('/api/deductions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description, position: deductions.length }),
    });
    if (res.ok) {
      const data = await res.json();
      setDeductions((prev) => [...prev, data]);
    }
  };

  const handleDeleteDeduction = async (id: string) => {
    setDeductions((prev) => prev.filter((d) => d.id !== id));
    setMonthlyDeductions((prev) => prev.filter((d) => d.deduction_id !== id));
    fetch(`/api/deductions/${id}`, { method: 'DELETE' });
  };

  const calculations = useMemo<MonthCalc[]>(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;

      const subtotalFatura = institutions.reduce((sum, inst) => {
        const inv = invoices.find((inv) => inv.institution_id === inst.id && inv.month === month);
        return sum + (inv?.amount ?? 0);
      }, 0);

      const totalSubtracoes = deductions.reduce((sum, ded) => {
        const md = monthlyDeductions.find((d) => d.deduction_id === ded.id && d.month === month);
        return sum + (md?.amount ?? 0);
      }, 0);

      const salary = salaryConfigs.find((s) => s.month === month);
      const inst1Salary = salary?.installment_1 ?? 0;
      const inst2Salary = salary?.installment_2 ?? 0;
      const salarioTotal = inst1Salary + inst2Salary;

      const inst1Total = institutions.filter((i) => i.payment_installment === 1).reduce((sum, inst) => {
        const inv = invoices.find((inv) => inv.institution_id === inst.id && inv.month === month);
        const invoiceAmount = inv?.amount ?? 0;
        const linked = deductions
          .filter((d) => d.institution_id === inst.id)
          .reduce((dSum, ded) => {
            const md = monthlyDeductions.find((m) => m.deduction_id === ded.id && m.month === month);
            return dSum + (md?.amount ?? 0);
          }, 0);
        return sum + Math.max(0, invoiceAmount - linked);
      }, 0);

      const inst2Total = institutions.filter((i) => i.payment_installment === 2).reduce((sum, inst) => {
        const inv = invoices.find((inv) => inv.institution_id === inst.id && inv.month === month);
        const invoiceAmount = inv?.amount ?? 0;
        const linked = deductions
          .filter((d) => d.institution_id === inst.id)
          .reduce((dSum, ded) => {
            const md = monthlyDeductions.find((m) => m.deduction_id === ded.id && m.month === month);
            return dSum + (md?.amount ?? 0);
          }, 0);
        return sum + Math.max(0, invoiceAmount - linked);
      }, 0);

      const totalFaturaLiquida = subtotalFatura - totalSubtracoes;

      return {
        month, subtotalFatura, totalSubtracoes, totalFaturaLiquida,
        inst1Salary, inst2Salary, salarioTotal, inst1Total, inst2Total,
        saldoPeriodo15: inst1Salary - inst1Total,
        saldoPeriodo30: inst2Salary - inst2Total,
        saldoRestante: salarioTotal - totalFaturaLiquida,
        percentComprometido: salarioTotal > 0 ? totalFaturaLiquida / salarioTotal : 0,
      };
    });
  }, [institutions, invoices, deductions, monthlyDeductions, salaryConfigs]);

  useEffect(() => {
    const containers = Array.from(document.querySelectorAll<HTMLElement>('[data-table-scroll]'));
    const handleScroll = (e: Event) => {
      const { scrollLeft } = e.target as HTMLElement;
      containers.forEach((c) => { if (c !== e.target) c.scrollLeft = scrollLeft; });
    };
    containers.forEach((c) => c.addEventListener('scroll', handleScroll, { passive: true }));
    return () => containers.forEach((c) => c.removeEventListener('scroll', handleScroll));
  }, [loading]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-slate-400 text-lg animate-pulse">Carregando...</div>
      </div>
    );
  }

  if (!session) return <LoginPage />;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-500 text-lg animate-pulse">Carregando dados...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen flex-col gap-4">
        <div className="text-red-600 font-medium text-lg">Erro ao conectar ao banco de dados</div>
        <div className="text-slate-500 text-sm font-mono bg-slate-100 px-4 py-2 rounded">{error}</div>
        <button onClick={fetchData} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white px-3 sm:px-6 py-3 sm:py-4 shadow-lg sticky top-0 z-30">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-2">
          <h1 className="text-base sm:text-xl font-bold tracking-tight truncate">Controle de Faturas</h1>
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <div className="flex items-center gap-1 sm:gap-2">
              <button onClick={() => setYear((y) => y - 1)} className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded hover:bg-slate-700 transition-colors text-slate-300 hover:text-white">‹</button>
              <span className="text-base sm:text-lg font-semibold tabular-nums w-14 sm:w-16 text-center">{year}</span>
              <button onClick={() => setYear((y) => y + 1)} className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded hover:bg-slate-700 transition-colors text-slate-300 hover:text-white">›</button>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 border-l border-slate-700 pl-2 sm:pl-4">
              {session.user?.image && <img src={session.user.image} alt="" className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex-shrink-0" />}
              <span className="text-sm text-slate-300 hidden sm:block">{session.user?.name}</span>
              <button onClick={() => signOut()} className="text-xs text-slate-400 hover:text-white transition-colors whitespace-nowrap">Sair</button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-2 sm:px-4 py-4 sm:py-6 flex flex-col gap-4 sm:gap-6">
        <div className="hidden md:flex flex-col gap-4 sm:gap-6">
          <InvoicesTable
            institutions={institutions} invoices={invoices}
            subtotals={calculations.map((c) => c.subtotalFatura)}
            currentMonth={year === CURRENT_YEAR ? CURRENT_MONTH : undefined}
            onInvoiceChange={handleInvoiceChange}
            onAddInstitution={handleAddInstitution}
            onDeleteInstitution={handleDeleteInstitution}
            onAbbreviationChange={handleAbbreviationChange}
          />
          <DeductionsTable
            deductions={deductions} monthlyDeductions={monthlyDeductions}
            institutions={institutions}
            totals={calculations.map((c) => c.totalSubtracoes)}
            currentMonth={year === CURRENT_YEAR ? CURRENT_MONTH : undefined}
            onDeductionChange={handleDeductionChange}
            onAddDeduction={handleAddDeduction}
            onDeleteDeduction={handleDeleteDeduction}
            onDeductionInstitutionAssign={handleDeductionInstitutionAssign}
          />
          <SalarySection
            institutions={institutions} calculations={calculations}
            salaryConfigs={salaryConfigs} onSalaryChange={handleSalaryChange}
            currentMonth={year === CURRENT_YEAR ? CURRENT_MONTH : undefined}
            onInstallmentAssign={handleInstallmentAssign}
          />
        </div>
        <div className="md:hidden">
          <MobileMonthView
            year={year}
            institutions={institutions}
            invoices={invoices}
            deductions={deductions}
            monthlyDeductions={monthlyDeductions}
            salaryConfigs={salaryConfigs}
            calculations={calculations}
            onInvoiceChange={handleInvoiceChange}
            onDeductionChange={handleDeductionChange}
            onSalaryChange={handleSalaryChange}
            onAddInstitution={handleAddInstitution}
            onDeleteInstitution={handleDeleteInstitution}
            onAddDeduction={handleAddDeduction}
            onDeleteDeduction={handleDeleteDeduction}
            onDeductionInstitutionAssign={handleDeductionInstitutionAssign}
            onInstallmentAssign={handleInstallmentAssign}
          />
        </div>
      </main>
    </div>
  );
}
