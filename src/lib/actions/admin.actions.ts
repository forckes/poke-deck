'use server'

import { auth } from '../auth'
import { headers } from 'next/headers'
import prisma from '../prisma'
import { revalidatePath } from 'next/cache'
import { crashGameService } from '@/server/services/crashgame.service'
import { PackType, TradeStatus, Rarity } from '@/generated/enums'

async function checkAdmin() {
	const session = await auth.api.getSession({ headers: await headers() })
	if (session?.user.role !== 'admin') {
		throw new Error('Unauthorized')
	}
	return session.user.id
}

export async function getAdminUsersAction(page: number, limit: number = 20) {
	await checkAdmin()

	const skip = (page - 1) * limit

	const [users, totalCount] = await Promise.all([
		prisma.user.findMany({
			orderBy: { createdAt: 'desc' },
			skip,
			take: limit,
		}),
		prisma.user.count(),
	])

	return {
		users: users.map(user => ({
			id: user.id,
			name: user.name,
			username: user.username,
			displayUsername: user.displayUsername,
			email: user.email,
			emailVerified: user.emailVerified,
			image: user.image,
			coins: user.coins,
			createdAt: user.createdAt.toISOString(),
			updatedAt: user.updatedAt.toISOString(),
			lastHourlyRewardAt: user.lastHourlyRewardAt?.toISOString() || null,
			role: user.role || 'user',
			banned: user.banned || false,
			banReason: user.banReason || null,
			banExpires: user.banExpires?.toISOString() || null,
		})),
		totalCount,
		totalPages: Math.ceil(totalCount / limit),
	}
}

export async function banUserAction(
	targetUserId: string,
	reason: string,
	durationInDays: number | null,
) {
	const adminId = await checkAdmin()
	if (adminId === targetUserId) {
		throw new Error('You cannot ban yourself')
	}

	const banExpires = durationInDays
		? new Date(Date.now() + durationInDays * 24 * 60 * 60 * 1000)
		: null

	await prisma.user.update({
		where: { id: targetUserId },
		data: {
			banned: true,
			banReason: reason,
			banExpires,
		},
	})

	revalidatePath('/admin')
	return { success: true }
}

export async function unbanUserAction(targetUserId: string) {
	await checkAdmin()

	await prisma.user.update({
		where: { id: targetUserId },
		data: {
			banned: false,
			banReason: null,
			banExpires: null,
		},
	})

	revalidatePath('/admin')
	return { success: true }
}

export async function addCoinsToUserAction(
	targetUserId: string,
	amount: number,
) {
	await checkAdmin()

	if (amount <= 0) {
		throw new Error('Amount must be positive')
	}

	const user = await prisma.user.findUnique({
		where: { id: targetUserId },
		select: { coins: true },
	})

	if (!user) {
		throw new Error('User not found')
	}

	const newCoins = Math.min(10000, user.coins + amount)

	await prisma.user.update({
		where: { id: targetUserId },
		data: { coins: newCoins },
	})

	revalidatePath('/admin')
	return { success: true }
}

export async function toggleUserRoleAction(targetUserId: string) {
	const adminId = await checkAdmin()
	if (adminId === targetUserId) {
		throw new Error('You cannot change your own role')
	}

	const user = await prisma.user.findUnique({
		where: { id: targetUserId },
		select: { role: true },
	})

	if (!user) {
		throw new Error('User not found')
	}

	const newRole = user.role === 'admin' ? 'user' : 'admin'

	await prisma.user.update({
		where: { id: targetUserId },
		data: { role: newRole },
	})

	revalidatePath('/admin')
	return { success: true }
}

export async function searchAdminUsersAction(username: string) {
	await checkAdmin()

	const users = await prisma.user.findMany({
		where: {
			username: {
				contains: username,
				mode: 'insensitive',
			},
		},
		take: 10,
	})

	return {
		users: users.map(user => ({
			id: user.id,
			name: user.name,
			username: user.username,
			displayUsername: user.displayUsername,
			email: user.email,
			emailVerified: user.emailVerified,
			image: user.image,
			coins: user.coins,
			createdAt: user.createdAt.toISOString(),
			updatedAt: user.updatedAt.toISOString(),
			lastHourlyRewardAt: user.lastHourlyRewardAt?.toISOString() || null,
			role: user.role || 'user',
			banned: user.banned || false,
			banReason: user.banReason || null,
			banExpires: user.banExpires?.toISOString() || null,
		})),
	}
}

export async function getAdminTradesAction(page: number, limit: number = 20) {
	await checkAdmin()

	const skip = (page - 1) * limit

	const [trades, totalCount] = await Promise.all([
		prisma.trade.findMany({
			orderBy: { updatedAt: 'desc' },
			skip,
			take: limit,
			include: {
				sender: {
					select: { id: true, image: true, username: true, name: true },
				},
				receiver: {
					select: { id: true, image: true, username: true, name: true },
				},
			},
		}),
		prisma.trade.count(),
	])

	return {
		trades: trades.map(trade => ({
			id: trade.id,
			status: trade.status,
			senderId: trade.senderId,
			receiverId: trade.receiverId,
			createdAt: trade.createdAt.toISOString(),
			updatedAt: trade.updatedAt.toISOString(),
			sender: trade.sender,
			receiver: trade.receiver,
		})),
		totalCount,
		totalPages: Math.ceil(totalCount / limit),
	}
}

export async function cancelTradeAction(tradeId: string) {
	await checkAdmin()

	await prisma.trade.update({
		where: { id: tradeId },
		data: { status: TradeStatus.CANCELLED },
	})

	revalidatePath('/admin')
	return { success: true }
}

export async function getUserTradesAction(targetUserId: string) {
	await checkAdmin()

	const trades = await prisma.trade.findMany({
		where: {
			OR: [{ senderId: targetUserId }, { receiverId: targetUserId }],
		},
		orderBy: { updatedAt: 'desc' },
		include: {
			sender: { select: { id: true, image: true, username: true, name: true } },
			receiver: {
				select: { id: true, image: true, username: true, name: true },
			},
		},
	})

	return {
		trades: trades.map(trade => ({
			id: trade.id,
			status: trade.status,
			senderId: trade.senderId,
			receiverId: trade.receiverId,
			createdAt: trade.createdAt.toISOString(),
			updatedAt: trade.updatedAt.toISOString(),
			sender: trade.sender,
			receiver: trade.receiver,
		})),
	}
}

export async function toggleCrashGameAction(action: 'start' | 'stop') {
	await checkAdmin()

	if (action === 'start') {
		crashGameService.startEngine()
	} else {
		crashGameService.stopEngine()
	}

	return { success: true }
}

export async function getCrashGameEngineStatusAction() {
	await checkAdmin()

	return {
		isRunning: crashGameService.isEngineRunning(),
	}
}

export async function getPacksConfigAction() {
	await checkAdmin()

	const packs = await prisma.pack.findMany({
		orderBy: { type: 'asc' },
	})

	return {
		packs: packs.map(pack => ({
			id: pack.id,
			type: pack.type,
			priceInCoins: pack.priceInCoins,
			commonDropChance: pack.commonDropChance,
			epicDropChance: pack.epicDropChance,
			legendaryDropChance: pack.legendaryDropChance,
		})),
	}
}

export async function updatePackPriceAction(packType: PackType, price: number) {
	await checkAdmin()

	if (price <= 0) {
		throw new Error('Price must be positive')
	}

	await prisma.pack.update({
		where: { type: packType },
		data: { priceInCoins: price },
	})

	revalidatePath('/packs')
	revalidatePath('/admin')
	return { success: true }
}

export async function updatePackChancesAction(
	packType: PackType,
	common: number,
	epic: number,
	legendary: number,
) {
	await checkAdmin()

	if (common < 0 || epic < 0 || legendary < 0) {
		throw new Error('Chances cannot be negative')
	}

	if (common + epic + legendary !== 100) {
		throw new Error('Chances must sum to exactly 100%')
	}

	await prisma.pack.update({
		where: { type: packType },
		data: {
			commonDropChance: common,
			epicDropChance: epic,
			legendaryDropChance: legendary,
		},
	})

	revalidatePath('/packs')
	revalidatePath('/admin')
	return { success: true }
}

export async function getEvolutionRewardsAction() {
	await checkAdmin()

	const rewards = await prisma.evolutionReward.findMany({
		orderBy: { rarity: 'asc' },
	})

	return {
		rewards: rewards.map(reward => ({
			id: reward.id,
			rarity: reward.rarity,
			coinReward: reward.coinReward,
			createdAt: reward.createdAt.toISOString(),
		})),
	}
}

export async function updateEvolutionRewardAction(rarity: Rarity, coins: number) {
	await checkAdmin()

	if (coins < 0) {
		throw new Error('Reward cannot be negative')
	}

	await prisma.evolutionReward.update({
		where: { rarity },
		data: { coinReward: coins },
	})

	revalidatePath('/admin')
	return { success: true }
}

export async function createDefaultEvolutionRewardsAction() {
	await checkAdmin()

	const defaultRewards = [
		{ rarity: Rarity.COMMON, coinReward: 150 },
		{ rarity: Rarity.EPIC, coinReward: 450 },
		{ rarity: Rarity.LEGENDARY, coinReward: 750 },
	]

	for (const reward of defaultRewards) {
		await prisma.evolutionReward.upsert({
			where: { rarity: reward.rarity },
			update: {},
			create: {
				rarity: reward.rarity,
				coinReward: reward.coinReward,
			},
		})
	}

	revalidatePath('/admin')
	return { success: true }
}

export async function createDefaultPacksAction() {
	await checkAdmin()

	const defaultPacks = [
		{
			type: PackType.COMMON,
			priceInCoins: 100,
			commonDropChance: 80,
			epicDropChance: 15,
			legendaryDropChance: 5,
		},
		{
			type: PackType.EPIC,
			priceInCoins: 250,
			commonDropChance: 40,
			epicDropChance: 50,
			legendaryDropChance: 10,
		},
		{
			type: PackType.LEGENDARY,
			priceInCoins: 600,
			commonDropChance: 10,
			epicDropChance: 30,
			legendaryDropChance: 60,
		},
	]

	for (const pack of defaultPacks) {
		await prisma.pack.upsert({
			where: { type: pack.type },
			update: {},
			create: {
				type: pack.type,
				priceInCoins: pack.priceInCoins,
				commonDropChance: pack.commonDropChance,
				epicDropChance: pack.epicDropChance,
				legendaryDropChance: pack.legendaryDropChance,
			},
		})
	}

	revalidatePath('/packs')
	revalidatePath('/admin')
	return { success: true }
}

export async function getUsersRegistrationStatsAction(timeframe: '24h' | '7d' | '30d' | '1y' | 'all') {
	await checkAdmin()

	const now = new Date()
	let stats: { date: string; count: number }[] = []

	if (timeframe === '24h') {
		const start = new Date(now.getTime() - 24 * 60 * 60 * 1000)
		const users = await prisma.user.findMany({
			where: { createdAt: { gte: start } },
			select: { createdAt: true },
			orderBy: { createdAt: 'asc' },
		})

		const hours = Array.from({ length: 24 }, (_, i) => {
			const d = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000)
			return d.toISOString().substring(0, 13) + ':00'
		})

		stats = hours.map(h => ({
			date: h.split('T')[1].substring(0, 5),
			count: 0,
		}))

		users.forEach(u => {
			const hStr = u.createdAt.toISOString().substring(0, 13) + ':00'
			const idx = hours.indexOf(hStr)
			if (idx !== -1) {
				stats[idx].count++
			}
		})
	} else if (timeframe === '7d' || timeframe === '30d') {
		const daysCount = timeframe === '7d' ? 7 : 30
		const start = new Date(now.getTime() - daysCount * 24 * 60 * 60 * 1000)
		const users = await prisma.user.findMany({
			where: { createdAt: { gte: start } },
			select: { createdAt: true },
			orderBy: { createdAt: 'asc' },
		})

		const days = Array.from({ length: daysCount }, (_, i) => {
			const d = new Date(now.getTime() - (daysCount - 1 - i) * 24 * 60 * 60 * 1000)
			return d.toISOString().substring(0, 10)
		})

		stats = days.map(d => {
			const dateObj = new Date(d)
			const formattedLabel = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
			return {
				date: formattedLabel,
				count: 0,
				rawDate: d,
			}
		}) as any

		users.forEach(u => {
			const dStr = u.createdAt.toISOString().substring(0, 10)
			const found = stats.find((s: any) => s.rawDate === dStr)
			if (found) {
				found.count++
			}
		})
	} else if (timeframe === '1y') {
		const start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
		const users = await prisma.user.findMany({
			where: { createdAt: { gte: start } },
			select: { createdAt: true },
			orderBy: { createdAt: 'asc' },
		})

		const months = Array.from({ length: 12 }, (_, i) => {
			const d = new Date()
			d.setMonth(now.getMonth() - (11 - i))
			return d.toISOString().substring(0, 7)
		})

		stats = months.map(m => {
			const dateObj = new Date(m + '-01')
			const formattedLabel = dateObj.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
			return {
				date: formattedLabel,
				count: 0,
				rawMonth: m,
			}
		}) as any

		users.forEach(u => {
			const mStr = u.createdAt.toISOString().substring(0, 7)
			const found = stats.find((s: any) => s.rawMonth === mStr)
			if (found) {
				found.count++
			}
		})
	} else {
		// all time
		const users = await prisma.user.findMany({
			select: { createdAt: true },
			orderBy: { createdAt: 'asc' },
		})

		if (users.length > 0) {
			const firstDate = users[0].createdAt
			const diffMs = now.getTime() - firstDate.getTime()
			const diffDays = Math.max(1, Math.ceil(diffMs / (24 * 60 * 60 * 1000)))

			if (diffDays <= 30) {
				const days = Array.from({ length: diffDays }, (_, i) => {
					const d = new Date(firstDate.getTime() + i * 24 * 60 * 60 * 1000)
					return d.toISOString().substring(0, 10)
				})

				stats = days.map(d => {
					const dateObj = new Date(d)
					const formattedLabel = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
					return {
						date: formattedLabel,
						count: 0,
						rawDate: d,
					}
				}) as any

				users.forEach(u => {
					const dStr = u.createdAt.toISOString().substring(0, 10)
					const found = stats.find((s: any) => s.rawDate === dStr)
					if (found) {
						found.count++
					}
				})
			} else {
				const startMonth = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1)
				const months: string[] = []
				const current = new Date(startMonth)
				while (current <= now) {
					months.push(current.toISOString().substring(0, 7))
					current.setMonth(current.getMonth() + 1)
				}

				stats = months.map(m => {
					const dateObj = new Date(m + '-01')
					const formattedLabel = dateObj.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
					return {
						date: formattedLabel,
						count: 0,
						rawMonth: m,
					}
				}) as any

				users.forEach(u => {
					const mStr = u.createdAt.toISOString().substring(0, 7)
					const found = stats.find((s: any) => s.rawMonth === mStr)
					if (found) {
						found.count++
					}
				})
			}
		}
	}

	return { stats: stats.map(s => ({ date: s.date, count: s.count })) }
}

