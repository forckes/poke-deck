'use client'

import { useEffect, useState } from 'react'
import { ChevronUp } from 'lucide-react'
import { Button } from './ui/button'

export default function ScrollToTop() {
	const [isVisible, setIsVisible] = useState(false)

	useEffect(() => {
		const toggleVisibility = () => {
			if (window.scrollY > 300) {
				setIsVisible(true)
			} else {
				setIsVisible(false)
			}
		}

		window.addEventListener('scroll', toggleVisibility, { passive: true })
		return () => window.removeEventListener('scroll', toggleVisibility)
	}, [])

	const scrollToTop = () => {
		window.scrollTo({
			top: 0,
			behavior: 'smooth',
		})
	}

	return (
		<Button
			onClick={scrollToTop}
			aria-label='Scroll to top'
			variant='outline'
			size='lg'
			
			className={`fixed bottom-8 right-8 z-50 ${
				isVisible
					? 'translate-y-0 opacity-100 pointer-events-auto'
					: 'translate-y-10 opacity-0 pointer-events-none'
			}`}
		>
			<ChevronUp size={24} strokeWidth={3} />
		</Button>
	)
}
