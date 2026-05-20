import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Deduction } from '@/lib/models/Deduction';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const owner = session.user?.email ?? '';
  if (!owner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { description, position } = await req.json();

  await connectToDatabase();
  const doc = await Deduction.create({ description, position, owner });
  const { _id, __v, ...rest } = doc.toObject();
  return NextResponse.json({ id: String(_id), ...rest }, { status: 201 });
}
