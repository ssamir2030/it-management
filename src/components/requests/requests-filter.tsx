'use client'

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Filter, X, SlidersHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface RequestsFilterProps {
    onFilterChange: (filters: FilterValues) => void
    totalCount: number
    filteredCount: number
    hideTypeFilter?: boolean
}

export interface FilterValues {
    search: string
    status: string
    type: string
    priority: string
    sortBy: string
}

const initialFilters: FilterValues = {
    search: '',
    status: 'all',
    type: 'all',
    priority: 'all',
    sortBy: 'newest'
}

export function RequestsFilter({ onFilterChange, totalCount, filteredCount, hideTypeFilter = false }: RequestsFilterProps) {
    const [filters, setFilters] = useState<FilterValues>(initialFilters)
    const [isOpen, setIsOpen] = useState(false)

    function updateFilter(key: keyof FilterValues, value: string) {
        const newFilters = { ...filters, [key]: value }
        setFilters(newFilters)
        onFilterChange(newFilters)
    }

    function resetFilters() {
        setFilters(initialFilters)
        onFilterChange(initialFilters)
    }

    const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
        if (key === 'search') return value !== ''
        if (key === 'sortBy') return false // sortBy is not considered a filter
        return value !== 'all'
    }).length

    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Filter className="h-5 w-5 text-blue-600" />
                        البحث والفلترة
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>عرض {filteredCount} من {totalCount}</span>
                        {activeFiltersCount > 0 && (
                            <Badge variant="secondary" className="gap-1">
                                <Filter className="h-3 w-3" />
                                {activeFiltersCount}
                            </Badge>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="ابحث بالعنوان، النوع، أو اسم الموظف..."
                        value={filters.search}
                        onChange={(e) => updateFilter('search', e.target.value)}
                        className="pr-10"
                    />
                    {filters.search && (
                        <button
                            onClick={() => updateFilter('search', '')}
                            className="absolute left-3 top-3 text-muted-foreground hover:text-gray-600"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                <div className={`grid gap-3 ${hideTypeFilter ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-4'}`}>
                    {/* Status Filter */}
                    <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">الحالة</Label>
                        <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent dir="rtl">
                                <SelectItem value="all">الكل</SelectItem>
                                <SelectItem value="PENDING">قيد الانتظار</SelectItem>
                                <SelectItem value="IN_PROGRESS">قيد التنفيذ</SelectItem>
                                <SelectItem value="COMPLETED">مكتمل</SelectItem>
                                <SelectItem value="REJECTED">مرفوض</SelectItem>
                                <SelectItem value="CANCELLED">ملغي</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Type Filter - Conditionally rendered */}
                    {!hideTypeFilter && (
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">النوع</Label>
                            <Select value={filters.type} onValueChange={(value) => updateFilter('type', value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent dir="rtl">
                                    <SelectItem value="all">الكل</SelectItem>
                                    <SelectItem value="HARDWARE">أجهزة</SelectItem>
                                    <SelectItem value="INK">أحبار</SelectItem>
                                    <SelectItem value="PAPER">أوراق</SelectItem>
                                    <SelectItem value="SUPPORT">دعم فني</SelectItem>
                                    <SelectItem value="MAINTENANCE">صيانة</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Priority Filter */}
                    <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">الأولوية</Label>
                        <Select value={filters.priority} onValueChange={(value) => updateFilter('priority', value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent dir="rtl">
                                <SelectItem value="all">الكل</SelectItem>
                                <SelectItem value="LOW">منخفضة</SelectItem>
                                <SelectItem value="NORMAL">عادية</SelectItem>
                                <SelectItem value="HIGH">عالية</SelectItem>
                                <SelectItem value="URGENT">عاجلة</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Sort By */}
                    <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">الترتيب</Label>
                        <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent dir="rtl">
                                <SelectItem value="newest">الأحدث</SelectItem>
                                <SelectItem value="oldest">الأقدم</SelectItem>
                                <SelectItem value="priority">الأولوية</SelectItem>
                                <SelectItem value="status">الحالة</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Reset Button */}
                {activeFiltersCount > 0 && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={resetFilters}
                        className="w-full gap-2"
                    >
                        <X className="h-4 w-4" />
                        إعادة تعيين الفلاتر
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}
