import { FullConfig } from '@playwright/test'
import {
	clearTestUserCards,
	removeTestUserEvolutionRecords,
} from './helpers/seed'
import { getTestUser } from './helpers/test-user'

async function globalTeardown(config: FullConfig) {
	for (const project of config.projects) {
		if (!project.name) continue
		if (project.name.includes('setup')) continue

		const email = getTestUser({ project: project.name })

		await clearTestUserCards(email)
		await removeTestUserEvolutionRecords(email)
	}
}

export default globalTeardown
