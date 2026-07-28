'use client'

import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { LeaderboardCategory, LeaderboardEntry } from '@/types/leaderboard'
import { Loader2, Sparkles, ArrowLeftRight, Library } from 'lucide-react'
import { useLeaderboardTabs } from './hooks/useLeaderboardTabs'
import RankBadges from './RankBadges'
import { getContrastingColor } from '@/utils/helpers/getContrastingColor'

interface LeaderboardTabsProps {
	initialCategory: LeaderboardCategory
	initialData: LeaderboardEntry[]
}

export default function LeaderboardTabs({
	initialCategory,
	initialData,
}: LeaderboardTabsProps) {
	const { state, status, functions } = useLeaderboardTabs(
		initialCategory,
		initialData,
	)

	return (
		<div className='flex gap-8 w-full items-center justify-center'>
			<Tabs
				value={state.category}
				onValueChange={functions.handleTabChange}
				className='flex flex-col w-full md:w-3/4'
			>
				<TabsList className='px-0 mx-auto py-4.5 justify-center gap-1 items-center'>
					<TabsTrigger
						className='text-md p-4 flex items-center gap-2 data-[state=active]:bg-primary/15 text-black'
						value={LeaderboardCategory.TOTAL_CARDS}
					>
						<Library className='size-4' /> Total Cards
					</TabsTrigger>

					<TabsTrigger
						className='text-md p-4 flex items-center gap-2 data-[state=active]:bg-primary/15 text-black'
						value={LeaderboardCategory.LEGENDARY_CARDS}
					>
						<Sparkles className='size-4 text-yellow-500' /> Legendaries
					</TabsTrigger>

					<TabsTrigger
						className='text-md p-4 flex items-center gap-2 data-[state=active]:bg-primary/15 text-black'
						value={LeaderboardCategory.TRADE_COUNT}
					>
						<ArrowLeftRight className='size-4' /> Trades
					</TabsTrigger>
				</TabsList>

				<TabsContent value={state.category} className='w-full mt-6'>
					{state.data.length > 0 ? (
						<div className='relative'>
							{status.isPending && (
								<>
									<div className='absolute right-1/2 top-1/2 z-20'>
										<Loader2 className='size-8 animate-spin text-primary' />
									</div>
									<div className='absolute z-19 inset-0 bg-black/30 rounded-2xl transition-colors' />
								</>
							)}
							<ul className='flex flex-col gap-3 w-full'>
								{state.data.map(entry => {
									const textColor = getContrastingColor(entry.bannerColor)

									return (
										<Link
											key={entry.id}
											href={`/user/${entry.username}`}
											className='group block w-full outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl'
										>
											<li
												style={
													{
														'--banner-color':
															entry.bannerColor || 'var(--primary)',
													} as React.CSSProperties
												}
												className='bg-(--banner-color) border border-primary/20 text-primary-foreground flex justify-between items-center rounded-2xl py-3.5 px-5 gap-4 shadow-md hover:shadow-lg transition-all backdrop-blur-md relative overflow-hidden cursor-pointer'
											>
												<div className='absolute inset-0 bg-black/10 group-hover:bg-black/15 transition-colors' />

												<div className='flex items-center gap-4 min-w-0 flex-1 z-10'>
													<RankBadges rank={entry.rank} />

													<div className='relative shrink-0'>
														<Avatar
															size='lg'
															className='border-2 border-primary-foreground/20'
														>
															<AvatarImage
																src={
																	entry.image || '/profile/default_avatar.png'
																}
																alt={entry.name}
															/>
														</Avatar>
													</div>

													<div
														className={`flex flex-col min-w-0 flex-1 ${textColor}`}
													>
														<p className='text-lg font-bold truncate group-hover:underline leading-snug'>
															{entry.name}
														</p>
														<p className='text-xs truncate font-medium'>
															@{entry.username}
														</p>
													</div>
												</div>

												<div className='absolute right-1/4 top-1/2 -translate-y-1/2 opacity-90 pointer-events-none z-0'>
													<div className='w-12 h-12 rounded-full border-[3px] border-white relative flex items-center justify-center'>
														<div className='w-full h-0.75 bg-white absolute top-1/2 -translate-y-1/2' />
														<div className='w-4 h-4 rounded-full border-[3px] border-white bg-transparent z-10' />
													</div>
												</div>

												<div
													className={`flex items-center gap-2 bg-background/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-primary-foreground/10 shrink-0 z-10 ${textColor}`}
												>
													<span className='text-xl font-black tracking-tight'>
														{entry.score}
													</span>
													<span className='text-xs uppercase font-bold tracking-wider'>
														{functions.getScoreLabel(state.category)}
													</span>
												</div>
											</li>
										</Link>
									)
								})}
							</ul>
						</div>
					) : (
						<div className='text-center text-muted-foreground py-12 bg-background/50 rounded-2xl border border-primary/10'>
							No players found in this category yet.
						</div>
					)}
				</TabsContent>
			</Tabs>
		</div>
	)
}
