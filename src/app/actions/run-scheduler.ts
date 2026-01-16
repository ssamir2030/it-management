'use server'

import prisma from "@/lib/prisma"
import { calculateNextDate } from "@/app/actions/maintenance"

export async function runMaintenanceScheduler() {
    try {
        const today = new Date()
        const dueSchedules = await prisma.maintenanceSchedule.findMany({
            where: {
                isActive: true,
                nextMaintenanceDate: {
                    lte: today
                }
            },
            include: {
                asset: {
                    include: {
                        employee: true
                    }
                }
            }
        })

        if (dueSchedules.length === 0) {
            return { success: true, count: 0, message: "No schedules due" }
        }

        let createdCount = 0

        for (const schedule of dueSchedules) {
            // 1. Create the ticket
            const title = `صيانة دورية: ${schedule.description} - ${schedule.asset.name}`
            const description = `
                تذكير بموعد الصيانة الدورية للأصل: ${schedule.asset.name} (${schedule.asset.tag})
                نوع الصيانة: ${schedule.frequency}
                الوصف: ${schedule.description}
                الموقع: ${schedule.asset.locationId || 'غير محدد'}
                المسؤول: ${schedule.asset.employee?.name || 'غير معين'}
            `

            await prisma.ticket.create({
                data: {
                    title,
                    description,
                    category: 'MAINTENANCE',
                    priority: 'HIGH',
                    status: 'OPEN',
                    // Optional: assign to a default maintenance team member if configured
                }
            })

            // 2. Update next date
            const nextDate = await calculateNextDate(schedule.nextMaintenanceDate, schedule.frequency)

            await prisma.maintenanceSchedule.update({
                where: { id: schedule.id },
                data: {
                    lastMaintenanceDate: schedule.nextMaintenanceDate,
                    nextMaintenanceDate: nextDate
                }
            })

            createdCount++
        }

        return { success: true, count: createdCount }
    } catch (error) {
        console.error("Maintenance scheduler error:", error)
        return { success: false, error: "Scheduler failed" }
    }
}
