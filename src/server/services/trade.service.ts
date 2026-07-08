import prisma from '@/lib/prisma'
import { tradeRepository } from '../repositories/trade.repository'
import { TradeStatus } from '@/generated/enums'
import { TradeItem } from '@/generated/client'

export const tradeService = {
	async getBySenderId(userId: string) {
		if (!userId) throw new Error('User not found')

		const trades = await tradeRepository.findBySenderId(userId)

		return trades
	},

	async getByReceiverId(userId: string) {
		if (!userId) throw new Error('User not found')

		const trades = await tradeRepository.findByReceiverId(userId)

		return trades
	},

	async getSendedByReceiverId(userId: string) {
		if (!userId) throw new Error('User not found')

		const trades = await tradeRepository.findSendedByReceiverId(userId)

		return trades
	},

	async getPendingTrade(senderId: string, receiverId: string) {
		if (!senderId) throw new Error('Sender not found')
		if (!receiverId) throw new Error('Receiver not found')

		const trade = tradeRepository.findPendingTrade(senderId, receiverId)

		if (!trade) throw new Error('Trade not found')

		return trade
	},

	async getTradeById(tradeId: string) {
		if (!tradeId) throw new Error('Trade ID not found')

		const trade = await tradeRepository.findById(tradeId)

		if (!trade) throw new Error('Trade not found')

		return trade
	},

	async createBlankTrade(senderId: string, receiverId: string) {
		if (!senderId) throw new Error('Sender not found')
		if (!receiverId) throw new Error('Receiver not found')

		return tradeRepository.createBlankTrade(senderId, receiverId)
	},

	async sendTrade(tradeId: string, tradeItems: TradeItem[]) {
		if (!tradeId) throw new Error('Trade ID not found')
		if (tradeItems.length == 0) throw new Error('No items to trade attached')

		if (tradeItems.length > 40)
			throw new Error('Max amount of cards to trade - 20')

		return tradeRepository.sendTradeWithItems(tradeId, tradeItems)
	},

	async acceptTrade(tradeId: string, currentUserId: string) {
		return await prisma.$transaction(async tx => {
			const trade = await tradeRepository.findById(tradeId, tx)

			if (!trade || trade.status !== 'SENDED') {
				throw new Error('Trade is inactive or not exists')
			}
			if (trade.receiverId !== currentUserId) {
				throw new Error('Only receiver can accept this trade')
			}

			for (const item of trade.items) {
				if (item.userCard.ownerId !== item.ownerId) {
					throw new Error(
						`Card ${item.userCardId} is not more obtained by owner. Trade is invalid.`,
					)
				}
			}

			const updatePromises = trade.items.map(item => {
				const newOwnerId =
					item.ownerId === trade.senderId ? trade.receiverId : trade.senderId

				return tx.userCard.update({
					where: { id: item.userCardId },
					data: { ownerId: newOwnerId },
				})
			})

			await Promise.all(updatePromises)

			const completedTrade = await tradeRepository.updateTradeStatus(
				tradeId,
				TradeStatus.ACCEPTED,
				tx,
			)

			const cardIds = trade.items.map(i => i.userCardId)
			await tx.trade.updateMany({
				where: {
					id: { not: tradeId },
					status: { in: ['PENDING', 'SENDED'] },
					items: { some: { userCardId: { in: cardIds } } },
				},
				data: { status: TradeStatus.CANCELLED },
			})

			return completedTrade
		})
	},

	async updateTradeStatus(tradeId: string, status: TradeStatus) {
		if (!tradeId) throw new Error('Trade not found')
		if (!status) throw new Error('Status not provided')

		const trade = await tradeRepository.findByIdWithoutData(tradeId)
		if (!trade) throw new Error('Trade is not exists')

		const updatedTrade = tradeRepository.updateTradeStatus(tradeId, status)

		return updatedTrade
	},
}
