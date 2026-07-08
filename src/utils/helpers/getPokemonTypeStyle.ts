import { pokemonTypes, rarityColors } from '@/constants/pokemonTypes'
import { Rarity } from '@/generated/enums'

export function getPokemonTypeStyle(
	types: { type: { name: string } }[],
	rarity?: Rarity,
) {
	const mainType = types?.[0]?.type?.name

	const allTypes = types.map(t => {
		const typeName = t.type.name
		const config = pokemonTypes[typeName] || pokemonTypes['normal']
		return {
			name: typeName,
			energy: config.energy,
			color: config.color,
		}
	})

	return {
		...(pokemonTypes[mainType] ?? {
			color: '#ccc',
			texture: null,
			text: 'dark',
			energy: '/energy/normal.png',
		}),
		...(rarity ? { border: rarityColors[rarity].border } : {}),
		allTypes,
	}
}
