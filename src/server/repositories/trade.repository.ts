import { Prisma, TradeItem, TradeStatus } from '@/generated/client'
import prisma from '@/lib/prisma'

export const tradeRepository = {
	async findById(id: string, tx?: Prisma.TransactionClient) {
		const prismaClient = tx || prisma

		return prismaClient.trade.findUnique({
			where: { id },
			include: {
				items: { include: { userCard: { include: { card: true } } } },
				sender: {
					select: { id: true, image: true, username: true, name: true },
				},
				receiver: {
					select: { id: true, image: true, username: true, name: true },
				},
			},
		})
	},

	async findByIdWithoutData(id: string) {
		return prisma.trade.findUnique({
			where: { id },
			select: { id: true },
		})
	},

	async findBySenderId(userId: string) {
		const [trades, count] = await Promise.all([
			prisma.trade.findMany({
				where: {
					status: {
						not: TradeStatus.PENDING,
					},
					senderId: userId,
				},
				select: {
					id: true,
					updatedAt: true,
					status: true,
					sender: { select: { image: true, username: true, name: true } },
					receiver: { select: { image: true, username: true, name: true } },
				},
				orderBy: {
					updatedAt: 'desc',
				},
			}),
			prisma.trade.count({
				where: {
					status: {
						not: TradeStatus.PENDING,
					},
					senderId: userId,
				},
			}),
		])

		return {
			trades,
			totalCount: count,
		}
	},

	async findByReceiverId(userId: string) {
		const [trades, count] = await Promise.all([
			prisma.trade.findMany({
				where: {
					status: { notIn: [TradeStatus.SENDED, TradeStatus.PENDING] },
					receiverId: userId,
				},
				select: {
					id: true,
					updatedAt: true,
					status: true,
					sender: { select: { image: true, username: true, name: true } },
					receiver: { select: { image: true, username: true, name: true } },
				},
				orderBy: {
					updatedAt: 'desc',
				},
			}),

			prisma.trade.count({
				where: {
					status: { notIn: [TradeStatus.SENDED, TradeStatus.PENDING] },
					receiverId: userId,
				},
			}),
		])

		return {
			trades,
			totalCount: count,
		}
	},

	async findSendedByReceiverId(userId: string) {
		const [trades, count] = await Promise.all([
			prisma.trade.findMany({
				where: {
					status: TradeStatus.SENDED,
					receiverId: userId,
				},
				select: {
					id: true,
					updatedAt: true,
					status: true,
					sender: { select: { image: true, username: true, name: true } },
					receiver: { select: { image: true, username: true, name: true } },
				},
				orderBy: {
					updatedAt: 'desc',
				},
			}),

			prisma.trade.count({
				where: {
					status: TradeStatus.SENDED,
					receiverId: userId,
				},
			}),
		])

		return {
			trades,
			totalCount: count,
		}
	},

	async findPendingTrade(senderId: string, receiverId: string) {
		return prisma.trade.findFirst({
			where: {
				senderId,
				receiverId,
				status: TradeStatus.PENDING,
			},
		})
	},

	async createBlankTrade(senderId: string, receiverId: string) {
		return prisma.trade.create({
			data: {
				senderId,
				receiverId,
				status: TradeStatus.PENDING,
			},
		})
	},

	async sendTradeWithItems(tradeId: string, tradeItems: TradeItem[]) {
		return prisma.trade.update({
			where: { id: tradeId },
			data: {
				status: TradeStatus.SENDED,
				items: {
					createMany: {
						data: tradeItems,
					},
				},
			},
		})
	},

	async updateTradeStatus(
		tradeId: string,
		status: TradeStatus,
		tx?: Prisma.TransactionClient,
	) {
		const prismaClient = tx || prisma

		return prismaClient.trade.update({
			where: { id: tradeId },
			data: { status },
		})
	},
}
