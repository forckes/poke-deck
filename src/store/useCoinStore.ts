import { create } from 'zustand'

interface CoinState {
	coins: number
	setCoins: (coins: number) => void

	addCoinsLocal: (amount: number) => void
	subtractCoinsLocal: (amount: number) => void
}

export const useCoinStore = create<CoinState>(set => ({
	coins: 0,
	setCoins: coins => set({ coins }),

	addCoinsLocal: amount => set(state => ({ coins: state.coins + amount })),

	subtractCoinsLocal: amount =>
		set(state => ({ coins: Math.max(0, state.coins - amount) })),
}))
