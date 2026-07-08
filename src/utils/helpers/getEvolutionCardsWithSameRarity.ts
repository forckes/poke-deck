import { pokemonRepository } from '@/server/repositories/pokemon.repository'
import { pokemonService } from '@/server/services/pokemon.service'
import { PokemonCardType } from '@/types/pokemon'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { Rarity } from '@/generated/enums'

export function getEvolutionIds(chainNode: any): number[] {
	const urlParts = chainNode.species.url.split('/').filter(Boolean)
	const id = parseInt(urlParts[urlParts.length - 1], 10)

	let ids = [id]

	if (chainNode.evolves_to && chainNode.evolves_to.length > 0) {
		for (const evolution of chainNode.evolves_to) {
			ids = ids.concat(getEvolutionIds(evolution))
		}
	}

	return ids
}

export async function getEvolutionsFromCard(cardData: PokemonCardType) {
	try {
		const session = await auth.api.getSession({ headers: await headers() })
		const userId = session?.user?.id

		let obtainedCardIds = new Set<number>()

		if (userId) {
			const userCards = await pokemonRepository.getAllUserCards(userId)
			obtainedCardIds = new Set(userCards.map(c => c.id))
		}

		const speciesRes = await fetch(
			`https://pokeapi.co/api/v2/pokemon-species/${cardData.pokemonId}/`,
		)
		if (!speciesRes.ok) throw new Error('Failed to fetch species data')
		const speciesData = await speciesRes.json()

		const chainRes = await fetch(speciesData.evolution_chain.url)
		if (!chainRes.ok) throw new Error('Failed to fetch evolution chain')
		const evolutionData = await chainRes.json()

		const urlParts = chainRes.url.split('/').filter(Boolean)
		const chainId = parseInt(urlParts[urlParts.length - 1], 10)

		const evolutionIds = getEvolutionIds(evolutionData.chain)

		const evolutionCards = []

		const hasEvolution = evolutionIds.length > 1 ? true : false

		for (const id of evolutionIds) {
			const template = await pokemonRepository.getCardTemplate(
				id,
				cardData.rarity as Rarity,
			)

			if (template) {
				const fullData = await pokemonService.getPokemonCardById(template.id)
				if (fullData.success && fullData.data) {
					evolutionCards.push({
						...fullData.data,
						isObtained: obtainedCardIds.has(fullData.data.id),
					})
				}
			}
		}

		return {
			chainId,
			evolutionCards,
			hasEvolution,
		}
	} catch (error) {
		console.error('Error loading evolutions:', error)
		return { chainId: 0, evolutionCards: [] }
	}
}
