/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSession } from '@/lib/auth-client'
import { useQueryClient } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { TradeCard } from '../TradeCardsPreview'
import {
	acceptTradeAction,
	declineTradeAction,
	getTradeByIdAction,
	sendTradeAction,
} from '@/lib/actions/trade.actions'
import { toast } from 'sonner'

type ModalTarget = 'sender' | 'receiver' | null

export const useTradeCards = () => {
	const params = useParams()
	const router = useRouter()
	const tradeId = params.tradeId as string

	const queryClient = useQueryClient()

	const session = useSession()
	const currentUserId = session?.data?.user?.id

	const [trade, setTrade] = useState<any>(null)
	const [isLoading, setLoading] = useState(true)
	const [isSending, setSending] = useState(false)
	const [isAccepting, setAccepting] = useState(false)
	const [isDeclining, setDeclining] = useState(false)

	const [senderSelectedCards, setSenderSelectedCards] = useState<TradeCard[]>(
		[],
	)
	const [receiverSelectedCards, setReceiverSelectedCards] = useState<
		TradeCard[]
	>([])

	const [modalTarget, setModalTarget] = useState<ModalTarget>(null)
	const [tempSelectedCards, setTempSelectedCards] = useState<TradeCard[]>([])

	useEffect(() => {
		if (!tradeId) return

		const fetchTrade = async () => {
			try {
				const res = await getTradeByIdAction(tradeId)
				if (res.success && res.result) {
					setTrade(res.result)

					if (res.result.items && res.result.items.length > 0) {
						const senderItems = res.result.items
							.filter((item: any) => item.ownerId === res.result.senderId)
							.map((item: any) => ({
								userCardId: item.userCardId,
								ownerId: item.ownerId,
								cardData: item.userCard.card,
							}))
						const receiverItems = res.result.items
							.filter((item: any) => item.ownerId === res.result.receiverId)
							.map((item: any) => ({
								userCardId: item.userCardId,
								ownerId: item.ownerId,
								cardData: item.userCard.card,
							}))
						setSenderSelectedCards(senderItems)
						setReceiverSelectedCards(receiverItems)
					} else {
						const saved = localStorage.getItem(`trade_${tradeId}`)
						if (saved) {
							const parsed = JSON.parse(saved)
							if (parsed.senderSelectedCards)
								setSenderSelectedCards(parsed.senderSelectedCards)
							if (parsed.receiverSelectedCards)
								setReceiverSelectedCards(parsed.receiverSelectedCards)
						}
					}
				}
			} catch (e) {
				toast.error('Failed to load trade')
			} finally {
				setLoading(false)
			}
		}

		fetchTrade()
	}, [tradeId])

	useEffect(() => {
		if (!tradeId || isLoading || trade?.status !== 'PENDING') return

		const stateToSave = { senderSelectedCards, receiverSelectedCards }
		localStorage.setItem(`trade_${tradeId}`, JSON.stringify(stateToSave))
	}, [
		senderSelectedCards,
		receiverSelectedCards,
		tradeId,
		isLoading,
		trade?.status,
	])

	const toggleCardSelection = (card: TradeCard) => {
		setTempSelectedCards(prevSelectedCards => {
			const isSelected = prevSelectedCards.find(
				selectedCard => selectedCard.userCardId === card.userCardId,
			)
			if (isSelected) {
				return prevSelectedCards.filter(
					selectedCard => selectedCard.userCardId !== card.userCardId,
				)
			}
			if (prevSelectedCards.length < 20) {
				return [...prevSelectedCards, card]
			}
			return prevSelectedCards
		})
	}

	const saveModalSelection = () => {
		if (modalTarget === 'sender') {
			setSenderSelectedCards(tempSelectedCards)
		} else if (modalTarget === 'receiver') {
			setReceiverSelectedCards(tempSelectedCards)
		}
		setModalTarget(null)
	}

	const removeCard = (target: 'sender' | 'receiver', userCardId: string) => {
		if (target === 'sender') {
			setSenderSelectedCards(prevCards =>
				prevCards.filter(card => card.userCardId !== userCardId),
			)
		} else {
			setReceiverSelectedCards(prevCards =>
				prevCards.filter(card => card.userCardId !== userCardId),
			)
		}
	}

	const handleSendTrade = async () => {
		if (
			senderSelectedCards.length === 0 &&
			receiverSelectedCards.length === 0
		) {
			toast.info('Please add at least one card to trade')
			return
		}

		setSending(true)
		const items = [...senderSelectedCards, ...receiverSelectedCards].map(
			card => ({
				userCardId: card.userCardId,
				ownerId: card.ownerId,
			}),
		)

		const res = await sendTradeAction(tradeId, items)
		if (res.success) {
			toast.success('Trade was successfully sent')
			localStorage.removeItem(`trade_${tradeId}`)
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['new-trades'] }),
				queryClient.invalidateQueries({ queryKey: ['received-trades'] }),
				queryClient.invalidateQueries({ queryKey: ['sent-trades'] }),
			])
			router.push('/trades')
		} else {
			toast.error('Error while sending trade')
			setSending(false)
		}
	}

	const handleAcceptTrade = async () => {
		setAccepting(true)
		const res = await acceptTradeAction(tradeId)
		if (res.success) {
			toast.success('Trade successfully accepted')
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['new-trades'] }),
				queryClient.invalidateQueries({ queryKey: ['received-trades'] }),
				queryClient.invalidateQueries({ queryKey: ['sent-trades'] }),
				queryClient.invalidateQueries({ queryKey: ['user-cards'] }),
			])
			router.push('/trades')
			router.refresh()
		} else {
			toast.error('Error while accepting trade')
			setAccepting(false)
		}
	}

	const handleDeclineTrade = async () => {
		setDeclining(true)
		const res = await declineTradeAction(tradeId)
		if (res.success) {
			toast.success('Trade successfully declined')
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['new-trades'] }),
				queryClient.invalidateQueries({ queryKey: ['received-trades'] }),
				queryClient.invalidateQueries({ queryKey: ['sent-trades'] }),
			])
			router.push('/trades')
		} else {
			toast.error('Error while declining trade')
			setDeclining(false)
		}
	}

	const openModal = async (target: 'sender' | 'receiver') => {
		setModalTarget(target)
		setTempSelectedCards(
			target === 'sender' ? senderSelectedCards : receiverSelectedCards,
		)
	}

	const routeBack = () => {
		router.push('/trades')
	}

	const isSender = currentUserId === trade?.sender?.id

	return {
		state: {
			trade,
			tradeId,
			senderSelectedCards,
			receiverSelectedCards,
			session,
			modalTarget,
			tempSelectedCards,
			currentUserId,
		},
		status: { isLoading, isSending, isAccepting, isDeclining, isSender },
		functions: {
			toggleCardSelection,
			saveModalSelection,
			removeCard,
			handleSendTrade,
			handleAcceptTrade,
			handleDeclineTrade,
			openModal,
			routeBack,
			setModalTarget,
		},
	}
}
