import prisma from '@/lib/prisma'
import { Rarity, FriendshipStatus } from '@/generated/enums'

export const userRepository = {
	async findById(id: string) {
		return prisma.user.findUnique({
			where: { id },
		})
	},

	async findByEmail(email: string) {
		return prisma.user.findUnique({
			where: { email },
		})
	},

	async findByUsername(username: string) {
		return prisma.user.findUnique({
			where: { username },
		})
	},

	async updateUserProfile(
		userId: string,
		data: { name?: string; username?: string },
	) {
		return prisma.user.update({
			where: { id: userId },
			data: {
				name: data.name,
				username: data.username,
			},
		})
	},

	async getUserProfileStats(userId: string) {
		const cards = await prisma.userCard.findMany({
			where: { ownerId: userId },
			include: { card: true },
		})

		const totalCards = cards.length
		const commonCount = cards.filter(
			c => c.card.rarity === Rarity.COMMON,
		).length
		const epicCount = cards.filter(c => c.card.rarity === Rarity.EPIC).length
		const legendaryCount = cards.filter(
			c => c.card.rarity === Rarity.LEGENDARY,
		).length

		const friendsCount = await prisma.friendship.count({
			where: {
				OR: [{ userId: userId }, { friendId: userId }],
				status: FriendshipStatus.ACCEPTED,
			},
		})

		return {
			totalCards,
			cardsByRarity: {
				[Rarity.COMMON]: commonCount,
				[Rarity.EPIC]: epicCount,
				[Rarity.LEGENDARY]: legendaryCount,
			},
			friendsCount,
		}
	},

	async searchUsers(query: string, currentUserId: string, limit: number = 5) {
		if (!query.trim()) return []
		return prisma.user.findMany({
			where: {
				id: { not: currentUserId },
				OR: [
					{ username: { contains: query, mode: 'insensitive' } },
					{ name: { contains: query, mode: 'insensitive' } },
				],
			},
			take: limit,
			select: {
				id: true,
				name: true,
				username: true,
				image: true,
			},
		})
	},
}
