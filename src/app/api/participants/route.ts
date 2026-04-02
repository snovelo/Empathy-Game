import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { generateSecretKey } from '@/lib/utils';

const JoinSchema = z.object({
  sessionCode: z.string().min(1).max(10).transform((s) => s.toUpperCase().trim()),
  displayName: z.string().min(1).max(60).trim(),
  teamName: z.string().min(1).max(60).trim(),
  // If provided, try to rejoin existing participant
  sessionKey: z.string().optional(),
});

// Rate limit joins
const joinCounts = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = joinCounts.get(ip);
  if (!entry || entry.resetAt < now) {
    joinCounts.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 20) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = JoinSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { sessionCode, displayName, teamName, sessionKey } = parsed.data;

  const session = await prisma.session.findUnique({ where: { code: sessionCode } });
  if (!session) {
    return NextResponse.json({ error: 'Session not found. Check the code and try again.' }, { status: 404 });
  }
  if (session.status === 'COMPLETED') {
    return NextResponse.json({ error: 'This session has ended.' }, { status: 400 });
  }
  if (session.status === 'ACTIVE' && !session.allowLateJoin) {
    return NextResponse.json({ error: 'This session is already in progress and is not accepting new participants.' }, { status: 400 });
  }

  // Attempt rejoin
  if (sessionKey) {
    const existing = await prisma.participant.findUnique({ where: { sessionKey } });
    if (existing && existing.sessionId === session.id) {
      return NextResponse.json({
        participantId: existing.id,
        sessionKey: existing.sessionKey,
        sessionId: session.id,
        displayName: existing.displayName,
        teamName: existing.teamName,
        rejoined: true,
      });
    }
  }

  // Check for duplicate display names in session
  const dupe = await prisma.participant.findFirst({
    where: { sessionId: session.id, displayName: { equals: displayName } },
  });
  if (dupe) {
    return NextResponse.json(
      { error: 'That name is already taken in this session. Please choose a different name.' },
      { status: 400 },
    );
  }

  const participant = await prisma.participant.create({
    data: {
      sessionId: session.id,
      displayName,
      teamName,
      sessionKey: generateSecretKey(),
    },
  });

  return NextResponse.json({
    participantId: participant.id,
    sessionKey: participant.sessionKey,
    sessionId: session.id,
    displayName: participant.displayName,
    teamName: participant.teamName,
    rejoined: false,
  });
}
