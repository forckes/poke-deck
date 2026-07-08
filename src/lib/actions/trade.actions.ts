/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { TradeStatus } from '@/generated/client'
import { tradeService } from '@/server/services/trade.service'
import { auth } from '../auth'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { pokemonService } from '@/server/services/pokemon.service'

export async function getTradeBySenderIdAction() {
	try {
		const session = await auth.api.getSession({ headers: await headers() })
		const userId = session?.user?.id

		if (!userId) {
			return { success: false, error: 'Unauthorized' }
		}
		const result = await tradeService.getBySenderId(userId)

		return {
			success: true,
			result,
		}
	} catch (error: any) {
		return {
			success: false,
			error: error.message || 'Failed to find upcoming trade',
		}
	}
}

export async function getTradeByReceiverIdAction() {
	try {
		const session = await auth.api.getSession({ headers: await headers() })
		const userId = session?.user?.id

		if (!userId) {
			return { success: false, error: 'Unauthorized' }
		}
		const result = await tradeService.getByReceiverId(userId)

		return {
			success: true,
			result,
		}
	} catch (error: any) {
		return {
			success: false,
			error: error.message || 'Failed to find incoming trade',
		}
	}
}

export async function getSendedTradeByReceiverIdAction() {
	try {
		const session = await auth.api.getSession({ headers: await headers() })
		const userId = session?.user?.id

		if (!userId) {
			return { success: false, error: 'Unauthorized' }
		}
		const result = await tradeService.getSendedByReceiverId(userId)

		return {
			success: true,
			result,
		}
	} catch (error: any) {
		return {
			success: false,
			error: error.message || 'Failed to find incoming trade',
		}
	}
}

export async function getUserCardsForTradeAction(
	ownerId: string,
	secondUserId: string,
) {
	try {
		const session = await auth.api.getSession({ headers: await headers() })
		if (!session?.user?.id) return { success: false, error: 'Unauthorized' }

		const userCards = await prisma.userCard.findMany({
			where: {
				ownerId: ownerId,
				card: {
					instances: {
						none: {
							ownerId: secondUserId,
						},
					},
				},
			},
			include: { card: true },
		})

		const enriched = await Promise.all(
			userCards.map(async uc => {
				const pokeData = await pokemonService.getPokemonCardById(uc.cardId)
				if (pokeData.success == false)
					throw new Error('Unable to get pokemon cards')
				return {
					userCardId: uc.id,
					ownerId: uc.ownerId,
					cardData: pokeData.data,
				}
			}),
		)

		return { success: true, result: enriched }
	} catch (error: any) {
		return { success: false, error: error.message || 'Failed to fetch cards' }
	}
}

export async function getPendingTradeAction(receiverId: string) {
	try {
		const session = await auth.api.getSession({ headers: await headers() })
		const senderId = session?.user?.id

		if (!senderId) {
			return { success: false, error: 'Unauthorized' }
		}
		const result = await tradeService.getPendingTrade(senderId, receiverId)

		return {
			success: true,
			result,
		}
	} catch (error: any) {
		return {
			success: false,
			error: error.message || 'Failed to find pending trade',
		}
	}
}

export async function getTradeByIdAction(tradeId: string) {
	try {
		const session = await auth.api.getSession({ headers: await headers() })
		if (!session?.user?.id) {
			return { success: false, error: 'Unauthorized' }
		}

		const result = await tradeService.getTradeById(tradeId)

		if (result && result.items) {
			const enrichedItems = await Promise.all(
				result.items.map(async (item: any) => {
					const pokeData = await pokemonService.getPokemonCardById(
						item.userCard.cardId,
					)
					return {
						...item,
						userCard: {
							...item.userCard,
							card: pokeData.success ? pokeData.data : item.userCard.card,
						},
					}
				}),
			)
			result.items = enrichedItems
		}

		return {
			success: true,
			result,
		}
	} catch (error: any) {
		return {
			success: false,
			error: error.message || 'Failed to fetch trade',
		}
	}
}

export async function createBlankTradeAction(receiverId: string) {
	try {
		const session = await auth.api.getSession({ headers: await headers() })
		const senderId = session?.user?.id

		if (!senderId) {
			return { success: false, error: 'Unauthorized' }
		}

		const result = await tradeService.createBlankTrade(senderId, receiverId)

		revalidatePath('/trades')

		return {
			success: true,
			result,
		}
	} catch (error: any) {
		return {
			success: false,
			error: error.message || 'Failed to create blank trade',
		}
	}
}

export async function sendTradeAction(tradeId: string, items: any[]) {
	try {
		const session = await auth.api.getSession({ headers: await headers() })
		if (!session?.user?.id) {
			return { success: false, error: 'Unauthorized' }
		}

		const result = await tradeService.sendTrade(tradeId, items)

		revalidatePath('/trades')

		return {
			success: true,
			result,
		}
	} catch (error: any) {
		return {
			success: false,
			error: error.message || 'Failed to send trade',
		}
	}
}

export async function acceptTradeAction(tradeId: string) {
	const session = await auth.api.getSession({ headers: await headers() })
	if (!session?.user?.id) {
		return { success: false, error: 'Unauthorized' }
	}

	try {
		const result = await tradeService.acceptTrade(tradeId, session.user.id)

		revalidatePath('/deck')
		revalidatePath('/trades')

		return { success: true, result }
	} catch (error) {
		const message =
			error instanceof Error ? error.message : 'Failed to accept trade'

		return { success: false, error: message }
	}
}

export async function declineTradeAction(tradeId: string) {
	try {
		const result = await tradeService.updateTradeStatus(
			tradeId,
			TradeStatus.DECLINED,
		)

		revalidatePath('/trades')

		return { success: true, result }
	} catch (error) {
		const message =
			error instanceof Error ? error.message : 'Failed to decline trade'

		return { success: false, error: message }
	}
}

export async function getSortedTradeCardsAction(
	ownerId: string,
	secondUserId: string,
	field: string | null,
	order: 'asc' | 'desc',
	limit = 9,
	pageParam = 0,
) {
	const result = await getUserCardsForTradeAction(ownerId, secondUserId)

	if (!result.success || !result.result) {
		return { cards: [], nextCursor: null }
	}

	const cards = [...result.result]

	if (!field) {
		const sliced = cards.slice(pageParam, pageParam + limit)
		const nextCursor =
			pageParam + limit < cards.length ? pageParam + limit : null
		return { cards: sliced, nextCursor }
	}

	cards.sort((a: any, b: any) => {
		let valA = a.cardData[field]
		let valB = b.cardData[field]

		if (field === 'type') {
			valA = Array.isArray(a.cardData.types)
				? a.cardData.types[0]?.type?.name
				: Array.isArray(a.cardData.type)
					? a.cardData.type[0]
					: a.cardData.type
			valB = Array.isArray(b.cardData.types)
				? b.cardData.types[0]?.type?.name
				: Array.isArray(b.cardData.type)
					? b.cardData.type[0]
					: b.cardData.type
		}

		valA = valA ?? ''
		valB = valB ?? ''

		if (typeof valA === 'string' && typeof valB === 'string') {
			return order === 'asc'
				? valA.localeCompare(valB)
				: valB.localeCompare(valA)
		}

		if (valA < valB) return order === 'asc' ? -1 : 1
		if (valA > valB) return order === 'asc' ? 1 : -1
		return 0
	})

	const slicedCards = cards.slice(pageParam, pageParam + limit)
	const nextCursor = pageParam + limit < cards.length ? pageParam + limit : null

	return { cards: slicedCards, nextCursor }
}
