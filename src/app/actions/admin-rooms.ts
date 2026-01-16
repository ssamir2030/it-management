'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const roomSchema = z.object({
    name: z.string().min(1, 'اسم القاعة مطلوب'),
    nameEn: z.string().optional(),
    description: z.string().optional(),
    location: z.string().min(1, 'الموقع مطلوب'),
    capacity: z.coerce.number().min(1, 'السعة يجب أن تكون 1 على الأقل'),
    floor: z.string().optional(),
    hasProjector: z.boolean().optional(),
    hasWhiteboard: z.boolean().optional(),
    hasVideoConf: z.boolean().optional(),
    hasScreen: z.boolean().optional(),
    hasSoundSystem: z.boolean().optional(),
    hasWifi: z.boolean().optional(),
    hasAirConditioning: z.boolean().optional(),
    isActive: z.boolean().optional(),
    isAvailable: z.boolean().optional(),
    notes: z.string().optional(),
})

export async function createMeetingRoom(formData: FormData) {
    try {
        const data = {
            name: formData.get('name'),
            nameEn: formData.get('nameEn'),
            description: formData.get('description'),
            location: formData.get('location'),
            capacity: formData.get('capacity'),
            floor: formData.get('floor'),
            hasProjector: formData.get('hasProjector') === 'on',
            hasWhiteboard: formData.get('hasWhiteboard') === 'on',
            hasVideoConf: formData.get('hasVideoConf') === 'on',
            hasScreen: formData.get('hasScreen') === 'on',
            hasSoundSystem: formData.get('hasSoundSystem') === 'on',
            hasWifi: formData.get('hasWifi') === 'on',
            hasAirConditioning: formData.get('hasAirConditioning') === 'on',
            isActive: formData.get('isActive') === 'on',
            isAvailable: formData.get('isAvailable') === 'on',
            notes: formData.get('notes'),
        }

        const validated = roomSchema.parse(data)

        await prisma.meetingRoom.create({
            data: {
                ...validated,
                nameEn: validated.nameEn || null,
                description: validated.description || null,
                floor: validated.floor || null,
                notes: validated.notes || null,
            }
        })

        revalidatePath('/admin/rooms')
        revalidatePath('/portal/bookings/new')
        return { success: true }
    } catch (error) {
        console.error('Error creating room:', error)
        return { success: false, error: 'فشل في إنشاء القاعة' }
    }
}

export async function updateMeetingRoom(id: string, formData: FormData) {
    try {
        const data = {
            name: formData.get('name'),
            nameEn: formData.get('nameEn'),
            description: formData.get('description'),
            location: formData.get('location'),
            capacity: formData.get('capacity'),
            floor: formData.get('floor'),
            hasProjector: formData.get('hasProjector') === 'on',
            hasWhiteboard: formData.get('hasWhiteboard') === 'on',
            hasVideoConf: formData.get('hasVideoConf') === 'on',
            hasScreen: formData.get('hasScreen') === 'on',
            hasSoundSystem: formData.get('hasSoundSystem') === 'on',
            hasWifi: formData.get('hasWifi') === 'on',
            hasAirConditioning: formData.get('hasAirConditioning') === 'on',
            isActive: formData.get('isActive') === 'on',
            isAvailable: formData.get('isAvailable') === 'on',
            notes: formData.get('notes'),
        }

        const validated = roomSchema.parse(data)

        await prisma.meetingRoom.update({
            where: { id },
            data: {
                ...validated,
                nameEn: validated.nameEn || null,
                description: validated.description || null,
                floor: validated.floor || null,
                notes: validated.notes || null,
            }
        })

        revalidatePath('/admin/rooms')
        revalidatePath('/portal/bookings/new')
        return { success: true }
    } catch (error) {
        console.error('Error updating room:', error)
        return { success: false, error: 'فشل في تحديث القاعة' }
    }
}

export async function deleteMeetingRoom(id: string) {
    try {
        await prisma.meetingRoom.delete({
            where: { id }
        })

        revalidatePath('/admin/rooms')
        revalidatePath('/portal/bookings/new')
        return { success: true }
    } catch (error) {
        console.error('Error deleting room:', error)
        return { success: false, error: 'فشل في حذف القاعة' }
    }
}

export async function getAdminMeetingRooms() {
    try {
        const rooms = await prisma.meetingRoom.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return { success: true, data: rooms }
    } catch (error) {
        console.error('Error fetching rooms:', error)
        return { success: false, error: 'فشل في جلب القاعات' }
    }
}
