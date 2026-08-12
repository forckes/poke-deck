/* eslint-disable @typescript-eslint/no-explicit-any */
import { PackType } from '@/generated/enums'
import { getPackPriceAction } from '@/lib/actions/coin.actions'
import { sellPokemonCardAction } from '@/lib/actions/pokemon.actions'
import { useCoinStore } from '@/store/useCoinStore'
import { usePokemonStore } from '@/store/usePokemonStore'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { toast } from 'sonner'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { usePokemonSellButton } from './usePokemonSellButton'

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

vi.mock('@/lib/actions/coin.actions', () => ({
	getPackPriceAction: vi.fn(),
}))

vi.mock('@/lib/actions/pokemon.actions', () => ({
	sellPokemonCardAction: vi.fn(),
}))

vi.mock('@/store/useCoinStore', () => ({
	useCoinStore: vi.fn(),
}))

vi.mock('@/store/usePokemonStore', () => ({
	usePokemonStore: vi.fn(),
}))

vi.mock('sonner', () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
		info: vi.fn(),
	},
}))

describe('usePokemonSellButton', () => {
	let queryClient: QueryClient

	const mockAddCoinsLocal = vi.fn()
	const mockSetSelectedModalCard = vi.fn()

	let mockCoins = 1000
	let mockSelectedCard: any = null

	const mockCard = {
		id: 'card-123',
		rarity: PackType.COMMON,
		isObtained: true,
	}

	const createWrapper = () => {
		queryClient = new QueryClient({
			defaultOptions: {
				queries: { retry: false },
			},
		})
		// eslint-disable-next-line react/display-name
		return ({ children }: { children: React.ReactNode }) => (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		)
	}

	beforeEach(() => {
		vi.resetAllMocks()
		mockCoins = 1000
		mockSelectedCard = mockCard

		vi.mocked(useCoinStore).mockImplementation(selector =>
			selector({
				coins: mockCoins,
				addCoinsLocal: mockAddCoinsLocal,
			} as never),
		)

		vi.mocked(usePokemonStore).mockImplementation((selector?: any) => {
			const store = {
				selectedModalCard: mockSelectedCard,
				setSelectedModalCard: mockSetSelectedModalCard,
			}
			return selector ? selector(store) : store
		})

		vi.mocked(getPackPriceAction).mockResolvedValue({
			packPrice: { priceInCoins: 50 },
		} as never)
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it('should compute initial state and sell price correctly (price / 4 rounded up)', async () => {
		const { result } = renderHook(() => usePokemonSellButton(), {
			wrapper: createWrapper(),
		})

		await waitFor(() => {
			expect(result.current.state.sellPrice).toBe(13)
		})

		expect(result.current.state.hasCard).toBe(true)
		expect(result.current.state.isObtained).toBe(true)
		expect(result.current.state.isConfirming).toBe(false)
		expect(result.current.state.isSelling).toBe(false)
	})

	it('should toggle isConfirming on first click and reset after 3000ms timer', async () => {
		const { result } = renderHook(() => usePokemonSellButton(), {
			wrapper: createWrapper(),
		})

		await waitFor(() => {
			expect(result.current.state.sellPrice).toBe(13)
		})

		vi.useFakeTimers()

		act(() => {
			result.current.functions.handleSellClick()
		})

		expect(result.current.state.isConfirming).toBe(true)

		act(() => {
			vi.advanceTimersByTime(3000)
		})

		expect(result.current.state.isConfirming).toBe(false)
	})

	it('should sell card successfully on second click', async () => {
		vi.mocked(sellPokemonCardAction).mockResolvedValueOnce({
			success: true,
		})

		const { result } = renderHook(() => usePokemonSellButton(), {
			wrapper: createWrapper(),
		})

		await waitFor(() => {
			expect(result.current.state.sellPrice).toBe(13)
		})

		act(() => {
			result.current.functions.handleSellClick()
		})

		expect(result.current.state.isConfirming).toBe(true)

		await act(async () => {
			await result.current.functions.handleSellClick()
		})

		expect(sellPokemonCardAction).toHaveBeenCalledWith('card-123')
		expect(mockAddCoinsLocal).toHaveBeenCalledWith(13)
		expect(mockSetSelectedModalCard).toHaveBeenCalledWith(null)
		expect(toast.success).toHaveBeenCalledWith('Card sold successfully!')
		expect(mockInvalidateQueries).toHaveBeenCalledWith({
			queryKey: ['user-cards'],
		})
		expect(mockInvalidateQueries).toHaveBeenCalledWith({
			queryKey: ['user-coins'],
		})
	})

	it('should prevent selling if local coins + sellPrice exceeds 10,000 limit', async () => {
		vi.mocked(sellPokemonCardAction).mockResolvedValueOnce({
			success: false,
			error: 'Selling this card would exceed your 10,000 coins limit.',
			isNearLimit: true,
		})

		const { result } = renderHook(() => usePokemonSellButton(), {
			wrapper: createWrapper(),
		})

		await waitFor(() => {
			expect(result.current.state.sellPrice).toBe(13)
		})

		mockCoins = 9999

		act(() => {
			result.current.functions.handleSellClick()
		})

		await act(async () => {
			await result.current.functions.handleSellClick()
		})

		expect(toast.info).toHaveBeenCalledWith(
			"You can't sell this card because it will exceed the limit of 10,000 coins.",
		)

		expect(sellPokemonCardAction).not.toHaveBeenCalled()
	})

	it('should prevent selling when card in active trade', async () => {
		vi.mocked(sellPokemonCardAction).mockResolvedValueOnce({
			success: false,
			error: 'This card is currently locked in an active trade',
			isNearLimit: undefined,
		})

		const { result } = renderHook(() => usePokemonSellButton(), {
			wrapper: createWrapper(),
		})

		await waitFor(() => {
			expect(result.current.state.sellPrice).toBe(13)
		})

		act(() => {
			result.current.functions.handleSellClick()
		})

		await act(async () => {
			await result.current.functions.handleSellClick()
		})

		expect(sellPokemonCardAction).toHaveBeenCalledWith('card-123')
		expect(toast.error).toHaveBeenCalledWith(
			'This card is currently locked in an active trade',
		)
	})
})
