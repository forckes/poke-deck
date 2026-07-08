'use client'

import { useRef, useState, useEffect } from 'react'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import { PokemonCard } from '../PokemonCard/PokemonCard'
import PokemonFlipCard from '../PokemonCard/PokemonFlipCard'
import { usePokemonCardList } from './hooks/usePokemonCardList'
import { motion } from 'motion/react'
import { chunk } from '@/utils/helpers/chunk'

type Props = {
	targetUserId?: string
	scope: 'user' | 'all'
}

const PokemonCardList = ({ targetUserId, scope }: Props) => {
	const { state, functions, status } = usePokemonCardList(scope, targetUserId)

	const parentRef = useRef<HTMLDivElement>(null)
	const [scrollMargin, setScrollMargin] = useState(0)

	useEffect(() => {
		if (parentRef.current) {
			setScrollMargin(parentRef.current.offsetTop)
		}
	}, [])

	const itemsToRender = [...state.cardsToRender]
	if (status.isFetchingNextPage) {
		itemsToRender.push(null, null, null)
	}

	const rows = chunk(itemsToRender, 3)

	const rowVirtualizer = useWindowVirtualizer({
		count: rows.length,
		estimateSize: () => 486,
		scrollMargin,
		overscan: 5,
	})

	const virtualItems = rowVirtualizer.getVirtualItems()

	useEffect(() => {
		const lastItem = virtualItems[virtualItems.length - 1]
		if (!lastItem) return

		if (
			lastItem.index >= rows.length - 1 &&
			status.hasNextPage &&
			!status.isFetchingNextPage &&
			status.isSuccess
		) {
			functions.fetchNextPage()
		}
	}, [
		virtualItems,
		rows.length,
		status.hasNextPage,
		status.isFetchingNextPage,
		status.isSuccess,
		functions,
	])

	return (
		<div className='flex flex-col items-center w-full'>
			{status.isError && (
				<p className='text-red-500'>Error: {(state.error as Error).message}</p>
			)}

			{status.isSuccess && state.cards.length === 0 && (
				<p className='text-gray-500 text-center w-full mt-8'>
					No Pokémon found matching &quot;{state.searchQuery}&quot;
				</p>
			)}

			<div className='w-full mt-4 pt-8'>
				<div
					ref={parentRef}
					className='w-full relative'
					style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
				>
					{rowVirtualizer.getVirtualItems().map(virtualRow => {
						const rowItems = rows[virtualRow.index]
						return (
							<div
								key={virtualRow.key}
								data-index={virtualRow.index}
								ref={rowVirtualizer.measureElement}
								style={{
									position: 'absolute',
									top: 0,
									left: 0,
									width: '100%',
									transform: `translateY(${virtualRow.start - rowVirtualizer.options.scrollMargin}px)`,
								}}
								className='grid grid-cols-3 gap-12 pb-12'
							>
								{rowItems.map((card, index) => (
									<div
										key={
											card?.id
												? `card-${card.id}-${index}`
												: `skeleton-${virtualRow.index}-${index}`
										}
										onClick={() => card && functions.setSelectedModalCard(card)}
										className={card ? 'cursor-pointer' : ''}
									>
										{card ? (
											<motion.div
												layoutId={
													state.selectedModalCard?.id === card.id
														? undefined
														: `card-${card.id}`
												}
											>
												<PokemonFlipCard
													isFlipped={status.isFlipped}
													isLoading={status.isLoading}
													className={
														scope === 'all' && !card.isObtained
															? 'opacity-80 grayscale hover:opacity-100'
															: ''
													}
												>
													<PokemonCard pokemonData={card} />
												</PokemonFlipCard>
											</motion.div>
										) : (
											<PokemonFlipCard
												isFlipped={status.isFlipped}
												isLoading={status.isLoading}
											>
												{null}
											</PokemonFlipCard>
										)}
									</div>
								))}
							</div>
						)
					})}
				</div>
			</div>

			{status.isSuccess && !status.hasNextPage && state.cards.length > 0 && (
				<p className='text-gray-400 text-sm py-8'>
					You&apos;ve seen all your Pokémon!
				</p>
			)}
		</div>
	)
}

export default PokemonCardList
