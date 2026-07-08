/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { pokemonRepository } from '@/server/repositories/pokemon.repository'
import { pokemonService } from '@/server/services/pokemon.service'
import { Rarity } from '@/generated/enums'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { getEvolutionsFromCard } from '@/utils/helpers/getEvolutionCardsWithSameRarity'

export async function collectUserCardPackAction(
	ownerId: string,
	cardIds: number[],
) {
	try {
		const result = await pokemonService.collectUserCardPack(ownerId, cardIds)

		return {
			success: true,
			result,
		}
	} catch (error: any) {
		const message =
			error instanceof Error ? error.message : 'Failed to collect cards'

		return {
			success: false,
			error: message,
		}
	}
}

export async function getAllUserCardsAction(ownerId: string) {
	try {
		const result = await pokemonRepository.getAllUserCards(ownerId)

		return {
			success: true,
			result,
		}
	} catch (error) {
		const message =
			error instanceof Error ? error.message : 'Failed to collect cards'

		return {
			success: false,
			error: message,
		}
	}
}

export async function claimEvolutionRewardAction(
	chainId: number,
	rarity: Rarity,
	pokemonId: number,
) {
	try {
		const session = await auth.api.getSession({ headers: await headers() })
		const userId = session?.user?.id

		if (!userId) {
			return { success: false, error: 'Unauthorized' }
		}

		const cardData = { pokemonId, rarity } as any
		const evolutions = await getEvolutionsFromCard(cardData)

		if (evolutions.evolutionCards.length === 0) {
			return { success: false, error: 'Invalid evolution chain' }
		}

		const allObtained = evolutions.evolutionCards.every(e => e.isObtained)
		if (!allObtained) {
			return { success: false, error: 'Not all evolutions collected' }
		}

		const coinReward = await pokemonRepository.claimEvolutionReward(
			userId,
			chainId,
			rarity,
		)

		return {
			success: true,
			result: true,
			coins: coinReward,
		}
	} catch (error) {
		const message =
			error instanceof Error
				? error.message
				: 'Failed to claim evolution reward'

		return {
			success: false,
			error: message,
		}
	}
}
