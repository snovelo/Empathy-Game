import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { sessionId: string } },
) {
  const adminKey = req.headers.get('x-admin-key') ?? req.nextUrl.searchParams.get('key') ?? '';

  const session = await prisma.session.findUnique({
    where: { id: params.sessionId },
    include: {
      sessionRounds: {
        orderBy: { orderIndex: 'asc' },
        include: {
          round: true,
          submissions: {
            include: {
              participant: { select: { displayName: true, teamName: true } },
            },
            orderBy: { submittedAt: 'asc' },
          },
        },
      },
    },
  });

  if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (session.adminKey !== adminKey) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const rows: string[] = [
    [
      'Round',
      'Bonus',
      'Participant',
      'Team',
      'Response',
      'Empathy Score',
      'Tone Score',
      'Ownership Score',
      'Total Score',
      'Bonus Multiplier',
      'Final Score',
      'Feedback',
      'Improvement Tip',
      'Manual Override',
      'Submitted At',
    ]
      .map(csvEscape)
      .join(','),
  ];

  for (const sr of session.sessionRounds) {
    for (const sub of sr.submissions) {
      rows.push(
        [
          sr.round.title,
          sr.round.isBonus ? 'Yes' : 'No',
          sub.participant.displayName,
          sub.participant.teamName,
          sub.responseText,
          sub.empathyScore ?? '',
          sub.toneScore ?? '',
          sub.ownershipScore ?? '',
          sub.totalScore ?? '',
          sub.bonusMultiplier,
          sub.finalScore ?? '',
          sub.feedback ?? '',
          sub.improvementTip ?? '',
          sub.manualOverride ? 'Yes' : 'No',
          sub.submittedAt.toISOString(),
        ]
          .map(String)
          .map(csvEscape)
          .join(','),
      );
    }
  }

  const csv = rows.join('\n');
  const filename = `empathy-game-${session.code}-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}

function csvEscape(value: string): string {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
