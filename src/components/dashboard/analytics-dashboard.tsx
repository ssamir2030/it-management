'use client'

import { KPICard } from "@/components/dashboard/kpi-card"
import { RequestsByStatusChart, RequestsByTypeChart, RequestsTrendChart } from "@/components/dashboard/analytics-charts"
import {
    Activity,
    Users,
    Box,
    Clock,
    CheckCircle2,
    AlertCircle,
    Star,
    TrendingUp
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface AnalyticsDashboardProps {
    data: {
        overview: {
            totalRequests: number
            activeRequests: number
            completedRequests: number
            avgResponseTime: number
            totalAssets: number
            totalEmployees: number
            totalSupportTickets: number
            avgRating: number
            totalRatings: number
            requestsGrowth: number
        }
        charts: {
            requestsByStatus: { status: string; count: number }[]
            requestsByType: { type: string; count: number }[]
            trendData: { date: string; total: number; completed: number; pending: number }[]
        }
        topEmployees: { name: string; requests: number }[]
    }
}

export function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
    const { overview, charts, topEmployees } = data

    return (
        <div className="space-y-8 p-8" dir="rtl">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground">لوحة التحكم التحليلية</h1>
                <p className="text-muted-foreground mt-2">نظرة شاملة على أداء النظام ومؤشرات الأداء الرئيسية</p>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <KPICard
                    title="إجمالي الطلبات"
                    value={overview.totalRequests}
                    icon={Activity}
                    description="جميع الطلبات في النظام"
                    trend={{
                        value: overview.requestsGrowth,
                        isPositive: overview.requestsGrowth >= 0
                    }}
                    iconColor="text-blue-700"
                />

                <KPICard
                    title="الطلبات النشطة"
                    value={overview.activeRequests}
                    icon={Clock}
                    description="قيد المراجعة أو التنفيذ"
                    iconColor="text-indigo-600"
                />

                <KPICard
                    title="الطلبات المكتملة"
                    value={overview.completedRequests}
                    icon={CheckCircle2}
                    description="تم إنجازها بنجاح"
                    iconColor="text-emerald-600"
                />

                <KPICard
                    title="معدل الاستجابة"
                    value={`${overview.avgResponseTime}س`}
                    icon={TrendingUp}
                    description="متوسط وقت إكمال الطلب"
                    iconColor="text-amber-600"
                />

                <KPICard
                    title="إجمالي الأصول"
                    value={overview.totalAssets}
                    icon={Box}
                    description="الأصول المسجلة في النظام"
                    iconColor="text-blue-800"
                />

                <KPICard
                    title="إجمالي الموظفين"
                    value={overview.totalEmployees}
                    icon={Users}
                    description="الموظفين النشطين"
                    iconColor="text-teal-600"
                />

                <KPICard
                    title="تذاكر الدعم"
                    value={overview.totalSupportTickets}
                    icon={AlertCircle}
                    description="طلبات الدعم الفني"
                    iconColor="text-orange-600"
                />

                <KPICard
                    title="التقييم العام"
                    value={overview.avgRating > 0 ? `${overview.avgRating}/5 ⭐` : 'لا يوجد'}
                    icon={Star}
                    description={overview.totalRatings > 0 ? `${overview.totalRatings} تقييم` : 'لا توجد تقييمات بعد'}
                    iconColor="text-yellow-600"
                />
            </div>

            {/* Charts Row 1 */}
            <div className="grid gap-6 md:grid-cols-2">
                <RequestsByStatusChart data={charts.requestsByStatus} />
                <RequestsByTypeChart data={charts.requestsByType} />
            </div>

            {/* Trend Chart */}
            <RequestsTrendChart data={charts.trendData} />

            {/* Top Employees */}
            <Card>
                <CardHeader>
                    <CardTitle>أكثر الموظفين تفاعلاً</CardTitle>
                    <CardDescription>الموظفين الذين لديهم أكبر عدد من الطلبات</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {topEmployees.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">لا توجد بيانات</p>
                        ) : (
                            topEmployees.map((emp, index) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold">
                                            #{index + 1}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-foreground">{emp.name}</p>
                                            <p className="text-sm text-muted-foreground">{emp.requests} طلب</p>
                                        </div>
                                    </div>
                                    <div className="text-2xl font-bold text-blue-700">
                                        {emp.requests}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
