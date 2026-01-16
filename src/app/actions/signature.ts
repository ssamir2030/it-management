'use server'

import { getCurrentEmployee } from '@/app/actions/employee-portal'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function saveEmployeeSignature(signature: string) {
    try {
        const currentEmployee = await getCurrentEmployee()

        if (!currentEmployee) {
            return { success: false, error: 'يجب تسجيل الدخول أولاً' }
        }

        await prisma.employee.update({
            where: { id: currentEmployee.id },
            data: { signature }
        })

        revalidatePath('/portal/profile')
        revalidatePath('/portal/my-assets')
        revalidatePath('/portal/my-assets/download-report')

        return { success: true }
    } catch (error) {
        console.error('Error saving signature:', error)
        return { success: false, error: 'فشل حفظ التوقيع' }
    }
}

export async function getEmployeeSignature() {
    try {
        const currentEmployee = await getCurrentEmployee()

        if (!currentEmployee) {
            return { success: false, error: 'يجب تسجيل الدخول أولاً' }
        }

        const employee = await prisma.employee.findUnique({
            where: { id: currentEmployee.id },
            select: { signature: true }
        })

        if (!employee) {
            return { success: false, error: 'لم يتم العثور على بيانات الموظف' }
        }

        return { success: true, signature: employee.signature }
    } catch (error) {
        console.error('Error getting signature:', error)
        return { success: false, error: 'فشل جلب التوقيع' }
    }
}
