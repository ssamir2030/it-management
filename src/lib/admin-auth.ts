import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

const SECRET = new TextEncoder().encode(
    process.env.NEXTAUTH_SECRET || 'your-secret-key-here'
)

export async function getAdminUser() {
    try {
        // Try simple-auth first (auth-token cookie)
        const token = cookies().get('auth-token')?.value
        // console.log('🔐 getAdminUser - token exists:', !!token)

        if (token) {
            try {
                const verified = await jwtVerify(token, SECRET)
                const payload = verified.payload as { id: string; name?: string; email?: string }
                // console.log('🔐 Token verified for:', payload.name || payload.id)

                // Try to get user from database for more complete info
                const user = await prisma.user.findUnique({
                    where: { id: payload.id },
                    select: { id: true, name: true, email: true }
                })

                if (user) {
                    // console.log('✅ Admin user found:', user.name)
                    return user
                }

                // Fallback to token data if user not found in DB
                return {
                    id: payload.id,
                    name: payload.name || 'مدير النظام',
                    email: payload.email || ''
                }
            } catch (error) {
                console.error('❌ Token verification failed:', error)
            }
        }

        // Fallback to NextAuth
        const session = await auth()
        // console.log('🔐 NextAuth session:', session?.user?.name || 'null')

        if (session?.user) {
            return {
                id: session.user.id!,
                name: session.user.name || 'مدير النظام',
                email: session.user.email || ''
            }
        }

        // console.log('⚠️ No admin user found')
        return null
    } catch (error) {
        console.error('❌ getAdminUser error:', error)
        return null
    }
}
