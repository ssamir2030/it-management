'use server'

import prisma from '@/lib/prisma'
import { getPaginationParams, createPaginatedResult } from '@/lib/pagination'
import { applySortToPrisma, applyFiltersToPrisma } from '@/lib/table-utils'
import type { SortDirection, FilterParams } from '@/lib/table-utils'

interface QueryParams {
    page?: number
    pageSize?: number
    sortBy?: string | null
    sortDirection?: SortDirection
    filters?: FilterParams
}

/**
 * الحصول على جميع الأصول مع pagination + sorting + filtering
 */
export async function getAssetsPaginated(params: QueryParams = {}) {
    const { page, pageSize, skip, take } = getPaginationParams(params)

    // Build where clause
    const where: any = {
        deletedAt: null, // فقط غير المحذوفة
        ...applyFiltersToPrisma(params.filters || {}),
    }

    // Build orderBy clause
    const orderBy = applySortToPrisma(params.sortBy || null, params.sortDirection || null)

    try {
        const [assets, total] = await Promise.all([
            prisma.asset.findMany({
                where,
                include: {
                    employee: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    location: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
                orderBy,
                skip,
                take,
            }),
            prisma.asset.count({ where }),
        ])

        return {
            success: true,
            ...createPaginatedResult(assets, total, page, pageSize),
        }
    } catch (error) {
        console.error('Failed to fetch assets:', error)
        return {
            success: false,
            error: 'فشل في جلب الأصول',
            data: [],
            pagination: {
                total: 0,
                page: 1,
                pageSize: 10,
                totalPages: 0,
                hasNext: false,
                hasPrev: false,
            },
        }
    }
}

/**
 * الحصول على جميع الموظفين مع pagination + sorting + filtering
 */
export async function getEmployeesPaginated(params: QueryParams = {}) {
    const { page, pageSize, skip, take } = getPaginationParams(params)

    // Build where clause
    const where: any = {
        deletedAt: null, // فقط غير المحذوفين
        ...applyFiltersToPrisma(params.filters || {}),
    }

    // Build orderBy clause
    const orderBy = applySortToPrisma(params.sortBy || null, params.sortDirection || null)

    try {
        const [employees, total] = await Promise.all([
            prisma.employee.findMany({
                where,
                include: {
                    department: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    location: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    _count: {
                        select: {
                            assets: true,
                        },
                    },
                },
                orderBy,
                skip,
                take,
            }),
            prisma.employee.count({ where }),
        ])

        return {
            success: true,
            ...createPaginatedResult(employees, total, page, pageSize),
        }
    } catch (error) {
        console.error('Failed to fetch employees:', error)
        return {
            success: false,
            error: 'فشل في جلب الموظفين',
            data: [],
            pagination: {
                total: 0,
                page: 1,
                pageSize: 10,
                totalPages: 0,
                hasNext: false,
                hasPrev: false,
            },
        }
    }
}
