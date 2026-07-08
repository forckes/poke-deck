import { FriendshipStatus } from '@/generated/enums'
import { Prisma } from '@/generated/client'
import prisma from '@/lib/prisma'

export const friendRepository = {
	createFriendship: async (
		userId: string,
		friendId: string,
		status: FriendshipStatus = FriendshipStatus.PENDING,
		tx?: Prisma.TransactionClient,
	) => {
		const prismaClient = tx || prisma

		return prismaClient.friendship.create({
			data: {
				userId,
				friendId,
				status,
			},
		})
	},

	getFriendshipById: async (
		friendshipId: string,
		tx?: Prisma.TransactionClient,
	) => {
		const prismaClient = tx || prisma

		return prismaClient.friendship.findFirst({
			where: {
				id: friendshipId,
			},
		})
	},

	getFriendshipByUsers: async (
		userId: string,
		targetUserId: string,
		tx?: Prisma.TransactionClient,
	) => {
		const prismaClient = tx || prisma

		return prismaClient.friendship.findFirst({
			where: {
				OR: [
					{ userId: userId, friendId: targetUserId },
					{ userId: targetUserId, friendId: userId },
				],
			},
		})
	},

	updateFriendshipStatus: async (
		friendshipId: string,
		status: FriendshipStatus,
		tx?: Prisma.TransactionClient,
	) => {
		const prismaClient = tx || prisma

		return prismaClient.friendship.update({
			where: { id: friendshipId },
			data: { status },
		})
	},

	deleteFriendship: async (
		friendshipId: string,
		tx?: Prisma.TransactionClient,
	) => {
		const prismaClient = tx || prisma

		return prismaClient.friendship.delete({
			where: { id: friendshipId },
		})
	},

	getUserFriends: async (userId: string, tx?: Prisma.TransactionClient) => {
		const prismaClient = tx || prisma

		const [friendships, count] = await Promise.all([
			prismaClient.friendship.findMany({
				where: {
					status: FriendshipStatus.ACCEPTED,
					OR: [{ userId }, { friendId: userId }],
				},
				include: {
					user: true,
					friend: true,
				},
			}),
			prismaClient.friendship.count({
				where: {
					status: FriendshipStatus.ACCEPTED,
					OR: [{ userId }, { friendId: userId }],
				},
			}),
		])

		const friends = friendships.map(relationship => {
			const isOwner = relationship.userId === userId
			const friendData = isOwner ? relationship.friend : relationship.user

			return {
				...friendData,
				friendshipId: relationship.id,
			}
		})

		return {
			friends,
			totalCount: count,
		}
	},

	getPendingRequests: async (userId: string, tx?: Prisma.TransactionClient) => {
		const prismaClient = tx || prisma

		const [friendships, count] = await Promise.all([
			prismaClient.friendship.findMany({
				where: {
					status: FriendshipStatus.PENDING,
					friendId: userId,
				},
				include: {
					user: true,
					friend: true,
				},
			}),
			prismaClient.friendship.count({
				where: {
					status: FriendshipStatus.PENDING,
					friendId: userId,
				},
			}),
		])

		const pendingFriends = friendships.map(relationship => {
			const isOwner = relationship.userId === userId
			const friendData = isOwner ? relationship.friend : relationship.user

			return {
				...friendData,
				friendshipId: relationship.id,
			}
		})

		return {
			pendingFriends,
			totalCount: count,
		}
	},

	getFriendshipStatus: async (userId: string, targetUserId: string) => {
		return await prisma.friendship.findFirst({
			where: {
				OR: [
					{ userId: userId, friendId: targetUserId },
					{ userId: targetUserId, friendId: userId },
				],
			},
			select: {
				id: true,
				status: true,
				userId: true,
			},
		})
	},
}
