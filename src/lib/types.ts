export type PaymentInstallment = 1 | 2;

export interface Institution {
  id: string;
  name: string;
  due_day: number;
  payment_installment: PaymentInstallment | null;
  position: number;
  abbreviation: string | null;
}

export interface MonthlyInvoice {
  id: string;
  institution_id: string;
  month: number;
  year: number;
  amount: number;
}

export interface Deduction {
  id: string;
  description: string;
  position: number;
  salary_period: 1 | 2 | null;
}

export interface MonthlyDeduction {
  id: string;
  deduction_id: string;
  month: number;
  year: number;
  amount: number;
  note: string | null;
}

export interface SalaryConfig {
  id: string;
  month: number;
  year: number;
  installment_1: number;
  installment_2: number;
}

export interface MonthCalc {
  month: number;
  subtotalFatura: number;
  totalSubtracoes: number;
  totalFaturaLiquida: number;
  inst1Salary: number;
  inst2Salary: number;
  salarioTotal: number;
  inst1Total: number;
  inst2Total: number;
  ded1Total: number;
  ded2Total: number;
  saldoPeriodo15: number;
  saldoPeriodo30: number;
  saldoRestante: number;
  percentComprometido: number;
}
