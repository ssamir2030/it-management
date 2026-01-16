"use client"

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTheme } from "next-themes"

interface DashboardChartsProps {
    assetGrowth?: { name: string; assets: number }[]
    ticketStatus?: { name: string; value: number; color: string }[]
}

export function DashboardCharts({
    assetGrowth = [],
    ticketStatus = []
}: DashboardChartsProps) {
    const { theme } = useTheme()
    const isDark = theme === "dark"

    // Default data if none provided to avoid empty charts
    const displayAssetGrowth = assetGrowth.length > 0 ? assetGrowth : [
        { name: 'لا توجد بيانات', assets: 0 }
    ]

    const displayTicketStatus = ticketStatus.length > 0 ? ticketStatus : [
        { name: 'لا توجد بيانات', value: 1, color: '#94a3b8' }
    ]

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 animate-slide-up stagger-2">
            <Card className="col-span-4 card-elevated h-[400px]">
                <CardHeader>
                    <CardTitle>نمو الأصول التقنية</CardTitle>
                    <CardDescription>
                        معدل إضافة الأصول الجديدة خلال الأشهر الـ 7 الماضية
                    </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={displayAssetGrowth}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#333" : "#eee"} />
                            <XAxis
                                dataKey="name"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}`}
                            />
                            <Tooltip
                                cursor={{ fill: isDark ? '#333' : '#f4f4f5' }}
                                contentStyle={{
                                    backgroundColor: isDark ? '#1f2937' : '#fff',
                                    borderRadius: '8px',
                                    borderColor: isDark ? '#374151' : '#e5e7eb',
                                    color: isDark ? '#fff' : '#000',
                                    textAlign: 'right'
                                }}
                            />
                            <Bar
                                dataKey="assets"
                                fill="currentColor"
                                radius={[4, 4, 0, 0]}
                                className="fill-primary"
                                barSize={40}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="col-span-3 card-elevated h-[400px]">
                <CardHeader>
                    <CardTitle>حالة التذاكر والدعم</CardTitle>
                    <CardDescription>
                        توزيع التذاكر حسب الحالة الحالية
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={displayTicketStatus}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {displayTicketStatus.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: isDark ? '#1f2937' : '#fff',
                                    borderRadius: '8px',
                                    borderColor: isDark ? '#374151' : '#e5e7eb',
                                    color: isDark ? '#fff' : '#000',
                                    textAlign: 'right'
                                }}
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    )
}

