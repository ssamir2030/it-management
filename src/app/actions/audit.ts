'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getCurrentEmployee } from '@/app/actions/employee-portal'

export async function getEmployeeAssetsForAudit() {
    try {
        const employee = await getCurrentEmployee()
        if (!employee) return { success: false, error: "Unauthorized" }

        const assets = await prisma.asset.findMany({
            where: {
                employeeId: employee.id,
                status: 'ASSIGNED', // Only assigned assets
            },
            include: {
                audits: {
                    orderBy: { auditDate: 'desc' },
                    take: 1
                }
            }
        })

        return { success: true, data: assets }
    } catch (error) {
        console.error(error)
        return { success: false, error: "Failed to fetch assets" }
    }
}

export async function submitAssetAudit(assetId: string, status: 'VERIFIED' | 'MISSING' | 'DAMAGED', notes?: string) {
    try {
        const employee = await getCurrentEmployee()
        if (!employee) return { success: false, error: "Unauthorized" }

        // Verify asset belongs to employee
        const asset = await prisma.asset.findUnique({
            where: { id: assetId }
        })

        if (!asset || asset.employeeId !== employee.id) {
            return { success: false, error: "Asset not found or not assigned to you" }
        }

        await prisma.assetAudit.create({
            data: {
                assetId,
                status,
                notes,
            }
        })

        // Auto-create ticket if missing or damaged
        if (status === 'MISSING' || status === 'DAMAGED') {
            await prisma.ticket.create({
                data: {
                    title: `تقرير أصل ${status === 'MISSING' ? 'مفقود' : 'تالف'}: ${asset.name} (${asset.tag})`,
                    description: `قام الموظف بالإبلاغ عن الأصل كـ ${status === 'MISSING' ? 'مفقود' : 'تالف'} أثناء الجرد الذاتي.\n\nملاحظات: ${notes || 'لا يوجد'}\nالأصل: ${asset.name} - ${asset.tag}`,
                    category: 'HARDWARE',
                    priority: 'HIGH',
                    employeeId: employee.id,
                    employeeName: employee.name,
                    employeeEmail: employee.email,
                    status: 'OPEN'
                }
            })
        }

        revalidatePath('/portal/my-assets/audit')
        return { success: true }
    } catch (error) {
        console.error(error)
        return { success: false, error: "Failed to submit audit" }
    }
}
