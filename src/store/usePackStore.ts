import { create } from 'zustand'
import type { PokemonCardType } from '@/types/pokemon'

type PackStep = 'idle' | 'opening' | 'dealt' | 'finished'

interface PackState {
	step: PackStep
	cards: PokemonCardType[]
	flippedCards: boolean[]

	startOpening: () => void
	setCards: (cards: PokemonCardType[]) => void
	flipCard: (index: number) => void
	resetPack: () => void
}

export const usePackStore = create<PackState>(set => ({
	step: 'idle',
	cards: [],
	flippedCards: [false, false, false],

	startOpening: () => set({ step: 'opening' }),

	setCards: cards =>
		set({
			cards,
			step: 'dealt',
			flippedCards: cards.map(() => false),
		}),

	flipCard: index =>
		set(state => {
			const newFlips = [...state.flippedCards]
			newFlips[index] = true

			const isFinished = newFlips.every(Boolean)

			return {
				flippedCards: newFlips,
				...(isFinished && { step: 'finished' }),
			}
		}),

	resetPack: () =>
		set({
			step: 'idle',
			cards: [],
			flippedCards: [false, false, false],
		}),
}))
