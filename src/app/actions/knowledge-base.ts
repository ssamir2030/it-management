'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

import { getSession } from "@/lib/simple-auth"

export async function getCategories() {
    try {
        const categories = await prisma.articleCategory.findMany({
            include: {
                _count: {
                    select: { articles: true }
                }
            }
        })
        return { success: true, data: categories }
    } catch (error) {
        console.error("Error fetching categories:", error)
        return { success: false, error: "Failed to fetch categories" }
    }
}

export async function getArticles(query?: string, categoryId?: string) {
    try {
        // For admin, we might want to see unpublished articles too, but let's keep it simple for now or add a flag
        const where: any = {}

        if (query) {
            where.OR = [
                { title: { contains: query } },
                { content: { contains: query } }
            ]
        }

        if (categoryId) {
            where.categoryId = categoryId
        }

        const articles = await prisma.article.findMany({
            where,
            include: {
                category: true,
                author: {
                    select: { name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return { success: true, data: articles }
    } catch (error) {
        console.error("Error fetching articles:", error)
        return { success: false, error: "Failed to fetch articles" }
    }
}

export async function getArticleById(id: string) {
    try {
        const article = await prisma.article.findUnique({
            where: { id },
            include: {
                category: true,
                author: {
                    select: { name: true }
                }
            }
        })

        if (!article) return { success: false, error: "Article not found" }

        // Increment views
        // We don't await this to speed up response
        prisma.article.update({
            where: { id },
            data: { views: { increment: 1 } }
        }).catch(err => console.error("Error incrementing views", err))

        return { success: true, data: article }
    } catch (error) {
        console.error("Error fetching article:", error)
        return { success: false, error: "Failed to fetch article" }
    }
}

export async function createArticle(data: { title: string; content: string; categoryId: string; isPublished?: boolean }) {
    const session = await getSession('ADMIN')
    if (!session || session.role !== 'ADMIN') return { success: false, error: "غير مصرح لك بهذا الإجراء" }

    try {
        const article = await prisma.article.create({
            data: {
                title: data.title,
                content: data.content,
                categoryId: data.categoryId,
                authorId: session.id as string,
                isPublished: data.isPublished ?? true
            }
        })
        revalidatePath('/portal/knowledge')
        revalidatePath('/admin/knowledge')
        return { success: true, data: article }
    } catch (error) {
        console.error("Error creating article:", error)
        return { success: false, error: "فشل إنشاء المقال" }
    }
}

export async function updateArticle(id: string, data: { title?: string; content?: string; categoryId?: string; isPublished?: boolean }) {
    const session = await getSession('ADMIN')
    if (!session || session.role !== 'ADMIN') return { success: false, error: "غير مصرح لك بهذا الإجراء" }

    try {
        const article = await prisma.article.update({
            where: { id },
            data
        })
        revalidatePath('/portal/knowledge')
        revalidatePath('/admin/knowledge')
        revalidatePath(`/portal/knowledge/${id}`)
        return { success: true, data: article }
    } catch (error) {
        console.error("Error updating article:", error)
        return { success: false, error: "فشل تحديث المقال" }
    }
}

export async function deleteArticle(id: string) {
    const session = await getSession('ADMIN')
    if (!session || session.role !== 'ADMIN') return { success: false, error: "غير مصرح لك بهذا الإجراء" }

    try {
        await prisma.article.delete({ where: { id } })
        revalidatePath('/portal/knowledge')
        revalidatePath('/admin/knowledge')
        return { success: true }
    } catch (error) {
        console.error("Error deleting article:", error)
        return { success: false, error: "فشل حذف المقال" }
    }
}
