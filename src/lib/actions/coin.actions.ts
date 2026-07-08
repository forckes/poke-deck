'use server'

import { PackType } from '@/generated/enums'
import { coinRepository } from '@/server/repositories/coin.repository'
import { coinService } from '@/server/services/coin.service'
import { headers } from 'next/headers'
import { auth } from '../auth'
import { revalidatePath } from 'next/cache'
import prisma from '../prisma'

export async function addCoinsAction(amount: number) {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session) throw new Error('Unauthorized')

	const userId = session.user.id

	await coinService.addCoins(userId, amount)

	revalidatePath('/packs')

	return { success: true }
}

export async function resetCoinsAction() {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session) throw new Error('Unauthorized')

	const userId = session.user.id

	await coinService.resetCoins(userId)

	revalidatePath('/packs')

	return { success: true }
}

export async function getPackPriceAction(packType: PackType) {
	const packPrice = await coinRepository.getPackPrice(packType)

	return { packPrice }
}

export async function getUserCoinsAction() {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session) throw new Error('Unauthorized')

	const userId = session.user.id

	const result = await coinRepository.getUserCoins(userId)

	return { coins: result?.coins ?? 0 }
}
export async function getHourlyRewardStatusAction() {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session) throw new Error('Unauthorized')

	const userId = session.user.id

	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { lastHourlyRewardAt: true },
	})

	if (!user || !user.lastHourlyRewardAt) {
		return { canClaim: true, secondsRemaining: 0 }
	}

	const elapsedSeconds = Math.floor(
		(Date.now() - user.lastHourlyRewardAt.getTime()) / 1000,
	)
	const cooldown = 21600

	if (elapsedSeconds >= cooldown) {
		return { canClaim: true, secondsRemaining: 0 }
	}

	return {
		canClaim: false,
		secondsRemaining: cooldown - elapsedSeconds,
	}
}

export async function claimHourlyRewardAction() {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session) throw new Error('Unauthorized')

	const userId = session.user.id

	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { lastHourlyRewardAt: true },
	})

	if (!user) return { success: false, error: 'User not found' }

	const now = new Date()
	const cooldown = 21600

	if (user.lastHourlyRewardAt) {
		const elapsedSeconds = Math.floor(
			(now.getTime() - user.lastHourlyRewardAt.getTime()) / 1000,
		)
		if (elapsedSeconds < cooldown) {
			return { success: false, error: 'Cooldown active' }
		}
	}

	await prisma.user.update({
		where: { id: userId },
		data: {
			coins: { increment: 200 },
			lastHourlyRewardAt: now,
		},
	})

	revalidatePath('/packs')

	return { success: true }
}
