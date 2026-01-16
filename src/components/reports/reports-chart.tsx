"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6']

interface ReportsChartProps {
    data: any[]
    type: 'pie' | 'donut' | 'bar'
    dataKey: string
    nameKey: string
}

export function ReportsChart({ data, type, dataKey, nameKey }: ReportsChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                لا توجد بيانات للعرض
            </div>
        )
    }

    // تحويل البيانات للفورمات المناسب
    const chartData = data.map((item, index) => ({
        name: item[nameKey] || `عنصر ${index + 1}`,
        value: typeof item[dataKey] === 'object' ? item[dataKey]._count || 0 : item[dataKey] || 0,
        fill: COLORS[index % COLORS.length]
    }))

    if (type === 'pie' || type === 'donut') {
        return (
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={type === 'donut' ? 100 : 120}
                        innerRadius={type === 'donut' ? 60 : 0}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        )
    }

    if (type === 'bar') {
        return (
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
            </ResponsiveContainer>
        )
    }

    return null
}
