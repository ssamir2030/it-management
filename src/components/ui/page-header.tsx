"use client"

import React from "react"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { GlobalSearch } from "@/components/ui/global-search"

interface PageHeaderProps {
    icon: LucideIcon
    title: string
    description: string
    gradientFrom: string
    gradientVia: string
    gradientTo: string
    iconBgFrom: string
    iconBgTo: string
    iconShadow: string
    actions?: React.ReactNode
    className?: string
}

export function PageHeader({
    icon: Icon,
    title,
    description,
    gradientFrom,
    gradientVia,
    gradientTo,
    iconBgFrom,
    iconBgTo,
    iconShadow,
    actions,
    className
}: PageHeaderProps) {
    return (
        <div className={cn("mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between", className)}>
            <div className="flex items-center gap-4" dir="rtl">
                <div className={cn(
                    "rounded-2xl p-3.5 shadow-lg",
                    `bg-gradient-to-br ${iconBgFrom} ${iconBgTo} ${iconShadow}`
                )}>
                    <Icon className="h-6 w-6 text-white" strokeWidth={2.5} />
                </div>
                <div className="space-y-1.5">
                    <h1 className={cn(
                        "text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r",
                        `${gradientFrom} ${gradientVia} ${gradientTo}`
                    )}>
                        {title}
                    </h1>
                    <p className="text-sm text-muted-foreground font-medium">
                        {description}
                    </p>
                </div>
            </div>

            <div className="flex flex-col-reverse md:flex-row items-center gap-3 w-full md:w-auto">
                <GlobalSearch />
                {actions && (
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    )
}
