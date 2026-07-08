import { cache } from 'react'
import { notFound } from 'next/navigation'
import { userRepository } from '@/server/repositories/user.repository'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { getFriendShipByUsersAction } from '@/lib/actions/friend.actions'

export interface ProfilePageProps {
	params: Promise<{ username: string }>
}

export const getUserProfileData = cache(async (props: ProfilePageProps) => {
	const { username } = await props.params

	const targetUser = await userRepository.findByUsername(username)
	if (!targetUser) {
		notFound()
	}

	const [session, stats] = await Promise.all([
		auth.api.getSession({ headers: await headers() }),
		userRepository.getUserProfileStats(targetUser.id),
	])

	const currentUserId = session?.user?.id
	const isCurrentUser = currentUserId === targetUser.id

	let friendshipStatus: 'NONE' | 'PENDING' | 'ACCEPTED' | string = 'NONE'
	let friendshipId: string | null = null

	if (currentUserId && !isCurrentUser) {
		const friendship = await getFriendShipByUsersAction(targetUser.id)
		if (friendship) {
			friendshipStatus = friendship.status
			friendshipId = friendship.id
		}
	}

	return {
		state: {
			targetUser,
			currentUserId,
			isCurrentUser,
			friendshipStatus,
			friendshipId,
			stats,
		},
	}
})
