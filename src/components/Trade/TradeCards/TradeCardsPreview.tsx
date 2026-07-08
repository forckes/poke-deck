/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/ui/button'
import { PokemonCard } from '@/components/PokemonCard/PokemonCard'
import { X } from 'lucide-react'

export type TradeCard = {
	userCardId: string
	ownerId: string | null
	cardData: any
}

type Props = {
	target: 'sender' | 'receiver'
	cards: TradeCard[]
	isSender: boolean
	tradeStatus: string | undefined
	openModal: (target: 'sender' | 'receiver') => void
	removeCard: (target: 'sender' | 'receiver', userCardId: string) => void
}

const TradeCardsPreview = ({
	target,
	cards,
	isSender,
	tradeStatus,
	openModal,
	removeCard,
}: Props) => {
	if (cards.length === 0) {
		return (
			<div className='text-muted-foreground w-full text-center my-auto flex flex-col items-center justify-center h-full'>
				<span className='text-lg mb-2'>
					{isSender
						? `Select up to 20 cards from ${target === 'sender' ? 'your' : 'their'} deck`
						: `${target === 'sender' ? "Sender's" : 'Your'} offered cards`}
				</span>
				{isSender && tradeStatus === 'PENDING' && (
					<Button
						variant='outline'
						onClick={() => openModal(target)}
						className='px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm hover:bg-secondary/80 transition-colors'
					>
						+ Add Cards
					</Button>
				)}
			</div>
		)
	}

	return (
		<div className='w-full flex flex-col h-full'>
			<div className='flex flex-wrap gap-2 overflow-y-auto content-start flex-1 p-2'>
				{cards.map(card => (
					<div
						key={card.userCardId}
						className='relative group flex items-center justify-center transition-transform hover:scale-105 border border-transparent'
						style={{ width: '160px', height: '230px' }}
					>
						{card.cardData && (
							<div className='transform scale-[0.5] pointer-events-none '>
								<PokemonCard pokemonData={card.cardData} />
							</div>
						)}
						{isSender && tradeStatus === 'PENDING' && (
							<button
								onClick={e => {
									e.stopPropagation()
									removeCard(target, card.userCardId)
								}}
								className='absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-primary/90 shadow-sm'
							>
								<X size={14} />
							</button>
						)}
					</div>
				))}
			</div>
			{isSender && tradeStatus === 'PENDING' && (
				<div className='mt-auto pt-2 border-t border-border flex justify-end'>
					<Button
						variant='ghost'
						onClick={() => openModal(target)}
						className='px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md text-xs font-medium hover:bg-secondary/40 transition-colors hover:underline'
					>
						Edit Selection ({cards.length}/20)
					</Button>
				</div>
			)}
		</div>
	)
}

export default TradeCardsPreview
