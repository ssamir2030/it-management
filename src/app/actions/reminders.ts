'use server'

import prisma from '@/lib/prisma'
import { getSession } from '@/lib/simple-auth'
import { revalidatePath } from 'next/cache'

export type ReminderType =
    | 'WARRANTY_EXPIRY'
    | 'MAINTENANCE_DUE'
    | 'CONTRACT_RENEWAL'
    | 'LICENSE_RENEWAL'
    | 'CUSTOM'

interface CreateReminderParams {
    type: ReminderType
    title: string
    description?: string
    dueDate: Date
    entityType?: string
    entityId?: string
    assignedToId?: string
    priority?: 'LOW' | 'MEDIUM' | 'HIGH'
}

export async function createReminder(params: CreateReminderParams) {
    try {
        const session = await getSession()

        if (!session?.id) {
            return { success: false, error: 'Not authenticated' }
        }

        const reminder = await prisma.reminder.create({
            data: {
                type: params.type,
                title: params.title,
                description: params.description,
                dueDate: params.dueDate,
                entityType: params.entityType,
                entityId: params.entityId,
                createdById: session.id as string,
                assignedToId: params.assignedToId || (session.id as string),
                priority: params.priority || 'MEDIUM',
                completed: false
            }
        })

        revalidatePath('/reminders')
        return { success: true, data: reminder }
    } catch (error) {
        console.error('Error creating reminder:', error)
        return { success: false, error: 'Failed to create reminder' }
    }
}

export async function getReminders(filters?: {
    completed?: boolean
    type?: ReminderType
    priority?: string
}) {
    try {
        const session = await getSession()

        if (!session?.id) {
            return { success: false, error: 'Not authenticated' }
        }

        const where: any = {
            OR: [
                { createdById: session.id },
                { assignedToId: session.id }
            ]
        }

        if (filters?.completed !== undefined) {
            where.completed = filters.completed
        }

        if (filters?.type) {
            where.type = filters.type
        }

        if (filters?.priority) {
            where.priority = filters.priority
        }

        const reminders = await prisma.reminder.findMany({
            where,
            include: {
                createdBy: {
                    select: {
                        name: true,
                        email: true
                    }
                },
                assignedTo: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: [
                { completed: 'asc' },
                { dueDate: 'asc' }
            ]
        })

        return { success: true, data: reminders }
    } catch (error) {
        console.error('Error fetching reminders:', error)
        return { success: false, error: 'Failed to fetch reminders' }
    }
}

export async function markReminderComplete(reminderId: string) {
    try {
        const session = await getSession()

        if (!session?.id) {
            return { success: false, error: 'Not authenticated' }
        }

        await prisma.reminder.update({
            where: { id: reminderId },
            data: {
                completed: true,
                completedAt: new Date()
            }
        })

        revalidatePath('/reminders')
        return { success: true }
    } catch (error) {
        console.error('Error marking reminder complete:', error)
        return { success: false, error: 'Failed to update reminder' }
    }
}

export async function deleteReminder(reminderId: string) {
    try {
        await prisma.reminder.delete({
            where: { id: reminderId }
        })

        revalidatePath('/reminders')
        return { success: true }
    } catch (error) {
        console.error('Error deleting reminder:', error)
        return { success: false, error: 'Failed to delete reminder' }
    }
}

// Get upcoming reminders (next 7 days)
export async function getUpcomingReminders() {
    try {
        const session = await getSession()

        if (!session?.id) {
            return { success: false, error: 'Not authenticated' }
        }

        const now = new Date()
        const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

        const reminders = await prisma.reminder.findMany({
            where: {
                assignedToId: session.id,
                completed: false,
                dueDate: {
                    gte: now,
                    lte: sevenDaysLater
                }
            },
            orderBy: { dueDate: 'asc' },
            take: 10
        })

        return { success: true, data: reminders }
    } catch (error) {
        console.error('Error fetching upcoming reminders:', error)
        return { success: false, error: 'Failed to fetch reminders' }
    }
}

// Get overdue reminders
export async function getOverdueReminders() {
    try {
        const session = await getSession()

        if (!session?.id) {
            return { success: false, error: 'Not authenticated' }
        }

        const now = new Date()

        const reminders = await prisma.reminder.findMany({
            where: {
                assignedToId: session.id,
                completed: false,
                dueDate: {
                    lt: now
                }
            },
            orderBy: { dueDate: 'asc' }
        })

        return { success: true, data: reminders }
    } catch (error) {
        console.error('Error fetching overdue reminders:', error)
        return { success: false, error: 'Failed to fetch reminders' }
    }
}
