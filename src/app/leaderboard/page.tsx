import LeaderboardTabs from '@/components/Leaderboard/LeaderboardTabs'
import { getLeaderboardAction } from '@/lib/actions/leaderboard.actions'

import { LeaderboardCategory } from '@/types/leaderboard'
import { Trophy } from 'lucide-react'

export default async function LeaderboardPage() {
	const initialCategory = LeaderboardCategory.TOTAL_CARDS
	const initialData = await getLeaderboardAction(initialCategory, 10)

	return (
		<main className='flex flex-col items-center w-full max-w-5xl mx-auto my-10 px-4'>
			<div className='flex flex-col items-center gap-2 mb-8 text-center'>
				<div className='p-3 bg-primary/10 rounded-xl border border-primary/20 text-primary mb-2'>
					<Trophy className='size-8' />
				</div>
				<h1 className='text-6xl font-black tracking-tight shiny-purple'>
					LEADERBOARD
				</h1>
			</div>

			<LeaderboardTabs
				initialCategory={initialCategory}
				initialData={initialData.data!}
			/>
		</main>
	)
}
