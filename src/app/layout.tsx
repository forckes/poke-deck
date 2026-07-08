import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import dynamic from 'next/dynamic'
import NextTopLoader from 'nextjs-toploader'

const Header = dynamic(() => import('@/components/Header/Header'))
import QueryProvider from '@/lib/providers/query-provider'
import { Toaster } from 'sonner'

const inter = Inter({
	variable: '--font-inter',
	subsets: ['latin'],
})

export const metadata: Metadata = {
	title: 'Poke Deck',
	description: 'Enter to the new adventure of collecting creature cards',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang='en' className={`${inter.variable} antialiased`}>
			<body className={`${inter.variable} antialiased`}>
				<QueryProvider>
					<Header />
					<NextTopLoader
						color='#4931EE'
						initialPosition={0.08}
						crawlSpeed={200}
						height={3}
						crawl={true}
						showSpinner={false}
						easing='ease'
						speed={200}
						shadow='0 0 10px #4931EE,0 0 5px #4931EE'
					/>
					<div className='fixed inset-0 flex flex-col items-center justify-center p-6 text-center lg:hidden z-[9999] bg-zinc-950 select-none'>
						<div className='max-w-md space-y-5 animate-in fade-in zoom-in-95 duration-300'>
							<div className='text-6xl animate-pulse'>🖥️</div>
							<h1 className='text-3xl font-black uppercase tracking-tighter text-red-500'>
								PC Only Version
							</h1>
							<p className='text-neutral-400 text-sm leading-relaxed font-medium'>
								Hi! Unfortunately
								<span className='text-neutral-200 font-bold px-2'>
									Poke-Deck
								</span>
								made only for wide screens.
							</p>
							<p className='text-neutral-500 text-xs bg-neutral-900/50 border border-neutral-800 p-3 rounded-xl'>
								The interface requires a wide screen. Please access it from a
								device with a wide screen.
							</p>
						</div>
					</div>
					<div className='hidden lg:block'>{children}</div>
					<Toaster position='top-center' />
				</QueryProvider>
			</body>
		</html>
	)
}
