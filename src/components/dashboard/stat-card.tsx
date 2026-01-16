import { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface StatCardProps {
    title: string
    value: number
    icon: LucideIcon
    trend?: {
        value: number
        isPositive: boolean
    }
    gradient: string
    delay?: number
}

export function StatCard({ title, value, icon: Icon, trend, gradient }: StatCardProps) {
    return (
        <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />

            <CardContent className="p-6 relative">
                <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-bold tracking-tight">
                                {value.toLocaleString()}
                            </h3>
                            {trend && (
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${trend.isPositive
                                        ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'
                                        : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                                    }`}>
                                    {trend.isPositive ? '+' : ''}{trend.value}%
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Icon with Gradient */}
                    <div className={`relative p-3 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="h-6 w-6 text-white" />
                        <div className="absolute inset-0 rounded-2xl bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
