"use server"

import prisma from "@/lib/prisma"
import { getSession } from "@/lib/simple-auth"
import { logEvent } from "@/lib/system-log"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { hasPermission } from "@/lib/rbac"

const categorySchema = z.object({
    nameAr: z.string().min(2, "الاسم بالعربية مطلوب"),
    nameEn: z.string().min(2, "Name in English is required"),
    type: z.string().default("OTHER"),
    icon: z.string().optional(),
    prefix: z.string().optional(),
    parentId: z.string().optional().nullable(),
})

export async function getAssetCategories() {
    console.log("getAssetCategories called (Debug Mode)")
    return { success: true, data: [] }
    /*
    try {
        const session = await getSession()
        // Allow read for everyone authenticated
        if (!session) return { success: false, error: "Unauthorized" }

        const categories = await prisma.assetCategory.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { assets: true, children: true }
                },
                parent: {
                    select: { nameAr: true, nameEn: true }
                }
            }
        })
        return { success: true, data: categories }
    } catch (error) {
        console.error("Fetch Categories Error:", error)
        return { success: false, error: "Failed to fetch categories: " + (error instanceof Error ? error.message : String(error)) }
    }
    */
}

export async function createAssetCategory(data: z.infer<typeof categorySchema>) {
    const session = await getSession()
    if (!session?.role || !hasPermission(session.role as string, 'manage_settings')) return { success: false, error: "Unauthorized" }

    const validated = categorySchema.safeParse(data)
    if (!validated.success) return { success: false, error: validated.error.errors[0].message }

    try {
        const category = await prisma.assetCategory.create({
            data: validated.data
        })

        await logEvent('CREATE', 'ASSET', `تم إنشاء تصنيف جديد: ${data.nameAr}`)
        revalidatePath('/admin/settings/categories')
        return { success: true, data: category }
    } catch (error) {
        console.error("Create Category Error:", error)
        return { success: false, error: "Failed to create category" }
    }
}

export async function updateAssetCategory(id: string, data: Partial<z.infer<typeof categorySchema>>) {
    const session = await getSession()
    if (!session?.role || !hasPermission(session.role as string, 'manage_settings')) return { success: false, error: "Unauthorized" }

    try {
        const category = await prisma.assetCategory.update({
            where: { id },
            data: data
        })

        await logEvent('UPDATE', 'ASSET', `تم تحديث تصنيف: ${category.nameAr}`)
        revalidatePath('/admin/settings/categories')
        return { success: true, data: category }
    } catch (error) {
        console.error("Update Category Error:", error)
        return { success: false, error: "Failed to update category" }
    }
}

export async function deleteAssetCategory(id: string) {
    const session = await getSession()
    if (!session?.role || !hasPermission(session.role as string, 'manage_settings')) return { success: false, error: "Unauthorized" }

    try {
        // Check for assets first
        const category = await prisma.assetCategory.findUnique({
            where: { id },
            include: {
                _count: { select: { assets: true, children: true } }
            }
        })

        if (!category) return { success: false, error: "Category not found" }
        if (category._count.assets > 0) return { success: false, error: "لا يمكن حذف تصنيف مرتبط بأصول" }
        if (category._count.children > 0) return { success: false, error: "لا يمكن حذف تصنيف يحتوي على تصنيفات فرعية" }

        await prisma.assetCategory.delete({ where: { id } })

        await logEvent('DELETE', 'ASSET', `تم حذف تصنيف: ${category.nameAr}`)
        revalidatePath('/admin/settings/categories')
        return { success: true }
    } catch (error) {
        console.error("Delete Category Error:", error)
        return { success: false, error: "Failed to delete category" }
    }
}

// Aliases for compatibility
export const getCategories = getAssetCategories
export const createCategory = createAssetCategory
export const updateCategory = updateAssetCategory
export const deleteCategory = deleteAssetCategory

export async function getCategoryById(id: string) {
    const session = await getSession()
    if (!session) return { success: false, error: "Unauthorized" }

    try {
        const category = await prisma.assetCategory.findUnique({
            where: { id }
        })
        if (!category) return { success: false, error: "Category not found" }
        return { success: true, data: category }
    } catch (error) {
        console.error("Get Category Error:", error)
        return { success: false, error: "Failed to fetch category" }
    }
}
