'use client'

import { motion, AnimatePresence } from 'motion/react'
import { PokemonCard } from './PokemonCard'
import PokemonCardBack from './PokemonCardBack'
import { ArrowRight, Loader2, Sparkles } from 'lucide-react'
import { PokemonMove } from '@/types/pokemon'
import Image from 'next/image'
import PokemonMoveItem from './PokemonMoveItem'
import { Button } from '../ui/button'
import { usePokemonModal } from './hooks/usePokemonModal'
import PokemonSellButton from '../PokemonCardsContent/PokemonSellButton/PokemonSellButton'

export function PokemonModal() {
	const { state, functions, status } = usePokemonModal()

	return (
		<AnimatePresence>
			{state.selectedModalCard && (
				<motion.div
					key={state.selectedModalCard.id}
					initial={{ opacity: 0, pointerEvents: 'none' }}
					animate={{ opacity: 1, pointerEvents: 'auto' }}
					exit={{ opacity: 0, pointerEvents: 'none' }}
					transition={{ pointerEvents: { duration: 0 } }}
					onClick={functions.handleClose}
					className='fixed inset-0 z-100 flex items-center justify-center bg-white/20 backdrop-blur-md p-4'
				>
					<div className='flex flex-col md:flex-row items-center gap-12 max-w-5xl w-full justify-center'>
						<motion.div
							layoutId={`card-${state.selectedModalCard.id}`}
							className='flex-shrink-0 cursor-pointer z-50 perspective-1000'
							onClick={functions.handleClose}
							transition={{ type: 'spring', stiffness: 70, damping: 8 }}
						>
							<motion.div
								initial={{ rotateY: 0, scale: 1 }}
								animate={{ rotateY: 360, scale: 1.3 }}
								exit={{ rotateY: 0, scale: 1, opacity: 0 }}
								transition={{ type: 'spring', stiffness: 70, damping: 15 }}
								className='pointer-events-auto relative w-77.5 h-109.5 preserve-3d origin-center'
							>
								<div className='absolute inset-0 backface-hidden rotate-y-180 z-20 shadow-2xl rounded-xl'>
									<PokemonCardBack />
								</div>
								<div className='absolute inset-0 backface-hidden z-10'>
									<PokemonCard pokemonData={state.selectedModalCard} />
								</div>
							</motion.div>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, x: 50 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: 20 }}
							transition={{ delay: 0.3, duration: 0.4 }}
							className='bg-white/80 dark:bg-black/50 backdrop-blur-xl py-6 px-8 rounded-3xl shadow-2xl border border-white/40 flex-1 max-w-md w-full'
							onClick={e => e.stopPropagation()}
						>
							{status.isLoading ? (
								<div className='flex justify-center items-center h-64'>
									<Loader2 className='w-8 h-8 animate-spin text-primary' />
								</div>
							) : status.isError ||
							  !state.pokemonData?.success ||
							  !state.pokemonData.data ? (
								<div className='flex justify-center items-center h-64 text-red-500'>
									Failed to load details
								</div>
							) : (
								<div className='flex flex-col gap-6 text-gray-800 dark:text-gray-100'>
									<div className='flex justify-between mb-[-20px] items-center'>
										<div className='flex items-center gap-2'>
											<h2 className={`text-3xl font-bold capitalize`}>
												{state.selectedModalCard?.name}
											</h2>
											<div
												className='w-7 h-7 relative border border-black rounded-full'
												style={{ filter: 'brightness(1.8)' }}
											>
												<Image
													src={state.typeStyle.energy}
													sizes='20px'
													alt='energy icon'
													fill
												/>
											</div>
										</div>
										<h2
											className={`text-2xl font-bold capitalize ${state.selectedModalCard?.rarity !== 'COMMON' ? '[text-shadow:none]' : ''}
											${state.selectedModalCard?.rarity === 'EPIC' ? 'shiny-purple' : ''}
											${state.selectedModalCard?.rarity === 'LEGENDARY' ? 'shiny-rainbow' : ''}
											`}
										>
											{state.selectedModalCard?.rarity}
										</h2>
									</div>
									<div className='flex justify-between items-start'>
										<div className='flex flex-col items-start justify-between'>
											<div className='flex justify-between items-start gap-6 mt-2'>
												<div className='flex flex-col items-start justidy-center'>
													<div className='relative w-20 h-20 flex items-center justify-center'>
														<Image
															src={state.pokemonData.data.gif}
															alt={state.selectedModalCard.name}
															fill
															className='object-contain'
														/>
													</div>

													{state.pokemonData.data.heldItems.length > 0 && (
														<div className='flex jusitfy-start gap-1 items-center'>
															<h3 className='font-bold uppercase text-xs text-gray-500'>
																Items
															</h3>
															<div className='flex items-center gap-x-1'>
																{state.pokemonData.data.heldItems.map(item => (
																	<span
																		title={item.name}
																		key={item.id}
																		className='relative w-9 h-9 flex items-center justify-center'
																	>
																		<Image
																			src={item.sprite}
																			alt={item.name}
																			fill
																			className='object-contain'
																		/>
																	</span>
																))}
															</div>
														</div>
													)}

													<div className='flex items-center mt-2 justify-center gap-[1px]'>
														<span className='font-bold uppercase text-xs text-gray-500'>
															EXP
														</span>
														<span className='text-primary/85 font-bold tabular-nums text-sm mx-1'>
															{state.pokemonData.data.baseExperience}
														</span>
														<Sparkles size={16} className='text-primary' />
													</div>
												</div>
											</div>
										</div>

										<div className='flex flex-col gap-1 mt-1 ml-6 w-full'>
											{state.pokemonStats.map(stat => (
												<div key={stat.name} className='flex flex-col gap-1'>
													<div className='flex justify-between items-baseline'>
														<span className='text-[12px] font-medium uppercase tracking-wider text-primary/60'>
															{stat.name}
														</span>
														<span className='text-[14px] font-medium text-primary/85 tabular-nums'>
															{stat.value}
														</span>
													</div>
													<div className='h-[2px] w-full rounded-full bg-primary/10'>
														<div
															className='h-full rounded-full bg-primary/80'
															style={{
																width: `${Math.min(100, ((stat.value ?? 0) / 160) * 100)}%`,
															}}
														/>
													</div>
												</div>
											))}
										</div>
									</div>
									<div>
										<h3 className='font-bold uppercase text-xs text-gray-500 mb-2'>
											Abilities
										</h3>
										<div className='flex flex-wrap gap-2'>
											{state.pokemonData.data.abilities.map(ability => (
												<span
													key={ability}
													className='bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold capitalize'
												>
													{ability.replace('-', ' ')}
												</span>
											))}
										</div>
									</div>

									<div>
										<h3 className='font-bold uppercase text-xs text-gray-500 mb-2'>
											Extended Moves
										</h3>
										{state.pokemonData.data.moves.map((move: PokemonMove) => (
											<PokemonMoveItem
												move={move}
												key={move.id}
												className='mb-2'
												border='border-black'
											/>
										))}
									</div>

									<div className='flex items-center justify-center w-full'>
										<Button
											className='grow group'
											disabled={status.isPending}
											onClick={functions.handleModalOpen}
										>
											{status.isPending ? (
												<Loader2 className='w-5 h-5 animate-spin mr-2' />
											) : (
												<Image
													className='-ml-10'
													src={state.pokemonData.data.buttonImage}
													alt={state.selectedModalCard.name}
													width={42}
													height={42}
												/>
											)}
											Inspect Card
											{!status.isPending && (
												<ArrowRight
													size={16}
													className='transition-transform group-hover:translate-x-1'
												/>
											)}
										</Button>

										<PokemonSellButton />
									</div>
								</div>
							)}
						</motion.div>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	)
}
