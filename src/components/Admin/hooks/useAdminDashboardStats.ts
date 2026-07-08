import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getUsersRegistrationStatsAction } from '@/lib/actions/admin.actions'

export type Timeframe = '24h' | '7d' | '30d' | '1y' | 'all'

export const useAdminDashboardStats = () => {
	const [timeframe, setTimeframe] = useState<Timeframe>('7d')

	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ['admin-user-registration-stats', timeframe],
		queryFn: () => getUsersRegistrationStatsAction(timeframe),
	})

	return {
		state: {
			timeframe,
			stats: data?.stats ?? [],
		},
		status: {
			isLoading,
			isError,
		},
		functions: {
			setTimeframe,
			refetch,
		},
	}
}
