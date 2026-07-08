/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import {
	X,
	Clock,
	SendHorizonal,
	CheckCircle,
	Ban,
	ArrowRight,
	Slash,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTradeCards } from '@/components/Trade/TradeCards/hooks/useTradeCards'
import { TradeCardList } from '@/components/Trade/TradeCardList'
import { TradeUserSection } from '@/components/Trade/TradeUserSection'

const TradePage = () => {
	const { state, status, functions } = useTradeCards()

	if (status.isLoading || state.session.isPending) {
		return (
			<div className='p-8 text-center text-muted-foreground animate-pulse'>
				Loading trade details...
			</div>
		)
	}

	if (!state.trade) {
		return (
			<div className='p-8 text-center text-destructive'>
				Trade not found or you don&apos;t have permission.
			</div>
		)
	}

	return (
		<div className='max-w-6xl mx-auto p-4 flex flex-col gap-4 min-h-[calc(100vh-8rem)] relative pb-8'>
			<TradeUserSection
				user={state.trade.sender}
				target='sender'
				cards={state.senderSelectedCards}
				isSender={status.isSender}
				tradeStatus={state.trade.status}
				openModal={functions.openModal}
				removeCard={functions.removeCard}
			/>

			<TradeUserSection
				user={state.trade.receiver}
				target='receiver'
				cards={state.receiverSelectedCards}
				isSender={status.isSender}
				tradeStatus={state.trade.status}
				openModal={functions.openModal}
				removeCard={functions.removeCard}
			/>

			<div className='p-4 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 bg-muted/30 rounded-xl mt-4'>
				<div className='flex items-center gap-2 font-medium'>
					{state.trade.status === 'PENDING' && (
						<>
							<Clock className='text-yellow-500' size={20} />
							<span className='text-yellow-500'>Draft</span>
						</>
					)}
					{state.trade.status === 'SENDED' && (
						<>
							<SendHorizonal className='text-blue-500' size={20} />
							<span className='text-blue-500'>Waiting for Response</span>
						</>
					)}
					{state.trade.status === 'ACCEPTED' && (
						<>
							<CheckCircle className='text-green-500' size={20} />
							<span className='text-green-500'>Trade Accepted</span>
						</>
					)}
					{state.trade.status === 'DECLINED' && (
						<>
							<div className='relative inline-flex items-center justify-center'>
								<ArrowRight className='text-gray-500' />
								<Slash
									className='absolute text-red-500'
									size={22}
									strokeWidth={2}
								/>
							</div>
							<span className='text-gray-500'>Declined by user</span>
						</>
					)}
					{state.trade.status === 'CANCELLED' && (
						<>
							<Ban className='text-gray-500' size={20} />
							<span className='text-gray-500'>
								Trade Cancelled (A card in this offer was already traded)
							</span>
						</>
					)}
				</div>
				<div className='flex justify-end gap-3'>
					<Button variant='outline' onClick={functions.routeBack}>
						Back
					</Button>
					{status.isSender && state.trade.status === 'PENDING' && (
						<Button
							onClick={functions.handleSendTrade}
							disabled={status.isSending}
						>
							{status.isSending ? 'Sending...' : 'Send Trade'}
						</Button>
					)}
					{!status.isSender && state.trade.status === 'SENDED' && (
						<>
							<Button
								variant='destructive'
								onClick={functions.handleDeclineTrade}
								disabled={status.isDeclining || status.isAccepting}
							>
								{status.isDeclining ? 'Declining...' : 'Decline Trade'}
							</Button>
							<Button
								onClick={functions.handleAcceptTrade}
								disabled={status.isDeclining || status.isAccepting}
							>
								{status.isAccepting ? 'Accepting...' : 'Accept Trade'}
							</Button>
						</>
					)}
				</div>
			</div>

			{state.modalTarget && (
				<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4'>
					<div className='bg-card w-full max-w-5xl h-[85vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-border'>
						<div className='flex justify-between items-center p-4 border-b border-border bg-muted/30'>
							<h3 className='text-xl font-bold'>
								Select Cards for{' '}
								{state.modalTarget === 'sender' ? 'Your' : "Receiver's"} Side
							</h3>
							<div className='flex items-center gap-4'>
								<span className='text-sm font-medium text-muted-foreground'>
									{state.tempSelectedCards.length} / 20 Selected
								</span>
								<Button
									variant='outline'
									onClick={() => functions.setModalTarget(null)}
									size='xs'
								>
									<X size={24} />
								</Button>
							</div>
						</div>

						<div className='flex-1 overflow-hidden flex bg-black/5 dark:bg-black/20'>
							<TradeCardList
								targetUserId={
									state.modalTarget === 'sender'
										? state.trade.sender.id
										: state.trade.receiver.id
								}
								secondUserId={
									state.modalTarget === 'sender'
										? state.trade.receiver.id
										: state.trade.sender.id
								}
								tempSelectedCards={state.tempSelectedCards}
								toggleCardSelection={functions.toggleCardSelection}
							/>
						</div>

						<div className='p-4 border-t border-border flex justify-end gap-3 bg-muted/30'>
							<Button
								variant='destructive'
								onClick={() => functions.setModalTarget(null)}
							>
								Cancel
							</Button>
							<Button onClick={functions.saveModalSelection}>Save</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

export default TradePage
