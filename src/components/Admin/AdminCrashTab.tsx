import { useAdminCrash } from './hooks/useAdminCrash'
import { Button } from '@/components/ui/button'
import { Loader2, Play, Square } from 'lucide-react'

export const AdminCrashTab = () => {
	const { state, status, functions } = useAdminCrash()

	return (
		<div className='flex flex-col gap-6 w-full max-w-2xl mx-auto'>
			<div>
				<h2 className='text-2xl font-bold tracking-tight text-foreground/90'>
					Crash Game Engine
				</h2>
				<p className='text-sm text-muted-foreground mt-1'>
					Control the background execution engine for the Crash Game.
				</p>
			</div>

			<div className='border border-primary/20 bg-background/50 rounded-2xl p-8 flex flex-col items-center justify-center gap-6 shadow-sm text-center'>
				<div className='flex flex-col gap-2'>
					<span className='text-xs uppercase font-bold tracking-wider text-gray-500'>
						Engine Status
					</span>
					{status.isLoading ? (
						<div className='flex items-center gap-2 text-muted-foreground justify-center'>
							<Loader2 className='animate-spin' size={16} />
							<span>Checking status...</span>
						</div>
					) : state.isRunning ? (
						<div className='text-emerald-500 font-black text-xl tracking-wide flex items-center justify-center gap-2'>
							<span className='relative flex h-3 w-3'>
								<span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75'></span>
								<span className='relative inline-flex rounded-full h-3 w-3 bg-emerald-500'></span>
							</span>
							RUNNING
						</div>
					) : (
						<div className='text-destructive font-black text-xl tracking-wide flex items-center justify-center gap-2'>
							<span className='h-3 w-3 rounded-full bg-destructive'></span>
							STOPPED
						</div>
					)}
				</div>

				<div className='w-full max-w-sm mt-4'>
					{status.isLoading ? (
						<Button className='w-full h-16 text-lg font-bold' disabled>
							<Loader2 className='animate-spin mr-2' /> Loading
						</Button>
					) : state.isRunning ? (
						<Button
							variant='destructive'
							className='w-full h-16 text-lg font-bold shadow-md hover:shadow-lg transition-all group'
							onClick={functions.handleToggleEngine}
							disabled={state.isToggling}
						>
							{state.isToggling ? (
								<Loader2 className='animate-spin mr-2' />
							) : (
								<Square className='mr-2 group-hover:scale-110 transition-transform' fill='currentColor' size={20} />
							)}
							Stop Engine
						</Button>
					) : (
						<Button
							className='w-full h-16 text-lg font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transition-all group'
							onClick={functions.handleToggleEngine}
							disabled={state.isToggling}
						>
							{state.isToggling ? (
								<Loader2 className='animate-spin mr-2' />
							) : (
								<Play className='mr-2 group-hover:scale-110 transition-transform' fill='currentColor' size={20} />
							)}
							Start Engine
						</Button>
					)}
				</div>

				<p className='text-xs text-muted-foreground max-w-md leading-relaxed mt-2'>
					Note: If you click Stop Engine, the game loop will complete the active round and automatically stop before starting the next round.
				</p>
			</div>
		</div>
	)
}
