/**
 * Table Utilities for Sorting and Filtering
 * وظائف مساعدة للجداول
 */

export type SortDirection = 'asc' | 'desc' | null

export interface SortParams {
    sortBy: string | null
    sortDirection: SortDirection
}

export interface FilterParams {
    [key: string]: string | null
}

export interface TableParams extends SortParams {
    page: number
    pageSize: number
    filters: FilterParams
}

/**
 * استخراج table params من URL search params
 */
export function getTableParamsFromURL(searchParams: URLSearchParams): TableParams {
    const params: TableParams = {
        page: parseInt(searchParams.get('page') || '1'),
        pageSize: parseInt(searchParams.get('pageSize') || '10'),
        sortBy: searchParams.get('sortBy'),
        sortDirection: (searchParams.get('sortDirection') as SortDirection) || null,
        filters: {},
    }

    // Extract all filter parameters (they start with 'filter_')
    searchParams.forEach((value, key) => {
        if (key.startsWith('filter_')) {
            const filterKey = key.replace('filter_', '')
            params.filters[filterKey] = value || null
        }
    })

    return params
}

/**
 * تحديث URL مع table params
 */
export function updateURLWithTableParams(
    currentURL: string,
    params: Partial<TableParams>
): string {
    const url = new URL(currentURL, window.location.origin)

    // Update pagination
    if (params.page !== undefined) {
        url.searchParams.set('page', params.page.toString())
    }
    if (params.pageSize !== undefined) {
        url.searchParams.set('pageSize', params.pageSize.toString())
    }

    // Update sorting
    if (params.sortBy !== undefined) {
        if (params.sortBy) {
            url.searchParams.set('sortBy', params.sortBy)
        } else {
            url.searchParams.delete('sortBy')
        }
    }
    if (params.sortDirection !== undefined) {
        if (params.sortDirection) {
            url.searchParams.set('sortDirection', params.sortDirection)
        } else {
            url.searchParams.delete('sortDirection')
        }
    }

    // Update filters
    if (params.filters) {
        // Remove old filters
        Array.from(url.searchParams.keys()).forEach(key => {
            if (key.startsWith('filter_')) {
                url.searchParams.delete(key)
            }
        })

        // Add new filters
        Object.entries(params.filters).forEach(([key, value]) => {
            if (value) {
                url.searchParams.set(`filter_${key}`, value)
            }
        })
    }

    return url.pathname + url.search
}

/**
 * Toggle sort direction
 */
export function toggleSortDirection(
    column: string,
    currentSort: string | null,
    currentDirection: SortDirection
): { sortBy: string; sortDirection: SortDirection } {
    // نفس العمود
    if (currentSort === column) {
        if (currentDirection === 'asc') {
            return { sortBy: column, sortDirection: 'desc' }
        } else if (currentDirection === 'desc') {
            return { sortBy: column, sortDirection: null }
        } else {
            return { sortBy: column, sortDirection: 'asc' }
        }
    }

    // عمود جديد
    return { sortBy: column, sortDirection: 'asc' }
}

/**
 * Count active filters
 */
export function countActiveFilters(filters: FilterParams): number {
    return Object.values(filters).filter(v => v !== null && v !== '').length
}

/**
 * Clear all filters
 */
export function clearAllFilters(): FilterParams {
    return {}
}

/**
 * Apply sorting to Prisma orderBy
 */
export function applySortToPrisma(sortBy: string | null, sortDirection: SortDirection) {
    if (!sortBy || !sortDirection) {
        return { createdAt: 'desc' as const } // Default
    }

    return {
        [sortBy]: sortDirection,
    }
}

/**
 * Apply filters to Prisma where clause
 */
export function applyFiltersToPrisma(filters: FilterParams) {
    const where: any = {}

    Object.entries(filters).forEach(([key, value]) => {
        if (value) {
            where[key] = value
        }
    })

    return where
}
