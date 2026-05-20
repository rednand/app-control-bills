import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Invoice } from '@/lib/models/Invoice';

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const owner = session.user?.email ?? '';
  if (!owner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { institutionId, month, year, amount } = await req.json();

  await connectToDatabase();
  await Invoice.findOneAndUpdate(
    { institution_id: institutionId, month, year, owner },
    { $set: { amount, owner } },
    { upsert: true }
  );

  return new NextResponse(null, { status: 204 });
}
