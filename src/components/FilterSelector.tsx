'use client'

import {
	Popover,
	PopoverContent,
	PopoverHeader,
	PopoverTitle,
	PopoverTrigger,
} from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

import {
	PokemonRarity,
	PokemonType as StorePokemonType,
	usePokemonFilterStore,
} from '@/store/usePokemonFilterStore'
import { Button } from './ui/button'
import { CircleX, Filter, ListRestart } from 'lucide-react'
import { PokemonType, pokemonTypes } from '@/constants/pokemonTypes'
import NotificationPing from './NotificationPing'

const FilterSelector = () => {
	const { filters, toggleRarity, toggleType, resetFilters, clearField } =
		usePokemonFilterStore()

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button className='relative' size='sm' variant='outline'>
					Filter <Filter />
					{(filters.rarity.length > 0 || filters.type.length > 0) && (
						<NotificationPing />
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent align='end' className='w-56 h-72 overflow-y-auto'>
				<PopoverHeader className='flex flex-row items-center justify-between space-y-0'>
					<PopoverTitle>Filters</PopoverTitle>
					<Button
						variant='ghost'
						size='xs'
						onClick={resetFilters}
						title='Reset all filters'
					>
						<ListRestart className='w-4 h-4' />
					</Button>
				</PopoverHeader>

				<div className='flex items-center justify-between mb-2'>
					<p className='text-sm text-gray-500'>Rarity</p>
					{filters.rarity.length > 0 && (
						<Button
							variant='ghost'
							size='xs'
							className='h-6 px-1'
							onClick={() => clearField('rarity')}
						>
							<CircleX className='w-3 h-3' />
						</Button>
					)}
				</div>
				<div className='space-y-3 mb-2'>
					{Object.values(PokemonRarity).map(rarity => (
						<div className='flex items-center justify-start gap-2' key={rarity}>
							<Checkbox
								id={`${rarity}-checkbox`}
								name={`${rarity}-checkbox`}
								checked={filters.rarity.includes(rarity)}
								onCheckedChange={() => toggleRarity(rarity)}
								className='cursor-pointer'
							/>
							<Label
								className='capitalize cursor-pointer'
								htmlFor={`${rarity}-checkbox`}
							>
								{rarity}
							</Label>
						</div>
					))}
				</div>

				<div className='flex items-center justify-between mb-2'>
					<p className='text-sm text-gray-500'>Type</p>
					{filters.type.length > 0 && (
						<Button
							variant='ghost'
							size='xs'
							className='h-6 px-1'
							onClick={() => clearField('type')}
						>
							<CircleX className='w-3 h-3' />
						</Button>
					)}
				</div>
				<div className='space-y-3'>
					{(Object.keys(pokemonTypes) as PokemonType[]).map(typeKey => (
						<div
							className='flex items-center justify-start gap-2 cursor-pointer'
							key={typeKey}
						>
							<Checkbox
								id={`${typeKey}-checkbox`}
								name={`${typeKey}-checkbox`}
								checked={filters.type.includes(
									typeKey as unknown as StorePokemonType,
								)}
								onCheckedChange={() =>
									toggleType(typeKey as unknown as StorePokemonType)
								}
								className='cursor-pointer'
							/>
							<Label
								className='capitalize cursor-pointer'
								htmlFor={`${typeKey}-checkbox`}
							>
								{typeKey}
							</Label>
						</div>
					))}
				</div>
			</PopoverContent>
		</Popover>
	)
}

export default FilterSelector
