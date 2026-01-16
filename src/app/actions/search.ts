'use server'

import prisma from '@/lib/prisma'

export type SearchResult = {
    type: 'ASSET' | 'EMPLOYEE' | 'TICKET'
    id: string
    title: string
    subtitle?: string
    url: string
}

export async function searchAll(query: string) {
    if (!query) {
        return { assets: [], employees: [], inventory: [], custody: [], pages: [] }
    }

    const [assets, employees, inventory, custody] = await Promise.all([
        prisma.asset.findMany({
            where: {
                OR: [
                    { name: { contains: query } },
                    { tag: { contains: query } },
                    { serialNumber: { contains: query } }
                ]
            },
            include: { employee: { select: { name: true } } },
            take: 10
        }),
        prisma.employee.findMany({
            where: {
                OR: [
                    { name: { contains: query } },
                    { email: { contains: query } },
                    { identityNumber: { contains: query } }
                ]
            },
            include: {
                _count: { select: { assets: true } },
                department: { select: { name: true } }
            },
            take: 10
        }),
        prisma.inventoryItem.findMany({
            where: { name: { contains: query } },
            take: 10
        }),
        prisma.custodyItem?.findMany({
            where: { name: { contains: query } },
            include: {
                employee: { select: { name: true } },
                asset: { select: { name: true } }
            },
            take: 10
        }) || []
    ])

    // Mock pages search
    const allPages = [
        { title: 'لوحة التحكم', description: 'نظرة عامة على النظام', url: '/admin/dashboard' },
        { title: 'الأصول', description: 'إدارة الأصول والعهد', url: '/assets' },
        { title: 'الموظفين', description: 'سجل الموظفين والبيانات', url: '/employees' },
        { title: 'الدعم الفني', description: 'التذاكر وطلبات الخدمة', url: '/admin/support' },
        { title: 'المخزون', description: 'قطع الغيار والمستهلكات', url: '/inventory' },
        { title: 'التراخيص', description: 'تراخيص البرمجيات والاشتراكات', url: '/admin/licenses' }
    ]

    const pages = allPages.filter(p =>
        p.title.includes(query) || p.description.includes(query)
    )

    return { assets, employees, inventory, custody, pages }
}

export async function searchGlobal(query: string): Promise<SearchResult[]> {
    const results = await searchAll(query)
    const flatResults: SearchResult[] = []

    results.assets.forEach(a => flatResults.push({
        type: 'ASSET', id: a.id, title: a.name, subtitle: `Tag: ${a.tag}`, url: `/assets/${a.id}`
    }))

    results.employees.forEach(e => flatResults.push({
        type: 'EMPLOYEE', id: e.id, title: e.name, subtitle: e.identityNumber, url: `/employees?edit=${e.id}`
    }))

    return flatResults.slice(0, 5)
}

