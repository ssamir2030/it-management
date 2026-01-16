'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface MonthlyTrendsChartProps {
    data: {
        month: string
        assets: number
        requests: number
    }[]
}

export function MonthlyTrendsChart({ data }: MonthlyTrendsChartProps) {
    return (
        <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardHeader>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    الاتجاهات الشهرية
                </CardTitle>
                <CardDescription>الأصول والطلبات خلال آخر 6 أشهر</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="month"
                            stroke="#6b7280"
                            style={{ fontSize: '12px' }}
                        />
                        <YAxis
                            stroke="#6b7280"
                            style={{ fontSize: '12px' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                border: 'none',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                            }}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="assets"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            dot={{ fill: '#3b82f6', r: 5 }}
                            activeDot={{ r: 7 }}
                            name="الأصول"
                        />
                        <Line
                            type="monotone"
                            dataKey="requests"
                            stroke="#06b6d4"
                            strokeWidth={3}
                            dot={{ fill: '#06b6d4', r: 5 }}
                            activeDot={{ r: 7 }}
                            name="الطلبات"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
