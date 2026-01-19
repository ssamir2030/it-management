'use server'

import { revalidatePath } from "next/cache"
import prisma from '@/lib/prisma'
import fs from 'fs'
import path from 'path'

// Export all data as JSON
export async function exportDatabaseBackup() {
    try {
        const [
            assets,
            employees,
            departments,
            locations,
            tickets,
            requests,
            suppliers,
            inventoryItems,
            purchaseOrders,
            softwareLicenses,
            subscriptions,
            consumables,
            announcements,
            meetingRooms,
            courses,
            articles
        ] = await Promise.all([
            prisma.asset.findMany({ where: { deletedAt: null } }),
            prisma.employee.findMany({ where: { deletedAt: null } }),
            prisma.department.findMany({ where: { deletedAt: null } }),
            prisma.location.findMany({ where: { deletedAt: null } }),
            prisma.ticket.findMany(),
            prisma.employeeRequest.findMany(),
            prisma.supplier.findMany(),
            prisma.inventoryItem.findMany(),
            prisma.purchaseOrder.findMany({ include: { items: true } }),
            prisma.softwareLicense.findMany(),
            prisma.subscription.findMany(),
            prisma.consumable.findMany(),
            prisma.announcement.findMany(),
            prisma.meetingRoom.findMany(),
            prisma.course.findMany(),
            prisma.article.findMany()
        ])

        const backup = {
            version: '1.0',
            createdAt: new Date().toISOString(),
            data: {
                assets,
                employees,
                departments,
                locations,
                tickets,
                requests,
                suppliers,
                inventoryItems,
                purchaseOrders,
                softwareLicenses,
                subscriptions,
                consumables,
                announcements,
                meetingRooms,
                courses,
                articles
            },
            stats: {
                assets: assets.length,
                employees: employees.length,
                departments: departments.length,
                locations: locations.length,
                tickets: tickets.length,
                requests: requests.length,
                suppliers: suppliers.length,
                inventoryItems: inventoryItems.length,
                purchaseOrders: purchaseOrders.length,
                softwareLicenses: softwareLicenses.length,
                subscriptions: subscriptions.length,
                consumables: consumables.length,
                announcements: announcements.length,
                meetingRooms: meetingRooms.length,
                courses: courses.length,
                articles: articles.length
            }
        }

        return {
            success: true,
            data: backup,
            message: `تم تصدير ${Object.values(backup.stats).reduce((a, b) => a + b, 0)} سجل بنجاح`
        }
    } catch (error) {
        console.error('Error exporting backup:', error)
        return { success: false, error: 'فشل في تصدير النسخة الاحتياطية' }
    }
}

// Export specific table as CSV
export async function exportTableAsCSV(tableName: string) {
    try {
        let data: any[] = []

        switch (tableName) {
            case 'assets':
                data = await prisma.asset.findMany({ where: { deletedAt: null } })
                break
            case 'employees':
                data = await prisma.employee.findMany({
                    where: { deletedAt: null },
                    include: { department: { select: { name: true } }, location: { select: { name: true } } }
                })
                break
            case 'departments':
                data = await prisma.department.findMany({ where: { deletedAt: null } })
                break
            case 'locations':
                data = await prisma.location.findMany({ where: { deletedAt: null } })
                break
            case 'tickets':
                data = await prisma.ticket.findMany()
                break
            case 'suppliers':
                data = await prisma.supplier.findMany()
                break
            case 'inventory':
                data = await prisma.inventoryItem.findMany()
                break
            case 'licenses':
                data = await prisma.softwareLicense.findMany()
                break
            default:
                return { success: false, error: 'جدول غير معروف' }
        }

        if (data.length === 0) {
            return { success: false, error: 'لا توجد بيانات للتصدير' }
        }

        // Convert to CSV
        const headers = Object.keys(data[0])
        const csvRows = [headers.join(',')]

        data.forEach(row => {
            const values = headers.map(header => {
                const val = row[header]
                if (val === null || val === undefined) return ''
                if (typeof val === 'object') return JSON.stringify(val).replace(/"/g, '""')
                return String(val).replace(/"/g, '""')
            })
            csvRows.push(values.map(v => `"${v}"`).join(','))
        })

        return {
            success: true,
            data: csvRows.join('\n'),
            filename: `${tableName}_${new Date().toISOString().split('T')[0]}.csv`,
            count: data.length
        }
    } catch (error) {
        console.error('Error exporting CSV:', error)
        return { success: false, error: 'فشل في تصدير الملف' }
    }
}

// Get backup statistics
export async function getBackupStats() {
    try {
        const [
            assets,
            employees,
            departments,
            locations,
            tickets,
            requests,
            suppliers,
            inventory,
            licenses
        ] = await Promise.all([
            prisma.asset.count({ where: { deletedAt: null } }),
            prisma.employee.count({ where: { deletedAt: null } }),
            prisma.department.count({ where: { deletedAt: null } }),
            prisma.location.count({ where: { deletedAt: null } }),
            prisma.ticket.count(),
            prisma.employeeRequest.count(),
            prisma.supplier.count(),
            prisma.inventoryItem.count(),
            prisma.softwareLicense.count()
        ])

        return {
            success: true,
            data: {
                assets,
                employees,
                departments,
                locations,
                tickets,
                requests,
                suppliers,
                inventory,
                licenses,
                total: assets + employees + departments + locations + tickets + requests + suppliers + inventory + licenses
            }
        }
    } catch (error) {
        console.error('Error getting backup stats:', error)
        return { success: false, error: 'فشل في جلب الإحصائيات' }
    }
}

export async function restoreBackup(formData: FormData) {
    try {
        const file = formData.get('backupFile') as File

        if (!file) {
            return { success: false, error: "No file provided" }
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')

        // Create a backup of the current db before overwriting
        if (fs.existsSync(dbPath)) {
            fs.copyFileSync(dbPath, `${dbPath}.old`)
        }

        fs.writeFileSync(dbPath, buffer)

        revalidatePath('/')
        return { success: true, message: "Database restored successfully" }
    } catch (error) {
        console.error(error)
        return { success: false, error: "Failed to restore database" }
    }
}

