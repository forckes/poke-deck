import { NextResponse } from 'next/server'
import { crashGameState } from '@/server/services/crashgame.service'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { headers } from 'next/headers'
import { pusherServer } from '@/lib/pusherServer'

export async function POST(req: Request) {
	try {
		const session = await auth.api.getSession({ headers: await headers() })
		const userId = session?.user?.id
		const username = session?.user?.name || 'Player'

		if (!userId)
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

		const { betAmount, autoCashoutMultiplier } = await req.json()

		if (betAmount < 10 || betAmount > 5000) {
			return NextResponse.json(
				{ error: 'Bet must be between 10 and 5000' },
				{ status: 400 },
			)
		}

		if (crashGameState.status !== 'waiting') {
			return NextResponse.json(
				{ error: 'Round already started' },
				{ status: 400 },
			)
		}

		if (crashGameState.bets[userId]) {
			return NextResponse.json({ error: 'Already placed bet' }, { status: 400 })
		}

		const user = await prisma.user.findUnique({ where: { id: userId } })
		if (!user || user.coins < betAmount) {
			return NextResponse.json({ error: 'Insufficient coins' }, { status: 400 })
		}

		await prisma.user.update({
			where: { id: userId },
			data: { coins: { decrement: betAmount } },
		})

		crashGameState.bets[userId] = {
			username,
			betAmount,
			cashOutAt: null,
			winnings: null,
			autoCashoutMultiplier: autoCashoutMultiplier || null,
		}

		await pusherServer.trigger('crash-game', 'new-bet', {
			userId,
			username,
			betAmount,
		})

		return NextResponse.json({ success: true, coins: user.coins - betAmount })
	} catch (error) {
		return NextResponse.json({ error: 'Internal error' }, { status: 500 })
	}
}
