import Image from 'next/image'

/* eslint-disable @typescript-eslint/no-explicit-any */
interface Props {
	move: any
	className?: string
	border?: string
	size?: 'small' | 'medium' | 'large'
}

function PokemonMoveItem({ move, className, border, size = 'small' }: Props) {
	return (
		<div className={`flex justify-start items-center w-full ${className}`}>
			<div
				className={`${size === 'small' ? 'w-5 h-5' : size === 'medium' ? 'w-10 h-10' : 'w-15 h-15'} relative mr-16 border rounded-full shrink-0 ${border}`}
				style={{ filter: 'brightness(1.8)' }}
			>
				<Image src={move.energy} alt='energy icon' fill sizes='20px' />
			</div>
			<div className='flex justify-between w-full'>
				<span className={`${size == 'medium' ? 'text-md' : ''} font-semibold capitalize`}>{move.name}</span>
				<span className={`font-bold text-[17px] ${size == 'medium' ? 'text-lg text-primary' : ''}`}>{move.damage}</span>
			</div>
		</div>
	)
}

export default PokemonMoveItem
