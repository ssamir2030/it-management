"use client"

import * as React from "react"
import { X, CheckSquare, Trash2, Printer, Download, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface Action {
    label: string
    icon: React.ElementType
    onClick: () => void
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    loading?: boolean
}

interface SelectionBarProps {
    selectedCount: number
    totalCount?: number
    onClearSelection: () => void
    actions?: Action[]
    children?: React.ReactNode
}

export function SelectionBar({
    selectedCount,
    totalCount,
    onClearSelection,
    actions = [],
    children
}: SelectionBarProps) {
    if (selectedCount === 0) return null

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 animate-in slide-in-from-bottom-10 fade-in duration-300">
            <div className="bg-card text-card-foreground rounded-full shadow-2xl border border-border p-2 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 pl-4 pr-2">
                    <div className="bg-primary text-primary-foreground text-sm font-bold h-8 min-w-[2rem] px-2 rounded-full flex items-center justify-center">
                        {selectedCount}
                    </div>
                    <span className="text-sm font-medium hidden sm:inline-block text-muted-foreground">
                        عنصر محدد
                    </span>
                    {totalCount && (
                        <span className="text-xs text-muted-foreground hidden sm:inline-block">
                            من {totalCount}
                        </span>
                    )}
                </div>

                <div className="h-6 w-px bg-border" />

                <div className="flex items-center gap-1 flex-1 justify-center sm:justify-end">
                    {children}
                    {actions.map((action, index) => (
                        <Button
                            key={index}
                            size="sm"
                            variant={action.variant || "ghost"}
                            className={cn(
                                "h-9 gap-2 rounded-full",
                                action.variant === "destructive"
                                    ? "text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                                    : "hover:bg-muted"
                            )}
                            onClick={action.onClick}
                            disabled={action.loading}
                        >
                            <action.icon className={cn("h-4 w-4", action.loading && "animate-spin")} />
                            <span className="sr-only sm:not-sr-only">{action.label}</span>
                        </Button>
                    ))}
                </div>

                <div className="h-6 w-px bg-border/20" />

                <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
                    onClick={onClearSelection}
                    title="إلغاء التحديد"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
