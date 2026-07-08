import { userRepository } from '@/server/repositories/user.repository'
import { friendRepository } from '@/server/repositories/friend.repository'
import { FriendshipStatus } from '@/generated/enums'

export const userService = {
	async getUserIdByEmail(email: string) {
		const user = await userRepository.findByEmail(email)

		if (!user) {
			throw new Error('User not found')
		}

		return user.id
	},

	async getUserById(id: string) {
		const user = await userRepository.findById(id)

		if (!user) {
			throw new Error('User not found')
		}

		return user
	},

	async updateUserProfile(
		id: string,
		data: { name?: string; username?: string },
	) {
		const user = await userRepository.findById(id)

		if (!user) {
			throw new Error('User not found')
		}

		if (data.username === user.username && data.name === user.name) {
			throw new Error('You already have this namings')
		}

		if (data.username && data.username !== user.username) {
			const searchedUsername = await userRepository.findByUsername(
				data.username,
			)

			if (searchedUsername) {
				throw new Error('This username is already taken')
			}
		}

		return userRepository.updateUserProfile(id, data)
	},

	async searchUsers(query: string, currentUserId: string, limit: number = 5) {
		const users = await userRepository.searchUsers(query, currentUserId, limit)
		return Promise.all(
			users.map(async (user) => {
				const friendship = await friendRepository.getFriendshipStatus(
					currentUserId,
					user.id,
				)
				let relationStatus: 'none' | 'friend' | 'sent' | 'received' = 'none'
				let friendshipId: string | undefined = undefined

				if (friendship) {
					friendshipId = friendship.id
					if (friendship.status === FriendshipStatus.ACCEPTED) {
						relationStatus = 'friend'
					} else if (friendship.status === FriendshipStatus.PENDING) {
						relationStatus =
							friendship.userId === currentUserId ? 'sent' : 'received'
					}
				}

				return {
					...user,
					relationStatus,
					friendshipId,
				}
			}),
		)
	},
}
