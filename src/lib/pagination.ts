/**
 * Pagination Helper Functions
 * وظائف مساعدة للـ pagination في Server Components و API routes
 */

export interface PaginationParams {
    page?: number
    pageSize?: number
}

export interface PaginatedResult<T> {
    data: T[]
    pagination: {
        total: number
        page: number
        pageSize: number
        totalPages: number
        hasNext: boolean
        hasPrev: boolean
    }
}

/**
 * حساب offset و limit من page و pageSize
 */
export function getPaginationParams(params: PaginationParams) {
    const page = Math.max((params.page || 1), 1)
    const pageSize = Math.min(Math.max((params.pageSize || 10), 1), 100) // max 100

    const skip = (page - 1) * pageSize
    const take = pageSize

    return { page, pageSize, skip, take }
}

/**
 * إنشاء نتيجة paginated
 */
export function createPaginatedResult<T>(
    data: T[],
    total: number,
    page: number,
    pageSize: number
): PaginatedResult<T> {
    const totalPages = Math.ceil(total / pageSize)

    return {
        data,
        pagination: {
            total,
            page,
            pageSize,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        },
    }
}

/**
 * استخراج pagination params من URL search params
 */
export function getPaginationFromSearchParams(searchParams: URLSearchParams) {
    return {
        page: parseInt(searchParams.get('page') || '1'),
        pageSize: parseInt(searchParams.get('pageSize') || '10'),
    }
}

/**
 * تحديث URL مع pagination params
 */
export function updateURLWithPagination(
    currentURL: string,
    page: number,
    pageSize: number
): string {
    const url = new URL(currentURL, window.location.origin)
    url.searchParams.set('page', page.toString())
    url.searchParams.set('pageSize', pageSize.toString())
    return url.pathname + url.search
}
