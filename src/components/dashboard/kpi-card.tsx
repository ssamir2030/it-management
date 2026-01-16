'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface KPICardProps {
    title: string
    value: string | number
    icon: LucideIcon
    description?: string
    trend?: {
        value: number
        isPositive: boolean
    }
    className?: string
    iconColor?: string
}

export function KPICard({
    title,
    value,
    icon: Icon,
    description,
    trend,
    className,
    iconColor = "text-blue-700"
}: KPICardProps) {
    return (
        <Card className={cn("hover:shadow-lg transition-all duration-300", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                    {title}
                </CardTitle>
                <div className={cn("p-2 rounded-lg bg-gradient-to-br from-gray-50 to-white", iconColor)}>
                    <Icon className="h-4 w-4" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold text-foreground">{value}</div>
                {description && (
                    <p className="text-xs text-muted-foreground mt-1">{description}</p>
                )}
                {trend && (
                    <div className="flex items-center gap-1 mt-2">
                        {trend.isPositive ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        <span className={cn(
                            "text-sm font-medium",
                            trend.isPositive ? "text-green-600" : "text-red-600"
                        )}>
                            {trend.value > 0 ? '+' : ''}{trend.value}%
                        </span>
                        <span className="text-xs text-muted-foreground">من الأسبوع الماضي</span>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
