import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const requests = await prisma.employeeRequest.findMany({
            where: {
                type: { not: 'SUPPORT' } // استبعاد طلبات الدعم الفني
            },
            include: {
                employee: {
                    select: {
                        name: true,
                        department: {
                            select: { name: true }
                        },
                        identityNumber: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json({ success: true, data: requests })
    } catch (error) {
        console.error("Error fetching requests:", error)
        return NextResponse.json(
            { success: false, error: "فشل جلب الطلبات" },
            { status: 500 }
        )
    }
}
