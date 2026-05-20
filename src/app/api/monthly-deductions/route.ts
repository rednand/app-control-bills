import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { MonthlyDeduction } from '@/lib/models/MonthlyDeduction';

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const owner = session.user?.email ?? '';
  if (!owner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { deductionId, month, year, amount, note } = await req.json();

  await connectToDatabase();
  await MonthlyDeduction.findOneAndUpdate(
    { deduction_id: deductionId, month, year, owner },
    { $set: { amount, owner, ...(note !== undefined && { note }) } },
    { upsert: true }
  );

  return new NextResponse(null, { status: 204 });
}
