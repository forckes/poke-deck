import { PokemonCardType, PokemonCardResult } from '@/types/pokemon'
import { getPokemonFullData } from '../api/requests/pokeapi'
import { pokemonRepository } from '../repositories/pokemon.repository'
import { Prisma, Rarity } from '@/generated/client'
import prisma from '@/lib/prisma'
import { PokemonFilters } from '@/store/usePokemonFilterStore'

export const pokemonService = {
	async getPokemonCardById(cardId: number): Promise<PokemonCardResult> {
		const pokemonData = await pokemonRepository.getById(cardId)

		if (!pokemonData)
			return { success: false, error: 'Card not found in database' }

		let result: Omit<PokemonCardType, 'rarity' | 'id'>

		try {
			result = await getPokemonFullData(pokemonData?.pokemonId)
		} catch (error) {
			const message =
				error instanceof Error ? error.message : 'Failed to fetch Pokémon data'
			return { success: false, error: message }
		}

		return {
			success: true,
			data: { ...result, rarity: pokemonData.rarity, id: pokemonData.id },
		}
	},

	async collectUserCardPack(
		ownerId: string,
		cardIds: number[],
		tx?: Prisma.TransactionClient,
	) {
		if (!cardIds.length) {
			return { success: false, error: 'No cards provided' }
		}

		const validCards = await pokemonRepository.getByIds(cardIds, tx)

		const validCardIds = validCards.map((c: { id: number }) => c.id)

		if (!validCardIds.length) {
			return { success: false, error: 'No valid cards found' }
		}

		return pokemonRepository.assignUserCards(validCardIds, ownerId, tx)
	},

	async getAllUserCards(ownerId: string) {
		const cards = await pokemonRepository.getAllUserCards(ownerId)

		const result = await Promise.all(
			cards.map(card => this.getPokemonCardById(card.id)),
		)

		if (result.some(r => !r.success)) {
			throw new Error('Error getting cards from server')
		}

		const userCardsCount = await pokemonRepository.getUserCardsCount(ownerId)
		const allCardsCount = await pokemonRepository.getAllCardsCount()

		const cardsArray = result.flatMap(r => (r.success ? [r.data] : []))

		return {
			cards: cardsArray,
			obtainedCount: userCardsCount,
			totalCount: allCardsCount,
		}
	},

	async getAllPokemonCards(currentUserId?: string) {
		const cards = await pokemonRepository.getAllPokemonCards()

		if (!cards) throw new Error('Not cards found on server')

		const result = await Promise.all(
			cards.map(card => this.getPokemonCardById(card.id)),
		)

		if (result.some(r => !r.success)) {
			throw new Error('Error getting cards from server')
		}

		const userCards = currentUserId
			? await pokemonRepository.getAllUserCards(currentUserId)
			: []
		const obtainedCardIds = new Set(userCards.map(c => c.id))

		const cardsArray = result.flatMap(r => {
			if (!r.success || !r.data) return []

			return [
				{
					...r.data,
					isObtained: obtainedCardIds.has(r.data.id),
				},
			]
		})

		const obtainedCount = currentUserId ? obtainedCardIds.size : 0
		const totalCount = cardsArray.length

		return {
			cards: cardsArray,
			obtainedCount,
			totalCount,
		}
	},
	async getFilteredCards(
		scope: 'user' | 'all',
		userId: string | undefined,
		field: string | null,
		order: 'asc' | 'desc',
		limit = 9,
		pageParam = 0,
		searchQuery: string,
		filters: PokemonFilters,
	) {
		const searchQueryLower = searchQuery.trim().toLowerCase()
		const mappedRarities = filters.rarity.map(r => r.toUpperCase() as Rarity)
		const filterTypes = filters.type.map(t => t.toLowerCase())

		const whereCondition: Prisma.CardWhereInput = {
			name: searchQueryLower
				? { contains: searchQueryLower, mode: 'insensitive' }
				: undefined,
			rarity: mappedRarities.length > 0 ? { in: mappedRarities } : undefined,
			types: filterTypes.length > 0 ? { hasSome: filterTypes } : undefined,
		}

		let cardsList: { id: number; pokemonId: number; rarity: Rarity }[] = []
		let totalMatching = 0

		if (scope === 'user' && userId) {
			const userCardWhereCondition: Prisma.UserCardWhereInput = {
				ownerId: userId,
				card: whereCondition,
			}

			totalMatching = await prisma.userCard.count({
				where: userCardWhereCondition,
			})

			const userCards = await prisma.userCard.findMany({
				where: userCardWhereCondition,
				orderBy:
					field === 'date' || field === 'createdAt'
						? { createdAt: order }
						: field === 'name'
							? { card: { name: order } }
							: field === 'rarity'
								? { card: { rarity: order } }
								: field === 'type'
									? { card: { primaryType: order } }
									: { card: { pokemonId: order || 'asc' } },
				take: limit,
				skip: pageParam,
				include: {
					card: true,
				},
			})

			cardsList = userCards.map(uc => uc.card)
		} else {
			totalMatching = await prisma.card.count({
				where: whereCondition,
			})

			const cards = await prisma.card.findMany({
				where: whereCondition,
				orderBy:
					field === 'name'
						? { name: order }
						: field === 'rarity'
							? { rarity: order }
							: field === 'type'
								? { primaryType: order }
								: { pokemonId: order || 'asc' },
				take: limit,
				skip: pageParam,
			})

			cardsList = cards
		}

		const nextCursor =
			pageParam + limit < totalMatching ? pageParam + limit : null

		const resultCards = await Promise.all(
			cardsList.map(async card => {
				const cardData = await this.getPokemonCardById(card.id)
				return cardData.success ? cardData.data : null
			}),
		)

		let finalCards: PokemonCardType[]
		if (scope === 'all' && userId) {
			const userCards = await prisma.userCard.findMany({
				where: { ownerId: userId },
				select: { cardId: true },
			})
			const obtainedCardIds = new Set(userCards.map(c => c.cardId))
			finalCards = resultCards.flatMap(c => {
				if (!c) return []

				return [
					{
						...c,
						isObtained: obtainedCardIds.has(c.id),
					},
				]
			})
		} else {
			finalCards = (resultCards.filter(Boolean) as PokemonCardType[]).map(
				c => ({
					...c,
					isObtained: scope === 'user' ? true : c.isObtained,
				}),
			)
		}

		let obtainedCount = 0
		if (userId) {
			obtainedCount = await pokemonRepository.getUserCardsCount(userId)
		}
		const totalCount = await pokemonRepository.getAllCardsCount()

		return {
			cards: finalCards,
			nextCursor,
			obtainedCount,
			totalCount,
		}
	},
}
