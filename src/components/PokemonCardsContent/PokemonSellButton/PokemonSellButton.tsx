'use client'

import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { Loader2, Check } from 'lucide-react'
import { usePokemonSellButton } from './hooks/usePokemonSellButton'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'

const PokemonSellButton = () => {
	const { state, functions } = usePokemonSellButton()

	const pathname = usePathname()

	if (!state.hasCard || state.isObtained === false || pathname !== '/deck') {
		return null
	}

	return (
		<Button
			onClick={functions.handleSellClick}
			disabled={state.isSelling}
			className={cn(
				'px-3 transition-colors duration-200 flex items-center gap-1.5',
				state.isConfirming
					? 'bg-green-400 hover:bg-green-300 text-primary border-primary/50 px-6'
					: 'bg-primary text-primary-foreground hover:bg-primary/80',
			)}
		>
			{state.isSelling ? (
				<Loader2 className='w-5 h-5 animate-spin' />
			) : state.isConfirming ? (
				<Check className='w-5 h-5' />
			) : (
				<>
					<span className='font-semibold'>{state.sellPrice}</span>
					<Image src='/profile/coin.png' alt='coins' width={20} height={20} />
				</>
			)}
		</Button>
	)
}

export default PokemonSellButton
