'use client'

import { PokemonCardResult } from '@/types/pokemon'
import { getPokemonCardsByIds } from '@/utils/helpers/getPokemonCardsByIds'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { PokemonCard } from '../PokemonCard/PokemonCard'

const CardShowcase = ({ pokemonIds }: { pokemonIds: number[] }) => {
	const [pokemons, setPokemons] = useState<PokemonCardResult[]>([])
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const fetchPokemonSprites = async () => {
			try {
				setIsLoading(true)
				const res = await getPokemonCardsByIds(pokemonIds)

				if (res) {
					setPokemons(res)
				}
			} catch (error) {
				console.error('Error while loading Logo loop:', error)
			} finally {
				setIsLoading(false)
			}
		}

		fetchPokemonSprites()
	}, [pokemonIds])

	if (isLoading) return <div>Loading cards...</div>

	return (
		<div className='flex items-start justify-between py-48'>
			<div className='flex flex-col items-start justify-start gap-100'>
				<motion.h2
					initial={{ opacity: 0, y: 120 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.5 }}
					transition={{ duration: 0.7, ease: 'easeOut' }}
					className='text-[242px] tracking-tighter font-extrabold text-white'
				>
					BUY
				</motion.h2>

				<motion.h2
					initial={{ opacity: 0, y: 120 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.5 }}
					transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
					className='text-[242px] tracking-tighter font-extrabold text-white'
				>
					TRADE
				</motion.h2>

				<motion.h2
					initial={{ opacity: 0, y: 120 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.5 }}
					transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
					className='text-[242px] tracking-tighter font-extrabold -ml-2 text-white'
				>
					COLLECT
				</motion.h2>
			</div>

			<div className='grid grid-cols-2 scale-[0.6] gap-4 origin-top -mt-32 -mb-[90%]'>
				{pokemons.map(pokemon =>
					pokemon.success ? (
						<PokemonCard key={pokemon.data.id} pokemonData={pokemon.data} />
					) : null,
				)}
			</div>
		</div>
	)
}

export default CardShowcase
