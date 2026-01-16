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

interface EmployeeFiltersProps {
    departments: string[]
    jobTitles: string[]
    selectedDepartment: string
    selectedJobTitle: string
    onDepartmentChange: (dept: string) => void
    onJobTitleChange: (title: string) => void
    onClearFilters: () => void
}

export function EmployeeFilters({
    departments,
    jobTitles,
    selectedDepartment,
    selectedJobTitle,
    onDepartmentChange,
    onJobTitleChange,
    onClearFilters,
}: EmployeeFiltersProps) {
    const hasActiveFilters = selectedDepartment !== "all" || selectedJobTitle !== "all"

    return (
        <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">تصفية:</span>
            </div>

            <Select value={selectedDepartment} onValueChange={onDepartmentChange}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="الإدارة / القسم" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">جميع الإدارات / الأقسام</SelectItem>
                    {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                            {dept}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={selectedJobTitle} onValueChange={onJobTitleChange}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="المسمى الوظيفي" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">جميع المسميات</SelectItem>
                    {jobTitles.map((title) => (
                        <SelectItem key={title} value={title}>
                            {title}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {hasActiveFilters && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onClearFilters}
                    className="gap-2"
                >
                    <X className="h-3 w-3" />
                    مسح الفلاتر
                </Button>
            )}

            {hasActiveFilters && (
                <div className="flex gap-2">
                    {selectedDepartment !== "all" && (
                        <Badge variant="secondary">{selectedDepartment}</Badge>
                    )}
                    {selectedJobTitle !== "all" && (
                        <Badge variant="secondary">{selectedJobTitle}</Badge>
                    )}
                </div>
            )}
        </div>
    )
}
