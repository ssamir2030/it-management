'use client'

import { useState, useTransition } from 'react'
import { Search, SlidersHorizontal, X, Save, Star } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface FilterConfig {
    status?: string
    type?: string
    location?: string
    department?: string
    dateFrom?: string
    dateTo?: string
    priority?: string
    assignedTo?: string
}

interface AdvancedSearchProps {
    onSearch: (query: string) => void
    onFilter: (filters: FilterConfig) => void
    placeholder?: string
    filterOptions?: {
        statuses?: Array<{ value: string; label: string }>
        types?: Array<{ value: string; label: string }>
        locations?: Array<{ value: string; label: string }>
        departments?: Array<{ value: string; label: string }>
        priorities?: Array<{ value: string; label: string }>
        users?: Array<{ value: string; label: string }>
    }
    savedFilters?: Array<{ name: string; filters: FilterConfig }>
    onSaveFilter?: (name: string, filters: FilterConfig) => void
}

export function AdvancedSearch({
    onSearch,
    onFilter,
    placeholder = 'بحث...',
    filterOptions = {},
    savedFilters = [],
    onSaveFilter
}: AdvancedSearchProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [filters, setFilters] = useState<FilterConfig>({})
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [isPending, startTransition] = useTransition()

    const handleSearch = (value: string) => {
        setSearchQuery(value)
        startTransition(() => {
            onSearch(value)
        })
    }

    const handleFilterChange = (key: keyof FilterConfig, value: string) => {
        const newFilters = { ...filters, [key]: value }
        setFilters(newFilters)
    }

    const applyFilters = () => {
        startTransition(() => {
            onFilter(filters)
        })
        setIsFilterOpen(false)
    }

    const clearFilters = () => {
        setFilters({})
        startTransition(() => {
            onFilter({})
        })
    }

    const applySavedFilter = (savedFilter: FilterConfig) => {
        setFilters(savedFilter)
        startTransition(() => {
            onFilter(savedFilter)
        })
    }

    const activeFilterCount = Object.values(filters).filter(Boolean).length

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder={placeholder}
                        className="pr-10"
                    />
                    {searchQuery && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute left-1 top-1/2 -translate-y-1/2 h-6 w-6"
                            onClick={() => handleSearch('')}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    )}
                </div>

                <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="relative">
                            <SlidersHorizontal className="h-4 w-4 ml-2" />
                            فلاتر
                            {activeFilterCount > 0 && (
                                <Badge
                                    variant="destructive"
                                    className="absolute -top-2 -left-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                                >
                                    {activeFilterCount}
                                </Badge>
                            )}
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[400px] sm:w-[540px] overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle>الفلاتر المتقدمة</SheetTitle>
                            <SheetDescription>
                                اختر الفلاتر المطلوبة لتحسين نتائج البحث
                            </SheetDescription>
                        </SheetHeader>

                        <div className="space-y-6 py-6">
                            {/* Saved Filters */}
                            {savedFilters.length > 0 && (
                                <div className="space-y-2">
                                    <Label>الفلاتر المحفوظة</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {savedFilters.map((saved, index) => (
                                            <Button
                                                key={index}
                                                variant="outline"
                                                size="sm"
                                                onClick={() => applySavedFilter(saved.filters)}
                                                className="gap-2"
                                            >
                                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                {saved.name}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Status Filter */}
                            {filterOptions.statuses && (
                                <div className="space-y-2">
                                    <Label>الحالة</Label>
                                    <Select
                                        value={filters.status}
                                        onValueChange={(value) => handleFilterChange('status', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="اختر الحالة" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filterOptions.statuses.map((status) => (
                                                <SelectItem key={status.value} value={status.value}>
                                                    {status.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Type Filter */}
                            {filterOptions.types && (
                                <div className="space-y-2">
                                    <Label>النوع</Label>
                                    <Select
                                        value={filters.type}
                                        onValueChange={(value) => handleFilterChange('type', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="اختر النوع" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filterOptions.types.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Location Filter */}
                            {filterOptions.locations && (
                                <div className="space-y-2">
                                    <Label>الموقع</Label>
                                    <Select
                                        value={filters.location}
                                        onValueChange={(value) => handleFilterChange('location', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="اختر الموقع" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filterOptions.locations.map((location) => (
                                                <SelectItem key={location.value} value={location.value}>
                                                    {location.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Department Filter */}
                            {filterOptions.departments && (
                                <div className="space-y-2">
                                    <Label>القسم</Label>
                                    <Select
                                        value={filters.department}
                                        onValueChange={(value) => handleFilterChange('department', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="اختر القسم" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filterOptions.departments.map((dept) => (
                                                <SelectItem key={dept.value} value={dept.value}>
                                                    {dept.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Priority Filter */}
                            {filterOptions.priorities && (
                                <div className="space-y-2">
                                    <Label>الأولوية</Label>
                                    <Select
                                        value={filters.priority}
                                        onValueChange={(value) => handleFilterChange('priority', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="اختر الأولوية" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filterOptions.priorities.map((priority) => (
                                                <SelectItem key={priority.value} value={priority.value}>
                                                    {priority.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Date Range */}
                            <div className="space-y-2">
                                <Label>فترة زمنية</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <Label className="text-xs text-muted-foreground">من</Label>
                                        <Input
                                            type="date"
                                            value={filters.dateFrom}
                                            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">إلى</Label>
                                        <Input
                                            type="date"
                                            value={filters.dateTo}
                                            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-4 border-t">
                            <Button onClick={applyFilters} className="flex-1">
                                تطبيق الفلاتر
                            </Button>
                            <Button onClick={clearFilters} variant="outline">
                                <X className="h-4 w-4 ml-2" />
                                مسح
                            </Button>
                            {onSaveFilter && activeFilterCount > 0 && (
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        const name = prompt('اسم الفلتر:')
                                        if (name) onSaveFilter(name, filters)
                                    }}
                                >
                                    <Save className="h-4 w-4 ml-2" />
                                    حفظ
                                </Button>
                            )}
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Active Filters Display */}
            {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-2">
                    {Object.entries(filters).map(([key, value]) =>
                        value ? (
                            <Badge
                                key={key}
                                variant="secondary"
                                className="gap-1 cursor-pointer hover:bg-destructive/10"
                                onClick={() => handleFilterChange(key as keyof FilterConfig, '')}
                            >
                                {key}: {value}
                                <X className="h-3 w-3" />
                            </Badge>
                        ) : null
                    )}
                </div>
            )}
        </div>
    )
}
