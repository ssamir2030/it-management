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

interface TicketFiltersProps {
    selectedStatus: string
    selectedPriority: string
    onStatusChange: (status: string) => void
    onPriorityChange: (priority: string) => void
    onClearFilters: () => void
}

export function TicketFilters({
    selectedStatus,
    selectedPriority,
    onStatusChange,
    onPriorityChange,
    onClearFilters,
}: TicketFiltersProps) {
    const hasActiveFilters = selectedStatus !== "all" || selectedPriority !== "all"

    return (
        <div className="flex flex-wrap items-center gap-3 bg-card p-4 rounded-xl border shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">تصفية:</span>
            </div>

            <Select value={selectedStatus} onValueChange={onStatusChange}>
                <SelectTrigger className="w-[180px] bg-background">
                    <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="OPEN">مفتوح</SelectItem>
                    <SelectItem value="IN_PROGRESS">جاري العمل</SelectItem>
                    <SelectItem value="RESOLVED">تم الحل</SelectItem>
                    <SelectItem value="CLOSED">مغلق</SelectItem>
                </SelectContent>
            </Select>

            <Select value={selectedPriority} onValueChange={onPriorityChange}>
                <SelectTrigger className="w-[180px] bg-background">
                    <SelectValue placeholder="الأولوية" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">جميع الأولويات</SelectItem>
                    <SelectItem value="LOW">منخفض</SelectItem>
                    <SelectItem value="MEDIUM">متوسط</SelectItem>
                    <SelectItem value="HIGH">عالي</SelectItem>
                    <SelectItem value="CRITICAL">حرج</SelectItem>
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
                    {selectedStatus !== "all" && (
                        <Badge variant="secondary" className="gap-1">
                            {selectedStatus === 'OPEN' ? 'مفتوح' :
                                selectedStatus === 'IN_PROGRESS' ? 'جاري العمل' :
                                    selectedStatus === 'RESOLVED' ? 'تم الحل' : 'مغلق'}
                            <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => onStatusChange("all")} />
                        </Badge>
                    )}
                    {selectedPriority !== "all" && (
                        <Badge variant="secondary" className="gap-1">
                            {selectedPriority === 'LOW' ? 'منخفض' :
                                selectedPriority === 'MEDIUM' ? 'متوسط' :
                                    selectedPriority === 'HIGH' ? 'عالي' : 'حرج'}
                            <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => onPriorityChange("all")} />
                        </Badge>
                    )}
                </div>
            )}
        </div>
    )
}
