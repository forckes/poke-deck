import { useAdminUsers } from './hooks/useAdminUsers'
import { AdminUserItem } from './AdminUserItem'
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '@/components/ui/pagination'
import { Loader2, X, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

export const AdminUsersTab = () => {
	const { state, status, functions, autocompleteRef } = useAdminUsers()

	const getPageNumbers = () => {
		const pages = []
		const range = 1
		for (let i = 1; i <= state.totalPages; i++) {
			if (
				i === 1 ||
				i === state.totalPages ||
				(i >= state.page - range && i <= state.page + range)
			) {
				pages.push(i)
			} else if (pages[pages.length - 1] !== '...') {
				pages.push('...')
			}
		}
		return pages
	}

	return (
		<div className='flex flex-col gap-6 w-full'>
			<div className='flex justify-between items-start gap-4'>
				<div>
					<h2 className='text-2xl font-bold tracking-tight text-foreground/90'>
						Users Management
					</h2>
					<p className='text-sm text-muted-foreground mt-1'>
						Manage user accounts, roles, coins, and bans.
					</p>
				</div>
			</div>

			<div className='relative w-full' ref={autocompleteRef}>
				<form
					onSubmit={functions.handleSearch}
					className='flex gap-2 relative w-full'
				>
					<div className='relative flex-1'>
						<Input
							value={state.searchQuery}
							onChange={e => functions.setSearchQuery(e.target.value)}
							onFocus={() => functions.setShowAutocomplete(true)}
							placeholder='Search user by username...'
							className='w-full h-11 pr-10'
						/>
						{state.searchResults !== null && (
							<button
								type='button'
								onClick={functions.clearSearch}
								className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-foreground cursor-pointer'
							>
								<X size={18} />
							</button>
						)}
					</div>
					<Button type='submit' className='h-11 px-4 gap-1.5 shrink-0'>
						{status.isSearching ? (
							<Loader2 size={18} className='animate-spin' />
						) : (
							<Search size={18} />
						)}
						<span>Search</span>
					</Button>
				</form>

				{state.showAutocomplete && state.autocompleteResults.length > 0 && (
					<div className='absolute z-50 left-0 right-0 mt-1 bg-background border border-primary/20 rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto'>
						{state.autocompleteResults.map(user => (
							<button
								key={user.id}
								type='button'
								onClick={() => functions.handleSelectAutocomplete(user)}
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

			{status.isLoading ? (
				<div className='flex justify-center items-center h-64 w-full'>
					<Loader2 className='w-8 h-8 animate-spin text-primary' />
				</div>
			) : (
				<div className='flex flex-col gap-6 w-full'>
					{state.users.length === 0 ? (
						<div className='text-center py-12 text-muted-foreground w-full border border-dashed rounded-xl'>
							No users found.
						</div>
					) : (
						<ul className='flex flex-col gap-3 w-full'>
							{state.users.map(user => (
								<AdminUserItem
									key={user.id}
									user={user}
									refetch={functions.refetch}
								/>
							))}
						</ul>
					)}

					{state.totalPages > 1 && state.searchResults === null && (
						<Pagination className='mt-4'>
							<PaginationContent>
								<PaginationItem>
									<PaginationPrevious
										onClick={() =>
											functions.setPage(Math.max(1, state.page - 1))
										}
										disabled={state.page === 1}
									/>
								</PaginationItem>

								{getPageNumbers().map((pageNum, idx) => (
									<PaginationItem key={idx}>
										{pageNum === '...' ? (
											<PaginationEllipsis />
										) : (
											<PaginationLink
												isActive={state.page === pageNum}
												onClick={() => functions.setPage(Number(pageNum))}
											>
												{pageNum}
											</PaginationLink>
										)}
									</PaginationItem>
								))}

								<PaginationItem>
									<PaginationNext
										onClick={() =>
											functions.setPage(
												Math.min(state.totalPages, state.page + 1),
											)
										}
										disabled={state.page === state.totalPages}
									/>
								</PaginationItem>
							</PaginationContent>
						</Pagination>
					)}
				</div>
			)}
		</div>
	)
}
