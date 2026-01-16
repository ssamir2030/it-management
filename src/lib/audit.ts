'use server'

import prisma from '@/lib/prisma'
import { getSession } from '@/lib/simple-auth'
import { headers } from 'next/headers'

type AuditAction =
    | 'CREATE'
    | 'UPDATE'
    | 'DELETE'
    | 'LOGIN'
    | 'LOGOUT'
    | 'APPROVE'
    | 'REJECT'
    | 'ASSIGN'
    | 'RETURN'

type EntityType =
    | 'ASSET'
    | 'EMPLOYEE'
    | 'TICKET'
    | 'USER'
    | 'DEPARTMENT'
    | 'LOCATION'
    | 'LICENSE'
    | 'CONTRACT'

interface LogActionParams {
    action: AuditAction
    entityType: EntityType
    entityId: string
    entityName?: string
    changes?: Record<string, any> // Object describing what changed
    userId?: string
    userName?: string
}

export async function logAction({
    action,
    entityType,
    entityId,
    entityName,
    changes,
    userId,
    userName
}: LogActionParams) {
    try {
        // If user details not provided, try to get from session
        if (!userId || !userName) {
            const session = await getSession()
            if (session) {
                userId = (userId || session.id) as string
                userName = (userName || session.name || session.email || 'Unknown') as string
            } else {
                userId = (userId || 'system') as string
                userName = (userName || 'System') as string
            }
        }

        // Get IP and User Agent
        const headersList = headers()
        const ip = headersList.get('x-forwarded-for') || 'unknown'
        const userAgent = headersList.get('user-agent') || 'unknown'

        await prisma.auditLog.create({
            data: {
                userId: userId || 'system',
                userName: userName || 'System',
                action,
                entityType,
                entityId,
                entityName,
                changes: changes ? JSON.stringify(changes) : null,
                ipAddress: ip,
                userAgent
            }
        })

        console.log(`📝 Audit Log: ${userName || 'System'} ${action} ${entityType} (${entityId})`)
    } catch (error) {
        console.error('❌ Failed to create audit log:', error)
        // We don't throw here to avoid breaking the main action if logging fails
    }
}

export async function getAuditLogs(limit = 50) {
    try {
        const logs = await prisma.auditLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: limit
        })
        return { success: true, data: logs }
    } catch (error) {
        console.error('Error fetching audit logs:', error)
        return { success: false, error: 'Failed to fetch logs' }
    }
}
