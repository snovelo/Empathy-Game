import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: { sessionId: string } },
) {
  const adminKey = req.headers.get('x-admin-key');
  const session = await prisma.session.findUnique({ where: { id: params.sessionId } });

  if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (session.adminKey !== adminKey) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await prisma.session.update({
    where: { id: params.sessionId },
    data: { status: 'COMPLETED' },
  });

  return NextResponse.json({ ok: true });
}
