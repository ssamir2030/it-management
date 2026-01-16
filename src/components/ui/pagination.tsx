import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { Button } from './button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './select'

interface PaginationProps {
    currentPage: number
    totalPages: number
    totalItems: number
    pageSize: number
    onPageChange: (page: number) => void
    onPageSizeChange: (size: number) => void
    pageSizeOptions?: number[]
}

export function Pagination({
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [10, 25, 50, 100],
}: PaginationProps) {
    const startItem = (currentPage - 1) * pageSize + 1
    const endItem = Math.min(currentPage * pageSize, totalItems)

    // حساب الصفحات المعروضة
    const getPageNumbers = () => {
        const pages: (number | string)[] = []
        const maxVisible = 5

        if (totalPages <= maxVisible) {
            // عرض جميع الصفحات إذا كانت قليلة
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            // عرض أول صفحة دائماً
            pages.push(1)

            if (currentPage > 3) {
                pages.push('...')
            }

            // الصفحات المحيطة بالصفحة الحالية
            const start = Math.max(2, currentPage - 1)
            const end = Math.min(totalPages - 1, currentPage + 1)

            for (let i = start; i <= end; i++) {
                pages.push(i)
            }

            if (currentPage < totalPages - 2) {
                pages.push('...')
            }

            // عرض آخر صفحة دائماً
            if (totalPages > 1) {
                pages.push(totalPages)
            }
        }

        return pages
    }

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t pt-4">
            {/* معلومات العرض */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                    عرض {startItem} - {endItem} من {totalItems}
                </span>

                {/* اختيار عدد العناصر */}
                <div className="flex items-center gap-2 mr-4">
                    <span>العناصر لكل صفحة:</span>
                    <Select
                        value={pageSize.toString()}
                        onValueChange={(value) => onPageSizeChange(Number(value))}
                    >
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {pageSizeOptions.map((size) => (
                                <SelectItem key={size} value={size.toString()}>
                                    {size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* أزرار التنقل */}
            <div className="flex items-center gap-2">
                {/* الذهاب لأول صفحة */}
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    title="الصفحة الأولى"
                >
                    <ChevronsRight className="h-4 w-4" />
                </Button>

                {/* الصفحة السابقة */}
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    title="الصفحة السابقة"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>

                {/* أرقام الصفحات */}
                <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, index) => {
                        if (page === '...') {
                            return (
                                <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                                    ...
                                </span>
                            )
                        }

                        const pageNum = page as number
                        const isActive = pageNum === currentPage

                        return (
                            <Button
                                key={pageNum}
                                variant={isActive ? 'default' : 'outline'}
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => onPageChange(pageNum)}
                            >
                                {pageNum}
                            </Button>
                        )
                    })}
                </div>

                {/* الصفحة التالية */}
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    title="الصفحة التالية"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* الذهاب لآخر صفحة */}
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    title="الصفحة الأخيرة"
                >
                    <ChevronsLeft className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
