import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        // Get total counts
        const [
            totalAssets,
            totalEmployees,
            openTickets,
            pendingRequests
        ] = await Promise.all([
            prisma.asset.count({ where: { deletedAt: null } }),
            prisma.employee.count({ where: { deletedAt: null } }),
            prisma.supportTicket.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
            prisma.assetRequest.count({ where: { status: 'PENDING' } })
        ])

        // Get asset status breakdown
        const assetsByStatus = await prisma.asset.groupBy({
            by: ['status'],
            where: { deletedAt: null },
            _count: { status: true }
        })

        const stats = {
            totalAssets,
            totalEmployees,
            openTickets,
            pendingRequests,
            assetsByStatus: assetsByStatus.reduce((acc, curr) => {
                acc[curr.status] = curr._count.status
                return acc
            }, {} as Record<string, number>)
        }

        return NextResponse.json({
            success: true,
            data: stats
        })

    } catch (error) {
        console.error('Dashboard stats error:', error)
        return NextResponse.json(
            { success: false, error: 'حدث خطأ في الخادم' },
            { status: 500 }
        )
    }
}
