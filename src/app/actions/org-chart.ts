'use server'

import prisma from "@/lib/prisma"

export type OrgChartData = {
    id: string
    name: string
    type: 'DEPARTMENT' | 'EMPLOYEE' | 'ASSET'
    details?: string
    children?: OrgChartData[]
    manager?: string
    status?: string // For assets
}

export async function getOrgChartData(): Promise<OrgChartData> {
    const departments = await prisma.department.findMany({
        include: {
            employees: {
                include: {
                    assets: true,
                    custodyItems: {
                        include: {
                            asset: true
                        }
                    }
                }
            }
        },
        orderBy: {
            name: 'asc'
        }
    })

    // Transform to Tree Structure
    const root: OrgChartData = {
        id: 'root',
        name: 'الهيكل التنظيمي',
        type: 'DEPARTMENT', // Acts as root container
        details: 'الشركة',
        children: departments.map(dept => ({
            id: dept.id,
            name: dept.name,
            type: 'DEPARTMENT',
            manager: dept.managerName || 'غير محدد',
            details: `المدير: ${dept.managerName || 'غير محدد'}`,
            children: dept.employees.map(emp => {
                // Combine direct assets and custody items
                const assetNodes: OrgChartData[] = emp.assets.map(asset => ({
                    id: asset.id,
                    name: asset.name,
                    type: 'ASSET',
                    details: asset.tag,
                    status: asset.status
                }))

                const custodyNodes: OrgChartData[] = emp.custodyItems.map(custody => ({
                    id: custody.id,
                    name: custody.asset?.name || custody.name,
                    type: 'ASSET',
                    details: custody.asset?.tag || 'عهدة يدوية',
                    status: 'CUSTODY'
                }))

                return {
                    id: emp.id,
                    name: emp.name,
                    type: 'EMPLOYEE',
                    details: emp.jobTitle || 'موظف',
                    children: [...assetNodes, ...custodyNodes]
                }
            })
        }))
    }

    return root
}
