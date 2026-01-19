/**
 * API سري لإعادة ضبط كلمة مرور الأدمن
 * 
 * الاستخدام:
 * POST /api/admin-recovery
 * 
 * Body:
 * {
 *   "secretKey": "YOUR_ADMIN_RECOVERY_KEY",
 *   "email": "admin@example.com",
 *   "newPassword": "NewSecurePassword123"
 * }
 * 
 * ⚠️ يجب إضافة ADMIN_RECOVERY_KEY في Vercel Environment Variables
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { secretKey, email, newPassword } = body

        // التحقق من المفتاح السري
        const recoveryKey = process.env.ADMIN_RECOVERY_KEY

        if (!recoveryKey) {
            return NextResponse.json(
                { error: 'Recovery key not configured' },
                { status: 500 }
            )
        }

        if (secretKey !== recoveryKey) {
            // تسجيل المحاولة الفاشلة
            console.warn(`⚠️ Failed admin recovery attempt for: ${email}`)
            return NextResponse.json(
                { error: 'Invalid secret key' },
                { status: 403 }
            )
        }

        // التحقق من البيانات
        if (!email || !newPassword) {
            return NextResponse.json(
                { error: 'Email and newPassword are required' },
                { status: 400 }
            )
        }

        if (newPassword.length < 8) {
            return NextResponse.json(
                { error: 'Password must be at least 8 characters' },
                { status: 400 }
            )
        }

        // البحث عن المستخدم
        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        // تشفير وتحديث كلمة المرور
        const hashedPassword = await bcrypt.hash(newPassword, 12)

        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword }
        })

        console.log(`✅ Admin password reset successful for: ${email}`)

        return NextResponse.json({
            success: true,
            message: `Password reset successful for ${user.name} (${email})`
        })

    } catch (error) {
        console.error('Admin recovery error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// منع طرق أخرى
export async function GET() {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}
