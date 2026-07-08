/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { headers } from 'next/headers'
import { auth } from '../auth'
import { userService } from '@/server/services/user.service'
import { revalidatePath } from 'next/cache'

export async function updateProfileAction(data: {
	name?: string
	username?: string
}) {
	try {
		const session = await auth.api.getSession({ headers: await headers() })
		const userId = session?.user?.id

		if (!userId) {
			return { success: false, error: 'Unauthorized' }
		}

		const result = await userService.updateUserProfile(userId, data)

		revalidatePath(`/user/${session?.user?.username}`)

		return { success: true, result }
	} catch (error) {
		const message =
			error instanceof Error ? error.message : 'Error cant get user profile'

		return {
			success: false,
			error: message,
		}
	}
}

export async function searchUsersAction(query: string, limit: number = 5) {
	try {
		const session = await auth.api.getSession({ headers: await headers() })
		const userId = session?.user?.id

		if (!userId) {
			return { success: false, error: 'Unauthorized', result: [] }
		}

		const result = await userService.searchUsers(query, userId, limit)
		return { success: true, result }
	} catch (error) {
		const message =
			error instanceof Error ? error.message : 'Error searching users'
		return {
			success: false,
			error: message,
			result: [],
		}
	}
}
