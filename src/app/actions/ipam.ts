"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const subnetSchema = z.object({
    name: z.string().min(1, "Name is required"),
    cidr: z.string().min(7, "Invalid CIDR"),
    gateway: z.string().optional(),
    vlan: z.coerce.number().optional(),
    description: z.string().optional(),
    locationId: z.string().optional(),
    type: z.string().default("WIRED"),
    ssid: z.string().optional(),
    securityProtocol: z.string().optional(),
    wifiPassword: z.string().optional(),
})

export async function getSubnets() {
    try {
        const subnets = await prisma.subnet.findMany({
            include: {
                location: true
            },
            orderBy: { cidr: 'asc' }
        })
        return { success: true, data: subnets }
    } catch (error) {
        console.error("Failed to fetch subnets:", error)
        return { success: false, error: "Failed to fetch subnets" }
    }
}

export async function createSubnet(formData: FormData) {
    try {
        const data = {
            name: formData.get("name"),
            cidr: formData.get("cidr"),
            gateway: formData.get("gateway"),
            vlan: formData.get("vlan"),
            description: formData.get("description"),
            locationId: formData.get("locationId") === "none" ? undefined : formData.get("locationId"),
            type: formData.get("type"),
            ssid: formData.get("ssid"),
            securityProtocol: formData.get("securityProtocol"),
            wifiPassword: formData.get("wifiPassword"),
        }

        const validated = subnetSchema.parse(data)

        await prisma.subnet.create({
            data: validated
        })

        revalidatePath("/admin/ipam")
        return { success: true }
    } catch (error) {
        console.error("Failed to create subnet:", error)
        return { success: false, error: "Failed to create subnet" }
    }
}

export async function deleteSubnet(id: string) {
    try {
        await prisma.subnet.delete({ where: { id } })
        revalidatePath("/admin/ipam")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to delete subnet" }
    }
}

export interface IPStatus {
    ip: string
    status: 'FREE' | 'USED' | 'RESERVED' | 'GATEWAY'
    device?: {
        id: string
        name: string
        type: string
        tag?: string
    }
}

export async function scanSubnet(subnetId: string) {
    try {
        const subnet = await prisma.subnet.findUnique({ where: { id: subnetId } })
        if (!subnet) return { success: false, error: "Subnet not found" }

        // 1. Parsing CIDR (Assuming /24 for simplicity in this MVP, but handling basic logic)
        // e.g. 192.168.1.0/24 -> Base 192.168.1.
        const parts = subnet.cidr.split('/')
        const ipBase = parts[0].split('.').slice(0, 3).join('.') // "192.168.1"

        // 2. Fetch all assets that might match this range
        // In a real optimized app, we'd use database "startsWith" or specific IP integer logic.
        // For now, simpler fuzzy match.
        const assets = await prisma.asset.findMany({
            where: {
                ipAddress: {
                    startsWith: ipBase
                }
            },
            select: { id: true, name: true, type: true, ipAddress: true, tag: true }
        })

        // 3. Build Map
        const ipMap: IPStatus[] = []

        for (let i = 1; i < 255; i++) {
            const currentIp = `${ipBase}.${i}`

            // Check if Gateway
            if (subnet.gateway === currentIp) {
                ipMap.push({ ip: currentIp, status: 'GATEWAY', device: { id: 'gw', name: 'Gateway', type: 'ROUTER' } })
                continue
            }

            // Check Assets
            const matchedAsset = assets.find(a => a.ipAddress === currentIp)

            if (matchedAsset) {
                ipMap.push({
                    ip: currentIp,
                    status: 'USED',
                    device: matchedAsset
                })
            } else {
                ipMap.push({
                    ip: currentIp,
                    status: 'FREE'
                })
            }
        }

        return { success: true, data: ipMap, subnet }

    } catch (error) {
        console.error("Scan failed:", error)
        return { success: false, error: "Failed to scan subnet" }
    }
}
