import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, password } = body

        if (!email || !password) {
            return NextResponse.json(
                { success: false, error: 'البريد الإلكتروني وكلمة المرور مطلوبان' },
                { status: 400 }
            )
        }

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            include: {
                employee: {
                    include: {
                        department: true
                    }
                }
            }
        })

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'بيانات الدخول غير صحيحة' },
                { status: 401 }
            )
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password)
        if (!isValidPassword) {
            return NextResponse.json(
                { success: false, error: 'بيانات الدخول غير صحيحة' },
                { status: 401 }
            )
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role,
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        )

        // Return user data without password
        const userData = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            employee: user.employee ? {
                id: user.employee.id,
                name: user.employee.name,
                department: user.employee.department?.name
            } : null
        }

        return NextResponse.json({
            success: true,
            token,
            user: userData
        })

    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json(
            { success: false, error: 'حدث خطأ في الخادم' },
            { status: 500 }
        )
    }
}
