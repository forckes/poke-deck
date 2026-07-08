import Image from 'next/image'

function PokemonCardBack() {
	return (
		<div className='w-77.5 h-109.5 rounded-xl relative border-8 border-gray-300 overflow-hidden'>
			<Image
				src='/card/pokemon-card-back.jpg'
				alt='Card Back'
				fill
				priority
				className='absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-100 pointer-events-none'
				style={{ filter: 'contrast(1)' }}
				sizes='438px'
			/>
		</div>
	)
}

export default PokemonCardBack
