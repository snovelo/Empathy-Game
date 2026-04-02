import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';

// Simple SSE endpoint — clients poll every 3s as fallback, but this pushes state on connect
// For production, replace with Supabase Realtime or Pusher

export async function GET(
  req: NextRequest,
  { params }: { params: { sessionId: string } },
) {
  const sessionId = params.sessionId;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: unknown) => {
        const payload = `data: ${JSON.stringify(data)}\n\n`;
        try {
          controller.enqueue(encoder.encode(payload));
        } catch {
          // Client disconnected
        }
      };

      // Send initial state
      const session = await getSessionState(sessionId);
      if (session) send({ type: 'state', session });

      // Poll for changes every 2.5 seconds
      let lastStatus = session?.status;
      let lastRoundIndex = session?.currentRoundIndex;

      const interval = setInterval(async () => {
        try {
          const current = await getSessionState(sessionId);
          if (!current) {
            clearInterval(interval);
            controller.close();
            return;
          }

          if (
            current.status !== lastStatus ||
            current.currentRoundIndex !== lastRoundIndex
          ) {
            lastStatus = current.status;
            lastRoundIndex = current.currentRoundIndex;
            send({ type: 'state', session: current });
          }
        } catch {
          clearInterval(interval);
          try { controller.close(); } catch { /* ignore */ }
        }
      }, 2500);

      // Clean up on disconnect
      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        try { controller.close(); } catch { /* ignore */ }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}

async function getSessionState(sessionId: string) {
  return prisma.session.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      status: true,
      currentRoundIndex: true,
      title: true,
      timerEnabled: true,
      timerDuration: true,
      allowEdits: true,
      revealAfterEach: true,
      participants: {
        select: { id: true, displayName: true, teamName: true },
        orderBy: { joinedAt: 'asc' },
      },
      sessionRounds: {
        orderBy: { orderIndex: 'asc' },
        select: {
          id: true,
          orderIndex: true,
          status: true,
          startedAt: true,
          closedAt: true,
          round: {
            select: {
              id: true,
              title: true,
              scenario: true,
              task: true,
              isBonus: true,
              roboticResponse: true,
              facilitatorNote: true,
            },
          },
          submissions: {
            select: {
              id: true,
              participantId: true,
              empathyScore: true,
              toneScore: true,
              totalScore: true,
              finalScore: true,
              bonusMultiplier: true,
              feedback: true,
              improvementTip: true,
              manualOverride: true,
              submittedAt: true,
              participant: { select: { displayName: true, teamName: true } },
            },
          },
        },
      },
    },
  });
}
