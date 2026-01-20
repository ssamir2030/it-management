import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const barcode = searchParams.get('barcode')

        if (!barcode) {
            return NextResponse.json(
                { success: false, error: 'الباركود مطلوب' },
                { status: 400 }
            )
        }

        const asset = await prisma.asset.findFirst({
            where: {
                OR: [
                    { tag: barcode },
                    { serialNumber: barcode },
                ],
                deletedAt: null
            },
            include: {
                employee: {
                    include: {
                        department: true
                    }
                },
                location: true,
                category: true,
            }
        })

        if (!asset) {
            return NextResponse.json(
                { success: false, error: 'لم يتم العثور على أصل بهذا الباركود' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: asset
        })

    } catch (error) {
        console.error('Scan API error:', error)
        return NextResponse.json(
            { success: false, error: 'حدث خطأ في الخادم' },
            { status: 500 }
        )
    }
}
