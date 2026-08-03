'use client'

import Image from 'next/image'
import { Clock, Gift, Loader2 } from 'lucide-react'

import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { useCoinDropdown } from './hooks/useCoinDropdown'

type Props = {
	userId: string
}

const CoinDropdown = ({ userId }: Props) => {
	const { state, status, functions } = useCoinDropdown(userId)

	return (
		<Popover>
			<PopoverTrigger asChild>
				<div className='flex items-center justify-center py-2 px-4 rounded-md gap-2 bg-gray-200/50 hover:bg-primary/15 cursor-pointer transition-colors select-none'>
					{status.isCoinsError && <p className='text-red-500 text-xs'>Error</p>}
					<p
						data-testid='coins'
						className='font-semibold text-lg text-neutral-900'
					>
						{state.coins}
					</p>
					<Image src='/profile/coin.png' alt='coins' width={24} height={24} />
					{state.rewardStatus?.canClaim && (
						<Gift size={22} className='animate-bounce' color='#4931EE' />
					)}
				</div>
			</PopoverTrigger>

			<PopoverContent
				side='bottom'
				align='start'
				className='w-60 p-4 bg-white/95 backdrop-blur-md border border-gray-200 rounded-xl shadow-xl flex flex-col items-center justify-center text-center gap-3 z-999'
			>
				{state.secondsRemaining > 0 ? (
					<>
						<div className='flex flex-col items-center gap-1 text-gray-500'>
							<Clock size={20} className='animate-pulse text-primary' />
							<p className='text-xs font-medium uppercase tracking-wider'>
								Next reward:
							</p>
							<p className='font-mono font-bold text-xl text-neutral-800 bg-primary/15 px-3 py-1 rounded-lg border border-gray-200/60 mt-1'>
								{functions.formatTime(state.secondsRemaining)}
							</p>
						</div>
					</>
				) : (
					<>
						<Button
							onClick={functions.handleClaimReward}
							disabled={status.isClaiming}
							className='w-full font-bold bg-primary hover:bg-primary/90 text-white shadow-md transition-all active:scale-98'
						>
							{status.isClaiming ? (
								<Loader2 className=' animate-spin' />
							) : (
								'Claim 200'
							)}
							<Image
								src='/profile/coin.png'
								alt='coins'
								width={22}
								height={22}
							/>
						</Button>
					</>
				)}
			</PopoverContent>
		</Popover>
	)
}

export default CoinDropdown
