import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
	getPacksConfigAction,
	updatePackPriceAction,
	updatePackChancesAction,
	createDefaultPacksAction,
} from '@/lib/actions/admin.actions'
import { PackType } from '@/generated/enums'

export const useAdminPacks = () => {
	const [editingPricePack, setEditingPricePack] = useState<PackType | null>(
		null,
	)
	const [newPrice, setNewPrice] = useState<number | ''>('')
	const [isUpdatingPrice, setIsUpdatingPrice] = useState(false)

	const [editingChancesPack, setEditingChancesPack] = useState<PackType | null>(
		null,
	)
	const [newCommon, setNewCommon] = useState<number | ''>('')
	const [newEpic, setNewEpic] = useState<number | ''>('')
	const [newLegendary, setNewLegendary] = useState<number | ''>('')
	const [isUpdatingChances, setIsUpdatingChances] = useState(false)

	const [isSeeding, setIsSeeding] = useState(false)

	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ['admin-packs-config'],
		queryFn: getPacksConfigAction,
	})

	const handleCreateDefaultPacks = async () => {
		setIsSeeding(true)
		try {
			const res = await createDefaultPacksAction()
			if (res.success) {
				toast.success('Default packs initialized in DB')
				refetch()
			}
		} catch (error: any) {
			toast.error(error.message || 'Failed to initialize packs')
		} finally {
			setIsSeeding(false)
		}
	}

	const handleUpdatePrice = async () => {
		if (!editingPricePack) return
		if (newPrice === '' || Number(newPrice) <= 0) {
			toast.error('Please enter a valid price')
			return
		}

		setIsUpdatingPrice(true)
		try {
			const res = await updatePackPriceAction(
				editingPricePack,
				Number(newPrice),
			)
			if (res.success) {
				toast.success('Pack price updated successfully')
				setEditingPricePack(null)
				setNewPrice('')
				refetch()
			}
		} catch (error: any) {
			toast.error(error.message || 'Failed to update pack price')
		} finally {
			setIsUpdatingPrice(false)
		}
	}

	const handleUpdateChances = async () => {
		if (!editingChancesPack) return
		const common = Number(newCommon)
		const epic = Number(newEpic)
		const legendary = Number(newLegendary)

		if (newCommon === '' || newEpic === '' || newLegendary === '') {
			toast.error('Please enter values for all drop chances')
			return
		}

		if (common < 0 || epic < 0 || legendary < 0) {
			toast.error('Drop chances cannot be negative')
			return
		}

		if (common + epic + legendary !== 100) {
			toast.error(
				`Drop chances must sum to exactly 100% (currently ${common + epic + legendary}%)`,
			)
			return
		}

		setIsUpdatingChances(true)
		try {
			const res = await updatePackChancesAction(
				editingChancesPack,
				common,
				epic,
				legendary,
			)
			if (res.success) {
				toast.success('Pack drop chances updated successfully')
				setEditingChancesPack(null)
				setNewCommon('')
				setNewEpic('')
				setNewLegendary('')
				refetch()
			}
		} catch (error: any) {
			toast.error(error.message || 'Failed to update pack drop chances')
		} finally {
			setIsUpdatingChances(false)
		}
	}

	const openPriceEdit = (pack: any) => {
		setEditingPricePack(pack.type)
		setNewPrice(pack.priceInCoins)
	}

	const openChancesEdit = (pack: any) => {
		setEditingChancesPack(pack.type)
		setNewCommon(pack.commonDropChance)
		setNewEpic(pack.epicDropChance)
		setNewLegendary(pack.legendaryDropChance)
	}

	return {
		state: {
			packs: data?.packs ?? [],
			editingPricePack,
			newPrice,
			isUpdatingPrice,
			editingChancesPack,
			newCommon,
			newEpic,
			newLegendary,
			isUpdatingChances,
			isSeeding,
		},
		status: {
			isLoading,
			isError,
		},
		functions: {
			setNewPrice,
			setNewCommon,
			setNewEpic,
			setNewLegendary,
			openPriceEdit,
			openChancesEdit,
			handleUpdatePrice,
			handleUpdateChances,
			handleCreateDefaultPacks,
			closePriceEdit: () => setEditingPricePack(null),
			closeChancesEdit: () => setEditingChancesPack(null),
		},
	}
}
