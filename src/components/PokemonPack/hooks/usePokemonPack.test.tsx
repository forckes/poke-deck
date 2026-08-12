/* eslint-disable @typescript-eslint/no-explicit-any */
import { PackType } from '@/generated/enums'
import { getPackPriceAction } from '@/lib/actions/coin.actions'
import { useCoinStore } from '@/store/useCoinStore'
import { usePackStore } from '@/store/usePackStore'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { usePokemonPack } from './usePokemonPack'
import { buyAndOpenPackAction } from '@/lib/actions/pack.actions'
import { toast } from 'sonner'

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

vi.mock('@/lib/actions/pack.actions', () => ({
	buyAndOpenPackAction: vi.fn(),
}))

vi.mock('@/lib/actions/coin.actions', () => ({
	getPackPriceAction: vi.fn(),
}))

vi.mock('@/store/useCoinStore', () => ({
	useCoinStore: vi.fn(),
}))

vi.mock('@/store/usePackStore', () => ({
	usePackStore: vi.fn(),
}))

vi.mock('sonner', () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}))

describe('usePokemonPack', () => {
	let queryClient: QueryClient

	const mockAddCoins = vi.fn()
	const mockSubtractCoins = vi.fn()

	const mockStartOpening = vi.fn()
	const mockSetCards = vi.fn()
	const mockFlipCard = vi.fn()
	const mockResetPack = vi.fn()

	let mockCoins = 1000

	const mockPackPrices = {
		[PackType.COMMON]: 50,
		[PackType.EPIC]: 250,
		[PackType.LEGENDARY]: 750,
	}

	const mockPackStore = {
		step: 'idle',
		cards: [{ id: 1 }, { id: 2 }, { id: 3 }],
		flippedCards: [false, false, false],
		startOpening: mockStartOpening,
		setCards: mockSetCards,
		flipCard: mockFlipCard,
		resetPack: mockResetPack,
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
		vi.clearAllMocks()

		mockCoins = 1000
		mockPackStore.step = 'idle'
		mockPackStore.flippedCards = [false, false, false]

		vi.mocked(useCoinStore).mockImplementation(selector =>
			selector({
				coins: mockCoins,
				addCoinsLocal: mockAddCoins,
				subtractCoinsLocal: mockSubtractCoins,
			} as never),
		)

		vi.mocked(usePackStore).mockImplementation((selector?: any) => {
			return selector ? selector(mockPackStore) : mockPackStore
		})

		vi.mocked(getPackPriceAction).mockImplementation(async type => {
			const prices = mockPackPrices
			return { packPrice: { priceInCoins: prices[type] } } as never
		})
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it('should fetch and initialize pack prices on mount', async () => {
		const { result } = renderHook(() => usePokemonPack(), {
			wrapper: createWrapper(),
		})

		await waitFor(() => {
			expect(result.current.state.packPrices).toEqual(mockPackPrices)
		})
	})

	it('should allow changing pack type when not bursting', () => {
		const { result } = renderHook(() => usePokemonPack(), {
			wrapper: createWrapper(),
		})

		expect(result.current.state.selectedPackType).toBe(PackType.COMMON)

		act(() => result.current.functions.handleSelectPackType(PackType.LEGENDARY))

		expect(result.current.state.selectedPackType).toBe(PackType.LEGENDARY)
	})

	it('should successfully buy and open a pack', async () => {
		vi.mocked(buyAndOpenPackAction).mockResolvedValueOnce({
			success: true,
			cards: [{ id: 'card-1' }, { id: 'card-2' }, { id: 'card-3' }] as any,
		})

		const { result } = renderHook(() => usePokemonPack(), {
			wrapper: createWrapper(),
		})

		await waitFor(() => {
			expect(result.current.state.packPrices).toEqual(mockPackPrices)
		})

		await act(async () => {
			await result.current.functions.handleBuyAndOpenPack(PackType.COMMON)
		})

		expect(mockSubtractCoins).toHaveBeenCalledWith(50)
		expect(mockStartOpening).toHaveBeenCalled()
		expect(toast.success).toHaveBeenCalledWith(
			'Successfully bought pack of cards',
		)

		expect(mockSetCards).toHaveBeenCalledWith([
			{ id: 'card-1' },
			{ id: 'card-2' },
			{ id: 'card-3' },
		])

		expect(mockInvalidateQueries).toHaveBeenCalledWith({
			queryKey: ['user-cards'],
		})
		expect(mockInvalidateQueries).toHaveBeenCalledWith({
			queryKey: ['user-coins'],
		})
	})

	it('should handle failed pack purchase and refund coins', async () => {
		vi.mocked(buyAndOpenPackAction).mockResolvedValueOnce({
			success: false,
			error: 'Server error',
		})

		const { result } = renderHook(() => usePokemonPack(), {
			wrapper: createWrapper(),
		})

		await waitFor(() => {
			expect(result.current.state.packPrices).toEqual(mockPackPrices)
		})

		await act(async () => {
			await result.current.functions.handleBuyAndOpenPack(PackType.COMMON)
		})

		expect(mockAddCoins).toHaveBeenCalledWith(50)
		expect(mockResetPack).toHaveBeenCalled()
		expect(toast.error).toHaveBeenCalledWith('Server error')
	})

	it('should prevent buying a pack if user has insufficient coins', async () => {
		mockCoins = 49

		const { result } = renderHook(() => usePokemonPack(), {
			wrapper: createWrapper(),
		})

		await act(async () => {
			await result.current.functions.handleBuyAndOpenPack(PackType.COMMON)
		})

		expect(toast.error).toHaveBeenCalledWith('Not enough coins!')
		expect(mockSubtractCoins).not.toHaveBeenCalled()
	})

	it('should handle handleFlipCard and handleFlipAll correctly', () => {
		mockPackStore.step = 'dealt'

		const { result } = renderHook(() => usePokemonPack(), {
			wrapper: createWrapper(),
		})

		act(() => {
			result.current.functions.handleFlipCard(0)
		})
		expect(mockFlipCard).toHaveBeenCalledWith(0)

		act(() => {
			result.current.functions.handleFlipAll()
		})
		expect(mockFlipCard).toHaveBeenCalledTimes(4)
	})

	it('should auto-open pack when autoOpen is enabled and step is idle', async () => {
		vi.mocked(buyAndOpenPackAction).mockResolvedValue({
			success: true,
			cards: [] as any,
		})

		const { result } = renderHook(() => usePokemonPack(), {
			wrapper: createWrapper(),
		})

		await waitFor(() => {
			expect(result.current.state.packPrices[PackType.COMMON]).toBe(50)
		})

		act(() => {
			result.current.functions.setAutoOpen(true)
		})

		await waitFor(() => {
			expect(mockSubtractCoins).toHaveBeenCalledWith(50)
			expect(mockStartOpening).toHaveBeenCalled()
		})
	})

	it(' should stop auto-open if user runs out of coins', async () => {
		mockCoins = 49

		const { result } = renderHook(() => usePokemonPack(), {
			wrapper: createWrapper(),
		})

		await waitFor(() => {
			expect(result.current.state.packPrices[PackType.COMMON]).toBe(50)
		})

		act(() => {
			result.current.functions.setAutoOpen(true)
		})

		await waitFor(() => {
			expect(result.current.state.autoOpen).toBe(false)
			expect(toast.error).toHaveBeenCalledWith(
				'Auto-open stopped: Not enough coins!',
			)
		})
	})
})
