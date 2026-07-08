import Image from 'next/image'
import TradeCardsPreview, {
	TradeCard,
} from '@/components/Trade/TradeCards/TradeCardsPreview'

type TradeUserSectionProps = {
	user: {
		name: string
		username: string
		image?: string | null
	}
	target: 'sender' | 'receiver'
	cards: TradeCard[]
	isSender: boolean
	tradeStatus: string
	openModal: (target: 'sender' | 'receiver') => void
	removeCard: (target: 'sender' | 'receiver', userCardId: string) => void
}

export const TradeUserSection = ({
	user,
	target,
	cards,
	isSender,
	tradeStatus,
	openModal,
	removeCard,
}: TradeUserSectionProps) => {
	return (
		<div className='flex-1 border rounded-xl p-4 bg-card flex flex-col shadow-sm'>
			<div className='flex items-center gap-4 mb-4 border-b pb-4'>
				<Image
					src={user.image || '/profile/default_avatar.png'}
					alt={`${user.name} Avatar`}
					width={56}
					height={56}
					className='rounded-full border-2 border-primary/20'
				/>
				<div>
					<h2 className='font-bold text-xl'>{user.name}</h2>
					<p className='text-muted-foreground text-sm'>@{user.username}</p>
				</div>
			</div>

			<div className='flex-1 bg-black/5 dark:bg-black/20 rounded-lg p-2 flex flex-col overflow-hidden min-h-50'>
				<TradeCardsPreview
					target={target}
					cards={cards}
					isSender={isSender}
					tradeStatus={tradeStatus}
					openModal={openModal}
					removeCard={removeCard}
				/>
			</div>
		</div>
	)
}
