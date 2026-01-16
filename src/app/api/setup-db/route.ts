import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { hash } from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (key !== 'setup123') {
        return NextResponse.json({ error: 'Invalid key' }, { status: 401 })
    }

    try {
        const results = []

        // 1. Create Admin User
        const password = await hash('123456', 12)
        const admin = await prisma.user.upsert({
            where: { email: 'admin@system.com' },
            update: {
                password, // Update password in case it's wrong
                role: 'ADMIN'
            },
            create: {
                email: 'admin@system.com',
                name: 'مدير النظام',
                password,
                role: 'ADMIN',
            },
        })
        results.push(`Admin User ensured: ${admin.email}`)

        // 2. Create Departments
        const departments = ['تقنية المعلومات', 'الموارد البشرية', 'المالية', 'المبيعات', 'الإدارة العليا']
        for (const dept of departments) {
            await prisma.department.upsert({
                where: { name: dept },
                update: {},
                create: { name: dept, description: `قسم ${dept}` },
            })
        }
        results.push('Departments ensured')

        // 3. Create Locations
        const locations = ['المقر الرئيسي', 'فرع الرياض', 'فرع جدة', 'فرع الدمام']
        for (const loc of locations) {
            const existing = await prisma.location.findFirst({ where: { name: loc } })
            if (!existing) {
                await prisma.location.create({
                    data: { name: loc, address: 'المملكة العربية السعودية' },
                })
            }
        }
        results.push('Locations ensured')

        return NextResponse.json({
            success: true,
            message: 'Database initialized successfully',
            details: results
        })

    } catch (error: any) {
        console.error('Setup error:', error)
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 })
    }
}
