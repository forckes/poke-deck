import { Rarity } from '@/generated/enums'
import prisma from '@/lib/prisma'

const BASE_URL = 'https://pokeapi.co/api/v2'

async function fetchPokemonMetadata(id: number): Promise<{ name: string; types: string[] }> {
	const res = await fetch(`${BASE_URL}/pokemon/${id}`)
	if (!res.ok) {
		throw new Error(`Failed to fetch pokemon ${id}: ${res.statusText}`)
	}
	const data = await res.json()
	const name = data.name as string
	const types = (data.types as any[]).map(t => t.type.name as string)
	return { name, types }
}

async function fetchPokemonMetadataWithRetry(id: number, retries = 3): Promise<{ name: string; types: string[] }> {
	for (let attempt = 1; attempt <= retries; attempt++) {
		try {
			return await fetchPokemonMetadata(id)
		} catch (error) {
			if (attempt === retries) throw error
			console.warn(`[Attempt ${attempt}/${retries}] Failed to fetch pokemon ${id}, retrying in 1s...`)
			await new Promise(resolve => setTimeout(resolve, 1000))
		}
	}
	throw new Error(`Failed to fetch pokemon ${id} after ${retries} attempts`)
}

async function main() {
	console.log('🚀 Starting Seeding (Lean Mode)...')

	const rarities: Rarity[] = ['COMMON', 'EPIC', 'LEGENDARY']
	const totalPokemons = 1025
	const batchSize = 50

	for (let pId = 1; pId <= totalPokemons; pId += batchSize) {
		const currentBatch: number[] = []
		for (let offset = 0; offset < batchSize && pId + offset <= totalPokemons; offset++) {
			currentBatch.push(pId + offset)
		}

		console.log(`📡 Fetching metadata for pokemons ${currentBatch[0]} to ${currentBatch[currentBatch.length - 1]}...`)

		const metadataResults = await Promise.all(
			currentBatch.map(async (id) => {
				try {
					const meta = await fetchPokemonMetadataWithRetry(id)
					return { id, ...meta }
				} catch (e) {
					console.error(`❌ Error fetching metadata for pokemon ${id}:`, e)
					return null
				}
			})
		)

		console.log(`💾 Upserting cards in database...`)
		for (const meta of metadataResults) {
			if (!meta) continue
			const primaryType = meta.types[0] || ''

			for (let i = 0; i < rarities.length; i++) {
				const rarity = rarities[i]
				const manualId = meta.id * 10 + i

				await prisma.card.upsert({
					where: {
						pokemonId_rarity: {
							pokemonId: meta.id,
							rarity: rarity,
						},
					},
					update: {
						name: meta.name,
						types: meta.types,
						primaryType: primaryType,
					},
					create: {
						id: manualId,
						pokemonId: meta.id,
						rarity: rarity,
						name: meta.name,
						types: meta.types,
						primaryType: primaryType,
					},
				})
			}
		}
	}

	console.log('✨ Seeded all card combinations successfully.')
}

main()
	.catch(e => {
		console.error(e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
