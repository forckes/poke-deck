import { z } from 'zod'
import { Rarity } from '@/generated/enums'

export const PokemonApiSchema = z.object({
	id: z.number(),
	name: z.string(),
	sprites: z.object({
		other: z.object({
			'official-artwork': z.object({ front_default: z.string() }),
			showdown: z.object({ front_default: z.string().nullable() }).nullable(),
		}),
		versions: z
			.object({
				'generation-v': z
					.object({
						'black-white': z
							.object({
								animated: z
									.object({
										front_default: z.string().nullable(),
										front_shiny: z.string().nullable(),
										back_default: z.string().nullable(),
										back_shiny: z.string().nullable(),
										front_transparent: z.string().optional().nullable(),
									})
									.nullable(),

								front_default: z.string().nullable(),
								front_shiny: z.string().nullable(),
								back_default: z.string().nullable(),
								back_shiny: z.string().nullable(),
							})
							.loose(),
					})
					.loose(),
			})
			.loose(),
	}),
	held_items: z.array(
		z.object({
			item: z.object({ name: z.string(), url: z.string() }),
		}),
	),
	stats: z.array(
		z.object({
			base_stat: z.number(),
			effort: z.number(),
			stat: z.object({ name: z.string() }),
		}),
	),
	types: z.array(z.object({ type: z.object({ name: z.string() }) })),
	moves: z.array(
		z.object({ move: z.object({ url: z.string(), name: z.string() }) }),
	),
	abilities: z.array(
		z.object({ ability: z.object({ name: z.string(), url: z.string() }) }),
	),
	base_experience: z.number(),
})

export const PokemonMoveApiSchema = z.object({
	id: z.number(),
	name: z.string(),
	power: z.number().nullable(),
	type: z.object({ name: z.string() }),
})

export const PokemonItemApiSchema = z.object({
	id: z.number(),
	name: z.string(),
	sprites: z.object({
		default: z.string(),
	}),
	effect_entries: z.array(
		z.object({
			effect: z.string(),
			language: z.object({
				name: z.string(),
			}),
		}),
	),
})

export const PokemonAbilityApiSchema = z.object({
	id: z.number(),
	name: z.string(),
	flavor_text_entries: z.array(
		z.object({
			flavor_text: z.string(),
			language: z.object({
				name: z.string(),
			}),
		}),
	),
})
export interface PokemonMove {
	id: number
	name: string
	damage: number | null
	typeName: string
	energy: string
}

export interface PokemonItem {
	id: number
	name: string
	sprite: string
	description: string
}

export interface PokemonCardType {
	id: number
	pokemonId: number
	name: string
	image: string
	hp: number
	types: { type: { name: string } }[]
	moves: PokemonMove[]
	rarity: Rarity
	isObtained?: boolean
}

export interface PokemonCardTypeMeta {
	id: number
	pokemonId: number
	rarity: Rarity
	createdAt?: Date
}

export interface PokemonAbility {
	id: number
	name: string
	description: string
}

export interface PokemonModalDetails {
	hp: number
	attack: number
	specialAttack: number
	defense: number
	speed: number
	gif: string
	buttonImage: string
	heldItems: PokemonItem[]
	abilities: string[]
	moves: PokemonMove[]
	types: { type: { name: string } }[]
	baseExperience: number
}

export interface PokemonPageData {
	id: number
	name: string
	stats: {
		name: string
		value: number
		image: string
		className?: string
	}[]
	gif: string
	heldItems: PokemonItem[]
	abilities: PokemonAbility[]
	gallerySprites: { generation: string; sprite: string }[]
	moves: PokemonMove[]
	evYields: { stat: string; effort: number }[]
	types: { type: { name: string } }[]
	baseExperience: number
	pokemonId: number
	rarity: Rarity
	allMoves: PokemonMove[]
}

export interface PokemonCardProps {
	pokemonData: PokemonCardType
	className?: string
}

export type PokemonApiResponse = z.infer<typeof PokemonApiSchema>
export type PokemonMoveApiResponse = z.infer<typeof PokemonMoveApiSchema>

export type PokemonCardResult =
	| { success: true; data: PokemonCardType }
	| { success: false; error: string }

export type PokemonCardsResult =
	| {
			success: true
			data: {
				cards: PokemonCardType[]
				obtainedCount: number
				totalCount: number
			}
	  }
	| { success: false; error: string }

export type FetchState<T = PokemonCardType> =
	| { status: 'idle' }
	| { status: 'loading' }
	| { status: 'error'; message: string }
	| { status: 'success'; data: T }
