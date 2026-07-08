import { signIn } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export const useSignIn = () => {
	const router = useRouter()
	const [error, setError] = useState<string | null>(null)
	const [turnstileToken, setTurnstileToken] = useState<string | null>(null)

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault()
		setError(null)

		if (!turnstileToken) {
			setError('Please complete the CAPTCHA')
			return
		}

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
							'x-captcha-response': turnstileToken,
						},
					},
				})
			: await signIn.username({
					username: identifier,
					password,
					fetchOptions: {
						headers: {
							'x-captcha-response': turnstileToken,
						},
					},
				})

		if (res.error) {
			setError(res.error.message || 'Something went wrong.')
		} else {
			router.push('/')
		}
	}

	return {
		state: { error },
		functions: { handleSubmit, setTurnstileToken, setError },
	}
}
