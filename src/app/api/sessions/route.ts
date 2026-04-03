import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { generateCode, generateSecretKey } from '@/lib/utils';

const CreateSessionSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  timerEnabled: z.boolean().optional(),
  timerDuration: z.number().int().min(30).max(600).optional(),
  anonymousMode: z.boolean().optional(),
  allowLateJoin: z.boolean().optional(),
  allowEdits: z.boolean().optional(),
  revealAfterEach: z.boolean().optional(),
});

// Rate limit: simple in-memory store (replace with Redis in production)
const createCounts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const window = 60_000; // 1 minute
  const limit = 10;
  const entry = createCounts.get(ip);
  if (!entry || entry.resetAt < now) {
    createCounts.set(ip, { count: 1, resetAt: now + window });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = CreateSessionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  // Load all rounds and build a randomized session structure
  const allRounds = await prisma.round.findMany({ orderBy: { orderIndex: 'asc' } });
  if (allRounds.length === 0) {
    return NextResponse.json(
      { error: 'No rounds found. Run `npm run db:seed` first.' },
      { status: 500 },
    );
  }

  // Separate into pools by category and bonus status
  const shuffle = <T>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const pick = <T>(arr: T[], n: number): T[] => shuffle(arr).slice(0, n);

  const standardPool = allRounds.filter((r) => r.category === 'standard' && !r.isBonus);
  const complexPool = allRounds.filter((r) => r.category === 'complex' && !r.isBonus);
  const deescalPool = allRounds.filter((r) => r.category === 'de-escalation' && !r.isBonus);
  const bonusStandard = allRounds.filter((r) => r.isBonus && r.category === 'standard');
  const bonusComplex = allRounds.filter((r) => r.isBonus && r.category === 'complex');
  const bonusDeescal = allRounds.filter((r) => r.isBonus && r.category === 'de-escalation');

  // Pick from each pool (fall back to full list if pool is too small)
  const std = pick(standardPool.length >= 2 ? standardPool : allRounds.filter((r) => !r.isBonus), 2);
  const bs = pick(bonusStandard.length >= 1 ? bonusStandard : allRounds.filter((r) => r.isBonus), 1);
  const cpx = pick(complexPool.length >= 3 ? complexPool : allRounds.filter((r) => !r.isBonus), 3);
  const bc = pick(bonusComplex.length >= 1 ? bonusComplex : allRounds.filter((r) => r.isBonus), 1);
  const de = pick(deescalPool.length >= 2 ? deescalPool : allRounds.filter((r) => !r.isBonus), 2);
  const bd = pick(bonusDeescal.length >= 1 ? bonusDeescal : allRounds.filter((r) => r.isBonus), 1);

  // Interleave: [std, std, bonus(std), cpx, cpx, cpx, bonus(cpx), de-escal, de-escal, bonus(de-escal)]
  const selectedRounds = [std[0], std[1], bs[0], cpx[0], cpx[1], cpx[2], bc[0], de[0], de[1], bd[0]]
    .filter(Boolean);

  const session = await prisma.session.create({
    data: {
      code: generateCode(),
      adminKey: generateSecretKey(),
      title: data.title ?? 'The GOLD Standard Game',
      timerEnabled: data.timerEnabled ?? false,
      timerDuration: data.timerDuration ?? 120,
      anonymousMode: data.anonymousMode ?? false,
      allowLateJoin: data.allowLateJoin ?? true,
      allowEdits: data.allowEdits ?? true,
      revealAfterEach: data.revealAfterEach ?? true,
      sessionRounds: {
        create: selectedRounds.map((r, idx) => ({
          roundId: r.id,
          orderIndex: idx,
        })),
      },
    },
    include: {
      sessionRounds: {
        include: { round: true },
        orderBy: { orderIndex: 'asc' },
      },
    },
  });

  return NextResponse.json({
    id: session.id,
    code: session.code,
    adminKey: session.adminKey,
    title: session.title,
    joinUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/join/${session.code}`,
    adminUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/admin/sessions/${session.id}?key=${session.adminKey}`,
  });
}
