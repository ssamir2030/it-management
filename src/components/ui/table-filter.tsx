import { X } from 'lucide-react'
import { Button } from './button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './select'
import { Badge } from './badge'

export interface FilterOption {
    label: string
    value: string
}

interface TableFilterProps {
    label: string
    value: string | null
    options: FilterOption[]
    onChange: (value: string | null) => void
    placeholder?: string
}

export function TableFilter({
    label,
    value,
    options,
    onChange,
    placeholder = 'الكل',
}: TableFilterProps) {
    const hasValue = value !== null && value !== ''

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium whitespace-nowrap">{label}:</span>
            <div className="flex items-center gap-1">
                <Select
                    value={value || ''}
                    onValueChange={(val) => onChange(val === '' ? null : val)}
                >
                    <SelectTrigger className="h-9 w-[180px]">
                        <SelectValue placeholder={placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">الكل</SelectItem>
                        {options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {hasValue && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => onChange(null)}
                        title="إزالة التصفية"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    )
}

interface TableFiltersBarProps {
    children: React.ReactNode
    activeFiltersCount?: number
    onClearAll?: () => void
}

export function TableFiltersBar({
    children,
    activeFiltersCount = 0,
    onClearAll,
}: TableFiltersBarProps) {
    return (
        <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/50 rounded-lg border">
            {children}

            {activeFiltersCount > 0 && onClearAll && (
                <>
                    <div className="flex-1" />
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                            {activeFiltersCount} تصفية نشطة
                        </Badge>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onClearAll}
                            className="h-9"
                        >
                            <X className="h-4 w-4 ml-1" />
                            مسح الكل
                        </Button>
                    </div>
                </>
            )}
        </div>
    )
}
