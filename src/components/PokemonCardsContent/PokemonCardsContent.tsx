import dynamic from 'next/dynamic'
import SortSelector from '@/components/SortSelector'
import ScrollToTop from '@/components/ScrollToTop'
import PokemonSearchInput from '@/components/PokemonSearchInput'
import FilterSelector from '@/components/FilterSelector'
import PokemonCardList from '@/components/PokemonCardList/PokemonCardList'

const PokemonModal = dynamic(
	() =>
		import('@/components/PokemonCard/PokemonModal').then(
			mod => mod.PokemonModal,
		),
	{ ssr: true },
)

type Props = {
	targetUserId?: string
	scope: 'user' | 'all'
}

const PokemonCardsContent = ({ targetUserId, scope }: Props) => {
	return (
		<div className='flex flex-col items-center w-250 mx-auto mt-20'>
			<div className='flex w-full gap-2'>
				<PokemonSearchInput />

				<SortSelector store='pokemon' />

				<FilterSelector />
			</div>

			<PokemonCardList scope={scope} targetUserId={targetUserId!} />

			<PokemonModal />
			<ScrollToTop />
		</div>
	)
}

export default PokemonCardsContent
