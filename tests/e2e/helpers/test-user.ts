import { TestInfo } from '@playwright/test'

type GetTestUserArgs =
	| { testInfo: TestInfo; project?: never }
	| { project: string; testInfo?: never }

export function getTestUser(args: GetTestUserArgs) {
	const { testInfo, project } = args

	if (project) {
		switch (project) {
			case 'chromium':
				return process.env.E2E_CHROMIUM_EMAIL!
			//
			case 'firefox':
				return process.env.E2E_FIREFOX_EMAIL!

			case 'webkit':
				return process.env.E2E_WEBKIT_EMAIL!

			default:
				throw new Error(`Unknown project: ${project}`)
		}
	}

	switch (testInfo?.project.name) {
		case 'chromium':
			return process.env.E2E_CHROMIUM_EMAIL!

		case 'firefox':
			return process.env.E2E_FIREFOX_EMAIL!

		case 'webkit':
			return process.env.E2E_WEBKIT_EMAIL!

		default:
			throw new Error(`Unknown project: ${testInfo?.project.name}`)
	}
}
