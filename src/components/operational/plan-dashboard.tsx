'use client'

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Plus, Search, Filter, Wallet, CheckCircle2, AlertCircle, TrendingUp, DollarSign, ListTodo, Activity, BarChart2, Layers, Flame, Calendar, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

import { ActivityList } from "./activity-list"

export function PlanDashboard({ plan, year }: { plan: any, year: number }) {
    const [searchQuery, setSearchQuery] = useState("")

    if (!plan) return <div className="p-8 text-center">لا توجد خطة لهذا العام</div>

    const totalBudget = plan.totalBudget || 0
    const totalSpent = plan.activities.reduce((acc: number, act: any) => acc + (act.spent || 0), 0)
    const spentPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

    const completedActivities = plan.activities.filter((a: any) => a.status === 'COMPLETED').length
    const totalActivities = plan.activities.length // This is Projects count
    const completionRate = totalActivities > 0 ? (completedActivities / totalActivities) * 100 : 0

    // New Metrics for 10 Cards
    const totalSubActivities = plan.activities.reduce((acc: number, act: any) => acc + (act.items?.length || 0), 0)
    const highPriorityCount = plan.activities.filter((a: any) => a.priority === 'HIGH').length
    const pendingCount = plan.activities.filter((a: any) => a.status === 'PENDING').length
    const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3)
    const currentQuarterProjects = plan.activities.filter((a: any) => a.quarter === currentQuarter).length
    const avgProjectBudget = totalActivities > 0 ? totalBudget / totalActivities : 0

    return (
        <div className="space-y-6">
            {/* Summary Cards - 10 Cards Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">

                {/* 1. Total Budget */}
                <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-slate-900 dark:to-slate-950 border-blue-100 dark:border-blue-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-600">الميزانية الإجمالية</CardTitle>
                        <Wallet className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalBudget.toLocaleString()} <span className="text-xs text-muted-foreground">ر.س</span></div>
                        <Progress value={spentPercentage} className="h-2 mt-3" />
                    </CardContent>
                </Card>

                {/* 2. Total Spent */}
                <Card className="bg-gradient-to-br from-orange-50 to-white dark:from-slate-900 dark:to-slate-950 border-orange-100 dark:border-orange-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-orange-600">المصروف الفعلي</CardTitle>
                        <DollarSign className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">{totalSpent.toLocaleString()} <span className="text-xs text-muted-foreground">ر.س</span></div>
                        <p className="text-xs text-muted-foreground mt-2">تم صرف {spentPercentage.toFixed(1)}%</p>
                    </CardContent>
                </Card>

                {/* 3. Budget Surplus */}
                <Card className="bg-gradient-to-br from-emerald-50 to-white dark:from-slate-900 dark:to-slate-950 border-emerald-100 dark:border-emerald-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-600">فائض الموازنة</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{(totalBudget - totalSpent).toLocaleString()} <span className="text-xs text-emerald-600/70">ر.س</span></div>
                        <p className="text-xs text-emerald-600/70 mt-2">المتاح للصرف</p>
                    </CardContent>
                </Card>

                {/* 4. Average Project Cost */}
                <Card className="bg-gradient-to-br from-cyan-50 to-white dark:from-slate-900 dark:to-slate-950 border-cyan-100 dark:border-cyan-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-cyan-600">متوسط تكلفة المشروع</CardTitle>
                        <Activity className="h-4 w-4 text-cyan-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-cyan-700 dark:text-cyan-400">{avgProjectBudget.toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-xs text-muted-foreground">ر.س</span></div>
                        <p className="text-xs text-muted-foreground mt-2">لكل مشروع</p>
                    </CardContent>
                </Card>

                {/* 5. Completion Rate */}
                <Card className="bg-gradient-to-br from-indigo-50 to-white dark:from-slate-900 dark:to-slate-950 border-indigo-100 dark:border-indigo-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-indigo-600">نسبة الإنجاز العام</CardTitle>
                        <BarChart2 className="h-4 w-4 text-indigo-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completionRate.toFixed(1)}%</div>
                        <Progress value={completionRate} className="h-2 mt-3 bg-indigo-100" indicatorClassName="bg-indigo-600" />
                    </CardContent>
                </Card>

                {/* 6. Total Projects */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">إجمالي المشاريع</CardTitle>
                        <Layers className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalActivities}</div>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <span className="text-green-600">{completedActivities} مكتمل</span>
                            <span>•</span>
                            <span className="text-yellow-600">{totalActivities - completedActivities} جاري</span>
                        </div>
                    </CardContent>
                </Card>

                {/* 7. High Priority */}
                <Card className="border-l-4 border-l-red-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-red-600">مشاريع ذات أولوية</CardTitle>
                        <Flame className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-700 dark:text-red-400">{highPriorityCount}</div>
                        <p className="text-xs text-muted-foreground mt-2">مشاريع عاجلة (High)</p>
                    </CardContent>
                </Card>

                {/* 8. Current Quarter */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">خطط الربع الحالي (Q{currentQuarter})</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{currentQuarterProjects}</div>
                        <p className="text-xs text-muted-foreground mt-2">مشروع مجدول في Q{currentQuarter}</p>
                    </CardContent>
                </Card>

                {/* 9. Pending Projects */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">مشاريع لم تبدأ</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingCount}</div>
                        <p className="text-xs text-muted-foreground mt-2">حالة "معلق" (Pending)</p>
                    </CardContent>
                </Card>

                {/* 10. Total Sub-Activities */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">إجمالي الأنشطة الفرعية</CardTitle>
                        <ListTodo className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalSubActivities}</div>
                        <p className="text-xs text-muted-foreground mt-2">بند تشغيلي في كل المشاريع</p>
                    </CardContent>
                </Card>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border shadow-sm">
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="بحث بإسم النشاط أو الرمز..."
                            className="pr-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Link href={`/admin/operational-plan/new?planId=${plan.id}`}>
                        <Button className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-105 active:scale-95">
                            <Plus className="h-5 w-5" />
                            إضافة نشاط جديد
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Activity List */}
            <ActivityList activities={plan.activities} searchQuery={searchQuery} />
        </div>
    )
}
