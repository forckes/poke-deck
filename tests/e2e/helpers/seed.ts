import prisma from '@/lib/prisma'

export async function seedTestUserCoins(email: string, coins = 10000) {
	await prisma.user.update({
		where: { email },
		data: {
			coins: coins,
		},
	})
}

export async function clearTestUserCards(email: string) {
	const user = await prisma.user.findUnique({
		where: { email },
	})
	if (user) {
		await prisma.userCard.deleteMany({
			where: { ownerId: user.id },
		})
	}
}

export async function giveTestUserCardsForEvolution(
	email: string,
	cardIds: number[] = [10, 20, 30],
) {
	const user = await prisma.user.findUnique({
		where: { email },
	})

	if (!user) return

	const existingCards = await prisma.userCard.findMany({
		where: {
			ownerId: user.id,
			cardId: { in: cardIds },
		},
		select: { cardId: true },
	})

	const existingCardIds = new Set(existingCards.map(c => c.cardId))

	const newCardIds = cardIds.filter(id => !existingCardIds.has(id))

	if (newCardIds.length > 0) {
		await prisma.userCard.createMany({
			data: newCardIds.map(id => ({
				ownerId: user.id,
				cardId: id,
			})),
		})
	}
}

export async function removeTestUserEvolutionRecords(email: string) {
	const user = await prisma.user.findUnique({
		where: { email },
	})
	if (user) {
		await prisma.claimedEvolution.deleteMany({
			where: { userId: user.id },
		})
	}
}
