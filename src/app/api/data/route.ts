import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Institution } from '@/lib/models/Institution';
import { Invoice } from '@/lib/models/Invoice';
import { Deduction } from '@/lib/models/Deduction';
import { MonthlyDeduction } from '@/lib/models/MonthlyDeduction';
import { SalaryConfig } from '@/lib/models/SalaryConfig';

type WithId = { _id: unknown; __v?: unknown };

function toPlain<T extends WithId>(doc: T) {
  const { _id, __v, ...rest } = doc;
  return { id: String(_id), ...rest };
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const year = Number(req.nextUrl.searchParams.get('year'));
  if (!year) return NextResponse.json({ error: 'Missing year' }, { status: 400 });

  const owner = session.user?.email ?? '';
  if (!owner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectToDatabase();

  const [institutions, invoices, deductions, monthlyDeductions, salaryConfigs] = await Promise.all([
    Institution.find({ owner }).sort('position').lean<(WithId & { name: string; due_day: number; payment_installment: number | null; position: number; abbreviation: string | null })[]>(),
    Invoice.find({ year, owner }).lean<(WithId & { institution_id: unknown; month: number; year: number; amount: number })[]>(),
    Deduction.find({ owner }).sort('position').lean<(WithId & { description: string; position: number; institution_id: string | null })[]>(),
    MonthlyDeduction.find({ year, owner }).lean<(WithId & { deduction_id: unknown; month: number; year: number; amount: number; note: string | null })[]>(),
    SalaryConfig.find({ year, owner }).lean<(WithId & { month: number; year: number; installment_1: number; installment_2: number })[]>(),
  ]);

  return NextResponse.json({
    institutions: institutions.map(toPlain),
    invoices: invoices.map((d) => ({ ...toPlain(d), institution_id: String(d.institution_id) })),
    deductions: deductions.map(toPlain),
    monthlyDeductions: monthlyDeductions.map((d) => ({ ...toPlain(d), deduction_id: String(d.deduction_id) })),
    salaryConfigs: salaryConfigs.map(toPlain),
  });
}
