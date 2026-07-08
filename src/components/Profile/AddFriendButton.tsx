'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import {
	removeFriendAction,
	sendFriendRequestAction,
} from '@/lib/actions/friend.actions'
import { FriendshipStatus } from '@/generated/enums'
import { UserPlus, Clock, UserCheck, UserMinus, User } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useSession } from '@/lib/auth-client'
import { toast } from 'sonner'

interface AddFriendButtonProps {
	targetUserId: string
	initialStatus: FriendshipStatus | null | 'NONE'
	friendshipId: string | null
}

export default function AddFriendButton({
	targetUserId,
	initialStatus,
	friendshipId,
}: AddFriendButtonProps) {
	const [isPending, startTransition] = useTransition()

	const queryClient = useQueryClient()

	const session = useSession()

	const [status, setStatus] = useState<FriendshipStatus | null | 'NONE'>(
		initialStatus,
	)
	const [loading, setLoading] = useState(false)

	const handleRemove = (requestId: string | null) => {
		if (!requestId) {
			//toast.error
			return
		}

		startTransition(async () => {
			try {
				const result = await removeFriendAction(requestId)

				if (result.success) {
					//toast.success

					await queryClient.invalidateQueries({ queryKey: ['friends'] })
					await queryClient.invalidateQueries({
						queryKey: ['pending-requests'],
					})

					setStatus('NONE')
				}
			} catch (error) {
				//toast.error
			}
		})
	}

	const handleAddFriend = async () => {
		if (status !== 'NONE') return

		try {
			setLoading(true)
			const res = await sendFriendRequestAction(targetUserId)
			if (res.success) {
				setStatus(FriendshipStatus.PENDING)
			}
		} catch (error) {
			toast.error('Failed to send friend request')
		} finally {
			setLoading(false)
		}
	}

	if (status === FriendshipStatus.ACCEPTED) {
		return (
			<Button
				variant='destructive'
				disabled={isPending}
				className='gap-2'
				onClick={() => handleRemove(friendshipId)}
			>
				<UserMinus className='w-4 h-4' />
				Remove from friends
			</Button>
		)
	}

	if (status === FriendshipStatus.PENDING) {
		return (
			<Button variant='outline' disabled className='gap-2'>
				<Clock className='w-4 h-4' />
				Pending Request
			</Button>
		)
	}

	return (
		<Button
			onClick={handleAddFriend}
			disabled={loading}
			className='gap-2 bg-primary hover:bg-primary/90 text-primary-foreground'
		>
			<UserPlus className='w-4 h-4' />
			{loading ? 'Adding...' : 'Add to friends'}
		</Button>
	)
}
