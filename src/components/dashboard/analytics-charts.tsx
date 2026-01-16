'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, LineChart, Line } from 'recharts'

interface RequestsByStatusChartProps {
    data: { status: string; count: number }[]
}

const STATUS_COLORS: Record<string, string> = {
    PENDING: '#EAB308',
    IN_PROGRESS: '#3B82F6',
    COMPLETED: '#10B981',
    REJECTED: '#EF4444',
    CANCELLED: '#6B7280'
}

const STATUS_LABELS: Record<string, string> = {
    PENDING: 'قيد المراجعة',
    IN_PROGRESS: 'قيد التنفيذ',
    COMPLETED: 'مكتمل',
    REJECTED: 'مرفوض',
    CANCELLED: 'ملغي'
}

export function RequestsByStatusChart({ data }: RequestsByStatusChartProps) {
    const chartData = data.map(item => ({
        name: STATUS_LABELS[item.status] || item.status,
        value: item.count,
        fill: STATUS_COLORS[item.status] || '#6B7280'
    }))

    return (
        <Card>
            <CardHeader>
                <CardTitle>الطلبات حسب الحالة</CardTitle>
                <CardDescription>توزيع الطلبات على الحالات المختلفة</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}

const TYPE_LABELS: Record<string, string> = {
    HARDWARE: 'أجهزة',
    SOFTWARE: 'برمجيات',
    ACCESS: 'صلاحيات',
    MAINTENANCE: 'صيانة',
    INK: 'أحبار',
    PAPER: 'أوراق',
    SUPPORT: 'دعم فني',
    RETURN: 'إرجاع عهدة',
    OTHER: 'أخرى'
}

interface RequestsByTypeChartProps {
    data: { type: string; count: number }[]
}

export function RequestsByTypeChart({ data }: RequestsByTypeChartProps) {
    const chartData = data.map(item => ({
        name: TYPE_LABELS[item.type] || item.type,
        عدد_الطلبات: item.count
    })).sort((a, b) => b.عدد_الطلبات - a.عدد_الطلبات)

    return (
        <Card>
            <CardHeader>
                <CardTitle>الطلبات حسب النوع</CardTitle>
                <CardDescription>أكثر أنواع الطلبات شيوعاً</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="عدد_الطلبات" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}

interface RequestsTrendChartProps {
    data: { date: string; total: number; completed: number; pending: number }[]
}

export function RequestsTrendChart({ data }: RequestsTrendChartProps) {
    const chartData = data.map(item => ({
        التاريخ: new Date(item.date).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' }),
        الإجمالي: item.total,
        مكتمل: item.completed,
        معلق: item.pending
    }))

    return (
        <Card className="col-span-full">
            <CardHeader>
                <CardTitle>اتجاه الطلبات (آخر 30 يوم)</CardTitle>
                <CardDescription>تطور الطلبات على مدار الشهر الماضي</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="التاريخ" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="الإجمالي" stroke="#8B5CF6" strokeWidth={2} />
                        <Line type="monotone" dataKey="مكتمل" stroke="#10B981" strokeWidth={2} />
                        <Line type="monotone" dataKey="معلق" stroke="#EAB308" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
