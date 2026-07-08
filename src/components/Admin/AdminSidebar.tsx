import { Button } from '@/components/ui/button'
import {
	ArrowLeftRight,
	LayoutDashboard,
	Library,
	Rocket,
	Users,
	Award,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Tab = 'dashboard' | 'users' | 'packs' | 'trades' | 'crash' | 'evolution_rewards'

type Props = {
	activeTab: Tab
	setActiveTab: (tab: Tab) => void
}

export const AdminSidebar = ({ activeTab, setActiveTab }: Props) => {
	return (
		<aside className='w-64 shrink-0 flex flex-col gap-2 border-r border-border pr-4 min-h-[500px]'>
			<div className='px-3 py-2'>
				<h2 className='mb-2 px-4 text-lg font-semibold tracking-tight'>
					Admin Panel
				</h2>
			</div>
			<div className='flex flex-col gap-1'>
				<Button
					variant={activeTab === 'dashboard' ? 'secondary' : 'ghost'}
					className={cn(
						'w-full justify-start gap-3 px-4 py-2 font-medium',
						activeTab === 'dashboard' &&
							'bg-primary/10 text-primary hover:bg-primary/20',
					)}
					onClick={() => setActiveTab('dashboard')}
				>
					<LayoutDashboard size={18} />
					<span>Dashboard</span>
				</Button>
				<Button
					variant={activeTab === 'users' ? 'secondary' : 'ghost'}
					className={cn(
						'w-full justify-start gap-3 px-4 py-2 font-medium',
						activeTab === 'users' &&
							'bg-primary/10 text-primary hover:bg-primary/20',
					)}
					onClick={() => setActiveTab('users')}
				>
					<Users size={18} />
					<span>Users Management</span>
				</Button>
				<Button
					variant={activeTab === 'trades' ? 'secondary' : 'ghost'}
					className={cn(
						'w-full justify-start gap-3 px-4 py-2 font-medium',
						activeTab === 'trades' &&
							'bg-primary/10 text-primary hover:bg-primary/20',
					)}
					onClick={() => setActiveTab('trades')}
				>
					<ArrowLeftRight size={18} />
					<span>Trades</span>
				</Button>
				<Button
					variant={activeTab === 'packs' ? 'secondary' : 'ghost'}
					className={cn(
						'w-full justify-start gap-3 px-4 py-2 font-medium',
						activeTab === 'packs' &&
							'bg-primary/10 text-primary hover:bg-primary/20',
					)}
					onClick={() => setActiveTab('packs')}
				>
					<Library size={18} />
					<span>Packs</span>
				</Button>
				<Button
					variant={activeTab === 'evolution_rewards' ? 'secondary' : 'ghost'}
					className={cn(
						'w-full justify-start gap-3 px-4 py-2 font-medium',
						activeTab === 'evolution_rewards' &&
							'bg-primary/10 text-primary hover:bg-primary/20',
					)}
					onClick={() => setActiveTab('evolution_rewards')}
				>
					<Award size={18} />
					<span>Evolution Rewards</span>
				</Button>
				<Button
					variant={activeTab === 'crash' ? 'secondary' : 'ghost'}
					className={cn(
						'w-full justify-start gap-3 px-4 py-2 font-medium',
						activeTab === 'crash' &&
							'bg-primary/10 text-primary hover:bg-primary/20',
					)}
					onClick={() => setActiveTab('crash')}
				>
					<Rocket size={18} />
					<span>Crash game</span>
				</Button>
			</div>
		</aside>
	)
}
