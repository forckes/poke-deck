import { useEffect, useRef } from 'react'
import { PackType } from '@/generated/enums'

interface Particle {
	angle: number
	startDistance: number
	delay: number
	duration: number
	size: number
	length: number
	color: string
}

export const VacuumParticles = ({
	isActive,
	packType,
}: {
	isActive: boolean
	packType: PackType
}) => {
	const canvasRef = useRef<HTMLCanvasElement>(null)

	useEffect(() => {
		if (!isActive) return

		const canvas = canvasRef.current
		if (!canvas) return
		const ctx = canvas.getContext('2d')
		if (!ctx) return

		let animationFrameId: number
		let startTime: number | null = null

		const updateSize = () => {
			const parent = canvas.parentElement
			if (parent) {
				const size = 1000
				canvas.width = size
				canvas.height = size
				canvas.style.width = `${size}px`
				canvas.style.height = `${size}px`
			}
		}
		updateSize()

		const particleCount = 350

		let colors = ['#ffffff']
		if (packType === PackType.COMMON) {
			colors = ['#f8fafc', '#cbd5e1', '#e0f2fe', '#bae6fd']
		} else if (packType === PackType.EPIC) {
			colors = ['#581c87', '#9333ea', '#d8b4fe', '#f3e8ff']
		} else if (packType === PackType.LEGENDARY) {
			colors = [
				'#f59e0b',
				'#fbbf24',
				'#fcd34d',
				'#10b981',
				'#3b82f6',
				'#ef4444',
				'#8b5cf6',
			]
		}

		const particles: Particle[] = Array.from({ length: particleCount }).map(
			() => {
				return {
					angle: Math.random() * Math.PI * 2,
					startDistance: 200 + Math.random() * 400,
					delay: Math.random() * 1.5,
					duration: 0.3 + Math.random() * 0.4,
					size: 0.5 + Math.random() * 2,
					length: 15 + Math.random() * 40,
					color: colors[Math.floor(Math.random() * colors.length)],
				}
			},
		)

		const render = (time: number) => {
			if (!startTime) startTime = time
			const elapsed = (time - startTime) / 1000

			ctx.clearRect(0, 0, canvas.width, canvas.height)
			const centerX = canvas.width / 2
			const centerY = canvas.height / 2

			ctx.lineCap = 'round'

			ctx.globalCompositeOperation = 'lighter'

			particles.forEach(p => {
				const totalCycle = p.delay + p.duration
				let t = elapsed % totalCycle

				if (t < p.delay) return

				const progress = (t - p.delay) / p.duration
				const easeIn = progress * progress
				const currentDistance = p.startDistance * (1 - easeIn)

				let scaleX = 0
				let opacity = 0

				if (progress < 0.1) {
					const subProgress = progress / 0.1
					scaleX = subProgress
					opacity = subProgress * 0.8
				} else {
					const subProgress = (progress - 0.1) / 0.9
					scaleX = 1 - subProgress

					if (progress < 0.8) {
						const innerProgress = (progress - 0.1) / 0.7
						opacity = 0.8 + 0.2 * innerProgress
					} else {
						const innerProgress = (progress - 0.8) / 0.2
						opacity = 1 - innerProgress
					}
				}

				if (opacity <= 0 || scaleX <= 0) return

				const drawnLength = p.length * scaleX
				const halfLength = drawnLength / 2
				const startRad = currentDistance - halfLength
				const endRad = currentDistance + halfLength

				const x1 = centerX + Math.cos(p.angle) * endRad
				const y1 = centerY + Math.sin(p.angle) * endRad
				const x2 = centerX + Math.cos(p.angle) * startRad
				const y2 = centerY + Math.sin(p.angle) * startRad

				ctx.beginPath()
				ctx.moveTo(x1, y1)
				ctx.lineTo(x2, y2)

				ctx.strokeStyle = p.color

				ctx.globalAlpha = Math.max(0, opacity * 0.25)
				ctx.lineWidth = p.size * 6
				ctx.stroke()
				ctx.globalAlpha = Math.max(0, opacity)
				ctx.lineWidth = p.size
				ctx.stroke()
			})

			animationFrameId = requestAnimationFrame(render)
		}

		animationFrameId = requestAnimationFrame(render)

		return () => {
			cancelAnimationFrame(animationFrameId)
		}
	}, [isActive, packType])

	if (!isActive) return null

	return (
		<div className='absolute inset-0 pointer-events-none z-0 flex items-center justify-center overflow-visible'>
			<canvas
				ref={canvasRef}
				className='absolute pointer-events-none'
				style={{ transform: 'translate(-50%, -50%)', left: '50%', top: '50%' }}
			/>
		</div>
	)
}
