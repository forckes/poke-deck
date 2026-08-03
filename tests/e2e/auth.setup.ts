import { test as setup, expect } from '@playwright/test'

const users = {
	chromium: {
		email: process.env.E2E_CHROMIUM_EMAIL!,
		password: process.env.E2E_CHROMIUM_PASSWORD!,
		authFile: 'playwright/.auth/chromium.json',
	},
	firefox: {
		email: process.env.E2E_FIREFOX_EMAIL!,
		password: process.env.E2E_FIREFOX_PASSWORD!,
		authFile: 'playwright/.auth/firefox.json',
	},
	webkit: {
		email: process.env.E2E_WEBKIT_EMAIL!,
		password: process.env.E2E_WEBKIT_PASSWORD!,
		authFile: 'playwright/.auth/webkit.json',
	},
} as const

setup('authenticate', async ({ page, browserName }) => {
	const user = users[browserName]

	if (!user) {
		throw new Error(`No test user configured for browser "${browserName}"`)
	}

	await page.goto('/sign-in')

	await page.getByPlaceholder(/email/i).fill(user.email)
	await page.getByPlaceholder(/password/i).fill(user.password)

	await page
		.getByRole('main')
		.getByRole('button', { name: /sign in/i })
		.click()

	await page.waitForURL('/', {
		timeout: 15000,
	})
	await expect(page.getByText(/your ultimate/i)).toBeVisible()

	await page.context().storageState({
		path: user.authFile,
	})
})
