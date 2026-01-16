'use client'

import { Ticket, AlertCircle, CheckCircle2, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TicketStatsProps {
    totalTickets: number
    openTickets: number
    resolvedTickets: number
    criticalTickets: number
}

export function TicketStats({ totalTickets, openTickets, resolvedTickets, criticalTickets }: TicketStatsProps) {
    const stats = [
        {
            title: "إجمالي التذاكر",
            value: totalTickets,
            icon: Ticket,
            color: "text-blue-600",
            bg: "bg-blue-100 dark:bg-blue-900/20",
            gradient: "from-blue-600 to-indigo-600"
        },
        {
            title: "تذاكر مفتوحة",
            value: openTickets,
            icon: AlertCircle,
            color: "text-orange-600",
            bg: "bg-orange-100 dark:bg-orange-900/20",
            gradient: "from-orange-600 to-red-600"
        },
        {
            title: "تم الحل",
            value: resolvedTickets,
            icon: CheckCircle2,
            color: "text-green-600",
            bg: "bg-green-100 dark:bg-green-900/20",
            gradient: "from-green-600 to-emerald-600"
        },
        {
            title: "عالية الأولوية",
            value: criticalTickets,
            icon: Clock,
            color: "text-red-600",
            bg: "bg-red-100 dark:bg-red-900/20",
            gradient: "from-red-600 to-rose-600"
        }
    ]

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
                <Card key={index} className="relative overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300 group">
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-[0.03] group-hover:opacity-[0.08] transition-opacity`} />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {stat.title}
                        </CardTitle>
                        <div className={`p-2 rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110 duration-300`}>
                            <stat.icon className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
