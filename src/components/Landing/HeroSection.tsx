'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */
import Lightfall from '@/components/Lightfall'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { motion, Variants } from 'framer-motion'
import GradientText from '../GradientText'
import LogoLoop from '../LogoLoop'
import { useEffect, useState } from 'react'
import { getPokemonsSpritesByIds } from '@/utils/helpers/getPokemonsSpritesByIds'

const HeroSection = ({ amount }: { amount: number }) => {
	const [pokemonSprites, setPokemonSprites] = useState<string[]>([])
	const [pokemonIds, setPokemonIds] = useState<number[]>([])
	const [isLoading, setIsLoading] = useState(true)

	const mappedLogos = pokemonSprites.map((spriteUrl, index) => ({
		src: spriteUrl,
		alt: `Pokemon ${pokemonIds[index] || index}`,
		href: `#`,
	}))

	useEffect(() => {
		const fetchPokemonSprites = async () => {
			try {
				setIsLoading(true)
				const res = await getPokemonsSpritesByIds(amount)

				if (res) {
					setPokemonSprites(res.sprites)
					setPokemonIds(res.ids)
				}
			} catch (error) {
				console.error('Error while loading Logo loop:', error)
			} finally {
				setIsLoading(false)
			}
		}

		fetchPokemonSprites()
	}, [amount])

	const containerVariants: Variants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.25,
			},
		},
	}

	const itemVariants: Variants = {
		hidden: {
			opacity: 0,
			y: 40,
		},
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.8,
				ease: [0.22, 1, 0.36, 1] as any,
			},
		},
	}

	return (
		<div className='relative min-h-[calc(100vh-60px)] w-full flex items-center justify-center p-6 overflow-hidden flex-col'>
			<div className='absolute inset-0 z-0 pointer-events-none will-change-transform transform-gpu'>
				<Lightfall
					backgroundColor='#432aed'
					density={0.7}
					glow={1}
					speed={0.5}
					opacity={1}
				/>
			</div>

			<motion.main
				initial='hidden'
				animate='visible'
				variants={containerVariants}
				className='relative z-10 flex flex-col items-center justify-center text-white w-full max-w-4xl mx-auto'
			>
				<div className='flex flex-col gap-4 items-center justify-center text-center'>
					<motion.h1 variants={itemVariants} className=''>
						<GradientText
							colors={['#ECCCFF', '#a383e8', '#ECCCFF', '#a383e8']}
							animationSpeed={4}
							showBorder={false}
							yoyo={false}
							className='font-extrabold! text-4xl! md:text-6xl! max-w-3xl! leading-tight!'
						>
							Your Ultimate Poke-Deck Starts Here!
						</GradientText>
					</motion.h1>

					<motion.p
						variants={itemVariants}
						className='text-sm md:text-lg font-medium max-w-2xl text-neutral-200/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] leading-relaxed mt-2'
					>
						Stop just looking at cards - start owning them. Collect your
						favorite pocket monsters, trade live with other trainers, and
						multiply your coins in real-time. Are you lucky enough to pull a
						Legendary?
					</motion.p>

					<motion.div variants={itemVariants} className='flex gap-4 mt-8'>
						<Button asChild size='lg' className='hover:bg-primary/90'>
							<Link href='/packs'>Open Packs</Link>
						</Button>

						<Button
							asChild
							size='lg'
							variant='secondary'
							className='hover:bg-white/90'
						>
							<Link href='/collection'>View Your Deck</Link>
						</Button>
					</motion.div>
				</div>
			</motion.main>
			<div className='w-full min-h-20 flex items-center justify-center overflow-hidden -mb-42 mt-42'>
				{!isLoading && mappedLogos.length > 0 && (
					<LogoLoop
						logos={mappedLogos}
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
