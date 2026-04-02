import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: { sessionId: string } },
) {
  const adminKey = req.headers.get('x-admin-key');
  const session = await prisma.session.findUnique({
    where: { id: params.sessionId },
    include: { sessionRounds: { orderBy: { orderIndex: 'asc' } } },
  });

  if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (session.adminKey !== adminKey) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (session.status !== 'WAITING') {
    return NextResponse.json({ error: 'Session already started' }, { status: 400 });
  }

  const firstRound = session.sessionRounds[0];
  if (!firstRound) return NextResponse.json({ error: 'No rounds configured' }, { status: 400 });

  await prisma.$transaction([
    prisma.session.update({
      where: { id: params.sessionId },
      data: { status: 'ACTIVE', currentRoundIndex: 0 },
    }),
    prisma.sessionRound.update({
      where: { id: firstRound.id },
      data: { status: 'ACTIVE', startedAt: new Date() },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
