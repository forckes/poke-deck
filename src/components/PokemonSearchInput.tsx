'use client'

import { usePokemonStore } from '@/store/usePokemonStore'
import { Input } from './ui/input'
import { useState, ChangeEvent } from 'react'
import { useDebounceCallback } from '@/lib/hooks/useDebounceCallback'
import { Button } from './ui/button'
import { DeleteIcon } from 'lucide-react'

const PokemonSearchInput = () => {
	const setSearchQuery = usePokemonStore(state => state.setSearchQuery)
	const searchQuery = usePokemonStore(state => state.searchQuery)
	const [inputValue, setInputValue] = useState<string>(searchQuery)
	const debouncedSearch = useDebounceCallback((query: string) => {
		setSearchQuery(query)
	}, 500)

	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value
		setInputValue(val)
		debouncedSearch(val)
	}

	return (
		<div className='flex items-center gap-2 w-full relative'>
			<Input
				placeholder='Search cards...'
				value={inputValue}
				onChange={handleInputChange}
				className='flex-1 h-10'
			/>
			{inputValue && (
				<Button
					onClick={() => {
						setInputValue('')
						setSearchQuery('')
					}}
					variant='ghost'
					size='icon'
					className='absolute right-2 h-8 w-8'
				>
					<DeleteIcon />
				</Button>
			)}
		</div>
	)
}

export default PokemonSearchInput
