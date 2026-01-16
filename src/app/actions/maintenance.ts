'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getSession } from "@/lib/simple-auth"

export type MaintenanceFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'

export async function createMaintenanceSchedule(
    assetId: string,
    frequency: MaintenanceFrequency,
    description: string,
    startDate: Date
) {
    try {
        const session = await getSession()
        if (!session || session.role !== 'ADMIN') {
            return { success: false, error: "Unauthorized" }
        }

        // Calculate next maintenance date
        const nextDate = new Date(startDate)
        // Ensure nextDate is in the future or today
        if (nextDate < new Date()) {
            return { success: false, error: "Start date must be in the future" }
        }

        const schedule = await prisma.maintenanceSchedule.create({
            data: {
                assetId,
                frequency,
                description,
                lastMaintenanceDate: new Date(),
                nextMaintenanceDate: nextDate,
                isActive: true
            }
        })

        revalidatePath(`/assets/${assetId}`)
        return { success: true, data: schedule }
    } catch (error) {
        console.error("Failed to create maintenance schedule:", error)
        return { success: false, error: "Failed to create schedule" }
    }
}

export async function getMaintenanceSchedules(assetId: string) {
    try {
        const schedules = await prisma.maintenanceSchedule.findMany({
            where: { assetId },
            orderBy: { nextMaintenanceDate: 'asc' }
        })
        return { success: true, data: schedules }
    } catch (error) {
        return { success: false, error: "Failed to fetch schedules" }
    }
}

export async function deleteMaintenanceSchedule(scheduleId: string) {
    try {
        const session = await getSession()
        if (!session || session.role !== 'ADMIN') {
            return { success: false, error: "Unauthorized" }
        }

        const schedule = await prisma.maintenanceSchedule.delete({
            where: { id: scheduleId }
        })

        revalidatePath(`/assets/${schedule.assetId}`)
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to delete schedule" }
    }
}

// Logic to calculate next date based on frequency
export async function calculateNextDate(currentDate: Date, frequency: string): Promise<Date> {
    const next = new Date(currentDate)
    switch (frequency) {
        case 'DAILY': next.setDate(next.getDate() + 1); break;
        case 'WEEKLY': next.setDate(next.getDate() + 7); break;
        case 'MONTHLY': next.setMonth(next.getMonth() + 1); break;
        case 'QUARTERLY': next.setMonth(next.getMonth() + 3); break;
        case 'YEARLY': next.setFullYear(next.getFullYear() + 1); break;
    }
    return next
}

export async function createMaintenanceTicket(data: {
    title: string;
    description: string;
    assetId: string;
}) {
    try {
        const ticket = await prisma.ticket.create({
            data: {
                title: data.title,
                description: data.description,
                category: 'MAINTENANCE',
                priority: 'MEDIUM',
                status: 'OPEN',
            }
        })
        return { success: true, data: ticket }
    } catch (error) {
        return { success: false, error: "Failed to create maintenance ticket" }
    }
}

export async function createMaintenance(formData: FormData) {
    const title = formData.get("title") as string
    const type = formData.get("type") as string
    const scheduledDate = formData.get("scheduledDate") as string
    const description = formData.get("description") as string
    const notes = formData.get("notes") as string

    try {
        const ticket = await prisma.ticket.create({
            data: {
                title,
                description: `${description}\nNotes: ${notes}\nType: ${type}`,
                category: 'MAINTENANCE',
                priority: 'MEDIUM',
                status: 'OPEN',
            }
        })
        return { success: true, data: ticket }
    } catch (error) {
        return { success: false, error: "Failed to create maintenance" }
    }
}

