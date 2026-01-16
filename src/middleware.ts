import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(
    process.env.NEXTAUTH_SECRET || 'your-secret-key-here'
)

// Edge-compatible session check (only JWT verification - no bcrypt)
async function getEdgeSession(cookies: NextRequest['cookies']) {
    const token = cookies.get('auth-token')?.value
    if (!token) return null

    try {
        const verified = await jwtVerify(token, SECRET)
        return verified.payload
    } catch {
        return null
    }
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // 1. Handle Public Assets & API
    if (pathname.startsWith('/api/') || pathname.startsWith('/_next/') || pathname.includes('.')) {
        return NextResponse.next()
    }

    // 2. Handle Portal (Employee System)
    if (pathname.startsWith('/portal')) {
        // Portal has its own auth check inside its layout/pages, 
        // OR we can add specific portal middleware here if needed.
        // For now, we allow it to pass through to let the Portal layout handle it.
        return NextResponse.next()
    }

    // 3. Handle Admin System (Everything else)
    const publicAdminPaths = ['/login', '/agent.ps1', '/AgentInstaller.ps1', '/AgentSetup.bat']
    if (publicAdminPaths.includes(pathname)) {
        return NextResponse.next()
    }

    // Check Admin Session (Edge-compatible)
    const session = await getEdgeSession(request.cookies)
    if (!session) {
        const url = new URL('/login', request.url)
        url.searchParams.set('callbackUrl', pathname)
        return NextResponse.redirect(url)
    }

    // If logged in but trying to access login page, redirect to dashboard
    if (pathname === '/login' && session) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - agent.ps1 (Agent Script)
         * - AgentSetup.bat (Agent Installer)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|agent.ps1|AgentInstaller.ps1|AgentSetup.bat).*)',
    ],
}
