import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization')

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { success: false, error: 'غير مصرح' },
                { status: 401 }
            )
        }

        const token = authHeader.split(' ')[1]

        try {
            const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

            const user = await prisma.user.findUnique({
                where: { id: decoded.userId }
            })

            if (!user) {
                return NextResponse.json(
                    { success: false, error: 'المستخدم غير موجود' },
                    { status: 404 }
                )
            }

            return NextResponse.json({
                success: true,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                }
            })

        } catch (jwtError) {
            return NextResponse.json(
                { success: false, error: 'الجلسة منتهية' },
                { status: 401 }
            )
        }

    } catch (error) {
        console.error('Auth check error:', error)
        return NextResponse.json(
            { success: false, error: 'حدث خطأ في الخادم' },
            { status: 500 }
        )
    }
}
