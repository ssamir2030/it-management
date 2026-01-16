'use client'

import { Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface AssetFiltersProps {
    types: string[]
    statuses: string[]
    selectedType: string
    selectedStatus: string
    onTypeChange: (type: string) => void
    onStatusChange: (status: string) => void
    onClearFilters: () => void
}

export function AssetFilters({
    types,
    statuses,
    selectedType,
    selectedStatus,
    onTypeChange,
    onStatusChange,
    onClearFilters,
}: AssetFiltersProps) {
    const hasActiveFilters = selectedType !== "all" || selectedStatus !== "all"

    return (
        <div className="flex flex-wrap items-center gap-3 bg-card p-4 rounded-xl border shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">تصفية:</span>
            </div>

            <Select value={selectedType} onValueChange={onTypeChange}>
                <SelectTrigger className="w-[180px] bg-background">
                    <SelectValue placeholder="نوع الأصل" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">جميع الأنواع</SelectItem>
                    {types.map((type) => (
                        <SelectItem key={type} value={type}>
                            {type}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={onStatusChange}>
                <SelectTrigger className="w-[180px] bg-background">
                    <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="AVAILABLE">متاح</SelectItem>
                    <SelectItem value="ASSIGNED">مستخدم</SelectItem>
                    <SelectItem value="MAINTENANCE">صيانة</SelectItem>
                    <SelectItem value="BROKEN">تالف</SelectItem>
                    <SelectItem value="RETIRED">متقاعد</SelectItem>
                </SelectContent>
            </Select>

            {hasActiveFilters && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearFilters}
                    className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                    <X className="h-3 w-3" />
                    مسح الفلاتر
                </Button>
            )}

            {hasActiveFilters && (
                <div className="flex gap-2 mr-auto">
                    {selectedType !== "all" && (
                        <Badge variant="secondary" className="gap-1">
                            {selectedType}
                            <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => onTypeChange("all")} />
                        </Badge>
                    )}
                    {selectedStatus !== "all" && (
                        <Badge variant="secondary" className="gap-1">
                            {selectedStatus === 'AVAILABLE' ? 'متاح' :
                                selectedStatus === 'ASSIGNED' ? 'مستخدم' :
                                    selectedStatus === 'MAINTENANCE' ? 'صيانة' :
                                        selectedStatus === 'BROKEN' ? 'تالف' : 'متقاعد'}
                            <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => onStatusChange("all")} />
                        </Badge>
                    )}
                </div>
            )}
        </div>
    )
}
