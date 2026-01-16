'use server'

import { prisma } from '@/lib/prisma'

export async function getAuditStats() {
    const totalAssets = await prisma.asset.count({ where: { status: 'ASSIGNED' } })

    // Get latest audit for each asset
    // Since Prisma doesn't support distinct on with include easily for this, we might fetch recent audits.
    // For MVP, we'll fetch all assigned assets and their last audit.
    const assets = await prisma.asset.findMany({
        where: { status: 'ASSIGNED' },
        include: {
            employee: true,
            audits: {
                orderBy: { auditDate: 'desc' },
                take: 1
            }
        }
    })

    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

    let verified = 0
    let missing = 0
    let damaged = 0
    let pending = 0

    const auditList = assets.map(asset => {
        const lastAudit = asset.audits[0]
        let status = 'PENDING'

        if (lastAudit && new Date(lastAudit.auditDate) > oneMonthAgo) {
            status = lastAudit.status
            if (status === 'VERIFIED') verified++
            else if (status === 'MISSING') missing++
            else if (status === 'DAMAGED') damaged++
        } else {
            pending++
        }

        return {
            asset,
            lastAudit,
            status
        }
    })

    return {
        stats: { total: totalAssets, verified, missing, damaged, pending },
        list: auditList
    }
}
