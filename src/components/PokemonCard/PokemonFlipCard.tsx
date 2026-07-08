'use client'

import { ReactNode, useState, useEffect } from 'react'
import PokemonCardBack from '../PokemonCard/PokemonCardBack'

interface Props {
	isFlipped: boolean
	children: ReactNode
	isLoading?: boolean
	className?: string
}

function PokemonFlipCard({ isFlipped, children, isLoading, className }: Props) {
	const [localFlipped, setLocalFlipped] = useState(false)

	useEffect(() => {
		let timer: NodeJS.Timeout

		if (isFlipped) {
			timer = setTimeout(() => setLocalFlipped(true), 50)
			return () => clearTimeout(timer)
		} else {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setLocalFlipped(prev => (prev ? false : prev))
		}

		return () => {
			if (timer) clearTimeout(timer)
		}
	}, [isFlipped])

	return (
		<div className={`perspective-1000 w-77.5 h-109.5 ${className}`}>
			<div
				className={`relative w-full h-full transition-all duration-700 preserve-3d ${
					localFlipped ? 'rotate-y-180' : ''
				}`}
			>
				<div className='absolute inset-0 backface-hidden z-20'>
					<PokemonCardBack />
					{isLoading && (
						<>
							<div className='absolute inset-0 bg-primary/10 animate-pulse rounded-xl' />
							<div className='absolute inset-0 rounded-xl overflow-hidden'>
								<div className='card-shimmer' />
							</div>
						</>
					)}
				</div>

				<div className='absolute inset-0 backface-hidden rotate-y-180 z-10'>
					{children}
				</div>
			</div>
		</div>
	)
}
export default PokemonFlipCard
