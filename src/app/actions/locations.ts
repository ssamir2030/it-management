'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getLocations() {
    try {
        const locations = await prisma.location.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: {
                        employees: true,
                        assets: true
                    }
                }
            }
        })
        return { success: true, data: locations }
    } catch (error) {
        return { success: false, error: "Failed to fetch locations" }
    }
}

export async function createLocation(formData: FormData) {
    try {
        const name = formData.get('name') as string
        const address = formData.get('address') as string

        await prisma.location.create({
            data: {
                name,
                address,
                googleMapsUrl: formData.get('googleMapsUrl') as string,
                latitude: formData.get('latitude') ? parseFloat(formData.get('latitude') as string) : null,
                longitude: formData.get('longitude') ? parseFloat(formData.get('longitude') as string) : null
            }
        })

        revalidatePath('/locations')
        return { success: true, message: "Location created successfully" }
    } catch (error) {
        return { success: false, error: "Failed to create location" }
    }
}

export async function updateLocation(id: string, formData: FormData) {
    try {
        const name = formData.get('name') as string
        const address = formData.get('address') as string
        const googleMapsUrl = formData.get('googleMapsUrl') as string
        const latitude = formData.get('latitude') ? parseFloat(formData.get('latitude') as string) : null
        const longitude = formData.get('longitude') ? parseFloat(formData.get('longitude') as string) : null

        await prisma.location.update({
            where: { id },
            data: {
                name,
                address,
                googleMapsUrl,
                latitude,
                longitude
            }
        })

        revalidatePath('/locations')
        return { success: true, message: "تم تحديث الموقع بنجاح" }
    } catch (error) {
        return { success: false, error: "فشل تحديث الموقع" }
    }
}

export async function deleteLocation(id: string) {
    try {
        // Check if location has related records
        const location = await prisma.location.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        employees: true,
                        assets: true
                    }
                }
            }
        })

        if (location && (location._count.employees > 0 || location._count.assets > 0)) {
            return { success: false, error: "لا يمكن حذف الموقع لأنه مرتبط بموظفين أو أصول" }
        }

        await prisma.location.delete({
            where: { id }
        })

        revalidatePath('/locations')
        return { success: true, message: "تم حذف الموقع بنجاح" }
    } catch (error) {
        return { success: false, error: "فشل حذف الموقع" }
    }
}
