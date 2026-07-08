import { create } from 'zustand'
import { PokemonCardType } from '@/types/pokemon'

interface PokemonState {
  searchQuery: string
  setSearchQuery: (query: string) => void
  selectedModalCard: PokemonCardType | null
  setSelectedModalCard: (card: PokemonCardType | null) => void
}

export const usePokemonStore = create<PokemonState>((set) => ({
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  selectedModalCard: null,
  setSelectedModalCard: (card) => set({ selectedModalCard: card }),
}))