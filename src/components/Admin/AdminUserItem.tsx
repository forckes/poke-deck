import Link from 'next/link'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import {
	Loader2,
	ExternalLink,
	Info,
	Ban,
	Shield,
	ShieldAlert,
	Unlock,
} from 'lucide-react'
import { useAdminUserItem, AdminUser } from './hooks/useAdminUserItem'
import Image from 'next/image'

type Props = {
	user: AdminUser
	refetch: () => void
}

export const AdminUserItem = ({ user, refetch }: Props) => {
	const { state, status, functions } = useAdminUserItem(user, refetch)

	return (
		<li className='border border-primary/20 bg-background/50 flex flex-col sm:flex-row justify-between items-center rounded-xl py-3 px-4 gap-4 shadow-sm w-full'>
			<div className='flex items-center gap-3 w-full sm:w-auto'>
				{status.isCurrentUser && <span className='font-extrabold'>You</span>}
				<Avatar size='lg'>
					<AvatarImage src={user.image} alt={user.name} />
				</Avatar>
				<div className='flex flex-col min-w-0'>
					<div className='text-md font-semibold truncate flex items-center gap-1.5'>
						<span>{user.name}</span>
						{user.role === 'admin' && (
							<span className='bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-bold capitalize'>
								Admin
							</span>
						)}
						{user.banned && (
							<span className='bg-destructive/10 text-destructive px-2 py-0.5 rounded-full text-xs font-bold capitalize'>
								Banned
							</span>
						)}
					</div>
					<p className='text-sm text-gray-500 truncate'>@{user.username}</p>
				</div>
			</div>

			<div className='flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end'>
				{!status.isCurrentUser && (
					<Button
						size='sm'
						variant='outline'
						className='gap-1.5'
						disabled={state.isUpdatingRole}
						onClick={functions.handleToggleRole}
					>
						{state.isUpdatingRole ? (
							<Loader2 size={16} className='animate-spin' />
						) : user.role === 'admin' ? (
							<ShieldAlert size={16} />
						) : (
							<Shield size={16} />
						)}
						<span>{user.role === 'admin' ? 'Demote' : 'Promote'}</span>
					</Button>
				)}

				<Dialog
					open={state.isCoinsOpen}
					onOpenChange={functions.setIsCoinsOpen}
				>
					<DialogTrigger asChild>
						<Button size='sm' variant='outline' className='gap-1.5'>
							{state.isAddingCoins ? (
								<Loader2 size={16} className='animate-spin' />
							) : (
								<Image
									src='/profile/coin.png'
									alt='coins'
									width={16}
									height={16}
								/>
							)}
							<span>Add Coins</span>
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Add Coins to User</DialogTitle>
						</DialogHeader>
						<div className='flex flex-col items-center gap-4 py-4'>
							<Avatar size='lg'>
								<AvatarImage src={user.image} alt={user.name} />
							</Avatar>
							<div className='text-center'>
								<p className='font-semibold'>{user.name}</p>
								<p className='text-sm text-gray-500'>@{user.username}</p>
								<p className='text-xs text-gray-400 font-mono mt-1'>
									ID: {user.id}
								</p>
							</div>
							<div className='w-full flex flex-col gap-1.5'>
								<label className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
									Amount of coins
								</label>
								<input
									type='number'
									className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
									value={state.coinAmount}
									onChange={e =>
										functions.setCoinAmount(
											e.target.value === '' ? '' : Number(e.target.value),
										)
									}
									placeholder='Enter amount to add'
								/>
							</div>
							<Button
								className='w-full'
								onClick={functions.handleAddCoins}
								disabled={state.isAddingCoins}
							>
								{state.isAddingCoins && (
									<Loader2 size={16} className='animate-spin mr-2' />
								)}
								Add Coins
							</Button>
						</div>
					</DialogContent>
				</Dialog>

				{!status.isCurrentUser && (
					<Dialog open={state.isBanOpen} onOpenChange={functions.setIsBanOpen}>
						<DialogTrigger asChild>
							{user.banned ? (
								<Button
									size='sm'
									variant='outline'
									className='gap-1.5 text-green-600 hover:text-green-700'
									disabled={state.isUnbanning}
									onClick={functions.handleUnban}
								>
									{state.isUnbanning ? (
										<Loader2 size={16} className='animate-spin' />
									) : (
										<Unlock size={16} />
									)}
									<span>Unban</span>
								</Button>
							) : (
								<Button
									size='sm'
									variant='outline'
									className='gap-1.5 text-destructive hover:text-destructive'
								>
									{state.isBanning ? (
										<Loader2 size={16} className='animate-spin' />
									) : (
										<Ban size={16} />
									)}
									<span>Ban</span>
								</Button>
							)}
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Ban User</DialogTitle>
							</DialogHeader>
							<div className='flex flex-col items-center gap-4 py-4'>
								<Avatar size='lg'>
									<AvatarImage src={user.image} alt={user.name} />
								</Avatar>
								<div className='text-center'>
									<p className='font-semibold'>{user.name}</p>
									<p className='text-sm text-gray-500'>@{user.username}</p>
									<p className='text-xs text-gray-400 font-mono mt-1'>
										ID: {user.id}
									</p>
								</div>
								<div className='w-full flex flex-col gap-1.5'>
									<label className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
										Ban Reason
									</label>
									<textarea
										className='flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none'
										value={state.banReason}
										onChange={e => functions.setBanReason(e.target.value)}
										placeholder='Reason for ban'
									/>
								</div>
								<div className='w-full flex flex-col gap-1.5'>
									<label className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
										Ban Duration (days)
									</label>
									<input
										type='number'
										className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
										value={state.banDuration}
										onChange={e =>
											functions.setBanDuration(
												e.target.value === '' ? '' : Number(e.target.value),
											)
										}
										placeholder='Leave blank for permanent'
									/>
								</div>
								<div className='w-full flex flex-col gap-1.5'>
									<label className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
										Confirm by typing: ban-{user.username}
									</label>
									<input
										type='text'
										className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
										value={state.banConfirm}
										onChange={e => functions.setBanConfirm(e.target.value)}
										placeholder={`ban-${user.username}`}
									/>
								</div>
								<Button
									className='w-full'
									variant='destructive'
									onClick={functions.handleBan}
									disabled={
										state.isBanning ||
										state.banConfirm !== `ban-${user.username}`
									}
								>
									{state.isBanning && (
										<Loader2 size={16} className='animate-spin mr-2' />
									)}
									Ban User
								</Button>
							</div>
						</DialogContent>
					</Dialog>
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
								<span className='font-bold uppercase text-gray-500'>ID</span>
								<span className='font-mono truncate'>{user.id}</span>
							</div>
							<div className='flex justify-between border-b pb-1'>
								<span className='font-bold uppercase text-gray-500'>Name</span>
								<span className='truncate max-w-[150px]'>{user.name}</span>
							</div>
							<div className='flex justify-between border-b pb-1'>
								<span className='font-bold uppercase text-gray-500'>
									Username
								</span>
								<span className='truncate max-w-[150px]'>
									{user.username || 'N/A'}
								</span>
							</div>
							<div className='flex justify-between border-b pb-1'>
								<span className='font-bold uppercase text-gray-500'>
									Displayed
								</span>
								<span className='truncate max-w-[150px]'>
									{user.displayUsername || 'N/A'}
								</span>
							</div>
							<div className='flex justify-between border-b pb-1'>
								<span className='font-bold uppercase text-gray-500'>Email</span>
								<span className='truncate max-w-[150px]'>{user.email}</span>
							</div>
							<div className='flex justify-between border-b pb-1'>
								<span className='font-bold uppercase text-gray-500'>
									Verified
								</span>
								<span>{user.emailVerified ? 'Yes' : 'No'}</span>
							</div>
							<div className='flex justify-between border-b pb-1'>
								<span className='font-bold uppercase text-gray-500'>Coins</span>
								<span>{user.coins}</span>
							</div>
							<div className='flex justify-between border-b pb-1'>
								<span className='font-bold uppercase text-gray-500'>Role</span>
								<span className='capitalize'>{user.role}</span>
							</div>
							<div className='flex justify-between border-b pb-1'>
								<span className='font-bold uppercase text-gray-500'>
									Created
								</span>
								<span>{new Date(user.createdAt).toLocaleDateString()}</span>
							</div>
							<div className='flex justify-between border-b pb-1'>
								<span className='font-bold uppercase text-gray-500'>
									Updated
								</span>
								<span>{new Date(user.updatedAt).toLocaleDateString()}</span>
							</div>
							<div className='flex justify-between border-b pb-1'>
								<span className='font-bold uppercase text-gray-500'>
									Last Reward
								</span>
								<span>
									{user.lastHourlyRewardAt
										? new Date(user.lastHourlyRewardAt).toLocaleString()
										: 'Never'}
								</span>
							</div>
							<div className='flex justify-between border-b pb-1'>
								<span className='font-bold uppercase text-gray-500'>
									Banned
								</span>
								<span>{user.banned ? 'Yes' : 'No'}</span>
							</div>
							{user.banned && (
								<>
									<div className='flex flex-col gap-1 border-b pb-1'>
										<span className='font-bold uppercase text-gray-500'>
											Ban Reason
										</span>
										<span className='text-destructive bg-destructive/5 p-1 rounded-sm border border-destructive/10'>
											{user.banReason || 'No reason specified'}
										</span>
									</div>
									<div className='flex justify-between border-b pb-1'>
										<span className='font-bold uppercase text-gray-500'>
											Ban Expires
										</span>
										<span>
											{user.banExpires
												? new Date(user.banExpires).toLocaleString()
												: 'Permanent'}
										</span>
									</div>
								</>
							)}
						</div>
					</PopoverContent>
				</Popover>

				<Button size='sm' variant='outline' className='gap-1.5' asChild>
					<Link href={`/user/${user.username}`} target='_blank'>
						<ExternalLink size={16} />
						<span>Profile</span>
					</Link>
				</Button>
			</div>
		</li>
	)
}
