'use client'

import { HoverTilt } from '../web-components/HoverTilt'
import Image from 'next/image'
import { getPokemonTypeStyle } from '@/utils/helpers/getPokemonTypeStyle'
import PokemonMoveItem from './PokemonMoveItem'
import { PokemonCardProps, PokemonMove } from '@/types/pokemon'
import { rarityColors } from '@/constants/pokemonTypes'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'

import('hover-tilt/web-component')

export function PokemonCard({ pokemonData, className }: PokemonCardProps) {
	const [isImageLoading, setIsImageLoading] = useState(true)

	if (!pokemonData) return null

	const typeStyle = getPokemonTypeStyle(pokemonData.types, pokemonData.rarity)

	const rarityStyle =
		rarityColors[pokemonData.rarity as keyof typeof rarityColors] ||
		rarityColors.COMMON

	return (
		<div className='flex justify-center relative'>
			<HoverTilt
				shadow
				shadow-blur={rarityStyle.blur}
				scale-factor={rarityStyle.scale}
				glare-intensity={rarityStyle.glare}
				class={`w-77.5 [&::part(container)]:rounded-xl z-100 transition-all ${rarityStyle.class} ${className}`}
			>
				<div
					className={`relative rounded-xl flex items-center gap-3 border-8 ${typeStyle.border} overflow-hidden ${typeStyle.text === 'light' ? 'text-white text-outline-black' : 'text-black text-outline-white'}
					`}
				>
					<Image
						src={typeStyle.texture || '/type-textures/default-texture.png'}
						alt='card texture'
						fill
						className='absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-100 pointer-events-none'
						style={{ filter: 'contrast(1)' }}
						loading='eager'
						sizes='100vw'
					/>
					<div className='flex flex-col w-full justify-center items-center p-3 z-10'>
						<div className='flex justify-between items-center w-full'>
							<h2
								className={`ml-4 text-[22px] font-bold capitalize ${pokemonData.rarity !== 'COMMON' ? '[text-shadow:none]' : ''}
									${pokemonData.rarity === 'EPIC' ? 'shiny-purple' : ''}
									${pokemonData.rarity === 'LEGENDARY' ? 'shiny-rainbow' : ''}
								`}
							>
								{pokemonData.name}
							</h2>
							<div className='flex gap-1 items-center'>
								<div className='flex gap-px items-end'>
									<span className='font-extrabold text-[9px] mb-1'>HP</span>
									<span className='font-bold text-xl'>{pokemonData.hp}</span>
								</div>
								<div
									className='w-7 h-7 relative border rounded-full'
									style={{ filter: 'brightness(1.8)' }}
								>
									<Image
										src={typeStyle.energy}
										sizes='20px'
										alt='energy icon'
										fill
									/>
								</div>
							</div>
						</div>

						<div className='relative w-65 h-65 z-10 mt-2'>
							{isImageLoading && (
								<div className='absolute inset-0 flex items-center justify-center z-20'>
									<Loader2 className='animate-spin' />
								</div>
							)}
							<Image
								key={pokemonData.image}
								src={pokemonData.image}
								alt={pokemonData.name}
								className='object-contain'
								fill
								priority
								sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
								onLoadStart={() => setIsImageLoading(true)}
								onLoad={() => setIsImageLoading(false)}
							/>
						</div>
						<div className='mt-6 flex flex-col justify-center items-start w-full gap-4 mb-2'>
							{pokemonData.moves?.map((move: PokemonMove) => (
								<PokemonMoveItem move={move} key={move.id}></PokemonMoveItem>
							))}
						</div>
					</div>
				</div>
			</HoverTilt>
		</div>
	)
}
