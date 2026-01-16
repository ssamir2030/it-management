'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getAdminBookings() {
    try {
        const bookings = await prisma.roomBooking.findMany({
            include: {
                room: true,
                employee: {
                    select: {
                        name: true,
                        department: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                startTime: 'desc'
            }
        })

        return { success: true, data: bookings }
    } catch (error) {
        console.error('Error fetching admin bookings:', error)
        return { success: false, error: 'فشل في جلب الحجوزات' }
    }
}

export async function updateBookingMeetingDetails(
    bookingId: string,
    data: {
        onlineMeetingUrl?: string
        onlineMeetingId?: string
        onlineMeetingPassword?: string
    }
) {
    try {
        const booking = await prisma.roomBooking.update({
            where: { id: bookingId },
            data: {
                onlineMeetingUrl: data.onlineMeetingUrl,
                onlineMeetingId: data.onlineMeetingId,
                onlineMeetingPassword: data.onlineMeetingPassword,
            }
        })

        if (data.onlineMeetingUrl) {
            const { notifyOnlineMeetingDetailsAdded } = await import('@/app/actions/employee-notifications')
            await notifyOnlineMeetingDetailsAdded(booking.employeeId, booking.title, booking.id)
        }

        revalidatePath('/admin/bookings')
        revalidatePath('/portal/bookings/my')
        return { success: true }
    } catch (error) {
        console.error('Error updating booking details:', error)
        return { success: false, error: 'فشل في تحديث تفاصيل الاجتماع' }
    }
}

export async function updateBookingStatus(bookingId: string, status: string) {
    try {
        await prisma.roomBooking.update({
            where: { id: bookingId },
            data: { status }
        })

        revalidatePath('/admin/bookings')
        revalidatePath('/portal/bookings/my')
        return { success: true }
    } catch (error) {
        console.error('Error updating booking status:', error)
        return { success: false, error: 'فشل في تحديث حالة الحجز' }
    }
}

// Delete a booking
export async function deleteBooking(bookingId: string) {
    try {
        await prisma.roomBooking.delete({
            where: { id: bookingId }
        })

        revalidatePath('/admin/bookings')
        revalidatePath('/portal/bookings/my')
        return { success: true }
    } catch (error) {
        console.error('Error deleting booking:', error)
        return { success: false, error: 'فشل في حذف الحجز' }
    }
}

// Archive past bookings - change status to COMPLETED for meetings that have ended
export async function archivePastBookings() {
    try {
        const now = new Date()

        const result = await prisma.roomBooking.updateMany({
            where: {
                endTime: { lt: now },
                status: { notIn: ['COMPLETED', 'CANCELLED'] }
            },
            data: {
                status: 'COMPLETED'
            }
        })

        revalidatePath('/admin/bookings')
        return { success: true, archivedCount: result.count }
    } catch (error) {
        console.error('Error archiving past bookings:', error)
        return { success: false, error: 'فشل في أرشفة الاجتماعات المنتهية' }
    }
}

// Get archived/completed bookings for report
export async function getArchivedBookings() {
    try {
        const bookings = await prisma.roomBooking.findMany({
            where: {
                status: 'COMPLETED'
            },
            include: {
                room: true,
                employee: {
                    select: {
                        name: true,
                        email: true,
                        department: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                startTime: 'desc'
            }
        })

        return { success: true, data: bookings }
    } catch (error) {
        console.error('Error fetching archived bookings:', error)
        return { success: false, error: 'فشل في جلب الاجتماعات المؤرشفة' }
    }
}
