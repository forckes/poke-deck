export const isE2E =
	process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview' ||
	process.env.VERCEL_ENV === 'preview'
