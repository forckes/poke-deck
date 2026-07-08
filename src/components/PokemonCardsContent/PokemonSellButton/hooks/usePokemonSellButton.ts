import { useState, useEffect, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { usePokemonStore } from '@/store/usePokemonStore'
import { useCoinStore } from '@/store/useCoinStore'
import { getPackPriceAction } from '@/lib/actions/coin.actions'
import { sellPokemonCardAction } from '@/lib/actions/pokemon.actions'
import { toast } from 'sonner'
import { PackType } from '@/generated/enums'

export const usePokemonSellButton = () => {
	const queryClient = useQueryClient()
	const { selectedModalCard, setSelectedModalCard } = usePokemonStore()
	const addCoinsLocal = useCoinStore(state => state.addCoinsLocal)
	const coins = useCoinStore(state => state.coins)

	const [isConfirming, setIsConfirming] = useState(false)
	const [isSelling, setIsSelling] = useState(false)
	const timerRef = useRef<NodeJS.Timeout | null>(null)

	const rarity = selectedModalCard?.rarity

	const { data: packPriceData } = useQuery({
		queryKey: ['pack-price', rarity],
		queryFn: async () => {
			if (!rarity) return null
			return getPackPriceAction(rarity as unknown as PackType)
		},
		enabled: !!rarity,
	})

	const packPrice = packPriceData?.packPrice?.priceInCoins ?? 0
	const sellPrice = Math.ceil(packPrice / 4)

	useEffect(() => {
		return () => {
			if (timerRef.current) {
				clearTimeout(timerRef.current)
			}
		}
	}, [])

	useEffect(() => {
		setIsConfirming(false)
		if (timerRef.current) {
			clearTimeout(timerRef.current)
		}
	}, [selectedModalCard])

	const handleSellClick = async () => {
		if (isSelling) return

		if (!selectedModalCard) return

		if (!isConfirming) {
			setIsConfirming(true)
			if (timerRef.current) {
				clearTimeout(timerRef.current)
			}
			timerRef.current = setTimeout(() => {
				setIsConfirming(false)
			}, 3000)
			return
		}

		if (timerRef.current) {
			clearTimeout(timerRef.current)
		}
		setIsConfirming(false)
		setIsSelling(true)

		try {
			if (coins + sellPrice > 10000) {
				toast.info(
					"You can't sell this card because it will exceed the limit of 10,000 coins.",
				)
				setIsSelling(false)
				return
			}

			const result = await sellPokemonCardAction(selectedModalCard.id)

			if (result.success) {
				toast.success('Card sold successfully!')
				addCoinsLocal(sellPrice)
				setSelectedModalCard(null)
				queryClient.invalidateQueries({ queryKey: ['user-cards'] })
				queryClient.invalidateQueries({ queryKey: ['user-coins'] })
			} else {
				if (result.isNearLimit) {
					toast.info(result.error)
				} else {
					toast.error(result.error || 'Failed to sell card.')
				}
			}
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			toast.error(error)
		} finally {
			setIsSelling(false)
		}
	}

	return {
		state: {
			isConfirming,
			isSelling,
			sellPrice,
			hasCard: !!selectedModalCard,
			isObtained: selectedModalCard?.isObtained,
		},
		functions: {
			handleSellClick,
		},
	}
}
