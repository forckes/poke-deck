/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSession } from '@/lib/auth-client'
import {
	acceptTradeAction,
	declineTradeAction,
	getTradeByIdAction,
	sendTradeAction,
} from '@/lib/actions/trade.actions'
import { act, renderHook, waitFor } from '@testing-library/react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useTradeCards } from './useTradeCards'
import { RedIntegerFormat } from 'three'

const mockInvalidateQueries = vi.fn()
vi.mock('@tanstack/react-query', async importOriginal => {
	const actual = await importOriginal<typeof import('@tanstack/react-query')>()
	return {
		...actual,
		useQueryClient: () => ({
			invalidateQueries: mockInvalidateQueries,
		}),
	}
})

vi.mock('next/navigation', () => ({
	useParams: vi.fn(),
	useRouter: vi.fn(),
}))

vi.mock('@/lib/auth-client', () => ({
	useSession: vi.fn(),
}))

vi.mock('@/lib/actions/trade.actions', () => ({
	getTradeByIdAction: vi.fn(),
	acceptTradeAction: vi.fn(),
	declineTradeAction: vi.fn(),
	sendTradeAction: vi.fn(),
}))

vi.mock('sonner', () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
		info: vi.fn(),
	},
}))

describe('useTradeCards', () => {
	const mockPush = vi.fn()
	const mockRefresh = vi.fn()

	const mockTrade = {
		id: 'trade-1',
		status: 'PENDING',
		senderId: 'user-1',
		receiverId: 'user-2',
		sender: { id: 'user-1' },
		items: [] as any[],
	}

	beforeEach(() => {
		vi.resetAllMocks()
		localStorage.clear()

		vi.mocked(useParams).mockReturnValue({ tradeId: 'trade-1' } as any)
		vi.mocked(useRouter).mockReturnValue({
			push: mockPush,
			refresh: mockRefresh,
		} as any)
		vi.mocked(useSession).mockReturnValue({
			data: { user: { id: 'user-1' } },
		} as any)

		vi.mocked(getTradeByIdAction).mockResolvedValue({
			success: true,
			result: mockTrade,
		} as any)
	})

	afterEach(() => {
		localStorage.clear()
	})

	it('should load trade and set isLoading to false on success', async () => {
		const { result } = renderHook(() => useTradeCards())

		expect(result.current.status.isLoading).toBe(true)

		await waitFor(() => {
			expect(result.current.status.isLoading).toBe(false)
		})

		expect(getTradeByIdAction).toHaveBeenCalledWith('trade-1')
		expect(result.current.state.trade).toEqual(mockTrade)
		expect(result.current.status.isSender).toBe(true)
	})

	it('should split items into sender and receiver selected cards', async () => {
		vi.mocked(getTradeByIdAction).mockResolvedValue({
			success: true,
			result: {
				...mockTrade,
				items: [
					{
						userCardId: 'uc-1',
						ownerId: 'user-1',
						userCard: { card: { id: 'card-1' } },
					},
					{
						userCardId: 'uc-2',
						ownerId: 'user-2',
						userCard: { card: { id: 'card-2' } },
					},
				],
			},
		} as any)

		const { result } = renderHook(() => useTradeCards())

		await waitFor(() => {
			expect(result.current.status.isLoading).toBe(false)
		})

		expect(result.current.state.senderSelectedCards).toEqual([
			{ userCardId: 'uc-1', ownerId: 'user-1', cardData: { id: 'card-1' } },
		])
		expect(result.current.state.receiverSelectedCards).toEqual([
			{ userCardId: 'uc-2', ownerId: 'user-2', cardData: { id: 'card-2' } },
		])
	})

	it('should restore selection from localStorage when trade has no items', async () => {
		localStorage.setItem(
			'trade_trade-1',
			JSON.stringify({
				senderSelectedCards: [{ userCardId: 'uc-9', ownerId: 'user-1' }],
				receiverSelectedCards: [],
			}),
		)

		const { result } = renderHook(() => useTradeCards())

		await waitFor(() => {
			expect(result.current.status.isLoading).toBe(false)
		})

		expect(result.current.state.senderSelectedCards).toEqual([
			{ userCardId: 'uc-9', ownerId: 'user-1' },
		])
	})

	it('should show an error toast when loading the trade fails', async () => {
		vi.mocked(getTradeByIdAction).mockRejectedValue(new Error('network error'))

		const { result } = renderHook(() => useTradeCards())

		await waitFor(() => {
			expect(result.current.status.isLoading).toBe(false)
		})

		expect(toast.error).toHaveBeenCalledWith('Failed to load trade')
		expect(result.current.state.trade).toBeNull()
	})

	it('should toggle card selection in the modal, respecting the 20-card cap', async () => {
		const { result } = renderHook(() => useTradeCards())

		await waitFor(() => {
			expect(result.current.status.isLoading).toBe(false)
		})

		const card = { userCardId: 'uc-1', ownerId: 'user-1', cardData: {} as any }

		act(() => {
			result.current.functions.openModal('sender')
		})
		expect(result.current.state.modalTarget).toBe('sender')

		act(() => {
			result.current.functions.toggleCardSelection(card)
		})
		expect(result.current.state.tempSelectedCards).toEqual([card])

		act(() => {
			result.current.functions.toggleCardSelection(card)
		})
		expect(result.current.state.tempSelectedCards).toEqual([])
	})

	it('should save modal selection into senderSelectedCards and close the modal', async () => {
		const { result } = renderHook(() => useTradeCards())

		await waitFor(() => {
			expect(result.current.status.isLoading).toBe(false)
		})

		const card = { userCardId: 'uc-1', ownerId: 'user-1', cardData: {} as any }

		act(() => {
			result.current.functions.openModal('sender')
		})

		act(() => {
			result.current.functions.toggleCardSelection(card)
		})

		act(() => {
			result.current.functions.saveModalSelection()
		})

		expect(result.current.state.modalTarget).toBeNull()
		expect(result.current.state.senderSelectedCards).toEqual([card])
	})

	it('should remove a card from the sender selection', async () => {
		vi.mocked(getTradeByIdAction).mockResolvedValue({
			success: true,
			result: {
				...mockTrade,
				items: [
					{
						userCardId: 'uc-1',
						ownerId: 'user-1',
						userCard: { card: { id: 'card-1' } },
					},
				],
			},
		} as any)

		const { result } = renderHook(() => useTradeCards())

		await waitFor(() => {
			expect(result.current.status.isLoading).toBe(false)
		})

		act(() => {
			result.current.functions.removeCard('sender', 'uc-1')
		})

		expect(result.current.state.senderSelectedCards).toEqual([])
	})

	it('should send the trade, invalidate queries, clear localStorage, and navigate on success', async () => {
		vi.mocked(getTradeByIdAction).mockResolvedValue({
			success: true,
			result: {
				...mockTrade,
				items: [
					{
						userCardId: 'uc-1',
						ownerId: 'user-1',
						userCard: { card: { id: 'card-1' } },
					},
				],
			},
		} as any)
		vi.mocked(sendTradeAction).mockResolvedValue({ success: true } as any)

		localStorage.setItem('trade_trade-1', JSON.stringify({ a: 1 }))

		const { result } = renderHook(() => useTradeCards())

		await waitFor(() => {
			expect(result.current.status.isLoading).toBe(false)
		})

		await act(async () => {
			await result.current.functions.handleSendTrade()
		})

		expect(sendTradeAction).toHaveBeenCalledWith('trade-1', [
			{ userCardId: 'uc-1', ownerId: 'user-1' },
		])
		expect(toast.success).toHaveBeenCalledWith('Trade was successfully sent')
		expect(localStorage.getItem('trade_trade-1')).toBeNull()
		expect(mockInvalidateQueries).toHaveBeenCalledWith({
			queryKey: ['new-trades'],
		})
		expect(mockInvalidateQueries).toHaveBeenCalledWith({
			queryKey: ['received-trades'],
		})
		expect(mockInvalidateQueries).toHaveBeenCalledWith({
			queryKey: ['sent-trades'],
		})
		expect(mockPush).toHaveBeenCalledWith('/trades')
	})

	it('should show an error toast and reset isSending when sending the trade fails', async () => {
		vi.mocked(getTradeByIdAction).mockResolvedValue({
			success: true,
			result: {
				...mockTrade,
				items: [
					{
						userCardId: 'uc-1',
						ownerId: 'user-1',
						userCard: { card: { id: 'card-1' } },
					},
				],
			},
		} as any)
		vi.mocked(sendTradeAction).mockResolvedValue({ success: false } as any)

		const { result } = renderHook(() => useTradeCards())

		await waitFor(() => {
			expect(result.current.state.senderSelectedCards).toHaveLength(1)
		})

		await act(async () => {
			await result.current.functions.handleSendTrade()
		})

		expect(toast.error).toHaveBeenCalledWith('Error while sending trade')
		expect(result.current.status.isSending).toBe(false)
		expect(mockPush).not.toHaveBeenCalledWith('/trades')
	})

	it('should accept the trade, invalidate queries including user-cards, and refresh', async () => {
		vi.mocked(acceptTradeAction).mockResolvedValueOnce({
			success: true,
		} as any)

		const { result } = renderHook(() => useTradeCards())

		await waitFor(() => {
			expect(result.current.status.isLoading).toBe(false)
		})

		await act(async () => {
			await result.current.functions.handleAcceptTrade()
		})

		expect(acceptTradeAction).toHaveBeenCalledWith('trade-1')
		expect(toast.success).toHaveBeenCalledWith('Trade successfully accepted')
		expect(mockInvalidateQueries).toHaveBeenCalledWith({
			queryKey: ['user-cards'],
		})
		expect(mockPush).toHaveBeenCalledWith('/trades')
		expect(mockRefresh).toHaveBeenCalled()
	})

	it('should show an error toast and reset isAccepting when accepting fails', async () => {
		vi.mocked(acceptTradeAction).mockResolvedValue({ success: false } as any)

		const { result } = renderHook(() => useTradeCards())

		await waitFor(() => {
			expect(result.current.status.isLoading).toBe(false)
		})

		await act(async () => {
			await result.current.functions.handleAcceptTrade()
		})

		expect(toast.error).toHaveBeenCalledWith('Error while accepting trade')
		expect(result.current.status.isAccepting).toBe(false)
	})

	it('should decline the trade, invalidate queries, and navigate on success', async () => {
		vi.mocked(declineTradeAction).mockResolvedValue({ success: true } as any)

		const { result } = renderHook(() => useTradeCards())

		await waitFor(() => {
			expect(result.current.status.isLoading).toBe(false)
		})

		await act(async () => {
			await result.current.functions.handleDeclineTrade()
		})

		expect(declineTradeAction).toHaveBeenCalledWith('trade-1')
		expect(toast.success).toHaveBeenCalledWith('Trade successfully declined')
		expect(mockPush).toHaveBeenCalledWith('/trades')
	})

	it('should navigate to /trades when routeBack is called', async () => {
		const { result } = renderHook(() => useTradeCards())

		await waitFor(() => {
			expect(result.current.status.isLoading).toBe(false)
		})

		act(() => {
			result.current.functions.routeBack()
		})

		expect(mockPush).toHaveBeenCalledWith('/trades')
	})
})
