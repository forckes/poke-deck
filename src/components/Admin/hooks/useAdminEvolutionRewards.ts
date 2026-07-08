import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
	getEvolutionRewardsAction,
	updateEvolutionRewardAction,
	createDefaultEvolutionRewardsAction,
} from '@/lib/actions/admin.actions'
import { Rarity } from '@/generated/enums'

export const useAdminEvolutionRewards = () => {
	const [editingRarity, setEditingRarity] = useState<Rarity | null>(null)
	const [newCoins, setNewCoins] = useState<number | ''>('')
	const [isUpdatingCoins, setIsUpdatingCoins] = useState(false)
	const [isSeeding, setIsSeeding] = useState(false)

	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ['admin-evolution-rewards'],
		queryFn: getEvolutionRewardsAction,
	})

	const handleUpdateCoins = async () => {
		if (!editingRarity) return
		if (newCoins === '' || Number(newCoins) < 0) {
			toast.error('Please enter a valid coin reward')
			return
		}

		setIsUpdatingCoins(true)
		try {
			const res = await updateEvolutionRewardAction(
				editingRarity,
				Number(newCoins),
			)
			if (res.success) {
				toast.success('Evolution reward updated successfully')
				setEditingRarity(null)
				setNewCoins('')
				refetch()
			}
		} catch (error: any) {
			toast.error(error.message || 'Failed to update evolution reward')
		} finally {
			setIsUpdatingCoins(false)
		}
	}

	const handleCreateDefaultRewards = async () => {
		setIsSeeding(true)
		try {
			const res = await createDefaultEvolutionRewardsAction()
			if (res.success) {
				toast.success('Default evolution rewards initialized in DB')
				refetch()
			}
		} catch (error: any) {
			toast.error(error.message || 'Failed to initialize evolution rewards')
		} finally {
			setIsSeeding(false)
		}
	}

	const openEdit = (reward: any) => {
		setEditingRarity(reward.rarity)
		setNewCoins(reward.coinReward)
	}

	return {
		state: {
			rewards: data?.rewards ?? [],
			editingRarity,
			newCoins,
			isUpdatingCoins,
			isSeeding,
		},
		status: {
			isLoading,
			isError,
		},
		functions: {
			setNewCoins,
			openEdit,
			handleUpdateCoins,
			handleCreateDefaultRewards,
			closeEdit: () => setEditingRarity(null),
		},
	}
}
