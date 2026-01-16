'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/simple-auth'

export async function getMyNotifications(limit = 50) {
    const session = await getSession()

    if (!session || !session.id) {
        return { success: false, error: 'غير مصرح لك' }
    }

    try {
        const notifications = await prisma.notification.findMany({
            where: {
                userId: session.id
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: limit
        })

        return { success: true, data: notifications }
    } catch (error) {
        console.error('Error fetching notifications:', error)
        return { success: false, error: 'فشل في جلب الإشعارات' }
    }
}

export async function getUnreadNotificationsCount() {
    const session = await getSession()

    if (!session || !session.id) {
        return { success: false, error: 'غير مصرح لك', count: 0 }
    }

    try {
        const count = await prisma.notification.count({
            where: {
                userId: session.id,
                read: false
            }
        })

        return { success: true, count }
    } catch (error) {
        console.error('Error counting notifications:', error)
        return { success: false, error: 'فشل في حساب الإشعارات', count: 0 }
    }
}

export async function markNotificationAsRead(notificationId: string) {
    const session = await getSession()

    if (!session || !session.id) {
        return { success: false, error: 'غير مصرح لك' }
    }

    try {
        await prisma.notification.update({
            where: { id: notificationId },
            data: { read: true }
        })

        revalidatePath('/admin/notifications')
        return { success: true }
    } catch (error) {
        console.error('Error marking notification as read:', error)
        return { success: false, error: 'فشل في تحديث الإشعار' }
    }
}

export async function markAllNotificationsAsRead() {
    const session = await getSession()

    if (!session || !session.id) {
        return { success: false, error: 'غير مصرح لك' }
    }

    try {
        await prisma.notification.updateMany({
            where: {
                userId: session.id,
                read: false
            },
            data: {
                read: true
            }
        })

        revalidatePath('/admin/notifications')
        return { success: true }
    } catch (error) {
        console.error('Error marking all notifications as read:', error)
        return { success: false, error: 'فشل في تحديث الإشعارات' }
    }
}

export async function createNotification(data: {
    userId: string
    type: string
    title: string
    message: string
    entityType?: string
    entityId?: string
}) {
    try {
        await prisma.notification.create({
            data: {
                userId: data.userId,
                type: data.type,
                title: data.title,
                message: data.message,
                entityType: data.entityType,
                entityId: data.entityId,
                read: false
            }
        })

        revalidatePath('/admin/notifications')
        return { success: true }
    } catch (error) {
        console.error('Error creating notification:', error)
        return { success: false, error: 'فشل في إنشاء الإشعار' }
    }
}

export async function deleteNotification(notificationId: string) {
    const session = await getSession()

    if (!session || !session.id) {
        return { success: false, error: 'غير مصرح لك' }
    }

    try {
        await prisma.notification.delete({
            where: { id: notificationId }
        })

        revalidatePath('/admin/notifications')
        return { success: true }
    } catch (error) {
        console.error('Error deleting notification:', error)
        return { success: false, error: 'فشل في حذف الإشعار' }
    }
}
