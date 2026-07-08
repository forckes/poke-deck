import { signUp } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export const useSignUp = () => {
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

		const res = await signUp.email({
			name: formData.get('name') as string,
			email: formData.get('email') as string,
			password: formData.get('password') as string,
			username: formData.get('username') as string,
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
		functions: { handleSubmit, setError, setTurnstileToken },
	}
}
