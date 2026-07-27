'use client'

import { useSession, signOut } from '@/lib/auth-client'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '../ui/button'
import Link from 'next/link'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
	ChevronDown,
	LayoutDashboard,
	LogOutIcon,
	Settings,
	User,
	Users,
} from 'lucide-react'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import CoinDropdown from './CoinDropdown/CoinDropdown'
import { Skeleton } from '@/components/ui/skeleton'
import { useAllTrades } from '@/app/trades/_hooks/useAllTrades'
import NotificationPing from '../NotificationPing'
import { useQuery } from '@tanstack/react-query'
import { getPendingRequestsAction } from '@/lib/actions/friend.actions'

function Header() {
	const router = useRouter()
	const pathname = usePathname()
	const { data: session, isPending } = useSession()

	const {
		state: { newTrades },
	} = useAllTrades()

	const { data: pendingFriendRequests } = useQuery({
		queryKey: ['pending-requests'],
		queryFn: getPendingRequestsAction,
	})

	const handleLogout = async () => {
		await signOut({
			fetchOptions: {
				onSuccess: () => {
					router.push('/sign-in')
				},
			},
		})
	}

	const isAuthPage = pathname === '/sign-in' || pathname === '/sign-up'

	const isDarkHeader = isAuthPage || (!isPending && !session?.user)

	const headerBgClass = isDarkHeader ? 'bg-[#0A0A0A]' : 'bg-white/80'
	const skeletonColorClass = isDarkHeader ? 'bg-white/10' : 'bg-black/10'

	return (
		<header
			suppressHydrationWarning
			className={`flex w-full gap-4 border-b-black border-b px-4 py-2 sticky top-0 z-999 ${headerBgClass} backdrop-blur-xl transition-colors duration-200`}
		>
			{isPending ? (
				<div className='flex flex-col md:grid md:grid-cols-4 items-center gap-4 md:gap-0 w-full animate-pulse'>
					<div className='flex items-center justify-center md:justify-start w-full'>
						<Skeleton
							className={`h-16 w-16 rounded-xl ${skeletonColorClass}`}
						/>
					</div>

					<div className='flex gap-4 items-center justify-center flex-wrap col-span-2'>
						<Skeleton
							className={`h-12 w-24 rounded-lg ${skeletonColorClass}`}
						/>
						<Skeleton
							className={`h-12 w-24 rounded-lg ${skeletonColorClass}`}
						/>
						<Skeleton
							className={`h-12 w-20 rounded-lg ${skeletonColorClass}`}
						/>
						<Skeleton
							className={`h-12 w-20 rounded-lg ${skeletonColorClass}`}
						/>
					</div>

					<div className='flex gap-4 items-center justify-center md:justify-end w-full'>
						<Skeleton
							className={`h-9 w-20 rounded-full ${skeletonColorClass}`}
						/>
						<Skeleton className={`h-5 w-28 rounded-md ${skeletonColorClass}`} />
						<Skeleton
							className={`h-10 w-10 rounded-full ${skeletonColorClass}`}
						/>
					</div>
				</div>
			) : session?.user ? (
				<div className='flex flex-col md:grid md:grid-cols-4 items-center gap-4 md:gap-0 w-full'>
					<div className='flex items-center justify-center md:justify-start w-full'>
						<Link href='/'>
							<div className='flex items-center justify-center rounded-xl overflow-hidden'>
								<Image
									src='/poke-deck_logo.png'
									height={64}
									width={64}
									alt='Logo'
								/>
							</div>
						</Link>
					</div>

					<div className='flex gap-4 items-center justify-center flex-wrap col-span-2'>
						{[
							{ name: 'Collection', href: '/collection' },
							{ name: 'My Deck', href: '/deck' },
							{ name: 'Packs', href: '/packs' },
							{ name: 'Trades', href: '/trades' },
						].map(item => {
							const isActive =
								pathname === item.href || pathname?.startsWith(item.href + '/')
							return (
								<Button
									key={item.href}
									asChild
									variant={isActive ? 'default' : 'ghost'}
									className={
										isActive
											? 'h-12 p-3.5 rounded-1 font-bold relative'
											: 'relative'
									}
								>
									<Link href={item.href}>
										{item.name}
										{item.name === 'Trades' &&
											!isActive &&
											!!newTrades?.result?.totalCount &&
											newTrades?.result?.totalCount > 0 && <NotificationPing />}
									</Link>
								</Button>
							)
						})}
					</div>

					<div className='flex gap-4 items-center justify-center md:justify-end w-full'>
						{session.user.role === 'admin' && (
							<span className='shiny-purple font-extrabold text-xl'>Admin</span>
						)}

						<CoinDropdown userId={session?.user?.id} />

						<p className='font-semibold text-md'>Hi, {session.user.name}</p>

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant='ghost'
									className='rounded-full group flex items-center gap-1.5 pl-0 pr-2 h-auto py-0 hover:bg-primary/5 transition-all duration-300 '
								>
									<Avatar
										size='lg'
										className='transition-all duration-150 border-2 border-primary p-px group-hover:shadow-[0_0_20px_var(--color-primary)] group-hover:scale-105 relative'
									>
										<AvatarImage
											src={session.user.image ?? '/profile/default_avatar.png'}
											alt='Pfp'
										/>
										{!!pendingFriendRequests?.pendingFriends &&
											pendingFriendRequests?.totalCount > 0 && (
												<NotificationPing />
											)}
									</Avatar>
									<ChevronDown className='size-4 text-muted-foreground transition-all duration-300 group-hover:text-primary group-data-[state=open]:rotate-180' />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align='end'>
								<DropdownMenuGroup>
									<DropdownMenuLabel className='mt-px mb-2 text-sm'>
										@{session.user.username}
									</DropdownMenuLabel>
									<DropdownMenuItem asChild>
										<Link href={`/user/${session.user.username}`}>
											<User />
											Profile
										</Link>
									</DropdownMenuItem>
									<DropdownMenuItem asChild>
										<Link href={`/user/${session.user.username}/friends`}>
											<Users />
											Friends
											{!!pendingFriendRequests?.pendingFriends &&
												pendingFriendRequests?.totalCount > 0 && (
													<NotificationPing className='right-0' />
												)}
										</Link>
									</DropdownMenuItem>
									{session.user.role === 'admin' && (
										<DropdownMenuItem asChild>
											<Link href={`/admin`}>
												<LayoutDashboard />
												Dashboard
											</Link>
										</DropdownMenuItem>
									)}
									<DropdownMenuItem>
										<Settings />
										Settings
									</DropdownMenuItem>
								</DropdownMenuGroup>
								<DropdownMenuSeparator />
								<DropdownMenuItem onClick={handleLogout} variant='destructive'>
									<LogOutIcon />
									Logout
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			) : (
				<div className='flex w-full justify-end items-center gap-4'>
					<div className='flex items-center justify-center md:justify-start w-full'>
						<Link href='/'>
							<div className='flex items-center justify-center rounded-xl overflow-hidden'>
								<Image
									src='/poke-deck_logo.png'
									height={64}
									width={64}
									alt='Logo'
								/>
							</div>
						</Link>
					</div>
					<Button onClick={() => router.push('/sign-up')}>Sign Up</Button>

					<Button variant='outline' onClick={() => router.push('/sign-in')}>
						Sign In
					</Button>
				</div>
			)}
		</header>
	)
}

export default Header
