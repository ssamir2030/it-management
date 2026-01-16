export const dynamic = 'force-dynamic';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
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
    Lightbulb
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getDashboardStats } from "@/app/actions/dashboard"
import { DashboardCharts } from "@/components/dashboard/dashboard-charts"
import { InventoryAlerts } from "@/components/dashboard/inventory-alerts"
import { HealthCheckDialog } from "@/components/admin/HealthCheckDialog"

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
                <Card className="card-elevated hover-scale border-t-4 border-t-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">إجمالي الطلبات</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dashboardData.totalRequests}</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <TrendingUp className="h-3 w-3 text-green-500" />
                            +20.1% من الشهر الماضي
                        </p>
                    </CardContent>
                </Card>
                <Card className="card-elevated hover-scale border-t-4 border-t-yellow-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">قيد الانتظار</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dashboardData.pendingRequests}</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <AlertTriangle className="h-3 w-3 text-yellow-500" />
                            تتطلب اهتماماً فورياً
                        </p>
                    </CardContent>
                </Card>
                <Card className="card-elevated hover-scale border-t-4 border-t-green-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">نسبة الإنجاز</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dashboardData.completionRate}%</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            معدل إغلاق التذاكر هذا الأسبوع
                        </p>
                    </CardContent>
                </Card>
                <Card className="card-elevated hover-scale border-t-4 border-t-purple-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">رضا الموظفين</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dashboardData.customerSatisfaction}/5</div>
                        <p className="text-xs text-muted-foreground mt-1">
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

            {/* Recent Requests Section - Keeping it as legacy list for now, but encapsulated in grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 animate-slide-up stagger-3">
                <Card className="col-span-4 card-elevated">
                    <CardHeader>
                        <CardTitle>آخر الطلبات</CardTitle>
                        <CardDescription>
                            يوجد {dashboardData.pendingRequests} طلبات قيد الانتظار حالياً
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {dashboardData.recentRequests && dashboardData.recentRequests.length > 0 ? (
                                dashboardData.recentRequests.map((req: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold text-sm">
                                                {req.employeeName?.[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{req.employeeName}</p>
                                                <p className="text-xs text-muted-foreground">{req.department}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-xs px-2 py-1 rounded-full ${req.status === 'PENDING' || req.status === 'OPEN' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                                                }`}>
                                                {req.status === 'PENDING' || req.status === 'OPEN' ? 'قيد الانتظار' : req.status === 'CLOSED' ? 'مغلقة' : req.status}
                                            </span>
                                            <p className="text-xs text-muted-foreground mt-1">{new Date(req.createdAt).toLocaleDateString('ar-SA')}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-muted-foreground py-8">لا توجد طلبات حديثة</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* System Health / Quick Actions */}
                <Card className="col-span-3 card-elevated">
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
