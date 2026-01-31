import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Debug endpoint to check discovered device data
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const hostname = searchParams.get('hostname')

        const devices = await prisma.discoveredDevice.findMany({
            where: hostname ? { hostname: { contains: hostname } } : {},
            orderBy: { lastSeen: 'desc' },
            take: 10
        })

        const result = devices.map(d => {
            let details = {}
            try {
                details = d.details ? JSON.parse(d.details) : {}
            } catch { }
            return {
                id: d.id,
                hostname: d.hostname,
                ipAddress: d.ipAddress,
                lastSeen: d.lastSeen,
                domain: (details as any).domain,
                workgroup: (details as any).workgroup,
                agentVersion: (details as any).agentVersion,
                // Show raw details for debugging
                rawDetails: details
            }
        })

        return NextResponse.json({ success: true, devices: result })
    } catch (error) {
        console.error("Debug API Error:", error)
        return NextResponse.json({ success: false, error: "Error" }, { status: 500 })
    }
}
