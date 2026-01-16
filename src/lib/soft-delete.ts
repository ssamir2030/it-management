import prisma from './prisma'

/**
 * Soft Delete Helper Functions
 * إدارة الحذف الآمن (Soft Delete)
 */

/**
 * حذف موظف (soft delete)
 */
export async function softDeleteEmployee(id: string, deletedBy: string) {
    return prisma.employee.update({
        where: { id },
        data: {
            deletedAt: new Date(),
            deletedBy,
        },
    })
}

/**
 * استعادة موظف محذوف
 */
export async function restoreEmployee(id: string) {
    return prisma.employee.update({
        where: { id },
        data: {
            deletedAt: null,
            deletedBy: null,
        },
    })
}

/**
 * حذف أصل (soft delete)
 */
export async function softDeleteAsset(id: string, deletedBy: string) {
    return prisma.asset.update({
        where: { id },
        data: {
            deletedAt: new Date(),
            deletedBy,
        },
    })
}

/**
 * استعادة أصل محذوف
 */
export async function restoreAsset(id: string) {
    return prisma.asset.update({
        where: { id },
        data: {
            deletedAt: null,
            deletedBy: null,
        },
    })
}

/**
 * حذف إدارة (soft delete)
 */
export async function softDeleteDepartment(id: string, deletedBy: string) {
    return prisma.department.update({
        where: { id },
        data: {
            deletedAt: new Date(),
            deletedBy,
        },
    })
}

/**
 * استعادة إدارة محذوفة
 */
export async function restoreDepartment(id: string) {
    return prisma.department.update({
        where: { id },
        data: {
            deletedAt: null,
            deletedBy: null,
        },
    })
}

/**
 * حذف موقع (soft delete)
 */
export async function softDeleteLocation(id: string, deletedBy: string) {
    return prisma.location.update({
        where: { id },
        data: {
            deletedAt: new Date(),
            deletedBy,
        },
    })
}

/**
 * استعادة موقع محذوف
 */
export async function restoreLocation(id: string) {
    return prisma.location.update({
        where: { id },
        data: {
            deletedAt: null,
            deletedBy: null,
        },
    })
}

/**
 * Prisma query helpers - لتجاهل المحذوفات تلقائياً
 */

/**
 * الحصول على جميع الموظفين (غير المحذوفين)
 */
export function getActiveEmployees() {
    return prisma.employee.findMany({
        where: {
            deletedAt: null,
        },
    })
}

/**
 * الحصول على جميع الأصول (غير المحذوفة)
 */
export function getActiveAssets() {
    return prisma.asset.findMany({
        where: {
            deletedAt: null,
        },
    })
}

/**
 * الحصول على جميع الإدارات (غير المحذوفة)
 */
export function getActiveDepartments() {
    return prisma.department.findMany({
        where: {
            deletedAt: null,
        },
    })
}

/**
 * الحصول على جميع المواقع (غير المحذوفة)
 */
export function getActiveLocations() {
    return prisma.location.findMany({
        where: {
            deletedAt: null,
        },
    })
}

/**
 * الحصول على العناصر المحذوفة مؤخراً
 */
export async function getRecentlyDeleted(entityType: 'employee' | 'asset' | 'department' | 'location', limit = 20) {
    switch (entityType) {
        case 'employee':
            return prisma.employee.findMany({
                where: { deletedAt: { not: null } },
                orderBy: { deletedAt: 'desc' },
                take: limit,
            })
        case 'asset':
            return prisma.asset.findMany({
                where: { deletedAt: { not: null } },
                orderBy: { deletedAt: 'desc' },
                take: limit,
            })
        case 'department':
            return prisma.department.findMany({
                where: { deletedAt: { not: null } },
                orderBy: { deletedAt: 'desc' },
                take: limit,
            })
        case 'location':
            return prisma.location.findMany({
                where: { deletedAt: { not: null } },
                orderBy: { deletedAt: 'desc' },
                take: limit,
            })
    }
}

/**
 * حذف نهائي للعناصر المحذوفة قبل X أيام
 */
export async function permanentDeleteOld(daysToKeep = 30) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    const results = await Promise.all([
        prisma.employee.deleteMany({
            where: {
                deletedAt: {
                    lt: cutoffDate,
                    not: null,
                },
            },
        }),
        prisma.asset.deleteMany({
            where: {
                deletedAt: {
                    lt: cutoffDate,
                    not: null,
                },
            },
        }),
        prisma.department.deleteMany({
            where: {
                deletedAt: {
                    lt: cutoffDate,
                    not: null,
                },
            },
        }),
        prisma.location.deleteMany({
            where: {
                deletedAt: {
                    lt: cutoffDate,
                    not: null,
                },
            },
        }),
    ])

    return {
        employees: results[0].count,
        assets: results[1].count,
        departments: results[2].count,
        locations: results[3].count,
    }
}
