import {
	PokemonAbilityApiSchema,
	PokemonApiResponse,
	PokemonApiSchema,
	PokemonCardType,
	PokemonItem,
	PokemonItemApiSchema,
	PokemonModalDetails,
	PokemonMove,
	PokemonMoveApiSchema,
	PokemonPageData,
} from '@/types/pokemon'
import { pokemonService } from '@/server/services/pokemon.service'
import { cache } from 'react'

/* eslint-disable @typescript-eslint/no-explicit-any */
const BASE_URL = 'https://pokeapi.co/api/v2'

export async function getPokemonById(id: number) {
	const res = await fetch(`${BASE_URL}/pokemon/${id}`, {
		next: { revalidate: 86400 },
	})

	const raw = await res.json()

	if (!res.ok) {
		throw new Error('Failed to fetch pokemon')
	}

	return PokemonApiSchema.parse(raw)
}

export async function getPokemonByName(name: string) {
	const res = await fetch(`${BASE_URL}/pokemon/${name}`, {
		next: { revalidate: 86400 },
	})

	if (!res.ok) {
		throw new Error('Failed to fetch pokemon')
	}

	const raw = await res.json()
	return PokemonApiSchema.parse(raw)
}

const fetchMoveWithCache = cache(async (url: string, name: string) => {
	try {
		const res = await fetch(url, { next: { revalidate: 86400 } })
		if (!res.ok) return null

		const raw = await res.json()
		return PokemonMoveApiSchema.parse(raw)
	} catch (e) {
		console.error(`Error fetching move ${name}:`, e)
		return null
	}
})

export async function getPokemonMoves(
	attackMoves: PokemonApiResponse['moves'],
	pokemonTypes: string[],
	limit?: number,
) {
	const movesToFetch = limit ? attackMoves.slice(0, limit) : attackMoves

	const moves = await Promise.all(
		movesToFetch.map(async ({ move }) => {
			const parsed = await fetchMoveWithCache(move.url, move.name)
			if (!parsed) return null

			return {
				id: parsed.id,
				name: parsed.name,
				damage: parsed.power,
				typeName: parsed.type.name,
				energy: `/energy/${parsed.type.name}.png`,
			} satisfies PokemonMove
		}),
	)

	const validMoves = moves.filter((m): m is PokemonMove => m !== null)

	const sortedMoves = validMoves.sort((a, b) => {
		const aIsMatch = pokemonTypes.includes(a.typeName)
		const bIsMatch = pokemonTypes.includes(b.typeName)
		if (aIsMatch && !bIsMatch) return -1
		if (!aIsMatch && bIsMatch) return 1
		return 0
	})

	return limit ? sortedMoves.slice(0, limit) : sortedMoves
}

export async function getPokemonHeldItems(
	heldItems: PokemonApiResponse['held_items'],
) {
	const items = await Promise.all(
		heldItems.map(async ({ item }) => {
			const res = await fetch(item.url, { next: { revalidate: 86400 } })

			if (!res.ok) throw new Error(`Failed to fetch item: ${item.name}`)

			const raw = await res.json()
			const parsed = PokemonItemApiSchema.parse(raw)

			const englishEntry = parsed.effect_entries.find(
				entry => entry.language.name === 'en',
			)

			return {
				id: parsed.id,
				name: parsed.name,
				sprite: parsed.sprites.default,
				description:
					englishEntry?.effect.replace(/\n|•/g, ' ') ??
					'No description available.',
			} satisfies PokemonItem
		}),
	)

	return items
}

export async function getPokemonAbilities(
	apiAbilities: PokemonApiResponse['abilities'],
) {
	const abilities = await Promise.all(
		apiAbilities.map(async ({ ability }) => {
			const res = await fetch(ability.url, { next: { revalidate: 86400 } })

			if (!res.ok) throw new Error(`Failed to fetch ability: ${ability.name}`)

			const raw = await res.json()
			const parsed = PokemonAbilityApiSchema.parse(raw)

			const englishEntry = parsed.flavor_text_entries.find(
				entry => entry.language.name === 'en',
			)

			return {
				id: parsed.id,
				name: parsed.name,
				description:
					englishEntry?.flavor_text.replace(/\n|•/g, ' ') ??
					'No description available.',
			}
		}),
	)

	return abilities
}

export async function getPokemonFullData(
	id: number,
	movesLimit = 2,
): Promise<Omit<PokemonCardType, 'rarity' | 'id'>> {
	const pokemon = await getPokemonById(id)

	const typeNames = pokemon.types.map(type_index => type_index.type.name)

	const moves = await getPokemonMoves(pokemon.moves, typeNames, movesLimit)

	return {
		pokemonId: pokemon.id,
		name: pokemon.name,
		image: pokemon.sprites.other['official-artwork'].front_default,
		hp: pokemon.stats[0].base_stat,
		types: pokemon.types,
		moves,
	}
}

export async function getPokemonModalDetailsData(
	id: number,
	movesLimit = 4,
): Promise<PokemonModalDetails> {
	const pokemon = await getPokemonById(id)

	const typeNames = pokemon.types.map(type_index => type_index.type.name)
	const moves = await getPokemonMoves(pokemon.moves, typeNames, movesLimit)

	const hp = pokemon.stats.find(s => s.stat.name === 'hp')?.base_stat ?? 0
	const attack =
		pokemon.stats.find(s => s.stat.name === 'attack')?.base_stat ?? 0
	const defense =
		pokemon.stats.find(s => s.stat.name === 'defense')?.base_stat ?? 0
	const speed = pokemon.stats.find(s => s.stat.name === 'speed')?.base_stat ?? 0
	const specialAttack =
		pokemon.stats.find(s => s.stat.name === 'special-attack')?.base_stat ?? 0

	const abilities = pokemon.abilities.map(a => a.ability.name)

	const gif =
		pokemon?.sprites?.other?.showdown?.front_default ??
		pokemon?.sprites.other['official-artwork'].front_default

	const heldItems = await getPokemonHeldItems(pokemon.held_items)

	const buttonImage =
		pokemon.sprites.versions?.['generation-v']?.['black-white']?.animated
			?.front_default ??
		pokemon.sprites.versions?.['generation-v']?.['black-white']
			?.front_default ??
		'/assets/additional/gif_indicator.gif'

	return {
		hp,
		attack,
		specialAttack,
		defense,
		speed,
		gif,
		buttonImage,
		heldItems,
		abilities,
		moves,
		types: pokemon.types,
		baseExperience: pokemon.base_experience,
	}
}

export async function getPokemonPageData(id: number): Promise<PokemonPageData> {
	const pokemonCard = await pokemonService.getPokemonCardById(id)
	if (!pokemonCard.success) throw new Error(pokemonCard.error)

	const pokemon = await getPokemonById(pokemonCard.data.pokemonId)

	const typeNames = pokemon.types.map(type_index => type_index.type.name)

	const moves = await getPokemonMoves(pokemon.moves, typeNames, 2)
	const allMoves = await getPokemonMoves(pokemon.moves, typeNames)

	const hp = pokemon.stats.find(s => s.stat.name === 'hp')?.base_stat ?? 0
	const attack =
		pokemon.stats.find(s => s.stat.name === 'attack')?.base_stat ?? 0
	const defense =
		pokemon.stats.find(s => s.stat.name === 'defense')?.base_stat ?? 0
	const speed = pokemon.stats.find(s => s.stat.name === 'speed')?.base_stat ?? 0
	const specialAttack =
		pokemon.stats.find(s => s.stat.name === 'special-attack')?.base_stat ?? 0
	const specialDefence =
		pokemon.stats.find(s => s.stat.name === 'special-defense')?.base_stat ?? 0

	const hpSpeedImage =
		pokemon.sprites.versions?.['generation-v']?.['black-white']?.animated
			?.front_default ??
		pokemon.sprites.versions?.['generation-v']?.['black-white']
			?.front_default ??
		'/assets/additional/gif_indicator.gif'
	const attackImage =
		pokemon.sprites.versions?.['generation-v']?.['black-white']?.animated
			?.front_shiny ??
		pokemon.sprites.versions?.['generation-v']?.['black-white']?.front_shiny ??
		'/assets/additional/gif_indicator.gif'
	const defenseImage =
		pokemon.sprites.versions?.['generation-v']?.['black-white']?.animated
			?.back_default ??
		pokemon.sprites.versions?.['generation-v']?.['black-white']
			?.front_default ??
		'/assets/additional/gif_indicator.gif'
	const specialDefenceImage =
		pokemon.sprites.versions?.['generation-v']?.['black-white']?.animated
			?.back_shiny ??
		pokemon.sprites.versions?.['generation-v']?.['black-white']?.front_shiny ??
		'/assets/additional/gif_indicator.gif'

	const stats = [
		{
			name: 'HP',
			value: hp,
			image: hpSpeedImage,
			className:
				'animate-pulse opacity-100 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]',
		},
		{
			name: 'ATTACK',
			value: attack,
			image: attackImage,
			className: 'animate-bounce [animation-duration:1.2s]',
		},
		{
			name: 'DEFENSE',
			value: defense,
			image: defenseImage,
			className: 'animate-sway brightness-95',
		},
		{
			name: 'SPEED',
			value: speed,
			image: hpSpeedImage,
			className: 'animate-vibrate',
		},
		{
			name: 'SPECIAL ATTACK',
			value: specialAttack,
			image: attackImage,
			className: 'animate-float drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]',
		},
		{
			name: 'SPECIAL DEFENSE',
			value: specialDefence,
			image: specialDefenceImage,
			className: 'animate-sway drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]',
		},
	]

	const abilities = await getPokemonAbilities(pokemon.abilities)
	const gif =
		pokemon?.sprites?.other?.showdown?.front_default ??
		pokemon?.sprites.other['official-artwork'].front_default
	const heldItems = await getPokemonHeldItems(pokemon.held_items)

	const gallerySprites: { generation: string; sprite: string }[] = []
	const versions = pokemon.sprites.versions as any
	if (versions) {
		const romanToNum: Record<string, number> = {
			i: 1,
			ii: 2,
			iii: 3,
			iv: 4,
			v: 5,
			vi: 6,
			vii: 7,
			viii: 8,
			ix: 9,
		}

		const sortedEntries = Object.entries(versions).sort((a, b) => {
			const aRoman = a[0].split('-')[1]
			const bRoman = b[0].split('-')[1]
			return (romanToNum[aRoman] || 99) - (romanToNum[bRoman] || 99)
		})

		for (const [gen, games] of sortedEntries) {
			const gameList = Object.values(games as any)
			for (const game of gameList) {
				const gameData = game as any
				if (
					gameData &&
					typeof gameData === 'object' &&
					gameData.front_default
				) {
					const genNumeral = gen.split('-')[1]?.toUpperCase() || gen
					gallerySprites.push({
						generation: genNumeral,
						sprite: gameData.front_transparent
							? gameData.front_transparent
							: gameData.front_default,
					})
					break
				}
			}
		}
	}

	const evYields = pokemon.stats
		.filter(s => s.effort > 0)
		.map(s => ({
			stat: s.stat.name.replace('-', ' '),
			effort: s.effort,
		}))

	return {
		id: pokemonCard.data.id,
		pokemonId: pokemonCard.data.pokemonId,
		name: pokemonCard.data.name,
		stats,
		types: pokemon.types,
		moves,
		abilities,
		gif,
		gallerySprites,
		heldItems,
		evYields,
		baseExperience: pokemon.base_experience,
		rarity: pokemonCard.data.rarity,
		allMoves,
	}
}
