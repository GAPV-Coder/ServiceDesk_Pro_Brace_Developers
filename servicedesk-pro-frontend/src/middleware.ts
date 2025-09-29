import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicPaths = ['/login', '/register']
const protectedPaths = ['/dashboard', '/tickets', '/categories', '/users', '/audit', '/my-tickets', '/settings']

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const token = request.cookies.get('access_token')?.value ||
        request.headers.get('authorization')?.split(' ')[1]

    // Comprueba si la ruta está protegida
    const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path))
    const isPublicPath = publicPaths.some((path) => pathname.startsWith(path))

    // Redirigir al inicio de sesión si se accede a una ruta protegida sin token
    if (isProtectedPath && !token) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
    }

    // Redirigir al panel de control si se accede a una ruta pública con token
    if (isPublicPath && token) {
        return NextResponse.redirect(new URL('/my-tickets', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}