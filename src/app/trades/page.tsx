'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAllTrades } from './_hooks/useAllTrades'
import { TradeItem } from '@/components/Trade/TradeItem'
import EmptyStateMessage from '@/components/EmptyStateMessage'
import NotificationPing from '@/components/NotificationPing'

const TradesPage = () => {
	const { state, status } = useAllTrades()

	if (status.isSentLoading || status.isReceivedLoading || status.isNewLoading) {
		return <div>Loading...</div>
	}

	if (status.isSentError || status.isReceivedError || status.isNewError) {
		return <div>Error...</div>
	}

	return (
		<div className='flex flex-col items-center h-screen w-full max-w-5xl mx-auto mt-20 px-4'>
			<div className='flex flex-col items-center w-full bg-primary/10 p-1 py-8 sm:p-8 rounded-2xl border shadow-sm min-h-125'>
				<h1 className='text-4xl md:text-5xl font-extrabold tracking-tight text-primary/90 text-center drop-shadow-sm'>
					Your trades
				</h1>

				<Tabs
					defaultValue='new-trades'
					className='flex flex-col w-full md:w-2/3 gap-21 sm:gap-0'
				>
					<TabsList className='px-0 mx-auto w-fit flex-wrap h-16! sm:h-10! bg-primary/0 sm:bg-muted sm:mb-0'>
						<TabsTrigger
							defaultChecked
							className='text-md p-4'
							value='new-trades'
						>
							New Trades ({state.newTrades?.result?.totalCount || 0})
							{(state.newTrades?.result?.totalCount || 0) > 0 && (
								<NotificationPing />
							)}
						</TabsTrigger>
						<TabsTrigger className='text-md p-4' value='received-trades'>
							Received Trades ({state.receivedTrades?.result?.totalCount || 0})
						</TabsTrigger>
						<TabsTrigger className='relative text-md p-4' value='sent-trades'>
							Sent Trades ({state.sentTrades?.result?.totalCount || 0})
						</TabsTrigger>
					</TabsList>

					<TabsContent value='new-trades' className='w-full'>
						<div className='flex flex-col mt-4 w-full'>
							<ul className='flex flex-col gap-3 max-h-100 overflow-y-auto pr-2'>
								{state.newTrades?.result?.trades?.map(trade => (
									<TradeItem key={trade.id} trade={trade} />
								))}
								{state.newTrades?.result?.totalCount === 0 && (
									<EmptyStateMessage message='No New Trades Received.' />
								)}
							</ul>
						</div>
					</TabsContent>

					<TabsContent value='received-trades' className='w-full'>
						<div className='flex flex-col mt-4 w-full'>
							<ul className='flex flex-col gap-3 max-h-100 overflow-y-auto pr-2'>
								{state.receivedTrades?.result?.trades?.map(trade => (
									<TradeItem key={trade.id} trade={trade} />
								))}
								{state.receivedTrades?.result?.totalCount === 0 && (
									<EmptyStateMessage message='No Trades Received.' />
								)}
							</ul>
						</div>
					</TabsContent>

					<TabsContent value='sent-trades' className='w-full'>
						<div className='flex flex-col mt-4 w-full'>
							<ul className='flex flex-col gap-3 max-h-100 overflow-y-auto pr-2'>
								{state.sentTrades?.result?.trades?.map(trade => (
									<TradeItem key={trade.id} trade={trade} />
								))}

								{state.sentTrades?.result?.totalCount === 0 && (
									<EmptyStateMessage message='No Trades Sent.' />
								)}
							</ul>
						</div>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	)
}

export default TradesPage
