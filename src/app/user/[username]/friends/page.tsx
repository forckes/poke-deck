'use client'

import TradeButton from '@/components/Trade/TradeButton'
import NotificationPing from '@/components/NotificationPing'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Sword, UserMinus, UserPlus, UserX } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import useFriendList from './_hooks/useFriendList'
import EmptyStateMessage from '@/components/EmptyStateMessage'
import { Input } from '@/components/ui/input'

const FriendsPage = () => {
	const params = useParams()
	const { state, status, functions, autocompleteRef } = useFriendList(params)

	if (status.isFriendsLoading || status.isPendingLoading) {
		return (
			<div className='flex items-center justify-center min-h-[calc(100vh-60px)]'>
				<Loader2 className='animate-spin size-8 text-primary' />
			</div>
		)
	}

	if (status.isFriendsError || status.isPendingError) {
		return (
			<div className='flex items-center justify-center min-h-[calc(100vh-60px)] text-red-500 font-bold'>
				Error loading friends list.
			</div>
		)
	}

	return (
		<div className='flex flex-col items-center w-full max-w-4xl h-screen mx-auto mt-20 px-4'>
			<div className='flex flex-col gap-8 w-full bg-primary/10 p-8 rounded-2xl border shadow-sm min-h-125'>
				<h1 className='text-4xl md:text-5xl font-extrabold tracking-tight text-primary/90 text-center drop-shadow-sm'>
					{status.isCurrentUser ? (
						<>Your Friends</>
					) : (
						<>
							<span className='mb-2 text-[28px] block text-primary/70'>
								@{state.username}
							</span>
							Friends
						</>
					)}
				</h1>

				<div className='flex gap-8 w-full items-center justify-center'>
					<Tabs defaultValue='friends' className='flex flex-col w-3/4'>
						<TabsList className='px-0 mx-auto w-fit'>
							{status.isCurrentUser && (
								<TabsTrigger className='text-md p-4' value='add-friend'>
									Add Friends
								</TabsTrigger>
							)}
							<TabsTrigger className='text-md p-4' value='friends'>
								{status.isCurrentUser ? <>Your</> : <>@{state.username}</>}{' '}
								Friends ({state.friends?.totalCount})
							</TabsTrigger>
							{status.isCurrentUser && (
								<TabsTrigger
									className='relative text-md p-4'
									value='pending-requests'
								>
									Pending Requests ({state.pendingRequests?.totalCount})
									{state.pendingRequests?.pendingFriends &&
										state.pendingRequests.pendingFriends.length > 0 && (
											<NotificationPing />
										)}
								</TabsTrigger>
							)}
						</TabsList>

						<TabsContent value='add-friend'>
							{status.isCurrentUser && (
								<div
									ref={autocompleteRef}
									className='flex mt-4 flex-col gap-4 bg-background/50 backdrop-blur-md p-6 rounded-2xl border border-primary/20 shadow-sm w-full'
								>
									<h2 className='text-xl font-bold text-foreground'>
										Find Friends
									</h2>
									<form
										onSubmit={functions.handleSearch}
										className='flex gap-2 relative w-full'
									>
										<div className='relative flex-1'>
											<Input
												value={state.searchQuery}
												onChange={e => functions.setSearchQuery(e.target.value)}
												onFocus={() => functions.setShowAutocomplete(true)}
												placeholder='Enter friend nickname...'
												className='w-full h-11'
											/>
											{status.showAutocomplete &&
												state.autocompleteResults.length > 0 && (
													<div className='absolute z-50 left-0 right-0 mt-1 bg-background border border-primary/20 rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto'>
														{state.autocompleteResults.map(user => (
															<button
																key={user.id}
																type='button'
																onClick={() =>
																	functions.handleSelectAutocomplete(user)
																}
																className='flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-primary/5 transition-colors border-b border-gray-100 last:border-b-0 cursor-pointer'
															>
																<Avatar size='sm'>
																	<AvatarImage
																		src={user.image}
																		alt={user.name}
																	/>
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
										<Button
											type='submit'
											disabled={status.isSearching || status.actionPending}
										>
											{status.isSearching ? (
												<Loader2 className='size-4 animate-spin' />
											) : (
												'Search'
											)}
										</Button>
									</form>

									<div className='flex flex-col gap-3 mt-2 w-full'>
										{status.isSearching ? (
											<div className='flex items-center justify-center py-6'>
												<Loader2 className='size-6 animate-spin text-primary' />
											</div>
										) : state.searchResults.length > 0 ? (
											<ul className='flex flex-col gap-3'>
												{state.searchResults.map(user => (
													<li
														key={user.id}
														className='border border-primary/10 bg-background/60 flex justify-between items-center rounded-xl py-3 px-4 gap-4 shadow-sm'
													>
														<Link
															href={`/user/${user.username}`}
															className='flex-1 min-w-0'
														>
															<div className='flex items-center gap-3'>
																<Avatar size='lg'>
																	<AvatarImage
																		src={user.image}
																		alt={user.name}
																	/>
																</Avatar>
																<div className='flex flex-col min-w-0'>
																	<p className='text-sm font-semibold truncate'>
																		{user.name}
																	</p>
																	<p className='text-xs text-gray-500 truncate'>
																		@{user.username}
																	</p>
																</div>
															</div>
														</Link>
														<div className='flex gap-1.5 shrink-0'>
															{user.relationStatus === 'none' && (
																<Button
																	size='xs'
																	onClick={() => functions.onAddFriend(user.id)}
																	disabled={status.actionPending}
																>
																	{status.actionPending ? (
																		<Loader2 className='size-3.5 animate-spin' />
																	) : (
																		<>
																			<UserPlus className='size-3.5 mr-1' /> Add
																		</>
																	)}
																</Button>
															)}
															{user.relationStatus === 'sent' && (
																<Button size='xs' variant='outline' disabled>
																	Requested
																</Button>
															)}
															{user.relationStatus === 'received' && (
																<div className='flex gap-1'>
																	<Button
																		size='xs'
																		onClick={() =>
																			functions.handleAccept(user.friendshipId!)
																		}
																		disabled={status.actionPending}
																	>
																		Accept
																	</Button>
																	<Button
																		size='xs'
																		variant='destructive'
																		onClick={() =>
																			functions.handleReject(user.friendshipId!)
																		}
																		disabled={status.actionPending}
																	>
																		Reject
																	</Button>
																</div>
															)}
															{user.relationStatus === 'friend' && (
																<Button
																	size='xs'
																	variant='destructive'
																	onClick={() =>
																		functions.handleRemove(user.friendshipId!)
																	}
																	disabled={status.actionPending}
																>
																	{status.actionPending ? (
																		<Loader2 className='size-3.5 animate-spin' />
																	) : (
																		<>
																			<UserMinus className='size-3.5 mr-1' />{' '}
																			Remove
																		</>
																	)}
																</Button>
															)}
														</div>
													</li>
												))}
											</ul>
										) : state.searchQuery.trim() !== '' &&
										  !status.showAutocomplete ? (
											<p className='text-sm text-center text-muted-foreground py-4'>
												No users found for &quot;{state.searchQuery}&quot;
											</p>
										) : null}
									</div>
								</div>
							)}
						</TabsContent>

						<TabsContent value='friends' className='w-full'>
							<div className='flex flex-col mt-4 w-full'>
								<ul className='flex flex-col gap-3'>
									{state.friends?.friends?.map(request => (
										<li
											className='border border-primary/20 bg-background/50 flex justify-between items-center rounded-xl py-3 px-4 gap-4 shadow-sm hover:shadow-md transition-shadow'
											key={request.id}
										>
											<Link href={`/user/${request.username}`}>
												<div className='flex items-center justify-start gap-3'>
													<Avatar size='lg'>
														<AvatarImage
															src={request.image}
															alt='Profile image'
														/>
													</Avatar>
													<div className='flex flex-col'>
														<p className='text-lg font-semibold'>
															{request.name}
														</p>
														<p className='text-sm text-gray-500'>
															@{request.username}
														</p>
													</div>
												</div>
											</Link>

											<div className='flex gap-2'>
												<Button
													variant='outline'
													size='xs'
													disabled={status.isPending}
													title='Fight'
												>
													<Sword />
												</Button>

												<TradeButton
													isFriendPending={status.isPending}
													receiverId={request.id}
													variant='small'
												/>

												<Button
													variant='destructive'
													size='xs'
													onClick={() =>
														functions.handleRemove(request.friendshipId)
													}
													disabled={status.isPending || status.actionPending}
												>
													{status.isPending || status.actionPending ? (
														<>
															<Loader2 className='mr-2 h-4 w-4 animate-spin' />{' '}
															Removing...
														</>
													) : (
														<>
															<UserMinus className='mr-1 h-4 w-4' /> Remove
														</>
													)}
												</Button>
											</div>
										</li>
									))}
									{state.friends?.totalCount === 0 && (
										<div className='text-center text-muted-foreground mt-8'>
											{status.isCurrentUser ? (
												<>You don&apos;t have any friends yet.</>
											) : (
												<>
													@{state.username} doesn&apos;t have any friends yet.
												</>
											)}
										</div>
									)}
								</ul>
							</div>
						</TabsContent>

						<TabsContent value='pending-requests' className='w-full'>
							<div className='flex flex-col mt-4 w-full'>
								<ul className='flex flex-col gap-3'>
									{state.pendingRequests?.pendingFriends?.map(request => (
										<li
											className='border border-primary/20 bg-background/50 flex flex-col sm:flex-row justify-between items-center rounded-xl py-3 px-4 gap-4 shadow-sm hover:shadow-md transition-shadow'
											key={request.id}
										>
											<Link href={`/user/${request.username}`}>
												<div className='flex items-center justify-start gap-3'>
													<Avatar size='lg'>
														<AvatarImage
															src={request.image}
															alt='Profile image'
														/>
													</Avatar>
													<div className='flex flex-col'>
														<p className='text-lg font-semibold'>
															{request.name}
														</p>
														<p className='text-sm text-gray-500'>
															@{request.username}
														</p>
													</div>
												</div>
											</Link>

											<div className='flex items-center gap-2 w-full sm:w-auto justify-end'>
												<Button
													size='xs'
													onClick={() =>
														functions.handleAccept(request.friendshipId)
													}
													disabled={status.isPending || status.actionPending}
													className='flex-1 sm:flex-none'
												>
													{status.isPending || status.actionPending ? (
														<>
															<Loader2 className='mr-2 h-4 w-4 animate-spin' />{' '}
															Accept...
														</>
													) : (
														<>
															<UserPlus className='mr-1 h-4 w-4' /> Accept
														</>
													)}
												</Button>

												<Button
													size='xs'
													variant='destructive'
													onClick={() =>
														functions.handleRemove(request.friendshipId)
													}
													disabled={status.isPending || status.actionPending}
													className='flex-1 sm:flex-none'
												>
													{status.isPending || status.actionPending ? (
														<>
															<Loader2 className='mr-2 h-4 w-4 animate-spin' />{' '}
															Reject...
														</>
													) : (
														<>
															<UserX className='mr-1 h-4 w-4' /> Reject
														</>
													)}
												</Button>
											</div>
										</li>
									))}
									{state.pendingRequests?.totalCount === 0 && (
										<EmptyStateMessage message='No pending friend requests.' />
									)}
								</ul>
							</div>
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</div>
	)
}

export default FriendsPage
