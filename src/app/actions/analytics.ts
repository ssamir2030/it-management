'use server'

import prisma from '@/lib/prisma'
import { startOfMonth, endOfMonth, subMonths, format, subDays, startOfDay, endOfDay } from 'date-fns'
import { ar } from 'date-fns/locale'

// Get comprehensive dashboard statistics
export async function getDashboardStats() {
    try {
        const now = new Date()
        const startOfThisMonth = startOfMonth(now)
        const endOfThisMonth = endOfMonth(now)
        const startOfLastMonth = startOfMonth(subMonths(now, 1))
        const endOfLastMonth = endOfMonth(subMonths(now, 1))

        // Assets Statistics
        const [
            totalAssets,
            availableAssets,
            assignedAssets,
            assetsThisMonth,
            assetsLastMonth
        ] = await Promise.all([
            prisma.asset.count({ where: { deletedAt: null } }),
            prisma.asset.count({ where: { status: 'AVAILABLE', deletedAt: null } }),
            prisma.asset.count({ where: { status: 'ASSIGNED', deletedAt: null } }),
            prisma.asset.count({
                where: {
                    createdAt: { gte: startOfThisMonth, lte: endOfThisMonth },
                    deletedAt: null
                }
            }),
            prisma.asset.count({
                where: {
                    createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
                    deletedAt: null
                }
            })
        ])

        // Employees Statistics
        const [totalEmployees, employeesThisMonth, employeesLastMonth] = await Promise.all([
            prisma.employee.count({ where: { deletedAt: null } }),
            prisma.employee.count({
                where: {
                    createdAt: { gte: startOfThisMonth, lte: endOfThisMonth },
                    deletedAt: null
                }
            }),
            prisma.employee.count({
                where: {
                    createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
                    deletedAt: null
                }
            })
        ])

        // Tickets Statistics
        const [
            totalTickets,
            openTickets,
            closedTickets,
            ticketsThisMonth,
            ticketsLastMonth
        ] = await Promise.all([
            prisma.ticket.count(),
            prisma.ticket.count({ where: { status: 'OPEN' } }),
            prisma.ticket.count({ where: { status: 'CLOSED' } }),
            prisma.ticket.count({
                where: {
                    createdAt: { gte: startOfThisMonth, lte: endOfThisMonth }
                }
            }),
            prisma.ticket.count({
                where: {
                    createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }
                }
            })
        ])

        // Calculate growth percentages
        const assetsGrowth = assetsLastMonth > 0
            ? ((assetsThisMonth - assetsLastMonth) / assetsLastMonth) * 100
            : 0

        const employeesGrowth = employeesLastMonth > 0
            ? ((employeesThisMonth - employeesLastMonth) / employeesLastMonth) * 100
            : 0

        const ticketsGrowth = ticketsLastMonth > 0
            ? ((ticketsThisMonth - ticketsLastMonth) / ticketsLastMonth) * 100
            : 0

        return {
            success: true,
            data: {
                assets: {
                    total: totalAssets,
                    available: availableAssets,
                    assigned: assignedAssets,
                    thisMonth: assetsThisMonth,
                    growth: Number(assetsGrowth.toFixed(1))
                },
                employees: {
                    total: totalEmployees,
                    thisMonth: employeesThisMonth,
                    growth: Number(employeesGrowth.toFixed(1))
                },
                tickets: {
                    total: totalTickets,
                    open: openTickets,
                    closed: closedTickets,
                    thisMonth: ticketsThisMonth,
                    growth: Number(ticketsGrowth.toFixed(1))
                }
            }
        }
    } catch (error) {
        console.error('Error fetching dashboard stats:', error)
        return { success: false, error: 'Failed to fetch statistics' }
    }
}

// NEW: Financial Statistics
export async function getFinancialStats() {
    try {
        // 1. Assets Value
        const assetsValue = await prisma.asset.aggregate({
            _sum: { price: true },
            where: { deletedAt: null }
        })

        // 2. Licenses Cost
        const licensesCost = await prisma.softwareLicense.aggregate({
            _sum: { cost: true }
        })

        // 3. Subscriptions (Monthly converted to Annual approximation or just Monthly total)
        // Let's return Monthly Total
        const subscriptionsCost = await prisma.subscription.aggregate({
            _sum: { cost: true },
            where: { status: 'ACTIVE' }
        })

        // 4. Inventory Value
        // Prisma aggregate doesn't support multiplication (quantity * unitPrice), so we fetch and sum manually
        // We probably don't have thousands of inventory items yet, so this is safe.
        // If scale is large, we should use raw SQL.
        const inventoryItems = await prisma.inventoryItem.findMany({
            select: { quantity: true, unitPrice: true }
        })
        const inventoryValue = inventoryItems.reduce((sum, item) => sum + (item.quantity * (item.unitPrice || 0)), 0)

        // 5. Telecom Monthly
        const telecomCost = await prisma.telecomService.aggregate({
            _sum: { cost: true }
        })

        return {
            success: true,
            data: {
                totalAssetsValue: assetsValue._sum.price || 0,
                totalLicensesCost: licensesCost._sum.cost || 0,
                totalInventoryValue: inventoryValue,
                monthlyRecurring: (subscriptionsCost._sum.cost || 0) + (telecomCost._sum.cost || 0)
            }
        }
    } catch (error) {
        console.error('Error fetching financial stats:', error)
        return { success: false, error: 'Failed to fetch financials' }
    }
}

// Get asset distribution by type
export async function getAssetsByType() {
    try {
        const assets = await prisma.asset.groupBy({
            by: ['type'],
            where: { deletedAt: null },
            _count: true
        })

        const data = assets.map((item: any) => ({
            name: item.type,
            value: item._count,
            fill: getColorForType(item.type)
        }))

        return { success: true, data }
    } catch (error) {
        console.error('Error fetching assets by type:', error)
        return { success: false, error: 'Failed to fetch data' }
    }
}

// Get asset distribution by status
export async function getAssetsByStatus() {
    try {
        const assets = await prisma.asset.groupBy({
            by: ['status'],
            where: { deletedAt: null },
            _count: true
        })

        const statusLabels: Record<string, string> = {
            'AVAILABLE': 'متاح',
            'ASSIGNED': 'مُعين',
            'MAINTENANCE': 'صيانة',
            'RETIRED': 'متقاعد'
        }

        const data = assets.map(item => ({
            name: statusLabels[item.status] || item.status,
            value: item._count
        }))

        return { success: true, data }
    } catch (error) {
        console.error('Error fetching assets by status:', error)
        return { success: false, error: 'Failed to fetch data' }
    }
}

// Get monthly trends (last 6 months)
export async function getMonthlyTrends() {
    try {
        const months = []
        for (let i = 5; i >= 0; i--) {
            const date = subMonths(new Date(), i)
            months.push({
                start: startOfMonth(date),
                end: endOfMonth(date),
                label: format(date, 'MMM', { locale: ar })
            })
        }

        const trends = await Promise.all(
            months.map(async (month) => {
                const [assets, employees, tickets] = await Promise.all([
                    prisma.asset.count({
                        where: {
                            createdAt: { gte: month.start, lte: month.end },
                            deletedAt: null
                        }
                    }),
                    prisma.employee.count({
                        where: {
                            createdAt: { gte: month.start, lte: month.end },
                            deletedAt: null
                        }
                    }),
                    prisma.ticket.count({
                        where: {
                            createdAt: { gte: month.start, lte: month.end }
                        }
                    })
                ])

                return {
                    month: month.label,
                    assets,
                    employees,
                    tickets
                }
            })
        )

        return { success: true, data: trends }
    } catch (error) {
        console.error('Error fetching monthly trends:', error)
        return { success: false, error: 'Failed to fetch trends' }
    }
}

// Get top departments by asset count
export async function getTopDepartments() {
    try {
        const departments = await prisma.department.findMany({
            where: { deletedAt: null },
            select: {
                id: true,
                name: true,
                _count: {
                    select: {
                        employees: true
                    }
                },
                employees: {
                    where: { deletedAt: null },
                    select: {
                        _count: {
                            select: {
                                assets: true
                            }
                        }
                    }
                }
            },
            take: 10
        })

        const data = departments.map(dept => ({
            name: dept.name,
            employees: dept._count.employees,
            assets: dept.employees.reduce((sum, emp) => sum + emp._count.assets, 0)
        })).sort((a, b) => b.assets - a.assets)

        return { success: true, data }
    } catch (error) {
        console.error('Error fetching top departments:', error)
        return { success: false, error: 'Failed to fetch data' }
    }
}

// Get requests analytics
export async function getRequestsAnalytics() {
    try {
        // 1. Total Requests
        const totalRequests = await prisma.employeeRequest.count()

        // 2. Requests by Status
        const requestsByStatusRaw = await prisma.employeeRequest.groupBy({
            by: ['status'],
            _count: true
        })
        const requestsByStatus = requestsByStatusRaw.map(item => ({
            status: item.status,
            count: item._count
        }))

        // 3. Requests by Type
        const requestsByTypeRaw = await prisma.employeeRequest.groupBy({
            by: ['type'],
            _count: true
        })
        const requestsByType = requestsByTypeRaw.map(item => ({
            type: item.type,
            count: item._count
        }))

        // 4. Ratings (Mock data or real if available, assuming mock for now or simple avg if field exists)
        // Assuming no rating field on request yet, returning mock/placeholder
        const avgRating = 4.5
        const totalRatings = 150

        // 5. Avg Completion Time (Mock or calculated)
        // Calculating based on completed requests
        const completedRequests = await prisma.employeeRequest.findMany({
            where: { status: 'COMPLETED', completedAt: { not: null } },
            select: { createdAt: true, completedAt: true }
        })

        let totalTime = 0
        completedRequests.forEach(req => {
            if (req.completedAt) {
                totalTime += (new Date(req.completedAt).getTime() - new Date(req.createdAt).getTime())
            }
        })
        const avgCompletionTime = completedRequests.length > 0
            ? (totalTime / completedRequests.length) / (1000 * 60 * 60) // in hours
            : 0

        // 6. Top Employees
        const topEmployeesRaw = await prisma.employeeRequest.groupBy({
            by: ['employeeId'],
            _count: true,
            orderBy: {
                _count: {
                    employeeId: 'desc'
                }
            },
            take: 5
        })

        const topEmployees = await Promise.all(topEmployeesRaw.map(async (item) => {
            const emp = await prisma.employee.findUnique({
                where: { id: item.employeeId },
                select: { name: true }
            })
            return {
                name: emp?.name || 'Unknown',
                request_count: item._count
            }
        }))

        // 7. Last 7 Days Trend
        const last7Days = []
        for (let i = 6; i >= 0; i--) {
            const date = subDays(new Date(), i)
            const start = startOfDay(date)
            const end = endOfDay(date)

            const count = await prisma.employeeRequest.count({
                where: {
                    createdAt: {
                        gte: start,
                        lte: end
                    }
                }
            })

            last7Days.push({
                date: date.toISOString(),
                count
            })
        }

        return {
            success: true,
            data: {
                totalRequests,
                requestsByStatus,
                requestsByType,
                avgRating,
                totalRatings,
                avgCompletionTime,
                topEmployees,
                last7Days
            }
        }

    } catch (error) {
        console.error('Error fetching requests analytics:', error)
        return { success: false, error: 'Failed to fetch analytics' }
    }
}

// Helper function for colors
function getColorForType(type: string): string {
    const colors: Record<string, string> = {
        'LAPTOP': '#3b82f6',
        'DESKTOP': '#8b5cf6',
        'MONITOR': '#06b6d4',
        'PRINTER': '#10b981',
        'PHONE': '#f59e0b',
        'TABLET': '#ec4899',
        'SERVER': '#ef4444',
        'NETWORK': '#6366f1'
    }
    return colors[type] || '#6b7280'
}
