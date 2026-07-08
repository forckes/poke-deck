import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAdminUsersAction, searchAdminUsersAction } from '@/lib/actions/admin.actions'

export const useAdminUsers = () => {
	const [page, setPage] = useState(1)
	const [searchQuery, setSearchQuery] = useState('')
	const [showAutocomplete, setShowAutocomplete] = useState(false)
	const [autocompleteResults, setAutocompleteResults] = useState<any[]>([])
	const [searchResults, setSearchResults] = useState<any[] | null>(null)
	const [isSearching, setIsSearching] = useState(false)
	const autocompleteRef = useRef<HTMLDivElement>(null)

	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ['admin-users', page],
		queryFn: () => getAdminUsersAction(page, 20),
		enabled: searchResults === null,
	})

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node)) {
				setShowAutocomplete(false)
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	useEffect(() => {
		if (!searchQuery.trim()) {
			setAutocompleteResults([])
			return
		}

		const fetchAutocomplete = async () => {
			const res = await searchAdminUsersAction(searchQuery)
			setAutocompleteResults(res.users)
		}

		const timer = setTimeout(() => {
			fetchAutocomplete()
		}, 200)

		return () => clearTimeout(timer)
	}, [searchQuery])

	const handleSearch = async (e?: React.FormEvent) => {
		if (e) e.preventDefault()
		if (!searchQuery.trim()) return

		setShowAutocomplete(false)
		setIsSearching(true)
		try {
			const res = await searchAdminUsersAction(searchQuery)
			setSearchResults(res.users)
		} catch (error) {
			setSearchResults([])
		} finally {
			setIsSearching(false)
		}
	}

	const handleSelectAutocomplete = async (user: any) => {
		setSearchQuery(user.username || user.name)
		setShowAutocomplete(false)
		setIsSearching(true)
		try {
			const res = await searchAdminUsersAction(user.username || user.name)
			setSearchResults(res.users)
		} catch (error) {
			setSearchResults([])
		} finally {
			setIsSearching(false)
		}
	}

	const clearSearch = () => {
		setSearchQuery('')
		setSearchResults(null)
		setAutocompleteResults([])
		setShowAutocomplete(false)
		setPage(1)
	}

	const refetchBoth = () => {
		if (searchResults !== null) {
			handleSearch()
		} else {
			refetch()
		}
	}

	return {
		state: {
			users: searchResults !== null ? searchResults : (data?.users ?? []),
			totalCount: searchResults !== null ? searchResults.length : (data?.totalCount ?? 0),
			totalPages: searchResults !== null ? 1 : (data?.totalPages ?? 0),
			page,
			searchQuery,
			autocompleteResults,
			searchResults,
			showAutocomplete,
		},
		status: {
			isLoading: searchResults === null ? isLoading : isSearching,
			isError: searchResults === null ? isError : false,
			isSearching,
		},
		functions: {
			setPage,
			refetch: refetchBoth,
			setSearchQuery,
			setShowAutocomplete,
			handleSearch,
			handleSelectAutocomplete,
			clearSearch,
		},
		autocompleteRef,
	}
}
