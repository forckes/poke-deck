import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type SortOrder = 'asc' | 'desc'

export enum MovesSortField {
	NAME = 'name',
	DAMAGE = 'damage',
	ENERGY = 'energy',
}

interface MovesSortState {
	field: MovesSortField | null
	order: SortOrder
	setSortBy: (newField: MovesSortField) => void
}

export const useMovesSortStore = create<MovesSortState>()(
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
