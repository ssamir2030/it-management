import prisma from "@/lib/prisma"
import { headers } from "next/headers"

interface LogEntry {
    userId: string
    userName: string
    action: string
    entityType: string
    entityId: string
    entityName?: string
    changes?: any
}

export async function logAction(entry: LogEntry) {
    try {
        const headersList = headers()
        const ipAddress = headersList.get("x-forwarded-for") || "unknown"
        const userAgent = headersList.get("user-agent") || "unknown"

        await prisma.auditLog.create({
            data: {
                userId: entry.userId,
                userName: entry.userName,
                action: entry.action,
                entityType: entry.entityType,
                entityId: entry.entityId,
                entityName: entry.entityName,
                changes: entry.changes ? JSON.stringify(entry.changes) : null,
                ipAddress,
                userAgent
            }
        })
    } catch (error) {
        console.error("Failed to create audit log:", error)
        // We don't throw here to ensure the main action doesn't fail just because logging failed
    }
}

export async function getAuditLogs(limit = 50, offset = 0) {
    try {
        const logs = await prisma.auditLog.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            take: limit,
            skip: offset
        })
        return { success: true, data: logs }
    } catch (error) {
        console.error("Failed to fetch audit logs:", error)
        return { success: false, error: "فشل جلب السجلات" }
    }
}
