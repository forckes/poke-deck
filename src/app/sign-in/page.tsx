'use client'

import SignIn from '@/components/Auth/SignIn/SignIn'
import dynamic from 'next/dynamic'
const PixelBlast = dynamic(() => import('@/components/PixelBlast'), {
	ssr: false,
})

export default function SignInPage() {
	return (
		<div className='relative min-h-[calc(100vh-60px)] w-full bg-neutral-950 overflow-hidden'>
			<div className='absolute inset-0 z-0 pointer-events-none'>
				<PixelBlast
					variant='square'
					pixelSize={3}
					color='#5731ee'
					patternScale={3.5}
					patternDensity={1.3}
					enableRipples={false}
					rippleSpeed={0.3}
					rippleThickness={0.1}
					rippleIntensityScale={1}
					speed={0.9}
					transparent
					edgeFade={0.2}
				/>
			</div>

			<main className='relative z-10 max-w-md h-[calc(100vh-60px)] flex items-center justify-center flex-col mx-auto p-6 text-white'>
				<SignIn />
			</main>
		</div>
	)
}
