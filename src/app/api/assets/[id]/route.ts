import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const asset = await prisma.asset.findUnique({
            where: { id: params.id },
            include: {
                employee: {
                    include: {
                        department: true
                    }
                },
                location: true,
                category: true,
                supplier: true,
            }
        })

        if (!asset) {
            return NextResponse.json(
                { success: false, error: 'الأصل غير موجود' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: asset
        })

    } catch (error) {
        console.error('Asset detail error:', error)
        return NextResponse.json(
            { success: false, error: 'حدث خطأ في الخادم' },
            { status: 500 }
        )
    }
}
