import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
	getAdminTradesAction,
	cancelTradeAction,
	getUserTradesAction,
	searchAdminUsersAction,
} from '@/lib/actions/admin.actions'

export const useAdminTrades = () => {
	const [allTradesPage, setAllTradesPage] = useState(1)
	const [activeSubTab, setActiveSubTab] = useState<'all' | 'search'>('all')

	const [userSearchQuery, setUserSearchQuery] = useState('')
	const [showUserAutocomplete, setShowUserAutocomplete] = useState(false)
	const [userAutocompleteResults, setUserAutocompleteResults] = useState<any[]>([])
	const [selectedUser, setSelectedUser] = useState<any | null>(null)
	const [userTrades, setUserTrades] = useState<any[]>([])
	const [isSearchingUser, setIsSearchingUser] = useState(false)
	const [isSearchingTrades, setIsSearchingTrades] = useState(false)

	const [cancellingTradeId, setCancellingTradeId] = useState<string | null>(null)

	const userAutocompleteRef = useRef<HTMLDivElement>(null)

	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ['admin-all-trades', allTradesPage],
		queryFn: () => getAdminTradesAction(allTradesPage, 20),
		enabled: activeSubTab === 'all',
	})

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				userAutocompleteRef.current &&
				!userAutocompleteRef.current.contains(event.target as Node)
			) {
				setShowUserAutocomplete(false)
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	useEffect(() => {
		if (!userSearchQuery.trim()) {
			setUserAutocompleteResults([])
			return
		}

		const fetchAutocomplete = async () => {
			const res = await searchAdminUsersAction(userSearchQuery)
			setUserAutocompleteResults(res.users)
		}

		const timer = setTimeout(() => {
			fetchAutocomplete()
		}, 200)

		return () => clearTimeout(timer)
	}, [userSearchQuery])

	const handleSearchUser = async (e?: React.FormEvent) => {
		if (e) e.preventDefault()
		if (!userSearchQuery.trim()) return

		setShowUserAutocomplete(false)
		setIsSearchingUser(true)
		try {
			const res = await searchAdminUsersAction(userSearchQuery)
			if (res.users.length > 0) {
				handleSelectUser(res.users[0])
			} else {
				toast.error('No user found')
			}
		} catch (error) {
			toast.error('Error finding user')
		} finally {
			setIsSearchingUser(false)
		}
	}

	const handleSelectUser = async (user: any) => {
		setSelectedUser(user)
		setUserSearchQuery(user.username || user.name)
		setShowUserAutocomplete(false)
		setIsSearchingTrades(true)
		try {
			const res = await getUserTradesAction(user.id)
			setUserTrades(res.trades)
		} catch (error) {
			toast.error('Failed to load user trades')
		} finally {
			setIsSearchingTrades(false)
		}
	}

	const handleCancelTrade = async (tradeId: string) => {
		setCancellingTradeId(tradeId)
		try {
			const res = await cancelTradeAction(tradeId)
			if (res.success) {
				toast.success('Trade cancelled successfully')
				if (activeSubTab === 'all') {
					refetch()
				} else if (selectedUser) {
					handleSelectUser(selectedUser)
				}
			}
		} catch (error: any) {
			toast.error(error.message || 'Failed to cancel trade')
		} finally {
			setCancellingTradeId(null)
		}
	}

	const clearUserSearch = () => {
		setUserSearchQuery('')
		setSelectedUser(null)
		setUserTrades([])
		setUserAutocompleteResults([])
		setShowUserAutocomplete(false)
	}

	return {
		state: {
			activeSubTab,
			allTradesPage,
			trades: data?.trades ?? [],
			totalPages: data?.totalPages ?? 0,
			userSearchQuery,
			showUserAutocomplete,
			userAutocompleteResults,
			selectedUser,
			userTrades,
			cancellingTradeId,
		},
		status: {
			isLoading: activeSubTab === 'all' ? isLoading : isSearchingTrades,
			isError: activeSubTab === 'all' ? isError : false,
			isSearchingUser,
			isSearchingTrades,
		},
		functions: {
			setActiveSubTab,
			setAllTradesPage,
			setUserSearchQuery,
			setShowUserAutocomplete,
			handleSearchUser,
			handleSelectUser,
			handleCancelTrade,
			clearUserSearch,
			refetch,
		},
		userAutocompleteRef,
	}
}
