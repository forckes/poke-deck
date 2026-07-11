'use server'

import { pokemonService } from '@/server/services/pokemon.service'
import { unstable_cache } from 'next/cache'

const getCachedPokemonCard = (id: number) =>
	unstable_cache(
		() => pokemonService.getPokemonCardById(id),
		[`showcase-card-${id}`],
		{ revalidate: false, tags: [`showcase-card-${id}`] },
	)()

export const getPokemonCardsByIds = async (ids: number[]) => {
	const pokemons = await Promise.all(ids.map(id => getCachedPokemonCard(id)))
	return pokemons
}
