'use server'

import prisma from '@/lib/prisma'
import { getSession } from '@/lib/simple-auth'

export type ActivityType =
    | 'ASSET_CREATED'
    | 'ASSET_UPDATED'
    | 'ASSET_DELETED'
    | 'EMPLOYEE_CREATED'
    | 'EMPLOYEE_UPDATED'
    | 'TICKET_CREATED'
    | 'TICKET_UPDATED'
    | 'TICKET_CLOSED'

// Get activity feed
export async function getActivityFeed(limit = 50) {
    try {
        // Get recent audit logs
        const logs = await prisma.auditLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: limit,
            select: {
                id: true,
                userName: true,
                action: true,
                entityType: true,
                entityId: true,
                entityName: true,
                changes: true,
                createdAt: true
            }
        })

        // Transform to activity format
        const activities = logs.map(log => ({
            id: log.id,
            user: log.userName,
            action: log.action,
            entityType: log.entityType,
            entityId: log.entityId,
            entityName: log.entityName,
            details: log.changes ? JSON.parse(log.changes) : null,
            timestamp: log.createdAt
        }))

        return { success: true, data: activities }
    } catch (error) {
        console.error('Error fetching activity feed:', error)
        return { success: false, error: 'Failed to fetch activities' }
    }
}

// Get user-specific activity
export async function getMyActivity(limit = 20) {
    try {
        const session = await getSession()

        if (!session?.id) {
            return { success: false, error: 'Not authenticated' }
        }

        const logs = await prisma.auditLog.findMany({
            where: {
                userId: session.id
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            select: {
                id: true,
                action: true,
                entityType: true,
                entityId: true,
                entityName: true,
                changes: true,
                createdAt: true
            }
        })

        const activities = logs.map(log => ({
            id: log.id,
            action: log.action,
            entityType: log.entityType,
            entityId: log.entityId,
            entityName: log.entityName,
            details: log.changes ? JSON.parse(log.changes) : null,
            timestamp: log.createdAt
        }))

        return { success: true, data: activities }
    } catch (error) {
        console.error('Error fetching my activity:', error)
        return { success: false, error: 'Failed to fetch activities' }
    }
}

// Get activity by entity type
export async function getActivityByType(entityType: string, limit = 30) {
    try {
        const logs = await prisma.auditLog.findMany({
            where: { entityType },
            orderBy: { createdAt: 'desc' },
            take: limit,
            select: {
                id: true,
                userName: true,
                action: true,
                entityId: true,
                entityName: true,
                changes: true,
                createdAt: true
            }
        })

        const activities = logs.map(log => ({
            id: log.id,
            user: log.userName,
            action: log.action,
            entityId: log.entityId,
            entityName: log.entityName,
            details: log.changes ? JSON.parse(log.changes) : null,
            timestamp: log.createdAt
        }))

        return { success: true, data: activities }
    } catch (error) {
        console.error('Error fetching activity by type:', error)
        return { success: false, error: 'Failed to fetch activities' }
    }
}
