'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// الحصول على إعدادات التنبيهات
export async function getAlertSettings() {
    try {
        let settings = await prisma.alertSettings.findFirst()

        if (!settings) {
            settings = await prisma.alertSettings.create({
                data: {
                    warrantyAlertDays: 30,
                    licenseAlertDays: 30,
                    maintenanceAlertDays: 7,
                    emailNotifications: true,
                    dashboardNotifications: true
                }
            })
        }

        return { success: true, data: settings }
    } catch (error) {
        console.error('Error getting alert settings:', error)
        return { success: false, error: 'فشل في جلب الإعدادات' }
    }
}

// تحديث إعدادات التنبيهات
export async function updateAlertSettings(data: {
    warrantyAlertDays?: number
    licenseAlertDays?: number
    maintenanceAlertDays?: number
    emailNotifications?: boolean
    dashboardNotifications?: boolean
    notificationEmail?: string
}) {
    try {
        const existing = await prisma.alertSettings.findFirst()

        if (existing) {
            await prisma.alertSettings.update({
                where: { id: existing.id },
                data
            })
        } else {
            await prisma.alertSettings.create({ data })
        }

        revalidatePath('/settings/alerts')
        return { success: true, message: 'تم حفظ الإعدادات' }
    } catch (error) {
        console.error('Error updating alert settings:', error)
        return { success: false, error: 'فشل في حفظ الإعدادات' }
    }
}

// الحصول على التنبيهات النشطة
export async function getActiveAlerts() {
    try {
        const alerts = await prisma.systemAlert.findMany({
            where: {
                isDismissed: false
            },
            orderBy: [
                { severity: 'desc' },
                { daysLeft: 'asc' }
            ]
        })

        return { success: true, data: alerts }
    } catch (error) {
        console.error('Error getting alerts:', error)
        return { success: false, error: 'فشل في جلب التنبيهات' }
    }
}

// الحصول على عدد التنبيهات غير المقروءة
export async function getUnreadAlertsCount() {
    try {
        const count = await prisma.systemAlert.count({
            where: {
                isRead: false,
                isDismissed: false
            }
        })

        return { success: true, count }
    } catch (error) {
        return { success: false, count: 0 }
    }
}

// تحديث حالة القراءة
export async function markAlertAsRead(alertId: string) {
    try {
        await prisma.systemAlert.update({
            where: { id: alertId },
            data: { isRead: true }
        })

        revalidatePath('/admin/alerts')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'فشل في تحديث التنبيه' }
    }
}

// تجاهل التنبيه
export async function dismissAlert(alertId: string) {
    try {
        await prisma.systemAlert.update({
            where: { id: alertId },
            data: { isDismissed: true }
        })

        revalidatePath('/admin/alerts')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'فشل في تجاهل التنبيه' }
    }
}

// تحديث كل التنبيهات كمقروءة
export async function markAllAlertsAsRead() {
    try {
        await prisma.systemAlert.updateMany({
            where: { isRead: false },
            data: { isRead: true }
        })

        revalidatePath('/admin/alerts')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'فشل في تحديث التنبيهات' }
    }
}

// فحص وإنشاء التنبيهات (يُستدعى من Cron أو يدوياً)
export async function refreshAlerts() {
    try {
        const settings = await prisma.alertSettings.findFirst()
        const warrantyDays = settings?.warrantyAlertDays || 30
        const licenseDays = settings?.licenseAlertDays || 30

        const today = new Date()
        const warrantyThreshold = new Date(today.getTime() + warrantyDays * 24 * 60 * 60 * 1000)
        const licenseThreshold = new Date(today.getTime() + licenseDays * 24 * 60 * 60 * 1000)

        // حذف التنبيهات القديمة المتجاهلة أو المنتهية
        await prisma.systemAlert.deleteMany({
            where: {
                OR: [
                    { isDismissed: true, createdAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
                    { expiryDate: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }
                ]
            }
        })

        // فحص ضمان الأصول
        const assetsExpiring = await prisma.asset.findMany({
            where: {
                warrantyExpiry: {
                    lte: warrantyThreshold,
                    gte: today
                },
                deletedAt: null
            },
            select: {
                id: true,
                name: true,
                tag: true,
                warrantyExpiry: true
            }
        })

        for (const asset of assetsExpiring) {
            const daysLeft = Math.ceil((asset.warrantyExpiry!.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
            const severity = daysLeft <= 7 ? 'CRITICAL' : daysLeft <= 14 ? 'WARNING' : 'INFO'

            // تحقق من عدم وجود تنبيه مسبق
            const existing = await prisma.systemAlert.findFirst({
                where: {
                    entityType: 'ASSET',
                    entityId: asset.id,
                    type: 'WARRANTY',
                    isDismissed: false
                }
            })

            if (!existing) {
                await prisma.systemAlert.create({
                    data: {
                        type: 'WARRANTY',
                        title: `انتهاء ضمان: ${asset.name}`,
                        message: `ينتهي ضمان الجهاز (${asset.tag}) خلال ${daysLeft} يوم`,
                        severity,
                        entityType: 'ASSET',
                        entityId: asset.id,
                        entityName: asset.name,
                        expiryDate: asset.warrantyExpiry!,
                        daysLeft
                    }
                })
            } else {
                // تحديث الأيام المتبقية
                await prisma.systemAlert.update({
                    where: { id: existing.id },
                    data: { daysLeft, severity }
                })
            }
        }

        // فحص تراخيص البرامج
        const licensesExpiring = await prisma.softwareLicense.findMany({
            where: {
                expiryDate: {
                    lte: licenseThreshold,
                    gte: today
                }
            },
            select: {
                id: true,
                name: true,
                expiryDate: true
            }
        })

        for (const license of licensesExpiring) {
            const daysLeft = Math.ceil((license.expiryDate!.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
            const severity = daysLeft <= 7 ? 'CRITICAL' : daysLeft <= 14 ? 'WARNING' : 'INFO'

            const existing = await prisma.systemAlert.findFirst({
                where: {
                    entityType: 'LICENSE',
                    entityId: license.id,
                    type: 'LICENSE',
                    isDismissed: false
                }
            })

            if (!existing) {
                await prisma.systemAlert.create({
                    data: {
                        type: 'LICENSE',
                        title: `انتهاء ترخيص: ${license.name}`,
                        message: `ينتهي ترخيص البرنامج خلال ${daysLeft} يوم`,
                        severity,
                        entityType: 'LICENSE',
                        entityId: license.id,
                        entityName: license.name,
                        expiryDate: license.expiryDate!,
                        daysLeft
                    }
                })
            } else {
                await prisma.systemAlert.update({
                    where: { id: existing.id },
                    data: { daysLeft, severity }
                })
            }
        }

        revalidatePath('/admin/alerts')
        revalidatePath('/dashboard')

        return {
            success: true,
            message: `تم فحص ${assetsExpiring.length} أصول و ${licensesExpiring.length} تراخيص`
        }
    } catch (error) {
        console.error('Error refreshing alerts:', error)
        return { success: false, error: 'فشل في تحديث التنبيهات' }
    }
}

// الحصول على ملخص التنبيهات
export async function getAlertsSummary() {
    try {
        const [total, unread, critical, warning] = await Promise.all([
            prisma.systemAlert.count({ where: { isDismissed: false } }),
            prisma.systemAlert.count({ where: { isRead: false, isDismissed: false } }),
            prisma.systemAlert.count({ where: { severity: 'CRITICAL', isDismissed: false } }),
            prisma.systemAlert.count({ where: { severity: 'WARNING', isDismissed: false } })
        ])

        return {
            success: true,
            data: { total, unread, critical, warning }
        }
    } catch (error) {
        return { success: false, data: { total: 0, unread: 0, critical: 0, warning: 0 } }
    }
}
