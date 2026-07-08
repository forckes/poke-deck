'use client'

import PokemonFlipCard from '../PokemonCard/PokemonFlipCard'
import { PokemonCard } from '../PokemonCard/PokemonCard'
import { PackType } from '@/generated/enums'
import { VacuumParticles } from '../ParticleEffects/VacuumParticles'
import Image from 'next/image'
import { FastForward, RefreshCw, Share2, X, Zap } from 'lucide-react'
import { usePokemonPack } from './hooks/usePokemonPack'

type Props = {
	state: ReturnType<typeof usePokemonPack>['state']
	status: ReturnType<typeof usePokemonPack>['status']
	functions: ReturnType<typeof usePokemonPack>['functions']
}

export default function PackOpener({ state, status, functions }: Props) {
	return (
		<div className='flex flex-col items-center justify-center min-h-62.5 gap-10 p-4'>
			{(state.step === 'idle' || state.step === 'opening') && (
				<div className='flex flex-col items-center'>
					<button
						onClick={() =>
							functions.handleBuyAndOpenPack(state.selectedPackType)
						}
						disabled={
							state.step === 'opening' ||
							state.packPrices[state.selectedPackType] === null
						}
						className={`relative flex items-center justify-center transition-all duration-300 z-10 ${
							state.step === 'opening' && !status.isBursting ? 'scale-110' : ''
						} ${state.step !== 'opening' ? 'hover:scale-110 active:scale-95' : ''}`}
					>
						<VacuumParticles
							isActive={state.step === 'opening'}
							packType={state.selectedPackType}
						/>
						<div
							className={`w-xl h-152 relative ${
								state.step === 'opening'
									? status.isBursting
										? 'animate-pack-open'
										: 'animate-[shake_0.5s_infinite]'
									: ''
							}`}
						>
							<Image
								src={
									state.selectedPackType === PackType.EPIC
										? '/pack/pack-epic.png'
										: state.selectedPackType === PackType.LEGENDARY
											? '/pack/pack-legendary.png'
											: '/pack/pack-common.png'
								}
								alt={`${state.selectedPackType} Card Pack`}
								className='w-full h-full object-contain drop-shadow-[0_20px_60px_rgba(0,0,0,0.6)] select-none cursor-pointer'
								draggable={false}
								fill
							/>

							{state.step !== 'opening' &&
								state.packPrices[state.selectedPackType] !== undefined &&
								state.packPrices[state.selectedPackType] !== null && (
									<div className='absolute inset-0 flex items-center justify-center pointer-events-none fade-in'>
										<div className='bg-primary/50 backdrop-blur-md rounded-2xl px-6 py-4 flex flex-col items-center justify-center border border-white/20 shadow-xl'>
											<p className='text-white font-black text-3xl mb-1 drop-shadow-md'>
												{state.packPrices[state.selectedPackType]}
											</p>
											<Image
												src='/profile/coin.png'
												alt='Coins'
												className='w-10 h-10 drop-shadow-md'
												draggable={false}
												width={40}
												height={40}
											/>
										</div>
									</div>
								)}
						</div>
					</button>

					<div className='inline-flex font-medium text-sm items-center justify-center rounded-xl bg-primary/20 backdrop-blur-md py-px px-2 border border-white/20 shadow-2xl'>
						Click to open 3 random cards
					</div>
				</div>
			)}

			{(state.step === 'dealt' || state.step === 'finished') && (
				<div
					onClick={functions.handleResetPack}
					className='fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 cursor-default animate-modal-bg'
				>
					<div
						onClick={e => e.stopPropagation()}
						className='flex justify-center gap-12 items-center cursor-default opacity-0 animate-cards-pop'
					>
						{state.cards.map((card, index) => (
							<div
								key={`${card.id}-${index}`}
								onClick={() => functions.handleFlipCard(index)}
								className={`cursor-pointer transition-all duration-300 ${
									!state.flippedCards[index] ? 'hover:-translate-y-6' : ''
								}`}
							>
								<PokemonFlipCard
									isFlipped={state.flippedCards[index]}
									isLoading={false}
								>
									<PokemonCard pokemonData={card} />
								</PokemonFlipCard>
							</div>
						))}
					</div>

					<div
						onClick={e => e.stopPropagation()}
						className='absolute bottom-12 md:bottom-16 bg-primary/20 backdrop-blur-2xl border border-white/20 rounded-xl flex items-center gap-4 shadow-2xl cursor-default opacity-0 animate-cards-pop h-12'
					>
						<button className='text-white hover:text-white bg-transparent text-xs font-bold uppercase transition-colors h-full px-4 rounded-lg hover:bg-white/5 cursor-pointer flex items-center justify-center gap-1'>
							<Share2 size={14} />
							Share
						</button>
						<button
							className={`${state.autoOpen ? 'text-[#7a66ff] hover:text-[#7a66ffd0]' : 'text-white hover:white'} bg-transparent text-xs font-bold uppercase transition-colors h-full px-4 rounded-lg hover:bg-white/5 cursor-pointer flex items-center justify-center gap-1`}
							onClick={() => functions.setAutoOpen(prev => !prev)}
						>
							<RefreshCw
								size={16}
								key={String(state.autoOpen)}
								color={state.autoOpen ? '#7a66ff' : '#ffffff'}
								className='animate-[spin_0.5s_ease-in-out_1]'
							/>
							Auto-Open
						</button>
						<button
							className='text-white hover:text-white bg-transparent text-xs font-bold uppercase transition-colors h-full px-4 rounded-lg hover:bg-white/5 cursor-pointer flex items-center justify-center gap-1'
							disabled={status.isRipAgainPending}
							onClick={() => functions.handleRipAgain()}
						>
							<Zap size={16} />
							Rip Again
						</button>
						<button
							className='text-white hover:text-white bg-transparent text-xs font-bold uppercase transition-colors h-full px-4 rounded-lg hover:bg-white/5 cursor-pointer flex items-center justify-center gap-1'
							onClick={() =>
								state.step === 'finished'
									? functions.handleResetPack()
									: functions.handleFlipAll()
							}
						>
							{state.step === 'finished' ? (
								<X size={18} />
							) : (
								<FastForward size={16} />
							)}
							{state.step === 'finished' ? 'Close' : 'Flip all'}
						</button>
					</div>
				</div>
			)}
		</div>
	)
}
