import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
	return (
		<div className='flex flex-col items-center justify-center h-[calc(100vh-85px)] text-center p-4'>
			<h1 className='text-6xl font-extrabold mb-2'>404</h1>
			<h2 className='text-2xl font-semibold mb-4'>Page not found</h2>
			<Button asChild>
				<Link href='/'>Go back to main page</Link>
			</Button>
		</div>
	)
}
