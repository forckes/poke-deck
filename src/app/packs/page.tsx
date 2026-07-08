'use client'

import { PackType } from '@/generated/enums'
import PackOpener from '@/components/PokemonPack/Pack'
import { Button } from '@/components/ui/button'
import { usePokemonPack } from '@/components/PokemonPack/hooks/usePokemonPack'
import Balatro from '@/components/Balatro'

export default function PacksPage() {
	const { state, status, functions } = usePokemonPack()

	return (
		<div className='relative min-h-[calc(100vh-60px)] w-full flex items-center justify-center p-8 bg-neutral-950 overflow-hidden'>
			<div className='absolute inset-0 z-0 pointer-events-none'>
				<Balatro
					spinRotation={-2}
					spinSpeed={7}
					color1='#ffffff'
					color2='#8072CB'
					color3='#4931EE'
					contrast={3.5}
					lighting={0.4}
					spinAmount={0.25}
					pixelFilter={450}
				/>
			</div>

			<div className='relative z-10 w-full max-w-4xl flex flex-col items-center justify-center text-white'>
				<div className='flex justify-center items-center mb-12'>
					<h1 className='text-4xl md:text-5xl font-extrabold tracking-tight text-white text-center drop-shadow-sm'>
						Pokémon Pack Shop
					</h1>
				</div>

				<div className='flex justify-center mb-12'>
					<div className='inline-flex h-12 items-center justify-center rounded-xl bg-primary/20 backdrop-blur-md p-1 border border-white/20 shadow-2xl'>
						<Button
							disabled={status.isBursting}
							onClick={() => functions.handleSelectPackType(PackType.COMMON)}
							variant={
								state.selectedPackType === PackType.COMMON ? 'default' : 'ghost'
							}
							size='sm'
							className={`px-6 h-10 font-bold rounded-lg transition-all duration-200 ${
								state.selectedPackType === PackType.COMMON
									? 'bg-primary text-white shadow-[0_0_15px_rgba(139,92,246,0.3)] border border-primary-foreground/10 scale-[1.02]'
									: 'text-white hover:text-white/80 hover:bg-white/5 border-transparent'
							}`}
						>
							Common Pack
						</Button>

						<Button
							disabled={status.isBursting}
							onClick={() => functions.handleSelectPackType(PackType.EPIC)}
							variant={
								state.selectedPackType === PackType.EPIC ? 'default' : 'ghost'
							}
							size='sm'
							className={`px-6 h-10 font-bold rounded-lg transition-all duration-200 ${
								state.selectedPackType === PackType.EPIC
									? 'bg-primary text-white shadow-[0_0_15px_rgba(139,92,246,0.3)] border border-primary-foreground/10 scale-[1.02]'
									: 'text-white hover:text-white/80 hover:bg-white/5 border-transparent'
							}`}
						>
							Epic Pack
						</Button>

						<Button
							disabled={status.isBursting}
							onClick={() => functions.handleSelectPackType(PackType.LEGENDARY)}
							variant={
								state.selectedPackType === PackType.LEGENDARY
									? 'default'
									: 'ghost'
							}
							size='sm'
							className={`px-6 h-10 font-bold rounded-lg transition-all duration-200 ${
								state.selectedPackType === PackType.LEGENDARY
									? 'bg-primary text-white shadow-[0_0_15px_rgba(139,92,246,0.3)] border border-primary-foreground/10 scale-[1.02]'
									: 'text-white hover:text-white/80 hover:bg-white/5 border-transparent'
							}`}
						>
							Legendary Pack
						</Button>
					</div>
				</div>

				<div>
					<PackOpener state={state} status={status} functions={functions} />
				</div>
			</div>
		</div>
	)
}
