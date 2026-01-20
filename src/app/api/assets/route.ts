import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search') || ''
        const limit = parseInt(searchParams.get('limit') || '50')
        const page = parseInt(searchParams.get('page') || '1')
        const status = searchParams.get('status')

        const where: any = {
            deletedAt: null,
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { assetTag: { contains: search, mode: 'insensitive' } },
                { serialNumber: { contains: search, mode: 'insensitive' } },
            ]
        }

        if (status) {
            where.status = status
        }

        const [assets, total] = await Promise.all([
            prisma.asset.findMany({
                where,
                include: {
                    employee: {
                        select: { id: true, name: true }
                    },
                    location: {
                        select: { id: true, name: true }
                    },
                    category: {
                        select: { id: true, name: true }
                    }
                },
                take: limit,
                skip: (page - 1) * limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.asset.count({ where })
        ])

        // Get counts by status
        const statusCounts = await prisma.asset.groupBy({
            by: ['status'],
            where: { deletedAt: null },
            _count: { status: true }
        })

        const available = statusCounts.find(s => s.status === 'AVAILABLE')?._count.status || 0
        const maintenance = statusCounts.find(s => s.status === 'MAINTENANCE')?._count.status || 0

        return NextResponse.json({
            success: true,
            data: {
                assets,
                total,
                available,
                maintenance,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        })

    } catch (error) {
        console.error('Assets API error:', error)
        return NextResponse.json(
            { success: false, error: 'حدث خطأ في الخادم' },
            { status: 500 }
        )
    }
}
