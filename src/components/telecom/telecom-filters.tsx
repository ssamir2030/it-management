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

interface TelecomFiltersProps {
    providers: string[]
    selectedProvider: string
    selectedType: string
    onProviderChange: (provider: string) => void
    onTypeChange: (type: string) => void
    onClearFilters: () => void
}

export function TelecomFilters({
    providers,
    selectedProvider,
    selectedType,
    onProviderChange,
    onTypeChange,
    onClearFilters,
}: TelecomFiltersProps) {
    const hasActiveFilters = selectedProvider !== "all" || selectedType !== "all"

    return (
        <div className="flex flex-wrap items-center gap-3 bg-card p-4 rounded-xl border shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">تصفية:</span>
            </div>

            <Select value={selectedType} onValueChange={onTypeChange}>
                <SelectTrigger className="w-[180px] bg-background">
                    <SelectValue placeholder="نوع الخدمة" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="INTERNET">إنترنت</SelectItem>
                    <SelectItem value="SIM">شريحة اتصال</SelectItem>
                    <SelectItem value="LANDLINE">هاتف ثابت</SelectItem>
                </SelectContent>
            </Select>

            <Select value={selectedProvider} onValueChange={onProviderChange}>
                <SelectTrigger className="w-[180px] bg-background">
                    <SelectValue placeholder="المزود" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">جميع المزودين</SelectItem>
                    {providers.map((provider) => (
                        <SelectItem key={provider} value={provider}>
                            {provider}
                        </SelectItem>
                    ))}
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
                            {selectedType === 'INTERNET' ? 'إنترنت' : selectedType === 'SIM' ? 'شريحة' : 'هاتف ثابت'}
                            <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => onTypeChange("all")} />
                        </Badge>
                    )}
                    {selectedProvider !== "all" && (
                        <Badge variant="secondary" className="gap-1">
                            {selectedProvider}
                            <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => onProviderChange("all")} />
                        </Badge>
                    )}
                </div>
            )}
        </div>
    )
}
