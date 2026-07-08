'use client'

import { usePokemonSortStore, PokemonSortField } from '@/store/PokemonSortStore'
import { useMovesSortStore, MovesSortField } from '@/store/useMoveSortStore'
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from './ui/select'
import { SortAsc, SortDesc } from 'lucide-react'

type BaseSortSelectorProps<T extends string> = {
	field: T | null
	order: 'asc' | 'desc'
	onSortBy: (field: T) => void
	sortFields: Record<string, T>
}

function BaseSortSelector<T extends string>({
	field,
	order,
	onSortBy,
	sortFields,
}: BaseSortSelectorProps<T>) {
	return (
		<div className='flex items-center gap-2'>
			<Select
				value={field ?? undefined}
				onValueChange={value => onSortBy(value as T)}
			>
				<SelectTrigger className='w-35 h-10! capitalize'>
					<SelectValue placeholder='Sort by' />
				</SelectTrigger>
				<SelectContent position='popper'>
					<SelectGroup>
						{Object.values(sortFields).map(fieldValue => (
							<SelectItem
								className='capitalize'
								key={fieldValue}
								value={fieldValue}
							>
								{fieldValue}
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>

			<button
				onClick={() => field && onSortBy(field)}
				className='p-2 border border-gray-300 rounded-md transition-colors flex items-center justify-center text-gray-600 cursor-pointer'
				aria-label='Toggle sort order'
				disabled={!field}
			>
				{order === 'asc' ? <SortAsc size={20} /> : <SortDesc size={20} />}
			</button>
		</div>
	)
}

const PokemonSortSelectorWrapper = () => {
	const { field, order, setSortBy } = usePokemonSortStore()
	return (
		<BaseSortSelector
			field={field}
			order={order}
			onSortBy={setSortBy}
			sortFields={PokemonSortField as Record<string, PokemonSortField>}
		/>
	)
}

const MovesSortSelectorWrapper = () => {
	const { field, order, setSortBy } = useMovesSortStore()
	return (
		<BaseSortSelector
			field={field}
			order={order}
			onSortBy={setSortBy}
			sortFields={MovesSortField as Record<string, MovesSortField>}
		/>
	)
}

type SortSelectorProps = {
	store: 'pokemon' | 'moves'
}

const SortSelector = ({ store }: SortSelectorProps) => {
	if (store === 'pokemon') {
		return <PokemonSortSelectorWrapper />
	}
	return <MovesSortSelectorWrapper />
}

export default SortSelector
