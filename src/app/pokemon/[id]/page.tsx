import React from 'react'
import { Sparkles, ArrowDown } from 'lucide-react'
import Image from 'next/image'
import { PokemonCard } from '@/components/PokemonCard/PokemonCard'
import { Rarity } from '@/generated/enums'
import { getPokemonTypeStyle } from '@/utils/helpers/getPokemonTypeStyle'
import PokemonMovesList from '@/components/PokemonCard/PokemonMovesList'
import RouterSearchInput from '@/components/RouterSearchInput'
import SortSelector from '@/components/SortSelector'
import { BackButton } from '@/components/BackButton'
import { EvolutionRewardButton } from '@/components/PokemonDetailData/EvolutionRewardButton'
import { getPokemonDetailData } from './_hooks/getPokemonDetailData'

export default async function PokemonDetailPage(props: {
	params: Promise<{ id: string }>
	searchParams: Promise<{ query?: string }>
}) {
	const { state } = await getPokemonDetailData(props)

	if (!state?.success) {
		return (
			<div className='p-8 text-center text-red-500 font-bold'>
				Failed to load Pokemon data.
			</div>
		)
	}

	const typeStyle = getPokemonTypeStyle(state.data.types, state.data.rarity)

	return (
		<div className='max-w-5xl mx-auto px-4 py-8'>
			<div className='mb-8'>
				<BackButton />
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch'>
				<div className='col-span-1 lg:col-span-5 mt-14 flex flex-col gap-8 h-full'>
					<div className='w-full flex justify-center'>
						<PokemonCard pokemonData={state.cardData} className='scale-125' />
					</div>

					<div className='bg-white/80 dark:bg-black/50 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/40 mt-14'>
						<h3 className='text-xl font-bold mb-2'>Media Gallery</h3>
						<div className='flex flex-col gap-4'>
							<h4 className='text-xs font-bold text-gray-500 uppercase tracking-wider mb-3'>
								Evolution of Look (Generation)
							</h4>
							<div className='flex flex-wrap gap-2'>
								{state.data.gallerySprites.map(sprite => (
									<div
										key={sprite.generation}
										className='w-24 h-24 bg-gray-100 rounded-lg flex flex-col items-center justify-center text-xs border border-gray-200'
									>
										<Image
											src={sprite.sprite}
											alt={sprite.generation}
											width={60}
											height={60}
										/>
										<span className='text-lg text-primary/80 font-bold'>
											{sprite.generation}
										</span>
									</div>
								))}
							</div>
						</div>
					</div>

					<div className='bg-white/80 dark:bg-black/50 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/40 pb-6'>
						<h3 className='text-xl font-bold mb-4'>Card Evolutions</h3>
						<div className='flex flex-wrap justify-center mt-4'>
							{state.evolutionCards.map((evolution, index) => (
								<React.Fragment key={evolution.id}>
									<div
										className={`transform scale-[0.7] origin-top h-85 w-60 transition-all duration-500 ease-in-out pointer-events-none ${
											!evolution.isObtained
												? 'opacity-40 grayscale hover:opacity-80 hover:grayscale-0'
												: ''
										}`}
									>
										<PokemonCard pokemonData={evolution} />
									</div>
									{index < state.evolutionCards.length - 1 && (
										<div className='w-full flex justify-center -mt-4 mb-4'>
											<ArrowDown className='w-8 h-8 text-primary opacity-80' />
										</div>
									)}
								</React.Fragment>
							))}
						</div>

						{state.chainId > 0 && state.evolutionCards.length > 0 && (
							<EvolutionRewardButton
								chainId={state.chainId}
								pokemonId={state.data.pokemonId}
								rarity={state.data.rarity as Rarity}
								allObtained={state.allObtained}
								alreadyClaimed={state.alreadyClaimed}
								coinsAmount={state.coinsAmount!}
							/>
						)}
					</div>
				</div>

				<div className='col-span-1 lg:col-span-7 flex flex-col gap-8 h-full'>
					<div className='bg-white/80 dark:bg-black/50 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/40'>
						<div className='flex justify-between items-center mb-6'>
							<div className='flex flex-col items-start justify-center'>
								<h1 className='text-5xl font-bold capitalize'>
									{state.data.name}
								</h1>
								<div className='flex gap-1 mt-2'>
									{typeStyle.allTypes.map(
										(type: { name: string; energy: string }) => (
											<div
												key={type.name}
												className='w-10 h-10 relative border border-black rounded-full'
												style={{ filter: 'brightness(1.3)' }}
											>
												<Image
													src={type.energy}
													sizes='20px'
													alt='energy icon'
													fill
												/>
											</div>
										),
									)}
								</div>
							</div>
							<div className='flex flex-col items-end gap-2'>
								<h2
									className={`text-3xl font-extrabold uppercase ${state.data.rarity === 'EPIC' ? 'shiny-purple' : ''}
							${state.data.rarity === 'LEGENDARY' ? 'shiny-rainbow' : ''}`}
								>
									{state.data.rarity}
								</h2>
								<div className='flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full'>
									<span className='text-xs font-bold text-gray-500 uppercase'>
										EXP
									</span>
									<span className='font-bold tabular-nums text-primary'>
										101
									</span>
									<Sparkles size={14} className='text-primary' />
								</div>
							</div>
						</div>

						<div className='flex flex-col items-start justify-center gap-6 mt-8 p-6 bg-white/40 dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-gray-800'>
							<div className='flex flex-col items-start justify-center gap-2'>
								<h4 className='text-xs font-bold text-gray-500 uppercase tracking-wider mb-2'>
									Abilities
								</h4>
								<div className='space-y-3'>
									{state.data.abilities.map(ability => (
										<div
											key={ability.name}
											className='text-sm flex items-center justify-start'
										>
											<span className='bg-primary/10 text-primary px-3 py-1 rounded-full text-xs  font-bold capitalize'>
												{ability.name}
											</span>
											<p className='text-gray-600 flex-2 dark:text-gray-300 leading-relaxed font-medium ml-2'>
												{ability.description}
											</p>
										</div>
									))}
								</div>
							</div>
							<div className='flex flex-col items-start justify-center gap-2'>
								<h4 className='text-xs font-bold text-gray-500 uppercase tracking-wider mb-2'>
									Held Items
								</h4>
								{state.data.heldItems.length < 1 && (
									<p className='text-gray-600 dark:text-gray-300 leading-relaxed font-medium text-primary font-semibold ml-2'>
										No held items
									</p>
								)}
								<div className='space-y-3'>
									{state.data.heldItems.map(item => (
										<div key={item.name} className='text-sm'>
											<div className='flex items-center gap-2 mb-1'>
												<div className='w-10 h-10 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full'>
													<Image
														src={item.sprite}
														alt={item.name}
														width={38}
														height={38}
													/>
												</div>
												<span className='font-bold capitalize text-primary'>
													{item.name}
												</span>
											</div>
											<p className='text-gray-600 dark:text-gray-300 leading-relaxed font-medium'>
												{item.description}
											</p>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>

					<div className='bg-white/80 dark:bg-black/50 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/40'>
						<h3 className='text-xl font-bold mb-8'>Base Stats</h3>

						<div className='flex flex-col gap-5 w-full'>
							{state.data.stats.map(stat => (
								<div
									key={stat.name}
									className='flex gap-2 justify-start items-center'
								>
									<div className='flex items-center gap-2'>
										<div
											className={`w-12 h-12 flex items-center justify-center rounded-full ${stat.className}`}
										>
											<Image
												src={stat.image}
												alt={stat.name}
												width={40}
												height={40}
											/>
										</div>
									</div>

									<div key={stat.value} className='flex-1 flex flex-col gap-1'>
										<div className='flex justify-between items-baseline'>
											<span className='font-bold capitalize text-xs text-primary/80 uppercase tracking-wider'>
												{stat.name}
											</span>
											<span className='text-lg font-bold text-primary tabular-nums'>
												{stat.value}
											</span>
										</div>
										<div className='h-2 w-full rounded-full bg-primary/10 overflow-hidden shadow-inner'>
											<div
												className='h-full rounded-full bg-primary/80 transition-all duration-1000 ease-out relative'
												style={{
													width: `${Math.min(100, ((stat.value ?? 0) / 160) * 100)}%`,
												}}
											>
												<div className='absolute inset-0 bg-white/20 w-full h-full' />
											</div>
										</div>
									</div>
								</div>
							))}
						</div>

						<div className='mt-8 pt-6 border-t border-gray-200 dark:border-white/10'>
							<h4 className='text-xs font-bold text-gray-500 uppercase tracking-wider mb-4'>
								Effort Values Yield
							</h4>
							<div className='flex flex-wrap gap-3'>
								{state.data.evYields.map(ev => (
									<span
										key={ev.stat}
										className='px-4 py-2 bg-[var(--primary)]/10 text-[var(--primary)] dark:bg-[var(--primary)]/20 dark:text-[var(--primary)] rounded-xl text-sm font-bold border border-[var(--primary)]/20 uppercase'
									>
										{ev.stat}: +{ev.effort}
									</span>
								))}
							</div>
						</div>
					</div>

					<div className='bg-white/80 dark:bg-black/50 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/40 flex-1 flex flex-col'>
						<h3 className='text-xl font-bold mb-8'>Move Repository</h3>
						<div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4'>
							<div className='flex items-center gap-3 w-full md:w-auto'>
								<div className='relative flex-1 md:w-64'>
									<RouterSearchInput />
								</div>
								<SortSelector store='moves' />
							</div>
						</div>

						<div className='flex-1 relative min-h-62.5 w-full'>
							<div className='absolute inset-0 overflow-y-auto pr-4 space-y-10 custom-scrollbar pb-6'>
								<PokemonMovesList moves={state.filteredMoves} />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
