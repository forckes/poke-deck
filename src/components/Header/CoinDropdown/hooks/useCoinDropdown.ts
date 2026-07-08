import { useCoinStore } from '@/store/useCoinStore'
import {
	getUserCoinsAction,
	getHourlyRewardStatusAction,
	claimHourlyRewardAction,
} from '@/lib/actions/coin.actions'
import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export const useCoinDropdown = (userId: string) => {
	const coins = useCoinStore(state => state.coins)
	const setCoins = useCoinStore(state => state.setCoins)
	const queryClient = useQueryClient()

	const [secondsRemaining, setSecondsRemaining] = useState<number>(0)
	const [isClaiming, setIsClaiming] = useState<boolean>(false)

	const { isError: isCoinsError } = useQuery({
		queryKey: ['user-coins', userId],
		queryFn: async () => {
			const data = await getUserCoinsAction()
			if (data && typeof data.coins === 'number') setCoins(data.coins)
			return data
		},
		refetchInterval: 60000,
		enabled: !!userId,
	})

	const { data: rewardStatus } = useQuery({
		queryKey: ['hourly-reward', userId],
		queryFn: async () => {
			return await getHourlyRewardStatusAction()
		},
		refetchInterval: 30000,
		enabled: !!userId,
	})

	useEffect(() => {
		if (rewardStatus && typeof rewardStatus.secondsRemaining === 'number') {
			setSecondsRemaining(rewardStatus.secondsRemaining)
		}
	}, [rewardStatus])

	useEffect(() => {
		if (secondsRemaining <= 0) return

		const interval = setInterval(() => {
			setSecondsRemaining(prev => {
				if (prev <= 1) {
					clearInterval(interval)
					queryClient.invalidateQueries({ queryKey: ['hourly-reward', userId] })
					return 0
				}
				return prev - 1
			})
		}, 1000)

		return () => clearInterval(interval)
	}, [secondsRemaining, userId, queryClient])

	const handleClaimReward = async () => {
		if (isClaiming || secondsRemaining > 0) return
		setIsClaiming(true)

		try {
			const result = await claimHourlyRewardAction()

			if (result.success) {
				toast.success('Successfully claimed 200 coins')
				queryClient.invalidateQueries({ queryKey: ['user-coins', userId] })
				queryClient.invalidateQueries({ queryKey: ['hourly-reward', userId] })
			} else {
				toast.error(result.error || 'Unable to claim reward')
			}
		} catch (error) {
			toast.error('Server error, try again soon')
		} finally {
			setIsClaiming(false)
		}
	}

	const formatTime = (totalSeconds: number) => {
		const h = Math.floor(totalSeconds / 3600)
			.toString()
			.padStart(2, '0')
		const m = Math.floor((totalSeconds % 3600) / 60)
			.toString()
			.padStart(2, '0')
		const s = (totalSeconds % 60).toString().padStart(2, '0')
		return `${h}:${m}:${s}`
	}

	return {
		state: { coins, rewardStatus, secondsRemaining },
		status: { isCoinsError, isClaiming },
		functions: { setCoins, formatTime, handleClaimReward },
	}
}
