/* eslint-disable @typescript-eslint/no-explicit-any */
import { getFilteredCardsAction } from '@/lib/actions/sort.actions'
import { useSession } from '@/lib/auth-client'
import { usePokemonSortStore } from '@/store/PokemonSortStore'
import { usePokemonFilterStore } from '@/store/usePokemonFilterStore'
import { usePokemonStore } from '@/store/usePokemonStore'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { usePokemonCardList } from './usePokemonCardList'

vi.mock('@/lib/actions/sort.actions', () => ({
	getFilteredCardsAction: vi.fn(),
}))

vi.mock('@/lib/auth-client', () => ({
	useSession: vi.fn(),
}))

vi.mock('@/store/PokemonSortStore', () => ({
	usePokemonSortStore: vi.fn(),
}))

vi.mock('@/store/usePokemonFilterStore', () => ({
	usePokemonFilterStore: vi.fn(),
}))

vi.mock('@/store/usePokemonStore', () => ({
	usePokemonStore: vi.fn(),
}))

describe('usePokemonCardList', () => {
	let queryClient: QueryClient

	const mockSetSelectedModalCard = vi.fn()

	const mockCardsPage1 = {
		cards: [{ id: 'card-1' }, { id: 'card-2' }],
		nextCursor: 1,
		obtainedCount: 5,
		totalCount: 150,
	}

	const mockCardsPage2 = {
		cards: [{ id: 'card-3' }, { id: 'card-4' }],
		nextCursor: null,
		obtainedCount: 5,
		totalCount: 150,
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

		vi.mocked(useSession).mockReturnValue({
			data: { user: { id: 'session-user-123' } },
		} as any)

		vi.mocked(usePokemonSortStore).mockReturnValue({
			field: 'name',
			order: 'asc',
		} as any)

		vi.mocked(usePokemonFilterStore).mockReturnValue({
			filters: { type: 'electric' },
		} as any)

		vi.mocked(usePokemonStore).mockReturnValue({
			searchQuery: 'Pikachu',
			selectedModalCard: null,
			setSelectedModalCard: mockSetSelectedModalCard,
		} as any)

		vi.mocked(getFilteredCardsAction).mockResolvedValue(mockCardsPage1 as any)
	})

	it('should return 6 skeleton elements while loading', () => {
		vi.mocked(getFilteredCardsAction).mockReturnValue(new Promise(() => {}))

		const { result } = renderHook(() => usePokemonCardList('user'), {
			wrapper: createWrapper(),
		})

		expect(result.current.status.isLoading).toBe(true)
		expect(result.current.state.cardsToRender).toEqual([
			null,
			null,
			null,
			null,
			null,
			null,
		])
		expect(result.current.state.cards).toEqual([])
	})

	it('should fetch and flatten card pages on success', async () => {
		const { result } = renderHook(() => usePokemonCardList('user'), {
			wrapper: createWrapper(),
		})

		await waitFor(() => {
			expect(result.current.status.isSuccess).toBe(true)
		})

		expect(getFilteredCardsAction).toHaveBeenCalledWith(
			'user',
			'session-user-123',
			'name',
			'asc',
			12,
			0,
			'Pikachu',
			{ type: 'electric' },
		)

		expect(result.current.state.cards).toEqual(mockCardsPage1.cards)
		expect(result.current.state.cardsToRender).toEqual(mockCardsPage1.cards)
		expect(result.current.state.obtainedCardCount).toBe(5)
		expect(result.current.state.totalCardCount).toBe(150)
		expect(result.current.status.hasNextPage).toBe(true)
	})

	it('should fetch the next page when fetchNextPage is called', async () => {
		vi.mocked(getFilteredCardsAction)
			.mockResolvedValueOnce(mockCardsPage1 as any)
			.mockResolvedValueOnce(mockCardsPage2 as any)

		const { result } = renderHook(() => usePokemonCardList('all'), {
			wrapper: createWrapper(),
		})

		await waitFor(() => {
			expect(result.current.status.isSuccess).toBe(true)
		})

		await act(async () => {
			await result.current.functions.fetchNextPage()
		})

		await waitFor(() => {
			expect(result.current.status.hasNextPage).toBe(false)
		})

		expect(getFilteredCardsAction).toHaveBeenLastCalledWith(
			'all',
			'session-user-123',
			'name',
			'asc',
			12,
			1,
			'Pikachu',
			{ type: 'electric' },
		)

		expect(result.current.state.cards).toEqual([
			{ id: 'card-1' },
			{ id: 'card-2' },
			{ id: 'card-3' },
			{ id: 'card-4' },
		])
	})

	it('should override session user ID if targetUserId is explicitly provided', async () => {
		const customUserId = 'custom-target-user-456'

		const { result } = renderHook(
			() => usePokemonCardList('user', customUserId),
			{
				wrapper: createWrapper(),
			},
		)

		await waitFor(() => {
			expect(result.current.status.isSuccess).toBe(true)
		})

		expect(getFilteredCardsAction).toHaveBeenCalledWith(
			'user',
			'custom-target-user-456',
			'name',
			'asc',
			12,
			0,
			'Pikachu',
			{ type: 'electric' },
		)
	})

	it('should handle error state if server action fails', async () => {
		const mockError = new Error('Failed to load card list')
		vi.mocked(getFilteredCardsAction).mockRejectedValueOnce(mockError)

		const { result } = renderHook(() => usePokemonCardList('user'), {
			wrapper: createWrapper(),
		})

		await waitFor(() => {
			expect(result.current.status.isError).toBe(true)
		})

		expect(result.current.state.error).toBeTruthy()
		expect(result.current.state.cards).toEqual([])
	})
})
