import {
	PokemonCardType,
	PokemonCardResult,
	PokemonCardTypeMeta,
} from '@/types/pokemon'
import { getPokemonFullData } from '../api/requests/pokeapi'
import { pokemonRepository } from '../repositories/pokemon.repository'
import { Prisma, Rarity } from '@/generated/client'
import prisma from '@/lib/prisma'
import { getPokemonMetadata } from '@/utils/helpers/getPokemonMetadata'
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
		let cards: {
			id: number
			pokemonId: number
			rarity: Rarity
			createdAt?: Date
		}[] = []
		if (scope === 'user' && userId) {
			const userCards = await prisma.userCard.findMany({
				where: { ownerId: userId },
				select: {
					createdAt: true,
					card: {
						select: {
							id: true,
							pokemonId: true,
							rarity: true,
						},
					},
				},
			})
			cards = userCards.map(uc => ({ ...uc.card, createdAt: uc.createdAt }))
		} else {
			cards = await pokemonRepository.getAllPokemonCards()
		}

		const uniquePokemonIds = Array.from(new Set(cards.map(c => c.pokemonId)))
		const metadataList = await Promise.all(
			uniquePokemonIds.map(id => getPokemonMetadata(id)),
		)
		const metadataMap = new Map(
			uniquePokemonIds.map((id, index) => [id, metadataList[index]]),
		)

		const filteredCards = cards.filter(card => {
			const meta = metadataMap.get(card.pokemonId)
			if (!meta) return false

			const matchesSearch = meta.name
				.toLowerCase()
				.includes(searchQuery.toLowerCase())

			const matchesRarity =
				filters.rarity.length === 0 ||
				filters.rarity.includes(
					card.rarity.toLowerCase() as (typeof filters.rarity)[number],
				)

			const matchesType =
				filters.type.length === 0 ||
				meta.types.some(tName =>
					filters.type.includes(
						tName.toLowerCase() as (typeof filters.type)[number],
					),
				)

			return matchesSearch && matchesRarity && matchesType
		})

		if (field) {
			filteredCards.sort((a: PokemonCardTypeMeta, b: PokemonCardTypeMeta) => {
				const metaA = metadataMap.get(a.pokemonId)
				const metaB = metadataMap.get(b.pokemonId)
				if (!metaA || !metaB) return 0

				let valA
				let valB

				if (field === 'name') {
					valA = metaA.name
					valB = metaB.name
				} else if (field === 'type') {
					valA = metaA.types[0] || ''
					valB = metaB.types[0] || ''
				} else if (field === 'pokemonId' || field === 'id') {
					valA = a.pokemonId
					valB = b.pokemonId
				} else if (field === 'date' || field === 'createdAt') {
					valA = a.createdAt ? new Date(a.createdAt).getTime() : a.id
					valB = b.createdAt ? new Date(b.createdAt).getTime() : b.id
				} else if (field === 'rarity') {
					valA = a.rarity
					valB = b.rarity
				} else {
					valA = a[field as keyof PokemonCardTypeMeta]
					valB = b[field as keyof PokemonCardTypeMeta]
				}

				valA = valA ?? ''
				valB = valB ?? ''

				if (typeof valA === 'number' && typeof valB === 'number') {
					return order === 'asc' ? valA - valB : valB - valA
				}

				if (typeof valA === 'string' && typeof valB === 'string') {
					return order === 'asc'
						? valA.localeCompare(valB)
						: valB.localeCompare(valA)
				}

				if (valA < valB) return order === 'asc' ? -1 : 1
				if (valA > valB) return order === 'asc' ? 1 : -1
				return 0
			})
		}

		const slicedCards = filteredCards.slice(pageParam, pageParam + limit)
		const nextCursor =
			pageParam + limit < filteredCards.length ? pageParam + limit : null

		const resultCards = await Promise.all(
			slicedCards.map(async card => {
				const cardData = await this.getPokemonCardById(card.id)
				return cardData.success ? cardData.data : null
			}),
		)

		let finalCards: PokemonCardType[]
		if (scope === 'all' && userId) {
			const userCards = await pokemonRepository.getAllUserCards(userId)
			const obtainedCardIds = new Set(userCards.map(c => c.id))
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
			finalCards = resultCards.filter(Boolean) as PokemonCardType[]
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
