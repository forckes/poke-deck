import { getFilteredCardsAction } from '@/lib/actions/sort.actions'
import { useSession } from '@/lib/auth-client'
import { usePokemonSortStore } from '@/store/PokemonSortStore'
import { usePokemonFilterStore } from '@/store/usePokemonFilterStore'
import { usePokemonStore } from '@/store/usePokemonStore'
import { useInfiniteQuery } from '@tanstack/react-query'

export const usePokemonCardList = (
	scope: 'user' | 'all',
	targetUserId?: string,
) => {
	const { data: session } = useSession()
	const userId = targetUserId ? targetUserId : session?.user?.id

	const { field, order } = usePokemonSortStore()
	const { filters } = usePokemonFilterStore()
	const { searchQuery, selectedModalCard, setSelectedModalCard } =
		usePokemonStore()

	const {
		data,
		status,
		error,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useInfiniteQuery({
		queryKey: ['user-cards', scope, userId, field, order, searchQuery, filters],
		initialPageParam: 0,
		queryFn: ({ pageParam }) =>
			getFilteredCardsAction(
				scope,
				userId!,
				field,
				order,
				9,
				pageParam as number,
				searchQuery,
				filters,
			),
		gcTime: 1000 * 60 * 1,
		staleTime: 1000 * 60,
		getNextPageParam: lastPage =>
			(lastPage as { nextCursor: number | null }).nextCursor ?? undefined,
		enabled: !!userId,
		refetchOnWindowFocus: false,
	})

	const isLoading = status === 'pending'
	const isError = status === 'error'
	const isSuccess = status === 'success'

	const isFlipped = isSuccess

	const cards = data?.pages.flatMap(page => page.cards) ?? []

	const cardsToRender = isLoading
		? Array.from({ length: 6 }, () => null)
		: cards

	const obtainedCardCount =
		data?.pages.flatMap(p => p.obtainedCount ?? 0)[0] ?? 0

	const totalCardCount = data?.pages.flatMap(p => p.totalCount ?? 0)[0] ?? 0

	return {
		state: {
			selectedModalCard,
			error,
			cardsToRender,
			cards,
			searchQuery,
			obtainedCardCount,
			totalCardCount,
		},
		status: {
			isError,
			isFlipped,
			isSuccess,
			isLoading,
			isFetchingNextPage,
			hasNextPage,
		},
		functions: { setSelectedModalCard, fetchNextPage },
	}
}
