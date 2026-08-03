'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Rarity } from '@/generated/enums'
import { claimEvolutionRewardAction } from '@/lib/actions/user-card.actions'
import { useCoinStore } from '@/store/useCoinStore'
import { toast } from 'sonner'

interface Props {
	chainId: number
	pokemonId: number
	rarity: Rarity
	allObtained: boolean
	alreadyClaimed: boolean
	coinsAmount: number
}

export function EvolutionRewardButton({
	chainId,
	pokemonId,
	rarity,
	allObtained,
	alreadyClaimed,
	coinsAmount,
}: Props) {
	const [loading, setLoading] = useState(false)
	const router = useRouter()
	const addCoinsLocal = useCoinStore(state => state.addCoinsLocal)

	const handleClaim = async () => {
		if (!allObtained || alreadyClaimed || loading) return

		setLoading(true)

		const result = await claimEvolutionRewardAction(chainId, rarity, pokemonId)
		setLoading(false)

		if (result.success) {
			toast.success(`Reward of ${coinsAmount} coins claimed`, {
				testId: 'evolution-reward',
			})
			addCoinsLocal(coinsAmount)
			router.refresh()
		} else {
			toast.error(result.error ?? 'Failed to claim reward')
		}
	}

	if (!allObtained) {
		return (
			<Button
				disabled
				variant='outline'
				className='w-full mt-6 bg-gray-500/10 text-gray-400'
			>
				Collect all evolutions to earn {coinsAmount} coins
			</Button>
		)
	}

	if (alreadyClaimed) {
		return (
			<Button
				disabled
				variant='outline'
				className='w-full mt-6 bg-primary/20 text-primary border-primary'
			>
				Evolution Reward Claimed!
			</Button>
		)
	}

	return (
		<div className='w-full mt-6 flex flex-col items-center'>
			<Button
				onClick={handleClaim}
				disabled={loading}
				className={`w-full flex items-center justify-center gap-2 group relative overflow-hidden ${
					rarity === 'LEGENDARY'
						? 'bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white'
						: rarity === 'EPIC'
							? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
							: 'bg-primary text-primary-foreground'
				}`}
			>
				<div className='absolute inset-0 bg-white/20 translate-y-full group-hover:opacity-80 transition-transform duration-300 pointer-events-none' />
				<span className='font-bold'>Claim {coinsAmount} Coins!</span>
				<Sparkles
					size={16}
					className={loading ? 'animate-spin' : 'animate-pulse'}
				/>
			</Button>
		</div>
	)
}
