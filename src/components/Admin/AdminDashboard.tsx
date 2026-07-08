'use client'

import { useState } from 'react'
import { AdminSidebar } from './AdminSidebar'
import { AdminUsersTab } from './AdminUsersTab'
import { AdminTradesTab } from './AdminTradesTab'
import { AdminPacksTab } from './AdminPacksTab'
import { AdminCrashTab } from './AdminCrashTab'
import { AdminEvolutionRewardsTab } from './AdminEvolutionRewardsTab'
import { useAdminDashboardStats, Timeframe } from './hooks/useAdminDashboardStats'
import { Button } from '@/components/ui/button'
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	ChartConfig,
} from '@/components/ui/chart'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Loader2, Users, TrendingUp } from 'lucide-react'

type Tab = 'dashboard' | 'users' | 'packs' | 'trades' | 'crash' | 'evolution_rewards'

const chartConfig = {
	count: {
		label: 'New Users',
		color: 'hsl(var(--primary))',
	},
} satisfies ChartConfig

export const AdminDashboard = () => {
	const [activeTab, setActiveTab] = useState<Tab>('dashboard')
	const { state, status, functions } = useAdminDashboardStats()

	const timeframes: { label: string; value: Timeframe }[] = [
		{ label: '24 Hours', value: '24h' },
		{ label: '7 Days', value: '7d' },
		{ label: '30 Days', value: '30d' },
		{ label: 'Year', value: '1y' },
		{ label: 'All Time', value: 'all' },
	]

	// Calculate total users registered in the current timeframe
	const totalRegistrations = state.stats.reduce((acc, curr) => acc + curr.count, 0)

	return (
		<div className='flex flex-col md:flex-row gap-6 w-full min-h-[500px]'>
			<AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
			<main className='flex-1 min-w-0 bg-card/40 rounded-xl border border-border/60 p-6 shadow-xs'>
				{activeTab === 'dashboard' && (
					<div className='flex flex-col gap-6 w-full'>
						<div className='flex justify-between items-start md:items-center flex-col md:flex-row gap-4 border-b border-border/50 pb-4'>
							<div>
								<h2 className='text-2xl font-bold tracking-tight text-foreground/90'>
									Dashboard
								</h2>
								<p className='text-sm text-muted-foreground mt-1'>
									Review overall analytics and system usage metrics.
								</p>
							</div>
							<div className='flex items-center gap-1.5 flex-wrap bg-muted/30 p-1.5 rounded-lg border border-border/50'>
								{timeframes.map(tf => (
									<Button
										key={tf.value}
										variant={state.timeframe === tf.value ? 'default' : 'ghost'}
										size='sm'
										className='h-8 text-xs font-semibold px-3'
										onClick={() => functions.setTimeframe(tf.value)}
									>
										{tf.label}
									</Button>
								))}
							</div>
						</div>

						{status.isLoading ? (
							<div className='flex justify-center items-center h-[350px] w-full'>
								<Loader2 className='w-8 h-8 animate-spin text-primary' />
							</div>
						) : (
							<div className='flex flex-col gap-6'>
								<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
									<div className='border border-border/60 bg-card/20 rounded-2xl p-6 shadow-xs flex flex-col gap-2'>
										<div className='flex justify-between items-center text-muted-foreground'>
											<span className='text-xs font-bold uppercase tracking-wider'>
												New Registrations
											</span>
											<Users size={16} className='text-primary/70' />
										</div>
										<div className='flex items-baseline gap-2 mt-1'>
											<span className='text-3xl font-extrabold tracking-tight'>
												{totalRegistrations}
											</span>
											<span className='text-xs text-muted-foreground'>
												in selected timeframe
											</span>
										</div>
									</div>

									<div className='border border-border/60 bg-card/20 rounded-2xl p-6 shadow-xs flex flex-col gap-2 col-span-2'>
										<div className='flex justify-between items-center text-muted-foreground'>
											<span className='text-xs font-bold uppercase tracking-wider'>
												Registration Trend
											</span>
											<TrendingUp size={16} className='text-green-500/70' />
										</div>
										<p className='text-sm text-muted-foreground mt-1'>
											Showing active user signups grouped by date interval.
										</p>
									</div>
								</div>

								<div className='border border-border/60 bg-card/20 rounded-2xl p-6 shadow-xs flex flex-col gap-4'>
									<h3 className='text-sm font-bold uppercase tracking-wider text-muted-foreground'>
										User Registrations Chart
									</h3>

									<div className='w-full h-[350px] mt-2'>
										<ChartContainer config={chartConfig} className='w-full h-full aspect-auto'>
											<AreaChart
												data={state.stats}
												margin={{ left: 0, right: 10, top: 10, bottom: 0 }}
											>
												<defs>
													<linearGradient id='colorCount' x1='0' y1='0' x2='0' y2='1'>
														<stop
															offset='5%'
															stopColor='var(--color-count)'
															stopOpacity={0.2}
														/>
														<stop
															offset='95%'
															stopColor='var(--color-count)'
															stopOpacity={0}
														/>
													</linearGradient>
												</defs>
												<CartesianGrid
													vertical={false}
													strokeDasharray='3 3'
													className='stroke-muted/30'
												/>
												<XAxis
													dataKey='date'
													tickLine={false}
													axisLine={false}
													tickMargin={8}
													className='fill-muted-foreground font-semibold'
												/>
												<YAxis
													tickLine={false}
													axisLine={false}
													tickMargin={8}
													allowDecimals={false}
													className='fill-muted-foreground font-mono font-semibold'
												/>
												<ChartTooltip
													cursor={false}
													content={<ChartTooltipContent hideLabel={false} />}
												/>
												<Area
													type='monotone'
													dataKey='count'
													name='count'
													stroke='var(--color-count)'
													strokeWidth={2}
													fillOpacity={1}
													fill='url(#colorCount)'
												/>
											</AreaChart>
										</ChartContainer>
									</div>
								</div>
							</div>
						)}
					</div>
				)}
				{activeTab === 'users' && <AdminUsersTab />}
				{activeTab === 'trades' && <AdminTradesTab />}
				{activeTab === 'packs' && <AdminPacksTab />}
				{activeTab === 'evolution_rewards' && <AdminEvolutionRewardsTab />}
				{activeTab === 'crash' && <AdminCrashTab />}
			</main>
		</div>
	)
}
