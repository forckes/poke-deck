import { useCoinStore } from '@/store/useCoinStore'
import { getPackPriceAction } from '@/lib/actions/coin.actions'
import { PackType } from '@/generated/enums'
import { usePackStore } from '@/store/usePackStore'
import { buyAndOpenPackAction } from '@/lib/actions/pack.actions'
import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export const usePokemonPack = () => {
	const coins = useCoinStore(state => state.coins)
	const addCoinsLocal = useCoinStore(state => state.addCoinsLocal)
	const subtractCoinsLocal = useCoinStore(state => state.subtractCoinsLocal)

	const flippedCards = usePackStore(state => state.flippedCards)
	const step = usePackStore(state => state.step)
	const cards = usePackStore(state => state.cards)

	const { startOpening, setCards, flipCard, resetPack } = usePackStore()

	const [isBursting, setIsBursting] = useState(false)
	const [selectedPackType, setSelectedPackType] = useState<PackType>(
		PackType.COMMON,
	)
	const [packPrices, setPackPrices] = useState<Record<PackType, number | null>>(
		{
			[PackType.COMMON]: null,
			[PackType.EPIC]: null,
			[PackType.LEGENDARY]: null,
		},
	)
	const [autoOpen, setAutoOpen] = useState<boolean>(false)
	const [isPending, setIsPending] = useState(false)

	useEffect(() => {
		const fetchPrices = async () => {
			const [common, epic, legendary] = await Promise.all([
				getPackPriceAction(PackType.COMMON),
				getPackPriceAction(PackType.EPIC),
				getPackPriceAction(PackType.LEGENDARY),
			])
			setPackPrices({
				[PackType.COMMON]: common.packPrice?.priceInCoins ?? null,
				[PackType.EPIC]: epic.packPrice?.priceInCoins ?? null,
				[PackType.LEGENDARY]: legendary.packPrice?.priceInCoins ?? null,
			})
		}

		fetchPrices()
	}, [])

	useEffect(() => {
		if (!autoOpen) return

		let timer: NodeJS.Timeout

		const manageAutoOpen = async () => {
			const currentPrice = packPrices[selectedPackType]

			if (step === 'idle') {
				if (currentPrice && coins >= currentPrice) {
					await handleBuyAndOpenPack(selectedPackType)
				} else if (currentPrice && coins < currentPrice) {
					setAutoOpen(false)
					toast.error('Auto-open stopped: Not enough coins!')
				}
			}

			if (step === 'dealt') {
				timer = setTimeout(() => {
					handleFlipAll()
				}, 500)
			}

			if (step === 'finished') {
				timer = setTimeout(() => {
					if (currentPrice && coins < currentPrice) {
						setAutoOpen(false)
						toast.error('Auto-open stopped: Out of coins for the next pack!')
						return
					}
					handleResetPack()
				}, 2000)
			}
		}

		manageAutoOpen()

		return () => clearTimeout(timer)
	}, [autoOpen, step, coins, selectedPackType, packPrices])

	const queryClient = useQueryClient()

	const handleFlipCard = (index: number) => {
		if (flippedCards[index] || step !== 'dealt') return

		flipCard(index)
	}

	const handleFlipAll = () => {
		if (step !== 'dealt') return

		cards.forEach((_, index) => flipCard(index))
	}

	const handleResetPack = () => {
		resetPack()
	}

	const handleBuyAndOpenPack = async (packType: PackType) => {
		const { packPrice } = await getPackPriceAction(packType)
		const cost = packPrice?.priceInCoins

		if (!cost) {
			toast.error('Failed to get pack price')
			setAutoOpen(false)
			return
		}

		if (coins < cost) {
			toast.error('Not enough coins!')
			setAutoOpen(false)
			return
		}

		subtractCoinsLocal(cost)
		startOpening()

		try {
			toast.success('Successfully bought pack of cards')

			const [result] = await Promise.all([buyAndOpenPackAction(packType)])

			if (result.success && result.cards) {
				setIsBursting(true)
				await new Promise(resolve => setTimeout(resolve, 1000))
				setIsBursting(false)

				setCards(result.cards)

				queryClient.invalidateQueries({ queryKey: ['user-cards'] })
				queryClient.invalidateQueries({ queryKey: ['user-coins'] })
			} else {
				addCoinsLocal(cost)
				setAutoOpen(false)
				setIsBursting(false)
				resetPack()
				toast.error(result.error!)
			}
		} catch (error) {
			addCoinsLocal(cost)
			setAutoOpen(false)
			setIsBursting(false)
			resetPack()
			toast.error('Failed to process purchase')
		}
	}

	const handleRipAgain = async () => {
		if (isPending) return
		setIsPending(true)

		try {
			if (flippedCards!.includes(false)) {
				handleFlipAll()
				await new Promise(resolve => setTimeout(resolve, 1000))
			}

			await handleBuyAndOpenPack(selectedPackType)
		} catch (error) {
			toast.error('Cant rip this pack again')
		} finally {
			setIsPending(false)
		}
	}

	const handleSelectPackType = (type: PackType) => {
		if (!isBursting) {
			setSelectedPackType(type)
		}
	}

	return {
		state: {
			coins,
			selectedPackType,
			packPrices,
			autoOpen,
			flippedCards,
			step,
			cards,
		},
		status: { isBursting, isRipAgainPending: isPending },
		functions: {
			handleBuyAndOpenPack,
			handleSelectPackType,
			setAutoOpen,
			handleFlipCard,
			handleFlipAll,
			handleResetPack,
			handleRipAgain,
		},
	}
}
