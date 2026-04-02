import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: { sessionId: string } },
) {
  const session = await prisma.session.findUnique({
    where: { id: params.sessionId },
    include: {
      participants: {
        orderBy: { joinedAt: 'asc' },
        select: { id: true, displayName: true, teamName: true, joinedAt: true },
      },
      sessionRounds: {
        orderBy: { orderIndex: 'asc' },
        include: {
          round: true,
          submissions: {
            include: {
              participant: { select: { id: true, displayName: true, teamName: true } },
            },
          },
        },
      },
    },
  });

  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  return NextResponse.json(session);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { sessionId: string } },
) {
  const adminKey = req.headers.get('x-admin-key');
  const session = await prisma.session.findUnique({ where: { id: params.sessionId } });
  if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (session.adminKey !== adminKey) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const updated = await prisma.session.update({
    where: { id: params.sessionId },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.timerEnabled !== undefined && { timerEnabled: body.timerEnabled }),
      ...(body.timerDuration !== undefined && { timerDuration: body.timerDuration }),
      ...(body.allowEdits !== undefined && { allowEdits: body.allowEdits }),
      ...(body.revealAfterEach !== undefined && { revealAfterEach: body.revealAfterEach }),
      ...(body.allowLateJoin !== undefined && { allowLateJoin: body.allowLateJoin }),
    },
  });
  return NextResponse.json(updated);
}
