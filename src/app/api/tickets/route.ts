import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')
        const limit = parseInt(searchParams.get('limit') || '50')
        const page = parseInt(searchParams.get('page') || '1')

        const where: any = {}

        if (status) {
            where.status = status
        }

        const [tickets, total, openCount] = await Promise.all([
            prisma.supportTicket.findMany({
                where,
                include: {
                    employee: {
                        select: { id: true, name: true }
                    },
                    assignedTo: {
                        select: { id: true, name: true }
                    }
                },
                take: limit,
                skip: (page - 1) * limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.supportTicket.count({ where }),
            prisma.supportTicket.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } })
        ])

        return NextResponse.json({
            success: true,
            data: {
                tickets,
                total,
                open: openCount,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        })

    } catch (error) {
        console.error('Tickets API error:', error)
        return NextResponse.json(
            { success: false, error: 'حدث خطأ في الخادم' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { title, description, priority, employeeId } = body

        if (!title) {
            return NextResponse.json(
                { success: false, error: 'عنوان التذكرة مطلوب' },
                { status: 400 }
            )
        }

        const ticket = await prisma.supportTicket.create({
            data: {
                title,
                description: description || '',
                priority: priority || 'MEDIUM',
                status: 'OPEN',
                employeeId: employeeId || null,
            },
            include: {
                employee: {
                    select: { id: true, name: true }
                }
            }
        })

        return NextResponse.json({
            success: true,
            data: ticket
        })

    } catch (error) {
        console.error('Create ticket error:', error)
        return NextResponse.json(
            { success: false, error: 'حدث خطأ في إنشاء التذكرة' },
            { status: 500 }
        )
    }
}
