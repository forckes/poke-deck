import { pusherServer } from '@/lib/pusherServer'
import prisma from '@/lib/prisma'

const GROWTH_RATE = 0.00006

export type CrashGameState = {
	status: 'waiting' | 'playing' | 'crashed'
	roundId: string | null
	startTime: number | null
	crashPoint: number | null
	bets: Record<
		string,
		{
			username: string
			betAmount: number
			cashOutAt: number | null
			winnings: number | null
			autoCashoutMultiplier?: number | null
		}
	>
}

const globalForCrashGame = globalThis as unknown as {
	crashGameState: CrashGameState | undefined
	crashGameTimeout: NodeJS.Timeout | undefined
	shouldStop: boolean | undefined
}

export const crashGameState: CrashGameState =
	globalForCrashGame.crashGameState || {
		status: 'waiting',
		roundId: null,
		startTime: null,
		crashPoint: null,
		bets: {},
	}

if (process.env.NODE_ENV !== 'production') {
	globalForCrashGame.crashGameState = crashGameState
}

export const crashGameService = {
	startEngine() {
		globalForCrashGame.shouldStop = false
		if (globalForCrashGame.crashGameTimeout) return
		this.runLoop()
	},

	stopEngine() {
		globalForCrashGame.shouldStop = true
	},

	isEngineRunning() {
		return (
			!!globalForCrashGame.crashGameTimeout && !globalForCrashGame.shouldStop
		)
	},

	async runLoop() {
		try {
			crashGameState.status = 'waiting'
			crashGameState.bets = {}

			const dbRound = await prisma.crashGameRound.create({
				data: { crashPoint: 1.0 }, // temporary, updated later
			})
			crashGameState.roundId = dbRound.id

			const r = Math.random()

			if (r < 0.03) {
				crashGameState.crashPoint = 1.0
			} else {
				const calculatedPoint = (1 - 0.03) / (1 - r)

				crashGameState.crashPoint = Math.max(
					1.01,
					Math.floor(calculatedPoint * 100) / 100,
				)
			}

			await prisma.crashGameRound.update({
				where: { id: dbRound.id },
				data: { crashPoint: crashGameState.crashPoint },
			})

			crashGameState.startTime = Date.now() + 10000

			await pusherServer.trigger('crash-game', 'game-waiting', {
				startTime: crashGameState.startTime,
				roundId: crashGameState.roundId,
			})

			globalForCrashGame.crashGameTimeout = setTimeout(async () => {
				// 2. Playing Phase
				crashGameState.status = 'playing'
				crashGameState.startTime = Date.now() // exact start time
				await pusherServer.trigger('crash-game', 'game-started', {
					startTime: crashGameState.startTime,
				})

				const crashTimeMs = Math.log(crashGameState.crashPoint!) / GROWTH_RATE

				globalForCrashGame.crashGameTimeout = setTimeout(async () => {
					// 3. Crashed Phase
					crashGameState.status = 'crashed'

					// First, resolve auto-cashouts that succeeded
					const activeUserIds = Object.keys(crashGameState.bets).filter(
						userId => crashGameState.bets[userId].cashOutAt === null,
					)
					for (const userId of activeUserIds) {
						const bet = crashGameState.bets[userId]
						if (
							bet.autoCashoutMultiplier &&
							bet.autoCashoutMultiplier <= crashGameState.crashPoint!
						) {
							const winnings = Math.floor(
								bet.betAmount * bet.autoCashoutMultiplier,
							)

							// Save to DB
							await prisma.crashGameBet.create({
								data: {
									roundId: crashGameState.roundId!,
									userId,
									username: bet.username,
									betAmount: bet.betAmount,
									cashOutAt: bet.autoCashoutMultiplier,
									winnings,
								},
							})

							// Credit user coins in DB
							await prisma.user.update({
								where: { id: userId },
								data: { coins: { increment: winnings } },
							})

							// Update server state
							crashGameState.bets[userId].cashOutAt = bet.autoCashoutMultiplier
							crashGameState.bets[userId].winnings = winnings

							// Broadcast cashout event
							await pusherServer.trigger('crash-game', 'cashout', {
								userId,
								multiplier: bet.autoCashoutMultiplier,
								winnings,
							})
						}
					}

					// Broadcast game-crashed after auto-cashouts are calculated
					await pusherServer.trigger('crash-game', 'game-crashed', {
						crashPoint: crashGameState.crashPoint,
					})

					// Resolve losing bets (still null cashOutAt after auto-cashout checks)
					const loserIds = Object.keys(crashGameState.bets).filter(
						userId => crashGameState.bets[userId].cashOutAt === null,
					)
					for (const userId of loserIds) {
						await prisma.crashGameBet.create({
							data: {
								roundId: crashGameState.roundId!,
								userId,
								username: crashGameState.bets[userId].username,
								betAmount: crashGameState.bets[userId].betAmount,
								cashOutAt: null,
								winnings: 0,
							},
						})
					}

					// Cleanup old rounds
					const count = await prisma.crashGameRound.count()
					if (count > 10) {
						const oldRounds = await prisma.crashGameRound.findMany({
							orderBy: { createdAt: 'asc' },
							take: count - 10,
						})
						const oldIds = oldRounds.map(r => r.id)
						await prisma.crashGameRound.deleteMany({
							where: { id: { in: oldIds } },
						})
					}

					if (globalForCrashGame.shouldStop) {
						globalForCrashGame.crashGameTimeout = undefined
						await pusherServer.trigger('crash-game', 'engine-stopped', {})
					} else {
						globalForCrashGame.crashGameTimeout = setTimeout(() => {
							this.runLoop()
						}, 4000)
					}
				}, crashTimeMs)
			}, 10000)
		} catch (err) {
			console.error('Crash Game Loop Error', err)
			if (globalForCrashGame.shouldStop) {
				globalForCrashGame.crashGameTimeout = undefined
			} else {
				globalForCrashGame.crashGameTimeout = setTimeout(
					() => this.runLoop(),
					5000,
				)
			}
		}
	},

	getState() {
		return crashGameState
	},
}
