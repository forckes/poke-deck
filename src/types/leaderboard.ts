export enum LeaderboardCategory {
	TOTAL_CARDS = 'TOTAL_CARDS',
	LEGENDARY_CARDS = 'LEGENDARY_CARDS',
	TRADE_COUNT = 'TRADE_COUNT',
}

export interface LeaderboardEntry {
	id: string
	name: string
	username: string
	image: string
	bannerColor: string
	score: number
	rank: number
}
