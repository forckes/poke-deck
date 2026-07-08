import Link from 'next/link'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { TradeStatus } from '@/generated/enums'
import {
	ArrowLeftRight,
	ArrowRight,
	Ban,
	ExternalLink,
	SendHorizonal,
	Slash,
} from 'lucide-react'

type TradeItemProps = {
	trade: {
		updatedAt: Date
		sender: {
			username: string | null
			image: string
			name: string
		}
		receiver?: {
			username: string | null
			image: string
			name: string
		}
		status: TradeStatus
		id: string
	}
	isNewView?: boolean
}

export const TradeItem = ({ trade, isNewView = false }: TradeItemProps) => {
	const formattedDate = new Intl.DateTimeFormat('uk-UA', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
	})
		.format(new Date(trade.updatedAt))
		.replace(/\./g, '-')

	return (
		<li className='border border-primary/20 bg-background/50 flex flex-col sm:flex-row justify-between items-center rounded-xl py-3 px-4 gap-4 shadow-sm hover:shadow-md transition-shadow'>
			<div className='flex flex-wrap gap-3 items-center justify-start w-full sm:w-auto'>
				<div className='flex items-center justify-center gap-3 flex-col sm:flex-row sm:justify-start'>
					<span className='text-sm text-gray-400'>{formattedDate}</span>

					<Link
						href={`/user/${trade.sender.username}`}
						className='flex items-center gap-3'
					>
						<Avatar size='lg'>
							<AvatarImage src={trade.sender.image} alt='Profile image' />
						</Avatar>
						<div className='flex flex-col'>
							<p className='text-lg font-semibold leading-tight'>
								{trade.sender.name}
							</p>
							<p className='text-sm text-gray-500'>@{trade.sender.username}</p>
						</div>
					</Link>
				</div>

				{!isNewView && (
					<>
						<div className='flex items-center justify-center px-1 mt-8 sm:mt-0'>
							{trade.status === TradeStatus.SENDED && (
								<SendHorizonal className='text-primary' />
							)}
							{trade.status === TradeStatus.ACCEPTED && (
								<ArrowLeftRight className='text-green-500' />
							)}
							{trade.status === TradeStatus.CANCELLED && (
								<Ban className='text-gray-400' />
							)}
							{trade.status === TradeStatus.DECLINED && (
								<div className='relative inline-flex items-center justify-center'>
									<ArrowRight className='text-gray-500' />
									<Slash
										className='absolute text-red-500'
										size={22}
										strokeWidth={2}
									/>
								</div>
							)}
						</div>

						<Link
							href={`/user/${trade.receiver?.username}`}
							className='flex items-center gap-3 mt-8 sm:mt-0'
						>
							<Avatar size='lg'>
								<AvatarImage src={trade.receiver?.image} alt='Profile image' />
							</Avatar>
							<div className='flex flex-col'>
								<p className='text-lg font-semibold leading-tight'>
									{trade.receiver?.name}
								</p>
								<p className='text-sm text-gray-500'>
									@{trade.receiver?.username}
								</p>
							</div>
						</Link>
					</>
				)}
			</div>

			<Button size='xs' asChild className='w-full sm:w-auto'>
				<Link href={`/trades/${trade.id}`}>
					<ExternalLink className='mr-1 h-4 w-4' /> Open
				</Link>
			</Button>
		</li>
	)
}
