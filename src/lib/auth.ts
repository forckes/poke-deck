import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { admin, captcha, username } from 'better-auth/plugins'
import prisma from '@/lib/prisma'
import { dash } from '@better-auth/infra'
import { isE2E } from '@/utils/isE2E'
console.log('auth isE2E:', isE2E)
export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: 'postgresql',
	}),
	emailAndPassword: {
		enabled: true,
	},
	plugins: [
		username(),
		admin({ defaultRole: 'user', adminRoles: ['admin'] }),
		...(isE2E
			? []
			: [
					captcha({
						provider: 'cloudflare-turnstile',
						secretKey: process.env.TURNSTILE_SECRET_KEY!,
					}),
				]),
		dash(),
	],
	trustedOrigins: request => {
		const origin = request!.headers.get('origin')
		if (!origin) return []

		if (process.env.BETTER_AUTH_URL && origin === process.env.BETTER_AUTH_URL) {
			return [origin]
		}

		const isPreviewOrE2E =
			process.env.VERCEL_ENV === 'preview' ||
			process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview'

		if (isPreviewOrE2E) {
			const isAllowedProjectDomain =
				/^https:\/\/poke-deck-[a-zA-Z0-9]{9}-forckes-projects\.vercel\.app$/.test(
					origin,
				) ||
				/^https:\/\/poke-deck-[a-zA-Z0-9-]+\.vercel\.app$/.test(origin) ||
				origin.startsWith('http://localhost:')

			if (isAllowedProjectDomain) {
				return [origin]
			}
		}

		return []
	},
})
