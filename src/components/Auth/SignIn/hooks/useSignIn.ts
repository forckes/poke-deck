import { signIn } from '@/lib/auth-client'
import { isE2E } from '@/utils/isE2E'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export const useSignIn = () => {
	const router = useRouter()
	const [error, setError] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
	const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
	console.log('[DEBUG Turnstile] raw siteKey:', siteKey)
	console.log('[DEBUG Turnstile] typeof siteKey:', typeof siteKey)
	console.log('[DEBUG Cleaned Key length]:', siteKey!.length)
	const tokenToSend = isE2E ? 'mock-e2e-token' : turnstileToken

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault()
		setError(null)

		if (!tokenToSend) {
			setError('Please complete the CAPTCHA')
			return
		}

		setIsLoading(true)

		const formData = new FormData(e.currentTarget)
		const identifier = formData.get('identifier') as string
		const password = formData.get('password') as string

		const isEmail = identifier.includes('@')

		const res = isEmail
			? await signIn.email({
					email: identifier,
					password,
					fetchOptions: {
						headers: {
							'x-captcha-response': tokenToSend,
						},
					},
				})
			: await signIn.username({
					username: identifier,
					password,
					fetchOptions: {
						headers: {
							'x-captcha-response': tokenToSend,
						},
					},
				})

		if (res.error) {
			setError(res.error.message || 'Something went wrong.')
			setIsLoading(false)
		} else {
			router.push('/')
		}
	}

	return {
		state: { error, isLoading },
		functions: { handleSubmit, setTurnstileToken, setError },
	}
}
