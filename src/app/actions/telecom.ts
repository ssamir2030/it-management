'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getTelecomServices() {
    try {
        const services = await prisma.telecomService.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                employee: {
                    select: {
                        name: true,
                        department: {
                            select: { name: true }
                        }
                    }
                }
            }
        })
        return { success: true, data: services }
    } catch (error) {
        return { success: false, error: "Failed to fetch telecom services" }
    }
}

export async function deleteTelecomService(id: string) {
    try {
        await prisma.telecomService.delete({
            where: { id }
        })
        revalidatePath('/telecom')
        return { success: true, message: "Service deleted successfully" }
    } catch (error) {
        return { success: false, error: "Failed to delete service" }
    }
}

export async function createTelecomService(formData: FormData) {
    try {
        const type = formData.get('type') as string
        const provider = formData.get('provider') as string
        const accountNumber = formData.get('accountNumber') as string
        const phoneNumber = formData.get('phoneNumber') as string
        const planDetails = formData.get('planDetails') as string
        const cost = parseFloat(formData.get('cost') as string)
        const billingCycle = formData.get('billingCycle') as string
        const employeeId = formData.get('employeeId') as string

        await prisma.telecomService.create({
            data: {
                type,
                provider,
                accountNumber,
                phoneNumber,
                planDetails,
                cost,
                billingCycle,
                employeeId: employeeId || null
            }
        })

        revalidatePath('/telecom')
        return { success: true, message: "Service created successfully" }
    } catch (error) {
        return { success: false, error: "Failed to create service" }
    }

}

export async function getEmployeesForTelecom() {
    try {
        const employees = await prisma.employee.findMany({
            select: {
                id: true,
                name: true,
                department: {
                    select: { name: true }
                }
            },
            orderBy: { name: 'asc' }
        })
        return { success: true, data: employees }
    } catch (error) {
        return { success: false, error: "Failed to fetch employees" }
    }
}
