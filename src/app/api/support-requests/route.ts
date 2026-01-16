import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const supportRequests = await prisma.employeeRequest.findMany({
            where: {
                type: 'SUPPORT' // فقط طلبات الدعم الفني
            },
            include: {
                employee: {
                    select: {
                        name: true,
                        email: true,
                        phone: true,
                        department: {
                            select: { name: true }
                        },
                        identityNumber: true
                    }
                },
                timeline: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json({ success: true, data: supportRequests })
    } catch (error) {
        console.error("Error fetching support requests:", error)
        return NextResponse.json(
            { success: false, error: "فشل جلب طلبات الدعم الفني" },
            { status: 500 }
        )
    }
}
