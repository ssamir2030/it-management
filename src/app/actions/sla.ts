'use server'

import { getSession } from "@/lib/simple-auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { logAction } from "@/lib/logger"
import { hasPermission } from "@/lib/rbac"

export async function getSLAList() {
    try {
        const slas = await prisma.sLA.findMany({
            orderBy: { priority: 'asc' }
        })
        return { success: true, data: slas }
    } catch (error) {
        return { success: false, error: "فشل جلب قائمة اتفاقيات مستوى الخدمة" }
    }
}

export async function updateSLA(id: string, responseTime: number, resolutionTime: number) {
    const session = await getSession()

    if (!session?.role || !hasPermission(session.role as string, 'manage_settings')) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        const sla = await prisma.sLA.update({
            where: { id },
            data: {
                responseTime,
                resolutionTime
            }
        })

        await logAction({
            userId: session.id as string,
            userName: (session.name || "Admin") as string,
            action: 'UPDATE',
            entityType: 'SLA',
            entityId: id,
            entityName: sla.name,
            changes: { responseTime, resolutionTime }
        })

        revalidatePath('/admin/settings/sla')
        return { success: true }
    } catch (error) {
        return { success: false, error: "فشل تحديث اتفاقية مستوى الخدمة" }
    }
}

export async function initializeDefaultSLAs() {
    const defaults = [
        { name: 'عاجل', priority: 'URGENT', responseTime: 1, resolutionTime: 4 }, // Hours
        { name: 'مهم', priority: 'HIGH', responseTime: 4, resolutionTime: 24 },
        { name: 'عادي', priority: 'NORMAL', responseTime: 8, resolutionTime: 48 },
        { name: 'منخفض', priority: 'LOW', responseTime: 24, resolutionTime: 72 },
    ]

    for (const def of defaults) {
        const existing = await prisma.sLA.findFirst({ where: { priority: def.priority } })
        if (!existing) {
            await prisma.sLA.create({ data: def })
        }
    }
}


export async function getSLAStats() {
    try {
        const total = await prisma.ticket.count()
        const active = await prisma.ticket.count({
            where: { status: { notIn: ['CLOSED', 'RESOLVED'] } }
        })

        // Calculate breach rate from TicketSLA
        const breached = await prisma.ticketSLA.count({
            where: { status: 'BREACHED' }
        })

        const slas = await prisma.ticketSLA.count()
        const withinSLA = slas - breached

        const breachRate = slas > 0 ? Math.round((breached / slas) * 100) : 0

        return {
            success: true,
            data: {
                total,
                active,
                breached,
                withinSLA,
                breachRate
            }
        }
    } catch (error) {
        return { success: false, error: "فشل جلب الإحصائيات" }
    }
}

export async function getTicketsAtRisk() {
    try {
        // Find active tickets that are close to breach (e.g. within 2 hours)
        const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000)

        const riskTickets = await prisma.ticketSLA.findMany({
            where: {
                status: 'PENDING',
                breachTime: {
                    lte: twoHoursFromNow,
                    gt: new Date()
                }
            },
            include: {
                ticket: {
                    include: {
                        assignedTo: true
                    }
                }
            }
        })

        return { success: true, data: riskTickets }
    } catch (error) {
        return { success: false, error: "فشل جلب التذاكر المعرضة للخطر" }
    }
}

export async function calculateDueDate(priority: string): Promise<Date> {
    const sla = await prisma.sLA.findFirst({
        where: { priority }
    })

    // Default to 24 hours if no SLA found
    const hours = sla?.resolutionTime || 24

    const dueDate = new Date()
    dueDate.setHours(dueDate.getHours() + hours)

    return dueDate
}

export async function createSLA(data: any) {
    const session = await getSession()
    if (!session?.role || !hasPermission(session.role as string, 'manage_settings')) return { success: false, error: "Unauthorized" }

    try {
        await prisma.sLA.create({ data })
        revalidatePath('/admin/settings/sla')
        return { success: true }
    } catch (error) {
        return { success: false, error: "فشل إنشاء السياسة" }
    }
}

export async function deleteSLA(id: string) {
    const session = await getSession()
    if (!session?.role || !hasPermission(session.role as string, 'manage_settings')) return { success: false, error: "Unauthorized" }

    try {
        await prisma.sLA.delete({ where: { id } })
        revalidatePath('/admin/settings/sla')
        return { success: true }
    } catch (error) {
        return { success: false, error: "فشل حذف السياسة" }
    }
}

export async function createTicketSLA(ticketId: string) {
    try {
        const ticket = await prisma.ticket.findUnique({
            where: { id: ticketId }
        })

        if (!ticket) return { success: false, error: "Ticket not found" }

        // Find SLA policy for priority
        const sla = await prisma.sLA.findFirst({
            where: { priority: ticket.priority }
        })

        // Default resolution time is 24 hours if no SLA found
        const resolutionHours = sla?.resolutionTime || 24
        const breachTime = new Date()
        breachTime.setHours(breachTime.getHours() + resolutionHours)

        await prisma.ticketSLA.create({
            data: {
                ticketId,
                status: 'PENDING',
                priority: ticket.priority,
                breachTime,
            }
        })

        return { success: true }
    } catch (error) {
        console.error("Error creating ticket SLA:", error)
        return { success: false, error: "Failed to create Ticket SLA" }
    }
}
