'use client'

import { Input } from './ui/input'
import { useState, ChangeEvent } from 'react'
import { useDebounceCallback } from '@/lib/hooks/useDebounceCallback'
import { Button } from './ui/button'
import { DeleteIcon } from 'lucide-react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

const RouterSearchInput = () => {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()

	const [inputValue, setInputValue] = useState(searchParams.get('query') || '')

	const updateUrl = useDebounceCallback((term: string) => {
		const params = new URLSearchParams(searchParams.toString())
		if (term) {
			params.set('query', term)
		} else {
			params.delete('query')
		}
		router.replace(`${pathname}?${params.toString()}`, { scroll: false })
	}, 400)

	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		setInputValue(value)
		updateUrl(value)
	}

	const handleClear = () => {
		setInputValue('')
		const params = new URLSearchParams(searchParams.toString())
		params.delete('query')
		router.replace(`${pathname}?${params.toString()}`, { scroll: false })
	}

	return (
		<div className='flex items-center gap-2 w-full relative'>
			<Input
				placeholder='Search moves...'
				value={inputValue}
				onChange={handleInputChange}
				className='flex-1 h-10 pr-10'
			/>
			{inputValue && (
				<Button
					onClick={handleClear}
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

export default RouterSearchInput
