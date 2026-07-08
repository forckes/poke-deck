// app/share/[cardId]/page.tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { pokemonService } from '@/server/services/pokemon.service'

interface SharePageProps {
	params: Promise<{ cardId: string }>
}

export async function generateMetadata({ params }: SharePageProps) {
	const resolvedParams = await params
	const cardResult = await pokemonService.getPokemonCardById(
		Number(resolvedParams.cardId),
	)

	const CURRENT_TUNNEL_URL = 'https://nxhrgk-ip-46-211-129-90.tunnelmole.net'

	if (!cardResult.success || !cardResult.data) {
		return { title: 'Картку не знайдено | Poke-deck' }
	}

	const pokemon = cardResult.data

	return {
		metadataBase: new URL(CURRENT_TUNNEL_URL),
		title: `🔥 Картка: ${pokemon.name} (HP ${pokemon.hp || 330})`,
		description: `Рідкість: ${pokemon.rarity} • Подивіться на мій улов у колекції Poke-deck!`,
		openGraph: {
			title: `Poke-deck | ${pokemon.name}`,
			description: `Рідкість: ${pokemon.rarity}`,
			url: `/share/${resolvedParams.cardId}`,
			type: 'website',
			images: [
				{
					url: `${CURRENT_TUNNEL_URL}/share/${resolvedParams.cardId}/opengraph-image`,
					width: 1200,
					height: 630,
					alt: pokemon.name,
				},
			],
		},
	}
}

export default async function SharePage({ params }: SharePageProps) {
	const resolvedParams = await params
	const cardResult = await pokemonService.getPokemonCardById(
		Number(resolvedParams.cardId),
	)

	if (!cardResult.success || !cardResult.data) {
		notFound()
	}

	const pokemon = cardResult.data

	return (
		<div className='min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 gap-6'>
			<div className='text-center space-y-2'>
				<span className='text-xs font-bold uppercase tracking-widest text-purple-500 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20'>
					Poke-deck Share
				</span>
				<h1 className='text-3xl font-black mt-2'>Тобі показали картку!</h1>
				<p className='text-zinc-400 text-sm'>
					Перегляд картки {pokemon.name} у браузері
				</p>
			</div>

			<div className='w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center relative overflow-hidden'>
				<div className='w-full flex justify-between items-center mb-4 z-10'>
					<h2 className='text-xl font-bold tracking-tight'>{pokemon.name}</h2>
					<span className='text-amber-400 font-black text-sm bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20'>
						HP {pokemon.hp || 330}
					</span>
				</div>

				<div className='w-full h-72 bg-zinc-950/50 rounded-2xl border border-zinc-800 flex items-center justify-center p-4 z-10 mb-4'>
					{pokemon.image ? (
						<img
							src={pokemon.image}
							alt={pokemon.name}
							className='h-full object-contain'
						/>
					) : (
						<span className='text-zinc-600 text-sm'>No image</span>
					)}
				</div>

				<div className='z-10 w-full text-center'>
					<span className='text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1'>
						Rarity
					</span>
					<p className='text-sm font-bold text-purple-400'>{pokemon.rarity}</p>
				</div>
			</div>

			<Link href='/' className='z-10 mt-2'>
				<button className='px-6 py-3 bg-purple-600 hover:bg-purple-700 text-sm font-bold rounded-xl transition-all shadow-lg shadow-purple-600/20 border border-purple-500/30'>
					Назад на головну 🎮
				</button>
			</Link>
		</div>
	)
}
