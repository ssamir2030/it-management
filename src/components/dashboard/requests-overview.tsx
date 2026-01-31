"use client"

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTheme } from "next-themes"
import { format, parseISO } from "date-fns"
import { ar } from "date-fns/locale"

interface RequestsOverviewProps {
    data: { date: string; count: number }[]
}

export function RequestsOverview({ data }: RequestsOverviewProps) {
    const { theme } = useTheme()
    const isDark = theme === "dark"

    // Fill missing dates with 0 for smoother chart
    // (Optional enhancement for later, simplified for MVP)

    return (
        <Card className="col-span-4 card-elevated">
            <CardHeader>
                <CardTitle>نظرة عامة على الطلبات</CardTitle>
                <CardDescription>
                    حركة الطلبات اليومية خلال الـ 30 يوماً الماضية
                </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#333" : "#eee"} />
                        <XAxis
                            dataKey="date"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(str) => {
                                try {
                                    return format(parseISO(str), "d MMM", { locale: ar })
                                } catch (e) {
                                    return str
                                }
                            }}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: isDark ? '#1f2937' : '#fff',
                                borderRadius: '8px',
                                borderColor: isDark ? '#374151' : '#e5e7eb',
                                color: isDark ? '#fff' : '#000',
                                textAlign: 'right'
                            }}
                            labelFormatter={(label) => {
                                try {
                                    return format(parseISO(label), "EEEE, d MMMM yyyy", { locale: ar })
                                } catch (e) {
                                    return label
                                }
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="count"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorRequests)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
