import { getPokemonCardByIdAction } from '@/lib/actions/pokemon.actions'
import { getEvolutionsFromCard } from '@/utils/helpers/getEvolutionCardsWithSameRarity'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { pokemonRepository } from '@/server/repositories/pokemon.repository'
import { Rarity } from '@/generated/enums'
import { cache } from 'react'

export interface PageProps {
	params: Promise<{ id: string }>
	searchParams: Promise<{ query?: string }>
}

export const getPokemonDetailData = cache(async (props: PageProps) => {
	const [{ id }, { query }] = await Promise.all([
		props.params,
		props.searchParams,
	])

	const [pokemonPageData, session] = await Promise.all([
		getPokemonCardByIdAction(Number(id)),
		auth.api.getSession({ headers: await headers() }),
	])

	const userId = session?.user?.id

	if (!pokemonPageData.success || !pokemonPageData.data) {
		return { success: false as const }
	}

	const data = pokemonPageData.data

	const cardData = {
		id: data.id,
		pokemonId: data.pokemonId,
		name: data.name,
		image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${data.pokemonId}.png`,
		hp: data.stats[0]?.value ?? 0,
		types: data.types,
		moves: data.moves,
		rarity: data.rarity,
	}

	const filteredMoves = query
		? data.allMoves.filter(move =>
				move.name.toLowerCase().includes(query.toLowerCase()),
			)
		: data.allMoves

	const { chainId, evolutionCards, hasEvolution } =
		await getEvolutionsFromCard(cardData)

	let alreadyClaimed = false
	if (userId && chainId) {
		alreadyClaimed = await pokemonRepository.checkEvolutionRewardClaimed(
			userId,
			chainId,
			data.rarity as Rarity,
		)
	}

	const allObtained =
		evolutionCards.length > 0 && evolutionCards.every(e => e.isObtained)
	const coinsAmount = await pokemonRepository.getEvolutionRewardAmount(
		data.rarity as Rarity,
		hasEvolution!,
	)

	return {
		state: {
			success: true as const,
			query,
			data,
			cardData,
			filteredMoves,
			evolutionCards,
			chainId,
			allObtained,
			alreadyClaimed,
			coinsAmount,
		},
	}
})
