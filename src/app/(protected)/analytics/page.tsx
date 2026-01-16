export const dynamic = 'force-dynamic';

import { getRequestsAnalytics } from '@/app/actions/analytics'
import {
    Activity,
    Target,
    Star,
    Clock,
    BarChart3
} from "lucide-react"
import { EnhancedPageHeader } from "@/components/ui/enhanced-page-header"
import {
    RequestsStatusChart,
    TypeDistributionChart,
    KPIGauge,
    DailyRequestsChart,
    TopEmployeesChart
} from "@/components/dashboard/charts"

export default async function AnalyticsPage() {
    const result = await getRequestsAnalytics()

    if (!result.success || !result.data) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-600">فشل في تحميل البيانات التحليلية</p>
            </div>
        )
    }

    const analytics = result.data

    // Calculate percentages
    const completionRate = analytics.totalRequests > 0
        ? Math.round((analytics.requestsByStatus.find(s => s.status === 'COMPLETED')?.count || 0) / analytics.totalRequests * 100)
        : 0

    const rejectionRate = analytics.totalRequests > 0
        ? Math.round((analytics.requestsByStatus.find(s => s.status === 'REJECTED')?.count || 0) / analytics.totalRequests * 100)
        : 0

    // Prepare data for Type Chart with colors
    const typeData = analytics.requestsByType.map(item => {
        const typeLabels: Record<string, string> = {
            'HARDWARE': 'أجهزة',
            'INK': 'أحبار',
            'PAPER': 'أوراق',
            'SUPPORT': 'دعم فني',
            'MAINTENANCE': 'صيانة',
            'SOFTWARE': 'برامج'
        }

        const typeColors: Record<string, string> = {
            'HARDWARE': '#3b82f6',
            'INK': '#06b6d4',
            'PAPER': '#8b5cf6',
            'SUPPORT': '#10b981',
            'MAINTENANCE': '#f59e0b',
            'SOFTWARE': '#ec4899'
        }

        return {
            name: typeLabels[item.type] || item.type,
            value: item.count,
            fill: typeColors[item.type] || '#64748b'
        }
    })

    return (
        <div className="w-full py-6 space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <EnhancedPageHeader
                title="التحليلات والتقارير"
                description="نظرة شاملة على أداء النظام ومؤشرات الأداء الرئيسية"
                icon={BarChart3}
                iconBgGradient="from-blue-600 to-indigo-700"
                titleGradient="from-blue-700 to-indigo-900 dark:from-blue-400 dark:to-indigo-200"
                stats={[
                    { label: "إجمالي الطلبات", value: analytics.totalRequests, icon: Activity },
                    { label: "معدل الإنجاز", value: `${completionRate}%`, icon: Target },
                    { label: "متوسط التقييم", value: `${analytics.avgRating}/5`, icon: Star },
                    { label: "وقت الإنجاز", value: `${analytics.avgCompletionTime.toFixed(1)}س`, icon: Clock },
                ]}
            />

            {/* Key KPI Gauges */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPIGauge
                    title="معدل النجاح (مكتمل)"
                    value={completionRate}
                    target={85}
                    color="#10b981"
                />
                <KPIGauge
                    title="معدل رضا العملاء"
                    value={analytics.avgRating * 20} // Convert 5 scale to 100%
                    target={90}
                    color="#3b82f6"
                    unit="%"
                />
                <KPIGauge
                    title="سرعة الاستجابة (ساعات)"
                    value={analytics.avgCompletionTime}
                    target={24}  // Assuming target is within 24 hours
                    color="#8b5cf6"
                    unit="س"
                />
                <KPIGauge
                    title="معدل الرفض"
                    value={rejectionRate}
                    target={5}
                    color="#ef4444"
                />
            </div>

            {/* Charts Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Requests by Status */}
                <div className="lg:col-span-1">
                    <RequestsStatusChart data={analytics.requestsByStatus} />
                </div>

                {/* Requests by Type */}
                <div className="lg:col-span-1">
                    <TypeDistributionChart data={typeData} />
                </div>

                {/* Daily Trends - Full Width */}
                <div className="lg:col-span-2">
                    <DailyRequestsChart data={analytics.last7Days} />
                </div>

                {/* Top Employees - Full Width */}
                <div className="lg:col-span-2">
                    <TopEmployeesChart data={analytics.topEmployees} />
                </div>
            </div>
        </div>
    )
}

