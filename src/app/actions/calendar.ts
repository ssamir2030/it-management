"use server"

import prisma from "@/lib/prisma"
import { startOfMonth, endOfMonth } from "date-fns"

export interface CalendarEvent {
    id: string
    title: string
    date: Date
    endDate?: Date
    type: 'WARRANTY' | 'MAINTENANCE' | 'SUBSCRIPTION' | 'ROOM_BOOKING' | 'EQUIPMENT_BOOKING' | 'LICENSE'
    status: 'UPCOMING' | 'OVERDUE' | 'COMPLETED' | 'ACTIVE' | 'PENDING' | 'APPROVED'
    color: string
    metadata?: any
}

export async function getCalendarEvents(month: Date = new Date()) {
    try {
        const startDate = startOfMonth(month)
        const endDate = endOfMonth(month)

        const [assets, maintenance, subscriptions, roomBookings, equipmentBookings, licenses] = await Promise.all([
            // 1. Warranty Expiries
            prisma.asset.findMany({
                where: {
                    warrantyExpiry: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                select: { id: true, name: true, tag: true, warrantyExpiry: true }
            }),

            // 2. Maintenance Schedules
            prisma.maintenanceSchedule.findMany({
                where: {
                    nextMaintenanceDate: {
                        gte: startDate,
                        lte: endDate
                    },
                    isActive: true
                },
                include: { asset: { select: { name: true, tag: true } } }
            }),

            // 3. Subscription Renewals
            prisma.subscription.findMany({
                where: {
                    renewalDate: {
                        gte: startDate,
                        lte: endDate
                    },
                    status: 'ACTIVE'
                }
            }),

            // 4. Room Bookings
            prisma.roomBooking.findMany({
                where: {
                    startTime: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                include: {
                    room: { select: { name: true } },
                    employee: { select: { name: true } }
                }
            }),

            // 5. Equipment Bookings
            prisma.equipmentBooking.findMany({
                where: {
                    startDate: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                include: {
                    equipment: { select: { name: true } }
                }
            }),

            // 6. License Expiries
            prisma.license.findMany({
                where: {
                    expiryDate: {
                        gte: startDate,
                        lte: endDate
                    }
                }
            })
        ])

        const events: CalendarEvent[] = []

        // Map Assets (Warranty)
        assets.forEach(asset => {
            if (asset.warrantyExpiry) {
                events.push({
                    id: `warranty-${asset.id}`,
                    title: `انتهاء ضمان: ${asset.name}`,
                    date: asset.warrantyExpiry,
                    type: 'WARRANTY',
                    status: asset.warrantyExpiry < new Date() ? 'OVERDUE' : 'UPCOMING',
                    color: '#EF4444',
                    metadata: { tag: asset.tag }
                })
            }
        })

        // Map Maintenance
        maintenance.forEach(m => {
            events.push({
                id: `maint-${m.id}`,
                title: `صيانة: ${m.asset.name}`,
                date: m.nextMaintenanceDate,
                type: 'MAINTENANCE',
                status: m.nextMaintenanceDate < new Date() ? 'OVERDUE' : 'UPCOMING',
                color: '#3B82F6',
                metadata: { tag: m.asset.tag, frequency: m.frequency }
            })
        })

        // Map Subscriptions
        subscriptions.forEach(sub => {
            events.push({
                id: `sub-${sub.id}`,
                title: `تجديد: ${sub.name}`,
                date: sub.renewalDate,
                type: 'SUBSCRIPTION',
                status: sub.renewalDate < new Date() ? 'OVERDUE' : 'UPCOMING',
                color: '#EC4899',
                metadata: { cost: sub.cost }
            })
        })

        // Map Room Bookings
        roomBookings.forEach(b => {
            events.push({
                id: `room-${b.id}`,
                title: `حجز قاعة: ${b.room.name}`,
                date: b.startTime,
                endDate: b.endTime,
                type: 'ROOM_BOOKING',
                status: b.status === 'APPROVED' ? 'APPROVED' : b.status === 'PENDING' ? 'PENDING' : 'COMPLETED',
                color: b.status === 'APPROVED' ? '#10B981' : b.status === 'PENDING' ? '#F59E0B' : '#6B7280',
                metadata: { title: b.title, employee: b.employee.name }
            })
        })

        // Map Equipment Bookings
        equipmentBookings.forEach(e => {
            events.push({
                id: `equip-${e.id}`,
                title: `حجز جهاز: ${e.equipment.name}`,
                date: e.startDate,
                endDate: e.endDate,
                type: 'EQUIPMENT_BOOKING',
                status: e.status === 'APPROVED' ? 'APPROVED' : e.status === 'PENDING' ? 'PENDING' : 'COMPLETED',
                color: '#8B5CF6',
                metadata: { purpose: e.purpose }
            })
        })

        // Map Licenses
        licenses.forEach(l => {
            if (l.expiryDate) {
                events.push({
                    id: `license-${l.id}`,
                    title: `انتهاء ترخيص: ${l.name}`,
                    date: l.expiryDate,
                    type: 'LICENSE',
                    status: l.expiryDate < new Date() ? 'OVERDUE' : 'UPCOMING',
                    color: '#F97316',
                    metadata: { vendor: l.vendor }
                })
            }
        })

        return { success: true, data: events.sort((a, b) => a.date.getTime() - b.date.getTime()) }
    } catch (error) {
        console.error("Failed to fetch calendar events:", error)
        return { success: false, error: "Failed to fetch calendar events" }
    }
}
