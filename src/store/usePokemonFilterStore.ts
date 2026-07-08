import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export enum PokemonFilterField {
	RARITY = 'rarity',
	TYPE = 'type',
}

export enum PokemonRarity {
	COMMON = 'common',
	EPIC = 'epic',
	LEGENDARY = 'legendary',
}

export enum PokemonType {
	FIRE = 'fire',
	WATER = 'water',
	GRASS = 'grass',
	ELECTRIC = 'electric',
	GHOST = 'ghost',
	DARK = 'dark',
	STEEL = 'steel',
	FIGHTING = 'fighting',
	DRAGON = 'dragon',
	FAIRY = 'fairy',
	GROUND = 'ground',
	BUG = 'bug',
	FLYING = 'flying',
	POISON = 'poison',
	PHYSIC = 'psychic',
	ICE = 'ice',
	NORMAL = 'normal',
	ROCK = 'rock',
}

export interface PokemonFilters {
	rarity: PokemonRarity[]
	type: PokemonType[]
}

interface PokemonFilterStore {
	filters: PokemonFilters

	toggleRarity: (value: PokemonRarity) => void
	toggleType: (value: PokemonType) => void

	clearField: (field: keyof PokemonFilters) => void
	resetFilters: () => void
}

const toggleValue = <T>(array: T[], value: T): T[] => {
	return array.includes(value)
		? array.filter(v => v !== value)
		: [...array, value]
}

export const usePokemonFilterStore = create<PokemonFilterStore>()(
	persist(
		set => ({
			filters: {
				rarity: [],
				type: [],
				search: '',
			},

			toggleRarity: value =>
				set(state => ({
					filters: {
						...state.filters,
						rarity: toggleValue(state.filters.rarity, value),
					},
				})),

			toggleType: value =>
				set(state => ({
					filters: {
						...state.filters,
						type: toggleValue(state.filters.type, value),
					},
				})),

			clearField: field =>
				set(state => ({
					filters: {
						...state.filters,
						[field]: Array.isArray(state.filters[field]) ? [] : '',
					},
				})),

			resetFilters: () =>
				set({
					filters: {
						rarity: [],
						type: [],
					},
				}),
		}),
		{ name: 'pokemon-filters' },
	),
)
