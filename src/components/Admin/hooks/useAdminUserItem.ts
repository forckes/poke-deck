import { useState } from 'react'
import { toast } from 'sonner'
import {
	banUserAction,
	unbanUserAction,
	addCoinsToUserAction,
	toggleUserRoleAction,
} from '@/lib/actions/admin.actions'
import { useSession } from '@/lib/auth-client'

export type AdminUser = {
	id: string
	name: string
	username: string | null
	displayUsername: string | null
	email: string
	emailVerified: boolean
	image: string
	coins: number
	createdAt: string
	updatedAt: string
	lastHourlyRewardAt: string | null
	role: string
	banned: boolean
	banReason: string | null
	banExpires: string | null
}

export const useAdminUserItem = (user: AdminUser, refetch: () => void) => {
	const [isBanOpen, setIsBanOpen] = useState(false)
	const [banReason, setBanReason] = useState('')
	const [banDuration, setBanDuration] = useState<number | ''>('')
	const [banConfirm, setBanConfirm] = useState('')
	const [isBanning, setIsBanning] = useState(false)

	const [isUnbanning, setIsUnbanning] = useState(false)

	const [isCoinsOpen, setIsCoinsOpen] = useState(false)
	const [coinAmount, setCoinAmount] = useState<number | ''>('')
	const [isAddingCoins, setIsAddingCoins] = useState(false)

	const [isUpdatingRole, setIsUpdatingRole] = useState(false)

	const session = useSession()
	const isCurrentUser = session.data?.user.id === user.id

	const handleBan = async () => {
		if (banConfirm !== `ban-${user.username}`) {
			toast.error('Confirmation text does not match')
			return
		}

		setIsBanning(true)
		try {
			const res = await banUserAction(
				user.id,
				banReason,
				banDuration ? Number(banDuration) : null,
			)
			if (res.success) {
				toast.success(`User ${user.name} has been banned`)
				setIsBanOpen(false)
				setBanReason('')
				setBanDuration('')
				setBanConfirm('')
				refetch()
			}
		} catch (error: any) {
			toast.error(error.message || 'Failed to ban user')
		} finally {
			setIsBanning(true)
		}
	}

	const handleUnban = async () => {
		setIsUnbanning(true)
		try {
			const res = await unbanUserAction(user.id)
			if (res.success) {
				toast.success(`User ${user.name} has been unbanned`)
				refetch()
			}
		} catch (error: any) {
			toast.error(error.message || 'Failed to unban user')
		} finally {
			setIsUnbanning(false)
		}
	}

	const handleAddCoins = async () => {
		if (coinAmount === '' || Number(coinAmount) <= 0) {
			toast.error('Please enter a valid coin amount')
			return
		}

		setIsAddingCoins(true)
		try {
			const res = await addCoinsToUserAction(user.id, Number(coinAmount))
			if (res.success) {
				toast.success(`Successfully added ${coinAmount} coins to ${user.name}`)
				setIsCoinsOpen(false)
				setCoinAmount('')
				refetch()
			}
		} catch (error: any) {
			toast.error(error.message || 'Failed to add coins')
		} finally {
			setIsAddingCoins(false)
		}
	}

	const handleToggleRole = async () => {
		setIsUpdatingRole(true)
		try {
			const res = await toggleUserRoleAction(user.id)
			if (res.success) {
				toast.success(`Successfully toggled role for ${user.name}`)
				refetch()
			}
		} catch (error: any) {
			toast.error(error.message || 'Failed to toggle role')
		} finally {
			setIsUpdatingRole(false)
		}
	}

	return {
		state: {
			isBanOpen,
			banReason,
			banDuration,
			banConfirm,
			isBanning,
			isUnbanning,
			isCoinsOpen,
			coinAmount,
			isAddingCoins,
			isUpdatingRole,
		},
		status: { isCurrentUser },
		functions: {
			setIsBanOpen,
			setBanReason,
			setBanDuration,
			setBanConfirm,
			setIsCoinsOpen,
			setCoinAmount,
			handleBan,
			handleUnban,
			handleAddCoins,
			handleToggleRole,
		},
	}
}
