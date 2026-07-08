import { Rarity } from '@/generated/enums'
import prisma from '@/lib/prisma'

async function main() {
	console.log('🚀 Starting Seeding (Lean Mode)...')

	const rarities: Rarity[] = ['COMMON', 'EPIC', 'LEGENDARY']
	const totalPokemons = 1025

	for (let pId = 1; pId <= totalPokemons; pId++) {
		for (let i = 0; i < rarities.length; i++) {
			const rarity = rarities[i]

			const manualId = pId * 10 + i

			await prisma.card.upsert({
				where: {
					pokemonId_rarity: {
						pokemonId: pId,
						rarity: rarity,
					},
				},
				update: {},
				create: {
					id: manualId,
					pokemonId: pId,
					rarity: rarity,
				},
			})
		}
		if (pId % 20 === 0) console.log(`Processed ${pId} pokemons...`)
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
