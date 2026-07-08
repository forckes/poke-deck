const Footer = () => {
	return (
		<footer className='w-full py-6 bg-white'>
			<div className='wrapper'>
				<p className='text-center mx-auto leading-relaxed'>
					<strong>Disclaimer:</strong> This is an open-source, non-commercial
					fan project. All Pokémon names, images, card designs, and related
					media are registered trademarks and copyright of{' '}
					<strong>Nintendo, Game Freak, The Pokémon Company,</strong> or their
					respective owners. No copyright infringement is intended. Data is
					proudly sourced from{' '}
					<a
						href='https://pokeapi.co/'
						target='_blank'
						rel='noreferrer'
						className='underline hover:text-neutral-400'
					>
						PokeAPI
					</a>
					.
				</p>
				<p className='text-center'>
					&copy; {new Date().getFullYear()} Poke-Deck. Created for educational
					and portfolio purposes only.
				</p>
				<div className='flex items-center justify-center gap-1.5 text-sm  font-medium tracking-tight mt-6 text-primary'>
					<span>Made with</span>
					<span className='text-red-500 animate-pulse text-base'>❤️</span>
					<span>by</span>
					<a
						href='https://github.com/forckes'
						target='_blank'
						rel='noopener noreferrer'
						className='hover:text-primary transition-colors font-semibold underline underline-offset-4 decoration-neutral-800 hover:decoration-primary'
					>
						forckes
					</a>
				</div>
			</div>
		</footer>
	)
}

export default Footer
