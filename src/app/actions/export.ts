'use server'

import prisma from '@/lib/prisma'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

// Export assets to structured data
export async function getAssetsForExport() {
    try {
        const assets = await prisma.asset.findMany({
            where: { deletedAt: null },
            include: {
                employee: {
                    select: {
                        name: true,
                        email: true,
                        identityNumber: true
                    }
                },
                location: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        const data = assets.map(asset => ({
            'رقم الأصل': asset.tag,
            'الاسم': asset.name,
            'النوع': asset.type,
            'الموديل': asset.model || '-',
            'الشركة المصنعة': asset.manufacturer || '-',
            'الرقم التسلسلي': asset.serialNumber || '-',
            'الحالة': asset.status,
            'الموظف المعين': asset.employee?.name || 'غير معين',
            'رقم هوية الموظف': asset.employee?.identityNumber || '-',
            'الموقع': asset.location?.name || '-',
            'تاريخ الشراء': asset.purchaseDate
                ? format(new Date(asset.purchaseDate), 'dd/MM/yyyy', { locale: ar })
                : '-',
            'تاريخ انتهاء الضمان': asset.warrantyExpiry
                ? format(new Date(asset.warrantyExpiry), 'dd/MM/yyyy', { locale: ar })
                : '-',
            'تاريخ الإضافة': format(new Date(asset.createdAt), 'dd/MM/yyyy', { locale: ar })
        }))

        return { success: true, data }
    } catch (error) {
        console.error('Error exporting assets:', error)
        return { success: false, error: 'Failed to export assets' }
    }
}

// Export employees to structured data
export async function getEmployeesForExport() {
    try {
        const employees = await prisma.employee.findMany({
            where: { deletedAt: null },
            include: {
                department: {
                    select: {
                        name: true
                    }
                },
                location: {
                    select: {
                        name: true
                    }
                },
                _count: {
                    select: {
                        assets: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        const data = employees.map(emp => ({
            'الاسم': emp.name,
            'رقم الهوية': emp.identityNumber,
            'البريد الإلكتروني': emp.email,
            'رقم الهاتف': emp.phone || '-',
            'المسمى الوظيفي': emp.jobTitle || '-',
            'القسم': emp.department?.name || '-',
            'الموقع': emp.location?.name || '-',
            'عدد الأصول': emp._count.assets,
            'تاريخ التعيين': format(new Date(emp.createdAt), 'dd/MM/yyyy', { locale: ar })
        }))

        return { success: true, data }
    } catch (error) {
        console.error('Error exporting employees:', error)
        return { success: false, error: 'Failed to export employees' }
    }
}

// Export tickets to structured data
export async function getTicketsForExport() {
    try {
        const tickets = await prisma.ticket.findMany({
            include: {
                createdBy: {
                    select: {
                        name: true,
                        email: true
                    }
                },
                assignedTo: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        const data = tickets.map(ticket => ({
            'العنوان': ticket.title,
            'الوصف': ticket.description.substring(0, 100),
            'الفئة': ticket.category,
            'الأولوية': ticket.priority,
            'الحالة': ticket.status,
            'المُنشئ': ticket.createdBy?.name || '-',
            'المُعين': ticket.assignedTo?.name || 'غير معين',
            'رقم الهاتف': ticket.contactPhone || '-',
            'تاريخ الإنشاء': format(new Date(ticket.createdAt), 'dd/MM/yyyy HH:mm', { locale: ar }),
            'آخر تحديث': format(new Date(ticket.updatedAt), 'dd/MM/yyyy HH:mm', { locale: ar })
        }))

        return { success: true, data }
    } catch (error) {
        console.error('Error exporting tickets:', error)
        return { success: false, error: 'Failed to export tickets' }
    }
}

// Get audit logs for export
export async function getAuditLogsForExport(limit = 500) {
    try {
        const logs = await prisma.auditLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: limit
        })

        const data = logs.map(log => ({
            'المستخدم': log.userName,
            'الإجراء': log.action,
            'نوع الكيان': log.entityType,
            'اسم الكيان': log.entityName || '-',
            'التغييرات': log.changes || '-',
            'عنوان IP': log.ipAddress || '-',
            'التاريخ': format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm:ss', { locale: ar })
        }))

        return { success: true, data }
    } catch (error) {
        console.error('Error exporting audit logs:', error)
        return { success: false, error: 'Failed to export audit logs' }
    }
}
