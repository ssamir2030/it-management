import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(
    process.env.NEXTAUTH_SECRET || 'your-secret-key-here'
)

// Trial License Check
function checkTrialLicense(): { isExpired: boolean; daysRemaining: number; expiryDate: string | null } {
    const trialEnabled = process.env.TRIAL_MODE === 'true'
    const expiryDateStr = process.env.TRIAL_EXPIRY_DATE

    if (!trialEnabled || !expiryDateStr) {
        return { isExpired: false, daysRemaining: -1, expiryDate: null }
    }

    const expiryDate = new Date(expiryDateStr)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    expiryDate.setHours(23, 59, 59, 999)

    const timeDiff = expiryDate.getTime() - today.getTime()
    const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))

    return {
        isExpired: daysRemaining < 0,
        daysRemaining,
        expiryDate: expiryDateStr
    }
}

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

    // 2. Allow trial-expired page
    if (pathname === '/trial-expired') {
        return NextResponse.next()
    }

    // 3. Check Trial License FIRST (before any auth)
    const trialStatus = checkTrialLicense()
    if (trialStatus.isExpired) {
        return NextResponse.redirect(new URL('/trial-expired', request.url))
    }

    // 4. Add trial warning header if expiring soon (within 7 days)
    const response = NextResponse.next()
    if (trialStatus.daysRemaining >= 0 && trialStatus.daysRemaining <= 7) {
        response.headers.set('X-Trial-Days-Remaining', trialStatus.daysRemaining.toString())
        response.headers.set('X-Trial-Expiry-Date', trialStatus.expiryDate || '')
    }

    // 5. Handle Portal (Employee System)
    if (pathname.startsWith('/portal')) {
        return response
    }

    // 6. Handle Admin System (Everything else)
    const publicAdminPaths = ['/login', '/forgot-password', '/agent.ps1', '/AgentInstaller.ps1', '/AgentSetup.bat']
    if (publicAdminPaths.includes(pathname)) {
        return response
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

    return response
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
