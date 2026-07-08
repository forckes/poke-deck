import Footer from '@/components/Footer/Footer'
import CardShowcase from '@/components/Landing/CardShowcase'
import HeroSection from '@/components/Landing/HeroSection'
import TextExpression from '@/components/Landing/TextExpression'

export default function Home() {
	return (
		<div className='min-h-screen bg-gradient-to-r from-[#360055] via-[#110043] to-[#000000]'>
			<HeroSection amount={30} />
			<CardShowcase
				pokemonIds={[
					2001, 2022, 2040, 2062, 2081, 2101, 2200, 2402, 2801, 3000, 3402,
					3801, 4000, 4202, 4401, 4801, 5202, 5401,
				]}
			/>
			<div className='wrapper'>
				<TextExpression />
			</div>
			<Footer />
		</div>
	)
}
