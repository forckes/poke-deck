import { NextResponse } from 'next/server'
import { crashGameService } from '@/server/services/crashgame.service'
import prisma from '@/lib/prisma'

export async function GET() {
  const state = crashGameService.getState();
  // Fetch last 10 rounds that have already crashed
  const history = await prisma.crashGameRound.findMany({
    where: {
      createdAt: {
        lt: new Date()
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });
  // Filter history to ensure we only show rounds that have ended.
  // In the service, the round is created with 1.00 and updated to its final crashPoint at the start.
  // So if a round is currently active, we might want to exclude it from history until it crashes.
  const activeRoundId = state.roundId;
  const filteredHistory = history.filter(r => r.id !== activeRoundId);

  return NextResponse.json({ ...state, history: filteredHistory });
}

export async function POST() {
  crashGameService.startEngine();
  return NextResponse.json({ success: true });
}
