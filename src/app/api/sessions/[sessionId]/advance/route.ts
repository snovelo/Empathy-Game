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
  if (session.status !== 'ACTIVE') {
    return NextResponse.json({ error: 'Session not active' }, { status: 400 });
  }

  const currentIdx = session.currentRoundIndex;
  const currentRound = session.sessionRounds[currentIdx];
  const nextRound = session.sessionRounds[currentIdx + 1];

  const ops = [];

  // Close current round
  if (currentRound) {
    ops.push(
      prisma.sessionRound.update({
        where: { id: currentRound.id },
        data: { status: 'CLOSED', closedAt: new Date() },
      }),
    );
  }

  if (!nextRound) {
    // All rounds done — end session
    ops.push(
      prisma.session.update({
        where: { id: params.sessionId },
        data: { status: 'COMPLETED' },
      }),
    );
    await prisma.$transaction(ops);
    return NextResponse.json({ done: true });
  }

  // Advance to next round
  ops.push(
    prisma.session.update({
      where: { id: params.sessionId },
      data: { currentRoundIndex: currentIdx + 1 },
    }),
    prisma.sessionRound.update({
      where: { id: nextRound.id },
      data: { status: 'ACTIVE', startedAt: new Date() },
    }),
  );

  await prisma.$transaction(ops);
  return NextResponse.json({ done: false, currentRoundIndex: currentIdx + 1 });
}
