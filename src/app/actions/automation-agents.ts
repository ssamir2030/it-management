"use server"

import prisma from "@/lib/prisma"
import { getSession } from "@/lib/simple-auth"

export type AgentDto = {
    id: string
    agentKey: string | null
    hostname: string | null
    ipAddress: string
    status: string
    lastSeen: Date
    details: Record<string, any>
    os?: string
    cpu?: string
    ram?: string
}

export async function getConnectedAgents(): Promise<{ success: boolean, data?: AgentDto[], error?: string }> {
    const session = await getSession()
    if (!session) return { success: false, error: "Unauthorized" }

    try {
        const devices = await prisma.discoveredDevice.findMany({
            orderBy: { lastSeen: 'desc' }
        })

        const mapped: AgentDto[] = devices.map((d: typeof devices[0]) => {
            let details: Record<string, any> = {}
            try {
                details = JSON.parse(d.details || '{}')
            } catch (e) {
                details = {}
            }
            return {
                id: d.id,
                agentKey: d.agentKey,
                hostname: d.hostname,
                ipAddress: d.ipAddress,
                status: d.status,
                lastSeen: d.lastSeen,
                details: details,
                os: details.os || 'Unknown',
                cpu: details.processor || 'Unknown',
                ram: details.ram || 'Unknown'
            }
        })

        return { success: true, data: mapped }
    } catch (error) {
        console.error("Failed to fetch agents", error)
        return { success: false, error: "فشل في جلب قائمة الأجهزة" }
    }
}

export async function runPowerShellScript(agentIds: string[], script: string) {
    const session = await getSession()
    if (!session) return { success: false, error: "غير مصرح" }

    if (!agentIds || agentIds.length === 0) {
        return { success: false, error: "لم يتم تحديد أي جهاز" }
    }

    if (!script || script.trim().length === 0) {
        return { success: false, error: "الأمر فارغ" }
    }

    try {
        // Get devices with their agentKey
        const devices = await prisma.discoveredDevice.findMany({
            where: { id: { in: agentIds } },
            select: { id: true, agentKey: true, hostname: true, ipAddress: true }
        })

        if (devices.length === 0) {
            return { success: false, error: "No devices found" }
        }

        // For devices without agentKey, try to find agentKey from other devices with same hostname
        const devicesWithAgentKey: { id: string, agentKey: string, hostname: string | null }[] = []

        for (const device of devices) {
            if (device.agentKey) {
                devicesWithAgentKey.push({ ...device, agentKey: device.agentKey })
            } else if (device.hostname) {
                // Find another device with same hostname that has agentKey
                const otherDevice = await prisma.discoveredDevice.findFirst({
                    where: {
                        hostname: device.hostname,
                        agentKey: { not: null }
                    },
                    select: { agentKey: true }
                })
                if (otherDevice?.agentKey) {
                    devicesWithAgentKey.push({ ...device, agentKey: otherDevice.agentKey })
                    console.log(`[runPowerShellScript] Found agentKey from another device with hostname: ${device.hostname}`)
                }
            }
        }

        if (devicesWithAgentKey.length === 0) {
            return { success: false, error: "Selected devices don't have Agent connected. Please install Agent first." }
        }

        // Log what agentKeys we're creating commands for
        console.log(`[runPowerShellScript] Creating commands for devices:`)
        devicesWithAgentKey.forEach(d => {
            console.log(`  -> hostname: ${d.hostname}, agentKey: ${d.agentKey}`)
        })

        // Create commands using AgentKey as deviceId
        // We filter out any remaining nulls just in case, though logic above should catch them
        const validDevices = devicesWithAgentKey.filter(d => d.agentKey)

        const commands = await prisma.agentCommand.createMany({
            data: validDevices.map((d) => ({
                deviceId: d.agentKey as string,
                command: script,
                status: "PENDING",
                createdBy: (session as any).email || 'unknown'
            }))
        })

        console.log(`[runPowerShellScript] Created ${commands.count} commands with agentKeys: ${devicesWithAgentKey.map(d => d.agentKey.substring(0, 8)).join(', ')}`)

        return {
            success: true,
            message: `تم إرسال الأمر إلى ${devicesWithAgentKey.length} جهاز`,
            commandCount: commands.count
        }
    } catch (error) {
        console.error("Failed to create commands", error)
        return { success: false, error: "فشل في إنشاء الأوامر" }
    }
}

// Get command status for monitoring
export async function getCommandStatus(limit: number = 50) {
    const session = await getSession()
    if (!session) return { success: false, error: "Unauthorized" }

    try {
        const commands = await prisma.agentCommand.findMany({
            orderBy: { createdAt: 'desc' },
            take: limit
        })

        return { success: true, data: commands }
    } catch (error) {
        return { success: false, error: "فشل في جلب حالة الأوامر" }
    }
}

// Set agent polling interval
export async function setAgentPollingInterval(agentId: string, intervalSeconds: number) {
    const session = await getSession()
    if (!session) return { success: false, error: "Unauthorized" }

    try {
        const device = await prisma.discoveredDevice.findUnique({
            where: { id: agentId },
            select: { agentKey: true }
        })

        if (!device || !device.agentKey) {
            return { success: false, error: "Device not found or agent not connected" }
        }

        // Create custom command
        await prisma.agentCommand.create({
            data: {
                deviceId: device.agentKey,
                command: `SET_POLLING ${intervalSeconds}`,
                status: "PENDING",
                createdBy: session.email || 'unknown'
            }
        })

        return { success: true, message: `Polling set to ${intervalSeconds}s` }
    } catch (error) {
        console.error("Failed to set polling", error)
        return { success: false, error: "Failed to set polling" }
    }
}

// List files on agent
export async function listAgentFiles(agentId: string, path: string = "ROOT") {
    const session = await getSession()
    if (!session) return { success: false, error: "Unauthorized" }

    try {
        const device = await prisma.discoveredDevice.findUnique({
            where: { id: agentId },
            select: { agentKey: true }
        })

        if (!device || !device.agentKey) {
            return { success: false, error: "Device not found or agent not connected" }
        }

        // Create custom command
        const command = await prisma.agentCommand.create({
            data: {
                deviceId: device.agentKey,
                command: `FILE_LS ${path}`,
                status: "PENDING",
                createdBy: session.email || 'unknown'
            }
        })

        return { success: true, commandId: command.id }
    } catch (error) {
        console.error("Failed to list files", error)
        return { success: false, error: "Failed to list files" }
    }
}

// Get specific command result (for File Manager polling)
export async function getCommandResult(commandId: string) {
    const session = await getSession()
    if (!session) return { success: false, error: "Unauthorized" }

    try {
        const command = await prisma.agentCommand.findUnique({
            where: { id: commandId }
        })

        if (!command) return { success: false, error: "Command not found" }

        return {
            success: true,
            status: command.status,
            result: command.result,
            error: command.errorMessage
        }
    } catch (error) {
        return { success: false, error: "Failed to get command result" }
    }
}

// Download file from agent
export async function downloadAgentFile(agentId: string, path: string) {
    const session = await getSession()
    if (!session) return { success: false, error: "Unauthorized" }

    try {
        const device = await prisma.discoveredDevice.findUnique({
            where: { id: agentId },
            select: { agentKey: true }
        })

        if (!device || !device.agentKey) {
            return { success: false, error: "Device not found or agent not connected" }
        }

        // Create custom command
        const command = await prisma.agentCommand.create({
            data: {
                deviceId: device.agentKey,
                command: `FILE_GET ${path}`,
                status: "PENDING",
                createdBy: session.email || 'unknown'
            }
        })

        return { success: true, commandId: command.id }
    } catch (error) {
        console.error("Failed to initiate download", error)
        return { success: false, error: "Failed to initiate download" }
    }
}

// Request screenshot
export async function requestAgentScreenshot(agentId: string) {
    const session = await getSession()
    if (!session) return { success: false, error: "Unauthorized" }

    try {
        const device = await prisma.discoveredDevice.findUnique({
            where: { id: agentId },
            select: { agentKey: true }
        })

        if (!device || !device.agentKey) {
            return { success: false, error: "Device not found or agent not connected" }
        }

        const command = await prisma.agentCommand.create({
            data: {
                deviceId: device.agentKey,
                command: `GET_SCREENSHOT`,
                status: "PENDING",
                createdBy: session.email || 'unknown'
            }
        })

        return { success: true, commandId: command.id }
    } catch (error) {
        console.error("Failed to request screenshot", error)
        return { success: false, error: "Failed to request screenshot" }
    }
}
