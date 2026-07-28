import { Crown } from 'lucide-react'

const RankBadges = ({ rank }: { rank: number }) => {
	switch (rank) {
		case 1:
			return (
				<div className='flex items-center justify-center size-9 rounded-full bg-yellow-500 text-white font-black border border-yellow-500/50 shadow-sm'>
					<Crown className='size-5' />
				</div>
			)
		case 2:
			return (
				<div className='flex items-center justify-center size-9 rounded-full bg-slate-400 text-white font-black border border-slate-500/50 shadow-sm'>
					2
				</div>
			)
		case 3:
			return (
				<div className='flex items-center justify-center size-9 rounded-full bg-amber-700 text-white font-black border border-amber-800/30 shadow-sm'>
					3
				</div>
			)
		default:
			return (
				<div className='flex items-center justify-center size-9 rounded-full bg-primary/40 text-white font-bold text-sm border border-primary/10'>
					#{rank}
				</div>
			)
	}
}

export default RankBadges
