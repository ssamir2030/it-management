import prisma from "@/lib/prisma"
import { getSession } from "@/lib/simple-auth"

export type SystemAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE' | 'LOGIN' | 'EXPORT' | 'IMPORT' | 'GRANT_PERMISSION' | 'REVOKE_PERMISSION'
export type SystemEntity = 'USER' | 'ASSET' | 'TICKET' | 'SETTINGS' | 'SYSTEM' | 'EMPLOYEE' | 'PERMISSION' | 'BACKUP'

export async function logEvent(
    action: SystemAction,
    entity: SystemEntity,
    details: string,
    entityId?: string
) {
    try {
        const session = await getSession()
        const userId = session?.id

        await prisma.systemLog.create({
            data: {
                userId,
                action,
                entity,
                entityId,
                details
            }
        })
    } catch (error) {
        console.error("Failed to log system event:", error)
        // We don't throw here to avoid breaking the main operation if logging fails
    }
}
