'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { getSortedTradeCardsAction } from '@/lib/actions/trade.actions'
import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { usePokemonSortStore } from '@/store/PokemonSortStore'
import { usePokemonStore } from '@/store/usePokemonStore'
import PokemonFlipCard from '../PokemonCard/PokemonFlipCard'
import { PokemonCard } from '../PokemonCard/PokemonCard'
import PokemonSearchInput from '../PokemonSearchInput'
import SortSelector from '../SortSelector'
import { TradeCard } from './TradeCards/TradeCardsPreview'

type TradeCardListProps = {
	targetUserId: string
	secondUserId: string
	tempSelectedCards: TradeCard[]
	toggleCardSelection: (card: TradeCard) => void
}

export const TradeCardList = ({
	targetUserId,
	secondUserId,
	tempSelectedCards,
	toggleCardSelection,
}: TradeCardListProps) => {
	const { ref, inView } = useInView()

	const { field, order } = usePokemonSortStore()
	const { searchQuery } = usePokemonStore()

	const {
		data,
		status,
		error,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useInfiniteQuery({
		queryKey: ['trade-cards', targetUserId, field, order],
		initialPageParam: 0,
		queryFn: ({ pageParam }) =>
			getSortedTradeCardsAction(
				targetUserId,
				secondUserId,
				field,
				order,
				15,
				pageParam as number,
			),
		getNextPageParam: lastPage =>
			(lastPage as { nextCursor: number | null }).nextCursor ?? undefined,
		enabled: !!targetUserId,
	})

	const isLoading = status === 'pending'
	const isError = status === 'error'
	const isSuccess = status === 'success'

	const isFlipped = isSuccess

	useEffect(() => {
		if (inView && hasNextPage && !isFetchingNextPage) {
			fetchNextPage()
		}
	}, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

	const tradeCards = data?.pages.flatMap(page => page.cards) ?? []
	const filteredCards = tradeCards.filter((card: TradeCard) =>
		card.cardData?.name?.toLowerCase().includes(searchQuery.toLowerCase()),
	)

	const cardsToRender = isLoading
		? Array.from({ length: 15 }, (_, i) => null)
		: filteredCards

	return (
		<div className='flex flex-col items-center w-full max-w-[1000px] mx-auto pt-4 h-full'>
			<div className='flex w-full gap-2 mb-4 shrink-0'>
				<PokemonSearchInput />
				<SortSelector store='pokemon' />
			</div>

			<div className='flex-1 w-full overflow-y-auto min-h-0 flex flex-col items-center pb-8'>
				{isError && (
					<p className='text-red-500 mt-4'>Error: {(error as Error).message}</p>
				)}

				{isSuccess && filteredCards.length === 0 && (
					<p className='text-gray-500 text-center w-full mt-8'>
						No Pokémon found matching &quot;{searchQuery}&quot;
					</p>
				)}

				<div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 w-full justify-items-center mt-2 px-2'>
					{cardsToRender.map((tradeCard, index) => {
						const isSelected = tradeCard
							? tempSelectedCards.some(
									c => c.userCardId === tradeCard.userCardId,
								)
							: false

						return (
							<div
								key={tradeCard?.userCardId ?? `skeleton-${index}`}
								onClick={() => tradeCard && toggleCardSelection(tradeCard)}
								className={`relative cursor-pointer transition-all duration-200 rounded-xl overflow-hidden border-2 ${
									isSelected
										? 'border-primary ring-2 ring-primary/50 ring-offset-2 ring-offset-background'
										: 'border-transparent hover:border-primary/50'
								}`}
								style={{ width: '190px', height: '270px' }}
							>
								<div className='transform scale-[0.6] origin-top-left pointer-events-none absolute top-0 left-0'>
									<PokemonFlipCard isFlipped={isFlipped} isLoading={isLoading}>
										{tradeCard ? (
											<PokemonCard pokemonData={tradeCard.cardData} />
										) : null}
									</PokemonFlipCard>
								</div>

								{isSelected && (
									<div className='absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-sm z-10'>
										<div className='w-2 h-2 bg-primary-foreground rounded-full' />
									</div>
								)}
							</div>
						)
					})}
				</div>

				{isSuccess && <div ref={ref} className='w-full h-10 mt-2 shrink-0' />}

				{isFetchingNextPage && (
					<div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 w-full justify-items-center pb-8'>
						{Array.from({ length: 5 }, (_, i) => (
							<div
								key={`loading-more-${i}`}
								className='relative rounded-xl overflow-hidden border-2 border-transparent'
								style={{ width: '190px', height: '270px' }}
							>
								<div className='transform scale-[0.6] origin-top-left pointer-events-none absolute top-0 left-0'>
									<PokemonFlipCard isFlipped={false} isLoading={true}>
										{null}
									</PokemonFlipCard>
								</div>
							</div>
						))}
					</div>
				)}

				{isSuccess && !hasNextPage && filteredCards.length > 0 && (
					<p className='text-gray-400 text-sm py-8'>
						You&apos;ve seen all Pokémon!
					</p>
				)}
			</div>
		</div>
	)
}
