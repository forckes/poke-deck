'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export function BackButton() {
	const router = useRouter()

	const handleRouteBack = () => {
		const referrer = document.referrer

		if (referrer.startsWith(window.location.origin)) {
			router.back()
		} else {
			router.push('/deck')
		}
	}

	return (
		<Button variant='ghost' onClick={handleRouteBack}>
			<ArrowLeft className='mr-2 h-4 w-4' />
			Go Back
		</Button>
	)
}
