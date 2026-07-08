import { Prisma, UserCard } from '@/generated/client'
import { Rarity } from '@/generated/enums'
import prisma from '@/lib/prisma'

export const pokemonRepository = {
	async getById(id: number) {
		return await prisma.card.findUnique({
			where: { id },
		})
	},

	async getByIds(ids: number[], tx?: Prisma.TransactionClient) {
		const prismaClient = tx || prisma

		return await prismaClient.card.findMany({
			where: { id: { in: ids } },
			select: { id: true },
		})
	},

	async getAllPokemonCards() {
		return prisma.card.findMany()
	},

	async getUserCardsCount(ownerId: string): Promise<number> {
		const count = await prisma.userCard.count({
			where: {
				ownerId: ownerId,
			},
		})

		return count
	},

	async getAllCardsCount(): Promise<number> {
		const count = await prisma.card.count()

		return count
	},

	async getCardTemplate(pokemonId: number, rarity: Rarity) {
		return prisma.card.findUnique({
			where: {
				pokemonId_rarity: {
					pokemonId,
					rarity,
				},
			},
		})
	},

	async getRandomCardByRarity(
		rarity: Rarity,
		excludeIds: number[] = [],
		tx?: Prisma.TransactionClient,
	) {
		const prismaClient = tx || prisma

		const availableCards = await prismaClient.card.findMany({
			where: {
				rarity,
				id: { notIn: excludeIds },
			},
			select: { id: true },
		})

		if (availableCards.length === 0) return null

		const randomIdx = Math.floor(Math.random() * availableCards.length)
		const selectedId = availableCards[randomIdx].id

		return await prisma.card.findUnique({
			where: { id: selectedId },
		})
	},

	async assignUserCard(cardId: number, userId: string) {
		return await prisma.userCard.create({
			data: {
				cardId,
				ownerId: userId,
			},
		})
	},

	async getAllUserCards(userId: string, tx?: Prisma.TransactionClient) {
		const prismaClient = tx || prisma

		const userCards = await prismaClient.userCard.findMany({
			where: { ownerId: userId },
		})

		return prismaClient.card.findMany({
			where: { id: { in: userCards.map((card: UserCard) => card.cardId) } },
		})
	},

	async assignUserCards(
		cardIds: number[],
		userId: string,
		tx?: Prisma.TransactionClient,
	) {
		const prismaClient = tx || prisma

		return await prismaClient.userCard.createMany({
			data: cardIds.map(cardId => ({
				cardId,
				ownerId: userId,
			})),
		})
	},
	async getEvolutionRewardAmount(rarity: Rarity, hasEvolutions: boolean) {
		if (!hasEvolutions) {
			const pack = await prisma.pack.findUnique({
				where: { type: rarity },
			})
			if (pack) return Math.floor(pack.priceInCoins / 2)
		}

		const config = await prisma.evolutionReward.findUnique({
			where: { rarity },
		})
		if (config) return config.coinReward
	},

	async checkEvolutionRewardClaimed(
		userId: string,
		chainId: number,
		rarity: Rarity,
	) {
		const claimed = await prisma.claimedEvolution.findUnique({
			where: {
				userId_chainId_rarity: { userId, chainId, rarity },
			},
		})
		return !!claimed
	},

	async claimEvolutionReward(userId: string, chainId: number, rarity: Rarity) {
		return await prisma.$transaction(async tx => {
			const user = await tx.user.findUnique({
				where: { id: userId },
				select: { coins: true },
			})

			if (!user) {
				throw new Error('User not found')
			}

			if (user.coins >= 10000) {
				throw new Error('You have too many coins')
			}

			const alreadyClaimed = await tx.claimedEvolution.findUnique({
				where: {
					userId_chainId_rarity: { userId, chainId, rarity },
				},
			})

			if (alreadyClaimed) {
				throw new Error('Reward already claimed')
			}

			let rewardConfig = await tx.evolutionReward.findUnique({
				where: { rarity },
			})

			if (!rewardConfig) {
				let defaultCoins = 150
				if (rarity === Rarity.EPIC) defaultCoins = 450
				if (rarity === Rarity.LEGENDARY) defaultCoins = 750

				rewardConfig = await tx.evolutionReward.create({
					data: { rarity, coinReward: defaultCoins },
				})
			}

			await tx.claimedEvolution.create({
				data: { userId, chainId, rarity },
			})

			await tx.user.update({
				where: { id: userId },
				data: {
					coins: { increment: rewardConfig.coinReward },
				},
			})

			return rewardConfig.coinReward
		})
	},
}
