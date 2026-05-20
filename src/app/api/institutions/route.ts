import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Institution } from '@/lib/models/Institution';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const owner = session.user?.email ?? '';
  if (!owner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { name, due_day, payment_installment, position } = await req.json();

  await connectToDatabase();
  const doc = await Institution.create({ name, due_day, payment_installment, position, owner });
  const { _id, __v, ...rest } = doc.toObject();
  return NextResponse.json({ id: String(_id), ...rest }, { status: 201 });
}
