'use server'

import prisma from "@/lib/prisma"

export async function getSystemHealthStatus() {
    try {
        const now = new Date()
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

        const [
            assetsMissingLocation,
            assetsMissingCategory,
            licensesExpiringSoon,
            pendingRequestsOld,
            missingWarranty
        ] = await Promise.all([
            prisma.asset.count({ where: { locationId: null } }),
            prisma.asset.count({ where: { categoryId: null } }),
            prisma.softwareLicense.count({
                where: {
                    expiryDate: {
                        lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // Within 30 days
                        gte: now
                    }
                }
            }),
            prisma.ticket.count({
                where: {
                    status: { in: ['OPEN', 'IN_PROGRESS'] },
                    createdAt: { lte: sevenDaysAgo }
                }
            }),
            prisma.asset.count({ where: { warrantyExpiry: null } })
        ])

        const issues = []

        if (assetsMissingLocation > 0) {
            issues.push({
                id: 'missing-location',
                title: 'أصول بدون موقع',
                description: `يوجد ${assetsMissingLocation} أصول لم يتم تحديد موقعها الفعلي.`,
                severity: 'warning',
                count: assetsMissingLocation,
                actionUrl: '/assets?filter=no-location'
            })
        }

        if (licensesExpiringSoon > 0) {
            issues.push({
                id: 'expiring-licenses',
                title: 'تراخيص قريبة من الانتهاء',
                description: `يوجد ${licensesExpiringSoon} تراخيص برمجية ستنتهي خلال 30 يوماً.`,
                severity: 'critical',
                count: licensesExpiringSoon,
                actionUrl: '/admin/licenses?filter=expiring'
            })
        }

        if (pendingRequestsOld > 0) {
            issues.push({
                id: 'old-requests',
                title: 'طلبات متأخرة (SLA)',
                description: `يوجد ${pendingRequestsOld} طلبات مفتوحة منذ أكثر من 7 أيام.`,
                severity: 'critical',
                count: pendingRequestsOld,
                actionUrl: '/admin/support?filter=overdue'
            })
        }

        if (missingWarranty > 0) {
            issues.push({
                id: 'missing-warranty',
                title: 'بيانات الضمان مفقودة',
                description: `يوجد ${missingWarranty} أصول تفتقر لتاريخ انتهاء الضمان.`,
                severity: 'info',
                count: missingWarranty,
                actionUrl: '/assets?filter=no-warranty'
            })
        }

        // Calculate a health score (0-100)
        let score = 100
        score -= (assetsMissingLocation * 2)
        score -= (licensesExpiringSoon * 10)
        score -= (pendingRequestsOld * 5)
        if (score < 0) score = 0

        return {
            success: true,
            data: {
                score,
                issues,
                lastScan: now.toISOString()
            }
        }
    } catch (error) {
        console.error("Health check error:", error)
        return { success: false, error: "Failed to perform health check" }
    }
}
