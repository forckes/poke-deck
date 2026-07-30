import { useEffect, useState } from 'react'
import { getPokemonsSpritesByIds } from '@/utils/helpers/getPokemonsSpritesByIds'
import { getPokemonCardsByIds } from '@/utils/helpers/getPokemonCardsByIds'
import { useQuery } from '@tanstack/react-query'
import { Variants } from 'motion/react'

type CardsIds<T> = [T, T, T, T, T]

export const useHeroSection = (amount: number, cardsIds: CardsIds<number>) => {
	const [pokemonSprites, setPokemonSprites] = useState<string[]>([])
	const [pokemonIds, setPokemonIds] = useState<number[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [isCardFlipped, setIsCardFlipped] = useState(false)

	const mappedLogos = pokemonSprites.map((spriteUrl, index) => ({
		src: spriteUrl,
		alt: `Pokemon ${pokemonIds[index] || index}`,
		href: `#`,
	}))

	const { data } = useQuery({
		queryKey: ['hero-pokemons-cards'],
		queryFn: () => getPokemonCardsByIds(cardsIds),
		staleTime: Infinity,
	})

	const cards = [
		{
			id: 0,
			className: '-translate-x-140 rotate-[-10deg] scale-105',
			dataIndex: 0,
			animation: {
				y: [-8, 8, -8],
				x: [-5, 5, -5],
				rotateZ: [-24, -20, -24],
				rotateY: [-5, 5, -5],
			},
			duration: 8,
		},
		{
			id: 1,
			className: '-translate-x-70 rotate-[-12deg] scale-120',
			dataIndex: 1,
			animation: {
				y: [-10, 10, -10],
				x: [-6, 6, -6],
				rotateZ: [-14, -10, -14],
				rotateY: [-6, 6, -6],
			},
			duration: 7,
		},
		{
			id: 2,
			className: 'scale-140 z-10',
			dataIndex: 2,
			animation: {
				y: [-12, 12, -12],
				rotateY: [-12, 12, -12],
				rotateZ: [-4, 4, -4],
			},
			duration: 6,
		},
		{
			id: 3,
			className: 'translate-x-70 rotate-[12deg] scale-120',
			dataIndex: 3,
			animation: {
				y: [-10, 10, -10],
				x: [6, -6, 6],
				rotateZ: [14, 10, 14],
				rotateY: [6, -6, 6],
			},
			duration: 7.5,
		},
		{
			id: 4,
			className: 'translate-x-140 rotate-[10deg] scale-105',
			dataIndex: 4,
			animation: {
				y: [-8, 8, -8],
				x: [5, -5, 5],
				rotateZ: [24, 20, 24],
				rotateY: [5, -5, 5],
			},
			duration: 8.5,
		},
	]

	useEffect(() => {
		const fetchPokemonSprites = async () => {
			try {
				setIsLoading(true)
				const res = await getPokemonsSpritesByIds(amount)

				if (res) {
					setPokemonSprites(res.sprites)
					setPokemonIds(res.ids)
				}
			} catch (error) {
				console.error('Error while loading Logo loop:', error)
			} finally {
				setIsLoading(false)
			}
		}

		fetchPokemonSprites()
	}, [amount])

	useEffect(() => {
		const flipInterval = setInterval(() => {
			setIsCardFlipped(true)

			setTimeout(() => {
				setIsCardFlipped(false)
			}, 3000)
		}, 10000)

		return () => clearInterval(flipInterval)
	}, [])

	const containerVariants: Variants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.25,
			},
		},
	}

	const itemVariants: Variants = {
		hidden: {
			opacity: 0,
			y: 40,
		},
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.8,
				ease: [0.22, 1, 0.36, 1],
			},
		},
	}

	return {
		state: { mappedLogos, data, cards, containerVariants, itemVariants },
		status: { isLoading, isCardFlipped },
	}
}
