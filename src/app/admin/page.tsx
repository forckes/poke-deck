import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { AdminDashboard } from '@/components/Admin/AdminDashboard'

export default async function Page() {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (session?.user.role !== 'admin') {
		notFound()
	}

	return (
		<div className='flex flex-col items-center w-full max-w-7xl mx-auto mt-20 px-4 pb-12'>
			<AdminDashboard />
		</div>
	)
}
