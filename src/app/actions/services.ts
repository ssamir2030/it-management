'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { logAction } from "@/lib/audit"

// Categories
export async function getServiceCategories() {
    try {
        const categories = await prisma.serviceCategory.findMany({
            include: {
                _count: {
                    select: { items: true }
                }
            },
            orderBy: { nameAr: 'asc' }
        })
        return { success: true, data: categories }
    } catch (error) {
        console.error("Error fetching service categories:", error)
        return { success: false, data: [] }
    }
}

export async function createServiceCategory(formData: FormData) {
    const nameAr = formData.get("nameAr") as string
    const description = formData.get("description") as string
    const icon = formData.get("icon") as string
    const slug = nameAr.toLowerCase().replace(/ /g, '-') + '-' + Date.now()

    if (!nameAr) return { success: false, error: "اسم التصنيف مطلوب" }

    try {
        await prisma.serviceCategory.create({
            data: { nameAr, description, icon, slug }
        })
        revalidatePath("/admin/services")
        revalidatePath("/portal/services")
        return { success: true }
    } catch (error) {
        return { success: false, error: "فشل إنشاء التصنيف" }
    }
}

// Service Items
export async function getServiceItems(categoryId?: string) {
    try {
        const where: any = {}
        if (categoryId) where.categoryId = categoryId

        const items = await prisma.serviceItem.findMany({
            where,
            include: { category: true },
            orderBy: { nameAr: 'asc' }
        })
        return { success: true, data: items }
    } catch (error) {
        return { success: false, data: [] }
    }
}

export async function getServiceItem(id: string) {
    try {
        const item = await prisma.serviceItem.findUnique({
            where: { id },
            include: { category: true }
        })
        return { success: true, data: item }
    } catch (error) {
        return { success: false }
    }
}

export async function createServiceItem(formData: FormData) {
    const nameAr = formData.get("nameAr") as string
    const description = formData.get("description") as string
    const categoryId = formData.get("categoryId") as string
    const slaHours = parseInt(formData.get("slaHours") as string) || 24
    const approvalRequired = formData.get("approvalRequired") === "true"

    if (!nameAr || !categoryId) {
        return { success: false, error: "الاسم والتصنيف مطلوبان" }
    }

    try {
        await prisma.serviceItem.create({
            data: {
                nameAr,
                description,
                categoryId,
                slaHours,
                approvalRequired
            }
        })
        revalidatePath("/admin/services")
        revalidatePath("/portal/services")
        return { success: true }
    } catch (error) {
        return { success: false, error: "فشل إنشاء الخدمة" }
    }
}
