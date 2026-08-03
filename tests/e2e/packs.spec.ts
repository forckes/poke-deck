import { test, expect } from '@playwright/test'
import { seedTestUserCoins, clearTestUserCards } from './helpers/seed'
import { getTestUser } from './helpers/test-user'

test.beforeEach(async ({}, testInfo) => {
	const email = getTestUser({ testInfo })

	await seedTestUserCoins(email, 50)
})

test('user can open a common pack, see cards, and view them in their sorted deck', async ({
	page,
}) => {
	await page.goto('/packs')

	const commonPackBtn = page.getByRole('button', { name: /common pack/i })
	await expect(commonPackBtn).toBeVisible()
	await commonPackBtn.click()

	const openPackBtn = page.getByRole('button', { name: /open pack/i })
	await expect(openPackBtn).toBeVisible()
	await expect(page.getByTestId('coins')).toHaveText('50', { timeout: 10000 })
	await openPackBtn.click()

	const modalContainer = page.locator('.fixed.inset-0.z-50')
	await expect(modalContainer).toBeVisible({ timeout: 15000 })

	const flipAllBtn = page.getByRole('button', { name: /flip all/i })
	await expect(flipAllBtn).toBeVisible()
	await flipAllBtn.click()

	const closeBtn = page.getByRole('button', { name: /close/i })
	await expect(closeBtn).toBeVisible({ timeout: 10000 })

	const cardHeaders = modalContainer.locator('h2')
	const count = await cardHeaders.count()
	expect(count).toBe(3)

	const openedCardNames: string[] = []
	for (let i = 0; i < count; i++) {
		const nameText = await cardHeaders.nth(i).textContent()
		if (nameText) {
			openedCardNames.push(nameText.trim().toLowerCase())
		}
	}

	await closeBtn.click()
	await expect(modalContainer).not.toBeVisible()

	await page.goto('/deck')
	const sortSelector = page.getByRole('combobox')
	await expect(sortSelector).toBeVisible()
	await sortSelector.click()

	const dateOption = page.getByRole('option', { name: /date/i })
	await expect(dateOption).toBeVisible()
	await dateOption.click()
	const toggleOrderBtn = page.getByLabel('Toggle sort order')
	await expect(toggleOrderBtn).toBeVisible()
	await toggleOrderBtn.click()

	await page.waitForTimeout(10000)

	const deckCardHeaders = page.locator('div.grid-cols-3 h2')
	const deckCardCount = await deckCardHeaders.count()
	expect(deckCardCount).toBeGreaterThanOrEqual(3)

	const topDeckCardNames: string[] = []
	for (let i = 0; i < 3; i++) {
		const nameText = await deckCardHeaders.nth(i).textContent()
		if (nameText) {
			topDeckCardNames.push(nameText.trim().toLowerCase())
		}
	}

	for (const cardName of openedCardNames) {
		expect(topDeckCardNames).toContain(cardName)
	}
})
