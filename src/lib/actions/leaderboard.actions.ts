'use server'

import { leaderboardRepository } from '@/server/repositories/leaderboard.repository'
import { LeaderboardCategory } from '@/types/leaderboard'

export async function getLeaderboardAction(
	category: LeaderboardCategory,
	limit: number = 10,
) {
	try {
		const data = await leaderboardRepository.getLeaderboard(category, limit)
		return { success: true, data }
	} catch (error) {
		const isPrismaError =
			error instanceof Error && error.message.includes('Prisma')
		const message = isPrismaError
			? 'Error loading leaderboard'
			: error instanceof Error
				? error.message
				: 'Error loading leaderboard'
		return { success: false, error: message }
	}
}
