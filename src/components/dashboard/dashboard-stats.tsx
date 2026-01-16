'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Monitor,
    Users,
    Package,
    DollarSign,
    UserCog,
    Wifi,
    LifeBuoy,
    BookOpen,
    Building2,
    MapPin,
    Shield,
    Printer
} from "lucide-react"

interface DashboardStatsProps {
    stats: {
        assets: number
        inventory: number
        employees: number
        tickets: number
        custody: number
        telecom: number
        articles: number
        departments: number
        locations: number
        users: number
        consumables: number
        inventoryValue: number
    }
}

export function DashboardStats({ stats }: DashboardStatsProps) {
    const items = [
        {
            title: "إجمالي الأصول",
            value: stats.assets,
            icon: Monitor,
            description: "أصل مسجل",
            color: "text-blue-600",
            bg: "bg-blue-100 dark:bg-blue-900/20",
            gradient: "from-blue-600 to-indigo-600"
        },
        {
            title: "الموظفين",
            value: stats.employees,
            icon: Users,
            description: "موظف نشط",
            color: "text-green-600",
            bg: "bg-green-100 dark:bg-green-900/20",
            gradient: "from-green-600 to-emerald-600"
        },
        {
            title: "المستودع",
            value: stats.inventory,
            icon: Package,
            description: "عنصر متاح",
            color: "text-purple-600",
            bg: "bg-purple-100 dark:bg-purple-900/20",
            gradient: "from-purple-600 to-pink-600"
        },
        {
            title: "قيمة المخزون",
            value: new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }).format(stats.inventoryValue),
            icon: DollarSign,
            description: "القيمة التقديرية",
            color: "text-amber-600",
            bg: "bg-amber-100 dark:bg-amber-900/20",
            gradient: "from-amber-600 to-orange-600"
        },
        {
            title: "العهد المسلمة",
            value: stats.custody,
            icon: UserCog,
            description: "عهدة نشطة",
            color: "text-cyan-600",
            bg: "bg-cyan-100 dark:bg-cyan-900/20",
            gradient: "from-cyan-600 to-teal-600"
        },
        {
            title: "خطوط الاتصال",
            value: stats.telecom,
            icon: Wifi,
            description: "شريحة/خط",
            color: "text-rose-600",
            bg: "bg-rose-100 dark:bg-rose-900/20",
            gradient: "from-rose-600 to-red-600"
        },
        {
            title: "تذاكر الدعم",
            value: stats.tickets,
            icon: LifeBuoy,
            description: "تذكرة مسجلة",
            color: "text-orange-600",
            bg: "bg-orange-100 dark:bg-orange-900/20",
            gradient: "from-orange-600 to-red-500"
        },
        {
            title: "المواد الاستهلاكية",
            value: stats.consumables,
            icon: Printer,
            description: "صنف استهلاكي",
            color: "text-slate-600",
            bg: "bg-slate-100 dark:bg-slate-800",
            gradient: "from-slate-600 to-gray-600"
        },
        {
            title: "قاعدة المعرفة",
            value: stats.articles,
            icon: BookOpen,
            description: "مقال تعليمي",
            color: "text-violet-600",
            bg: "bg-violet-100 dark:bg-violet-900/20",
            gradient: "from-violet-600 to-purple-600"
        },
        {
            title: "الإدارات",
            value: stats.departments,
            icon: Building2,
            description: "قسم/إدارة",
            color: "text-indigo-600",
            bg: "bg-indigo-100 dark:bg-indigo-900/20",
            gradient: "from-indigo-600 to-blue-600"
        },
        {
            title: "المواقع",
            value: stats.locations,
            icon: MapPin,
            description: "موقع جغرافي",
            color: "text-teal-600",
            bg: "bg-teal-100 dark:bg-teal-900/20",
            gradient: "from-teal-600 to-emerald-600"
        },
        {
            title: "مستخدمي النظام",
            value: stats.users,
            icon: Shield,
            description: "حساب مستخدم",
            color: "text-fuchsia-600",
            bg: "bg-fuchsia-100 dark:bg-fuchsia-900/20",
            gradient: "from-fuchsia-600 to-pink-600"
        },
    ]

    return (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {items.map((item, index) => (
                <Card key={index} className="relative overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300 group hover:-translate-y-1">
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-[0.03] group-hover:opacity-[0.08] transition-opacity`} />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {item.title}
                        </CardTitle>
                        <div className={`p-2 rounded-xl ${item.bg} ${item.color} transition-transform group-hover:scale-110 duration-300 shadow-sm`}>
                            <item.icon className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground tracking-tight">{item.value}</div>
                        <p className="text-xs text-muted-foreground mt-1 font-medium">
                            {item.description}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
