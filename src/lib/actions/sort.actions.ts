'use server'

import { PokemonFilters } from '@/store/usePokemonFilterStore'
import { PokemonCardType } from '@/types/pokemon'
import { pokemonService } from '@/server/services/pokemon.service'

interface FilteredCardsResponse {
	cards: PokemonCardType[]
	nextCursor: number | null
	obtainedCount?: number
	totalCount?: number
}

export async function getFilteredCardsAction(
	scope: 'user' | 'all',
	userId: string,
	field: string | null,
	order: 'asc' | 'desc',
	limit = 9,
	pageParam = 0,
	searchQuery: string,
	filters: PokemonFilters,
): Promise<FilteredCardsResponse> {
	return await pokemonService.getFilteredCards(
		scope,
		userId,
		field,
		order,
		limit,
		pageParam,
		searchQuery,
		filters,
	)
}
