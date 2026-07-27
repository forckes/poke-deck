import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { UTApi } from 'uploadthing/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { headers } from 'next/headers'

const f = createUploadthing()
export const utapi = new UTApi()

function extractFileKey(url: string | null | undefined): string | null {
	if (!url || !url.includes('utfs.io/f/')) return null
	return url.split('utfs.io/f/')[1] || null
}

export const ourFileRouter = {
	profileImage: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
		.middleware(async () => {
			const session = await auth.api.getSession({
				headers: await headers(),
			})
			if (!session?.user?.id) throw new Error('Unauthorized')

			const user = await prisma.user.findUnique({
				where: { id: session.user.id },
				select: { image: true },
			})

			return { userId: session.user.id, oldImageUrl: user?.image }
		})
		.onUploadComplete(async ({ metadata, file }) => {
			const oldKey = extractFileKey(metadata.oldImageUrl)
			if (oldKey) {
				try {
					await utapi.deleteFiles(oldKey)
				} catch (error) {
					console.error('Failed to delete old avatar:', error)
				}
			}

			await prisma.user.update({
				where: { id: metadata.userId },
				data: { image: file.url },
			})

			return { uploadedBy: metadata.userId, newUrl: file.url }
		}),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
