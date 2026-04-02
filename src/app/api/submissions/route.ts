import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { scoreResponse } from '@/lib/scoring';

const SubmitSchema = z.object({
  sessionRoundId: z.string().min(1),
  participantId: z.string().min(1),
  sessionKey: z.string().min(1),
  responseText: z.string().min(10, 'Response must be at least 10 characters').max(2000),
});

// Rate limit submissions
const submitCounts = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(participantId: string): boolean {
  const now = Date.now();
  const entry = submitCounts.get(participantId);
  if (!entry || entry.resetAt < now) {
    submitCounts.set(participantId, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = SubmitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { sessionRoundId, participantId, sessionKey, responseText } = parsed.data;

  if (!checkRateLimit(participantId)) {
    return NextResponse.json({ error: 'Too many submissions. Wait a moment.' }, { status: 429 });
  }

  // Verify participant owns this session key
  const participant = await prisma.participant.findUnique({
    where: { id: participantId },
    include: { session: true },
  });
  if (!participant || participant.sessionKey !== sessionKey) {
    return NextResponse.json({ error: 'Invalid participant credentials.' }, { status: 403 });
  }

  // Verify the session round is active
  const sessionRound = await prisma.sessionRound.findUnique({
    where: { id: sessionRoundId },
    include: { round: true },
  });
  if (!sessionRound || sessionRound.sessionId !== participant.sessionId) {
    return NextResponse.json({ error: 'Round not found.' }, { status: 404 });
  }
  if (sessionRound.status !== 'ACTIVE') {
    return NextResponse.json({ error: 'This round is not currently accepting submissions.' }, { status: 400 });
  }

  // Check for existing submission
  const existing = await prisma.submission.findFirst({
    where: { sessionRoundId, participantId },
  });

  if (existing) {
    // Allow edit if session permits and round is still open
    if (!participant.session.allowEdits) {
      return NextResponse.json({ error: 'Edits are not allowed after submitting.' }, { status: 400 });
    }
    // Score the updated response
    const scored = await scoreResponse(responseText, sessionRound.round.scenario, sessionRound.round.isBonus);
    const updated = await prisma.submission.update({
      where: { id: existing.id },
      data: {
        responseText,
        empathyScore: scored.empathyScore,
        toneScore: scored.toneScore,
        totalScore: scored.totalScore,
        bonusMultiplier: sessionRound.round.isBonus ? 2.0 : 1.0,
        finalScore: scored.finalScore,
        feedback: scored.feedback,
        improvementTip: scored.improvementTip,
        scoredAt: new Date(),
        manualOverride: false,
      },
    });
    return NextResponse.json({ submission: updated, updated: true });
  }

  // Score the response
  const scored = await scoreResponse(responseText, sessionRound.round.scenario, sessionRound.round.isBonus);

  const submission = await prisma.submission.create({
    data: {
      sessionRoundId,
      participantId,
      responseText,
      empathyScore: scored.empathyScore,
      toneScore: scored.toneScore,
      totalScore: scored.totalScore,
      bonusMultiplier: sessionRound.round.isBonus ? 2.0 : 1.0,
      finalScore: scored.finalScore,
      feedback: scored.feedback,
      improvementTip: scored.improvementTip,
      scoredAt: new Date(),
    },
  });

  return NextResponse.json({ submission, updated: false });
}
