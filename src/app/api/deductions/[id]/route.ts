import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Deduction } from '@/lib/models/Deduction';

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const owner = session.user?.email ?? '';
  if (!owner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  await connectToDatabase();
  await Deduction.findOneAndDelete({ _id: id, owner });
  return new NextResponse(null, { status: 204 });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const owner = session.user?.email ?? '';
  if (!owner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  await connectToDatabase();

  const updateFields: Record<string, unknown> = {};
  if ('institution_id' in body) updateFields.institution_id = body.institution_id ?? null;
  if ('abbreviation' in body) updateFields.abbreviation = body.abbreviation ?? null;

  const doc = await Deduction.findOneAndUpdate(
    { _id: id, owner },
    { $set: updateFields },
    { new: true, runValidators: true }
  ).lean<Record<string, unknown>>();

  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { _id, __v, ...rest } = doc;
  return NextResponse.json({ id: String(_id), ...rest });
}
