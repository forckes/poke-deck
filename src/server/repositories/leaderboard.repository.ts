import { LeaderboardCategory, LeaderboardEntry } from '@/types/leaderboard'
import { Rarity } from '@/generated/client'
import prisma from '@/lib/prisma'

export const leaderboardRepository = {
	async getLeaderboard(
		category: LeaderboardCategory,
		limit: number = 10,
	): Promise<LeaderboardEntry[]> {
		switch (category) {
			case LeaderboardCategory.TOTAL_CARDS: {
				const result = await prisma.userCard.groupBy({
					by: ['ownerId'],
					where: {
						ownerId: { not: null },
					},
					_count: { ownerId: true },
					orderBy: { _count: { ownerId: 'desc' } },
					take: limit,
				})

				const userIds = result
					.map(r => r.ownerId)
					.filter((id): id is string => id !== null)

				const users = await prisma.user.findMany({
					where: { id: { in: userIds } },
					select: {
						id: true,
						name: true,
						username: true,
						image: true,
						bannerColor: true,
					},
				})

				return result
					.filter(
						(item): item is typeof item & { ownerId: string } =>
							item.ownerId !== null,
					)
					.map((item, index) => {
						const user = users.find(u => u.id === item.ownerId)
						return {
							id: item.ownerId,
							name: user?.name ?? 'Unknown',
							username: user?.username ?? 'unknown',
							image: user!.image,
							bannerColor: user!.bannerColor,
							score: item._count.ownerId,
							rank: index + 1,
						}
					})
			}

			case LeaderboardCategory.LEGENDARY_CARDS: {
				const result = await prisma.userCard.groupBy({
					by: ['ownerId'],
					where: {
						ownerId: { not: null },
						card: { rarity: Rarity.LEGENDARY },
					},
					_count: { ownerId: true },
					orderBy: { _count: { ownerId: 'desc' } },
					take: limit,
				})

				const userIds = result
					.map(r => r.ownerId)
					.filter((id): id is string => id !== null)

				const users = await prisma.user.findMany({
					where: { id: { in: userIds } },
					select: {
						id: true,
						name: true,
						username: true,
						image: true,
						bannerColor: true,
					},
				})

				return result
					.filter(
						(item): item is typeof item & { ownerId: string } =>
							item.ownerId !== null,
					)
					.map((item, index) => {
						const user = users.find(u => u.id === item.ownerId)
						return {
							id: item.ownerId,
							name: user?.name ?? 'Unknown',
							username: user?.username ?? 'unknown',
							image: user!.image,
							bannerColor: user!.bannerColor,
							score: item._count.ownerId,
							rank: index + 1,
						}
					})
			}

			case LeaderboardCategory.TRADE_COUNT: {
				const sentTrades = await prisma.trade.groupBy({
					by: ['senderId'],
					where: {
						status: 'ACCEPTED',
					},
					_count: { senderId: true },
				})

				const receivedTrades = await prisma.trade.groupBy({
					by: ['receiverId'],
					where: {
						status: 'ACCEPTED',
					},
					_count: { receiverId: true },
				})

				const tradeCountsMap = new Map<string, number>()

				sentTrades.forEach(item => {
					if (item.senderId) {
						tradeCountsMap.set(
							item.senderId,
							(tradeCountsMap.get(item.senderId) || 0) + item._count.senderId,
						)
					}
				})

				receivedTrades.forEach(item => {
					if (item.receiverId) {
						tradeCountsMap.set(
							item.receiverId,
							(tradeCountsMap.get(item.receiverId) || 0) +
								item._count.receiverId,
						)
					}
				})

				const sortedUserEntries = Array.from(tradeCountsMap.entries())
					.sort((a, b) => b[1] - a[1])
					.slice(0, limit)

				const topUserIds = sortedUserEntries.map(([userId]) => userId)

				if (topUserIds.length === 0) {
					return []
				}

				const users = await prisma.user.findMany({
					where: { id: { in: topUserIds } },
					select: {
						id: true,
						name: true,
						username: true,
						image: true,
						bannerColor: true,
					},
				})

				return sortedUserEntries
					.map(([userId, score], index) => {
						const user = users.find(u => u.id === userId)
						if (!user) return null

						return {
							id: user.id,
							name: user.name ?? 'Unknown',
							username: user.username ?? 'unknown',
							image: user!.image,
							bannerColor: user!.bannerColor,
							score,
							rank: index + 1,
						}
					})
					.filter((entry): entry is LeaderboardEntry => entry !== null)
			}

			default:
				return []
		}
	},
}
