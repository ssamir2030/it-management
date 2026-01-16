export const dynamic = 'force-dynamic';

import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getSLAStats, getTicketsAtRisk } from '@/app/actions/sla'
import { SLATimer } from '@/components/sla-timer'
import {
    Clock,
    AlertTriangle,
    CheckCircle,
    TrendingUp,
    Activity,
    BarChart3
} from 'lucide-react'
import Link from 'next/link'
import { PremiumPageHeader } from "@/components/ui/premium-page-header"

async function SLAStatsCards() {
    const result = await getSLAStats()

    if (!result.success || !result.data) {
        return <div className="text-center text-muted-foreground">فشل تحميل الإحصائيات</div>
    }

    const stats = result.data

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        إجمالي التذاكر
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{stats.total}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {stats.active} نشطة
                    </p>
                </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        ضمن SLA
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-green-600">{stats.withinSLA}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {stats.total > 0 ? ((stats.withinSLA / stats.total) * 100).toFixed(1) : 0}% ملتزم
                    </p>
                </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        تجاوزت SLA
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-red-600">{stats.breached}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {stats.breachRate}% معدل التجاوز
                    </p>
                </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        الأداء
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className={`text-3xl font-bold ${stats.breachRate < 10 ? 'text-green-600' : stats.breachRate < 25 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {stats.breachRate >= 90 ? 'ضعيف' : stats.breachRate >= 70 ? 'متوسط' : 'ممتاز'}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        بناءً على معدل الالتزام
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}

async function AtRiskTickets() {
    const result = await getTicketsAtRisk()

    if (!result.success || !result.data) {
        return <div className="text-center text-muted-foreground py-8">لا توجد تذاكر في خطر</div>
    }

    const tickets = result.data

    if (tickets.length === 0) {
        return (
            <div className="text-center py-12">
                <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
                <p className="text-muted-foreground">جميع التذاكر ضمن SLA ✅</p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {tickets.map((sla) => (
                <Link
                    key={sla.id}
                    href={`/support/${sla.ticket.id}`}
                    className="block"
                >
                    <Card className="hover:shadow-md transition-all border-l-4 border-l-orange-500 hover:border-l-red-500">
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold truncate mb-1">
                                        {sla.ticket.title}
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Badge variant="outline" className="text-xs">
                                            {sla.ticket.priority}
                                        </Badge>
                                        <span>•</span>
                                        <span>{sla.ticket.status}</span>
                                        {sla.ticket.assignedTo && (
                                            <>
                                                <span>•</span>
                                                <span className="truncate">{sla.ticket.assignedTo.name}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="shrink-0">
                                    <SLATimer
                                        breachTime={sla.breachTime}
                                        isBreached={sla.isBreached}
                                        status={sla.ticket.status}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    )
}

export default async function SLAPage() {
    return (
        <div className="space-y-6">
            <PremiumPageHeader
                title="مراقبة SLA"
                description="مراقبة مستوى الخدمة والتذاكر المعرضة للتجاوز"
                icon={Clock}
            />

            <Suspense fallback={
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <div className="h-4 bg-muted animate-pulse rounded w-24" />
                            </CardHeader>
                            <CardContent>
                                <div className="h-8 bg-muted animate-pulse rounded w-16" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            }>
                <SLAStatsCards />
            </Suspense>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        تذاكر معرضة للخطر
                    </CardTitle>
                    <CardDescription>
                        التذاكر التي تقترب من تجاوز SLA (أقل من ساعتين)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={
                        <div className="text-center py-12">
                            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                            <p className="text-muted-foreground mt-4">جاري التحميل...</p>
                        </div>
                    }>
                        <AtRiskTickets />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    )
}
