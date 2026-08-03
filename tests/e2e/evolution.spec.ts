import { test, expect } from '@playwright/test'
import {
	giveTestUserCardsForEvolution,
	removeTestUserEvolutionRecords,
} from './helpers/seed'
import { getTestUser } from './helpers/test-user'

test.beforeEach(async ({}, testInfo) => {
	const email = getTestUser({ testInfo })

	await giveTestUserCardsForEvolution(email, [10, 20, 30])
})

test.afterEach(async ({}, testInfo) => {
	const email = getTestUser({ testInfo })

	await removeTestUserEvolutionRecords(email)
})

test('user can claim evolution reward', async ({ page }) => {
	await page.goto('/deck')

	await expect
		.poll(async () => await page.locator('h2').count(), {
			timeout: 20000,
		})
		.toBeGreaterThanOrEqual(3)

	await page.getByTestId('card-0').click()

	const cardModalButton = page.getByTestId('modal-inspect-button')
	await expect(cardModalButton).toBeVisible()
	await expect(cardModalButton).toContainText(/inspect/i)
	await cardModalButton.click()

	await expect(page).toHaveURL(/\/pokemon\/[^/]+$/)
	const claimRewardBtn = page.getByRole('button', {
		name: /claim/i,
	})
	await expect(claimRewardBtn).toBeVisible()
	await expect(claimRewardBtn).toBeEnabled()
	await claimRewardBtn.click()
	await expect(page.getByTestId('evolution-reward')).toContainText(
		'Reward of 150 coins claimed',
	)
	await page.waitForTimeout(1000)
	await expect(claimRewardBtn).toBeDisabled()
})
