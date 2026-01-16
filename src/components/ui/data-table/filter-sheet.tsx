"use client"

import * as React from "react"
import { Filter, X, Check, Search, Calendar as CalendarIcon, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { badgeVariants } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface FilterSheetProps {
    trigger?: React.ReactNode
    title?: string
    description?: string
    children: React.ReactNode
    activeFiltersCount?: number
    onReset?: () => void
    onApply?: () => void
    className?: string
}

export function FilterSheet({
    trigger,
    title = "تصفية متقدمة",
    description = "قم بتخصيص عرض البيانات باستخدام الفلاتر التالية",
    children,
    activeFiltersCount = 0,
    onReset,
    onApply,
    className
}: FilterSheetProps) {
    const [open, setOpen] = React.useState(false)

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm" className={cn("gap-2", activeFiltersCount > 0 && "border-primary text-primary bg-primary/5")}>
                        <Filter className="h-4 w-4" />
                        تصفية
                        {activeFiltersCount > 0 && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                                {activeFiltersCount}
                            </span>
                        )}
                    </Button>
                )}
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[540px] flex flex-col p-0 gap-0">
                <SheetHeader className="px-6 py-4 border-b">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-full">
                            <SlidersHorizontal className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <SheetTitle>{title}</SheetTitle>
                            <SheetDescription>{description}</SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <ScrollArea className="flex-1 px-6">
                    <div className="py-6 space-y-6">
                        {children}
                    </div>
                </ScrollArea>

                <SheetFooter className="px-6 py-4 border-t bg-muted/20 flex-row gap-2 sm:gap-2 sm:space-x-0">
                    <SheetClose asChild>
                        <Button
                            type="submit"
                            className="flex-1 gap-2"
                            onClick={() => {
                                onApply?.()
                                setOpen(false)
                            }}
                        >
                            <Check className="h-4 w-4" />
                            تطبيق الفلاتر
                        </Button>
                    </SheetClose>
                    {onReset && (
                        <Button
                            variant="outline"
                            className="flex-1 gap-2"
                            onClick={onReset}
                        >
                            <X className="h-4 w-4" />
                            إعادة تعيين
                        </Button>
                    )}
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}

interface FilterSectionProps {
    title: string
    description?: string
    children: React.ReactNode
    className?: string
}

export function FilterSection({ title, description, children, className }: FilterSectionProps) {
    return (
        <div className={cn("space-y-3", className)}>
            <div>
                <h4 className="font-medium text-sm text-foreground">{title}</h4>
                {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </div>
            {children}
        </div>
    )
}
