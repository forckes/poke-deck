'use server'

import { getPokemonById } from '@/server/api/requests/pokeapi'

export const getPokemonsSpritesByIds = async (amount: number) => {
	const ids = Array.from(
		{ length: amount },
		() => Math.floor(Math.random() * 1025) + 1,
	)

	const pokemons = await Promise.all(ids.map(id => getPokemonById(id)))

	return {
		sprites: [
			...pokemons.flatMap(
				p =>
					p.sprites.versions?.['generation-v']?.['black-white']?.animated
						?.front_default ||
					p.sprites.other['official-artwork'].front_default,
			),
		],
		ids,
	}
}
