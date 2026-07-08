// app/share/[cardId]/opengraph-image.tsx
import { pokemonService } from '@/server/services/pokemon.service'
import { ImageResponse } from 'next/og'

export const alt = 'Poke-deck Card Preview'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

interface Props {
	params: Promise<{ cardId: string }>
}

export default async function Image({ params }: Props) {
	const resolvedParams = await params
	const cardId = Number(resolvedParams.cardId)

	if (isNaN(cardId)) {
		return new ImageResponse(
			<div
				style={{
					width: '100%',
					height: '100%',
					background: '#09090b',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<h1
					style={{ color: '#ffffff', fontSize: 50, fontFamily: 'sans-serif' }}
				>
					Invalid Card ID
				</h1>
			</div>,
			{ ...size },
		)
	}

	const cardResult = await pokemonService.getPokemonCardById(cardId)

	if (!cardResult.success || !cardResult.data) {
		return new ImageResponse(
			<div
				style={{
					width: '100%',
					height: '100%',
					background: '#09090b',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<h1
					style={{ color: '#ffffff', fontSize: 60, fontFamily: 'sans-serif' }}
				>
					Card Not Found ({cardId})
				</h1>
			</div>,
			{ ...size },
		)
	}

	const pokemon = cardResult.data

	// 🔥 ОПТИМІЗАЦІЯ ДЛЯ ДИСКОРДУ: Завантажуємо картинку в Base64 на сервері
	let imageBase64 = ''
	if (pokemon.image) {
		try {
			// Робимо запит за картинкою з таймаутом, щоб сервер не зависав
			const controller = new AbortController()
			const timeoutId = setTimeout(() => controller.abort(), 4000) // 4 секунди макс

			const imgResponse = await fetch(pokemon.image, {
				signal: controller.signal,
			})
			clearTimeout(timeoutId)

			if (imgResponse.ok) {
				const buffer = await imgResponse.arrayBuffer()
				const base64String = Buffer.from(buffer).toString('base64')
				const mimeType = imgResponse.headers.get('content-type') || 'image/png'
				imageBase64 = `data:${mimeType};base64,${base64String}`
			}
		} catch (error) {
			console.error('🔴 Помилка завантаження картинки для Satori:', error)
		}
	}

	return new ImageResponse(
		<div
			style={{
				width: '100%',
				height: '100%',
				backgroundColor: '#09090b',
				display: 'flex',
				flexDirection: 'row',
				alignItems: 'center',
				justifyContent: 'space-between',
				padding: '80px',
				color: '#ffffff',
				fontFamily: 'sans-serif',
			}}
		>
			{/* ЛІВА ЧАСТИНА */}
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'space-between',
					height: '100%',
					width: '55%',
				}}
			>
				<div style={{ display: 'flex', flexDirection: 'column' }}>
					<span
						style={{
							color: '#a855f7',
							fontSize: '24px',
							fontWeight: 'bold',
							textTransform: 'uppercase',
							letterSpacing: '2px',
						}}
					>
						Poke-deck Collection
					</span>

					<h1
						style={{
							fontSize: '64px',
							fontWeight: '900',
							margin: '20px 0 10px 0',
							display: 'flex',
						}}
					>
						{pokemon.name}
					</h1>

					<div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
						<span
							style={{
								display: 'flex',
								padding: '10px 24px',
								backgroundColor: '#27272a',
								borderRadius: '50px',
								fontSize: '20px',
								border: '1px solid #3f3f46',
							}}
						>
							{pokemon.rarity}
						</span>
						<span
							style={{
								display: 'flex',
								color: '#fbbf24',
								fontSize: '28px',
								fontWeight: 'bold',
							}}
						>
							HP {pokemon.hp || 330} 🔥
						</span>
					</div>
				</div>

				<div style={{ display: 'flex', flexDirection: 'column' }}>
					<p
						style={{
							color: '#71717a',
							fontSize: '22px',
							margin: '0 0 8px 0',
							display: 'flex',
						}}
					>
						Подивіться улов гравця за посиланням:
					</p>
					<p
						style={{
							color: '#a855f7',
							fontSize: '26px',
							fontWeight: 'bold',
							margin: 0,
							display: 'flex',
						}}
					>
						pokedeck.com/share/{cardId}
					</p>
				</div>
			</div>

			{/* ПРАВА ЧАСТИНА */}
			<div
				style={{
					width: '40%',
					height: '100%',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						backgroundColor: '#18181b',
						border: '4px solid #a855f7',
						padding: '24px',
						borderRadius: '32px',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					{/* Використовуємо готовий Base64, якщо він завантажився */}
					{imageBase64 ? (
						<img
							src={imageBase64}
							alt={pokemon.name}
							style={{ width: '280px', height: '390px', objectFit: 'contain' }}
						/>
					) : (
						<div
							style={{
								width: '280px',
								height: '390px',
								backgroundColor: '#27272a',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								borderRadius: '16px',
							}}
						>
							<span style={{ color: '#71717a', fontSize: '20px' }}>
								No Image
							</span>
						</div>
					)}
				</div>
			</div>
		</div>,
		{ ...size },
	)
}
