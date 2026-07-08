import { getPokemonCardByIdAction } from '@/lib/actions/pokemon.actions'

export async function getRandomPokemons(amount: number) {
	const ids = Array.from(
		{ length: amount },
		() => Math.floor(Math.random() * 1025) + 1,
	)

	const pokemons = await Promise.all(
		ids.map(id => getPokemonCardByIdAction(id)),
	)
	return pokemons
}
