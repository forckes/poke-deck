'use client'

import PixelSnow from '@/components/PixelSnow'
import { useSession } from '@/lib/auth-client'

export default function BannedPage() {
	const session = useSession()

	return (
		<div className='font-extrabold text-xl text-white bg-black'>
			<div className='absolute inset-0 z-0 pointer-events-none'>
				<PixelSnow
					color='#ffffff'
					flakeSize={0.01}
					minFlakeSize={1}
					pixelResolution={200}
					speed={1}
					density={0.3}
					direction={125}
					brightness={1}
					depthFade={8}
					farPlane={20}
					gamma={0.4545}
					variant='square'
				/>
			</div>
			<div className='wrapper flex flex-col items-center justify-center min-h-screen'>
				<div className='text-8xl text-center text-red-700 flex items-center gap-2'>
					Your account banned!
				</div>

				<div className='flex flex-col gap-4 items-center justify-center mt-12'>
					<span className='text-3xl'>
						Hi, dear @{session.data?.user.username}
					</span>
					<span>
						Your account was banned until{' '}
						<span className='text-red-700'>
							{session.data?.user.banExpires
								? new Date(session.data.user.banExpires)
										.toLocaleDateString('uk-UA')
										.replace(/\//g, '.')
								: 'permanently'}
						</span>{' '}
						by administrators for reason:
					</span>
					<span className='text-red-800'>{session.data?.user.banReason}</span>
				</div>
			</div>
		</div>
	)
}
