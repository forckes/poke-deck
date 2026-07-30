'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { motion } from 'framer-motion'
import GradientText from '../GradientText'
import LogoLoop from '../LogoLoop'
import PokemonCardBack from '../PokemonCard/PokemonCardBack'
import PokemonFlipCard from '../PokemonCard/PokemonFlipCard'
import { PokemonCard } from '../PokemonCard/PokemonCard'
import { useHeroSection } from './hooks/useHeroSection'

const HeroSection = ({ amount }: { amount: number }) => {
	const { state, status } = useHeroSection(
		amount,
		[10000, 1361, 2622, 1211, 10100],
	)

	return (
		<div className='relative min-h-[calc(100vh-60px)] w-full flex items-center justify-center p-6 overflow-hidden flex-col'>
			<div className='absolute inset-0 flex items-center justify-center pointer-events-none z-0 perspective-1000 bottom-30'>
				{state.cards.map(card => {
					const pokemon = state.data?.[card.dataIndex]

					return (
						<motion.div
							key={card.id}
							className={`absolute brightness-50 ${card.className}`}
							animate={card.animation}
							transition={{
								duration: card.duration,
								repeat: Infinity,
								ease: 'easeInOut',
							}}
						>
							<PokemonFlipCard isFlipped={!status.isCardFlipped}>
								{pokemon?.success ? (
									<PokemonCard pokemonData={pokemon.data} />
								) : (
									<PokemonCardBack />
								)}
							</PokemonFlipCard>
						</motion.div>
					)
				})}
			</div>

			<motion.main
				initial='hidden'
				animate='visible'
				variants={state.containerVariants}
				className='relative z-10 flex flex-col items-center justify-center text-white w-full max-w-4xl mx-auto drop-shadow-lg'
			>
				<div className='flex flex-col gap-4 items-center justify-center text-center'>
					<motion.h1 variants={state.itemVariants} className=''>
						<GradientText
							colors={['#F1E5FF', '#D8B4FE', '#E9D5FF', '#C4B5FD']}
							animationSpeed={4}
							showBorder={false}
							yoyo={false}
							className='font-extrabold! text-4xl! md:text-6xl! max-w-3xl! leading-tight!'
						>
							Your Ultimate Poke-Deck Starts Here!
						</GradientText>
					</motion.h1>

					<motion.p
						variants={state.itemVariants}
						className='text-sm md:text-lg font-medium max-w-2xl text-neutral-100 drop-shadow-[0_3px_10px_rgba(0,0,0,0.9)] leading-relaxed mt-2'
					>
						Stop just looking at cards - start owning them. Collect your
						favorite pocket monsters, trade live with other trainers, and
						multiply your coins in real-time. Are you lucky enough to pull a
						Legendary?
					</motion.p>

					<motion.div variants={state.itemVariants} className='flex gap-4 mt-8'>
						<Button asChild size='lg' className='hover:bg-primary/90 shadow-lg'>
							<Link href='/packs'>Open Packs</Link>
						</Button>

						<Button
							asChild
							size='lg'
							variant='secondary'
							className='hover:bg-white/90 shadow-lg'
						>
							<Link href='/collection'>View Your Deck</Link>
						</Button>
					</motion.div>
				</div>
			</motion.main>

			<div className='w-full min-h-20 flex items-center justify-center overflow-hidden -mb-42 mt-42 relative z-10'>
				{!status.isLoading && state.mappedLogos.length > 0 && (
					<LogoLoop
						logos={state.mappedLogos}
						speed={40}
						direction='left'
						gap={40}
						hoverSpeed={10}
						scaleOnHover
						fadeOutColor='#ffffff'
						ariaLabel='Featured Pokemons'
					/>
				)}
			</div>
		</div>
	)
}

export default HeroSection
