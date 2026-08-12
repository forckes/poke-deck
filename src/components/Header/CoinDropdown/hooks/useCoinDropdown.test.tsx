import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useCoinStore } from '@/store/useCoinStore'
import {
	claimHourlyRewardAction,
	getHourlyRewardStatusAction,
	getUserCoinsAction,
} from '@/lib/actions/coin.actions'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useCoinDropdown } from './useCoinDropdown'
import { toast } from 'sonner'

vi.mock('@/store/useCoinStore', () => ({
	useCoinStore: vi.fn(),
}))

vi.mock('@/lib/actions/coin.actions', () => ({
	getUserCoinsAction: vi.fn(),
	getHourlyRewardStatusAction: vi.fn(),
	claimHourlyRewardAction: vi.fn(),
}))

vi.mock('sonner', () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}))

describe('useCoinDropdown', () => {
	let queryClient: QueryClient
	const mockSetCoins = vi.fn()
	const userId = 'user-123'

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

		vi.mocked(useCoinStore).mockImplementation(selector =>
			selector({
				coins: 0,
				setCoins: mockSetCoins,
			} as never),
		)
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it('should initialize and fetch initial coins and reward status', async () => {
		vi.mocked(getUserCoinsAction).mockResolvedValueOnce({
			coins: 500,
		})
		vi.mocked(getHourlyRewardStatusAction).mockResolvedValueOnce({
			canClaim: false,
			secondsRemaining: 3600,
		})

		const { result } = renderHook(() => useCoinDropdown(userId), {
			wrapper: createWrapper(),
		})

		await waitFor(() => {
			expect(mockSetCoins).toHaveBeenCalledWith(500)
		})

		expect(result.current.state.secondsRemaining).toBe(3600)
		expect(result.current.state.coins).toBe(0)
	})

	it('should format seconds into HH:MM:SS format correctly', () => {
		const { result } = renderHook(() => useCoinDropdown(userId), {
			wrapper: createWrapper(),
		})

		const { formatTime } = result.current.functions

		expect(formatTime(0)).toBe('00:00:00')
		expect(formatTime(65)).toBe('00:01:05')
		expect(formatTime(3661)).toBe('01:01:01')
	})

	it('should decrement secondsRemaining every second', async () => {
		vi.mocked(getUserCoinsAction).mockResolvedValueOnce({
			coins: 0,
		})
		vi.mocked(getHourlyRewardStatusAction).mockResolvedValueOnce({
			canClaim: false,
			secondsRemaining: 5,
		})

		vi.useFakeTimers()

		const { result } = renderHook(() => useCoinDropdown(userId), {
			wrapper: createWrapper(),
		})

		await act(async () => {
			await vi.advanceTimersByTimeAsync(0)
		})

		expect(result.current.state.secondsRemaining).toBe(5)

		await act(async () => {
			await vi.advanceTimersByTimeAsync(3000)
		})

		expect(result.current.state.secondsRemaining).toBe(2)
	})

	it('should handle reward claim successfully', async () => {
		vi.mocked(getUserCoinsAction)
			.mockResolvedValueOnce({ coins: 0 })
			.mockResolvedValueOnce({ coins: 200 })

		vi.mocked(getHourlyRewardStatusAction).mockResolvedValueOnce({
			canClaim: true,
			secondsRemaining: 0,
		})
		vi.mocked(claimHourlyRewardAction).mockResolvedValueOnce({
			success: true,
		})

		const { result } = renderHook(() => useCoinDropdown(userId), {
			wrapper: createWrapper(),
		})

		await waitFor(() => {
			expect(result.current.state.secondsRemaining).toBe(0)
		})

		await act(async () => {
			await result.current.functions.handleClaimReward()
		})

		expect(claimHourlyRewardAction).toHaveBeenCalled()
		expect(toast.success).toHaveBeenCalledWith('Successfully claimed 200 coins')

		await waitFor(() => {
			expect(mockSetCoins).toHaveBeenCalledWith(200)
		})
	})

	it('should show error toast when claim action fails', async () => {
		vi.mocked(getHourlyRewardStatusAction).mockResolvedValueOnce({
			canClaim: true,
			secondsRemaining: 0,
		})
		vi.mocked(claimHourlyRewardAction).mockResolvedValueOnce({
			success: false,
			error: 'Reward already claimed',
		})

		const { result } = renderHook(() => useCoinDropdown(userId), {
			wrapper: createWrapper(),
		})

		await waitFor(() => {
			expect(result.current.state.secondsRemaining).toBe(0)
		})

		await act(async () => {
			await result.current.functions.handleClaimReward()
		})

		expect(toast.error).toHaveBeenCalledWith('Reward already claimed')
	})
})
