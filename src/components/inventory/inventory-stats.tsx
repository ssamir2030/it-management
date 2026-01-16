'use client'

import { Package, AlertTriangle, DollarSign, Grid3x3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface InventoryStatsProps {
    totalItems: number
    lowStockCount: number
    totalValue: number
    categoriesCount: number
}

export function InventoryStats({ totalItems, lowStockCount, totalValue, categoriesCount }: InventoryStatsProps) {
    const stats = [
        {
            title: "إجمالي العناصر",
            value: totalItems,
            icon: Package,
            color: "text-blue-600",
            bgColor: "bg-blue-50 dark:bg-blue-950",
        },
        {
            title: "تنبيهات المخزون",
            value: lowStockCount,
            icon: AlertTriangle,
            color: "text-yellow-600",
            bgColor: "bg-yellow-50 dark:bg-yellow-950",
        },
        {
            title: "القيمة الإجمالية",
            value: `${totalValue.toLocaleString('ar-SA')} ر.س`,
            icon: DollarSign,
            color: "text-green-600",
            bgColor: "bg-green-50 dark:bg-green-950",
        },
        {
            title: "عدد الفئات",
            value: categoriesCount,
            icon: Grid3x3,
            color: "text-purple-600",
            bgColor: "bg-purple-50 dark:bg-purple-950",
        },
    ]

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
                <Card key={stat.title} className="overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {stat.title}
                        </CardTitle>
                        <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${stat.color}`}>
                            {stat.value}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
