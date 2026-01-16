'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'employee_portal_session'

// الحصول على جميع القاعات
export async function getMeetingRooms() {
    try {
        const rooms = await prisma.meetingRoom.findMany({
            where: {
                isActive: true
            },
            orderBy: {
                name: 'asc'
            }
        })

        return { success: true, data: rooms }
    } catch (error) {
        console.error('Error fetching meeting rooms:', error)
        return { success: false, error: 'فشل في جلب القاعات' }
    }
}

// الحصول على قاعة محددة
export async function getMeetingRoomById(roomId: string) {
    try {
        const room = await prisma.meetingRoom.findUnique({
            where: { id: roomId },
            include: {
                bookings: {
                    where: {
                        status: {
                            in: ['PENDING', 'APPROVED']
                        },
                        endTime: {
                            gte: new Date()
                        }
                    },
                    orderBy: {
                        startTime: 'asc'
                    }
                }
            }
        })

        if (!room) {
            return { success: false, error: 'القاعة غير موجودة' }
        }

        return { success: true, data: room }
    } catch (error) {
        console.error('Error fetching room:', error)
        return { success: false, error: 'فشل في جلب بيانات القاعة' }
    }
}

// التحقق من توفر القاعة في وقت معين
export async function checkRoomAvailability(
    roomId: string,
    startTime: Date,
    endTime: Date,
    excludeBookingId?: string
) {
    try {
        const conflictingBookings = await prisma.roomBooking.findMany({
            where: {
                roomId,
                status: {
                    in: ['PENDING', 'APPROVED']
                },
                id: excludeBookingId ? { not: excludeBookingId } : undefined,
                OR: [
                    {
                        // الحجز الجديد يبدأ خلال حجز موجود
                        AND: [
                            { startTime: { lte: startTime } },
                            { endTime: { gt: startTime } }
                        ]
                    },
                    {
                        // الحجز الجديد ينتهي خلال حجز موجود
                        AND: [
                            { startTime: { lt: endTime } },
                            { endTime: { gte: endTime } }
                        ]
                    },
                    {
                        // الحجز الجديد يغطي حجز موجود بالكامل
                        AND: [
                            { startTime: { gte: startTime } },
                            { endTime: { lte: endTime } }
                        ]
                    }
                ]
            }
        })

        return {
            success: true,
            isAvailable: conflictingBookings.length === 0,
            conflictingBookings
        }
    } catch (error) {
        console.error('Error checking availability:', error)
        return { success: false, error: 'فشل في التحقق من التوفر' }
    }
}

// إنشاء حجز جديد
export async function createRoomBooking(data: {
    roomId: string
    title: string
    description?: string
    startTime: Date
    endTime: Date
    meetingType: 'PHYSICAL' | 'ONLINE' | 'HYBRID'
    onlineMeetingUrl?: string
    onlineMeetingId?: string
    onlineMeetingPassword?: string
    attendees?: string[]
    notes?: string
}) {
    const employeeId = cookies().get(COOKIE_NAME)?.value

    if (!employeeId) {
        return { success: false, error: 'غير مصرح لك' }
    }

    try {
        // التحقق من صحة الأوقات
        if (data.startTime >= data.endTime) {
            return { success: false, error: 'وقت البداية يجب أن يكون قبل وقت النهاية' }
        }

        if (data.startTime < new Date()) {
            return { success: false, error: 'لا يمكن الحجز في الماضي' }
        }

        // التحقق من توفر القاعة
        const availability = await checkRoomAvailability(
            data.roomId,
            data.startTime,
            data.endTime
        )

        if (!availability.isAvailable) {
            return { success: false, error: 'القاعة محجوزة في هذا الوقت' }
        }

        // التحقق من سعة القاعة
        const room = await prisma.meetingRoom.findUnique({
            where: { id: data.roomId }
        })

        if (!room) {
            return { success: false, error: 'القاعة غير موجودة' }
        }

        const attendeesCount = data.attendees?.length || 0
        if (attendeesCount > room.capacity) {
            return {
                success: false,
                error: `عدد المشاركين (${attendeesCount}) يتجاوز سعة القاعة (${room.capacity})`
            }
        }

        // إنشاء الحجز
        const booking = await prisma.roomBooking.create({
            data: {
                roomId: data.roomId,
                employeeId,
                title: data.title,
                description: data.description,
                startTime: data.startTime,
                endTime: data.endTime,
                meetingType: data.meetingType,
                onlineMeetingUrl: data.onlineMeetingUrl,
                onlineMeetingId: data.onlineMeetingId,
                onlineMeetingPassword: data.onlineMeetingPassword,
                attendees: data.attendees ? JSON.stringify(data.attendees) : null,
                attendeesCount: attendeesCount,
                notes: data.notes,
                status: 'APPROVED' // يمكن تغييرها إلى PENDING إذا كنت تريد موافقة الأدمن
            }
        })

        revalidatePath('/portal/bookings')
        revalidatePath('/portal/rooms')

        return { success: true, data: booking }
    } catch (error) {
        console.error('Error creating booking:', error)
        return { success: false, error: 'فشل في إنشاء الحجز' }
    }
}

// الحصول على حجوزات الموظف
export async function getMyBookings() {
    const employeeId = cookies().get(COOKIE_NAME)?.value

    if (!employeeId) {
        return { success: false, error: 'غير مصرح لك' }
    }

    try {
        const bookings = await prisma.roomBooking.findMany({
            where: {
                employeeId,
                status: {
                    not: 'CANCELLED'
                }
            },
            include: {
                room: true
            },
            orderBy: {
                startTime: 'desc'
            }
        })

        return { success: true, data: bookings }
    } catch (error) {
        console.error('Error fetching bookings:', error)
        return { success: false, error: 'فشل في جلب الحجوزات' }
    }
}

// الحصول على جميع الحجوزات لتقويم محدد
export async function getBookingsByDateRange(startDate: Date, endDate: Date) {
    try {
        const bookings = await prisma.roomBooking.findMany({
            where: {
                status: {
                    in: ['PENDING', 'APPROVED']
                },
                startTime: {
                    gte: startDate,
                    lte: endDate
                }
            },
            include: {
                room: true,
                employee: {
                    select: {
                        name: true,
                        department: true
                    }
                }
            },
            orderBy: {
                startTime: 'asc'
            }
        })

        return { success: true, data: bookings }
    } catch (error) {
        console.error('Error fetching bookings:', error)
        return { success: false, error: 'فشل في جلب الحجوزات' }
    }
}

// تحديث حجز
export async function updateRoomBooking(
    bookingId: string,
    data: {
        title?: string
        description?: string
        startTime?: Date
        endTime?: Date
        attendees?: string[]
        notes?: string
    }
) {
    const employeeId = cookies().get(COOKIE_NAME)?.value

    if (!employeeId) {
        return { success: false, error: 'غير مصرح لك' }
    }

    try {
        const booking = await prisma.roomBooking.findUnique({
            where: { id: bookingId }
        })

        if (!booking) {
            return { success: false, error: 'الحجز غير موجود' }
        }

        if (booking.employeeId !== employeeId) {
            return { success: false, error: 'غير مصرح لك بتعديل هذا الحجز' }
        }

        if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED') {
            return { success: false, error: 'لا يمكن تعديل هذا الحجز' }
        }

        // التحقق من توفر القاعة إذا تم تغيير الأوقات
        if (data.startTime || data.endTime) {
            const newStartTime = data.startTime || booking.startTime
            const newEndTime = data.endTime || booking.endTime

            const availability = await checkRoomAvailability(
                booking.roomId,
                newStartTime,
                newEndTime,
                bookingId
            )

            if (!availability.isAvailable) {
                return { success: false, error: 'القاعة محجوزة في الوقت الجديد' }
            }
        }

        const updatedBooking = await prisma.roomBooking.update({
            where: { id: bookingId },
            data: {
                title: data.title,
                description: data.description,
                startTime: data.startTime,
                endTime: data.endTime,
                attendees: data.attendees ? JSON.stringify(data.attendees) : undefined,
                attendeesCount: data.attendees?.length,
                notes: data.notes
            }
        })

        revalidatePath('/portal/bookings')
        revalidatePath('/portal/rooms')

        return { success: true, data: updatedBooking }
    } catch (error) {
        console.error('Error updating booking:', error)
        return { success: false, error: 'فشل في تحديث الحجز' }
    }
}

// إلغاء حجز
export async function cancelRoomBooking(bookingId: string) {
    const employeeId = cookies().get(COOKIE_NAME)?.value

    if (!employeeId) {
        return { success: false, error: 'غير مصرح لك' }
    }

    try {
        const booking = await prisma.roomBooking.findUnique({
            where: { id: bookingId }
        })

        if (!booking) {
            return { success: false, error: 'الحجز غير موجود' }
        }

        if (booking.employeeId !== employeeId) {
            return { success: false, error: 'غير مصرح لك بإلغاء هذا الحجز' }
        }

        if (booking.status === 'CANCELLED') {
            return { success: false, error: 'الحجز ملغي مسبقاً' }
        }

        if (booking.status === 'COMPLETED') {
            return { success: false, error: 'لا يمكن إلغاء حجز مكتمل' }
        }

        await prisma.roomBooking.update({
            where: { id: bookingId },
            data: {
                status: 'CANCELLED'
            }
        })

        revalidatePath('/portal/bookings')
        revalidatePath('/portal/rooms')

        return { success: true }
    } catch (error) {
        console.error('Error cancelling booking:', error)
        return { success: false, error: 'فشل في إلغاء الحجز' }
    }
}
