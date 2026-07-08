/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

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
import { useEffect, useState, useTransition } from 'react'
import { updateProfileAction } from '@/lib/actions/user.actions'
import { Button } from '../ui/button'
import { Check, Loader2, Pen } from 'lucide-react'
import { User } from '@/generated/client'

const EditProfileDialog = ({ targetUser }: { targetUser: User }) => {
	const [isPending, startTransition] = useTransition()
	const [isSuccess, setIsSuccess] = useState(false)
	const [error, setError] = useState<string | undefined>('')

	useEffect(() => {
		if (isSuccess) {
			const timer = setTimeout(() => setIsSuccess(false), 2000)
			return () => clearTimeout(timer)
		}
	}, [isSuccess])

	const handleDialogReset = () => {
		setError('')
		setIsSuccess(false)
	}

	const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
		event.preventDefault()

		setError('')

		const formData = new FormData(event.currentTarget)

		const name = formData.get('name') as string
		const username = formData.get('username') as string

		startTransition(async () => {
			try {
				const result = await updateProfileAction({ name, username })

				if (result?.success) {
					setIsSuccess(true)
				} else {
					setError(result?.error)
				}
			} catch (error: any) {
				setError(error)
			}
		})
	}

	return (
		<Dialog>
			<DialogTrigger asChild onClick={handleDialogReset}>
				<Button variant='outline'>
					<Pen />
					Edit profile
				</Button>
			</DialogTrigger>
			<DialogContent className='sm:max-w-sm'>
				<form onSubmit={handleSubmit}>
					<DialogHeader className='mt-2'>
						<DialogTitle>Edit profile</DialogTitle>
						<DialogDescription>
							Make changes to your profile here. Click save when you&apos;re
							done.
						</DialogDescription>
					</DialogHeader>
					<FieldGroup className='py-6'>
						<Field>
							<Label htmlFor='name-1'>Name</Label>
							<Input
								id='name-1'
								name='name'
								defaultValue={targetUser.name ?? ''}
							/>
						</Field>
						<Field>
							<Label htmlFor='username-1'>Username</Label>
							<Input
								id='username-1'
								name='username'
								defaultValue={targetUser.username ?? ''}
								pattern='^[a-z0-9]+$'
								title='Username can contain only small latin letters and numbers'
							/>
						</Field>
						{error && <p className='text-red-500'>{error}</p>}
					</FieldGroup>
					<DialogFooter>
						<DialogClose asChild>
							<Button variant='outline' className='flex-1'>
								Cancel
							</Button>
						</DialogClose>
						<Button type='submit' className='flex-2'>
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

export default EditProfileDialog
