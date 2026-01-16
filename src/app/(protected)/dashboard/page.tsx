export const dynamic = 'force-dynamic';

export const revalidate = 0

import { DashboardClient } from '@/components/dashboard/dashboard-client'
import { getDashboardStats, getFinancialStats, getAssetsByStatus, getAssetsByType, getMonthlyTrends, getRequestsAnalytics } from '@/app/actions/analytics'
import prisma from '@/lib/prisma'

export default async function DashboardPage() {
    // Fetch all data in parallel on the server
    const [
        dashboardStats,
        financialStats,
        inventory, requests, departments, users, locations, documents, maintenance, lowStock, completedRequests,
        resolvedTickets, approvedRequests, totalRequests,
        critical, expiring,
        statusResult, typeResult, trendsResult, requestsResult,
        recentAssets, recentTickets, recentRequests,
        // New comprehensive stats
        networkDevices, activeNetworkDevices,
        subscriptions, expiringSubscriptions,
        telecomServices,
        consumables, lowConsumables,
        licenses, expiringLicenses,
        suppliers,
        meetingRooms, todayBookings,
        articles,
        remoteAgents, onlineAgents,
        softwareCatalog,
        // More stats
        custodyItems,
        breachedSLA,
        activeChats,
        todayLogs,
        courses,
        pendingBookings,
        // NEW: Complete coverage additions
        discoveredDevices, newDiscoveredDevices,
        subnets,
        ipAddresses, usedIpAddresses,
        visitors, todayVisits,
        purchaseOrders, pendingPurchaseOrders,
        activeAnnouncements,
        assetAudits,
        pendingReminders,
        activeAutomations,
        activeOperationalPlans,
        activeContracts,
        racks,
        certificates
    ] = await Promise.all([
        getDashboardStats(),
        getFinancialStats(),
        prisma.inventoryItem.count(),
        prisma.employeeRequest.count(),
        prisma.department.count(),
        prisma.user.count(),
        prisma.location.count(),
        prisma.document.count(),
        prisma.asset.count({ where: { status: 'MAINTENANCE' } }),
        prisma.inventoryItem.count({ where: { quantity: { lte: 10 } } }),
        prisma.employeeRequest.count({ where: { status: 'COMPLETED' } }),
        prisma.ticket.count({ where: { status: 'RESOLVED' } }),
        prisma.employeeRequest.count({ where: { status: 'APPROVED' } }),
        prisma.employeeRequest.count(),
        prisma.ticket.count({ where: { priority: { in: ['URGENT', 'HIGH'] }, status: { notIn: ['RESOLVED', 'CLOSED'] } } }),
        prisma.asset.count({ where: { warrantyExpiry: { gte: new Date(), lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } } }),
        getAssetsByStatus(),
        getAssetsByType(),
        getMonthlyTrends(),
        getRequestsAnalytics(),
        prisma.asset.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { employee: { select: { name: true, department: { select: { name: true } } } } }
        }),
        prisma.ticket.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { createdBy: { select: { name: true } } }
        }),
        prisma.employeeRequest.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                type: true,
                status: true,
                employee: { select: { name: true } }
            }
        }),
        // New comprehensive stats queries
        prisma.networkDevice.count(),
        prisma.networkDevice.count({ where: { status: 'ACTIVE' } }),
        prisma.subscription.count(),
        prisma.subscription.count({ where: { renewalDate: { gte: new Date(), lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } } }),
        prisma.telecomService.count(),
        prisma.consumable.count(),
        prisma.consumable.count({ where: { quantity: { lte: 5 } } }),
        prisma.license.count(),
        prisma.license.count({ where: { expiryDate: { gte: new Date(), lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } } }),
        prisma.supplier.count(),
        prisma.meetingRoom.count(),
        prisma.roomBooking.count({ where: { startTime: { gte: new Date(new Date().setHours(0, 0, 0, 0)), lte: new Date(new Date().setHours(23, 59, 59, 999)) } } }),
        prisma.article.count(),
        prisma.remoteAgent.count(),
        prisma.remoteAgent.count({ where: { state: 'ONLINE' } }),
        prisma.softwareCatalog.count(),
        // New additions for complete coverage
        prisma.custodyItem.count(),
        prisma.ticketSLA.count({ where: { isBreached: true } }),
        prisma.chatMessage.count({ where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
        prisma.auditLog.count({ where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
        prisma.course.count(),
        prisma.equipmentBooking.count({ where: { status: 'PENDING' } }),
        // NEW: Complete coverage additions (with safe fallbacks)
        prisma.discoveredDevice.count().catch(() => 0),
        prisma.discoveredDevice.count({ where: { status: 'NEW' } }).catch(() => 0),
        prisma.subnet.count().catch(() => 0),
        Promise.resolve(0), // ipAddresses - model doesn't exist
        Promise.resolve(0), // usedIpAddresses - model doesn't exist
        prisma.visitor.count().catch(() => 0),
        prisma.visit.count({ where: { checkIn: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }).catch(() => 0),
        prisma.purchaseOrder.count().catch(() => 0),
        prisma.purchaseOrder.count({ where: { status: 'PENDING' } }).catch(() => 0),
        prisma.announcement.count({ where: { isActive: true } }).catch(() => 0),
        prisma.assetAudit.count().catch(() => 0),
        prisma.reminder.count({ where: { completed: false } }).catch(() => 0),
        prisma.automationRule.count({ where: { isActive: true } }).catch(() => 0),
        prisma.operationalPlanYear.count({ where: { status: 'ACTIVE' } }).catch(() => 0),
        prisma.supplierContract.count({ where: { status: 'ACTIVE' } }).catch(() => 0),
        prisma.rack.count().catch(() => 0),
        prisma.certificate.count().catch(() => 0)
    ])

    const stats = dashboardStats.data || {
        assets: { total: 0, available: 0, assigned: 0, thisMonth: 0, growth: 0 },
        employees: { total: 0, thisMonth: 0, growth: 0 },
        tickets: { total: 0, open: 0, closed: 0, growth: 0 }
    }

    const financials = financialStats.data || {
        totalAssetsValue: 0,
        totalLicensesCost: 0,
        totalInventoryValue: 0,
        monthlyRecurring: 0
    }

    // Pass all data as a single prop to avoid hydration issues
    return (
        <DashboardClient
            data={{
                stats,
                financials, // Pass new Financial Stats
                quickStats: {
                    inventory, requests, departments, users, locations, documents, maintenance, lowStock, completedRequests
                },
                metrics: { resolvedTickets, approvedRequests, totalRequests },
                // Enhanced alerts - all system warnings in one place
                alerts: {
                    critical,
                    expiring,
                    breachedSLA,
                    expiringLicenses,
                    expiringSubscriptions,
                    lowConsumables,
                    pendingReminders,
                    maintenance,
                    pendingPurchaseOrders,
                    lowStock
                },
                charts: { statusResult, typeResult, trendsResult, requestsResult },
                activity: { recentAssets, recentTickets, recentRequests },
                // New comprehensive stats
                systemOverview: {
                    networkDevices, activeNetworkDevices,
                    subscriptions, expiringSubscriptions,
                    telecomServices,
                    consumables, lowConsumables,
                    licenses, expiringLicenses,
                    suppliers,
                    meetingRooms, todayBookings,
                    articles,
                    remoteAgents, onlineAgents,
                    softwareCatalog,
                    // More stats
                    custodyItems,
                    breachedSLA,
                    activeChats,
                    todayLogs,
                    courses,
                    pendingBookings,
                    // NEW: Complete coverage
                    discoveredDevices, newDiscoveredDevices,
                    subnets,
                    ipAddresses, usedIpAddresses,
                    visitors, todayVisits,
                    purchaseOrders, pendingPurchaseOrders,
                    activeAnnouncements,
                    assetAudits,
                    pendingReminders,
                    activeAutomations,
                    activeOperationalPlans,
                    activeContracts,
                    racks,
                    certificates
                }
            }}
        />
    )
}
