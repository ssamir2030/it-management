'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getSession } from "@/lib/simple-auth"
import { notifyNewRequest } from "./employee-notifications"

export async function getSoftwareList() {
    try {
        const software = await prisma.softwareCatalog.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' }
        })
        return { success: true, data: software }
    } catch (error) {
        console.error("Error fetching software:", error)
        return { success: false, error: "فشل جلب قائمة البرامج" }
    }
}

export async function getAllSoftware() {
    try {
        const session = await getSession('ADMIN')
        if (!session || session.role !== 'ADMIN') {
            return { success: false, error: "غير مصرح لك بهذا الإجراء" }
        }

        const software = await prisma.softwareCatalog.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return { success: true, data: software }
    } catch (error) {
        console.error("Error fetching all software:", error)
        return { success: false, error: "فشل جلب قائمة البرامج" }
    }
}

export async function getSoftwareById(id: string) {
    try {
        const software = await prisma.softwareCatalog.findUnique({
            where: { id }
        })

        if (!software) return { success: false, error: "البرنامج غير موجود" }

        return { success: true, data: software }
    } catch (error) {
        console.error("Error fetching software:", error)
        return { success: false, error: "فشل جلب البرنامج" }
    }
}

export async function createSoftware(data: {
    name: string
    description?: string
    version?: string
    icon?: string
    downloadUrl?: string
    category?: string
    requiresLicense?: boolean
    isActive?: boolean
}) {
    try {
        const session = await getSession('ADMIN')
        if (!session || session.role !== 'ADMIN') {
            return { success: false, error: "غير مصرح لك بهذا الإجراء" }
        }

        const software = await prisma.softwareCatalog.create({
            data: {
                name: data.name,
                description: data.description,
                version: data.version,
                icon: data.icon,
                downloadUrl: data.downloadUrl,
                category: data.category || "General",
                requiresLicense: data.requiresLicense ?? false,
                isActive: data.isActive ?? true
            }
        })

        revalidatePath('/portal/software')
        revalidatePath('/admin/software')

        return { success: true, data: software }
    } catch (error) {
        console.error("Error creating software:", error)
        return { success: false, error: "فشل إضافة البرنامج" }
    }
}

export async function updateSoftware(id: string, data: {
    name?: string
    description?: string
    version?: string
    icon?: string
    downloadUrl?: string
    category?: string
    requiresLicense?: boolean
    isActive?: boolean
}) {
    try {
        const session = await getSession('ADMIN')
        if (!session || session.role !== 'ADMIN') {
            return { success: false, error: "غير مصرح لك بهذا الإجراء" }
        }

        const software = await prisma.softwareCatalog.update({
            where: { id },
            data
        })

        revalidatePath('/portal/software')
        revalidatePath('/admin/software')

        return { success: true, data: software }
    } catch (error) {
        console.error("Error updating software:", error)
        return { success: false, error: "فشل تحديث البرنامج" }
    }
}

export async function deleteSoftware(id: string) {
    try {
        const session = await getSession('ADMIN')
        if (!session || session.role !== 'ADMIN') {
            return { success: false, error: "غير مصرح لك بهذا الإجراء" }
        }

        await prisma.softwareCatalog.delete({
            where: { id }
        })

        revalidatePath('/portal/software')
        revalidatePath('/admin/software')

        return { success: true }
    } catch (error) {
        console.error("Error deleting software:", error)
        return { success: false, error: "فشل حذف البرنامج" }
    }
}

// Request software installation (creates an EmployeeRequest)
export async function requestSoftwareInstallation(softwareId: string, details?: string) {
    try {
        const session = await getSession()
        if (!session?.id) {
            return { success: false, error: "يجب تسجيل الدخول أولاً" }
        }

        const software = await prisma.softwareCatalog.findUnique({
            where: { id: softwareId }
        })

        if (!software) {
            return { success: false, error: "البرنامج غير موجود" }
        }

        // Create an EmployeeRequest for software installation
        const request = await prisma.employeeRequest.create({
            data: {
                type: 'SOFTWARE',
                subject: `طلب تثبيت برنامج: ${software.name}`,
                details: details || `طلب تثبيت ${software.name} ${software.version ? `- الإصدار ${software.version}` : ''}`,
                employeeId: session.id as string,
                status: 'PENDING',
                priority: 'MEDIUM'
            }
        })

        // Create timeline entry
        await prisma.requestTimeline.create({
            data: {
                requestId: request.id,
                status: 'PENDING',
                title: 'تم إنشاء الطلب',
                description: `طلب تثبيت ${software.name}`,
                actorName: (session.name as string) || 'موظف'
            }
        })

        // Notify Admins
        await notifyNewRequest(session.id as string, 'SOFTWARE', request.id)

        revalidatePath('/portal/requests')
        revalidatePath('/portal/dashboard')

        return { success: true, data: request }
    } catch (error) {
        console.error("Error requesting software installation:", error)
        return { success: false, error: "فشل إرسال الطلب" }
    }
}
