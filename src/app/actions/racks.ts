"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const rackSchema = z.object({
    name: z.string().min(1, "Name is required"),
    locationId: z.string().min(1, "Location is required"),
    capacity: z.coerce.number().min(1).default(42),
})

export async function createRack(formData: FormData) {
    try {
        const data = {
            name: formData.get("name") as string,
            locationId: formData.get("locationId") as string,
            capacity: Number(formData.get("capacity")) || 42,
        }

        const validated = rackSchema.parse(data)

        await prisma.rack.create({
            data: validated,
        })

        revalidatePath("/admin/racks")
        return { success: true }
    } catch (error) {
        console.error("Failed to create rack:", error)
        return { success: false, error: "Failed to create rack" }
    }
}

export async function updateRack(id: string, formData: FormData) {
    try {
        const data = {
            name: formData.get("name") as string,
            locationId: formData.get("locationId") as string,
            capacity: Number(formData.get("capacity")) || 42,
        }

        const validated = rackSchema.parse(data)

        await prisma.rack.update({
            where: { id },
            data: validated,
        })

        revalidatePath("/admin/racks")
        revalidatePath(`/admin/racks/${id}`)
        return { success: true }
    } catch (error) {
        console.error("Failed to update rack:", error)
        return { success: false, error: "Failed to update rack" }
    }
}

export async function deleteRack(id: string) {
    try {
        await prisma.rack.delete({
            where: { id },
        })

        revalidatePath("/admin/racks")
        return { success: true }
    } catch (error) {
        console.error("Failed to delete rack:", error)
        return { success: false, error: "Failed to delete rack" }
    }
}

export async function getRacks(locationId?: string) {
    try {
        const where = locationId ? { locationId } : {}
        const racks = await prisma.rack.findMany({
            where,
            include: {
                location: true,
                _count: {
                    select: { assets: true }
                }
            },
            orderBy: { createdAt: "desc" },
        })
        return { success: true, data: racks }
    } catch (error) {
        console.error("Failed to fetch racks:", error)
        return { success: false, error: "Failed to fetch racks" }
    }
}

export async function getRack(id: string) {
    try {
        const rack = await prisma.rack.findUnique({
            where: { id },
            include: {
                location: true,
                assets: {
                    include: {
                        employee: true
                    }
                }
            },
        })

        if (!rack) return { success: false, error: "Rack not found" }
        return { success: true, data: rack }
    } catch (error) {
        console.error("Failed to fetch rack:", error)
        return { success: false, error: "Failed to fetch rack" }
    }
}

export async function updateAssetPosition(
    assetId: string,
    rackId: string | null,
    uPosition: number | null,
    uHeight: number = 1
) {
    try {
        // Basic validation to check for overlaps could act here, 
        // but for now we trust the UI or add db constraints if strictly needed.

        await prisma.asset.update({
            where: { id: assetId },
            data: {
                rackId,
                uPosition,
                uHeight
            }
        })

        if (rackId) revalidatePath(`/admin/racks/${rackId}`)
        return { success: true }
    } catch (error) {
        console.error("Failed to update asset position:", error)
        return { success: false, error: "Failed to update asset position" }
    }
}

export async function getUnassignedAssets(locationId?: string) {
    try {
        // Fetch assets that are SERVER, NETWORK, or SWITCH types and not in a rack
        // Optionally filter by location if racks are strict about location
        const where: any = {
            rackId: null,
            type: {
                in: ['SERVER', 'NETWORK', 'SWITCH', 'ROUTER', 'FIREWALL', 'UPS', 'OTHER']
            }
        }

        if (locationId) {
            where.locationId = locationId
        }

        const assets = await prisma.asset.findMany({
            where,
            orderBy: { name: 'asc' }
        })
        return { success: true, data: assets }
    } catch (error) {
        return { success: false, error: "Failed to fetch unassigned assets" }
    }
}
