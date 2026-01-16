import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        // Get employee ID from portal session cookie
        const employeeId = cookies().get('employee_portal_session')?.value

        if (!employeeId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const employee = await prisma.employee.findUnique({
            where: { id: employeeId },
            include: {
                department: {
                    select: { name: true }
                },
                location: {
                    select: {
                        name: true,
                        address: true
                    }
                }
            }
        })

        if (!employee) {
            return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
        }

        return NextResponse.json({
            id: employee.id,
            name: employee.name,
            email: employee.email,
            phone: employee.phone,
            jobTitle: employee.jobTitle,
            department: employee.department?.name || null,
            departmentId: employee.departmentId,
            location: employee.location?.name || null,
            locationAddress: employee.location?.address || null,
            locationId: employee.locationId,
            identityNumber: employee.identityNumber,
            image: employee.image,
            createdAt: employee.createdAt,
            updatedAt: employee.updatedAt
        })
    } catch (error) {
        console.error('Error fetching employee profile:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
