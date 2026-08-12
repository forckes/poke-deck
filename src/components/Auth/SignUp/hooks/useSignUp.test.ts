/* eslint-disable @typescript-eslint/no-explicit-any */
import { signUp } from '@/lib/auth-client'
import { act, renderHook } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useSignUp } from './useSignUp'

vi.mock('next/navigation', () => ({
	useRouter: vi.fn(),
}))

vi.mock('@/lib/auth-client', () => ({
	signUp: {
		email: vi.fn(),
	},
}))

describe('useSignUp', () => {
	const mockPush = vi.fn()

	const createFormEvent = (
		name = 'Ash Ketchum',
		email = 'ash@pokemon.com',
		password = 'pikachu123password',
		username = 'ash_ketchum',
	) => {
		const form = document.createElement('form')

		const nameInput = document.createElement('input')
		nameInput.name = 'name'
		nameInput.value = name

		const emailInput = document.createElement('input')
		emailInput.name = 'email'
		emailInput.value = email

		const passwordInput = document.createElement('input')
		passwordInput.name = 'password'
		passwordInput.value = password

		const usernameInput = document.createElement('input')
		usernameInput.name = 'username'
		usernameInput.value = username

		form.appendChild(nameInput)
		form.appendChild(emailInput)
		form.appendChild(passwordInput)
		form.appendChild(usernameInput)

		return {
			preventDefault: vi.fn(),
			currentTarget: form,
		} as unknown as React.FormEvent<HTMLFormElement>
	}

	beforeEach(() => {
		vi.clearAllMocks()

		vi.mocked(useRouter).mockReturnValue({
			push: mockPush,
		} as any)
	})

	it('should set an error when CAPTCHA token is missing', async () => {
		const { result } = renderHook(() => useSignUp())

		const event = createFormEvent()

		await act(async () => {
			await result.current.functions.handleSubmit(event)
		})

		expect(event.preventDefault).toHaveBeenCalled()
		expect(result.current.state.error).toBe('Please complete the CAPTCHA')
		expect(signUp.email).not.toHaveBeenCalled()
	})

	it('should successfully sign up and navigate home on valid form submission', async () => {
		vi.mocked(signUp.email).mockResolvedValueOnce({ error: null })

		const { result } = renderHook(() => useSignUp())

		act(() => {
			result.current.functions.setTurnstileToken('valid-turnstile-token')
		})

		const event = createFormEvent(
			'Red Trainer',
			'red@pallet.com',
			'charizard99',
			'red_master',
		)

		await act(async () => {
			await result.current.functions.handleSubmit(event)
		})

		expect(signUp.email).toHaveBeenCalledWith({
			name: 'Red Trainer',
			email: 'red@pallet.com',
			password: 'charizard99',
			username: 'red_master',
			fetchOptions: {
				headers: {
					'x-captcha-response': 'valid-turnstile-token',
				},
			},
		})

		expect(mockPush).toHaveBeenCalledWith('/')
		expect(result.current.state.isLoading).toBe(true)
	})

	it('should set error message and set isLoading to false when sign up fails', async () => {
		vi.mocked(signUp.email).mockResolvedValueOnce({
			error: { message: 'Email already exists' },
		})

		const { result } = renderHook(() => useSignUp())

		act(() => {
			result.current.functions.setTurnstileToken('valid-turnstile-token')
		})

		const event = createFormEvent()

		await act(async () => {
			await result.current.functions.handleSubmit(event)
		})

		expect(result.current.state.error).toBe('Email already exists')
		expect(result.current.state.isLoading).toBe(false)
		expect(mockPush).not.toHaveBeenCalled()
	})

	it('should fallback to default error message when error.message is absent', async () => {
		vi.mocked(signUp.email).mockResolvedValueOnce({
			error: {},
		})

		const { result } = renderHook(() => useSignUp())

		act(() => {
			result.current.functions.setTurnstileToken('valid-turnstile-token')
		})

		const event = createFormEvent()

		await act(async () => {
			await result.current.functions.handleSubmit(event)
		})

		expect(result.current.state.error).toBe('Something went wrong.')
		expect(result.current.state.isLoading).toBe(false)
	})
})
