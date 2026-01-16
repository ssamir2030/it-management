'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { logAction } from "@/lib/audit"

// Categories
export async function getCategories() {
    try {
        const categories = await prisma.knowledgeCategory.findMany({
            include: {
                _count: {
                    select: { articles: true }
                }
            },
            orderBy: { nameAr: 'asc' }
        })
        return { success: true, data: categories }
    } catch (error) {
        console.error("Error fetching knowledge categories:", error)
        return { success: false, data: [] }
    }
}

export async function createCategory(formData: FormData) {
    const nameAr = formData.get("nameAr") as string
    const description = formData.get("description") as string
    const slug = nameAr.toLowerCase().replace(/ /g, '-') + '-' + Date.now()

    if (!nameAr) return { success: false, error: "اسم التصنيف مطلوب" }

    try {
        const category = await prisma.knowledgeCategory.create({
            data: {
                nameAr,
                description,
                slug,
            }
        })

        revalidatePath("/admin/knowledge")
        revalidatePath("/portal/knowledge")
        return { success: true }
    } catch (error) {
        return { success: false, error: "فشل إنشاء التصنيف" }
    }
}

// Articles
export async function getArticles(search?: string, categoryId?: string) {
    try {
        const where: any = {}
        if (categoryId) where.categoryId = categoryId
        if (search) {
            where.OR = [
                { title: { contains: search } },
                { content: { contains: search } }
            ]
        }

        const articles = await prisma.knowledgeArticle.findMany({
            where,
            include: {
                category: true
            },
            orderBy: { createdAt: 'desc' }
        })
        return { success: true, data: articles }
    } catch (error) {
        return { success: false, data: [] }
    }
}

export async function getArticle(id: string) {
    try {
        const article = await prisma.knowledgeArticle.findUnique({
            where: { id },
            include: { category: true }
        })
        return { success: true, data: article }
    } catch (error) {
        return { success: false }
    }
}

export async function createArticle(formData: FormData) {
    const title = formData.get("title") as string
    const content = formData.get("content") as string
    const categoryId = formData.get("categoryId") as string
    const isPublished = formData.get("isPublished") === "true"

    if (!title || !content || !categoryId) {
        return { success: false, error: "جميع الحقول مطلوبة" }
    }

    try {
        const article = await prisma.knowledgeArticle.create({
            data: {
                title,
                content,
                categoryId,
                isPublished,
                authorId: null, // No relation in schema for KnowledgeArticle
            }
        })

        revalidatePath("/admin/knowledge")
        revalidatePath("/portal/knowledge")
        return { success: true, data: article }
    } catch (error) {
        console.error("Knowledge creation error:", error)
        return { success: false, error: "فشل إنشاء المقال" }
    }
}

export async function incrementArticleView(id: string) {
    await prisma.knowledgeArticle.update({
        where: { id },
        data: { views: { increment: 1 } }
    })
}

export async function seedCategories() {
    // Check if categories exist
    const count = await prisma.knowledgeCategory.count()
    if (count > 0) return

    const categories = [
        { nameAr: 'حلول المشاكل', description: 'حلول للمشاكل التقنية الشائعة', slug: 'troubleshooting' },
        { nameAr: 'أدلة الاستخدام', description: 'أدلة إرشادية لاستخدام الأنظمة', slug: 'guides' },
        { nameAr: 'سياسات تكنولوجيا المعلومات', description: 'السياسات والإجراءات المتبعة', slug: 'policies' }
    ]

    for (const cat of categories) {
        await prisma.knowledgeCategory.create({
            data: cat
        })
    }
}
