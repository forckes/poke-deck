import { getPokemonModalDetailsAction } from '@/lib/actions/pokemon.actions'
import { usePokemonStore } from '@/store/usePokemonStore'
import { getPokemonTypeStyle } from '@/utils/helpers/getPokemonTypeStyle'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

export const usePokemonModal = () => {
	const router = useRouter()
	const [isPending, startTransition] = useTransition()
	const { selectedModalCard, setSelectedModalCard } = usePokemonStore()

	const {
		data: pokemonModalData,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ['pokemon-details', selectedModalCard?.pokemonId],
		queryFn: () => getPokemonModalDetailsAction(selectedModalCard!.pokemonId),
		enabled: !!selectedModalCard,
	})

	const typeStyle = getPokemonTypeStyle(pokemonModalData?.data?.types ?? [])

	const handleClose = () => setSelectedModalCard(null)

	const handleModalOpen = () => {
		startTransition(() => {
			router.push(`/pokemon/${selectedModalCard!.id}`)
		})
	}

	const pokemonStats = [
		{ name: 'HP', value: pokemonModalData?.data?.hp },
		{ name: 'Attack', value: pokemonModalData?.data?.attack },
		{ name: 'Special Attack', value: pokemonModalData?.data?.specialAttack },
		{ name: 'Defense', value: pokemonModalData?.data?.defense },
		{ name: 'Speed', value: pokemonModalData?.data?.speed },
	]
	return {
		state: {
			pokemonData: pokemonModalData,
			pokemonStats,
			selectedModalCard,
			typeStyle,
		},
		status: { isLoading, isError, isPending },
		functions: {
			startTransition,
			handleClose,
			handleModalOpen,
		},
	}
}
