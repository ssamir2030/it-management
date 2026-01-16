'use server'

import { cookies, headers } from 'next/headers'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify, JWTPayload } from 'jose'

const SECRET = new TextEncoder().encode(
    process.env.NEXTAUTH_SECRET || 'your-secret-key-here'
)

export async function simpleLogin(email: string, password: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user || !user.password) {
            return { success: false, error: 'بيانات الدخول غير صحيحة' }
        }

        const isValid = await bcrypt.compare(password, user.password)

        if (!isValid) {
            return { success: false, error: 'بيانات الدخول غير صحيحة' }
        }

        // Create JWT token
        const token = await new SignJWT({
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('30d')
            .sign(SECRET)

        // Detect if running on HTTPS (ngrok) or localhost
        const host = headers().get('host') || ''
        const isSecure = host.includes('ngrok') || host.includes('https') || process.env.NODE_ENV === 'production'

        // Set cookie (works on both localhost and ngrok)
        cookies().set('auth-token', token, {
            httpOnly: true,
            secure: isSecure,
            sameSite: isSecure ? 'none' : 'lax',
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: '/'
        })

        return {
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        }
    } catch (error) {
        console.error('❌ Login error:', error)
        return { success: false, error: 'حدث خطأ في تسجيل الدخول' }
    }
}

export async function simpleLogout() {
    cookies().delete('auth-token')
    return { success: true }
}

export interface SessionUser {
    id: string
    name: string | null
    email: string | null
    role: string
    [key: string]: any
}

/**
 * Get session for both Admin (User) and Employee
 * يدعم كل من Admin و Employee
 */
export async function getSession(preferredRole?: 'ADMIN' | 'EMPLOYEE'): Promise<SessionUser | null> {
    try {
        const adminToken = cookies().get('auth-token')?.value
        const employeeId = cookies().get('employee_portal_session')?.value

        // Helper to verify admin token
        const verifyAdmin = async (): Promise<SessionUser | null> => {
            if (!adminToken) return null
            try {
                const verified = await jwtVerify(adminToken, SECRET)
                const payload = verified.payload
                return {
                    id: String(payload.id),
                    name: payload.name ? String(payload.name) : null,
                    email: payload.email ? String(payload.email) : null,
                    role: String(payload.role || 'USER'),
                    ...payload
                }
            } catch (err) {
                return null
            }
        }

        // Helper to verify employee session
        const verifyEmployee = async (): Promise<SessionUser | null> => {
            if (!employeeId) {
                return null
            }
            const employee = await prisma.employee.findUnique({
                where: { id: employeeId },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    identityNumber: true,
                    departmentId: true,
                    locationId: true
                }
            })
            if (employee) {
                return {
                    id: employee.id,
                    name: employee.name,
                    email: employee.email,
                    role: 'EMPLOYEE',
                    identityNumber: employee.identityNumber
                }
            }
            return null
        }

        // Priority Logic - No fallback when role is explicitly specified
        if (preferredRole === 'EMPLOYEE') {
            const employeeSession = await verifyEmployee()
            // Don't fallback to admin - if employee session not found, return null
            return employeeSession
        } else if (preferredRole === 'ADMIN') {
            const adminSession = await verifyAdmin()
            // Don't fallback to employee - if admin session not found, return null
            return adminSession
        } else {
            // Default behavior (Admin first, then Employee)
            const adminSession = await verifyAdmin()
            if (adminSession) return adminSession
            return await verifyEmployee()
        }

    } catch (error) {
        console.error('❌ Error getting session:', error)
        return null
    }
}
