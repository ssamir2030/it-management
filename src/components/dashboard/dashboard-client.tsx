'use client'

import { useRouter } from 'next/navigation'
import {
    Monitor, Users, LifeBuoy, FileText, BarChart3, Clock, Database, Zap, Sparkles,
    Boxes, Building2, AlertCircle, Wrench, Shield, Package, Activity, Target, Plus, ShoppingCart,
    TrendingUp, TrendingDown, Award, CheckCircle2,
    UserCheck, MapPin, ClipboardList,
    // New icons for system overview
    Network, Repeat, Phone, Key, Truck, DoorOpen, BookOpen, Radio, AppWindow, Layers, MessageCircle, CalendarClock, CreditCard
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { TrendChart, StatusPieChart, TypeDistributionChart, RequestsStatusChart, KPIGauge, DailyRequestsChart, TopEmployeesChart } from '@/components/dashboard/charts'
import { RequestsOverview } from '@/components/dashboard/requests-overview'
import { RecentActivities } from '@/components/dashboard/recent-activities'
import { cn } from '@/lib/utils'
import { ExportButton } from '@/components/ui/export-button'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

interface DashboardClientProps {
    data: {
        stats: {
            assets: { total: number; available: number; assigned: number; thisMonth: number; growth: number };
            employees: { total: number; thisMonth: number; growth: number };
            tickets: { total: number; open: number; closed: number; growth: number };
        };
        quickStats: {
            inventory: number;
            requests: number;
            departments: number;
            users: number;
            locations: number;
            documents: number;
            maintenance: number;
            lowStock: number;
            completedRequests: number;
        };
        metrics: {
            resolvedTickets: number;
            approvedRequests: number;
            totalRequests: number;
        };
        alerts: {
            critical: number;
            expiring: number;
            breachedSLA: number;
            expiringLicenses: number;
            expiringSubscriptions: number;
            lowConsumables: number;
            pendingReminders: number;
            maintenance: number;
            pendingPurchaseOrders: number;
            lowStock: number;
        };
        charts: {
            statusResult: any;
            typeResult: any;
            trendsResult: any;
            requestsResult: any;
        };
        activity: {
            recentAssets: any[];
            recentTickets: any[];
            recentRequests: any[];
        };
        systemOverview?: {
            networkDevices: number;
            activeNetworkDevices: number;
            subscriptions: number;
            expiringSubscriptions: number;
            telecomServices: number;
            consumables: number;
            lowConsumables: number;
            licenses: number;
            expiringLicenses: number;
            suppliers: number;
            meetingRooms: number;
            todayBookings: number;
            articles: number;
            remoteAgents: number;
            onlineAgents: number;
            softwareCatalog: number;
            custodyItems: number;
            breachedSLA: number;
            activeChats: number;
            todayLogs: number;
            courses: number;
            pendingBookings: number;
            // NEW: Complete coverage
            discoveredDevices: number;
            newDiscoveredDevices: number;
            subnets: number;
            ipAddresses: number;
            usedIpAddresses: number;
            visitors: number;
            todayVisits: number;
            purchaseOrders: number;
            pendingPurchaseOrders: number;
            activeAnnouncements: number;
            assetAudits: number;
            pendingReminders: number;
            activeAutomations: number;
            activeOperationalPlans: number;
            activeContracts: number;
            racks: number;
            certificates: number;
        };
        financials?: {
            totalAssetsValue: number;
            totalLicensesCost: number;
            totalInventoryValue: number;
            monthlyRecurring: number;
        };
        requestsTrend?: {
            date: string;
            count: number;
        }[];
    }
}

export function DashboardClient({ data }: DashboardClientProps) {
    const { stats, quickStats, metrics, alerts, charts, activity, systemOverview, financials, requestsTrend } = data

    const handleExportExcel = () => {
        const wb = XLSX.utils.book_new()

        // 1. General Stats Sheet
        const statsData = [
            ["الفئة", "القيمة", "الوصف"],
            ["إجمالي الأصول", stats.assets.total, `${stats.assets.available} متاح`],
            ["إجمالي الموظفين", stats.employees.total, `${stats.employees.thisMonth} جديد`],
            ["تذاكر الدعم", stats.tickets.total, `${stats.tickets.open} مفتوح`],
            ["إجمالي الطلبات", metrics.totalRequests, `${metrics.approvedRequests} تمت الموافقة`]
        ]
        const wsStats = XLSX.utils.aoa_to_sheet(statsData)
        XLSX.utils.book_append_sheet(wb, wsStats, "نظرة عامة")

        // 2. Quick Stats Sheet
        const quickStatsData = [
            ["المقياس", "القيمة"],
            ["المخزون", quickStats.inventory],
            ["الطلبات", quickStats.requests],
            ["الأقسام", quickStats.departments],
            ["المستخدمين", quickStats.users],
            ["المواقع", quickStats.locations],
            ["المستندات", quickStats.documents],
            ["في الصيانة", quickStats.maintenance],
            ["مخزون منخفض", quickStats.lowStock]
        ]
        const wsQuick = XLSX.utils.aoa_to_sheet(quickStatsData)
        XLSX.utils.book_append_sheet(wb, wsQuick, "إحصائيات سريعة")

        // Write file
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
        const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' })
        saveAs(data, `dashboard-report-${new Date().toISOString().split('T')[0]}.xlsx`)
    }

    const handleExportCSV = () => {
        // Simple CSV for main stats
        const headers = ["Category,Value,Description"]
        const rows = [
            `Total Assets,${stats.assets.total},${stats.assets.available} available`,
            `Total Employees,${stats.employees.total},${stats.employees.thisMonth} new`,
            `Tickets,${stats.tickets.total},${stats.tickets.open} open`,
            `Requests,${metrics.totalRequests},${metrics.approvedRequests} approved`
        ]
        const csvContent = headers.concat(rows).join("\n")
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        saveAs(blob, `dashboard-stats-${new Date().toISOString().split('T')[0]}.csv`)
    }

    return (
        <div className="space-y-10 pb-12 min-h-screen">
            {/* Header */}
            <div className="relative overflow-hidden rounded-[2rem] shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800" />
                <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />

                <div className="relative px-10 py-12">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="p-6 bg-white/20 backdrop-blur-xl rounded-3xl shadow-2xl">
                                <Sparkles className="h-14 w-14 text-white" />
                            </div>
                            <div>
                                <h1 className="text-6xl font-black text-white mb-2 tracking-tight">
                                    لوحة التحكم الشاملة
                                </h1>
                                <p className="text-xl text-blue-100 font-semibold">
                                    رؤية 360° • تحليلات متقدمة • مراقبة فورية
                                </p>
                            </div>
                        </div>

                        {/* Export Button */}
                        <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/10">
                            <ExportButton
                                onExportExcel={handleExportExcel}
                                onExportCSV={handleExportCSV}
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-8">
                        <Badge variant="secondary" className="bg-white/20 backdrop-blur-xl text-white border-0 px-6 py-3 text-sm font-bold shadow-lg">
                            <Clock className="h-5 w-5 ml-2" />
                            {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </Badge>
                        <Badge variant="secondary" className="bg-white/20 backdrop-blur-xl text-white border-0 px-6 py-3 text-sm font-bold shadow-lg">
                            <Zap className="h-5 w-5 ml-2 text-yellow-300" />
                            النظام نشط ومتصل
                        </Badge>
                        <Badge variant="secondary" className="bg-white/20 backdrop-blur-xl text-white border-0 px-6 py-3 text-sm font-bold shadow-lg">
                            <Database className="h-5 w-5 ml-2 text-green-300" />
                            قاعدة البيانات متزامنة
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Dashboard Content - Linear Layout */}

            {/* Dashboard Content - Linear Layout */}

            {/* Premium KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-slide-up stagger-1">
                <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Monitor className="h-24 w-24" />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-blue-100">إجمالي الأصول</CardTitle>
                        <Monitor className="h-4 w-4 text-blue-100" />
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-3xl font-bold">{stats.assets.total}</div>
                        <p className="text-xs text-blue-100/80 flex items-center gap-1 mt-1 font-medium bg-white/20 w-fit px-2 py-0.5 rounded-full backdrop-blur-sm">
                            <TrendingUp className="h-3 w-3" />
                            {stats.assets.available} متاح حالياً
                        </p>
                    </CardContent>
                </Card>
                <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-600 to-pink-600 text-white">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Users className="h-24 w-24" />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-purple-100">الموظفين</CardTitle>
                        <Users className="h-4 w-4 text-purple-100" />
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-3xl font-bold">{stats.employees.total}</div>
                        <p className="text-xs text-purple-100/80 flex items-center gap-1 mt-1 font-medium bg-white/20 w-fit px-2 py-0.5 rounded-full backdrop-blur-sm">
                            <TrendingUp className="h-3 w-3" />
                            {stats.employees.thisMonth} جديد هذا الشهر
                        </p>
                    </CardContent>
                </Card>
                <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <LifeBuoy className="h-24 w-24" />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-amber-100">تذاكر الدعم</CardTitle>
                        <LifeBuoy className="h-4 w-4 text-amber-100" />
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-3xl font-bold">{stats.tickets.total}</div>
                        <p className="text-xs text-amber-100/80 flex items-center gap-1 mt-1 font-medium bg-white/20 w-fit px-2 py-0.5 rounded-full backdrop-blur-sm">
                            {stats.tickets.open} تذكرة مفتوحة
                        </p>
                    </CardContent>
                </Card>
                <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-green-600 text-white">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <ClipboardList className="h-24 w-24" />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-emerald-100">الطلبات</CardTitle>
                        <ClipboardList className="h-4 w-4 text-emerald-100" />
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-3xl font-bold">{metrics.totalRequests}</div>
                        <p className="text-xs text-emerald-100/80 mt-1 font-medium bg-white/20 w-fit px-2 py-0.5 rounded-full backdrop-blur-sm">
                            {metrics.approvedRequests} طلب موافق عليه
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <QuickActionsPanel />

            {/* Financial Overview */}
            {financials && <FinancialOverview data={financials} />}

            {/* Alerts */}
            <CriticalAlerts data={alerts} />



            {/* Analytics Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b border-white/10">
                    <div className="p-2 rounded-xl bg-blue-600/10 text-blue-600">
                        <BarChart3 className="h-6 w-6" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">التحليلات والأداء</h2>
                </div>
                <ChartsSection data={charts} requestsTrend={requestsTrend} />
            </div>

            {/* System Overview Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b border-white/10">
                    <div className="p-2 rounded-xl bg-purple-600/10 text-purple-600">
                        <Database className="h-6 w-6" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">نظرة عامة على النظام</h2>
                </div>
                {systemOverview && <SystemOverview data={systemOverview} />}

                {/* Performance Metrics */}
                <PerformanceDashboard stats={stats} metrics={metrics} />
            </div>

            {/* Activity Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b border-white/10">
                    <div className="p-2 rounded-xl bg-slate-600/10 text-slate-600">
                        <Activity className="h-6 w-6" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">سجل النشاطات</h2>
                </div>
                <RecentActivities requests={activity.recentRequests} />
            </div>
        </div>
    )
}

function FinancialOverview({ data }: { data: NonNullable<DashboardClientProps['data']['financials']> }) {
    const financials = [
        {
            title: "قيمة الأصول المسجلة",
            value: data.totalAssetsValue,
            prefix: "ر.س",
            icon: Monitor,
            gradient: "from-blue-600 to-indigo-600",
            desc: "القيمة الإجمالية لجميع الأجهزة"
        },
        {
            title: "تكلفة التراخيص",
            value: data.totalLicensesCost,
            prefix: "ر.س",
            icon: Key,
            gradient: "from-purple-600 to-pink-600",
            desc: "إجمالي الاستثمار في البرامج"
        },
        {
            title: "قيمة المخزون",
            value: data.totalInventoryValue,
            prefix: "ر.س",
            icon: Package,
            gradient: "from-emerald-600 to-teal-600",
            desc: "المستهلكات وقطع الغيار"
        },
        {
            title: "مصاريف شهرية",
            value: data.monthlyRecurring,
            prefix: "ر.س",
            icon: CreditCard,
            gradient: "from-amber-600 to-orange-600",
            desc: "اشتراكات واتصالات متكررة"
        }
    ]

    return (
        <Card className="border-0 shadow-lg bg-gradient-to-r from-slate-900 to-slate-800 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-32 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 p-32 bg-purple-500/10 rounded-full blur-3xl" />

            <CardHeader className="relative z-10 pb-2">
                <CardTitle className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-white/10">
                        <TrendingUp className="h-5 w-5 text-green-400" />
                    </div>
                    الملخص المالي
                </CardTitle>
                <CardDescription className="text-slate-300">نظرة سريعة على التكاليف وقيمة الأصول</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4 pt-4">
                {financials.map((item, index) => (
                    <div key={index} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <div className={cn("p-2 rounded-lg bg-gradient-to-br shadow-inner", item.gradient)}>
                                <item.icon className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium bg-black/20 px-2 py-1 rounded-full">{item.prefix}</span>
                        </div>
                        <p className="text-slate-300 text-xs font-medium mb-1">{item.title}</p>
                        <h4 className="text-2xl font-bold tracking-tight">{item.value.toLocaleString('ar-SA')}</h4>
                        <p className="text-[10px] text-slate-400 mt-2">{item.desc}</p>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}

// Sub-components - Unified Statistics Section

function QuickStatsGrid({ data }: { data: DashboardClientProps['data']['quickStats'] }) {
    const { inventory, requests, departments, users, locations, documents, completedRequests } = data

    // Pure statistics only - alerts are shown in the dedicated Alerts section
    const quickStats = [
        { label: "المخزون", value: inventory, icon: Boxes, color: "indigo", subtext: null },
        { label: "الطلبات", value: requests, icon: ClipboardList, color: "cyan", subtext: `${completedRequests} مكتمل` },
        { label: "الأقسام", value: departments, icon: Building2, color: "emerald", subtext: null },
        { label: "المستخدمين", value: users, icon: UserCheck, color: "blue", subtext: null },
        { label: "المواقع", value: locations, icon: MapPin, color: "purple", subtext: null },
        { label: "المستندات", value: documents, icon: FileText, color: "pink", subtext: null }
    ]

    const colorMap: Record<string, string> = {
        indigo: "from-indigo-600 to-blue-700 text-white",
        cyan: "from-cyan-600 to-teal-700 text-white",
        emerald: "from-emerald-600 to-green-700 text-white",
        blue: "from-blue-600 to-indigo-700 text-white",
        purple: "from-slate-600 to-slate-700 text-white",
        pink: "from-blue-800 to-indigo-900 text-white"
    }

    return (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            {quickStats.map((stat, index) => (
                <Card key={index} className={cn("border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br", colorMap[stat.color])}>
                    <CardContent className="p-4 text-center">
                        <stat.icon className="h-6 w-6 mx-auto mb-2 opacity-90" />
                        <p className="text-xs font-medium opacity-90 mb-1">{stat.label}</p>
                        <p className="text-2xl font-black">{stat.value.toLocaleString('ar')}</p>
                        {stat.subtext && <p className="text-[10px] mt-1 opacity-80">{stat.subtext}</p>}
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

function PerformanceDashboard({ stats, metrics }: { stats: DashboardClientProps['data']['stats'], metrics: DashboardClientProps['data']['metrics'] }) {
    const { assets, tickets } = stats
    const { resolvedTickets, approvedRequests, totalRequests } = metrics

    const assignmentRate = assets.total > 0 ? Math.round((assets.assigned / assets.total) * 100) : 0
    const availabilityRate = assets.total > 0 ? Math.round((assets.available / assets.total) * 100) : 0
    const resolutionRate = tickets.total > 0 ? Math.round((resolvedTickets / tickets.total) * 100) : 0
    const approvalRate = totalRequests > 0 ? Math.round((approvedRequests / totalRequests) * 100) : 0

    const performanceMetrics = [
        { label: "معدل التعيين", value: assignmentRate, color: "blue", icon: Target },
        { label: "معدل الجاهزية", value: availabilityRate, color: "green", icon: CheckCircle2 },
        { label: "معدل حل التذاكر", value: resolutionRate, color: "indigo", icon: Activity },
        { label: "معدل الموافقة", value: approvalRate, color: "amber", icon: Award }
    ]

    return (
        <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-slate-600">
                        <Target className="h-6 w-6 text-white" />
                    </div>
                    مؤشرات الأداء الرئيسية
                </CardTitle>
                <CardDescription className="text-base">معدلات النجاح والكفاءة في النظام</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
                {performanceMetrics.map((metric, index) => (
                    <div key={index} className="space-y-3 p-4 rounded-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <metric.icon className={cn("h-5 w-5",
                                    metric.color === 'blue' ? 'text-blue-600' :
                                        metric.color === 'green' ? 'text-green-600' :
                                            metric.color === 'indigo' ? 'text-indigo-600' : 'text-amber-600'
                                )} />
                                <span className="text-sm font-semibold">{metric.label}</span>
                            </div>
                            <span className={cn("text-2xl font-black",
                                metric.color === 'blue' ? 'text-blue-600' :
                                    metric.color === 'green' ? 'text-green-600' :
                                        metric.color === 'indigo' ? 'text-indigo-600' : 'text-amber-600'
                            )}>{metric.value}%</span>
                        </div>
                        <Progress value={metric.value} className="h-3" />
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}

function CriticalAlerts({ data }: { data: DashboardClientProps['data']['alerts'] }) {
    const {
        critical,
        expiring,
        breachedSLA,
        expiringLicenses,
        expiringSubscriptions,
        lowConsumables,
        pendingReminders,
        maintenance,
        pendingPurchaseOrders,
        lowStock
    } = data

    // All possible alerts
    const allAlerts = [
        {
            title: "تذاكر عاجلة",
            value: critical,
            icon: AlertCircle,
            gradient: "from-red-600 to-rose-600",
            priority: 1,
            description: "تحتاج تدخل فوري"
        },
        {
            title: "SLA مخالف",
            value: breachedSLA,
            icon: Clock,
            gradient: "from-red-500 to-pink-600",
            priority: 2,
            description: "تذاكر تجاوزت الوقت"
        },
        {
            title: "ضمان ينتهي قريباً",
            value: expiring,
            icon: Shield,
            gradient: "from-orange-500 to-red-500",
            priority: 3,
            description: "خلال 30 يوم"
        },
        {
            title: "تراخيص تنتهي قريباً",
            value: expiringLicenses,
            icon: Key,
            gradient: "from-purple-500 to-pink-500",
            priority: 4,
            description: "تحتاج تجديد"
        },
        {
            title: "اشتراكات تنتهي قريباً",
            value: expiringSubscriptions,
            icon: Repeat,
            gradient: "from-violet-500 to-purple-600",
            priority: 5,
            description: "تحتاج تجديد"
        },
        {
            title: "مستهلكات منخفضة",
            value: lowConsumables,
            icon: Package,
            gradient: "from-amber-500 to-orange-500",
            priority: 6,
            description: "تحت الحد الأدنى"
        },
        {
            title: "مخزون منخفض",
            value: lowStock,
            icon: Boxes,
            gradient: "from-yellow-500 to-amber-500",
            priority: 7,
            description: "يحتاج إعادة تخزين"
        },
        {
            title: "تذكيرات معلقة",
            value: pendingReminders,
            icon: Clock,
            gradient: "from-blue-500 to-indigo-500",
            priority: 8,
            description: "لم يتم إتمامها"
        },
        {
            title: "أصول في الصيانة",
            value: maintenance,
            icon: Wrench,
            gradient: "from-slate-500 to-gray-600",
            priority: 9,
            description: "تحت الصيانة"
        },
        {
            title: "طلبات شراء معلقة",
            value: pendingPurchaseOrders,
            icon: ShoppingCart,
            gradient: "from-indigo-500 to-blue-600",
            priority: 10,
            description: "تنتظر الموافقة"
        }
    ]

    // Filter only alerts with values > 0 and sort by priority
    const activeAlerts = allAlerts
        .filter(a => a.value > 0)
        .sort((a, b) => a.priority - b.priority)

    // Total alerts count
    const totalAlerts = activeAlerts.reduce((sum, a) => sum + a.value, 0)

    // If no alerts, show a success message
    if (activeAlerts.length === 0) {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                        <CheckCircle2 className="h-7 w-7 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-green-600">لا توجد تنبيهات</h3>
                        <p className="text-sm text-muted-foreground">جميع الأنظمة تعمل بشكل طبيعي ✓</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 shadow-lg animate-pulse">
                        <AlertCircle className="h-7 w-7 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black">تنبيهات النظام</h3>
                        <p className="text-sm text-muted-foreground">أمور تحتاج انتباهك الفوري</p>
                    </div>
                </div>
                <Badge variant="destructive" className="text-lg px-4 py-2 font-bold">
                    {totalAlerts} تنبيه
                </Badge>
            </div>

            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
                {activeAlerts.map((alert, index) => (
                    <Card
                        key={index}
                        className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden group cursor-pointer"
                    >
                        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-10 group-hover:opacity-20 transition-opacity", alert.gradient)} />
                        <CardContent className="p-4 relative">
                            <div className="flex items-center gap-3">
                                <div className={cn("p-3 rounded-xl shadow-lg bg-gradient-to-br shrink-0", alert.gradient)}>
                                    <alert.icon className="h-5 w-5 text-white" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold text-muted-foreground truncate">{alert.title}</p>
                                    <p className="text-2xl font-black">{alert.value.toLocaleString('ar')}</p>
                                    <p className="text-[10px] text-muted-foreground truncate">{alert.description}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

function ChartsSection({ data, requestsTrend }: { data: DashboardClientProps['data']['charts'], requestsTrend?: DashboardClientProps['data']['requestsTrend'] }) {
    const { statusResult, typeResult, trendsResult, requestsResult } = data

    // Extract detailed analytics from requestsResult
    const analytics = requestsResult?.success ? requestsResult.data : null

    // Calculate percentages for KPIs if data is available
    const completionRate = analytics?.totalRequests > 0
        ? Math.round((analytics.requestsByStatus.find((s: any) => s.status === 'COMPLETED')?.count || 0) / analytics.totalRequests * 100)
        : 0

    const rejectionRate = analytics?.totalRequests > 0
        ? Math.round((analytics.requestsByStatus.find((s: any) => s.status === 'REJECTED')?.count || 0) / analytics.totalRequests * 100)
        : 0

    return (
        <div className="space-y-8">
            {/* KPI Gauges Section */}
            {analytics && (
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <KPIGauge
                        title="معدل النجاح (مكتمل)"
                        value={completionRate}
                        target={85}
                        color="#10b981"
                    />
                    <KPIGauge
                        title="معدل رضا العملاء"
                        value={analytics.avgRating * 20}
                        target={90}
                        color="#3b82f6"
                        unit="%"
                    />
                    <KPIGauge
                        title="سرعة الاستجابة (ساعات)"
                        value={analytics.avgCompletionTime}
                        target={24}
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
            )}

            <div className="grid gap-6 lg:grid-cols-7">
                {/* Main Trend Chart */}
                {requestsTrend && (
                    <div className="lg:col-span-4">
                        <RequestsOverview data={requestsTrend} />
                    </div>
                )}

                {/* Status Chart */}
                <div className={cn("lg:col-span-3", !requestsTrend && "lg:col-span-7")}>
                    {statusResult?.success && statusResult?.data && (
                        <StatusPieChart data={statusResult.data} />
                    )}
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">

                {typeResult?.success && typeResult?.data && (
                    <TypeDistributionChart data={typeResult.data} />
                )}

                {requestsResult?.success && requestsResult?.data && (
                    <RequestsStatusChart data={requestsResult.data.requestsByStatus} />
                )}

                {/* New Charts: Daily Trends and Top Employees */}
                {analytics && (
                    <>
                        <div className="lg:col-span-2">
                            <DailyRequestsChart data={analytics.last7Days} />
                        </div>
                        <div className="lg:col-span-1">
                            <TopEmployeesChart data={analytics.topEmployees} />
                        </div>
                    </>
                )}

                {trendsResult?.success && trendsResult?.data && (
                    <div className="lg:col-span-3">
                        <TrendChart data={trendsResult.data} />
                    </div>
                )}
            </div>
        </div>
    )
}

function ActivityFeed({ data }: { data: DashboardClientProps['data']['activity'] }) {
    const { recentAssets, recentTickets, recentRequests } = data

    return (
        <div className="grid gap-6 lg:grid-cols-3">
            {/* Recent Assets */}
            <Card className="border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30">
                    <CardTitle className="flex items-center gap-2">
                        <Monitor className="h-5 w-5 text-blue-600" />
                        أحدث الأصول
                    </CardTitle>
                    <CardDescription>آخر 5 أصول مضافة</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                    {recentAssets.map((asset: any) => (
                        <div key={asset.id} className="flex items-center gap-3 p-3 rounded-xl border hover:border-blue-200 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                                <Monitor className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm truncate">{asset.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{asset.employee?.name || 'غير معين'}</p>
                            </div>
                            <Badge variant="outline" className="shrink-0">{asset.tag}</Badge>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Recent Tickets */}
            <Card className="border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30">
                    <CardTitle className="flex items-center gap-2">
                        <LifeBuoy className="h-5 w-5 text-amber-600" />
                        أحدث التذاكر
                    </CardTitle>
                    <CardDescription>آخر 5 طلبات دعم</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                    {recentTickets.map((ticket: any) => (
                        <div key={ticket.id} className="flex items-center gap-3 p-3 rounded-xl border hover:border-orange-200 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 transition-all">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
                                <LifeBuoy className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm truncate">{ticket.title}</p>
                                <p className="text-xs text-muted-foreground">{ticket.createdBy?.name || ticket.employeeName || 'غير معروف'}</p>
                            </div>
                            <Badge variant={ticket.priority === 'URGENT' ? 'destructive' : 'secondary'} className="shrink-0 text-xs">
                                {ticket.priority}
                            </Badge>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Recent Requests */}
            <Card className="border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-green-600" />
                        أحدث الطلبات
                    </CardTitle>
                    <CardDescription>آخر 5 طلبات موظفين</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                    {recentRequests.map((request: any) => (
                        <div key={request.id} className="flex items-center gap-3 p-3 rounded-xl border hover:border-green-200 hover:bg-green-50/50 dark:hover:bg-green-950/20 transition-all">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                                <ClipboardList className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm">
                                    {request.type === 'HARDWARE' ? '🖥️ جهاز' :
                                        request.type === 'SOFTWARE' ? '💿 برنامج' :
                                            request.type === 'INK' ? '🖨️ حبر' :
                                                request.type === 'PAPER' ? '📄 ورق' : '📦 أخرى'}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">{request.employee?.name}</p>
                            </div>
                            <Badge variant={request.status === 'PENDING' ? 'secondary' : request.status === 'APPROVED' ? 'default' : 'outline'} className="shrink-0 text-xs">
                                {request.status === 'PENDING' ? 'معلق' : request.status === 'APPROVED' ? 'موافق' : request.status}
                            </Badge>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    )
}

function SystemOverview({ data }: { data: NonNullable<DashboardClientProps['data']['systemOverview']> }) {
    const router = useRouter()

    const overviewItems = [
        {
            label: "أجهزة الشبكة",
            value: data.networkDevices,
            icon: Network,
            color: "from-cyan-600 to-teal-700",
            subtext: `${data.activeNetworkDevices} نشط`,
            href: "/network"
        },
        {
            label: "الاشتراكات",
            value: data.subscriptions,
            icon: Repeat,
            color: "from-violet-600 to-purple-700",
            subtext: data.expiringSubscriptions > 0 ? `${data.expiringSubscriptions} تنتهي قريباً` : null,
            href: "/subscriptions"
        },
        {
            label: "خطوط الاتصال",
            value: data.telecomServices,
            icon: Phone,
            color: "from-green-600 to-emerald-700",
            subtext: null,
            href: "/telecom"
        },
        {
            label: "المستهلكات",
            value: data.consumables,
            icon: Package,
            color: "from-orange-600 to-amber-700",
            subtext: data.lowConsumables > 0 ? `${data.lowConsumables} منخفض` : null,
            href: "/consumables"
        },
        {
            label: "التراخيص",
            value: data.licenses,
            icon: Key,
            color: "from-rose-600 to-pink-700",
            subtext: data.expiringLicenses > 0 ? `${data.expiringLicenses} تنتهي قريباً` : null,
            href: "/licenses"
        },
        {
            label: "الموردين",
            value: data.suppliers,
            icon: Truck,
            color: "from-slate-600 to-gray-700",
            subtext: null,
            href: "/suppliers"
        },
        {
            label: "قاعات الاجتماعات",
            value: data.meetingRooms,
            icon: DoorOpen,
            color: "from-blue-600 to-indigo-700",
            subtext: data.todayBookings > 0 ? `${data.todayBookings} حجز اليوم` : null,
            href: "/admin/rooms"
        },
        {
            label: "قاعدة المعرفة",
            value: data.articles,
            icon: BookOpen,
            color: "from-teal-600 to-cyan-700",
            subtext: null,
            href: "/knowledge"
        },
        {
            label: "الوصول عن بعد",
            value: data.remoteAgents,
            icon: Radio,
            color: "from-indigo-600 to-blue-700",
            subtext: `${data.onlineAgents} متصل`,
            href: "/remote-access"
        },
        {
            label: "كتالوج البرامج",
            value: data.softwareCatalog,
            icon: AppWindow,
            color: "from-fuchsia-600 to-pink-700",
            subtext: null,
            href: "/admin/software"
        },
        {
            label: "العهد المستلمة",
            value: data.custodyItems,
            icon: UserCheck,
            color: "from-cyan-600 to-blue-700",
            subtext: "إجمالي العهد",
            href: "/custody"
        },
        {
            label: "مراقبة SLA",
            value: data.breachedSLA,
            icon: AlertCircle,
            color: data.breachedSLA > 0 ? "from-red-600 to-rose-700" : "from-emerald-600 to-green-700",
            subtext: data.breachedSLA > 0 ? "تذاكر مخالفة" : "كل شيء جيد",
            href: "/sla-monitor"
        },
        {
            label: "رسائل اليوم",
            value: data.activeChats,
            icon: MessageCircle,
            color: "from-violet-600 to-purple-700",
            subtext: "رسالة جديدة",
            href: "/messages"
        },
        {
            label: "سجل النظام",
            value: data.todayLogs,
            icon: FileText,
            color: "from-slate-600 to-zinc-700",
            subtext: "عمليات اليوم",
            href: "/admin/logs"
        },
        {
            label: "الدورات التدريبية",
            value: data.courses,
            icon: BookOpen,
            color: "from-amber-600 to-orange-700",
            subtext: "مركز المعرفة",
            href: "/admin/courses"
        },
        {
            label: "إدارة الحجوزات",
            value: data.pendingBookings,
            icon: CalendarClock,
            color: data.pendingBookings > 0 ? "from-red-600 to-rose-700" : "from-emerald-600 to-green-700",
            subtext: data.pendingBookings > 0 ? "طلبات معلقة" : "لا طلبات",
            href: "/admin/bookings"
        },
        // NEW: Complete coverage additions
        {
            label: "الأجهزة المكتشفة",
            value: data.discoveredDevices || 0,
            icon: Network,
            color: "from-sky-600 to-blue-700",
            subtext: data.newDiscoveredDevices ? `${data.newDiscoveredDevices} جديد` : null,
            href: "/admin/discovery"
        },
        {
            label: "الشبكات الفرعية",
            value: data.subnets || 0,
            icon: Network,
            color: "from-teal-600 to-emerald-700",
            subtext: data.ipAddresses ? `${data.usedIpAddresses || 0}/${data.ipAddresses} IP` : null,
            href: "/admin/ipam"
        },
        {
            label: "الزوار",
            value: data.visitors || 0,
            icon: Users,
            color: "from-amber-600 to-yellow-700",
            subtext: data.todayVisits ? `${data.todayVisits} زيارة اليوم` : null,
            href: "/admin/visitors"
        },
        {
            label: "أوامر الشراء",
            value: data.purchaseOrders || 0,
            icon: ShoppingCart,
            color: "from-indigo-600 to-violet-700",
            subtext: data.pendingPurchaseOrders ? `${data.pendingPurchaseOrders} معلق` : null,
            href: "/admin/purchasing"
        },
        {
            label: "الإعلانات النشطة",
            value: data.activeAnnouncements || 0,
            icon: Zap,
            color: "from-pink-600 to-rose-700",
            subtext: "إعلان نشط",
            href: "/admin/announcements"
        },
        {
            label: "التدقيق على الأصول",
            value: data.assetAudits || 0,
            icon: Shield,
            color: "from-slate-600 to-gray-700",
            subtext: "عمليات تدقيق",
            href: "/admin/audits"
        },
        {
            label: "التذكيرات المعلقة",
            value: data.pendingReminders || 0,
            icon: Clock,
            color: data.pendingReminders && data.pendingReminders > 0 ? "from-orange-600 to-red-700" : "from-green-600 to-emerald-700",
            subtext: data.pendingReminders && data.pendingReminders > 0 ? "تذكير معلق" : "لا تذكيرات",
            href: "/reminders"
        },
        {
            label: "الأتمتة",
            value: data.activeAutomations || 0,
            icon: Zap,
            color: "from-purple-600 to-fuchsia-700",
            subtext: "قاعدة نشطة",
            href: "/admin/automation"
        },
        {
            label: "الخطة التشغيلية",
            value: data.activeOperationalPlans || 0,
            icon: Target,
            color: "from-blue-600 to-cyan-700",
            subtext: "خطة نشطة",
            href: "/admin/operational-plans"
        },
        {
            label: "عقود الموردين",
            value: data.activeContracts || 0,
            icon: FileText,
            color: "from-teal-600 to-green-700",
            subtext: "عقد نشط",
            href: "/suppliers"
        },
        {
            label: "الخزانات (Racks)",
            value: data.racks || 0,
            icon: Layers,
            color: "from-zinc-600 to-slate-700",
            subtext: "خزانة معدات",
            href: "/admin/racks"
        },
        {
            label: "الشهادات الممنوحة",
            value: data.certificates || 0,
            icon: Award,
            color: "from-amber-600 to-orange-700",
            subtext: "شهادة إتمام",
            href: "/admin/courses"
        }
    ]

    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-4">
                {overviewItems.map((item, index) => (
                    <Card
                        key={index}
                        onClick={() => router.push(item.href)}
                        className={cn(
                            "border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br cursor-pointer",
                            item.color,
                            "text-white"
                        )}
                    >
                        <CardContent className="p-4 text-center">
                            <item.icon className="h-7 w-7 mx-auto mb-2 opacity-90" />
                            <p className="text-xs font-medium opacity-90 mb-1">{item.label}</p>
                            <p className="text-2xl font-black">{item.value.toLocaleString('ar')}</p>
                            {item.subtext && <p className="text-[10px] mt-1 opacity-80">{item.subtext}</p>}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

// ========== Quick Actions Panel ==========
function QuickActionsPanel() {
    const router = useRouter()

    const actions = [
        {
            label: "إضافة أصل جديد",
            icon: Plus,
            href: "/assets/new",
            gradient: "from-blue-600 to-cyan-600",
            description: "تسجيل جهاز أو معدة جديدة"
        },
        {
            label: "إضافة موظف",
            icon: Users,
            href: "/employees/new",
            gradient: "from-emerald-600 to-teal-600",
            description: "تسجيل موظف جديد في النظام"
        },
        {
            label: "أمر شراء جديد",
            icon: ShoppingCart,
            href: "/admin/purchasing",
            gradient: "from-violet-600 to-purple-600",
            description: "إنشاء طلب شراء للمستلزمات"
        },
        {
            label: "إدارة المخزون",
            icon: Package,
            href: "/admin/inventory",
            gradient: "from-rose-600 to-pink-600",
            description: "عرض وإدارة المخزون"
        },
        {
            label: "الطلبات المعلقة",
            icon: ClipboardList,
            href: "/requests",
            gradient: "from-indigo-600 to-blue-600",
            description: "متابعة طلبات الموظفين"
        },
        {
            label: "اكتشاف الشبكة",
            icon: Network,
            href: "/admin/discovery",
            gradient: "from-blue-600 to-indigo-600",
            description: "فحص واكتشاف الأجهزة"
        }
    ]

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b border-white/10">
                <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600">
                    <Zap className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">اختصارات سريعة</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                {actions.map((action, index) => (
                    <Card
                        key={index}
                        onClick={() => router.push(action.href)}
                        className={cn(
                            "border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105",
                            "cursor-pointer group overflow-hidden"
                        )}
                    >
                        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity", action.gradient)} />
                        <CardContent className="p-4 text-center relative">
                            <div className={cn("w-12 h-12 mx-auto mb-3 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg", action.gradient)}>
                                <action.icon className="h-6 w-6 text-white" />
                            </div>
                            <p className="font-bold text-sm mb-1">{action.label}</p>
                            <p className="text-xs text-muted-foreground">{action.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
