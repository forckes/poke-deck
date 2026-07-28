import { getLeaderboardAction } from '@/lib/actions/leaderboard.actions'
import { LeaderboardCategory, LeaderboardEntry } from '@/types/leaderboard'
import { useState, useTransition } from 'react'

export const useLeaderboardTabs = (
	initialCategory: LeaderboardCategory,
	initialData: LeaderboardEntry[],
) => {
	const [category, setCategory] = useState<LeaderboardCategory>(initialCategory)
	const [data, setData] = useState<LeaderboardEntry[]>(initialData)
	const [isPending, startTransition] = useTransition()

	const handleTabChange = (value: string) => {
		const newCategory = value as LeaderboardCategory
		setCategory(newCategory)

		startTransition(async () => {
			const res = await getLeaderboardAction(newCategory)
			if (res.success && res.data) {
				setData(res.data)
			}
		})
	}

	const getScoreLabel = (category: LeaderboardCategory) => {
		switch (category) {
			case LeaderboardCategory.TOTAL_CARDS:
				return 'cards'
			case LeaderboardCategory.LEGENDARY_CARDS:
				return 'legendaries'
			case LeaderboardCategory.TRADE_COUNT:
				return 'trades'
			default:
				return 'score'
		}
	}

	return {
		state: { category, data },
		status: { isPending },
		functions: { getScoreLabel, handleTabChange },
	}
}
