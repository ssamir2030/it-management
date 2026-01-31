
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Veyon Network Directory Export
 * Returns a JSON structure compatible with Veyon's "Network Object Directory" import
 * or for use with a custom Veyon LDAP/Json plugin.
 */
export async function GET() {
    try {
        // 1. Fetch Locations (Rooms)
        const locations = await prisma.location.findMany({
            include: {
                assets: {
                    where: { type: { in: ['HARDWARE', 'SERVER'] } }, // Computers and Servers
                    select: {
                        id: true,
                        name: true,
                        tag: true,
                        ipAddress: true,
                        macAddress: true,
                        technicalDetails: {
                            select: { computerName: true }
                        }
                    }
                }
            }
        })

        // 2. Transform to Veyon Structure (NetworkObjects)
        // Structure: Location -> Computers
        const veyonDirectory = locations.map(loc => ({
            name: loc.name,
            type: 'Room',
            computers: loc.assets.map(asset => ({
                id: asset.id,
                name: asset.technicalDetails?.computerName || asset.name,
                hostAddress: asset.ipAddress || asset.technicalDetails?.computerName || asset.tag,
                macAddress: asset.macAddress || '',
                type: 'Computer'
            }))
        }))

        // Include Assets without Location in a "Unassigned" room?
        const unassignedAssets = await prisma.asset.findMany({
            where: {
                locationId: null,
                type: { in: ['HARDWARE', 'SERVER'] }
            },
            include: { technicalDetails: true }
        })

        if (unassignedAssets.length > 0) {
            veyonDirectory.push({
                name: 'Unassigned',
                type: 'Room',
                computers: unassignedAssets.map(asset => ({
                    id: asset.id,
                    name: asset.technicalDetails?.computerName || asset.name,
                    hostAddress: asset.ipAddress || asset.technicalDetails?.computerName || asset.tag,
                    macAddress: asset.macAddress || '',
                    type: 'Computer'
                }))
            })
        }

        return NextResponse.json({
            format: 'VeyonNetworkDirectory',
            version: '1.0',
            data: veyonDirectory
        })

    } catch (error) {
        console.error('[VEYON_DIR] Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
