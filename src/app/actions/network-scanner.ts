'use server'

import { Socket } from 'net'
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/simple-auth"
import { revalidatePath } from 'next/cache'
import { promises as dns } from 'dns'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

// Helper to check if a single IP is alive via TCP connect to common ports
async function checkIp(ip: string): Promise<{ alive: boolean, port?: number }> {
    const ports = [80, 445, 135, 22] // Web, SMB, RPC, SSH

    // We try ports in parallel to be fast, if any connects, it's alive
    try {
        const checks = ports.map(port => new Promise<{ alive: boolean, port?: number }>((resolve) => {
            const socket = new Socket()
            const timeout = 500 // 500ms timeout per port

            socket.setTimeout(timeout)

            socket.on('connect', () => {
                socket.destroy()
                resolve({ alive: true, port })
            })

            socket.on('timeout', () => {
                socket.destroy()
                resolve({ alive: false })
            })

            socket.on('error', () => {
                socket.destroy()
                resolve({ alive: false })
            })

            socket.connect(port, ip)
        }))

        // We use Promise.any to return as soon as one succeeds (Node 15+) or wait for all
        // fallback to simpler approach for broader compatibility:
        const results = await Promise.all(checks)
        const active = results.find(r => r.alive)
        return active || { alive: false }
    } catch (e) {
        return { alive: false }
    }
}

// Convert IP to Long for numeric iteration
function ipToLong(ip: string) {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0
}

function longToIp(long: number) {
    return [
        (long >>> 24) & 0xFF,
        (long >>> 16) & 0xFF,
        (long >>> 8) & 0xFF,
        long & 0xFF
    ].join('.')
}

// Windows-specific NetBIOS lookup (Agentless)
// Windows-specific NetBIOS lookup (Agentless)
async function getNetBiosName(ip: string): Promise<{ hostname: string | null, mac: string | null }> {
    try {
        const { stdout } = await execAsync(`nbtstat -A ${ip}`)
        // Parse output for Unique name (usually <00> or <20>)
        // Example line: "DESKTOP-XYZ    <00>  UNIQUE"
        // MAC Address = XX-XX-XX-XX-XX-XX

        let hostname = null
        let mac = null

        const lines = stdout.split('\n')
        for (const line of lines) {
            if (line.includes('<00>') && line.includes('UNIQUE') && !hostname) {
                const parts = line.trim().split(/\s+/)
                hostname = parts[0]
            }
            if (line.includes('MAC Address')) {
                const part = line.split('=')[1]
                if (part) mac = part.trim()
            }
        }
        return { hostname, mac }
    } catch (e) {
        return { hostname: null, mac: null }
    }
}

export async function scanNetworkRange(startIp: string, endIp: string) {
    const session = await getSession()
    if (!session) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        const start = ipToLong(startIp)
        const end = ipToLong(endIp)

        if (end < start || (end - start) > 255) {
            return { success: false, error: "Range too large (max 255 IPs) or invalid." }
        }

        const ipsToScan: string[] = []
        for (let i = start; i <= end; i++) {
            ipsToScan.push(longToIp(i))
        }

        // Scan in batches of 5 to avoid resource exhaustion and timeouts
        const batchSize = 5
        let foundCount = 0

        for (let i = 0; i < ipsToScan.length; i += batchSize) {
            try {
                const batch = ipsToScan.slice(i, i + batchSize)
                const results = await Promise.all(batch.map(async (ip) => {
                    try {
                        const status = await checkIp(ip)
                        let hostname = null
                        let macAddress = null

                        // Try to resolve hostname if alive
                        if (status.alive) {
                            try {
                                const hostnames = await dns.reverse(ip)
                                if (hostnames && hostnames.length > 0) {
                                    hostname = hostnames[0]
                                }
                            } catch (e) {
                                // DNS lookup failed
                            }

                            // Fallback to NetBIOS (Windows Agentless)
                            // macAddress already declared above

                            try {
                                if (!hostname || !macAddress) {
                                    const netbios = await getNetBiosName(ip)
                                    if (!hostname && netbios.hostname) hostname = netbios.hostname
                                    if (netbios.mac) macAddress = netbios.mac
                                }
                            } catch (e) {
                                // Ignore NetBIOS errors per IP
                            }
                        }

                        return { ip, hostname, macAddress, ...status }
                    } catch (innerError) {
                        return { ip, alive: false, error: "Internal Check Error" }
                    }
                }))

                // Define success type
                type ScanResult = {
                    ip: string;
                    hostname: string | null;
                    macAddress: string | null;
                    alive: boolean;
                    port?: number
                }

                const activeDevices = results.filter(r => r.alive) as ScanResult[]

                // Save active devices to DB
                for (const device of activeDevices) {
                    try {
                        // Check if asset already exists
                        const existingAsset = await prisma.asset.findFirst({
                            where: { OR: [{ ipAddress: device.ip }] }
                        })

                        // Helper to safely parse JSON
                        const safeParse = (str: string | null) => { try { return str ? JSON.parse(str) : {} } catch { return {} } }
                        const existingDetails = existingAsset ? safeParse(existingAsset.specifications) : {}

                        // MERGE Strategy: Keep existing Agent data, overwrite network basics
                        const detailsObj = {
                            ...existingDetails, // Preserve agent data (cpu, ram, etc.)
                            port: device.port, // Update port status
                            mac: device.macAddress || existingDetails.mac, // Prefer new scan mac or keep old
                            match: existingAsset ? 'Asset Found' : undefined
                        }

                        // Use upsert to be safe
                        const devicePayload = {
                            ipAddress: device.ip,
                            hostname: device.hostname || existingAsset?.name, // Don't lose hostname if scan fails to resolve but it was there
                            status: existingAsset ? 'ADDED' : 'AGENT_CONNECTED', // If it was already there, keep status or set to ADDED. Actually if it has agent data, status might be AGENT_CONNECTED. Let's trust existing status if available.
                            lastSeen: new Date(),
                            details: JSON.stringify(detailsObj)
                        }

                        await prisma.discoveredDevice.upsert({
                            where: { ipAddress: device.ip },
                            create: { ...devicePayload, status: existingAsset ? 'ADDED' : 'NEW' },
                            update: devicePayload
                        })

                    } catch (saveError) {
                        console.error(`Failed to save device ${device.ip}:`, saveError)
                    }
                }
                foundCount += activeDevices.length
            } catch (batchError) {
                console.error("Batch failed:", batchError)
                // Continue to next batch
            }
        }

        revalidatePath('/admin/discovery')
        return { success: true, count: foundCount }

    } catch (error) {
        console.error("Scan error:", error)
        return { success: false, error: "Scan Failed" }
    }
}

export async function getDiscoveredDevices() {
    return await prisma.discoveredDevice.findMany({
        orderBy: { lastSeen: 'desc' }
    })
}

export async function convertToAsset(deviceId: string, data: any) {
    const session = await getSession()
    if (!session) return { success: false, error: "Unauthorized" }

    try {
        // 1. Fetch the full discovered device data
        const device = await prisma.discoveredDevice.findUnique({
            where: { id: deviceId }
        })

        if (!device) {
            return { success: false, error: "Device not found" }
        }

        // 2. Parse details
        const details = device.details ? JSON.parse(device.details) : {}

        // 3. Create new asset with merged data
        const asset = await prisma.asset.create({
            data: {
                ...data, // name, tag, type from the form
                status: 'AVAILABLE',
                // Map discovered details to Asset fields
                serialNumber: details.serial || null,
                manufacturer: details.manufacturer || null,
                model: details.model || null,
                processor: details.processor || null,
                ram: details.ram ? String(details.ram) : null,
                operatingSystem: details.os || null,
                storage: details.disks ? JSON.stringify(details.disks) : null, // Store disks in storage or specifications
                specifications: JSON.stringify(details), // Backup all raw details here
                ipAddress: device.ipAddress,
            }
        })

        // 4. Mark device as ADDED
        await prisma.discoveredDevice.update({
            where: { id: deviceId },
            data: { status: 'ADDED' }
        })

        revalidatePath('/admin/discovery')
        return { success: true, data: asset }
    } catch (error) {
        console.error("Failed to convert asset:", error)
        return { success: false, error: "Failed to create asset" }
    }
}
