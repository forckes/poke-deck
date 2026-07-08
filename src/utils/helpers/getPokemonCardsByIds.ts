'use server'

import { pokemonService } from '@/server/services/pokemon.service'

export const getPokemonCardsByIds = async (ids: number[]) => {
	const pokemons = await Promise.all(
		ids.map(id => pokemonService.getPokemonCardById(id)),
	)
	return pokemons
}
