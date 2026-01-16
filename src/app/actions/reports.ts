'use server'

import prisma from "@/lib/prisma"
import { calculateStraightLineDepreciation } from "@/lib/depreciation"

export type ReportType = 'INVENTORY' | 'FINANCIAL' | 'MAINTENANCE' | 'EMPLOYEES' | 'TICKETS' | 'PURCHASING' | 'CONSUMABLES' | 'CONSUMABLE_USAGE' | 'LICENSES' | 'CUSTODY_HISTORY' | 'OPERATIONAL_PLAN' | 'SLA_BREACHES' | 'EMPLOYEE_ONBOARDING' | 'VENDOR_PERFORMANCE' | 'LOW_STOCK' | 'VISITS' | 'EQUIPMENT_BOOKINGS' | 'ASSET_AUDITS' | 'TRAINING'

export async function generateReportData(type: ReportType, filters: any = {}) {
    try {
        let data: any[] = []
        let columns: { key: string, label: string }[] = []

        if (type === 'INVENTORY') {
            // ... (Existing Inventory Logic)
            const assets = await prisma.asset.findMany({
                where: {
                    status: filters.status !== 'ALL' ? filters.status : undefined,
                },
                include: { location: true, employee: true, category: true }
            })

            columns = [
                { key: 'tag', label: 'رقم الأصل' },
                { key: 'name', label: 'الاسم' },
                { key: 'type', label: 'النوع' },
                { key: 'status', label: 'الحالة' },
                { key: 'employeeName', label: 'المسؤول' },
                { key: 'locationName', label: 'الموقع' },
            ]

            data = assets.map(a => ({
                tag: a.tag,
                name: a.name,
                type: a.type,
                status: a.status,
                employeeName: a.employee?.name || '-',
                locationName: a.location?.name || '-'
            }))

        } else if (type === 'OPERATIONAL_PLAN') {
            const activities = await prisma.operationalActivity.findMany({
                orderBy: { createdAt: 'desc' }
            })

            columns = [
                { key: 'code', label: 'رمز المشروع' },
                { key: 'name', label: 'اسم المشروع' },
                { key: 'budget', label: 'الميزانية' },
                { key: 'spent', label: 'المصروف' },
                { key: 'remaining', label: 'المتبقي' },
                { key: 'completion', label: 'الإنجاز' },
                { key: 'priority', label: 'الأولوية' },
                { key: 'status', label: 'الحالة' }
            ]

            data = activities.map(a => ({
                code: a.code || '-',
                name: a.name,
                budget: (a.budget || 0).toFixed(2),
                spent: (a.spent || 0).toFixed(2),
                remaining: ((a.budget || 0) - (a.spent || 0)).toFixed(2),
                completion: `${a.completionPercentage || 0}%`,
                priority: a.priority,
                status: a.status
            }))

        } else if (type === 'FINANCIAL') {
            const assets = await prisma.asset.findMany({
                where: {
                    price: { gt: 0 }
                }
            })

            columns = [
                { key: 'tag', label: 'رقم الأصل' },
                { key: 'name', label: 'الاسم' },
                { key: 'purchasePrice', label: 'سعر الشراء' },
                { key: 'currentValue', label: 'القيمة الحالية' },
                { key: 'depreciation', label: 'الإهلاك' },
                { key: 'purchaseDate', label: 'تاريخ الشراء' },
            ]

            data = assets.map(a => {
                const fin = calculateStraightLineDepreciation(a.price || 0, a.salvageValue || 0, a.lifespan || 36, a.purchaseDate)
                return {
                    tag: a.tag,
                    name: a.name,
                    purchasePrice: fin.initialPrice.toFixed(2),
                    currentValue: fin.currentValue.toFixed(2),
                    depreciation: (fin.initialPrice - fin.currentValue).toFixed(2),
                    purchaseDate: a.purchaseDate ? a.purchaseDate.toISOString().split('T')[0] : '-'
                }
            })
        } else if (type === 'MAINTENANCE') {
            // ... (Existing Maintenance Logic)
            const tickets = await prisma.ticket.findMany({
                where: {
                    category: 'MAINTENANCE'
                },
                include: { createdBy: true, assignedTo: true }
            })

            columns = [
                { key: 'id', label: 'المعرف' },
                { key: 'title', label: 'العنوان' },
                { key: 'status', label: 'الحالة' },
                { key: 'priority', label: 'الأولوية' },
                { key: 'createdAt', label: 'تاريخ الإنشاء' }
            ]

            data = tickets.map(t => ({
                id: t.id,
                title: t.title,
                status: t.status,
                priority: t.priority,
                createdAt: t.createdAt.toISOString().split('T')[0]
            }))
        } else if (type === 'EMPLOYEES') {
            // ... (Existing Employees Logic)
            const employees = await prisma.employee.findMany({
                include: { department: true, location: true }
            })

            columns = [
                { key: 'name', label: 'الاسم' },
                { key: 'email', label: 'البريد' },
                { key: 'jobTitle', label: 'المسمى الوظيفي' },
                { key: 'department', label: 'القسم' },
                { key: 'location', label: 'الموقع' }
            ]

            data = employees.map(e => ({
                name: e.name,
                email: e.email,
                jobTitle: e.jobTitle,
                department: e.department?.name || '-',
                location: e.location?.name || '-'
            }))
        } else if (type === 'TICKETS') {
            // ... (Existing Tickets Logic)
            const tickets = await prisma.ticket.findMany({
                include: { createdBy: true, assignedTo: true }
            })

            columns = [
                { key: 'id', label: 'رقم التذكرة' },
                { key: 'title', label: 'العنوان' },
                { key: 'status', label: 'الحالة' },
                { key: 'priority', label: 'الأولوية' },
                { key: 'category', label: 'التصنيف' },
                { key: 'createdByName', label: 'مقدم الطلب' },
                { key: 'assignedToName', label: 'المسند إليه' },
                { key: 'createdAt', label: 'تاريخ الإنشاء' }
            ]

            data = tickets.map(t => ({
                id: t.id,
                title: t.title,
                status: t.status,
                priority: t.priority,
                category: t.category,
                createdByName: t.createdBy?.name || 'النظام',
                assignedToName: t.assignedTo?.name || '-',
                createdAt: t.createdAt.toISOString().split('T')[0]
            }))
        } else if (type === 'PURCHASING') {
            // ... (Existing Purchasing Logic)
            const orders = await prisma.purchaseOrder.findMany({
                include: { supplier: true }
            })

            columns = [
                { key: 'id', label: 'رقم الطلب' },
                { key: 'supplierName', label: 'المورد' },
                { key: 'status', label: 'الحالة' },
                { key: 'totalCost', label: 'التكلفة الإجمالية' },
                { key: 'currency', label: 'العملة' },
                { key: 'orderDate', label: 'تاريخ الطلب' },
                { key: 'expectedDate', label: 'التاريخ المتوقع' }
            ]

            data = orders.map(o => ({
                id: o.id,
                supplierName: o.supplier?.name || '-',
                status: o.status,
                totalCost: o.totalCost.toFixed(2),
                currency: o.currency,
                orderDate: o.orderDate.toISOString().split('T')[0],
                expectedDate: o.expectedDate ? o.expectedDate.toISOString().split('T')[0] : '-'
            }))
        } else if (type === 'CONSUMABLES') {
            // ... (Existing Consumables Logic)
            const items = await prisma.consumable.findMany({ include: { category: true } })

            columns = [
                { key: 'name', label: 'اسم الصنف' },
                { key: 'category', label: 'التصنيف' },
                { key: 'currentStock', label: 'المخزون الحالي' },
                { key: 'minStock', label: 'الحد الأدنى' },
                // { key: 'unit', label: 'الوحدة' }, // Unit removed
                { key: 'status', label: 'حالة المخزون' }
            ]

            data = items.map(i => ({
                name: i.name,
                category: i.category?.name || '-',
                currentStock: i.quantity,
                minStock: i.minQuantity,
                // unit: '-',
                status: i.quantity <= i.minQuantity ? 'منخفض' : 'متوفر'
            }))
        } else if (type === 'CONSUMABLE_USAGE') {
            // ... (Existing Usage Logic)
            const transactions = await prisma.consumableTransaction.findMany({
                where: {
                    type: { in: ['OUT', 'DISPENSE', 'USAGE'] } // Assuming these are the types for usage
                },
                include: {
                    consumable: true,
                    employee: {
                        include: { department: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            })

            columns = [
                { key: 'date', label: 'التاريخ' },
                { key: 'employeeName', label: 'الموظف' },
                { key: 'departmentName', label: 'القسم' },
                { key: 'consumableName', label: 'المادة' },
                { key: 'quantity', label: 'الكمية المستهلكة' },
                { key: 'notes', label: 'ملاحظات' }
            ]

            data = transactions.map(t => ({
                date: t.createdAt.toISOString().split('T')[0],
                employeeName: t.employee?.name || '-',
                departmentName: t.employee?.department?.name || '-',
                consumableName: t.consumable.name,
                quantity: t.quantity,
                notes: t.notes || '-'
            }))
        } else if (type === 'LICENSES') {
            // ... (Existing Licenses Logic)
            const licenses = await prisma.license.findMany()

            columns = [
                { key: 'name', label: 'اسم البرنامج' },
                { key: 'vendor', label: 'الشركة المصنعة' },
                { key: 'licenseType', label: 'نوع الترخيص' },
                { key: 'purchaseDate', label: 'تاريخ الشراء' },
                { key: 'expiryDate', label: 'تاريخ الانتهاء' },
                { key: 'cost', label: 'التكلفة' },
                { key: 'usage', label: 'الاستخدام' }
            ]

            data = licenses.map(l => ({
                name: l.name,
                vendor: l.vendor || '-',
                licenseType: l.licenseType,
                purchaseDate: l.purchaseDate.toISOString().split('T')[0],
                expiryDate: l.expiryDate ? l.expiryDate.toISOString().split('T')[0] : 'مدى الحياة',
                cost: l.cost,
                usage: `${l.usedLicenses} / ${l.totalLicenses}`
            }))
        } else if (type === 'CUSTODY_HISTORY') {
            // ... (Existing History Logic)
            const history = await prisma.custodyItem.findMany({
                include: {
                    employee: true,
                    asset: true,
                    category: true
                },
                orderBy: { assignedDate: 'desc' }
            })

            columns = [
                { key: 'employeeName', label: 'الموظف' },
                { key: 'assetName', label: 'الأصل / العهدة' },
                { key: 'category', label: 'التصنيف' },
                { key: 'assignedDate', label: 'تاريخ التسليم' },
                { key: 'returnDate', label: 'تاريخ الإرجاع' },
                { key: 'status', label: 'الحالة' },
                { key: 'acknowledged', label: 'استلام الموظف' }
            ]

            data = history.map(h => ({
                employeeName: h.employee.name,
                assetName: h.name,
                category: h.category?.nameAr || '-',
                assignedDate: h.assignedDate.toISOString().split('T')[0],
                returnDate: h.returnDate ? h.returnDate.toISOString().split('T')[0] : '-',
                status: h.returnDate ? 'تم الإرجاع' : 'في العهدة',
                acknowledged: h.isAcknowledged ? 'نعم' : 'لا'
            }))
        } else if (type === 'VISITS') {
            const visits = await prisma.visit.findMany({
                include: {
                    visitor: true,
                    host: true
                },
                orderBy: { createdAt: 'desc' }
            })

            columns = [
                { key: 'badgeNumber', label: 'رقم التصريح' },
                { key: 'visitorName', label: 'اسم الزائر' },
                { key: 'company', label: 'الجهة / الشركة' },
                { key: 'phone', label: 'رقم الجوال' },
                { key: 'purpose', label: 'غرض الزيارة' },
                { key: 'hostName', label: 'المستضيف' },
                { key: 'checkIn', label: 'وقت الدخول' },
                { key: 'checkOut', label: 'وقت الخروج' },
                { key: 'status', label: 'الحالة' }
            ]

            data = visits.map(v => ({
                badgeNumber: v.badgeNumber || '-',
                visitorName: v.visitor.name,
                company: v.visitor.company || '-',
                phone: v.visitor.phone || '-',
                purpose: v.purpose || '-',
                hostName: v.host?.name || '-',
                checkIn: v.checkIn ? new Date(v.checkIn).toLocaleString('ar-SA') : '-',
                checkOut: v.checkOut ? new Date(v.checkOut).toLocaleString('ar-SA') : '-',
                status: v.status === 'ACTIVE' ? 'داخل المبنى' : v.status === 'COMPLETED' ? 'غادر' : v.status
            }))
        }

        return { success: true, data, columns }
    } catch (error) {
        console.error("Report Generation Error:", error)
        return { success: false, error: "فشل إنشاء التقرير" }
    }
}

// ========== Analytics Reports ==========

export async function getMonthlySpendingReport() {
    try {
        const orders = await prisma.purchaseOrder.findMany({
            where: {
                status: { not: 'CANCELLED' }
            },
            orderBy: { orderDate: 'asc' }
        })

        // Group by YYYY-MM
        const grouped: { [key: string]: number } = {}
        let totalSpent = 0

        orders.forEach(order => {
            const date = new Date(order.orderDate)
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

            if (!grouped[key]) grouped[key] = 0
            grouped[key] += order.totalCost || 0
            totalSpent += order.totalCost || 0
        })

        const months = Object.keys(grouped).map(key => {
            const [year, month] = key.split('-')
            const date = new Date(parseInt(year), parseInt(month) - 1, 1)
            return {
                month: key,
                monthLabel: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                total: grouped[key]
            }
        }).sort((a, b) => a.month.localeCompare(b.month))

        return {
            success: true,
            data: {
                months,
                stats: { totalSpent }
            }
        }
    } catch (error) {
        console.error("Monthly Report Error:", error)
        return { success: false, error: "فشل تحميل التقرير الشهري" }
    }
}

export async function getSpendingByCategoryReport() {
    try {
        const orders = await prisma.purchaseOrder.findMany({
            where: {
                status: { not: 'CANCELLED' }
            },
            include: {
                supplier: true
            }
        })

        const grouped: { [key: string]: { totalSpent: number, orderCount: number } } = {}
        let totalSpent = 0

        orders.forEach(order => {
            const category = order.supplier?.category || 'Uncategorized'

            if (!grouped[category]) {
                grouped[category] = { totalSpent: 0, orderCount: 0 }
            }
            grouped[category].totalSpent += order.totalCost || 0
            grouped[category].orderCount += 1
            totalSpent += order.totalCost || 0
        })

        const categories = Object.keys(grouped).map(key => ({
            category: key,
            totalSpent: grouped[key].totalSpent,
            orderCount: grouped[key].orderCount
        })).sort((a, b) => b.totalSpent - a.totalSpent)

        return {
            success: true,
            data: {
                categories,
                stats: { totalSpent, totalCategories: categories.length }
            }
        }
    } catch (error) {
        console.error("Category Report Error:", error)
        return { success: false, error: "فشل تحميل تقرير الفئات" }
    }
}

export async function getPurchaseOrdersReport() {
    try {
        const orders = await prisma.purchaseOrder.findMany({
            where: {
                status: { not: 'CANCELLED' }
            }
        })

        const stats = {
            total: orders.length,
            totalSpent: orders.reduce((sum, o) => sum + (o.totalCost || 0), 0),
            received: orders.filter(o => o.status === 'RECEIVED').length,
            pending: orders.filter(o => o.status !== 'RECEIVED' && o.status !== 'CANCELLED').length
        }

        return { success: true, data: { stats } }
    } catch (error) {
        console.error("Orders Report Error:", error)
        return { success: false, error: "فشل تحميل تقرير الطلبات" }
    }
}
