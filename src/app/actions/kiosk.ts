'use server'

import prisma from '@/lib/prisma'

export async function submitKioskRequest(data: {
    type: string
    employeeIdentifier: string
    description?: string
}) {
    try {
        // Find employee by email or name
        const employee = await prisma.employee.findFirst({
            where: {
                OR: [
                    { email: { contains: data.employeeIdentifier } },
                    { name: { contains: data.employeeIdentifier } }
                ]
            }
        })

        if (!employee) {
            return { success: false, error: 'لم يتم العثور على الموظف' }
        }

        if (data.type === 'SUPPORT') {
            // Create support ticket
            await prisma.ticket.create({
                data: {
                    title: 'طلب من الكشك الذاتي',
                    description: data.description || 'طلب دعم فني من الكشك',
                    status: 'OPEN',
                    priority: 'MEDIUM',
                    employeeId: employee.id,
                    employeeName: employee.name
                }
            })
        } else if (data.type === 'CONSUMABLE') {
            // Create consumable request
            await prisma.employeeRequest.create({
                data: {
                    employeeId: employee.id,
                    type: 'CONSUMABLE',
                    subject: 'طلب مستلزمات من الكشك',
                    details: data.description || 'طلب مستلزمات',
                    status: 'PENDING',
                    priority: 'MEDIUM'
                }
            })
        } else if (data.type === 'RETURN') {
            // Create return request
            await prisma.employeeRequest.create({
                data: {
                    employeeId: employee.id,
                    type: 'RETURN',
                    subject: 'طلب إرجاع عهدة من الكشك',
                    details: data.description || 'طلب إرجاع عهدة',
                    status: 'PENDING',
                    priority: 'MEDIUM'
                }
            })
        }

        return { success: true }
    } catch (error) {
        console.error('Kiosk error:', error)
        return { success: false, error: 'حدث خطأ في النظام' }
    }
}
