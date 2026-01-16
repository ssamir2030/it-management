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

interface CustodyFiltersProps {
    employees: { id: string, name: string }[]
    selectedEmployee: string
    selectedStatus: string
    onEmployeeChange: (employeeId: string) => void
    onStatusChange: (status: string) => void
    onClearFilters: () => void
}

export function CustodyFilters({
    employees,
    selectedEmployee,
    selectedStatus,
    onEmployeeChange,
    onStatusChange,
    onClearFilters,
}: CustodyFiltersProps) {
    const hasActiveFilters = selectedEmployee !== "all" || selectedStatus !== "all"

    return (
        <div className="flex flex-wrap items-center gap-3 bg-card p-4 rounded-xl border shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">تصفية:</span>
            </div>

            <Select value={selectedEmployee} onValueChange={onEmployeeChange}>
                <SelectTrigger className="w-[200px] bg-background">
                    <SelectValue placeholder="الموظف" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">جميع الموظفين</SelectItem>
                    {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                            {emp.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={onStatusChange}>
                <SelectTrigger className="w-[180px] bg-background">
                    <SelectValue placeholder="حالة العهدة" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="active">نشطة</SelectItem>
                    <SelectItem value="returned">تم إرجاعها</SelectItem>
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
                    {selectedEmployee !== "all" && (
                        <Badge variant="secondary" className="gap-1">
                            موظف محدد
                            <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => onEmployeeChange("all")} />
                        </Badge>
                    )}
                    {selectedStatus !== "all" && (
                        <Badge variant="secondary" className="gap-1">
                            {selectedStatus === 'active' ? 'نشطة' : 'تم إرجاعها'}
                            <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => onStatusChange("all")} />
                        </Badge>
                    )}
                </div>
            )}
        </div>
    )
}
