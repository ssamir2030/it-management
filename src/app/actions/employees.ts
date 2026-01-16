'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { logAction } from "@/lib/audit"

export async function getEmployees() {
    try {
        const employees = await prisma.employee.findMany({
            where: { deletedAt: null },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { assets: true }
                },
                department: {
                    select: { name: true }
                }
            }
        })
        return { success: true, data: employees }
    } catch (error) {
        return { success: false, error: "Failed to fetch employees" }
    }
}

export async function getEmployeeById(id: string) {
    try {
        const employee = await prisma.employee.findFirst({
            where: {
                id,
                deletedAt: null
            }
        })
        return { success: true, data: employee }
    } catch (error) {
        return { success: false, error: "Failed to fetch employee" }
    }
}

export async function createEmployee(formData: FormData) {
    try {
        const name = formData.get('name') as string
        const identityNumber = formData.get('identityNumber') as string
        const email = formData.get('email') as string
        const password = formData.get('password') as string
        const phone = formData.get('phone') as string
        const jobTitle = formData.get('jobTitle') as string
        const departmentId = formData.get('departmentId') as string
        const locationId = formData.get('locationId') as string

        // Check for existing employee (including soft-deleted)
        const existingEmployee = await prisma.employee.findFirst({
            where: {
                OR: [
                    { identityNumber },
                    { email }
                ]
            }
        })

        if (existingEmployee) {
            if (existingEmployee.deletedAt) {
                // Restore logic
                const { hashPassword } = await import("@/lib/password")
                const hashedPassword = await hashPassword(password)

                const restoredEmployee = await prisma.employee.update({
                    where: { id: existingEmployee.id },
                    data: {
                        deletedAt: null,
                        name,
                        identityNumber,
                        email,
                        password: hashedPassword,
                        phone,
                        jobTitle,
                        departmentId: departmentId || undefined,
                        locationId: locationId || undefined
                    }
                })

                await logAction({
                    action: 'CREATE',
                    entityType: 'EMPLOYEE',
                    entityId: restoredEmployee.id,
                    entityName: name,
                    changes: { status: 'RESTORED', jobTitle, departmentId }
                })

                revalidatePath('/employees')
                return { success: true, message: "تم استعادة الموظف بنجاح" }
            } else {
                return { success: false, error: "الموظف موجود بالفعل (رقم الهوية أو البريد الإلكتروني)" }
            }
        }

        // Hash password
        const { hashPassword } = await import("@/lib/password")
        const hashedPassword = await hashPassword(password)

        const employee = await prisma.employee.create({
            data: {
                name,
                identityNumber,
                email,
                password: hashedPassword,
                phone,
                jobTitle,
                departmentId: departmentId || undefined,
                locationId: locationId || undefined
            }
        })

        await logAction({
            action: 'CREATE',
            entityType: 'EMPLOYEE',
            entityId: employee.id,
            entityName: name,
            changes: { identityNumber, email, jobTitle, departmentId }
        })

        revalidatePath('/employees')
        return { success: true, message: "Employee created successfully" }
    } catch (error) {
        console.error("Create employee error:", error)
        return { success: false, error: `فشل إنشاء الموظف: ${error instanceof Error ? error.message : String(error)}` }
    }
}

export async function updateEmployee(id: string, formData: FormData) {
    try {
        const name = formData.get('name') as string
        const identityNumber = formData.get('identityNumber') as string
        const email = formData.get('email') as string
        const phone = formData.get('phone') as string
        const jobTitle = formData.get('jobTitle') as string
        const departmentId = formData.get('departmentId') as string
        const locationId = formData.get('locationId') as string
        const password = formData.get('password') as string

        const updateData: any = {
            name,
            identityNumber,
            email,
            phone,
            jobTitle,
            departmentId: departmentId || undefined,
            locationId: locationId || undefined
        }

        if (password && password.trim() !== '') {
            const { hashPassword } = await import("@/lib/password")
            updateData.password = await hashPassword(password)
        }

        const updatedEmployee = await prisma.employee.update({
            where: { id },
            data: updateData
        })

        await logAction({
            action: 'UPDATE',
            entityType: 'EMPLOYEE',
            entityId: id,
            entityName: name,
            changes: { jobTitle, departmentId, locationId }
        })

        revalidatePath('/employees')
        revalidatePath(`/employees/${id}`)
        return { success: true, message: "Employee updated successfully" }
    } catch (error) {
        return { success: false, error: "Failed to update employee" }
    }
}

export async function deleteEmployee(id: string) {
    try {
        const employee = await prisma.employee.findUnique({
            where: { id },
            select: { name: true }
        })

        await prisma.employee.update({
            where: { id },
            data: {
                deletedAt: new Date()
            }
        })

        await logAction({
            action: 'DELETE',
            entityType: 'EMPLOYEE',
            entityId: id,
            entityName: employee?.name || 'Unknown'
        })

        revalidatePath('/employees')
        return { success: true, message: "Employee deleted successfully" }
    } catch (error) {
        console.error("Delete employee error:", error)
        return { success: false, error: "Failed to delete employee" }
    }
}
