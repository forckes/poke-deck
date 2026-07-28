'use client'

import { useState, useTransition } from 'react'
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Field, FieldGroup } from '@/components/ui/field'
import { Button } from '@/components/ui/button'
import { Check, Loader2, Pencil } from 'lucide-react'
import { updateBannerColorAction } from '@/lib/actions/user.actions'

interface ProfileBannerProps {
	bannerColor?: string | null
	isCurrentUser: boolean
}

export function ProfileBanner({
	bannerColor = '#ffffff',
	isCurrentUser,
}: ProfileBannerProps) {
	const [color, setColor] = useState(bannerColor || '#ffffff')
	const [isPending, startTransition] = useTransition()
	const [isSuccess, setIsSuccess] = useState(false)
	const [error, setError] = useState<string | undefined>('')

	const handleDialogReset = () => {
		setError('')
		setIsSuccess(false)
	}

	const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
		event.preventDefault()
		setError('')

		startTransition(async () => {
			try {
				const result = await updateBannerColorAction(color)
				if (result?.success) {
					setIsSuccess(true)
					setTimeout(() => setIsSuccess(false), 2000)
				} else {
					setError('Failed to update banner color')
				}
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
			} catch (err: any) {
				setError(err.message || 'An error occurred')
			}
		})
	}

	const bannerContent = (
		<div
			style={{ backgroundColor: color }}
			className={`h-44 md:h-52 w-full relative overflow-hidden transition-colors duration-300 ${
				isCurrentUser ? 'group cursor-pointer' : ''
			}`}
		>
			<div className='absolute inset-0 bg-black/10' />

			{isCurrentUser && (
				<div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10'>
					<div className='flex items-center gap-2 bg-primary border-white border text-white px-4 py-2 rounded-full backdrop-blur-sm shadow-lg text-xs font-semibold'>
						<Pencil className='w-4 h-4' />
						Change Banner Color
					</div>
				</div>
			)}

			<div className='absolute right-10 top-1/2 -translate-y-1/2 opacity-90 pointer-events-none'>
				<div className='w-24 h-24 rounded-full border-[6px] border-white relative flex items-center justify-center'>
					<div className='w-full h-1.5 bg-white absolute top-1/2 -translate-y-1/2' />
					<div className='w-8 h-8 rounded-full border-[6px] border-white bg-transparent z-10' />
				</div>
			</div>
		</div>
	)

	if (!isCurrentUser) {
		return bannerContent
	}

	return (
		<Dialog>
			<DialogTrigger asChild onClick={handleDialogReset}>
				{bannerContent}
			</DialogTrigger>

			<DialogContent className='sm:max-w-sm'>
				<form onSubmit={handleSubmit}>
					<DialogHeader className='mt-2'>
						<DialogTitle>Edit banner color</DialogTitle>
						<DialogDescription>
							Choose a new background color for your profile banner.
						</DialogDescription>
					</DialogHeader>

					<FieldGroup className='py-6'>
						<Field>
							<Label htmlFor='banner-color'>Color</Label>
							<div className='flex items-center gap-3 mt-1.5'>
								<div
									className='w-10 h-10 rounded-lg border shadow-sm shrink-0 overflow-hidden relative cursor-pointer'
									style={{ backgroundColor: color }}
								>
									<input
										id='banner-color'
										type='color'
										value={color}
										onChange={e => setColor(e.target.value)}
										className='absolute -inset-4 w-20 h-20 opacity-0 cursor-pointer'
									/>
								</div>
								<Input
									type='text'
									value={color}
									onChange={e => setColor(e.target.value)}
									className='font-mono uppercase'
									maxLength={7}
								/>
							</div>
						</Field>

						{error && <p className='text-sm text-red-500 mt-2'>{error}</p>}
					</FieldGroup>

					<DialogFooter>
						<DialogClose asChild>
							<Button variant='outline' className='flex-1'>
								Cancel
							</Button>
						</DialogClose>
						<Button type='submit' className='flex-2' disabled={isPending}>
							{isPending && <Loader2 className='animate-spin' />}
							{isSuccess && (
								<>
									<Check /> Saved
								</>
							)}
							{!isPending && !isSuccess && 'Save changes'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
