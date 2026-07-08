import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'

export async function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl

	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session) {
		return NextResponse.redirect(new URL('/sign-up', request.url))
	}

	if (session.user.banned) {
		if (!pathname.startsWith('/banned')) {
			return NextResponse.redirect(new URL('/banned', request.url))
		}
		return NextResponse.next()
	}

	if (!session.user.banned && pathname.startsWith('/banned')) {
		return NextResponse.redirect(new URL('/', request.url))
	}

	if (pathname.startsWith('/admin') && session.user.role !== 'admin') {
		return new NextResponse(null, { status: 404 })
	}

	return NextResponse.next()
}

export const config = {
	matcher: [
		'/trades',
		'/trades/:path*',
		'/deck',
		'/packs',
		'/user/:path*',
		'/collection',
		'/crash-game',
		'/pokemon/:path*',
		'/admin',
		'/banned',
	],
}
