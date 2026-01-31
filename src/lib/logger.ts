
import { PrismaClient } from '@prisma/client'

// Use a singleton PrismaClient if not already global
// In a real app, import 'db' from '@/lib/db' or similar
const prisma = new PrismaClient()

export type AuditAction =
    | 'CREATE'
    | 'UPDATE'
    | 'DELETE'
    | 'ASSIGN'
    | 'CHECKIN'
    | 'CHECKOUT'
    | 'LOGIN'
    | 'LOGOUT'
    | 'UPDATE_STATUS'

export type AuditEntity =
    | 'ASSET'
    | 'ACCESSORY'
    | 'LICENSE'
    | 'USER'
    | 'TICKET'
    | 'SETTINGS'
    | 'EMPLOYEE'
    | 'REQUEST'

interface LogData {
    userId: string
    userName: string // Snapshot of name at time of action
    action: AuditAction
    entity: AuditEntity
    entityId: string
    entityName?: string
    details?: any // Will be stringified
}

/**
 * Records an action in the system audit log.
 * Crucial for compliance and tracking "Who did What and When".
 */
export async function logAction(data: LogData) {
    try {
        await prisma.systemLog.create({
            data: {
                userId: data.userId,
                action: data.action,
                entity: data.entity,
                entityId: data.entityId,
                details: data.details ? JSON.stringify(data.details) : undefined,
                // Assuming 'entityName' might be part of details or added to schema later
                // If schema doesn't have entityName, we skip it or put in details
            }
        })
        console.log(`[AUDIT] ${data.action} ${data.entity} ${data.entityId} by ${data.userName}`)
    } catch (error) {
        console.error('[AUDIT_ERROR] Failed to record log:', error)
        // We don't throw here to prevent blocking the main action
    }
}
