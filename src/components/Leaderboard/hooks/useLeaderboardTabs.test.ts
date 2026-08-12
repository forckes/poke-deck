import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useLeaderboardTabs } from './useLeaderboardTabs'
import { LeaderboardCategory, LeaderboardEntry } from '@/types/leaderboard'
import { getLeaderboardAction } from '@/lib/actions/leaderboard.actions'

vi.mock('@/lib/actions/leaderboard.actions', () => ({
	getLeaderboardAction: vi.fn(),
}))

describe('useLeaderboardTabs', () => {
	const mockInitialData: LeaderboardEntry[] = [
		{ id: '1', username: 'Ash', score: 100 } as LeaderboardEntry,
	]
	const mockNewData: LeaderboardEntry[] = [
		{ id: '2', username: 'Red', score: 200 } as LeaderboardEntry,
	]

	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('should initialize with provided initial values', () => {
		const { result } = renderHook(() =>
			useLeaderboardTabs(LeaderboardCategory.TOTAL_CARDS, mockInitialData),
		)

		expect(result.current.state.category).toBe(LeaderboardCategory.TOTAL_CARDS)
		expect(result.current.state.data).toEqual(mockInitialData)
		expect(result.current.status.isPending).toBe(false)
	})

	it('should return correct score labels for each category', () => {
		const { result } = renderHook(() =>
			useLeaderboardTabs(LeaderboardCategory.TOTAL_CARDS, []),
		)
		const { getScoreLabel } = result.current.functions

		expect(getScoreLabel(LeaderboardCategory.TOTAL_CARDS)).toBe('cards')
		expect(getScoreLabel(LeaderboardCategory.LEGENDARY_CARDS)).toBe(
			'legendaries',
		)
		expect(getScoreLabel(LeaderboardCategory.TRADE_COUNT)).toBe('trades')
		// @ts-expect-error fallback check
		expect(getScoreLabel('UNKNOWN')).toBe('score')
	})

	it('should update category and data on successful tab change', async () => {
		vi.mocked(getLeaderboardAction).mockResolvedValueOnce({
			success: true,
			data: mockNewData,
		})

		const { result } = renderHook(() =>
			useLeaderboardTabs(LeaderboardCategory.TOTAL_CARDS, mockInitialData),
		)

		act(() => {
			result.current.functions.handleTabChange(LeaderboardCategory.TRADE_COUNT)
		})

		expect(result.current.state.category).toBe(LeaderboardCategory.TRADE_COUNT)

		await waitFor(() => {
			expect(result.current.state.data).toEqual(mockNewData)
		})

		expect(getLeaderboardAction).toHaveBeenCalledWith(
			LeaderboardCategory.TRADE_COUNT,
		)
		expect(result.current.status.isPending).toBe(false)
	})

	it('should keep old data if server action returns success: false', async () => {
		vi.mocked(getLeaderboardAction).mockResolvedValueOnce({
			success: false,
			error: 'Failed to fetch',
		})

		const { result } = renderHook(() =>
			useLeaderboardTabs(LeaderboardCategory.TOTAL_CARDS, mockInitialData),
		)

		act(() => {
			result.current.functions.handleTabChange(
				LeaderboardCategory.LEGENDARY_CARDS,
			)
		})

		await waitFor(() => {
			expect(result.current.status.isPending).toBe(false)
		})

		expect(result.current.state.category).toBe(
			LeaderboardCategory.LEGENDARY_CARDS,
		)
		expect(result.current.state.data).toEqual(mockInitialData)
	})
})
