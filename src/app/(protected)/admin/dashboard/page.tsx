
export const dynamic = 'force-dynamic';

import {
    Activity,
    CreditCard,
    DollarSign,
    Users,
    CheckCircle2,
    Clock,
    UserCheck,
    AlertTriangle,
    TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getDashboardStats } from "@/app/actions/dashboard"
import { DashboardCharts } from "@/components/dashboard/dashboard-charts"
import { InventoryAlerts } from "@/components/dashboard/inventory-alerts"
import { HealthCheckDialog } from "@/components/admin/HealthCheckDialog"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { RequestsOverview } from "@/components/dashboard/requests-overview"
import { RecentActivities } from "@/components/dashboard/recent-activities"
import { format } from "date-fns"
import { ar } from "date-fns/locale"

export default async function AdminDashboard() {
    const { data: dashboardData } = await getDashboardStats()

    if (!dashboardData) return <div>Failed to load stats</div>

    return (
        <div className="content-spacing animate-fade-in space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        لوحة التحكم الذكية 🧠
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        نظرة شاملة وتحليلات فورية لأداء النظام
                    </p>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                    <HealthCheckDialog />
                    <Button variant="outline" className="hidden sm:flex">
                        تنزيل تقرير PDF
                    </Button>
                    <Link href="/assets/new">
                        <Button className="shadow-lg shadow-primary/20">
                            <Activity className="ml-2 h-4 w-4" />
                            إجراء سريع
                        </Button>
                    </Link>
                </div>
            </div>


            {/* Smart Insights Alert */}
            <InventoryAlerts />

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-slide-up stagger-1">
                <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <CreditCard className="h-24 w-24" />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-blue-100">إجمالي الطلبات</CardTitle>
                        <CreditCard className="h-4 w-4 text-blue-100" />
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-3xl font-bold">{dashboardData.totalRequests}</div>
                        <p className="text-xs text-blue-100/80 flex items-center gap-1 mt-1 font-medium bg-white/20 w-fit px-2 py-0.5 rounded-full backdrop-blur-sm">
                            <TrendingUp className="h-3 w-3" />
                            +20.1% من الشهر الماضي
                        </p>
                    </CardContent>
                </Card>
                <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Clock className="h-24 w-24" />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-amber-100">قيد الانتظار</CardTitle>
                        <Clock className="h-4 w-4 text-amber-100" />
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-3xl font-bold">{dashboardData.pendingRequests}</div>
                        <p className="text-xs text-amber-100/80 flex items-center gap-1 mt-1 font-medium bg-white/20 w-fit px-2 py-0.5 rounded-full backdrop-blur-sm">
                            <AlertTriangle className="h-3 w-3" />
                            تتطلب اهتماماً فورياً
                        </p>
                    </CardContent>
                </Card>
                <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-green-600 text-white">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <CheckCircle2 className="h-24 w-24" />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-emerald-100">نسبة الإنجاز</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-emerald-100" />
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-3xl font-bold">{dashboardData.completionRate}%</div>
                        <p className="text-xs text-emerald-100/80 mt-1 font-medium bg-white/20 w-fit px-2 py-0.5 rounded-full backdrop-blur-sm">
                            معدل إغلاق التذاكر هذا الأسبوع
                        </p>
                    </CardContent>
                </Card>
                <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Users className="h-24 w-24" />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-purple-100">رضا الموظفين</CardTitle>
                        <Users className="h-4 w-4 text-purple-100" />
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-3xl font-bold">{dashboardData.customerSatisfaction}/5</div>
                        <p className="text-xs text-purple-100/80 mt-1 font-medium bg-white/20 w-fit px-2 py-0.5 rounded-full backdrop-blur-sm">
                            بناءً على تقييمات الخدمة
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Smart Charts Section */}
            <DashboardCharts
                assetGrowth={dashboardData.assetGrowth}
                ticketStatus={dashboardData.ticketStatus}
            />

            {/* Recent Requests Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 animate-slide-up stagger-3">
                <RequestsOverview data={dashboardData.requestsTrend || []} />
                <RecentActivities requests={dashboardData.recentRequests || []} />

                {/* System Health / Quick Actions */}
                <Card className="col-span-3 lg:col-span-7 xl:col-span-3 card-elevated h-fit">
                    <CardHeader>
                        <CardTitle>حالة النظام</CardTitle>
                        <CardDescription>مؤشرات الصحة العامة للنظام</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span>صحة البيانات (Data Quality)</span>
                                <span className={dashboardData.counts.assets > 0 ? "text-green-500" : "text-yellow-500"}>
                                    {dashboardData.counts.assets > 0 ? "ممتاز" : "تحتاج مراجعة"}
                                </span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div className={`h-full ${dashboardData.counts.assets > 0 ? "bg-green-500 w-[95%]" : "bg-yellow-500 w-[40%]"}`}></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span>المخزون المنخفض</span>
                                <span className={dashboardData.counts.inventoryLowStock > 0 ? "text-red-500" : "text-green-500"}>
                                    {dashboardData.counts.inventoryLowStock} أصناف
                                </span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div className={`h-full ${dashboardData.counts.inventoryLowStock > 0 ? "bg-red-500 w-[75%]" : "bg-green-500 w-[100%]"}`}></div>
                            </div>
                        </div>

                        <div className="pt-4 mt-4 border-t">
                            <h4 className="text-sm font-semibold mb-3">وصول سريع</h4>
                            <div className="grid grid-cols-2 gap-2">
                                <Link href="/users">
                                    <Button variant="outline" className="w-full text-xs h-8">المستخدمين</Button>
                                </Link>
                                <Link href="/admin/reports">
                                    <Button variant="outline" className="w-full text-xs h-8">التقارير</Button>
                                </Link>
                                <Link href="/settings">
                                    <Button variant="outline" className="w-full text-xs h-8">الإعدادات</Button>
                                </Link>
                                <Link href="/knowledge">
                                    <Button variant="outline" className="w-full text-xs h-8">قاعدة المعرفة</Button>
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

        </div>
    )
}
