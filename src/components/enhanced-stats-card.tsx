'use client'

import { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EnhancedStatsCardProps {
    title: string
    value: string | number
    icon: LucideIcon
    description?: string
    trend?: {
        value: number
        label?: string
        isPositive?: boolean
    }
    variant?: 'default' | 'gradient' | 'glass' | 'outline'
    color?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
    className?: string
    href?: string
}

const colorClasses = {
    primary: {
        icon: 'from-indigo-500 to-purple-600',
        iconBg: 'bg-indigo-50 dark:bg-indigo-950/20',
        border: 'border-l-indigo-500',
        glow: 'shadow-indigo-500/20'
    },
    success: {
        icon: 'from-green-500 to-emerald-600',
        iconBg: 'bg-green-50 dark:bg-green-950/20',
        border: 'border-l-green-500',
        glow: 'shadow-green-500/20'
    },
    warning: {
        icon: 'from-yellow-500 to-orange-600',
        iconBg: 'bg-yellow-50 dark:bg-yellow-950/20',
        border: 'border-l-yellow-500',
        glow: 'shadow-yellow-500/20'
    },
    danger: {
        icon: 'from-red-500 to-pink-600',
        iconBg: 'bg-red-50 dark:bg-red-950/20',
        border: 'border-l-red-500',
        glow: 'shadow-red-500/20'
    },
    info: {
        icon: 'from-blue-500 to-cyan-600',
        iconBg: 'bg-blue-50 dark:bg-blue-950/20',
        border: 'border-l-blue-500',
        glow: 'shadow-blue-500/20'
    }
}

export function EnhancedStatsCard({
    title,
    value,
    icon: Icon,
    description,
    trend,
    variant = 'default',
    color = 'primary',
    className,
    href
}: EnhancedStatsCardProps) {
    const colors = colorClasses[color]

    const cardClasses = cn(
        'group transition-all duration-300',
        variant === 'glass' && 'glass',
        variant === 'gradient' && 'card-gradient-border',
        variant === 'outline' && 'border-2',
        (variant === 'default' || variant === 'outline') && `border-l-4 ${colors.border}`,
        'hover:shadow-lg hover:-translate-y-1',
        colors.glow,
        className
    )

    const content = (
        <>
            <div className="flex items-center justify-between mb-4">
                <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold tracking-tight">
                            {typeof value === 'number' ? value.toLocaleString('ar-SA') : value}
                        </h3>
                        {trend && (
                            <div className="flex items-center gap-1">
                                {trend.value > 0 ? (
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            'gap-1 text-xs',
                                            trend.isPositive !== false
                                                ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400'
                                                : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400'
                                        )}
                                    >
                                        <TrendingUp className="h-3 w-3" />
                                        {trend.value}%
                                    </Badge>
                                ) : trend.value < 0 ? (
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            'gap-1 text-xs',
                                            trend.isPositive === true
                                                ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400'
                                                : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400'
                                        )}
                                    >
                                        <TrendingDown className="h-3 w-3" />
                                        {Math.abs(trend.value)}%
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="gap-1 text-xs">
                                        <Minus className="h-3 w-3" />
                                        0%
                                    </Badge>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className={cn(
                    'p-3 rounded-xl transition-all duration-300',
                    colors.iconBg,
                    'group-hover:scale-110'
                )}>
                    <div className={cn('bg-gradient-to-br text-transparent bg-clip-text', colors.icon)}>
                        <Icon className="h-6 w-6 opacity-0" aria-hidden />
                    </div>
                    <Icon className={cn('h-6 w-6 -mt-6 bg-gradient-to-br', colors.icon, 'text-transparent bg-clip-text')} />
                </div>
            </div>

            {(description || trend?.label) && (
                <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                    {description && (
                        <span className="text-muted-foreground">{description}</span>
                    )}
                    {trend?.label && (
                        <span className="text-muted-foreground">{trend.label}</span>
                    )}
                </div>
            )}
        </>
    )

    if (href) {
        return (
            <a href={href} className="block">
                <Card className={cardClasses}>
                    <CardContent className="p-6">
                        {content}
                    </CardContent>
                </Card>
            </a>
        )
    }

    return (
        <Card className={cardClasses}>
            <CardContent className="p-6">
                {content}
            </CardContent>
        </Card>
    )
}

// Grid container for stats
interface StatsGridProps {
    children: ReactNode
    cols?: 1 | 2 | 3 | 4
    className?: string
}

export function StatsGrid({ children, cols = 4, className }: StatsGridProps) {
    const gridCols = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
    }

    return (
        <div className={cn('grid gap-4', gridCols[cols], className)}>
            {children}
        </div>
    )
}
