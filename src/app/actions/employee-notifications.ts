'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'employee_portal_session'

// إنشاء إشعار لموظف
export async function createEmployeeNotification(data: {
    employeeId: string
    type: string
    title: string
    message: string
    actionUrl?: string
    priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
    data?: any
}) {
    try {
        const notification = await prisma.employeeNotification.create({
            data: {
                employeeId: data.employeeId,
                type: data.type,
                title: data.title,
                message: data.message,
                actionUrl: data.actionUrl,
                priority: data.priority || 'NORMAL',
                data: data.data ? JSON.stringify(data.data) : null
            }
        })

        revalidatePath('/portal/notifications')
        return { success: true, data: notification }
    } catch (error) {
        console.error('Error creating employee notification:', error)
        return { success: false, error: 'فشل في إنشاء الإشعار' }
    }
}

// الحصول على إشعارات الموظف
export async function getMyEmployeeNotifications(limit = 50) {
    const employeeId = cookies().get(COOKIE_NAME)?.value

    if (!employeeId) {
        return { success: false, error: 'غير مصرح لك' }
    }

    try {
        const notifications = await prisma.employeeNotification.findMany({
            where: {
                employeeId
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: limit
        })

        return { success: true, data: notifications }
    } catch (error) {
        console.error('Error fetching employee notifications:', error)
        return { success: false, error: 'فشل في جلب الإشعارات' }
    }
}

// عدد الإشعارات غير المقروءة
export async function getUnreadEmployeeNotificationsCount() {
    const employeeId = cookies().get(COOKIE_NAME)?.value

    if (!employeeId) {
        return { success: false, error: 'غير مصرح لك', count: 0 }
    }

    try {
        const count = await prisma.employeeNotification.count({
            where: {
                employeeId,
                isRead: false
            }
        })

        return { success: true, count }
    } catch (error) {
        console.error('Error counting unread employee notifications:', error)
        return { success: false, error: 'فشل في حساب الإشعارات', count: 0 }
    }
}

// تحديد إشعار كمقروء
export async function markEmployeeNotificationAsRead(notificationId: string) {
    const employeeId = cookies().get(COOKIE_NAME)?.value

    if (!employeeId) {
        return { success: false, error: 'غير مصرح لك' }
    }

    try {
        const notification = await prisma.employeeNotification.findUnique({
            where: { id: notificationId }
        })

        if (!notification) {
            return { success: false, error: 'الإشعار غير موجود' }
        }

        if (notification.employeeId !== employeeId) {
            return { success: false, error: 'غير مصرح لك' }
        }

        await prisma.employeeNotification.update({
            where: { id: notificationId },
            data: {
                isRead: true,
                readAt: new Date()
            }
        })

        revalidatePath('/portal/notifications')
        return { success: true }
    } catch (error) {
        console.error('Error marking employee notification as read:', error)
        return { success: false, error: 'فشل في تحديث الإشعار' }
    }
}

// تحديد جميع الإشعارات كمقروءة
export async function markAllEmployeeNotificationsAsRead() {
    const employeeId = cookies().get(COOKIE_NAME)?.value

    if (!employeeId) {
        return { success: false, error: 'غير مصرح لك' }
    }

    try {
        await prisma.employeeNotification.updateMany({
            where: {
                employeeId,
                isRead: false
            },
            data: {
                isRead: true,
                readAt: new Date()
            }
        })

        revalidatePath('/portal/notifications')
        return { success: true }
    } catch (error) {
        console.error('Error marking all employee notifications as read:', error)
        return { success: false, error: 'فشل في تحديث الإشعارات' }
    }
}

// حذف إشعار
export async function deleteEmployeeNotification(notificationId: string) {
    const employeeId = cookies().get(COOKIE_NAME)?.value

    if (!employeeId) {
        return { success: false, error: 'غير مصرح لك' }
    }

    try {
        const notification = await prisma.employeeNotification.findUnique({
            where: { id: notificationId }
        })

        if (!notification) {
            return { success: false, error: 'الإشعار غير موجود' }
        }

        if (notification.employeeId !== employeeId) {
            return { success: false, error: 'غير مصرح لك' }
        }

        await prisma.employeeNotification.delete({
            where: { id: notificationId }
        })

        revalidatePath('/portal/notifications')
        return { success: true }
    } catch (error) {
        console.error('Error deleting employee notification:', error)
        return { success: false, error: 'فشل في حذف الإشعار' }
    }
}

// حذف جميع الإشعارات المقروءة
export async function deleteReadEmployeeNotifications() {
    const employeeId = cookies().get(COOKIE_NAME)?.value

    if (!employeeId) {
        return { success: false, error: 'غير مصرح لك' }
    }

    try {
        await prisma.employeeNotification.deleteMany({
            where: {
                employeeId,
                isRead: true
            }
        })

        revalidatePath('/portal/notifications')
        return { success: true }
    } catch (error) {
        console.error('Error deleting read employee notifications:', error)
        return { success: false, error: 'فشل في حذف الإشعارات' }
    }
}

// Helper function لإنشاء إشعار عند تحديث حالة الطلب
export async function notifyRequestStatusChange(employeeId: string, requestType: string, status: string, requestId?: string) {
    let title = ''
    let message = ''
    let type = 'REQUEST_UPDATE'

    const typeNames: Record<string, string> = {
        'HARDWARE': 'قطع الهاردوير',
        'INK': 'أحبار الطابعات',
        'PAPER': 'أوراق الطباعة',
        'MAINTENANCE': 'الصيانة',
        'SUPPORT': 'الدعم الفني',
        'SOFTWARE': 'البرمجيات',
        'ACCESS': 'الصلاحيات',
        'RETURN': 'إرجاع العهدة'
    }

    const requestTypeName = typeNames[requestType] || 'الطلب'

    if (status === 'IN_PROGRESS') {
        title = 'جاري تنفيذ الطلب'
        message = `طلب ${requestTypeName} قيد التنفيذ الآن`
    } else if (status === 'COMPLETED') {
        title = 'تم إنجاز الطلب'
        message = `تم إنجاز طلب ${requestTypeName} بنجاح`
    } else if (status === 'REJECTED') {
        title = 'تم رفض الطلب'
        message = `تم رفض طلب ${requestTypeName}`
    }

    if (title) {
        // 1. Create In-App Notification
        await createEmployeeNotification({
            employeeId,
            type,
            title,
            message,
            actionUrl: requestId ? `/portal/requests/${requestId}` : '/portal/dashboard?tab=history',
            priority: status === 'REJECTED' ? 'HIGH' : 'NORMAL'
        })

        // 2. Send Email Notification
        try {
            const employee = await prisma.employee.findUnique({
                where: { id: employeeId },
                select: { email: true, name: true }
            })

            if (employee?.email) {
                const { sendMail } = await import('@/lib/mail')
                const { getStatusUpdateTemplate } = await import('@/lib/email-templates')

                const emailHtml = getStatusUpdateTemplate(
                    employee.name,
                    requestTypeName,
                    status,
                    requestId || 'N/A'
                )

                await sendMail({
                    to: employee.email,
                    subject: `تحديث بخصوص طلبك: ${title}`,
                    html: emailHtml
                })
            }
        } catch (error) {
            console.error('Failed to send email notification:', error)
            // We don't throw here to avoid breaking the main flow if email fails
        }
    }
}

// Helper function لإنشاء إشعار عند تأكيد حجز قاعة
export async function notifyBookingConfirmed(employeeId: string, roomName: string, startTime: Date) {
    const formattedDate = new Date(startTime).toLocaleDateString('ar-EG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
    const formattedTime = new Date(startTime).toLocaleTimeString('ar-EG', {
        hour: '2-digit',
        minute: '2-digit'
    })

    await createEmployeeNotification({
        employeeId,
        type: 'BOOKING_CONFIRMED',
        title: 'تم تأكيد حجز القاعة',
        message: `تم تأكيد حجز ${roomName} في ${formattedDate} الساعة ${formattedTime}`,
        actionUrl: '/portal/bookings/my',
        priority: 'NORMAL'
    })
}

// Helper function لإنشاء تذكير بموعد الاجتماع
export async function notifyMeetingReminder(employeeId: string, roomName: string, startTime: Date, bookingId: string) {
    const formattedTime = new Date(startTime).toLocaleTimeString('ar-EG', {
        hour: '2-digit',
        minute: '2-digit'
    })

    await createEmployeeNotification({
        employeeId,
        type: 'REMINDER',
        title: 'تذكير باجتماع قادم',
        message: `لديك اجتماع في ${roomName} يبدأ الساعة ${formattedTime}`,
        actionUrl: `/portal/bookings/my`,
        priority: 'HIGH',
        data: { bookingId }
    })
}

// Helper function لإنشاء إشعار عند إضافة تفاصيل الاجتماع الأونلاين
export async function notifyOnlineMeetingDetailsAdded(employeeId: string, bookingTitle: string, bookingId: string) {
    await createEmployeeNotification({
        employeeId,
        type: 'MEETING_DETAILS',
        title: 'تم إضافة تفاصيل الاجتماع الأونلاين',
        message: `تم إضافة رابط الاجتماع وتفاصيل الدخول لحجزك: ${bookingTitle}`,
        actionUrl: `/portal/bookings/my`,
        priority: 'HIGH',
        data: { bookingId }
    })
}

// Helper function لإشعار المسؤولين بطلب جديد
export async function notifyNewRequest(employeeId: string, requestType: string, requestId: string) {
    try {
        // 1. Fetch Employee Details
        const employee = await prisma.employee.findUnique({
            where: { id: employeeId },
            select: { name: true }
        })

        if (!employee) return

        // 2. Fetch Admins Emails
        const admins = await prisma.user.findMany({
            where: { role: 'ADMIN' },
            select: { email: true, name: true }
        })

        if (admins.length === 0) return

        const { sendMail } = await import('@/lib/mail')
        const { getNewRequestTemplate } = await import('@/lib/email-templates')

        const typeNames: Record<string, string> = {
            'HARDWARE': 'قطع الهاردوير',
            'INK': 'أحبار الطابعات',
            'PAPER': 'أوراق الطباعة',
            'MAINTENANCE': 'الصيانة',
            'SUPPORT': 'الدعم الفني',
            'SOFTWARE': 'البرمجيات',
            'ACCESS': 'الصلاحيات',
            'RETURN': 'إرجاع العهدة'
        }

        const requestTypeName = typeNames[requestType] || requestType

        // 3. Send Email to Each Admin
        // In a real app, you might want to send to a shared inbox or queue this
        for (const admin of admins) {
            if (admin.email) {
                const emailHtml = getNewRequestTemplate(
                    admin.name || 'المسؤول',
                    employee.name,
                    requestTypeName,
                    requestId
                )

                await sendMail({
                    to: admin.email,
                    subject: `طلب جديد من ${employee.name}: ${requestTypeName}`,
                    html: emailHtml
                })
            }
        }

    } catch (error) {
        console.error('Failed to notify admins of new request:', error)
    }
}
