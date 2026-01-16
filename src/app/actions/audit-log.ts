'use server'

import prisma from "@/lib/prisma"

export interface AuditLogFilters {
    page?: number
    limit?: number
    action?: string
    entityType?: string
    accessType?: string
    userId?: string
    search?: string
}

export async function getAuditLogs(params: AuditLogFilters | number = 50) {
    try {
        const filters = typeof params === 'number' ? { limit: params, page: 1 } : params
        const page = filters.page || 1
        const limit = filters.limit || 50
        const skip = (page - 1) * limit

        const where: any = {}
        if (filters.action && filters.action !== 'ALL') where.action = filters.action
        if (filters.entityType && filters.entityType !== 'ALL') where.entityType = filters.entityType
        if (filters.userId && filters.userId !== 'ALL') where.userId = filters.userId
        if (filters.search) {
            where.OR = [
                { entityName: { contains: filters.search } }, // Removed mode: 'insensitive' for Sqlite compatibility or check usage
                { userName: { contains: filters.search } },
                { details: { contains: filters.search } } // Check field name 'changes' vs 'details'
            ]
        }

        const [data, total] = await Promise.all([
            prisma.auditLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip
            }),
            prisma.auditLog.count({ where })
        ])

        return {
            success: true,
            data,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        }
    } catch (error) {
        return { success: false, error: "Failed to fetch logs" }
    }
}

export async function getAssetHistory(assetId: string) {
    try {
        const logs = await prisma.auditLog.findMany({
            where: {
                entityType: 'ASSET',
                entityId: assetId
            },
            orderBy: { createdAt: 'desc' },
            take: 50 // Limit to last 50 events for now
        })
        return { success: true, data: logs }
    } catch (error) {
        console.error("Error fetching asset history:", error)
        return { success: false, data: [] }
    }
}
