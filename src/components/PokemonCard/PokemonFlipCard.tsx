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
			setLocalFlipped(false)
		}

		return () => {
			if (timer) clearTimeout(timer)
		}
	}, [isFlipped])

	return (
		<div className={`perspective-1000 w-77.5 h-109.5 ${className}`}>
			<div
				className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${
					localFlipped
						? '[transform:rotateY(180deg)]'
						: '[transform:rotateY(0deg)]'
				}`}
			>
				<div className='absolute inset-0 [backface-visibility:hidden] [WebkitBackfaceVisibility:hidden] z-10 [transform:translateZ(1px)]'>
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

				<div className='absolute inset-0 [backface-visibility:hidden] [WebkitBackfaceVisibility:hidden] z-20 [transform:rotateY(180deg)_translateZ(1px)]'>
					{children}
				</div>
			</div>
		</div>
	)
}

export default PokemonFlipCard
