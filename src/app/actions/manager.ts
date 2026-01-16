'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentEmployee } from '@/app/actions/employee-portal'

export async function getTeamOverview() {
    try {
        const manager = await getCurrentEmployee()
        if (!manager) {
            console.error("getTeamOverview: No authenticated employee found")
            return { success: false, error: "لم يتم التعرف على المستخدم الحالي (Unauthorized)" }
        }

        console.log(`getTeamOverview: Fetching team for manager ${manager.id} (${manager.name})`)

        // Fetch subordinates
        const team = await prisma.employee.findMany({
            where: { managerId: manager.id },
            select: {
                id: true,
                name: true,
                jobTitle: true,
                email: true,
                assets: {
                    where: { status: 'ASSIGNED' },
                    select: { id: true, name: true, type: true, tag: true }
                },
                requests: {
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                    select: { id: true, type: true, status: true, createdAt: true, subject: true }
                }
            }
        })

        console.log(`getTeamOverview: Found ${team.length} subordinates`)

        // Aggregate Data
        const totalEmployees = team.length
        const totalAssets = team.reduce((acc, emp) => acc + emp.assets.length, 0)

        // Get pending requests only for the team members we found
        const subordinateIds = team.map(t => t.id)

        let pendingRequests: any[] = []
        if (subordinateIds.length > 0) {
            pendingRequests = await prisma.employeeRequest.findMany({
                where: {
                    employeeId: { in: subordinateIds },
                    status: 'PENDING'
                },
                include: {
                    employee: { select: { name: true, image: true } }
                },
                orderBy: { createdAt: 'desc' }
            })
        }

        return {
            success: true,
            data: {
                team,
                stats: {
                    totalEmployees,
                    totalAssets,
                    pendingRequestsCount: pendingRequests.length
                },
                pendingRequests
            }
        }
    } catch (error: any) {
        console.error("Error fetching team overview:", error)
        return { success: false, error: `حدث خطأ في النظام: ${error.message}` }
    }
}
