'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { logAction } from "@/lib/audit"

export async function createLicense(formData: FormData) {
    const name = formData.get("name") as string
    const key = formData.get("key") as string
    const type = formData.get("type") as string
    const seats = parseInt(formData.get("seats") as string) || 1
    const cost = parseFloat(formData.get("cost") as string) || 0
    const supplierId = formData.get("supplierId") as string
    const purchaseDate = formData.get("purchaseDate") ? new Date(formData.get("purchaseDate") as string) : null
    const expiryDate = formData.get("expiryDate") ? new Date(formData.get("expiryDate") as string) : null
    const notes = formData.get("notes") as string

    if (!name) {
        return { success: false, error: "اسم الرخصة مطلوب" }
    }

    try {
        const license = await prisma.softwareLicense.create({
            data: {
                name,
                key: key || null,
                type: type || 'SUBSCRIPTION',
                seats,
                cost,
                purchaseDate,
                expiryDate,
                notes,
                supplierId: supplierId || null,
            }
        })

        await logAction({
            action: 'CREATE',
            entityType: 'LICENSE',
            entityId: license.id,
            entityName: license.name,
            changes: { type, seats, cost }
        })

        revalidatePath("/admin/licenses")
        return { success: true, data: license }
    } catch (error) {
        console.error("Error creating license:", error)
        return { success: false, error: "فشل حفظ الرخصة" }
    }
}

export async function getLicenses() {
    try {
        const licenses = await prisma.softwareLicense.findMany({
            orderBy: { expiryDate: 'asc' },
            include: {
                supplier: { select: { name: true } },
                _count: { select: { assets: true, employees: true } }
            }
        })
        return { success: true, data: licenses }
    } catch (error) {
        console.error("Error fetching licenses:", error)
        return { success: false, data: [] }
    }
}

export async function getLicense(id: string) {
    try {
        const license = await prisma.softwareLicense.findUnique({
            where: { id },
            include: {
                supplier: true,
                assets: {
                    select: { id: true, name: true, tag: true, employee: { select: { name: true } } }
                },
                employees: {
                    select: { id: true, name: true, jobTitle: true, department: { select: { name: true } } }
                },
                _count: { select: { assets: true, employees: true } }
            }
        })

        if (!license) return { success: false, error: "License not found" }
        return { success: true, data: license }
    } catch (error) {
        console.error("Error fetching license:", error)
        return { success: false, error: "Failed to fetch license" }
    }
}

export async function deleteLicense(id: string) {
    try {
        const deleted = await prisma.softwareLicense.delete({
            where: { id }
        })

        await logAction({
            action: 'DELETE',
            entityType: 'LICENSE',
            entityId: id,
            entityName: deleted.name
        })

        revalidatePath("/admin/licenses")
        return { success: true }
    } catch (error) {
        console.error("Error deleting license:", error)
        return { success: false, error: "فشل حذف الرخصة" }
    }
}

export async function getExpiringLicenses() {
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    try {
        const licenses = await prisma.softwareLicense.findMany({
            where: {
                expiryDate: {
                    lte: thirtyDaysFromNow,
                    gte: new Date() // Not expired yet, but expiring soon
                }
            },
            orderBy: { expiryDate: 'asc' }
        })
        return { success: true, data: licenses }
    } catch (error) {
        console.error("Error fetching expiring licenses:", error)
        return { success: false, data: [] }
    }
}


export async function assignLicense(licenseId: string, entityId: string, entityType: 'ASSET' | 'EMPLOYEE') {
    try {
        const license = await prisma.softwareLicense.findUnique({
            where: { id: licenseId },
            include: { _count: { select: { assets: true, employees: true } } }
        })

        if (!license) return { success: false, error: "الرخصة غير موجودة" }

        const usedCount = (license._count.assets || 0) + (license._count.employees || 0)
        if (usedCount >= license.seats) {
            return { success: false, error: "تم استنفاد جميع المقاعد المتاحة لهذه الرخصة" }
        }

        if (entityType === 'ASSET') {
            await prisma.softwareLicense.update({
                where: { id: licenseId },
                data: { assets: { connect: { id: entityId } } }
            })
        } else {
            await prisma.softwareLicense.update({
                where: { id: licenseId },
                data: { employees: { connect: { id: entityId } } }
            })
        }

        await logAction({
            action: 'ASSIGN',
            entityType: 'LICENSE',
            entityId: licenseId,
            entityName: license.name,
            changes: { assignedTo: entityId, type: entityType }
        })

        revalidatePath("/admin/licenses")
        return { success: true }
    } catch (error) {
        console.error("Error assigning license:", error)
        return { success: false, error: "فشل تعيين الرخصة" }
    }
}

export async function unassignLicense(licenseId: string, entityId: string, entityType: 'ASSET' | 'EMPLOYEE') {
    try {
        if (entityType === 'ASSET') {
            await prisma.softwareLicense.update({
                where: { id: licenseId },
                data: { assets: { disconnect: { id: entityId } } }
            })
        } else {
            await prisma.softwareLicense.update({
                where: { id: licenseId },
                data: { employees: { disconnect: { id: entityId } } }
            })
        }

        await logAction({
            action: 'RETURN', // Using RETURN as unassign
            entityType: 'LICENSE',
            entityId: licenseId,
            changes: { unassignedFrom: entityId, type: entityType }
        })

        revalidatePath("/admin/licenses")
        return { success: true }
    } catch (error) {
        console.error("Error unassigning license:", error)
        return { success: false, error: "فشل إلغاء تعيين الرخصة" }
    }
}
