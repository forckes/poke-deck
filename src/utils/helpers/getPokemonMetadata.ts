'use server'

import { getPokemonById } from '@/server/api/requests/pokeapi'
import { unstable_cache } from 'next/cache'

export const getPokemonMetadata = unstable_cache(
	async (pokemonId: number) => {
		const pokemon = await getPokemonById(pokemonId)
		return {
			name: pokemon.name,
			types: pokemon.types.map(t => t.type.name),
			hp: pokemon.stats[0]?.base_stat ?? 0,
		}
	},
	['pokemon-metadata'],
	{ revalidate: false },
)
