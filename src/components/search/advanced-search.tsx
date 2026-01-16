'use client'

import { useState } from 'react'
import { Search, X, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface AdvancedSearchProps {
    onSearch: (query: string, filters: SearchFilters) => void
    placeholder?: string
}

export interface SearchFilters {
    status?: string
    type?: string
    priority?: string
    dateFrom?: string
    dateTo?: string
}

export function AdvancedSearch({ onSearch, placeholder = "بحث..." }: AdvancedSearchProps) {
    const [query, setQuery] = useState('')
    const [filters, setFilters] = useState<SearchFilters>({})
    const [isOpen, setIsOpen] = useState(false)

    const handleSearch = () => {
        onSearch(query, filters)
    }

    const handleClearFilters = () => {
        setFilters({})
        setQuery('')
        onSearch('', {})
    }

    const activeFiltersCount = Object.values(filters).filter(v => v).length

    return (
        <div className="flex gap-2 w-full max-w-2xl">
            <div className="relative flex-1">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pr-10"
                />
            </div>

            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="relative">
                        <Filter className="h-4 w-4 ml-2" />
                        فلترة متقدمة
                        {activeFiltersCount > 0 && (
                            <Badge
                                variant="default"
                                className="absolute -top-2 -left-2 h-5 w-5 p-0 flex items-center justify-center bg-blue-600"
                            >
                                {activeFiltersCount}
                            </Badge>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium">البحث المتقدم</h4>
                            {activeFiltersCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClearFilters}
                                    className="h-8"
                                >
                                    <X className="h-4 w-4 ml-1" />
                                    مسح الكل
                                </Button>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>الحالة</Label>
                            <Select
                                value={filters.status}
                                onValueChange={(value) => setFilters({ ...filters, status: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="كل الحالات" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">كل الحالات</SelectItem>
                                    <SelectItem value="PENDING">قيد الانتظار</SelectItem>
                                    <SelectItem value="IN_PROGRESS">قيد التنفيذ</SelectItem>
                                    <SelectItem value="COMPLETED">مكتمل</SelectItem>
                                    <SelectItem value="REJECTED">مرفوض</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>الأولوية</Label>
                            <Select
                                value={filters.priority}
                                onValueChange={(value) => setFilters({ ...filters, priority: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="كل الأولويات" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">كل الأولويات</SelectItem>
                                    <SelectItem value="URGENT">عاجل</SelectItem>
                                    <SelectItem value="HIGH">مرتفع</SelectItem>
                                    <SelectItem value="NORMAL">عادي</SelectItem>
                                    <SelectItem value="LOW">منخفض</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="pt-2">
                            <Button onClick={() => { handleSearch(); setIsOpen(false); }} className="w-full">
                                <Search className="h-4 w-4 ml-2" />
                                بحث
                            </Button>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}
