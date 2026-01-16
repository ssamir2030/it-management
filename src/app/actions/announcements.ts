'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getActiveAnnouncements() {
    try {
        const now = new Date()
        const announcements = await prisma.announcement.findMany({
            where: {
                isActive: true,
                startDate: { lte: now },
                OR: [
                    { endDate: null },
                    { endDate: { gte: now } }
                ]
            },
            orderBy: { createdAt: 'desc' }
        })
        return { success: true, data: announcements }
    } catch (error) {
        console.error("Error fetching announcements:", error)
        return { success: false, error: "Failed to fetch announcements" }
    }
}

export async function getAllAnnouncements() {
    try {
        const announcements = await prisma.announcement.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return { success: true, data: announcements }
    } catch (error) {
        console.error("Error fetching all announcements:", error)
        return { success: false, error: "Failed to fetch announcements" }
    }
}

export async function createAnnouncement(data: {
    title: string
    content: string
    type: string
    startDate: Date
    endDate?: Date
}) {
    try {
        await prisma.announcement.create({
            data: {
                title: data.title,
                content: data.content,
                type: data.type,
                startDate: data.startDate,
                endDate: data.endDate,
                isActive: true
            }
        })
        revalidatePath('/admin/announcements')
        revalidatePath('/portal')
        return { success: true }
    } catch (error) {
        console.error("Error creating announcement:", error)
        return { success: false, error: "Failed to create announcement" }
    }
}

export async function updateAnnouncement(id: string, data: {
    title: string
    content: string
    type: string
    startDate: Date
    endDate?: Date
}) {
    try {
        await prisma.announcement.update({
            where: { id },
            data: {
                title: data.title,
                content: data.content,
                type: data.type,
                startDate: data.startDate,
                endDate: data.endDate
            }
        })
        revalidatePath('/admin/announcements')
        revalidatePath('/portal')
        return { success: true }
    } catch (error) {
        console.error("Error updating announcement:", error)
        return { success: false, error: "Failed to update announcement" }
    }
}

export async function getAnnouncement(id: string) {
    try {
        const announcement = await prisma.announcement.findUnique({
            where: { id }
        })
        return { success: true, data: announcement }
    } catch (error) {
        return { success: false, error: "Failed to fetch announcement" }
    }
}

export async function toggleAnnouncementStatus(id: string, isActive: boolean) {
    try {
        await prisma.announcement.update({
            where: { id },
            data: { isActive }
        })
        revalidatePath('/admin/announcements')
        revalidatePath('/portal')
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to update status" }
    }
}

export async function deleteAnnouncement(id: string) {
    try {
        await prisma.announcement.delete({
            where: { id }
        })
        revalidatePath('/admin/announcements')
        revalidatePath('/portal')
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to delete announcement" }
    }
}
