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

interface InventoryFiltersProps {
    categories: string[]
    manufacturers: string[]
    selectedCategory: string
    selectedManufacturer: string
    selectedStockStatus: string
    onCategoryChange: (category: string) => void
    onManufacturerChange: (manufacturer: string) => void
    onStockStatusChange: (status: string) => void
    onClearFilters: () => void
}

export function InventoryFilters({
    categories,
    manufacturers,
    selectedCategory,
    selectedManufacturer,
    selectedStockStatus,
    onCategoryChange,
    onManufacturerChange,
    onStockStatusChange,
    onClearFilters,
}: InventoryFiltersProps) {
    const hasActiveFilters = selectedCategory !== "all" || selectedManufacturer !== "all" || selectedStockStatus !== "all"

    return (
        <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">تصفية:</span>
            </div>

            <Select value={selectedCategory} onValueChange={onCategoryChange}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="الفئة" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">جميع الفئات</SelectItem>
                    {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                            {cat}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={selectedManufacturer} onValueChange={onManufacturerChange}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="الشركة المصنعة" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">جميع الشركات</SelectItem>
                    {manufacturers.map((mfr) => (
                        <SelectItem key={mfr} value={mfr}>
                            {mfr}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={selectedStockStatus} onValueChange={onStockStatusChange}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="حالة المخزون" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="low">مخزون منخفض</SelectItem>
                    <SelectItem value="normal">مخزون طبيعي</SelectItem>
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
                    {selectedCategory !== "all" && (
                        <Badge variant="secondary">{selectedCategory}</Badge>
                    )}
                    {selectedManufacturer !== "all" && (
                        <Badge variant="secondary">{selectedManufacturer}</Badge>
                    )}
                    {selectedStockStatus !== "all" && (
                        <Badge variant="secondary">
                            {selectedStockStatus === "low" ? "مخزون منخفض" : "مخزون طبيعي"}
                        </Badge>
                    )}
                </div>
            )}
        </div>
    )
}
