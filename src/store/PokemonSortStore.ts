import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type SortOrder = 'asc' | 'desc'

export enum PokemonSortField {
	ID = 'id',
	NAME = 'name',
	RARITY = 'rarity',
	TYPE = 'type',
	DATE = 'date',
}

interface PokemonSortState {
	field: PokemonSortField | null
	order: SortOrder
	setSortBy: (newField: PokemonSortField) => void
}

export const usePokemonSortStore = create<PokemonSortState>()(
	persist(
		set => ({
			field: null,
			order: 'asc',
			setSortBy: field =>
				set(state => {
					if (state.field === field) {
						return {
							order: state.order === 'asc' ? 'desc' : 'asc',
						}
					}
					return {
						field,
						order: 'asc',
					}
				}),
		}),
		{ name: 'sort-storage' },
	),
)
