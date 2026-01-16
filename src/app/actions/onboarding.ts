'use server'

import prisma from "@/lib/prisma"
import { hash } from "bcryptjs"
import { revalidatePath } from "next/cache"

export async function createEmployeeAndAssign(data: any) {
    try {
        const { user, assets, licenses } = data

        // 1. Validation
        if (!user.email || !user.password || !user.name) {
            return { success: false, error: "البيانات الأساسية للموظف ناقصة" }
        }

        const existingEmployee = await prisma.employee.findUnique({
            where: { email: user.email }
        })

        if (existingEmployee) {
            return { success: false, error: "البريد الإلكتروني مسجل لموظف آخر" }
        }

        // 2. Transaction
        const result = await prisma.$transaction(async (tx) => {
            // A. Handle Department (Find or Create simplistic for now, or just leave null if not found)
            // Ideally we should have a Department dropdown from DB. 
            // For now, if department is provided as string, we try to find it by name.
            let departmentId = null
            if (user.department) {
                const dept = await tx.department.findUnique({ where: { name: user.department } })
                if (dept) departmentId = dept.id
            }

            // B. Create Employee
            // Note: Employee model uses 'password' for Portal access.
            const hashedPassword = await hash(user.password, 12)

            // Generate a random identityNumber if not provided (Schema requires unique identityNumber)
            // user.employeeId is passed as "Job ID". We can map it to identityNumber or create a custom field.
            // Looking at schema: identityNumber String @unique. Let's use user.employeeId or generated one.
            const identityNumber = user.employeeId || `EMP-${Date.now()}`

            const newEmployee = await tx.employee.create({
                data: {
                    name: user.name,
                    email: user.email,
                    password: hashedPassword,
                    identityNumber: identityNumber,
                    jobTitle: user.jobTitle,
                    departmentId: departmentId,
                    // Additional fields default or null
                }
            })

            // C. Assign Assets
            if (assets && assets.length > 0) {
                await tx.asset.updateMany({
                    where: { id: { in: assets } },
                    data: {
                        employeeId: newEmployee.id,
                        status: 'IN_USE'
                    }
                })

                // Note: AssetHistory table wasn't visible in my schema read, assuming it might not exist or logic handled elsewhere.
                // If it exists, we should add logs. Skipping for safety unless verified.
            }

            // D. Assign Licenses (Many-to-Many via implicit or explicit relation)
            // Schema: SoftwareLicense { employees Employee[] }
            if (licenses && licenses.length > 0) {
                // We need to connect the licenses to the employee
                // This is a many-to-many relation update
                await tx.employee.update({
                    where: { id: newEmployee.id },
                    data: {
                        softwareLicenses: {
                            connect: licenses.map((id: string) => ({ id }))
                        }
                    }
                })

                // Increment usedSeats for each license
                for (const licId of licenses) {
                    await tx.softwareLicense.update({
                        where: { id: licId },
                        data: { usedSeats: { increment: 1 } }
                    })
                }
            }

            return newEmployee
        })

        // 3. Fetch Full Data for Handover Form
        const fullData = await prisma.employee.findUnique({
            where: { id: result.id },
            include: {
                assets: true,
                softwareLicenses: true,
                department: true
            }
        })

        // Map to expected format for HandoverForm
        const formattedData = {
            ...fullData,
            department: fullData?.department?.name || fullData?.departmentId,
            licenseAssignments: fullData?.softwareLicenses.map((lic: any) => ({
                id: lic.id,
                license: {
                    softwareName: lic.name,
                    key: lic.key
                }
            })) || []
        }

        revalidatePath("/admin/users")
        revalidatePath("/admin/inventory")
        revalidatePath("/admin/licenses")

        return { success: true, data: formattedData }

    } catch (error: any) {
        console.error("Onboarding Error:", error)
        return { success: false, error: error.message || "حدث خطأ أثناء عملية إنشاء الموظف" }
    }
}

export async function getAvailableAssetsAndLicenses() {
    try {
        const [assets, licenses] = await Promise.all([
            prisma.asset.findMany({
                where: { status: 'AVAILABLE' },
                select: { id: true, name: true, tag: true, type: true, model: true }
            }),
            prisma.softwareLicense.findMany({
                // Get all licenses, UI can filter fully used ones
                select: { id: true, key: true, name: true, seats: true, usedSeats: true }
            })
        ])

        // Map to match UI expectations
        const mappedLicenses = licenses.map(l => ({
            id: l.id,
            key: l.key,
            softwareName: l.name, // Map 'name' to 'softwareName'
            totalCount: l.seats,  // Map 'seats' to 'totalCount'
            usedCount: l.usedSeats
        }))

        return { success: true, assets, licenses: mappedLicenses }
    } catch (error) {
        console.error("Fetch Data Error:", error)
        return { success: false, error: "فشل جلب البيانات المتاحة (تأكد من قاعدة البيانات)" }
    }
}
