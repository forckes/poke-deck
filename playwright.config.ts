import { defineConfig, devices } from '@playwright/test'

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env') })
dotenv.config({
	path: path.resolve(process.cwd(), '.env.test'),
	override: true,
})

const PORT = process.env.PORT || 3000
const BASE_URL =
	process.env.PLAYWRIGHT_TEST_BASE_URL ||
	(process.env.VERCEL_URL
		? `https://${process.env.VERCEL_URL}`
		: `http://localhost:${PORT}`)

export default defineConfig({
	testDir: './tests/e2e',
	testMatch: '**/*.spec.ts',
	/* Run tests in files in parallel */
	fullyParallel: !process.env.CI,
	/* Fail the build on CI if you accidentally left test.only in the source code. */
	forbidOnly: !!process.env.CI,
	/* Retry on CI only */
	retries: process.env.CI ? 3 : 0,
	/* Opt out of parallel tests on CI. */
	workers: process.env.CI ? 1 : undefined,
	/* Reporter to use. See https://playwright.dev/docs/test-reporters */
	reporter: 'html',
	/* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
	use: {
		/* Base URL to use in actions like `await page.goto('')`. */
		baseURL: BASE_URL,

		/* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
		trace: 'on-first-retry',

		actionTimeout: 15_000,
		navigationTimeout: 20_000,
	},

	globalTeardown: './tests/e2e/global-teardown.ts',

	/* Configure projects for major browsers */
	projects: [
		{
			name: 'setup-chromium',
			testMatch: /.*\.setup\.ts/,
			use: {
				...devices['Desktop Chrome'],
			},
		},
		{
			name: 'chromium',
			testIgnore: /.*\.setup\.ts/,
			use: {
				...devices['Desktop Chrome'],
				storageState: 'playwright/.auth/chromium.json',
			},
			dependencies: ['setup-chromium'],
		},

		{
			name: 'setup-firefox',
			testMatch: /.*\.setup\.ts/,
			use: {
				...devices['Desktop Firefox'],
			},
		},
		{
			name: 'firefox',
			testIgnore: /.*\.setup\.ts/,
			use: {
				...devices['Desktop Firefox'],
				storageState: 'playwright/.auth/firefox.json',
			},
			dependencies: ['setup-firefox'],
		},

		{
			name: 'setup-webkit',
			testMatch: /.*\.setup\.ts/,
			use: {
				...devices['Desktop Safari'],
			},
		},
		{
			name: 'webkit',
			testIgnore: /.*\.setup\.ts/,
			use: {
				...devices['Desktop Safari'],
				storageState: 'playwright/.auth/webkit.json',
			},
			dependencies: ['setup-webkit'],
		},
	],

	/* Run your local dev server before starting the tests */
	webServer:
		process.env.PLAYWRIGHT_TEST_BASE_URL || process.env.VERCEL_URL
			? undefined
			: {
					command: 'npm run build && npm run start',
					url: `http://localhost:${PORT}`,
					reuseExistingServer: !process.env.CI,
					timeout: 120 * 1000,
				},
})
