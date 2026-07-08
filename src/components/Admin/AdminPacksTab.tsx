import { useAdminPacks } from './hooks/useAdminPacks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Loader2, Percent, Edit, Database, Sparkles } from 'lucide-react'
import Image from 'next/image'
import { PackType } from '@/generated/enums'

export const AdminPacksTab = () => {
	const { state, status, functions } = useAdminPacks()

	const getPackTheme = (type: PackType) => {
		switch (type) {
			case PackType.COMMON:
				return {
					border: 'border-slate-300 dark:border-slate-800',
					bg: 'bg-slate-50 dark:bg-slate-950/20',
					text: 'text-slate-700 dark:text-slate-300',
					badge: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200',
				}
			case PackType.EPIC:
				return {
					border: 'border-purple-300 dark:border-purple-800',
					bg: 'bg-purple-50 dark:bg-purple-950/20',
					text: 'text-purple-700 dark:text-purple-300',
					badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
				}
			case PackType.LEGENDARY:
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
						Pack Configuration
					</h2>
					<p className='text-sm text-muted-foreground mt-1'>
						Configure prices and drop rates for all card packs.
					</p>
				</div>
				{state.packs.length === 0 && !status.isLoading && (
					<Button
						onClick={functions.handleCreateDefaultPacks}
						disabled={state.isSeeding}
						className='gap-2 shadow-xs'
					>
						{state.isSeeding ? (
							<Loader2 className='w-4 h-4 animate-spin' />
						) : (
							<Database className='w-4 h-4' />
						)}
						Initialize Packs in DB
					</Button>
				)}
			</div>

			{status.isLoading ? (
				<div className='flex justify-center items-center h-64 w-full'>
					<Loader2 className='w-8 h-8 animate-spin text-primary' />
				</div>
			) : state.packs.length === 0 ? (
				<div className='flex flex-col items-center justify-center border border-dashed border-border rounded-2xl p-12 text-center bg-card/20'>
					<Database className='w-12 h-12 text-muted-foreground mb-4 opacity-50' />
					<h3 className='text-lg font-semibold'>No Packs Defined</h3>
					<p className='text-sm text-muted-foreground mt-1 max-w-md'>
						You need to initialize the three default card packs in the database before they can be configured.
					</p>
					<Button
						onClick={functions.handleCreateDefaultPacks}
						disabled={state.isSeeding}
						className='mt-6 gap-2'
					>
						{state.isSeeding && <Loader2 className='w-4 h-4 animate-spin' />}
						Create 3 Default Packs (1-Click)
					</Button>
				</div>
			) : (
				<div className='grid grid-cols-1 md:grid-cols-3 gap-6 w-full'>
					{state.packs.map(pack => {
						const theme = getPackTheme(pack.type)
						return (
							<div
								key={pack.id}
								className={`border ${theme.border} ${theme.bg} rounded-2xl p-6 flex flex-col justify-between gap-6 shadow-sm`}
							>
								<div className='flex flex-col gap-4'>
									<div className='flex justify-between items-center'>
										<h3 className={`text-xl font-bold capitalize ${theme.text}`}>
											{pack.type.toLowerCase()} Pack
										</h3>
										<span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${theme.badge}`}>
											Active
										</span>
									</div>

									<div className='flex items-center gap-2 border-y border-border/50 py-3'>
										<Image
											src='/profile/coin.png'
											alt='coins'
											width={20}
											height={20}
										/>
										<span className='font-mono font-bold text-lg'>{pack.priceInCoins}</span>
										<span className='text-xs uppercase font-bold text-gray-500'>Coins</span>
									</div>

									<div className='flex flex-col gap-2'>
										<span className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
											Drop Chances
										</span>
										<div className='flex flex-col gap-1.5 text-sm'>
											<div className='flex justify-between items-center'>
												<span className='text-gray-500'>Common:</span>
												<span className='font-mono font-semibold'>{pack.commonDropChance}%</span>
											</div>
											<div className='flex justify-between items-center'>
												<span className='text-gray-500'>Epic:</span>
												<span className='font-mono font-semibold'>{pack.epicDropChance}%</span>
											</div>
											<div className='flex justify-between items-center'>
												<span className='text-gray-500'>Legendary:</span>
												<span className='font-mono font-semibold'>{pack.legendaryDropChance}%</span>
											</div>
										</div>
									</div>
								</div>

								<div className='flex flex-col gap-2 mt-4'>
									<Dialog
										open={state.editingPricePack === pack.type}
										onOpenChange={open => {
											if (open) functions.openPriceEdit(pack)
											else functions.closePriceEdit()
										}}
									>
										<DialogTrigger asChild>
											<Button variant='outline' size='sm' className='w-full gap-1.5'>
												<Edit size={14} />
												<span>Configure Price</span>
											</Button>
										</DialogTrigger>
										<DialogContent>
											<DialogHeader>
												<DialogTitle>Configure Price</DialogTitle>
											</DialogHeader>
											<div className='flex flex-col gap-4 py-4'>
												<p className='text-sm text-muted-foreground'>
													Update the price for the <span className='font-bold capitalize'>{pack.type.toLowerCase()} Pack</span>.
												</p>
												<div className='flex flex-col gap-1.5'>
													<label className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
														New Price (Coins)
													</label>
													<Input
														type='number'
														value={state.newPrice}
														onChange={e =>
															functions.setNewPrice(
																e.target.value === '' ? '' : Number(e.target.value)
															)
														}
														placeholder='Enter new price...'
													/>
												</div>
												<Button
													className='w-full mt-2'
													onClick={functions.handleUpdatePrice}
													disabled={state.isUpdatingPrice}
												>
													{state.isUpdatingPrice && (
														<Loader2 size={16} className='animate-spin mr-2' />
													)}
													Save Price
												</Button>
											</div>
										</DialogContent>
									</Dialog>

									<Dialog
										open={state.editingChancesPack === pack.type}
										onOpenChange={open => {
											if (open) functions.openChancesEdit(pack)
											else functions.closeChancesEdit()
										}}
									>
										<DialogTrigger asChild>
											<Button variant='outline' size='sm' className='w-full gap-1.5'>
												<Percent size={14} />
												<span>Configure Chances</span>
											</Button>
										</DialogTrigger>
										<DialogContent>
											<DialogHeader>
												<DialogTitle>Configure Drop Chances</DialogTitle>
											</DialogHeader>
											<div className='flex flex-col gap-4 py-4'>
												<p className='text-sm text-muted-foreground'>
													Configure probabilities for card rarities. The total sum must equal exactly 100%.
												</p>
												<div className='flex flex-col gap-3'>
													<div className='flex flex-col gap-1.5'>
														<label className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
															Common Chance (%)
														</label>
														<Input
															type='number'
															value={state.newCommon}
															onChange={e =>
																functions.setNewCommon(
																	e.target.value === '' ? '' : Number(e.target.value)
																)
															}
															placeholder='0'
														/>
													</div>
													<div className='flex flex-col gap-1.5'>
														<label className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
															Epic Chance (%)
														</label>
														<Input
															type='number'
															value={state.newEpic}
															onChange={e =>
																functions.setNewEpic(
																	e.target.value === '' ? '' : Number(e.target.value)
																)
															}
															placeholder='0'
														/>
													</div>
													<div className='flex flex-col gap-1.5'>
														<label className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
															Legendary Chance (%)
														</label>
														<Input
															type='number'
															value={state.newLegendary}
															onChange={e =>
																functions.setNewLegendary(
																	e.target.value === '' ? '' : Number(e.target.value)
																)
															}
															placeholder='0'
														/>
													</div>
												</div>
												<Button
													className='w-full mt-2'
													onClick={functions.handleUpdateChances}
													disabled={state.isUpdatingChances}
												>
													{state.isUpdatingChances && (
														<Loader2 size={16} className='animate-spin mr-2' />
													)}
													Save Chances
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
