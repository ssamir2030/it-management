'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowUpIcon, ArrowDownIcon, TrendingUp, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
    title: string
    value: number | string
    icon: React.ReactNode
    description?: string
    trend?: number
    trendLabel?: string
    color?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
}

const colorClasses = {
    blue: {
        icon: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
        border: 'border-l-blue-500'
    },
    green: {
        icon: 'bg-green-500/10 text-green-600 dark:text-green-400',
        border: 'border-l-green-500'
    },
    purple: {
        icon: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
        border: 'border-l-indigo-500'
    },
    orange: {
        icon: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
        border: 'border-l-orange-500'
    },
    red: {
        icon: 'bg-red-500/10 text-red-600 dark:text-red-400',
        border: 'border-l-red-500'
    }
}

export function StatsCard({
    title,
    value,
    icon,
    description,
    trend,
    trendLabel = 'من الشهر الماضي',
    color = 'blue'
}: StatsCardProps) {
    const colors = colorClasses[color]
    const isPositive = trend && trend > 0
    const isNegative = trend && trend < 0
    const isNeutral = trend === 0

    return (
        <Card className={cn('border-l-4 hover:shadow-lg transition-all duration-200', colors.border)}>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        {title}
                    </CardTitle>
                    <div className={cn('p-2 rounded-lg', colors.icon)}>
                        {icon}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <div className="text-3xl font-bold tracking-tight">
                        {typeof value === 'number' ? value.toLocaleString('ar-SA') : value}
                    </div>

                    {description && (
                        <p className="text-xs text-muted-foreground">
                            {description}
                        </p>
                    )}

                    {trend !== undefined && (
                        <div className="flex items-center gap-2 pt-1">
                            {isPositive && (
                                <Badge variant="outline" className="gap-1 bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800">
                                    <ArrowUpIcon className="h-3 w-3" />
                                    {Math.abs(trend)}%
                                </Badge>
                            )}
                            {isNegative && (
                                <Badge variant="outline" className="gap-1 bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800">
                                    <ArrowDownIcon className="h-3 w-3" />
                                    {Math.abs(trend)}%
                                </Badge>
                            )}
                            {isNeutral && (
                                <Badge variant="outline" className="gap-1">
                                    <Minus className="h-3 w-3" />
                                    بدون تغيير
                                </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">{trendLabel}</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

interface MiniStatsCardProps {
    title: string
    value: number | string
    icon: React.ReactNode
    description?: string
    color?: 'indigo' | 'cyan' | 'amber' | 'emerald' | 'blue' | 'green' | 'purple' | 'orange' | 'red'
}

const miniColorClasses = {
    indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
    cyan: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-400',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
    emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    purple: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
    orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
    red: 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400',
}

export function MiniStatsCard({ title, value, icon, description, color = 'indigo' }: MiniStatsCardProps) {
    return (
        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-200">
            <CardContent className="p-4">
                <div className="flex items-center gap-3">
                    <div className={cn('p-2.5 rounded-lg', miniColorClasses[color])}>
                        {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground font-medium truncate">{title}</p>
                        <p className="text-2xl font-bold mt-0.5">
                            {typeof value === 'number' ? value.toLocaleString('ar-SA') : value}
                        </p>
                        {description && (
                            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
