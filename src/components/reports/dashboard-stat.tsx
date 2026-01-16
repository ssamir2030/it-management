import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardStatProps {
    title: string
    value: string | number
    subtitle?: string
    icon: LucideIcon
    trend?: {
        value: number
        isPositive: boolean
    }
    color?: string
}

export function DashboardStat({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    color = "text-muted-foreground"
}: DashboardStatProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className={cn("h-4 w-4", color)} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {subtitle && (
                    <p className="text-xs text-muted-foreground mt-1">
                        {subtitle}
                    </p>
                )}
                {trend && (
                    <p className={cn(
                        "text-xs mt-1 flex items-center gap-1",
                        trend.isPositive ? "text-green-600" : "text-red-600"
                    )}>
                        <span>{trend.isPositive ? "↑" : "↓"}</span>
                        <span>{Math.abs(trend.value)}%</span>
                        <span className="text-muted-foreground">من الشهر السابق</span>
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
