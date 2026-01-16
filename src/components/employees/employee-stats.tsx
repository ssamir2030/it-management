'use client'

import { Users, Building2, Briefcase, Laptop2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface EmployeeStatsProps {
    totalEmployees: number
    departmentsCount: number
    totalAssets: number
    activeLocations: number
}

export function EmployeeStats({ totalEmployees, departmentsCount, totalAssets, activeLocations }: EmployeeStatsProps) {
    const stats = [
        {
            title: "إجمالي الموظفين",
            value: totalEmployees,
            icon: Users,
            color: "text-blue-600",
            bgColor: "bg-blue-50 dark:bg-blue-950",
        },
        {
            title: "الإدارات / الأقسام",
            value: departmentsCount,
            icon: Building2,
            color: "text-purple-600",
            bgColor: "bg-purple-50 dark:bg-purple-950",
        },
        {
            title: "الأصول المسلمة",
            value: totalAssets,
            icon: Laptop2,
            color: "text-green-600",
            bgColor: "bg-green-50 dark:bg-green-950",
        },
        {
            title: "المواقع النشطة",
            value: activeLocations,
            icon: Briefcase, // Using Briefcase as a placeholder for Location/Site
            color: "text-orange-600",
            bgColor: "bg-orange-50 dark:bg-orange-950",
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
