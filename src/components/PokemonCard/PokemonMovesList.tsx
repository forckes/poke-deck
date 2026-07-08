'use client'

import React from 'react'
import { PokemonMove } from '@/types/pokemon'
import PokemonMoveItem from './PokemonMoveItem'
import { useMovesSortStore, MovesSortField } from '@/store/useMoveSortStore'

interface Props {
	moves: PokemonMove[]
}

export default function PokemonMovesList({ moves }: Props) {
	const { field, order } = useMovesSortStore()

	const sortedMoves = React.useMemo(() => {
		if (!field) return moves
		
		return [...moves].sort((a, b) => {
			const multiplier = order === 'asc' ? 1 : -1

			switch (field) {
				case MovesSortField.NAME:
					return a.name.localeCompare(b.name) * multiplier
				case MovesSortField.DAMAGE:
					const aDamage = a.damage || 0
					const bDamage = b.damage || 0
					return (aDamage - bDamage) * multiplier
				case MovesSortField.ENERGY:
					return a.typeName.localeCompare(b.typeName) * multiplier
				default:
					return 0
			}
		})
	}, [moves, field, order])

	return (
		<div className='flex flex-col justify-center items-center gap-6'>
			{sortedMoves.map(move => (
				<PokemonMoveItem 
					key={move.id} 
					move={move} 
					size='medium' 
					className='border border-gray-200 rounded-xl py-2 px-4' 
				/>
			))}
		</div>
	)
}
