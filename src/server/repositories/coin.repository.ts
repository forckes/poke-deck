import { PackType } from '@/generated/enums'
import { Prisma } from '@/generated/client'
import prisma from '@/lib/prisma'

export const coinRepository = {
	updateUserCoins: async (
		userId: string,
		amountToAdd: number,
		tx?: Prisma.TransactionClient,
	) => {
		const prismaClient = tx || prisma

		const userCoins = await prismaClient.user.findUnique({
			where: { id: userId },
			select: { coins: true },
		})

		if (!userCoins) throw new Error('User coins not found')

		if (amountToAdd > 0 && userCoins.coins + amountToAdd > 10000) {
			throw new Error('You have too many coins')
		}

		return prismaClient.user.update({
			where: { id: userId },
			data: { coins: { increment: amountToAdd } },
		})
	},

	getUserCoins: async (userId: string, tx?: Prisma.TransactionClient) => {
		const prismaClient = tx || prisma

		return prismaClient.user.findUnique({
			where: { id: userId },
			select: { coins: true },
		})
	},

	getPackPrice: async (packType: PackType, tx?: Prisma.TransactionClient) => {
		const prismaClient = tx || prisma

		return prismaClient.pack.findUnique({
			where: { type: packType },
			select: { priceInCoins: true },
		})
	},

	getPackRarities: async (
		packType: PackType,
		tx?: Prisma.TransactionClient,
	) => {
		const prismaClient = tx || prisma

		return prismaClient.pack.findUnique({
			where: { type: packType },
			select: {
				commonDropChance: true,
				epicDropChance: true,
				legendaryDropChance: true,
			},
		})
	},

	setCoins: async (userId: string, amount: number) => {
		return prisma.user.update({
			where: { id: userId },
			data: { coins: amount },
		})
	},
}
