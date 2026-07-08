/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, useRef } from 'react'
import { pusherClient } from '@/lib/pusherClient'
import { Button } from '@/components/ui/button'
import { useSession } from '@/lib/auth-client'
import { useCoinStore } from '@/store/useCoinStore'
import { getUserCoinsAction } from '@/lib/actions/coin.actions'
import { toast } from 'sonner'

const GROWTH_RATE = 0.00006
const LATENCY_BUFFER = 250

type Bet = {
	userId: string
	username: string
	betAmount: number
	cashOutAt: number | null
	winnings: number | null
}

const getHistoryBadgeColor = (val: number) => {
	if (val < 1.5) return 'bg-red-950/80 text-red-400 border-red-900/60'
	if (val < 2) return 'bg-amber-950/80 text-amber-400 border-amber-900/60'
	if (val < 5) return 'bg-emerald-950/80 text-emerald-400 border-emerald-900/60'
	if (val < 20) return 'bg-blue-950/80 text-blue-400 border-blue-900/60'
	return 'bg-purple-950/80 text-purple-400 border-purple-900/60'
}

const getThemeColor = (
	val: number,
	status: 'waiting' | 'playing' | 'crashed',
) => {
	if (status === 'crashed') {
		return {
			text: 'text-red-500',
			bg: 'bg-zinc-950 border-red-500/50',
			hex: '#ef4444',
		}
	}
	if (status === 'waiting') {
		return {
			text: 'text-white/50',
			bg: 'bg-zinc-950 border-zinc-800/80',
			hex: '#8b5cf6',
		}
	}
	return {
		text: 'text-primary',
		bg: 'bg-zinc-950 border-zinc-800/80',
		hex: '#8b5cf6',
	}
}

export default function CrashGame() {
	const { data: session } = useSession()
	const userId = session?.user?.id
	const coins = useCoinStore(state => state.coins)
	const addCoinsLocal = useCoinStore(state => state.addCoinsLocal)
	const setCoins = useCoinStore(state => state.setCoins)

	const [status, setStatus] = useState<'waiting' | 'playing' | 'crashed'>(
		'waiting',
	)
	const [multiplier, setMultiplier] = useState(1.0)
	const [betAmount, setBetAmount] = useState(10)
	const [autoCashoutEnabled, setAutoCashoutEnabled] = useState<boolean>(false)
	const [autoCashoutMultiplier, setAutoCashoutMultiplier] = useState<
		number | ''
	>(2.0)
	const [myBet, setMyBet] = useState<Bet | null>(null)
	const [bets, setBets] = useState<Record<string, Bet>>({})
	const [history, setHistory] = useState<{ id: string; crashPoint: number }[]>(
		[],
	)

	const [countdown, setCountdown] = useState(0)

	const requestRef = useRef<number | undefined>(undefined)
	const startTimeRef = useRef<number | null>(null)

	const statusRef = useRef(status)
	const myBetRef = useRef(myBet)
	const autoCashoutEnabledRef = useRef(autoCashoutEnabled)
	const autoCashoutMultiplierRef = useRef(autoCashoutMultiplier)
	const betAmountRef = useRef(betAmount)
	const coinsRef = useRef(coins)
	const hasCashedOutRef = useRef(false)

	useEffect(() => {
		statusRef.current = status
	}, [status])

	useEffect(() => {
		myBetRef.current = myBet
	}, [myBet])

	useEffect(() => {
		autoCashoutEnabledRef.current = autoCashoutEnabled
	}, [autoCashoutEnabled])

	useEffect(() => {
		autoCashoutMultiplierRef.current = autoCashoutMultiplier
	}, [autoCashoutMultiplier])

	useEffect(() => {
		betAmountRef.current = betAmount
	}, [betAmount])

	useEffect(() => {
		coinsRef.current = coins
	}, [coins])

	const autoPlaceBet = async () => {
		const amount = betAmountRef.current
		const mult = autoCashoutMultiplierRef.current
		const currentCoins = coinsRef.current

		if (amount < 10 || amount > 5000) return
		if (currentCoins < amount) {
			console.log('Insufficient coins for auto-bet')
			setAutoCashoutEnabled(false)
			return
		}

		setMyBet({
			userId: userId!,
			username: session?.user?.name || 'Me',
			betAmount: amount,
			cashOutAt: null,
			winnings: null,
		})
		setCoins(currentCoins - amount)

		const res = await fetch('/api/crash-game/bet', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				betAmount: amount,
				autoCashoutMultiplier:
					autoCashoutEnabledRef.current && mult ? Number(mult) : null,
			}),
		})
		const data = await res.json()
		if (!data.success) {
			console.error(data.error)
			setMyBet(null)
			addCoinsLocal(amount)
			setAutoCashoutEnabled(false)
			toast.error(`Auto-bet failed: ${data.error}`)
		}
	}

	const autoPlaceBetRef = useRef(autoPlaceBet)
	useEffect(() => {
		autoPlaceBetRef.current = autoPlaceBet
	}, [autoPlaceBet])

	useEffect(() => {
		if (userId)
			getUserCoinsAction().then(res => res?.coins && setCoins(res.coins))

		fetch('/api/crash-game')
			.then(r => r.json())
			.then(state => {
				setStatus(state.status)
				setBets(state.bets || {})
				setHistory(state.history || [])
				if (state.status === 'waiting' && state.startTime) {
					setCountdown(
						Math.max(0, Math.floor((state.startTime - Date.now()) / 1000)),
					)
				}
				if (userId && state.bets && state.bets[userId]) {
					setMyBet(state.bets[userId])
				}
			})

		const channel = pusherClient.subscribe('crash-game')

		channel.bind(
			'game-waiting',
			(data: { startTime: number; roundId: string }) => {
				statusRef.current = 'waiting'
				setStatus('waiting')
				setMultiplier(1.0)
				setBets({})
				setMyBet(null)
				setCountdown(10)
				hasCashedOutRef.current = false

				if (autoCashoutEnabledRef.current) {
					autoPlaceBetRef.current()
				}
			},
		)

		channel.bind('game-started', (data: { startTime: number }) => {
			statusRef.current = 'playing'
			setStatus('playing')
			startTimeRef.current = data.startTime
			setMultiplier(1.0)
			hasCashedOutRef.current = false
		})

		channel.bind('game-crashed', (data: { crashPoint: number }) => {
			statusRef.current = 'crashed'
			setStatus('crashed')
			setMultiplier(data.crashPoint)
			if (myBetRef.current && !myBetRef.current.cashOutAt) {
				setMyBet(null)
			}
			setHistory(prev =>
				[
					{ id: `round_${Date.now()}`, crashPoint: data.crashPoint },
					...prev,
				].slice(0, 10),
			)
		})

		channel.bind('new-bet', (bet: any) => {
			setBets(prev => ({
				...prev,
				[bet.userId]: { ...bet, cashOutAt: null, winnings: null },
			}))
		})

		channel.bind(
			'cashout',
			(data: { userId: string; multiplier: number; winnings: number }) => {
				setBets(prev => {
					const b = prev[data.userId]
					if (!b) return prev
					return {
						...prev,
						[data.userId]: {
							...b,
							cashOutAt: data.multiplier,
							winnings: data.winnings,
						},
					}
				})
				if (data.userId === userId) {
					setMyBet(prev =>
						prev
							? { ...prev, cashOutAt: data.multiplier, winnings: data.winnings }
							: null,
					)
					getUserCoinsAction().then(res => res?.coins && setCoins(res.coins))
				}
			},
		)

		return () => {
			channel.unbind_all()
			channel.unsubscribe()
		}
	}, [userId])

	useEffect(() => {
		let interval: any
		if (status === 'waiting') {
			interval = setInterval(() => {
				setCountdown(c => Math.max(0, c - 1))
			}, 1000)
		}
		return () => clearInterval(interval)
	}, [status])

	const cashOut = async () => {
		const res = await fetch('/api/crash-game/cashout', { method: 'POST' })
		const data = await res.json()
		if (data.error) {
			console.error(data.error)
		}
	}

	const animate = () => {
		if (statusRef.current === 'playing' && startTimeRef.current) {
			// eslint-disable-next-line react-hooks/purity
			const ms = Date.now() - startTimeRef.current - LATENCY_BUFFER
			const current = Math.max(1.0, Math.exp(GROWTH_RATE * ms))
			setMultiplier(current)

			if (
				myBetRef.current &&
				!myBetRef.current.cashOutAt &&
				autoCashoutEnabledRef.current &&
				autoCashoutMultiplierRef.current &&
				current >= Number(autoCashoutMultiplierRef.current) &&
				!hasCashedOutRef.current
			) {
				hasCashedOutRef.current = true
				cashOut()
			}
		}
		requestRef.current = requestAnimationFrame(animate)
	}

	useEffect(() => {
		requestRef.current = requestAnimationFrame(animate)
		return () => cancelAnimationFrame(requestRef.current!)
	}, [])

	const placeBet = async () => {
		if (betAmount < 10 || betAmount > 5000)
			return toast.error('Bet must be between 10 and 5000')
		if (coins < betAmount) return toast.error('Insufficient coins')

		setMyBet({
			userId: userId!,
			username: session?.user?.name || 'Me',
			betAmount,
			cashOutAt: null,
			winnings: null,
		})
		setCoins(coins - betAmount)

		const res = await fetch('/api/crash-game/bet', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				betAmount,
				autoCashoutMultiplier:
					autoCashoutEnabled && autoCashoutMultiplier
						? Number(autoCashoutMultiplier)
						: null,
			}),
		})
		const data = await res.json()
		if (!data.success) {
			toast.error(data.error)
			setMyBet(null)
			setCoins(coins + betAmount)
		}
	}

	const canvasRef = useRef<HTMLCanvasElement>(null)
	useEffect(() => {
		const canvas = canvasRef.current
		if (!canvas) return
		const ctx = canvas.getContext('2d')
		if (!ctx) return

		const width = canvas.width
		const height = canvas.height
		ctx.clearRect(0, 0, width, height)

		if (status === 'waiting') return

		const theme = getThemeColor(multiplier, status)

		const startX = 50
		const endX = width - 60
		const startY = height - 50
		const endY = 60

		const maxGraphMultiplier = Math.max(2, multiplier * 1.15)

		ctx.beginPath()

		const points = 80
		for (let i = 0; i <= points; i++) {
			const progress = i / points
			const m = Math.pow(multiplier, progress)

			const x = startX + progress * (endX - startX)
			const yRatio = (m - 1) / (maxGraphMultiplier - 1)
			const y = startY - yRatio * (startY - endY)

			if (i === 0) {
				ctx.moveTo(x, y)
			} else {
				ctx.lineTo(x, y)
			}
		}

		ctx.strokeStyle = status === 'crashed' ? '#ef4444' : theme.hex
		ctx.lineWidth = 5
		ctx.stroke()

		const lastX = endX
		const lastY =
			startY - ((multiplier - 1) / (maxGraphMultiplier - 1)) * (startY - endY)

		ctx.beginPath()
		ctx.arc(lastX, lastY, 12, 0, Math.PI * 2)
		ctx.shadowBlur = 25
		ctx.shadowColor = status === 'crashed' ? '#ef4444' : theme.hex
		ctx.fillStyle = status === 'crashed' ? '#ef4444' : theme.hex
		ctx.fill()
		ctx.shadowBlur = 0
	}, [multiplier, status])

	const currentTheme = getThemeColor(multiplier, status)

	const possibleWinnings = myBet ? Math.floor(myBet.betAmount * multiplier) : 0

	return (
		<div className='max-w-6xl mx-auto px-4 py-8 flex gap-8 flex-col lg:flex-row mt-10'>
			<div className='flex-1 flex flex-col gap-6'>
				<div className='flex gap-2 items-center overflow-x-auto py-2 px-3 max-w-full rounded-xl border border-primary/50 shadow-inner min-h-12 custom-scrollbar'>
					<div className='flex gap-2 flex-row-reverse overflow-x-auto py-0.5'>
						{history.map(round => (
							<div
								key={round.id}
								className={`px-3 py-1 rounded-md border text-sm font-black shrink-0 shadow-sm transition-all hover:scale-105 ${getHistoryBadgeColor(round.crashPoint)}`}
							>
								{round.crashPoint.toFixed(2)}x
							</div>
						))}
						{history.length === 0 && (
							<span className='text-xs text-gray-500 italic'>
								No rounds logged yet
							</span>
						)}
					</div>
				</div>

				<div
					className={`relative w-full h-100 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 border-4 ${currentTheme.bg}`}
				>
					<canvas
						ref={canvasRef}
						width={800}
						height={400}
						className='absolute inset-0 w-full h-full opacity-80'
					/>

					<div className='absolute inset-0 flex flex-col items-center justify-center pointer-events-none'>
						{status === 'waiting' ? (
							<div className='text-center'>
								<h2 className='text-3xl text-white/50 font-bold uppercase mb-2'>
									Starting In
								</h2>
								<p className='text-6xl text-white font-black'>{countdown}s</p>
							</div>
						) : (
							<div className='text-center'>
								<h1
									className={`text-8xl font-black tracking-tighter transition-all duration-150 ${currentTheme.text}`}
								>
									{multiplier.toFixed(2)}x
								</h1>
								{status === 'crashed' && (
									<p className='text-red-500 font-bold text-xl uppercase mt-2 tracking-widest'>
										Crashed
									</p>
								)}
							</div>
						)}
					</div>
				</div>

				<div className='bg-white/80 dark:bg-black/50 p-6 rounded-3xl border border-white/20 shadow-xl'>
					{myBet?.cashOutAt ? (
						<div className='w-full p-4 bg-green-500/20 border border-green-500 rounded-xl text-center mb-6'>
							<p className='text-green-500 font-bold text-lg'>
								Cashed out at {myBet.cashOutAt.toFixed(2)}x! Won{' '}
								{myBet.winnings} coins!
							</p>
						</div>
					) : null}

					<div className='flex flex-col gap-4'>
						<div className='w-full'>
							<label className='text-xs font-bold text-gray-500 uppercase block mb-1'>
								Presets
							</label>
							<div className='grid grid-cols-5 gap-2 w-full'>
								{[10, 50, 100, 500, 1000].map(val => (
									<Button
										key={val}
										type='button'
										variant={betAmount === val ? 'default' : 'outline'}
										onClick={() => setBetAmount(val)}
										disabled={status !== 'waiting' || !!myBet}
										className='w-full h-10'
									>
										{val}
									</Button>
								))}
							</div>
						</div>

						<div className='flex items-start gap-4 flex-wrap w-full'>
							<div className='grow min-w-30 mb-4'>
								<label className='text-xs font-bold text-gray-500 uppercase block mb-1'>
									Bet Amount
								</label>
								<input
									type='number'
									min={10}
									max={5000}
									value={betAmount}
									onChange={e => setBetAmount(Number(e.target.value))}
									disabled={status !== 'waiting' || !!myBet}
									className='w-full h-10 px-2 rounded-md border border-gray-200 dark:border-gray-800 bg-transparent font-bold text-center outline-none focus:border-primary text-sm'
								/>
							</div>

							<div className='flex flex-col mb-4 grow min-w-40'>
								<label className='text-xs font-bold text-gray-500 uppercase block mb-1'>
									Auto Cashout
								</label>
								<div className='flex items-center gap-3 h-10 w-full'>
									<button
										type='button'
										onClick={() => setAutoCashoutEnabled(prev => !prev)}
										className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
											autoCashoutEnabled
												? 'bg-primary'
												: 'bg-gray-200 dark:bg-gray-800'
										}`}
									>
										<span
											className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
												autoCashoutEnabled ? 'translate-x-5' : 'translate-x-0'
											}`}
										/>
									</button>

									{autoCashoutEnabled && (
										<div className='relative flex-1 animate-in fade-in slide-in-from-left-2 duration-200'>
											<input
												type='number'
												step='0.1'
												min='1.01'
												value={autoCashoutMultiplier}
												placeholder='2.0'
												onChange={e =>
													setAutoCashoutMultiplier(
														e.target.value === '' ? '' : Number(e.target.value),
													)
												}
												className='w-full h-10 rounded-md border border-gray-200 dark:border-gray-800 bg-transparent font-bold text-center outline-none focus:border-primary text-sm pr-5'
											/>
											<span className='absolute right-2 top-2.5 text-xs text-gray-400 font-bold'>
												x
											</span>
										</div>
									)}
								</div>
							</div>
						</div>

						<Button
							onClick={
								status === 'playing' && myBet && !myBet.cashOutAt
									? cashOut
									: placeBet
							}
							disabled={
								status === 'crashed' ||
								(status === 'waiting' && !!myBet) ||
								(status === 'playing' && !myBet)
							}
							className={`h-16 text-2xl font-black uppercase rounded-2xl transition-all ${
								status === 'playing' && myBet && !myBet.cashOutAt
									? 'bg-orange-500 hover:bg-orange-600 text-white'
									: 'bg-primary'
							}`}
						>
							{status === 'playing' && myBet && !myBet.cashOutAt
								? `Cash Out (+${possibleWinnings} coins)`
								: status === 'playing' && !myBet
									? 'Round in Progress'
									: myBet
										? 'Waiting for round...'
										: 'Place Bet'}
						</Button>
					</div>
				</div>
			</div>

			<div className='w-full lg:w-80 flex flex-col'>
				<div className='bg-white/80 dark:bg-black/50 p-4 rounded-2xl shadow border border-white/20 flex flex-col grow lg:h-full min-h-125 lg:min-h-0'>
					<div className='flex justify-between items-center mb-4'>
						<h3 className='font-bold text-lg uppercase'>
							Players ({Object.keys(bets).length})
						</h3>
					</div>

					<div className='flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar'>
						{Object.values(bets).map(bet => (
							<div
								key={bet.userId}
								className={`flex justify-between items-center p-3 rounded-xl border ${bet.cashOutAt ? 'bg-green-500/10 border-green-500/30' : status === 'crashed' ? 'bg-red-500/10 border-red-500/30' : 'bg-white dark:bg-black/40 border-gray-200 dark:border-gray-800'}`}
							>
								<div className='flex flex-col'>
									<span className='font-bold text-sm'>{bet.username}</span>
									<span className='text-xs text-gray-500'>
										{bet.betAmount} coins
									</span>
								</div>
								{bet.cashOutAt ? (
									<div className='text-right'>
										<p className='text-green-500 font-bold text-sm'>
											{bet.cashOutAt.toFixed(2)}x
										</p>
										<p className='text-green-600 font-black'>+{bet.winnings}</p>
									</div>
								) : status === 'crashed' ? (
									<span className='text-red-500 font-bold text-sm'>Busted</span>
								) : (
									<span className='text-gray-400 text-sm'>Playing</span>
								)}
							</div>
						))}
						{Object.keys(bets).length === 0 && (
							<p className='text-center text-gray-500 mt-10 text-sm'>
								No bets placed yet
							</p>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
