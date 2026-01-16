'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { logAction } from "@/lib/audit"
import { getSession } from "@/lib/simple-auth"

export async function getAssetByTag(tag: string) {
    try {
        const asset = await prisma.asset.findUnique({
            where: { tag },
            include: {
                location: true,
                employee: true,
                category: true
            }
        })

        if (!asset) {
            return { success: false, error: "Asset not found" }
        }

        return { success: true, data: asset }
    } catch (error) {
        return { success: false, error: "Failed to fetch asset" }
    }
}

export async function getAllLocations() {
    try {
        const locations = await prisma.location.findMany({
            orderBy: { name: 'asc' }
        })
        return { success: true, data: locations }
    } catch (error) {
        return { success: false, data: [] }
    }
}

export async function updateAssetLocation(assetId: string, locationId: string) {
    try {
        const session = await getSession()
        const asset = await prisma.asset.findUnique({ where: { id: assetId } })

        await prisma.asset.update({
            where: { id: assetId },
            data: { locationId }
        })

        await logAction({
            action: 'UPDATE',
            entityType: 'ASSET',
            entityId: assetId,
            entityName: asset?.name,
            changes: { oldLocationId: asset?.locationId, newLocationId: locationId, source: 'mobile_scan' },
            userId: session?.id as string | undefined,
            userName: session?.name as string | undefined
        })

        revalidatePath(`/assets/${assetId}`)
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to update location" }
    }
}

export async function markAssetAudited(assetId: string) {
    try {
        const session = await getSession()
        const asset = await prisma.asset.findUnique({ where: { id: assetId } })

        // In a real system, this would update an AuditRecord. 
        // Here we just log it as a confirmation event.
        await logAction({
            action: 'UPDATE', // Using UPDATE as a proxy for "Checked/Audited"
            entityType: 'ASSET',
            entityId: assetId,
            entityName: asset?.name,
            changes: { audited: true, method: 'mobile_scan' },
            userId: session?.id as string | undefined,
            userName: session?.name as string | undefined
        })

        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to mark as audited" }
    }
}
