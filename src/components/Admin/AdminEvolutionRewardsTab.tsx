'use client'

import { useAdminEvolutionRewards } from './hooks/useAdminEvolutionRewards'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Loader2, Edit, Coins } from 'lucide-react'
import Image from 'next/image'
import { Rarity } from '@/generated/enums'

export const AdminEvolutionRewardsTab = () => {
	const { state, status, functions } = useAdminEvolutionRewards()

	const getRarityTheme = (rarity: Rarity) => {
		switch (rarity) {
			case Rarity.COMMON:
				return {
					border: 'border-slate-300 dark:border-slate-800',
					bg: 'bg-slate-50 dark:bg-slate-950/20',
					text: 'text-slate-700 dark:text-slate-300',
					badge: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200',
				}
			case Rarity.EPIC:
				return {
					border: 'border-purple-300 dark:border-purple-800',
					bg: 'bg-purple-50 dark:bg-purple-950/20',
					text: 'text-purple-700 dark:text-purple-300',
					badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
				}
			case Rarity.LEGENDARY:
				return {
					border: 'border-amber-300 dark:border-amber-800',
					bg: 'bg-amber-50 dark:bg-amber-950/20',
					text: 'text-amber-700 dark:text-amber-300',
					badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
				}
		}
	}

	return (
		<div className='flex flex-col gap-6 w-full'>
			<div className='flex justify-between items-start md:items-center flex-col md:flex-row gap-4'>
				<div>
					<h2 className='text-2xl font-bold tracking-tight text-foreground/90'>
						Evolution Reward Configuration
					</h2>
					<p className='text-sm text-muted-foreground mt-1'>
						Configure coins rewarded to users when they collect all evolutions of a chain.
					</p>
				</div>
				{state.rewards.length === 0 && !status.isLoading && (
					<Button
						onClick={functions.handleCreateDefaultRewards}
						disabled={state.isSeeding}
						className='gap-2 shadow-xs'
					>
						{state.isSeeding ? (
							<Loader2 className='w-4 h-4 animate-spin' />
						) : (
							<Coins className='w-4 h-4' />
						)}
						Initialize Rewards in DB
					</Button>
				)}
			</div>

			{status.isLoading ? (
				<div className='flex justify-center items-center h-64 w-full'>
					<Loader2 className='w-8 h-8 animate-spin text-primary' />
				</div>
			) : state.rewards.length === 0 ? (
				<div className='flex flex-col items-center justify-center border border-dashed border-border rounded-2xl p-12 text-center bg-card/20'>
					<Coins className='w-12 h-12 text-muted-foreground mb-4 opacity-50' />
					<h3 className='text-lg font-semibold'>No Evolution Rewards Defined</h3>
					<p className='text-sm text-muted-foreground mt-1 max-w-md'>
						You need to initialize the three default rarity reward tiers in the database before they can be configured.
					</p>
					<Button
						onClick={functions.handleCreateDefaultRewards}
						disabled={state.isSeeding}
						className='mt-6 gap-2'
					>
						{state.isSeeding && <Loader2 className='w-4 h-4 animate-spin' />}
						Create 3 Default Rewards (1-Click)
					</Button>
				</div>
			) : (
				<div className='grid grid-cols-1 md:grid-cols-3 gap-6 w-full'>
					{state.rewards.map(reward => {
						const theme = getRarityTheme(reward.rarity)
						return (
							<div
								key={reward.id}
								className={`border ${theme.border} ${theme.bg} rounded-2xl p-6 flex flex-col justify-between gap-6 shadow-sm`}
							>
								<div className='flex flex-col gap-4'>
									<div className='flex justify-between items-center'>
										<h3 className={`text-xl font-bold capitalize ${theme.text}`}>
											{reward.rarity.toLowerCase()} Rarity
										</h3>
										<span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${theme.badge}`}>
											Active
										</span>
									</div>

									<div className='flex items-center gap-2 border-y border-border/50 py-4 my-2'>
										<Image
											src='/profile/coin.png'
											alt='coins'
											width={24}
											height={24}
										/>
										<span className='font-mono font-bold text-2xl'>{reward.coinReward}</span>
										<span className='text-xs uppercase font-bold text-gray-500 ml-1'>Coins</span>
									</div>

									<p className='text-xs text-muted-foreground'>
										Reward given for completing an evolution chain of {reward.rarity.toLowerCase()} rarity cards.
									</p>
								</div>

								<div className='flex flex-col gap-2 mt-4'>
									<Dialog
										open={state.editingRarity === reward.rarity}
										onOpenChange={open => {
											if (open) functions.openEdit(reward)
											else functions.closeEdit()
										}}
									>
										<DialogTrigger asChild>
											<Button variant='outline' size='sm' className='w-full gap-1.5'>
												<Edit size={14} />
												<span>Configure Reward</span>
											</Button>
										</DialogTrigger>
										<DialogContent>
											<DialogHeader>
												<DialogTitle>Configure Evolution Reward</DialogTitle>
											</DialogHeader>
											<div className='flex flex-col gap-4 py-4'>
												<p className='text-sm text-muted-foreground'>
													Update the coin reward for completing a <span className='font-bold capitalize'>{reward.rarity.toLowerCase()}</span> evolution chain.
												</p>
												<div className='flex flex-col gap-1.5'>
													<label className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
														Reward Amount (Coins)
													</label>
													<Input
														type='number'
														value={state.newCoins}
														onChange={e =>
															functions.setNewCoins(
																e.target.value === '' ? '' : Number(e.target.value)
															)
														}
														placeholder='Enter reward amount...'
													/>
												</div>
												<Button
													className='w-full mt-2'
													onClick={functions.handleUpdateCoins}
													disabled={state.isUpdatingCoins}
												>
													{state.isUpdatingCoins && (
														<Loader2 size={16} className='animate-spin mr-2' />
													)}
													Save Reward
												</Button>
											</div>
										</DialogContent>
									</Dialog>
								</div>
							</div>
						)
					})}
				</div>
			)}
		</div>
	)
}
