import { NextResponse } from 'next/server'
import { crashGameState } from '@/server/services/crashgame.service'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { headers } from 'next/headers'
import { pusherServer } from '@/lib/pusherServer'

const GROWTH_RATE = 0.00006

export async function POST(req: Request) {
	try {
		const session = await auth.api.getSession({ headers: await headers() })
		const userId = session?.user?.id

		if (!userId)
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

		const bet = crashGameState.bets[userId]
		if (!bet)
			return NextResponse.json({ error: 'No bet placed' }, { status: 400 })
		if (bet.cashOutAt !== null)
			return NextResponse.json({ error: 'Already cashed out' }, { status: 400 })

		if (crashGameState.status !== 'playing') {
			return NextResponse.json(
				{ error: 'Game not running or already crashed' },
				{ status: 400 },
			)
		}

		const msElapsed = Date.now() - crashGameState.startTime!
		const currentMultiplier = Math.max(1.0, Math.exp(GROWTH_RATE * msElapsed))

		if (currentMultiplier >= crashGameState.crashPoint!) {
			return NextResponse.json({ error: 'Game crashed' }, { status: 400 })
		}

		const multiplierFixed = Math.floor(currentMultiplier * 100) / 100
		const winnings = Math.floor(bet.betAmount * multiplierFixed)

		await prisma.user.update({
			where: { id: userId },
			data: { coins: { increment: winnings } },
		})

		await prisma.crashGameBet.create({
			data: {
				roundId: crashGameState.roundId!,
				userId,
				username: bet.username,
				betAmount: bet.betAmount,
				cashOutAt: multiplierFixed,
				winnings,
			},
		})

		crashGameState.bets[userId].cashOutAt = multiplierFixed
		crashGameState.bets[userId].winnings = winnings

		await pusherServer.trigger('crash-game', 'cashout', {
			userId,
			multiplier: multiplierFixed,
			winnings,
		})

		return NextResponse.json({
			success: true,
			winnings,
			multiplier: multiplierFixed,
		})
	} catch (error) {
		return NextResponse.json({ error: 'Internal error' }, { status: 500 })
	}
}
