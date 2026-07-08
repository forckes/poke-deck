'use client'

import Image from 'next/image'
import PokemonCardsContent from '@/components/PokemonCardsContent/PokemonCardsContent'
import { usePokemonCardList } from '@/components/PokemonCardList/hooks/usePokemonCardList'

const CollectionPage = () => {
	const { state } = usePokemonCardList('all')

	return (
		<div className='flex flex-col items-center w-250 mx-auto mt-20'>
			<div className='w-full mb-4'>
				<h2 className='text-3xl md:text-4xl font-black text-foreground/90 shiny-purple inline-block'>
					POKÉMON COLLECTION
				</h2>
			</div>

			<div className='w-full flex gap-4 items-center mt-4'>
				<h4 className='text-xs font-bold text-gray-500 uppercase tracking-wider'>
					Pokémons owned ({state.obtainedCardCount}/{state.totalCardCount})
				</h4>

				<div className='h-2 flex-1 w-full rounded-full bg-primary/10 shadow-inner'>
					<div
						className='h-full rounded-full bg-primary/80 transition-all duration-1000 ease-out relative'
						style={{
							width: `${Math.min(100, ((state.obtainedCardCount ?? 0) / (state.totalCardCount ?? 0)) * 100)}%`,
						}}
					>
						<div className='absolute inset-0 bg-white/20 w-full h-full rounded-full' />
						<div className='absolute w-12 h-12 bottom-2 right-0 translate-x-1/2 z-10'>
							<Image
								src='/assets/additional/gif_indicator.gif'
								fill
								className='object-contain'
								alt='gif_indicator'
							/>
						</div>
					</div>
				</div>
			</div>

			<PokemonCardsContent scope='all' />
		</div>
	)
}

export default CollectionPage
