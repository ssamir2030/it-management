import { NextRequest, NextResponse } from 'next/server'
import prisma from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { hostname, ip, mac, os, cpu, ram, serial, manufacturer, model, disks, username, localAdmins, agentKey } = body as any

        if (!agentKey) {
            return NextResponse.json({ success: false, error: "Missing agentKey" }, { status: 400 })
        }

        console.log(`[Agent] Check-in: ${hostname} (agentKey: ${agentKey.substring(0, 8)}...)`)

        // Prepare details object
        const details = {
            os,
            processor: cpu,
            ram,
            serial,
            manufacturer,
            model,
            disks,
            username,
            localAdmins,
            mac,
            ip,
            agentVersion: '2.0.0',
            lastCheckin: new Date().toISOString()
        }

        // Find existing by agentKey (primary) or IP (fallback for migration)
        let existing = await prisma.discoveredDevice.findFirst({
            where: {
                OR: [
                    { agentKey: agentKey },
                    { ipAddress: ip }
                ]
            }
        })

        if (existing) {
            // Update existing device
            await prisma.discoveredDevice.update({
                where: { id: existing.id },
                data: {
                    agentKey: agentKey,  // Ensure agentKey is set
                    hostname,
                    ipAddress: ip,       // Update IP in case it changed
                    lastSeen: new Date(),
                    status: 'AGENT_CONNECTED',
                    details: JSON.stringify({ ...JSON.parse(existing.details || '{}'), ...details })
                }
            })
            console.log(`[Agent] Updated device: ${hostname} (${existing.id})`)
        } else {
            // Create new device
            const newDevice = await prisma.discoveredDevice.create({
                data: {
                    agentKey: agentKey,
                    ipAddress: ip,
                    hostname,
                    status: 'AGENT_CONNECTED',
                    lastSeen: new Date(),
                    details: JSON.stringify(details)
                }
            })
            console.log(`[Agent] Created new device: ${hostname} (${newDevice.id})`)
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("[Agent] API Error:", error)
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
    }
}
