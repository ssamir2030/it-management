'use client'

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react'
import { PremiumPageHeader } from '@/components/ui/premium-page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Building2,
    Users,
    Star,
    Package
} from 'lucide-react'
import { getMonthlySpendingReport, getSpendingByCategoryReport, getPurchaseOrdersReport } from '@/app/actions/reports'
import { getSuppliers, rateSupplier } from '@/app/actions/suppliers'
import { cn } from '@/lib/utils'

export default function AnalyticsPage() {
    const [monthlyData, setMonthlyData] = useState<any>(null)
    const [categoryData, setCategoryData] = useState<any>(null)
    const [suppliersData, setSuppliersData] = useState<any[]>([])
    const [ordersStats, setOrdersStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)
        const [monthly, category, suppliers, orders] = await Promise.all([
            getMonthlySpendingReport(),
            getSpendingByCategoryReport(),
            getSuppliers(),
            getPurchaseOrdersReport()
        ])

        if (monthly.success) setMonthlyData(monthly.data)
        if (category.success) setCategoryData(category.data)
        if (suppliers.success) setSuppliersData(suppliers.data || [])
        if (orders.success) setOrdersStats(orders.data?.stats)
        setLoading(false)
    }

    // Calculate max for chart scaling
    const maxMonthlySpending = monthlyData?.months?.length > 0
        ? Math.max(...monthlyData.months.map((m: any) => m.total))
        : 0

    return (
        <div className="space-y-6" dir="rtl">
            <>
                <PremiumPageHeader
                    title="لوحة الإحصائيات المتقدمة"
                    description="تحليل المصروفات وأداء الموردين"
                    icon={BarChart3}
                />

                {loading ? (
                    <div className="text-center text-slate-400 py-12">جاري تحميل البيانات...</div>
                ) : (
                    <>
                        {/* Summary Cards */}
                        <div className="grid md:grid-cols-4 gap-4">
                            <Card className="bg-gradient-to-br from-emerald-600/20 to-emerald-900/20 border-emerald-700">
                                <CardContent className="pt-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm text-emerald-300">إجمالي المصروفات</p>
                                            <p className="text-2xl font-bold text-white mt-1">
                                                {monthlyData?.stats?.totalSpent?.toLocaleString() || 0} ر.س
                                            </p>
                                        </div>
                                        <DollarSign className="h-8 w-8 text-emerald-400" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-blue-600/20 to-blue-900/20 border-blue-700">
                                <CardContent className="pt-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm text-blue-300">عدد أوامر الشراء</p>
                                            <p className="text-2xl font-bold text-white mt-1">
                                                {ordersStats?.total || 0}
                                            </p>
                                        </div>
                                        <Package className="h-8 w-8 text-blue-400" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-purple-600/20 to-purple-900/20 border-purple-700">
                                <CardContent className="pt-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm text-purple-300">عدد الفئات</p>
                                            <p className="text-2xl font-bold text-white mt-1">
                                                {categoryData?.stats?.totalCategories || 0}
                                            </p>
                                        </div>
                                        <Building2 className="h-8 w-8 text-purple-400" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-amber-600/20 to-amber-900/20 border-amber-700">
                                <CardContent className="pt-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm text-amber-300">عدد الموردين</p>
                                            <p className="text-2xl font-bold text-white mt-1">
                                                {suppliersData.length}
                                            </p>
                                        </div>
                                        <Users className="h-8 w-8 text-amber-400" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Charts Section */}
                        <div className="grid lg:grid-cols-2 gap-6">
                            {/* Monthly Spending Chart */}
                            <Card className="bg-slate-900/50 border-slate-700">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-emerald-400" />
                                        المصروفات الشهرية
                                    </CardTitle>
                                    <CardDescription>آخر 12 شهر</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {monthlyData?.months?.length > 0 ? (
                                        <div className="space-y-3">
                                            {monthlyData.months.slice(-8).map((month: any) => (
                                                <div key={month.month} className="flex items-center gap-3">
                                                    <span className="text-sm text-slate-400 w-24 shrink-0">
                                                        {month.monthLabel}
                                                    </span>
                                                    <div className="flex-1 h-6 bg-slate-800 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all"
                                                            style={{ width: `${(month.total / maxMonthlySpending) * 100}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm text-white font-medium w-20 text-left">
                                                        {month.total.toLocaleString()}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center text-slate-400 py-8">لا توجد بيانات</div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Spending by Category */}
                            <Card className="bg-slate-900/50 border-slate-700">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <Building2 className="h-5 w-5 text-purple-400" />
                                        المصروفات حسب الفئة
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {categoryData?.categories?.length > 0 ? (
                                        <div className="space-y-4">
                                            {categoryData.categories.slice(0, 6).map((cat: any, idx: number) => {
                                                const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500', 'bg-pink-500', 'bg-cyan-500']
                                                const percentage = categoryData.stats.totalSpent > 0
                                                    ? (cat.totalSpent / categoryData.stats.totalSpent) * 100
                                                    : 0
                                                return (
                                                    <div key={cat.category} className="space-y-1">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-slate-300">{cat.category}</span>
                                                            <span className="text-white font-medium">{cat.totalSpent.toLocaleString()} ر.س</span>
                                                        </div>
                                                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                                            <div
                                                                className={cn("h-full rounded-full", colors[idx % colors.length])}
                                                                style={{ width: `${percentage}%` }}
                                                            />
                                                        </div>
                                                        <div className="flex justify-between text-xs text-slate-500">
                                                            <span>{cat.orderCount} طلب</span>
                                                            <span>{percentage.toFixed(1)}%</span>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center text-slate-400 py-8">لا توجد بيانات</div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Suppliers Performance */}
                        <Card className="bg-slate-900/50 border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Star className="h-5 w-5 text-amber-400" />
                                    أداء الموردين
                                </CardTitle>
                                <CardDescription>تقييم الموردين وإحصائيات التعامل</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {suppliersData.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-slate-700">
                                                    <th className="text-right py-3 px-4 text-slate-400 font-medium">المورد</th>
                                                    <th className="text-right py-3 px-4 text-slate-400 font-medium">الفئة</th>
                                                    <th className="text-center py-3 px-4 text-slate-400 font-medium">التقييم</th>
                                                    <th className="text-center py-3 px-4 text-slate-400 font-medium">الطلبات</th>
                                                    <th className="text-left py-3 px-4 text-slate-400 font-medium">إجمالي المصروفات</th>
                                                    <th className="text-center py-3 px-4 text-slate-400 font-medium">الحالة</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {suppliersData.slice(0, 10).map((supplier: any) => (
                                                    <tr key={supplier.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                                                        <td className="py-3 px-4 text-white font-medium">{supplier.name}</td>
                                                        <td className="py-3 px-4 text-slate-300">{supplier.category || '-'}</td>
                                                        <td className="py-3 px-4 text-center">
                                                            <div className="flex items-center justify-center gap-1">
                                                                {[1, 2, 3, 4, 5].map(star => (
                                                                    <Star
                                                                        key={star}
                                                                        className={cn(
                                                                            "h-4 w-4",
                                                                            star <= (supplier.rating || 0)
                                                                                ? "fill-amber-400 text-amber-400"
                                                                                : "text-slate-600"
                                                                        )}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4 text-center text-slate-300">
                                                            {supplier.totalOrders || 0}
                                                        </td>
                                                        <td className="py-3 px-4 text-left text-emerald-400 font-medium">
                                                            {(supplier.totalSpent || 0).toLocaleString()} ر.س
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            <Badge variant={supplier.isActive ? "default" : "secondary"}>
                                                                {supplier.isActive ? 'نشط' : 'غير نشط'}
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center text-slate-400 py-8">لا يوجد موردين</div>
                                )}
                            </CardContent>
                        </Card>
                    </>
                )}
            </>
        </div>
    )
}
