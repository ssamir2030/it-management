'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentEmployee } from './employee-portal'
import { getSession } from '@/lib/simple-auth'
import { revalidatePath } from 'next/cache'

// --- For Employees ---

export async function getAvailableEquipment() {
    try {
        const equipment = await prisma.equipment.findMany({
            where: {
                isAvailable: true
            },
            include: {
                location: true
            },
            orderBy: {
                name: 'asc'
            }
        })
        return { success: true, data: equipment }
    } catch (error) {
        console.error('Error fetching available equipment:', error)
        return { success: false, error: 'Failed to fetch equipment' }
    }
}

export async function bookEquipment(data: {
    equipmentId: string,
    startDate: Date,
    endDate: Date,
    purpose: string
}) {
    try {
        const employee = await getCurrentEmployee()
        if (!employee) return { success: false, error: 'Unauthorized' }

        // Check availability
        const isAvailable = await checkAvailability(data.equipmentId, data.startDate, data.endDate)
        if (!isAvailable) {
            return { success: false, error: 'الجهاز غير متاح في هذه الفترة' }
        }

        const booking = await prisma.equipmentBooking.create({
            data: {
                equipmentId: data.equipmentId,
                employeeId: employee.id,
                startDate: data.startDate,
                endDate: data.endDate,
                purpose: data.purpose,
                status: 'PENDING'
            }
        })

        // Notify admins (optional)

        revalidatePath('/portal/equipment')
        return { success: true, data: booking }
    } catch (error) {
        console.error('Error booking equipment:', error)
        return { success: false, error: 'Failed to book equipment' }
    }
}

export async function getMyBookings() {
    try {
        const employee = await getCurrentEmployee()
        if (!employee) return { success: false, error: 'Unauthorized' }

        const bookings = await prisma.equipmentBooking.findMany({
            where: {
                employeeId: employee.id
            },
            include: {
                equipment: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        return { success: true, data: bookings }
    } catch (error) {
        console.error('Error fetching my bookings:', error)
        return { success: false, error: 'Failed to fetch bookings' }
    }
}

async function checkAvailability(equipmentId: string, startDate: Date, endDate: Date): Promise<boolean> {
    const conflictingBookings = await prisma.equipmentBooking.findMany({
        where: {
            equipmentId,
            status: { in: ['APPROVED', 'PENDING'] },
            OR: [
                {
                    startDate: { lte: endDate },
                    endDate: { gte: startDate }
                }
            ]
        }
    })
    return conflictingBookings.length === 0
}

// --- For Admins ---

export async function getAllEquipment() {
    try {
        const session = await getSession()
        if (!session) return { success: false, error: 'Unauthorized' }
        // if (session.role !== 'ADMIN') return { success: false, error: 'Unauthorized' }

        const equipment = await prisma.equipment.findMany({
            include: {
                location: true,
                _count: {
                    select: { bookings: true }
                }
            },
            orderBy: { name: 'asc' }
        })
        return { success: true, data: equipment }
    } catch (error) {
        console.error('Error fetching all equipment:', error)
        return { success: false, error: 'Failed to fetch equipment' }
    }
}

export async function addEquipment(data: {
    name: string,
    type: string,
    description?: string,
    locationId?: string
}) {
    try {
        const session = await getSession()
        if (!session) return { success: false, error: 'Unauthorized' }
        // if (session.role !== 'ADMIN') return { success: false, error: 'Unauthorized' }

        const equipment = await prisma.equipment.create({
            data: {
                name: data.name,
                type: data.type,
                description: data.description,
                locationId: data.locationId || null,
                isAvailable: true
            }
        })
        revalidatePath('/admin/equipment')
        return { success: true, data: equipment }
    } catch (error) {
        console.error('Error adding equipment:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Failed to add equipment' }
    }
}

export async function processBooking(bookingId: string, status: 'APPROVED' | 'REJECTED' | 'RETURNED', notes?: string) {
    try {
        const session = await getSession()
        if (!session) return { success: false, error: 'Unauthorized' }
        // if (session.role !== 'ADMIN') return { success: false, error: 'Unauthorized' }

        const booking = await prisma.equipmentBooking.update({
            where: { id: bookingId },
            data: {
                status,
                adminNotes: notes,
                approvedBy: session.id as string,
                updatedAt: new Date()
            },
            include: {
                employee: true,
                equipment: true
            }
        })

        // Send notification to employee
        if (booking.employeeId) {
            const { createEmployeeNotification } = await import('./employee-notifications')
            let title = '', message = ''

            if (status === 'APPROVED') {
                title = 'تم قبول حجز الجهاز'
                message = `تمت الموافقة على حجز ${booking.equipment.name}`
            } else if (status === 'REJECTED') {
                title = 'تم رفض حجز الجهاز'
                message = `نعتذر، تم رفض حجز ${booking.equipment.name}`
            } else if (status === 'RETURNED') {
                title = 'تم إرجاع الجهاز'
                message = `تم تأكيد إرجاع ${booking.equipment.name} بنجاح`
            }

            await createEmployeeNotification({
                employeeId: booking.employeeId,
                type: 'BOOKING_UPDATE',
                title,
                message,
                actionUrl: '/portal/equipment'
            })
        }

        revalidatePath('/admin/bookings')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Failed to process booking' }
    }
}


export async function updateEquipment(id: string, data: {
    name: string,
    type: string,
    description?: string,
    locationId?: string
}) {
    try {
        const session = await getSession()
        if (!session) return { success: false, error: 'Unauthorized' }
        // if (session.role !== 'ADMIN') return { success: false, error: 'Unauthorized' }

        const equipment = await prisma.equipment.update({
            where: { id },
            data: {
                name: data.name,
                type: data.type,
                description: data.description,
                locationId: data.locationId || null
            }
        })
        revalidatePath('/admin/equipment')
        return { success: true, data: equipment }
    } catch (error) {
        console.error('Error updating equipment:', error)
        return { success: false, error: 'Failed to update equipment' }
    }
}

export async function deleteEquipment(id: string) {
    try {
        const session = await getSession()
        if (!session) return { success: false, error: 'Unauthorized' }
        // if (session.role !== 'ADMIN') return { success: false, error: 'Unauthorized' }

        // Check for active bookings
        const activeBookings = await prisma.equipmentBooking.count({
            where: {
                equipmentId: id,
                status: { in: ['PENDING', 'APPROVED'] }
            }
        })

        if (activeBookings > 0) {
            return { success: false, error: 'لا يمكن حذف الجهاز لوجود حجوزات نشطة عليه' }
        }

        await prisma.equipment.delete({
            where: { id }
        })

        revalidatePath('/admin/equipment')
        return { success: true }
    } catch (error) {
        console.error('Error deleting equipment:', error)
        return { success: false, error: 'Failed to delete equipment' }
    }
}

export async function getAllBookings() {
    try {
        const session = await getSession()
        if (!session) return { success: false, error: 'Unauthorized' }
        // if (session.role !== 'ADMIN') return { success: false, error: 'Unauthorized' }

        const bookings = await prisma.equipmentBooking.findMany({
            include: {
                employee: true,
                equipment: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        return { success: true, data: bookings }
    } catch (error) {
        console.error('Error fetching all bookings:', error)
        return { success: false, error: 'Failed to fetch bookings' }
    }
}
