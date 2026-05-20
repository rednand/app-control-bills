import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { SalaryConfig } from '@/lib/models/SalaryConfig';

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const owner = session.user?.email ?? '';
  if (!owner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { month, year, field, value } = await req.json();

  await connectToDatabase();
  await SalaryConfig.findOneAndUpdate(
    { month, year, owner },
    { $set: { [field]: value, owner } },
    { upsert: true }
  );

  return new NextResponse(null, { status: 204 });
}
