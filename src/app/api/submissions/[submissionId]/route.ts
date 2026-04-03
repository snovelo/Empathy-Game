import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

const OverrideSchema = z.object({
  empathyScore: z.number().int().min(1).max(5),
  toneScore: z.number().int().min(1).max(5),
  ownershipScore: z.number().int().min(1).max(5).optional(),
  feedback: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { submissionId: string } },
) {
  const adminKey = req.headers.get('x-admin-key');

  const submission = await prisma.submission.findUnique({
    where: { id: params.submissionId },
    include: {
      sessionRound: {
        include: { session: true, round: true },
      },
    },
  });

  if (!submission) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (submission.sessionRound.session.adminKey !== adminKey) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = OverrideSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { empathyScore, toneScore, ownershipScore, feedback } = parsed.data;
  const effectiveOwnership = ownershipScore ?? submission.ownershipScore ?? 1;
  const totalScore = empathyScore + toneScore + effectiveOwnership;
  const finalScore = totalScore * submission.bonusMultiplier;

  const updated = await prisma.submission.update({
    where: { id: params.submissionId },
    data: {
      empathyScore,
      toneScore,
      ownershipScore: effectiveOwnership,
      totalScore,
      finalScore,
      ...(feedback !== undefined && { feedback }),
      manualOverride: true,
      scoredAt: new Date(),
    },
  });

  return NextResponse.json(updated);
}
