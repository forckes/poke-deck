/* eslint-disable @typescript-eslint/no-explicit-any */
import { getPokemonModalDetailsAction } from '@/lib/actions/pokemon.actions'
import { usePokemonStore } from '@/store/usePokemonStore'
import { getPokemonTypeStyle } from '@/utils/helpers/getPokemonTypeStyle'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { usePokemonModal } from './usePokemonModal'

vi.mock('next/navigation', () => ({
	useRouter: vi.fn(),
}))

vi.mock('@/lib/actions/pokemon.actions', () => ({
	getPokemonModalDetailsAction: vi.fn(),
}))

vi.mock('@/store/usePokemonStore', () => ({
	usePokemonStore: vi.fn(),
}))

vi.mock('@/utils/helpers/getPokemonTypeStyle', () => ({
	getPokemonTypeStyle: vi.fn(),
}))

describe('usePokemonModal', () => {
	let queryClient: QueryClient

	const mockPush = vi.fn()
	const mockSetSelectedModalCard = vi.fn()

	const mockCard = {
		id: 'card-99',
		pokemonId: 'pikachu-25',
	}

	const mockPokemonDetails = {
		data: {
			types: ['Electric'],
			hp: 35,
			attack: 55,
			specialAttack: 50,
			defense: 40,
			speed: 90,
		},
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

		vi.mocked(useRouter).mockReturnValue({
			push: mockPush,
		} as any)

		vi.mocked(usePokemonStore).mockImplementation((selector?: any) => {
			const store = {
				selectedModalCard: mockCard,
				setSelectedModalCard: mockSetSelectedModalCard,
			}
			return selector ? selector(store) : store
		})

		vi.mocked(getPokemonTypeStyle).mockReturnValue({
			bg: 'bg-yellow-500',
			text: 'text-black',
		} as any)

		vi.mocked(getPokemonModalDetailsAction).mockResolvedValue(
			mockPokemonDetails as any,
		)
	})

	it('should disable query fetching when selectedModalCard is null', () => {
		vi.mocked(usePokemonStore).mockImplementation((selector?: any) => {
			const store = {
				selectedModalCard: null,
				setSelectedModalCard: mockSetSelectedModalCard,
			}
			return selector ? selector(store) : store
		})

		const { result } = renderHook(() => usePokemonModal(), {
			wrapper: createWrapper(),
		})

		expect(getPokemonModalDetailsAction).not.toHaveBeenCalled()
		expect(result.current.status.isLoading).toBe(false)
		expect(result.current.state.pokemonData).toBeUndefined()
	})

	it('should fetch modal details and format stats when card is selected', async () => {
		const { result } = renderHook(() => usePokemonModal(), {
			wrapper: createWrapper(),
		})

		await waitFor(() => {
			expect(result.current.status.isLoading).toBe(false)
		})

		expect(getPokemonModalDetailsAction).toHaveBeenCalledWith('pikachu-25')
		expect(getPokemonTypeStyle).toHaveBeenCalledWith(['Electric'])
		expect(result.current.state.typeStyle).toEqual({
			bg: 'bg-yellow-500',
			text: 'text-black',
		})

		expect(result.current.state.pokemonStats).toEqual([
			{ name: 'HP', value: 35 },
			{ name: 'Attack', value: 55 },
			{ name: 'Special Attack', value: 50 },
			{ name: 'Defense', value: 40 },
			{ name: 'Speed', value: 90 },
		])
	})

	it('should call setSelectedModalCard(null) when handleClose is executed', () => {
		const { result } = renderHook(() => usePokemonModal(), {
			wrapper: createWrapper(),
		})

		act(() => {
			result.current.functions.handleClose()
		})

		expect(mockSetSelectedModalCard).toHaveBeenCalledWith(null)
	})

	it('should trigger router.push inside transition when handleModalOpen is called', () => {
		const { result } = renderHook(() => usePokemonModal(), {
			wrapper: createWrapper(),
		})

		act(() => {
			result.current.functions.handleModalOpen()
		})

		expect(mockPush).toHaveBeenCalledWith('/pokemon/card-99')
	})

	it('should reflect error state if query action rejects', async () => {
		vi.mocked(getPokemonModalDetailsAction).mockRejectedValueOnce(
			new Error('Failed to fetch details'),
		)

		const { result } = renderHook(() => usePokemonModal(), {
			wrapper: createWrapper(),
		})

		await waitFor(() => {
			expect(result.current.status.isError).toBe(true)
		})
	})
})
