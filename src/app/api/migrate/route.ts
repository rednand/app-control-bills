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
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const owner: string = body.email || session.user?.email || '';
  if (!owner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectToDatabase();

  const filter = { $or: [{ owner: { $exists: false } }, { owner: null }, { owner: '' }] };

  const [i, inv, d, md, sc] = await Promise.all([
    Institution.updateMany(filter, { $set: { owner } }),
    Invoice.updateMany(filter, { $set: { owner } }),
    Deduction.updateMany(filter, { $set: { owner } }),
    MonthlyDeduction.updateMany(filter, { $set: { owner } }),
    SalaryConfig.updateMany(filter, { $set: { owner } }),
  ]);

  return NextResponse.json({
    message: `Migração concluída para ${owner}`,
    updated: {
      institutions: i.modifiedCount,
      invoices: inv.modifiedCount,
      deductions: d.modifiedCount,
      monthlyDeductions: md.modifiedCount,
      salaryConfigs: sc.modifiedCount,
    },
  });
}
