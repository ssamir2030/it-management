'use server'

import prisma from '@/lib/prisma'

export async function getItemHistory(entityType: string, entityId: string) {
    try {
        const history = await prisma.auditLog.findMany({
            where: {
                entityType,
                entityId
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 100
        })

        const formattedHistory = history.map(log => ({
            id: log.id,
            action: log.action,
            userName: log.userName,
            userId: log.userId,
            changes: log.changes ? JSON.parse(log.changes) : null,
            ipAddress: log.ipAddress,
            userAgent: log.userAgent,
            timestamp: log.createdAt
        }))

        return { success: true, data: formattedHistory }
    } catch (error) {
        console.error('Error fetching history:', error)
        return { success: false, error: 'Failed to fetch history' }
    }
}

// Get version history (for rollback feature)
export async function getVersionHistory(entityType: string, entityId: string) {
    try {
        const versions = await prisma.auditLog.findMany({
            where: {
                entityType,
                entityId,
                action: 'UPDATE'
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return { success: true, data: versions }
    } catch (error) {
        console.error('Error fetching versions:', error)
        return { success: false, error: 'Failed to fetch versions' }
    }
}

// Compare two versions
export async function compareVersions(versionId1: string, versionId2: string) {
    try {
        const [version1, version2] = await Promise.all([
            prisma.auditLog.findUnique({ where: { id: versionId1 } }),
            prisma.auditLog.findUnique({ where: { id: versionId2 } })
        ])

        if (!version1 || !version2) {
            return { success: false, error: 'Versions not found' }
        }

        const changes1 = version1.changes ? JSON.parse(version1.changes) : {}
        const changes2 = version2.changes ? JSON.parse(version2.changes) : {}

        return {
            success: true,
            data: {
                version1: { ...version1, changes: changes1 },
                version2: { ...version2, changes: changes2 },
                diff: getDifferences(changes1, changes2)
            }
        }
    } catch (error) {
        console.error('Error comparing versions:', error)
        return { success: false, error: 'Failed to compare versions' }
    }
}

function getDifferences(obj1: any, obj2: any) {
    const diff: Record<string, { old: any; new: any }> = {}

    const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)])

    allKeys.forEach(key => {
        if (obj1[key] !== obj2[key]) {
            diff[key] = {
                old: obj1[key],
                new: obj2[key]
            }
        }
    })

    return diff
}
