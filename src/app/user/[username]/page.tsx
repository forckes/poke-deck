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
import { AvatarUploader } from '@/components/Profile/AvatarUploader'
import { ProfileBanner } from '@/components/Profile/ProfileBanner'

export default async function ProfilePage(props: {
	params: Promise<{ username: string }>
}) {
	const { state } = await getUserProfileData(props)

	return (
		<div className='flex flex-col items-center w-full max-w-5xl mx-auto mt-10 px-4 mb-20'>
			<div className='w-full rounded-[2.5rem] overflow-hidden shadow-sm bg-card border border-border relative'>
				<ProfileBanner
					bannerColor={state.targetUser.bannerColor}
					isCurrentUser={state.isCurrentUser}
				/>

				<div className='px-6 md:px-10 pb-10 -mt-16 md:-mt-20 relative z-10'>
					<div className='flex flex-col md:flex-row md:items-end justify-between gap-6'>
						<div className='flex flex-col md:flex-row items-center md:items-end gap-6'>
							{state.isCurrentUser ? (
								<AvatarUploader
									bannerColor={state.targetUser.bannerColor}
									currentImage={state.targetUser.image}
								/>
							) : (
								<div className='relative group'>
									<div
										style={
											{
												'--banner-color': state.targetUser.bannerColor,
											} as React.CSSProperties
										}
										className={`absolute -inset-1 bg-linear-to-tr from-(--banner-color) to-[color-mix(in_srgb,var(--banner-color)_20%,transparent)] rounded-full blur-xl opacity-25 group-hover:opacity-90 transition duration-1000`}
									></div>
									<Image
										style={
											{
												'--banner-color': state.targetUser.bannerColor,
											} as React.CSSProperties
										}
										src={
											state.targetUser.image || '/profile/default_avatar.png'
										}
										alt={state.targetUser.name}
										width={160}
										height={160}
										className='relative rounded-full border-8 border-(--banner-color,#ffffff) object-cover shadow-2xl w-32 h-32 md:w-40 md:h-40'
									/>
									<div className='absolute bottom-4 right-4 w-6 h-6 bg-green-500 border-4 border-card rounded-full shadow-lg'></div>
								</div>
							)}

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

					<div className='grid grid-cols-2 md:grid-cols-5 gap-4 mt-4'>
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
