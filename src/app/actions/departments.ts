'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getDepartments() {
    try {
        // We need to fetch all employees to count them per department since there is no direct relation in schema yet
        // Or we can update schema to have relation. 
        // Looking at schema: Employee has 'department' String field, not a relation to Department model.
        // So we have to group by department string.

        const departments = await prisma.department.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { employees: true }
                }
            }
        })

        const departmentsWithCounts = departments.map(dept => ({
            ...dept,
            employeeCount: dept._count.employees
        }))

        return { success: true, data: departmentsWithCounts }
    } catch (error) {
        return { success: false, error: "Failed to fetch departments" }
    }
}

export async function getDepartmentById(id: string) {
    try {
        const department = await prisma.department.findUnique({
            where: { id }
        })
        return { success: true, data: department }
    } catch (error) {
        return { success: false, error: "Failed to fetch department" }
    }
}

export async function createDepartment(formData: FormData) {
    try {
        const name = formData.get('name') as string
        const managerName = formData.get('managerName') as string
        const description = formData.get('description') as string

        await prisma.department.create({
            data: {
                name,
                managerName,
                description,
            }
        })

        revalidatePath('/departments')
        return { success: true, message: "Department created successfully" }
    } catch (error) {
        return { success: false, error: "Failed to create department" }
    }
}

export async function updateDepartment(id: string, formData: FormData) {
    try {
        const name = formData.get('name') as string
        const managerName = formData.get('managerName') as string
        const description = formData.get('description') as string

        await prisma.department.update({
            where: { id },
            data: {
                name,
                managerName,
                description,
            }
        })

        revalidatePath('/departments')
        revalidatePath(`/departments/${id}`)
        return { success: true, message: "Department updated successfully" }
    } catch (error) {
        return { success: false, error: "Failed to update department" }
    }
}

export async function deleteDepartment(id: string) {
    try {
        await prisma.department.delete({
            where: { id }
        })
        revalidatePath('/departments')
        return { success: true, message: "Department deleted successfully" }
    } catch (error) {
        return { success: false, error: "Failed to delete department" }
    }
}
