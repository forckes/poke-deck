import { coinRepository } from '../repositories/coin.repository'

export const coinService = {
	addCoins: async (userId: string, amount: number) => {
		if (amount < 0) {
			throw new Error('Invalid amount')
		}

		return coinRepository.updateUserCoins(userId, amount)
	},

	resetCoins: async (userId: string) => {
		return coinRepository.setCoins(userId, 0)
	},
}
