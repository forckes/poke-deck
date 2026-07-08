import PokemonFlipCard from '@/components/PokemonCard/PokemonFlipCard'

export default function Loading() {
	return (
		<div className='flex flex-col items-center w-250 mx-auto mt-20'>
			<div className='flex w-full gap-2'>
				<div className='h-10 w-full rounded-md bg-gray-200/20 animate-pulse' />
				<div className='h-10 w-[180px] rounded-md bg-gray-200/20 animate-pulse' />
			</div>
			<div className='flex flex-col items-center'>
				<div className='grid grid-cols-3 gap-12 mt-4 pt-8 pb-8'>
					{Array.from({ length: 6 }).map((_, i) => (
						<PokemonFlipCard
							key={`loading-more-${i}`}
							isFlipped={false}
							isLoading={true}
						>
							{null}
						</PokemonFlipCard>
					))}
				</div>
			</div>
		</div>
	)
}
