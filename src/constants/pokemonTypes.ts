type PokemonTypeConfig = {
	color: string
	texture: string
	text: 'light' | 'dark'
	energy: string
}

export type RarityConfig = {
	border: string
	class: string
	scale: number
	blur: number
	glare: number
}

export const rarityColors: Record<string, RarityConfig> = {
	COMMON: {
		border: 'border-gray-300',
		class: '',
		scale: 1.15,
		blur: 30,
		glare: 1,
	},
	EPIC: {
		border: 'border-purple-300',
		class: 'rarity-epic',
		scale: 1.15,
		blur: 45,
		glare: 2,
	},
	LEGENDARY: {
		border: 'border-yellow-300',
		class: 'rarity-legendary',
		scale: 1.15,
		blur: 60,
		glare: 3,
	},
}

export type PokemonType = keyof typeof pokemonTypes

export const pokemonTypes: Record<string, PokemonTypeConfig> = {
	fire: {
		color: '#EE8130',
		texture: '/type-textures/fire.png',
		text: 'light',
		energy: '/energy/fire.png',
	},
	water: {
		color: '#6390F0',
		texture: '/type-textures/water.png',
		text: 'light',
		energy: '/energy/water.png',
	},
	electric: {
		color: '#F7D02C',
		texture: '/type-textures/electric.png',
		text: 'dark',
		energy: '/energy/electric.png',
	},
	grass: {
		color: '#7AC74C',
		texture: '/type-textures/grass.png',
		text: 'dark',
		energy: '/energy/grass.png',
	},
	ghost: {
		color: '#735797',
		texture: '/type-textures/ghost.png',
		text: 'light',
		energy: '/energy/ghost.png',
	},
	dark: {
		color: '#705746',
		texture: '/type-textures/dark.png',
		text: 'light',
		energy: '/energy/dark.png',
	},
	steel: {
		color: '#B7B7CE',
		texture: '/type-textures/steel.png',
		text: 'light',
		energy: '/energy/steel.png',
	},
	fighting: {
		color: '#C22E28',
		texture: '/type-textures/fighting.png',
		text: 'light',
		energy: '/energy/fighting.png',
	},
	dragon: {
		color: '#6F35FC',
		texture: '/type-textures/dragon.png',
		text: 'light',
		energy: '/energy/dragon.png',
	},
	fairy: {
		color: '#D685AD',
		texture: '/type-textures/fairy.png',
		text: 'dark',
		energy: '/energy/fairy.png',
	},
	ground: {
		color: '#E2BF65',
		texture: '/type-textures/ground.png',
		text: 'dark',
		energy: '/energy/ground.png',
	},
	bug: {
		color: '#A6B91A',
		texture: '/type-textures/bug.png',
		text: 'dark',
		energy: '/energy/bug.png',
	},
	flying: {
		color: '#A98FF3',
		texture: '/type-textures/flying.png',
		text: 'dark',
		energy: '/energy/flying.png',
	},
	poison: {
		color: '#A33EA1',
		texture: '/type-textures/poison.png',
		text: 'light',
		energy: '/energy/poison.png',
	},
	psychic: {
		color: '#F95587',
		texture: '/type-textures/psychic.png',
		text: 'light',
		energy: '/energy/psychic.png',
	},
	ice: {
		color: '#96D9D6',
		texture: '/type-textures/ice.png',
		text: 'dark',
		energy: '/energy/ice.png',
	},
	normal: {
		color: '#A8A77A',
		texture: '/type-textures/default-texture.png',
		text: 'dark',
		energy: '/energy/normal.png',
	},
	rock: {
		color: '#B6A136',
		texture: '/type-textures/fighting.png',
		text: 'dark',
		energy: '/energy/rock.png',
	},
}
