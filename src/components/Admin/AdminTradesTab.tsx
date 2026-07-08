import { useAdminTrades } from './hooks/useAdminTrades'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '@/components/ui/pagination'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
	Loader2,
	X,
	Search,
	ArrowLeftRight,
	ArrowRight,
	Ban,
	SendHorizonal,
	Slash,
	ExternalLink,
	Info,
} from 'lucide-react'
import Link from 'next/link'
import { TradeStatus } from '@/generated/enums'

export const AdminTradesTab = () => {
	const { state, status, functions, userAutocompleteRef } = useAdminTrades()

	const getPageNumbers = () => {
		const pages = []
		const range = 1
		for (let i = 1; i <= state.totalPages; i++) {
			if (
				i === 1 ||
				i === state.totalPages ||
				(i >= state.allTradesPage - range && i <= state.allTradesPage + range)
			) {
				pages.push(i)
			} else if (pages[pages.length - 1] !== '...') {
				pages.push('...')
			}
		}
		return pages
	}

	const renderTradeItem = (trade: any) => {
		const formattedDate = new Intl.DateTimeFormat('uk-UA', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
		})
			.format(new Date(trade.updatedAt))
			.replace(/\./g, '-')

		const canCancel = trade.status === TradeStatus.PENDING || trade.status === TradeStatus.SENDED
		const isCancelling = state.cancellingTradeId === trade.id

		return (
			<li
				key={trade.id}
				className='border border-primary/20 bg-background/50 flex flex-col sm:flex-row justify-between items-center rounded-xl py-3 px-4 gap-4 shadow-sm'
			>
				<div className='flex flex-wrap gap-3 items-center justify-start w-full sm:w-auto'>
					<div className='flex items-center justify-start gap-3'>
						<span className='text-sm text-gray-400'>{formattedDate}</span>

						<div className='flex items-center gap-3'>
							<Avatar size='lg'>
								<AvatarImage src={trade.sender.image} alt='Profile image' />
							</Avatar>
							<div className='flex flex-col'>
								<p className='text-sm font-semibold leading-tight'>
									{trade.sender.name}
								</p>
								<p className='text-xs text-gray-500'>@{trade.sender.username}</p>
							</div>
						</div>
					</div>

					<div className='flex items-center justify-center px-1'>
						{trade.status === TradeStatus.SENDED && (
							<SendHorizonal className='text-primary' size={18} />
						)}
						{trade.status === TradeStatus.ACCEPTED && (
							<ArrowLeftRight className='text-green-500' size={18} />
						)}
						{trade.status === TradeStatus.CANCELLED && (
							<Ban className='text-gray-400' size={18} />
						)}
						{trade.status === TradeStatus.DECLINED && (
							<div className='relative inline-flex items-center justify-center'>
								<ArrowRight className='text-gray-500' size={18} />
								<Slash className='absolute text-red-500' size={20} strokeWidth={2} />
							</div>
						)}
						{trade.status === TradeStatus.PENDING && (
							<Loader2 className='text-amber-500 animate-spin' size={18} />
						)}
					</div>

					{trade.receiver && (
						<div className='flex items-center gap-3'>
							<Avatar size='lg'>
								<AvatarImage src={trade.receiver.image} alt='Profile image' />
							</Avatar>
							<div className='flex flex-col'>
								<p className='text-sm font-semibold leading-tight'>
									{trade.receiver.name}
								</p>
								<p className='text-xs text-gray-500'>@{trade.receiver.username}</p>
							</div>
						</div>
					)}
				</div>

				<div className='flex items-center gap-2 w-full sm:w-auto justify-end'>
					{canCancel && (
						<Button
							size='sm'
							variant='outline'
							className='text-destructive border-destructive/20 hover:bg-destructive/10'
							disabled={isCancelling}
							onClick={() => functions.handleCancelTrade(trade.id)}
						>
							{isCancelling ? (
								<Loader2 size={16} className='animate-spin' />
							) : (
								<Ban size={16} />
							)}
							<span className='ml-1.5'>Cancel</span>
						</Button>
					)}

					<Popover>
						<PopoverTrigger asChild>
							<Button size='sm' variant='outline' className='gap-1.5'>
								<Info size={16} />
								<span>Info</span>
							</Button>
						</PopoverTrigger>
						<PopoverContent className='w-80 p-4' align='end'>
							<div className='flex flex-col gap-2 text-xs'>
								<div className='flex justify-between border-b pb-1'>
									<span className='font-bold uppercase text-gray-500'>Trade ID</span>
									<span className='font-mono truncate max-w-[150px]'>{trade.id}</span>
								</div>
								<div className='flex justify-between border-b pb-1'>
									<span className='font-bold uppercase text-gray-500'>Status</span>
									<span className='font-semibold capitalize'>{trade.status}</span>
								</div>
								<div className='flex flex-col border-b pb-1 gap-1'>
									<span className='font-bold uppercase text-gray-500'>Sender</span>
									<span className='truncate'>{trade.sender.name} (@{trade.sender.username})</span>
									<span className='font-mono text-[10px] text-gray-400'>ID: {trade.senderId}</span>
								</div>
								{trade.receiver && (
									<div className='flex flex-col border-b pb-1 gap-1'>
										<span className='font-bold uppercase text-gray-500'>Receiver</span>
										<span className='truncate'>{trade.receiver.name} (@{trade.receiver.username})</span>
										<span className='font-mono text-[10px] text-gray-400'>ID: {trade.receiverId}</span>
									</div>
								)}
								<div className='flex justify-between border-b pb-1'>
									<span className='font-bold uppercase text-gray-500'>Created At</span>
									<span>{new Date(trade.createdAt).toLocaleString()}</span>
								</div>
								<div className='flex justify-between border-b pb-1'>
									<span className='font-bold uppercase text-gray-500'>Updated At</span>
									<span>{new Date(trade.updatedAt).toLocaleString()}</span>
								</div>
							</div>
						</PopoverContent>
					</Popover>

					<Button size='sm' variant='outline' className='gap-1.5' asChild>
						<Link href={`/trades/${trade.id}`} target='_blank'>
							<ExternalLink size={16} />
							<span>Open</span>
						</Link>
					</Button>
				</div>
			</li>
		)
	}

	return (
		<div className='flex flex-col gap-6 w-full'>
			<div>
				<h2 className='text-2xl font-bold tracking-tight text-foreground/90'>
					Trades Management
				</h2>
				<p className='text-sm text-muted-foreground mt-1'>
					Monitor, view details, or cancel user card trades.
				</p>
			</div>

			<div className='flex border-b border-border gap-2'>
				<button
					className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
						state.activeSubTab === 'all'
							? 'border-primary text-primary'
							: 'border-transparent text-muted-foreground hover:text-foreground'
					}`}
					onClick={() => functions.setActiveSubTab('all')}
				>
					All Trades
				</button>
				<button
					className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
						state.activeSubTab === 'search'
							? 'border-primary text-primary'
							: 'border-transparent text-muted-foreground hover:text-foreground'
					}`}
					onClick={() => functions.setActiveSubTab('search')}
				>
					User Trades Search
				</button>
			</div>

			{state.activeSubTab === 'search' && (
				<div className='relative w-full' ref={userAutocompleteRef}>
					<form
						onSubmit={functions.handleSearchUser}
						className='flex gap-2 relative w-full'
					>
						<div className='relative flex-1'>
							<Input
								value={state.userSearchQuery}
								onChange={e => functions.setUserSearchQuery(e.target.value)}
								onFocus={() => functions.setShowUserAutocomplete(true)}
								placeholder='Search user trades by username...'
								className='w-full h-11 pr-10'
							/>
							{state.selectedUser !== null && (
								<button
									type='button'
									onClick={functions.clearUserSearch}
									className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-foreground cursor-pointer'
								>
									<X size={18} />
								</button>
							)}
						</div>
						<Button type='submit' className='h-11 px-4 gap-1.5 shrink-0'>
							{status.isSearchingUser ? (
								<Loader2 size={18} className='animate-spin' />
							) : (
								<Search size={18} />
							)}
							<span>Search</span>
						</Button>
					</form>

					{state.showUserAutocomplete && state.userAutocompleteResults.length > 0 && (
						<div className='absolute z-50 left-0 right-0 mt-1 bg-background border border-primary/20 rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto'>
							{state.userAutocompleteResults.map(user => (
								<button
									key={user.id}
									type='button'
									onClick={() => functions.handleSelectUser(user)}
									className='flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-primary/5 transition-colors border-b border-gray-100 last:border-b-0 cursor-pointer'
								>
									<Avatar size='sm'>
										<AvatarImage src={user.image} alt={user.name} />
									</Avatar>
									<div className='flex flex-col overflow-hidden'>
										<span className='text-sm font-semibold truncate'>
											{user.name}
										</span>
										<span className='text-xs text-muted-foreground truncate'>
											@{user.username}
										</span>
									</div>
								</button>
							))}
						</div>
					)}
				</div>
			)}

			{status.isLoading ? (
				<div className='flex justify-center items-center h-64 w-full'>
					<Loader2 className='w-8 h-8 animate-spin text-primary' />
				</div>
			) : (
				<div className='flex flex-col gap-6 w-full'>
					{state.activeSubTab === 'all' ? (
						<>
							{state.trades.length === 0 ? (
								<div className='text-center py-12 text-muted-foreground w-full border border-dashed rounded-xl'>
									No trades found.
								</div>
							) : (
								<ul className='flex flex-col gap-3 w-full'>
									{state.trades.map(renderTradeItem)}
								</ul>
							)}

							{state.totalPages > 1 && (
								<Pagination className='mt-4'>
									<PaginationContent>
										<PaginationItem>
											<PaginationPrevious
												onClick={() =>
													functions.setAllTradesPage(
														Math.max(1, state.allTradesPage - 1),
													)
												}
												disabled={state.allTradesPage === 1}
											/>
										</PaginationItem>

										{getPageNumbers().map((pageNum, idx) => (
											<PaginationItem key={idx}>
												{pageNum === '...' ? (
													<PaginationEllipsis />
												) : (
													<PaginationLink
														isActive={state.allTradesPage === pageNum}
														onClick={() =>
															functions.setAllTradesPage(Number(pageNum))
														}
													>
														{pageNum}
													</PaginationLink>
												)}
											</PaginationItem>
										))}

										<PaginationItem>
											<PaginationNext
												onClick={() =>
													functions.setAllTradesPage(
														Math.min(
															state.totalPages,
															state.allTradesPage + 1,
														),
													)
												}
												disabled={state.allTradesPage === state.totalPages}
											/>
										</PaginationItem>
									</PaginationContent>
								</Pagination>
							)}
						</>
					) : (
						<>
							{state.selectedUser === null ? (
								<div className='text-center py-12 text-muted-foreground w-full border border-dashed rounded-xl'>
									Enter a username above to search for incoming/outgoing trades.
								</div>
							) : state.userTrades.length === 0 ? (
								<div className='text-center py-12 text-muted-foreground w-full border border-dashed rounded-xl'>
									No trades found for this user.
								</div>
							) : (
								<ul className='flex flex-col gap-3 w-full'>
									{state.userTrades.map(renderTradeItem)}
								</ul>
							)}
						</>
					)}
				</div>
			)}
		</div>
	)
}
