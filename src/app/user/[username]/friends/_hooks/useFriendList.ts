import {
	acceptFriendRequestAction,
	getFriendsAction,
	getPendingRequestsAction,
	rejectFriendRequestAction,
	removeFriendAction,
	sendFriendRequestAction,
} from '@/lib/actions/friend.actions'
import { searchUsersAction } from '@/lib/actions/user.actions'
import { useSession } from '@/lib/auth-client'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Params } from 'next/dist/server/request/params'
import { useTransition, useState, useEffect, useRef, FormEvent } from 'react'
import { toast } from 'sonner'

const useFriendList = (params: Params) => {
	const username = params.username

	const session = useSession()

	const currentUsername = session?.data?.user?.username
	const isCurrentUser = currentUsername === username

	const [isPending, startTransition] = useTransition()

	const queryClient = useQueryClient()

	const {
		data: friends,
		isLoading: isFriendsLoading,
		isError: isFriendsError,
	} = useQuery({
		queryKey: ['friends'],
		queryFn: getFriendsAction,
	})

	const {
		data: pendingRequests,
		isLoading: isPendingLoading,
		isError: isPendingError,
	} = useQuery({
		queryKey: ['pending-requests'],
		queryFn: getPendingRequestsAction,
	})

	const handleAccept = (requestId: string) => {
		startTransition(async () => {
			try {
				const result = await acceptFriendRequestAction(requestId)

				if (result.success) {
					toast.success('Friend added')

					await queryClient.invalidateQueries({ queryKey: ['friends'] })
					await queryClient.invalidateQueries({
						queryKey: ['pending-requests'],
					})
				}
			} catch (error) {
				toast.error('Error while accepting')
			}
		})
	}

	const handleReject = (requestId: string) => {
		startTransition(async () => {
			try {
				const result = await rejectFriendRequestAction(requestId)

				if (result.success) {
					toast.success('Successfully rejected')

					await queryClient.invalidateQueries({ queryKey: ['friends'] })
					await queryClient.invalidateQueries({
						queryKey: ['pending-requests'],
					})
				}
			} catch (error) {
				toast.error('Error while rejecting')
			}
		})
	}

	const handleRemove = (requestId: string) => {
		startTransition(async () => {
			try {
				const result = await removeFriendAction(requestId)

				if (result.success) {
					toast.success('Successfully removed')

					await queryClient.invalidateQueries({ queryKey: ['friends'] })
					await queryClient.invalidateQueries({
						queryKey: ['pending-requests'],
					})
				}
			} catch (error) {
				toast.error('Error while removing')
			}
		})
	}

	const [searchQuery, setSearchQuery] = useState('')
	const [autocompleteResults, setAutocompleteResults] = useState<any[]>([])
	const [searchResults, setSearchResults] = useState<any[]>([])
	const [isSearching, setIsSearching] = useState(false)
	const [showAutocomplete, setShowAutocomplete] = useState(false)
	const [actionPending, startActionTransition] = useTransition()

	const autocompleteRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				autocompleteRef.current &&
				!autocompleteRef.current.contains(event.target as Node)
			) {
				setShowAutocomplete(false)
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [])

	useEffect(() => {
		if (searchQuery.trim().length === 0) {
			setAutocompleteResults([])
			return
		}

		const fetchAutocomplete = async () => {
			const res = await searchUsersAction(searchQuery, 5)
			if (res.success) {
				setAutocompleteResults(res.result)
			}
		}

		const timer = setTimeout(() => {
			fetchAutocomplete()
		}, 200)

		return () => clearTimeout(timer)
	}, [searchQuery])

	const handleSearch = async (e: FormEvent) => {
		e.preventDefault()
		if (!searchQuery.trim()) return

		setShowAutocomplete(false)
		setIsSearching(true)
		const res = await searchUsersAction(searchQuery, 10)
		if (res.success) {
			setSearchResults(res.result)
		}
		setIsSearching(false)
	}

	const handleSelectAutocomplete = async (user: any) => {
		setSearchQuery(user.username || user.name)
		setShowAutocomplete(false)
		setIsSearching(true)
		const res = await searchUsersAction(user.username || user.name, 10)
		if (res.success) {
			setSearchResults(res.result)
		}
		setIsSearching(false)
	}

	const refreshSearch = async () => {
		if (searchQuery.trim()) {
			const res = await searchUsersAction(searchQuery, 10)
			if (res.success) {
				setSearchResults(res.result)
			}
		}
	}

	const onAddFriend = async (userId: string) => {
		startActionTransition(async () => {
			try {
				const res = await sendFriendRequestAction(userId)
				if (res.success) {
					await queryClient.invalidateQueries({ queryKey: ['friends'] })
					await queryClient.invalidateQueries({
						queryKey: ['pending-requests'],
					})
					await refreshSearch()
				}

				toast.success('Friend request sent')
			} catch (error) {
				toast.error('Error while sending request')
			}
		})
	}

	return {
		state: {
			username,
			friends,
			pendingRequests,
			searchQuery,
			autocompleteResults,
			searchResults,
		},
		status: {
			isCurrentUser,
			isPending,
			isFriendsLoading,
			isFriendsError,
			isPendingLoading,
			isPendingError,
			isSearching,
			showAutocomplete,
			actionPending,
		},
		functions: {
			startTransition,
			handleAccept,
			handleReject,
			handleRemove,
			setSearchQuery,
			setShowAutocomplete,
			handleSearch,
			handleSelectAutocomplete,
			onAddFriend,
		},
		autocompleteRef,
	}
}

export default useFriendList
