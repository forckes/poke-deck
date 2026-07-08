import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { admin, captcha, username } from 'better-auth/plugins'
import prisma from '@/lib/prisma'
import { dash } from '@better-auth/infra'

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
		captcha({
			provider: 'cloudflare-turnstile',
			secretKey: process.env.TURNSTILE_SECRET_KEY!,
		}),
		dash(),
	],
})
