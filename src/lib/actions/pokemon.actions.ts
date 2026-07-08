'use server'

import { pokemonService } from '@/server/services/pokemon.service'
import {
	getPokemonModalDetailsData,
	getPokemonPageData,
} from '@/server/api/requests/pokeapi'
import { PokemonCardsResult } from '@/types/pokemon'
import { headers } from 'next/headers'
import { auth } from '../auth'
import prisma from '../prisma'
import { revalidatePath } from 'next/cache'
import { Rarity } from '@/generated/enums'

export async function getAllPokemonCardsAction(): Promise<PokemonCardsResult> {
	try {
		const session = await auth.api.getSession({ headers: await headers() })
		const userId = session?.user?.id

		if (!userId) {
			return { success: false, error: 'Unauthorized' }
		}

		const data = await pokemonService.getAllPokemonCards(userId)

		return {
			success: true,
			data,
		}
	} catch (error) {
		const message =
			error instanceof Error ? error.message : 'Error fetching pokemon cards'

		return { success: false, error: message }
	}
}

export async function getAllUserCardsAction(
	userId: string,
): Promise<PokemonCardsResult> {
	try {
		const cards = await pokemonService.getAllUserCards(userId)

		return { success: true, data: cards }
	} catch (error) {
		const message =
			error instanceof Error ? error.message : 'Error fetching user cards'

		return { success: false, error: message }
	}
}

export async function getPokemonModalDetailsAction(id: number) {
	try {
		const data = await getPokemonModalDetailsData(id, 4)
		return { success: true, data }
	} catch (error) {
		const message =
			error instanceof Error ? error.message : 'Error fetching pokemon details'

		return { success: false, error: message }
	}
}

export async function getPokemonCardByIdAction(id: number) {
	try {
		const data = await getPokemonPageData(id)
		return { success: true, data }
	} catch (error) {
		const message =
			error instanceof Error ? error.message : 'Error fetching pokemon card'

		return { success: false, error: message }
	}
}

export async function sellPokemonCardAction(cardId: number) {
	try {
		const session = await auth.api.getSession({ headers: await headers() })
		if (!session) {
			return { success: false, error: 'Unauthorized', isNearLimit: undefined }
		}
		const userId = session.user.id

		const result = await prisma.$transaction(async tx => {
			const userCard = await tx.userCard.findFirst({
				where: {
					ownerId: userId,
					cardId: cardId,
				},
				include: {
					card: true,
				},
			})

			if (!userCard) {
				return {
					success: false,
					error: 'You do not own this card',
					isNearLimit: undefined,
				}
			}

			const tradeItem = await tx.tradeItem.findFirst({
				where: { userCardId: userCard.id },
			})

			const isLinkedToTrade = await tx.trade.findFirst({
				where: {
					id: tradeItem?.tradeId,
					OR: [{ status: 'PENDING' }, { status: 'SENDED' }],
				},
			})

			if (isLinkedToTrade) {
				return {
					success: false,
					error: 'This card is currently locked in an active trade',
					isNearLimit: undefined,
				}
			}

			const packPriceObj = await tx.pack.findUnique({
				where: { type: userCard.card.rarity as Rarity },
				select: { priceInCoins: true },
			})

			if (!packPriceObj) {
				return {
					success: false,
					error: 'Pack price not found',
					isNearLimit: undefined,
				}
			}

			const sellPrice = Math.ceil(packPriceObj.priceInCoins / 4)

			const user = await tx.user.findUnique({
				where: { id: userId },
				select: { coins: true },
			})

			if (!user) {
				return {
					success: false,
					error: 'User not found',
					isNearLimit: undefined,
				}
			}

			if (user.coins + sellPrice > 10000) {
				return {
					success: false,
					isNearLimit: true,
					error: 'Selling this card would exceed your 10,000 coins limit.',
				}
			}

			await tx.userCard.update({
				where: { id: userCard.id },
				data: { ownerId: null },
			})

			await tx.user.update({
				where: { id: userId },
				data: {
					coins: { increment: sellPrice },
				},
			})

			return { success: true }
		})

		if (result.success) {
			revalidatePath('/collection')
			revalidatePath('/packs')
		}

		return result
	} catch (error) {
		const isPrismaError =
			error instanceof Error && error.message.includes('Prisma')
		const message = isPrismaError
			? 'Error selling pokemon card'
			: error instanceof Error
				? error.message
				: 'Error selling pokemon card'
		return { success: false, error: message, isNearLimit: undefined }
	}
}
