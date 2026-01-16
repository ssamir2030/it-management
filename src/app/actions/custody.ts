'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getCustodyItems() {
    try {
        const items = await prisma.custodyItem.findMany({
            include: {
                asset: true,
                employee: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        return { success: true, data: items }
    } catch (error) {
        console.error('Error fetching custody items:', error)
        return { success: false, error: 'Failed to fetch custody items' }
    }
}

export async function createCustodyItem(data: { name: string, employeeId: string, description?: string }) {
    try {
        const item = await prisma.custodyItem.create({
            data: {
                name: data.name,
                employeeId: data.employeeId,
                description: data.description
            }
        })
        revalidatePath("/admin/custody")
        return { success: true, data: item }
    } catch (error) {
        return { success: false, error: "Failed to create custody item" }
    }
}

export async function getEmployeesForSelect() {
    try {
        const employees = await prisma.employee.findMany({
            select: {
                id: true,
                name: true
            },
            orderBy: {
                name: 'asc'
            }
        })
        return { success: true, data: employees }
    } catch (error) {
        console.error('Error fetching employees:', error)
        return { success: false, error: 'Failed to fetch employees' }
    }
}

export async function acknowledgeCustody(custodyItemId: string) {
    try {
        await prisma.custodyItem.update({
            where: { id: custodyItemId },
            data: {
                isAcknowledged: true,
                acknowledgedAt: new Date()
            }
        })
        revalidatePath('/portal/my-assets')
        return { success: true }
    } catch (error) {
        console.error('Error acknowledging custody:', error)
        return { success: false, error: 'Failed to acknowledge custody' }
    }
}

export async function getCustodyItem(id: string) {
    try {
        const item = await prisma.custodyItem.findUnique({
            where: { id },
            include: { asset: true, employee: true }
        })
        return { success: true, data: item }
    } catch (error) {
        return { success: false, error: "فشل جلب بيانات العهدة" }
    }
}

export async function updateCustodyItem(id: string, formData: FormData) {
    try {
        const name = formData.get("name") as string
        const employeeId = formData.get("employeeId") as string
        const description = formData.get("description") as string

        await prisma.custodyItem.update({
            where: { id },
            data: {
                name,
                employeeId,
                description,
            }
        })

        revalidatePath("/admin/custody")
        revalidatePath("/custody")
        return { success: true }
    } catch (error) {
        return { success: false, error: "فشل تحديث العهدة" }
    }
}

export async function deleteCustodyItem(id: string) {
    try {
        await prisma.custodyItem.delete({
            where: { id }
        })

        revalidatePath("/admin/custody")
        revalidatePath("/custody")
        return { success: true }
    } catch (error) {
        return { success: false, error: "فشل حذف العهدة" }
    }
}
