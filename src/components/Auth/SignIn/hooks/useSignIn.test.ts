/* eslint-disable @typescript-eslint/no-explicit-any */
import { signIn } from '@/lib/auth-client'
import * as isE2EModule from '@/utils/isE2E'
import { act, renderHook } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useSignIn } from './useSignIn'

vi.mock('next/navigation', () => ({
	useRouter: vi.fn(),
}))

vi.mock('@/lib/auth-client', () => ({
	signIn: {
		email: vi.fn(),
		username: vi.fn(),
	},
}))

vi.mock('@/utils/isE2E', () => ({
	isE2E: false,
}))

describe('useSignIn', () => {
	const mockPush = vi.fn()

	const createFormEvent = (identifier: string, password = 'password123') => {
		const form = document.createElement('form')

		const identifierInput = document.createElement('input')
		identifierInput.name = 'identifier'
		identifierInput.value = identifier

		const passwordInput = document.createElement('input')
		passwordInput.name = 'password'
		passwordInput.value = password

		form.appendChild(identifierInput)
		form.appendChild(passwordInput)

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

	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('should set an error when CAPTCHA token is missing', async () => {
		const { result } = renderHook(() => useSignIn())

		const event = createFormEvent('user@example.com')

		await act(async () => {
			await result.current.functions.handleSubmit(event)
		})

		expect(event.preventDefault).toHaveBeenCalled()
		expect(result.current.state.error).toBe('Please complete the CAPTCHA')
		expect(signIn.email).not.toHaveBeenCalled()
		expect(signIn.username).not.toHaveBeenCalled()
	})

	it('should sign in with email when identifier contains "@"', async () => {
		vi.mocked(signIn.email).mockResolvedValueOnce({ error: null } as any)

		const { result } = renderHook(() => useSignIn())

		act(() => {
			result.current.functions.setTurnstileToken('valid-captcha-token')
		})

		const event = createFormEvent('ash@pokemon.com', 'pikachu123')

		await act(async () => {
			await result.current.functions.handleSubmit(event)
		})

		expect(signIn.email).toHaveBeenCalledWith({
			email: 'ash@pokemon.com',
			password: 'pikachu123',
			fetchOptions: {
				headers: {
					'x-captcha-response': 'valid-captcha-token',
				},
			},
		})

		expect(mockPush).toHaveBeenCalledWith('/')
		expect(result.current.state.isLoading).toBe(true)
	})

	it('should sign in with username when identifier does NOT contain "@"', async () => {
		vi.mocked(signIn.username).mockResolvedValueOnce({ error: null } as any)

		const { result } = renderHook(() => useSignIn())

		act(() => {
			result.current.functions.setTurnstileToken('valid-captcha-token')
		})

		const event = createFormEvent('ash_ketchum', 'pikachu123')

		await act(async () => {
			await result.current.functions.handleSubmit(event)
		})

		expect(signIn.username).toHaveBeenCalledWith({
			username: 'ash_ketchum',
			password: 'pikachu123',
			fetchOptions: {
				headers: {
					'x-captcha-response': 'valid-captcha-token',
				},
			},
		})
		expect(mockPush).toHaveBeenCalledWith('/')
	})

	it('should handle sign in error responses and reset isLoading', async () => {
		vi.mocked(signIn.email).mockResolvedValueOnce({
			error: { message: 'Invalid credentials' },
		} as any)

		const { result } = renderHook(() => useSignIn())

		act(() => {
			result.current.functions.setTurnstileToken('valid-captcha-token')
		})

		const event = createFormEvent('wrong@email.com')

		await act(async () => {
			await result.current.functions.handleSubmit(event)
		})

		expect(result.current.state.error).toBe('Invalid credentials')
		expect(result.current.state.isLoading).toBe(false)
		expect(mockPush).not.toHaveBeenCalled()
	})

	it('should fallback to default error message when error.message is missing', async () => {
		vi.mocked(signIn.email).mockResolvedValueOnce({
			error: {},
		} as any)

		const { result } = renderHook(() => useSignIn())

		act(() => {
			result.current.functions.setTurnstileToken('valid-captcha-token')
		})

		const event = createFormEvent('user@example.com')

		await act(async () => {
			await result.current.functions.handleSubmit(event)
		})

		expect(result.current.state.error).toBe('Something went wrong.')
		expect(result.current.state.isLoading).toBe(false)
	})

	it('should automatically use E2E token when isE2E is true', async () => {
		vi.spyOn(isE2EModule, 'isE2E', 'get').mockReturnValue(true)
		vi.mocked(signIn.username).mockResolvedValueOnce({ error: null } as any)

		const { result } = renderHook(() => useSignIn())

		const event = createFormEvent('e2e_user', 'password123')

		await act(async () => {
			await result.current.functions.handleSubmit(event)
		})

		expect(signIn.username).toHaveBeenCalledWith({
			username: 'e2e_user',
			password: 'password123',
			fetchOptions: {
				headers: {
					'x-captcha-response': 'mock-e2e-token',
				},
			},
		})

		expect(mockPush).toHaveBeenCalledWith('/')
	})
})
