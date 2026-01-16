'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getNetworkDevices() {
    try {
        const devices = await prisma.networkDevice.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                location: true
            }
        })
        return { success: true, data: devices }
    } catch (error) {
        console.error("Error fetching network devices:", error)
        return { success: false, error: "فشل جلب بيانات الأجهزة" }
    }
}

export async function createNetworkDevice(formData: FormData) {
    try {
        const data = {
            name: formData.get('name') as string,
            type: formData.get('type') as string,
            brand: formData.get('brand') as string,
            model: formData.get('model') as string,
            serialNumber: formData.get('serialNumber') as string,
            ipAddress: formData.get('ipAddress') as string,
            macAddress: formData.get('macAddress') as string,
            subnetMask: formData.get('subnetMask') as string,
            gateway: formData.get('gateway') as string,
            vlan: formData.get('vlan') as string,
            username: formData.get('username') as string,
            password: formData.get('password') as string,
            sshPort: formData.get('sshPort') ? parseInt(formData.get('sshPort') as string) : 22,
            managementUrl: formData.get('managementUrl') as string,
            status: formData.get('status') as string || "ACTIVE",
            locationId: formData.get('locationId') as string || null,
            firmwareVersion: formData.get('firmwareVersion') as string,
            notes: formData.get('notes') as string,
            installationDate: formData.get('installationDate') ? new Date(formData.get('installationDate') as string) : null,
        }

        await prisma.networkDevice.create({ data })

        revalidatePath('/network')
        return { success: true, message: "تم إضافة الجهاز بنجاح" }
    } catch (error) {
        console.error("Error creating network device:", error)
        return { success: false, error: "فشل إضافة الجهاز" }
    }
}

export async function updateNetworkDevice(id: string, formData: FormData) {
    try {
        const data = {
            name: formData.get('name') as string,
            type: formData.get('type') as string,
            brand: formData.get('brand') as string,
            model: formData.get('model') as string,
            serialNumber: formData.get('serialNumber') as string,
            ipAddress: formData.get('ipAddress') as string,
            macAddress: formData.get('macAddress') as string,
            subnetMask: formData.get('subnetMask') as string,
            gateway: formData.get('gateway') as string,
            vlan: formData.get('vlan') as string,
            username: formData.get('username') as string,
            password: formData.get('password') as string,
            sshPort: formData.get('sshPort') ? parseInt(formData.get('sshPort') as string) : 22,
            managementUrl: formData.get('managementUrl') as string,
            status: formData.get('status') as string,
            locationId: formData.get('locationId') as string || null,
            firmwareVersion: formData.get('firmwareVersion') as string,
            notes: formData.get('notes') as string,
            installationDate: formData.get('installationDate') ? new Date(formData.get('installationDate') as string) : null,
        }

        await prisma.networkDevice.update({
            where: { id },
            data
        })

        revalidatePath('/network')
        return { success: true, message: "تم تحديث بيانات الجهاز بنجاح" }
    } catch (error) {
        console.error("Error updating network device:", error)
        return { success: false, error: "فشل تحديث الجهاز" }
    }
}

export async function deleteNetworkDevice(id: string) {
    try {
        await prisma.networkDevice.delete({
            where: { id }
        })
        revalidatePath('/network')
        return { success: true, message: "تم حذف الجهاز بنجاح" }
    } catch (error) {
        console.error("Error deleting network device:", error)
        return { success: false, error: "فشل حذف الجهاز" }
    }
}

export async function getNetworkDevice(id: string) {
    try {
        const device = await prisma.networkDevice.findUnique({
            where: { id },
            include: { location: true }
        })
        return { success: true, data: device }
    } catch (error) {
        return { success: false, error: "فشل جلب بيانات الجهاز" }
    }
}
