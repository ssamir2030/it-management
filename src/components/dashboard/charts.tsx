'use client'

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
    RadialBarChart,
    RadialBar,
    ComposedChart
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const COLORS = ['#2563eb', '#1e293b', '#0d9488', '#4f46e5', '#64748b', '#d97706', '#059669', '#dc2626']
const GRADIENT_COLORS = [
    { start: '#3b82f6', end: '#1d4ed8' },
    { start: '#10b981', end: '#047857' },
    { start: '#f59e0b', end: '#d97706' },
    { start: '#ef4444', end: '#dc2626' },
    { start: '#8b5cf6', end: '#7c3aed' }
]

interface TrendChartProps {
    data: Array<{
        month: string
        assets: number
        employees: number
        tickets: number
    }>
}

export function TrendChart({ data }: TrendChartProps) {
    return (
        <Card className="col-span-full border-0 shadow-xl bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950">
            <CardHeader>
                <CardTitle className="text-2xl font-black">الاتجاهات الشهرية</CardTitle>
                <CardDescription className="text-base">تحليل أداء آخر 6 أشهر</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorAssets" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorEmployees" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#d97706" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                            dataKey="month"
                            className="text-xs"
                            tick={{ fill: 'currentColor' }}
                        />
                        <YAxis
                            className="text-xs"
                            tick={{ fill: 'currentColor' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '12px',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                            }}
                        />
                        <Legend />
                        <Area
                            type="monotone"
                            dataKey="assets"
                            name="الأصول"
                            stroke="#2563eb"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorAssets)"
                        />
                        <Area
                            type="monotone"
                            dataKey="employees"
                            name="الموظفين"
                            stroke="#059669"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorEmployees)"
                        />
                        <Area
                            type="monotone"
                            dataKey="tickets"
                            name="التذاكر"
                            stroke="#d97706"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorTickets)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}

interface StatusPieChartProps {
    data: Array<{
        name: string
        value: number
    }>
}

export function StatusPieChart({ data }: StatusPieChartProps) {
    const total = data.reduce((sum, item) => sum + item.value, 0)

    return (
        <Card className="border-0 shadow-xl">
            <CardHeader>
                <CardTitle className="text-xl font-bold">توزيع حالة الأصول</CardTitle>
                <CardDescription>إجمالي {total.toLocaleString('ar')} أصل</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                        <defs>
                            {COLORS.map((color, index) => (
                                <linearGradient key={index} id={`pieGradient${index}`} x1="0" y1="0" x2="1" y2="1">
                                    <stop offset="0%" stopColor={color} stopOpacity={1} />
                                    <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                                </linearGradient>
                            ))}
                        </defs>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={3}
                            dataKey="value"
                            strokeWidth={0}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={`url(#pieGradient${index % COLORS.length})`} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: 'none',
                                borderRadius: '12px',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
                            }}
                        />
                        <Legend
                            wrapperStyle={{ paddingTop: '20px' }}
                            formatter={(value) => <span className="text-sm font-medium">{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}

interface TypeDistributionChartProps {
    data: Array<{
        name: string
        value: number
        fill: string
    }>
}

export function TypeDistributionChart({ data }: TypeDistributionChartProps) {
    return (
        <Card className="border-0 shadow-xl">
            <CardHeader>
                <CardTitle className="text-xl font-bold">توزيع الأصول حسب النوع</CardTitle>
                <CardDescription>إجمالي الأصول لكل نوع</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={data} layout="vertical">
                        <defs>
                            <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#1d4ed8" />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={true} vertical={false} />
                        <XAxis type="number" className="text-xs" tick={{ fill: 'currentColor' }} />
                        <YAxis
                            type="category"
                            dataKey="name"
                            className="text-xs"
                            tick={{ fill: 'currentColor' }}
                            width={80}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: 'none',
                                borderRadius: '12px',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
                            }}
                        />
                        <Bar
                            dataKey="value"
                            fill="url(#barGradient)"
                            radius={[0, 8, 8, 0]}
                            barSize={24}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}

interface DepartmentChartProps {
    data: Array<{
        name: string
        employees: number
        assets: number
    }>
}

export function DepartmentChart({ data }: DepartmentChartProps) {
    return (
        <Card className="col-span-full border-0 shadow-xl">
            <CardHeader>
                <CardTitle className="text-2xl font-black">أفضل الأقسام</CardTitle>
                <CardDescription className="text-base">الأقسام حسب عدد الموظفين والأصول</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={data}>
                        <defs>
                            <linearGradient id="employeesGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#10b981" />
                                <stop offset="100%" stopColor="#047857" />
                            </linearGradient>
                            <linearGradient id="assetsGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#1d4ed8" />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                            dataKey="name"
                            className="text-xs"
                            tick={{ fill: 'currentColor' }}
                            angle={-45}
                            textAnchor="end"
                            height={100}
                        />
                        <YAxis
                            className="text-xs"
                            tick={{ fill: 'currentColor' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: 'none',
                                borderRadius: '12px',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
                            }}
                        />
                        <Legend />
                        <Bar
                            dataKey="employees"
                            name="الموظفين"
                            fill="url(#employeesGradient)"
                            radius={[8, 8, 0, 0]}
                            barSize={30}
                        />
                        <Bar
                            dataKey="assets"
                            name="الأصول"
                            fill="url(#assetsGradient)"
                            radius={[8, 8, 0, 0]}
                            barSize={30}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}

interface RequestsStatusChartProps {
    data: Array<{
        status: string
        count: number
    }>
}

export function RequestsStatusChart({ data }: RequestsStatusChartProps) {
    const statusLabels: Record<string, string> = {
        'PENDING': 'قيد الانتظار',
        'APPROVED': 'تمت الموافقة',
        'REJECTED': 'مرفوض',
        'COMPLETED': 'مكتمل',
        'IN_PROGRESS': 'قيد التنفيذ',
        'CANCELLED': 'ملغي'
    }

    const statusColors: Record<string, string> = {
        'PENDING': '#f59e0b',
        'APPROVED': '#10b981',
        'REJECTED': '#ef4444',
        'COMPLETED': '#3b82f6',
        'IN_PROGRESS': '#8b5cf6',
        'CANCELLED': '#6b7280'
    }

    const chartData = data.map(item => ({
        name: statusLabels[item.status] || item.status,
        value: item.count,
        fill: statusColors[item.status] || '#64748b'
    }))

    const total = chartData.reduce((sum, item) => sum + item.value, 0)

    return (
        <Card className="border-0 shadow-xl">
            <CardHeader>
                <CardTitle className="text-xl font-bold">حالة الطلبات</CardTitle>
                <CardDescription>إجمالي {total.toLocaleString('ar')} طلب</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={65}
                            outerRadius={95}
                            paddingAngle={4}
                            dataKey="value"
                            strokeWidth={0}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: 'none',
                                borderRadius: '12px',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
                            }}
                        />
                        <Legend
                            wrapperStyle={{ paddingTop: '20px' }}
                            formatter={(value) => <span className="text-sm font-medium">{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}

// Power BI-style KPI Gauge Component
interface KPIGaugeProps {
    title: string
    value: number
    target: number
    unit?: string
    color?: string
}

export function KPIGauge({ title, value, target, unit = '%', color = '#3b82f6' }: KPIGaugeProps) {
    const percentage = Math.min((value / target) * 100, 100)
    const data = [{ value: percentage, fill: color }]

    return (
        <Card className="border-0 shadow-xl">
            <CardContent className="pt-6">
                <div className="text-center mb-2">
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                </div>
                <ResponsiveContainer width="100%" height={160}>
                    <RadialBarChart
                        cx="50%"
                        cy="50%"
                        innerRadius="60%"
                        outerRadius="90%"
                        barSize={12}
                        data={data}
                        startAngle={180}
                        endAngle={0}
                    >
                        <defs>
                            <linearGradient id={`gauge-${title}`} x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                                <stop offset="100%" stopColor={color} stopOpacity={1} />
                            </linearGradient>
                        </defs>
                        <RadialBar
                            background={{ fill: 'hsl(var(--muted))' }}
                            dataKey="value"
                            fill={`url(#gauge-${title})`}
                            cornerRadius={10}
                        />
                    </RadialBarChart>
                </ResponsiveContainer>
                <div className="text-center -mt-16">
                    <p className="text-4xl font-black" style={{ color }}>{value.toLocaleString('ar')}{unit}</p>
                    <p className="text-xs text-muted-foreground mt-1">الهدف: {target.toLocaleString('ar')}{unit}</p>
                </div>
            </CardContent>
        </Card>
    )
}

// Power BI-style Sparkline Card
interface SparklineCardProps {
    title: string
    value: number
    change: number
    data: number[]
    color?: string
}

export function SparklineCard({ title, value, change, data, color = '#3b82f6' }: SparklineCardProps) {
    const chartData = data.map((v, i) => ({ value: v, index: i }))
    const isPositive = change >= 0

    return (
        <Card className="border-0 shadow-lg overflow-hidden">
            <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <span className={cn(
                        "text-xs font-bold px-2 py-0.5 rounded-full",
                        isPositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )}>
                        {isPositive ? '+' : ''}{change}%
                    </span>
                </div>
                <p className="text-3xl font-black mb-3">{value.toLocaleString('ar')}</p>
                <ResponsiveContainer width="100%" height={50}>
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id={`sparkline-${title}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={color}
                            strokeWidth={2}
                            fill={`url(#sparkline-${title})`}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}

// Power BI-style Comparison Bar
interface ComparisonBarProps {
    title: string
    items: Array<{
        label: string
        value: number
        color: string
    }>
}

export function ComparisonBar({ title, items }: ComparisonBarProps) {
    const maxValue = Math.max(...items.map(i => i.value))

    return (
        <Card className="border-0 shadow-xl">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold">{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {items.map((item, index) => (
                    <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium">{item.label}</span>
                            <span className="font-bold">{item.value.toLocaleString('ar')}</span>
                        </div>
                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-1000 ease-out"
                                style={{
                                    width: `${(item.value / maxValue) * 100}%`,
                                    background: `linear-gradient(90deg, ${item.color}, ${item.color}dd)`
                                }}
                            />
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}

interface DailyRequestsChartProps {
    data: Array<{
        date: string | Date
        count: number
    }>
}

export function DailyRequestsChart({ data }: DailyRequestsChartProps) {
    // Format data for chart
    const chartData = data.map(item => ({
        date: new Date(item.date).toLocaleDateString('ar-EG', { weekday: 'short', day: 'numeric' }),
        fullDate: new Date(item.date).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        count: item.count
    }))

    return (
        <Card className="border-0 shadow-xl">
            <CardHeader>
                <CardTitle className="text-xl font-bold">الطلبات خلال آخر 7 أيام</CardTitle>
                <CardDescription>تحليل حجم الطلبات اليومي</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                        <XAxis
                            dataKey="date"
                            className="text-xs"
                            tick={{ fill: 'currentColor' }}
                            tickMargin={10}
                        />
                        <YAxis
                            className="text-xs"
                            tick={{ fill: 'currentColor' }}
                            allowDecimals={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: 'none',
                                borderRadius: '12px',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
                            }}
                            labelStyle={{ color: 'hsl(var(--foreground))', marginBottom: '0.5rem' }}
                            labelFormatter={(label, payload) => {
                                if (payload && payload.length > 0) {
                                    return payload[0].payload.fullDate;
                                }
                                return label;
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="count"
                            name="الطلبات"
                            stroke="#2563eb"
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

interface TopEmployeesChartProps {
    data: Array<{
        name: string
        request_count: number
    }>
}

export function TopEmployeesChart({ data }: TopEmployeesChartProps) {
    return (
        <Card className="border-0 shadow-xl">
            <CardHeader>
                <CardTitle className="text-xl font-bold">الموظفون الأكثر نشاطاً</CardTitle>
                <CardDescription>حسب عدد الطلبات المقدمة</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={true} vertical={false} />
                        <XAxis type="number" className="text-xs" tick={{ fill: 'currentColor' }} allowDecimals={false} />
                        <YAxis
                            type="category"
                            dataKey="name"
                            className="text-xs font-medium"
                            tick={{ fill: 'currentColor' }}
                            width={100}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: 'none',
                                borderRadius: '12px',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
                            }}
                            cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                        />
                        <Bar
                            dataKey="request_count"
                            name="عدد الطلبات"
                            radius={[0, 4, 4, 0]}
                            barSize={20}
                        >
                            {// Use predefined gradients or colors from the file if available, otherwise use defaults
                                data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}

