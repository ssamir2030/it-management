'use server'

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import * as XLSX from 'xlsx'

export async function importEmployees(formData: FormData) {
    try {
        const file = formData.get("file") as File
        if (!file) {
            return { success: false, error: "لم يتم اختيار ملف" }
        }

        const buffer = await file.arrayBuffer()
        const workbook = XLSX.read(buffer, { type: "buffer" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        let successCount = 0
        let errorCount = 0
        let skippedCount = 0

        // Default password for imported employees (123456)
        const { hashPassword } = await import("@/lib/password")
        const defaultPassword = await hashPassword('123456')

        for (const row of jsonData as any[]) {
            try {
                // Map columns based on Arabic headers from export
                const name = row['الاسم']
                const identityNumber = row['رقم الهوية']?.toString()
                const email = row['البريد الإلكتروني']
                const phone = row['الهاتف']?.toString()
                const jobTitle = row['المسمى الوظيفي']
                const departmentName = row['الإدارة']
                const locationName = row['الموقع']

                if (!name || !identityNumber || !email) {
                    console.log("Skipping row due to missing fields:", row)
                    errorCount++
                    continue
                }

                // Find department
                let departmentId = undefined
                if (departmentName && departmentName !== '-') {
                    const dept = await prisma.department.findFirst({
                        where: { name: departmentName }
                    })
                    if (dept) {
                        departmentId = dept.id
                    }
                }

                // Find location
                let locationId = undefined
                if (locationName && locationName !== '-') {
                    const loc = await prisma.location.findFirst({
                        where: { name: locationName }
                    })
                    if (loc) {
                        locationId = loc.id
                    }
                }

                // Check if employee exists
                const existingEmployee = await prisma.employee.findFirst({
                    where: {
                        OR: [
                            { identityNumber },
                            { email }
                        ]
                    }
                })

                if (existingEmployee) {
                    // If employee exists but is soft-deleted, restore them
                    if (existingEmployee.deletedAt) {
                        await prisma.employee.update({
                            where: { id: existingEmployee.id },
                            data: {
                                deletedAt: null,
                                name,
                                phone,
                                jobTitle,
                                departmentId: departmentId || undefined,
                                locationId: locationId || undefined,
                            }
                        })
                        successCount++
                    } else {
                        skippedCount++
                    }
                    continue
                }

                // Create employee
                await prisma.employee.create({
                    data: {
                        name,
                        identityNumber,
                        email,
                        phone,
                        jobTitle,
                        departmentId,
                        locationId,
                        password: defaultPassword
                    }
                })
                successCount++
            } catch (error) {
                console.error("Error importing row:", row, error)
                errorCount++
            }
        }

        revalidatePath('/employees')

        let message = `تم استيراد ${successCount} موظف بنجاح.`
        if (skippedCount > 0) message += ` تم تخطي ${skippedCount} موظف موجود مسبقاً.`
        if (errorCount > 0) message += ` فشل استيراد ${errorCount} صف.`

        return {
            success: true,
            message
        }

    } catch (error) {
        console.error("Import error:", error)
        return { success: false, error: "حدث خطأ أثناء معالجة الملف" }
    }
}
