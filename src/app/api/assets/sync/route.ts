import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

/**
 * Sync technical details from DiscoveredDevice to Asset
 * This is a direct database operation without session check
 */
async function syncAssetData(assetId?: string) {
    try {
        // Get assets to sync
        const assets = assetId
            ? await prisma.asset.findMany({ where: { id: assetId } })
            : await prisma.asset.findMany({ where: { ipAddress: { not: null } } })

        let synced = 0
        let failed = 0

        for (const asset of assets) {
            try {
                // Find matching DiscoveredDevice by IP or hostname
                const device = await prisma.discoveredDevice.findFirst({
                    where: {
                        OR: [
                            { ipAddress: asset.ipAddress || '' },
                            { hostname: asset.name }
                        ]
                    },
                    orderBy: { lastSeen: 'desc' }
                })

                if (!device) {
                    failed++
                    continue
                }

                // Parse device details
                const details = device.details ? JSON.parse(device.details) : {}

                // Update asset with technical details
                await prisma.asset.update({
                    where: { id: asset.id },
                    data: {
                        macAddress: details.mac || asset.macAddress,
                        processor: details.processor || asset.processor,
                        ram: details.ram ? String(details.ram) : asset.ram,
                        operatingSystem: details.os || asset.operatingSystem,
                        storage: details.disks ? JSON.stringify(details.disks) : asset.storage,
                        specifications: JSON.stringify({
                            ...JSON.parse(asset.specifications || '{}'),
                            ...details,
                            syncedAt: new Date().toISOString()
                        })
                    }
                })
                synced++
            } catch (e) {
                console.error(`Failed to sync asset ${asset.id}:`, e)
                failed++
            }
        }

        revalidatePath('/portal/my-assets')
        revalidatePath('/admin/assets')
        return { success: true, synced, failed, message: `Synced ${synced} assets, ${failed} failed` }
    } catch (error) {
        console.error("Sync error:", error)
        return { success: false, error: "Sync failed", synced: 0, failed: 0 }
    }
}

/**
 * POST /api/assets/sync
 * Sync asset(s) with data from discovered devices
 * Body: { assetId?: string } - if assetId provided, sync single asset, otherwise sync all
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}))
        const { assetId } = body as { assetId?: string }
        const result = await syncAssetData(assetId)
        return NextResponse.json(result)
    } catch (error) {
        console.error("[Sync API] Error:", error)
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
    }
}

/**
 * GET /api/assets/sync
 * Sync all assets (convenience endpoint)
 */
export async function GET() {
    try {
        const result = await syncAssetData()
        return NextResponse.json(result)
    } catch (error) {
        console.error("[Sync API] Error:", error)
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
    }
}
