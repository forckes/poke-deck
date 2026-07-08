/* eslint-disable @typescript-eslint/no-explicit-any */
import Image from 'next/image'
import AddFriendButton from '@/components/Profile/AddFriendButton'
import { Rarity } from '@/generated/enums'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sword } from 'lucide-react'
import EditProfileDialog from '@/components/Profile/EditProfileDialog'
import TradeButton from '@/components/Trade/TradeButton'
import PokemonCardsContent from '@/components/PokemonCardsContent/PokemonCardsContent'
import { getUserProfileData } from './_hooks/getUserProfileData'
import StatCard from '@/components/Profile/StatCard'

export default async function ProfilePage(props: {
	params: Promise<{ username: string }>
}) {
	const { state } = await getUserProfileData(props)

	return (
		<div className='flex flex-col items-center w-full max-w-5xl mx-auto mt-10 px-4 mb-20'>
			<div className='w-full rounded-[2.5rem] overflow-hidden shadow-sm bg-card border border-border relative'>
				<div className="h-44 md:h-52 w-full bg-[url('/profile/profile_background.jpg')] bg-repeat relative overflow-hidden">
					<div className='absolute inset-0 bg-black/20'></div>

					<div className='absolute right-10 top-1/2 -translate-y-1/2 opacity-90 pointer-events-none'>
						<div className='w-24 h-24 rounded-full border-[6px] border-white relative flex items-center justify-center'>
							<div className='w-full h-1.5 bg-white absolute top-1/2 -translate-y-1/2'></div>
							<div className='w-8 h-8 rounded-full border-[6px] border-white bg-transparent z-10'></div>
						</div>
					</div>
				</div>

				<div className='px-6 md:px-10 pb-10 -mt-16 md:-mt-20 relative z-10'>
					<div className='flex flex-col md:flex-row md:items-end justify-between gap-6'>
						<div className='flex flex-col md:flex-row items-center md:items-end gap-6'>
							<div className='relative group'>
								<div className='absolute -inset-1 bg-linear-to-tr from-primary to-accent rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000'></div>
								<Image
									src={state.targetUser.image || '/profile/default_avatar.png'}
									alt={state.targetUser.name}
									width={160}
									height={160}
									className='relative rounded-full border-8 border-card object-cover shadow-2xl w-32 h-32 md:w-40 md:h-40'
								/>
								<div className='absolute bottom-4 right-4 w-6 h-6 bg-green-500 border-4 border-card rounded-full shadow-lg'></div>
							</div>

							<div className='mt-4 text-center md:text-left'>
								<h1 className='text-3xl md:text-4xl font-black text-foreground tracking-tight'>
									{state.targetUser.name}
								</h1>
								<p className='text-lg md:text-xl text-muted-foreground font-medium'>
									@{state.targetUser.username}
								</p>
							</div>
						</div>

						<div className='flex items-center gap-3 mb-2 self-center md:self-end'>
							{state.isCurrentUser ? (
								<EditProfileDialog targetUser={state.targetUser} />
							) : (
								state.currentUserId && (
									<>
										<TradeButton
											isFriendPending={false}
											receiverId={state.targetUser.id}
											variant='big'
										/>

										<Button variant='outline'>
											<Sword />
											Fight
										</Button>

										<AddFriendButton
											targetUserId={state.targetUser.id}
											initialStatus={state.friendshipStatus as any}
											friendshipId={state.friendshipId}
										/>
									</>
								)
							)}
						</div>
					</div>

					<div className='grid grid-cols-2 md:grid-cols-5 gap-4 mt-12'>
						<StatCard label='CARDS' value={state.stats.totalCards} />
						<StatCard
							label='COMMON'
							value={state.stats.cardsByRarity[Rarity.COMMON]}
							accentColor='border-gray-500'
						/>
						<StatCard
							label='EPIC'
							value={state.stats.cardsByRarity[Rarity.EPIC]}
							accentColor='border-purple-500'
							textColor='text-purple-500'
						/>
						<StatCard
							label='LEGENDARY'
							value={state.stats.cardsByRarity[Rarity.LEGENDARY]}
							accentColor='border-yellow-500'
							textColor='text-yellow-500'
						/>
						<Link
							href={`/user/${state.targetUser.username}/friends`}
							className='block group'
						>
							<StatCard
								label='FRIENDS'
								value={state.stats.friendsCount}
								className='group-hover:bg-accent/50 transition-colors underline'
							/>
						</Link>
					</div>
				</div>
			</div>

			<div className='w-full mt-16'>
				<h2 className='text-3xl md:text-4xl font-black text-foreground/90 shiny-purple inline-block'>
					{state.isCurrentUser ? 'YOUR' : ''} POKÉMON COLLECTION
				</h2>
			</div>

			<PokemonCardsContent scope='user' targetUserId={state.targetUser.id} />
		</div>
	)
}
