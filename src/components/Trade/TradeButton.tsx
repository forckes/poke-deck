/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { ArrowLeftRight, Loader2 } from 'lucide-react'
import { useTransition } from 'react'
import {
	createBlankTradeAction,
	getPendingTradeAction,
} from '@/lib/actions/trade.actions'
import { useRouter } from 'next/navigation'
import { Button } from '../ui/button'
import { toast } from 'sonner'

type TradeButtonProps = {
	isFriendPending: boolean
	receiverId: string
	variant: 'small' | 'big'
}

const TradeButton = ({
	isFriendPending,
	receiverId,
	variant,
}: TradeButtonProps) => {
	const [isPending, startTransition] = useTransition()
	const router = useRouter()

	const handleSendTrade = () => {
		startTransition(async () => {
			try {
				const existingTrade = await getPendingTradeAction(receiverId)

				const existingId = existingTrade?.result?.id

				if (existingId) {
					router.push(`/trades/${existingId}`)
					return
				}

				const result = await createBlankTradeAction(receiverId)

				if (result.success && result.result?.id) {
					toast.success('Creating trade draft...')
					router.push(`/trades/${result.result.id}`)

					// await queryClient.invalidateQueries({ queryKey: ['trades'] });
				} else {
					toast.error(result.error || 'Failed to create trade')
				}
			} catch (error) {
				toast.error('Something went wrong. Please try again.')
			}
		})
	}

	return (
		<Button
			onClick={() => handleSendTrade()}
			variant='outline'
			size={variant === 'small' ? 'xs' : 'default'}
			disabled={isFriendPending || isPending}
			title='Trade'
		>
			{isPending && <Loader2 className='animate-spin' />}

			<ArrowLeftRight />
			{variant === 'big' && 'Send Trade'}
		</Button>
	)
}

export default TradeButton
