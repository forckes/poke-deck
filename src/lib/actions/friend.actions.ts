'use server'

import { friendService } from '@/server/services/friend.service'
import { headers } from 'next/headers'
import { auth } from '../auth'
import { revalidatePath } from 'next/cache'

export async function sendFriendRequestAction(targetUserId: string) {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session) throw new Error('Unauthorized')

	const userId = session.user.id

	await friendService.sendFriendRequest(userId, targetUserId)

	revalidatePath('/friends')
	return { success: true }
}

export async function acceptFriendRequestAction(friendshipId: string) {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session) throw new Error('Unauthorized')

	const userId = session.user.id

	if (!userId) throw new Error('User not found')

	await friendService.acceptFriendRequest(userId, friendshipId)

	revalidatePath('/friends')

	return { success: true }
}

export async function rejectFriendRequestAction(friendshipId: string) {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session) throw new Error('Unauthorized')

	const userId = session.user.id

	if (!userId) throw new Error('User not found')

	await friendService.rejectFriendRequest(userId, friendshipId)

	revalidatePath('/friends')

	return { success: true }
}

export async function removeFriendAction(friendshipId: string) {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session) throw new Error('Unauthorized')

	const userId = session.user.id

	if (!userId) throw new Error('User not found')

	await friendService.removeFriend(userId, friendshipId)

	revalidatePath('/friends')

	return { success: true }
}

export async function getFriendsAction() {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session) throw new Error('Unauthorized')

	const userId = session.user.id

	if (!userId) throw new Error('User not found')

	return friendService.getFriends(userId)
}

export async function getFriendShipByUsersAction(targetUserId: string) {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session) throw new Error('Unauthorized')

	const userId = session.user.id

	if (!userId) throw new Error('User not found')

	return friendService.getFriendShipByUsers(userId, targetUserId)
}

export async function getFriendShipByIdAction(friendshipId: string) {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session) throw new Error('Unauthorized')

	const userId = session.user.id

	if (!userId) throw new Error('User not found')

	return friendService.getFriendShipById(friendshipId)
}

export async function getPendingRequestsAction() {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user) {
		return { pendingFriends: [], totalCount: 0 }
	}

	const userId = session.user.id

	if (!userId) throw new Error('User not found')

	return friendService.getPendingRequests(userId)
}
