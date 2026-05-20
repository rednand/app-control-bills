import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Institution } from '@/lib/models/Institution';
import { Invoice } from '@/lib/models/Invoice';
import { Deduction } from '@/lib/models/Deduction';
import { MonthlyDeduction } from '@/lib/models/MonthlyDeduction';
import { SalaryConfig } from '@/lib/models/SalaryConfig';

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  const validSecret = secret && secret === process.env.SEED_SECRET;

  const session = validSecret ? null : await getServerSession(authOptions);
  if (!validSecret && !session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({ force: false }));
  const { force } = body;
  const seedOwner: string = body.email || session?.user?.email || 'seed@local';

  await connectToDatabase();

  const existing = await Institution.countDocuments();
  if (existing > 0 && !force) {
    return NextResponse.json({ message: 'Dados já existem. Envie { "force": true } para sobrescrever.' }, { status: 409 });
  }

  if (force) {
    await Promise.all([
      Institution.deleteMany({}),
      Invoice.deleteMany({}),
      Deduction.deleteMany({}),
      MonthlyDeduction.deleteMany({}),
      SalaryConfig.deleteMany({}),
    ]);
  }

  // Instituições
  const [itau, nubank, mp, digio, sams] = await Institution.insertMany([
    { name: 'ITAU',         due_day: 20, payment_installment: 1, position: 0, owner: seedOwner },
    { name: 'NUBANK',       due_day: 2,  payment_installment: 2, position: 1, owner: seedOwner },
    { name: 'MERCADO PAGO', due_day: 17, payment_installment: 1, position: 2, owner: seedOwner },
    { name: 'DIGIO',        due_day: 1,  payment_installment: 2, position: 3, owner: seedOwner },
    { name: 'SAMS CLUB',    due_day: 17, payment_installment: 1, position: 4, owner: seedOwner },
  ]);

  // Faturas mensais 2026
  await Invoice.insertMany([
    { institution_id: itau._id,   month: 4, year: 2026, amount: 779.00 },
    { institution_id: nubank._id, month: 4, year: 2026, amount: 717.74 },
    { institution_id: nubank._id, month: 5, year: 2026, amount: 756.65 },
    { institution_id: nubank._id, month: 6, year: 2026, amount: 380.48 },
    { institution_id: mp._id,     month: 4, year: 2026, amount: 1623.48 },
    { institution_id: mp._id,     month: 5, year: 2026, amount: 1887.27 },
    { institution_id: mp._id,     month: 6, year: 2026, amount: 833.99 },
    { institution_id: digio._id,  month: 4, year: 2026, amount: 225.15 },
    { institution_id: digio._id,  month: 5, year: 2026, amount: 153.54 },
    { institution_id: digio._id,  month: 6, year: 2026, amount: 18.90 },
    { institution_id: digio._id,  month: 7, year: 2026, amount: 18.90 },
    { institution_id: sams._id,   month: 4, year: 2026, amount: 1816.72 },
    { institution_id: sams._id,   month: 5, year: 2026, amount: 658.74 },
  ]);

  // Subtrações
  const [samuel, airbnbMichele, nayla, airbnbTaina, celTaina] = await Deduction.insertMany([
    { description: 'Parte Samuel',   position: 0, owner: seedOwner },
    { description: 'Airbnb Michele', position: 1, owner: seedOwner },
    { description: 'Celular Nayla',  position: 2, owner: seedOwner },
    { description: 'Airbnb Tainã',   position: 3, owner: seedOwner },
    { description: 'Celular Taina',  position: 4, owner: seedOwner },
  ]);

  await MonthlyDeduction.insertMany([
    { deduction_id: samuel._id,        month: 4, year: 2026, amount: 390.00, note: null,    owner: seedOwner },
    { deduction_id: airbnbMichele._id, month: 4, year: 2026, amount: 236.00, note: null,    owner: seedOwner },
    { deduction_id: airbnbMichele._id, month: 5, year: 2026, amount: 0,      note: 'NP236', owner: seedOwner },
    { deduction_id: airbnbMichele._id, month: 6, year: 2026, amount: 0,      note: 'NP236', owner: seedOwner },
    { deduction_id: airbnbMichele._id, month: 7, year: 2026, amount: 0,      note: 'NP236', owner: seedOwner },
    { deduction_id: nayla._id,         month: 4, year: 2026, amount: 222.41, note: null,    owner: seedOwner },
    { deduction_id: airbnbTaina._id,   month: 4, year: 2026, amount: 236.00, note: null,    owner: seedOwner },
    { deduction_id: airbnbTaina._id,   month: 5, year: 2026, amount: 0,      note: 'NP236', owner: seedOwner },
    { deduction_id: airbnbTaina._id,   month: 6, year: 2026, amount: 0,      note: 'NP236', owner: seedOwner },
    { deduction_id: airbnbTaina._id,   month: 7, year: 2026, amount: 0,      note: 'NP236', owner: seedOwner },
    { deduction_id: celTaina._id,      month: 4, year: 2026, amount: 180.00, note: null,    owner: seedOwner },
  ]);

  // Salário 2026
  await SalaryConfig.insertMany([
    { month: 4,  year: 2026, installment_1: 3038.00, installment_2: 3126.06, owner: seedOwner },
    { month: 5,  year: 2026, installment_1: 2633.00, installment_2: 3066.00, owner: seedOwner },
    { month: 6,  year: 2026, installment_1: 3038.00, installment_2: 3126.06, owner: seedOwner },
    { month: 7,  year: 2026, installment_1: 3038.00, installment_2: 3126.06, owner: seedOwner },
    { month: 8,  year: 2026, installment_1: 3038.00, installment_2: 3126.06, owner: seedOwner },
    { month: 9,  year: 2026, installment_1: 3038.00, installment_2: 3126.06, owner: seedOwner },
    { month: 10, year: 2026, installment_1: 3038.00, installment_2: 3126.06, owner: seedOwner },
  ]);

  return NextResponse.json({ message: 'Dados inseridos com sucesso!' });
}
