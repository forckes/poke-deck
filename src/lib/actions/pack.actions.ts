'use server'

import { pokemonService } from '@/server/services/pokemon.service'
import { pokemonRepository } from '@/server/repositories/pokemon.repository'
import { PackType, Rarity } from '@/generated/enums'
import { headers } from 'next/headers'
import { auth } from '../auth'
import prisma from '../prisma'
import { coinRepository } from '@/server/repositories/coin.repository'

function rollRarity(packRarities: {
	commonDropChance: number
	epicDropChance: number
	legendaryDropChance: number
}): Rarity {
	const roll = Math.random() * 100

	if (roll <= packRarities.legendaryDropChance) return 'LEGENDARY'
	if (roll <= packRarities.legendaryDropChance + packRarities.epicDropChance)
		return 'EPIC'

	return 'COMMON'
}

export async function buyAndOpenPackAction(packType: PackType) {
	try {
		const session = await auth.api.getSession({ headers: await headers() })
		if (!session) throw new Error('Unauthorized')
		const userId = session.user.id

		const result = await prisma.$transaction(async tx => {
			const packRarities = await coinRepository.getPackRarities(packType, tx)
			if (!packRarities) throw new Error('Pack not found')

			const packPrice = await coinRepository.getPackPrice(packType, tx)
			if (!packPrice) throw new Error('Pack not found')

			const userCoins = await coinRepository.getUserCoins(userId, tx)
			if (!userCoins || userCoins.coins < packPrice.priceInCoins) {
				throw new Error('Not enough coins')
			}

			await coinRepository.updateUserCoins(userId, -packPrice.priceInCoins, tx)

			const rarities = [
				rollRarity(packRarities),
				rollRarity(packRarities),
				rollRarity(packRarities),
			]

			const excludeIds: number[] = []
			const userCards = await pokemonRepository.getAllUserCards(userId, tx)
			excludeIds.push(...userCards.map((c: { id: number }) => c.id))

			const pulledCards = []

			for (const rarity of rarities) {
				const dbCard = await pokemonRepository.getRandomCardByRarity(
					rarity,
					excludeIds,
					tx,
				)
				if (!dbCard) continue

				excludeIds.push(dbCard.id)

				const fullData = await pokemonService.getPokemonCardById(dbCard.id)
				if (!fullData.success) throw new Error(fullData.error)

				pulledCards.push({ ...fullData.data, rarity: dbCard.rarity })
			}

			if (pulledCards.length === 0) {
				throw new Error('You already have all cards of these rarities!')
			}

			const cardIds = pulledCards.map(card => card.id)
			await pokemonService.collectUserCardPack(userId, cardIds, tx)

			return pulledCards
		})

		return { success: true, cards: result }
	} catch (error) {
		const message =
			error instanceof Error ? error.message : 'Failed to process purchase'

		return {
			success: false,
			error: message,
		}
	}
}
