'use client'

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react'
import { getMyReport } from '@/app/actions/employee-portal'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
    FileText,
    Package,
    Star,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    CalendarDays,
    TrendingUp,
    Archive,
    Laptop
} from 'lucide-react'
import Link from 'next/link'
import { PremiumPageHeader } from '@/components/ui/premium-page-header'

interface ReportData {
    employee: {
        id: string
        name: string
        email: string
        jobTitle: string | null
        department: string | null | undefined
    }
    stats: {
        totalRequests: number
        thisMonthRequests: number
        pendingRequests: number
        inProgressRequests: number
        completedRequests: number
        rejectedRequests: number
        totalCustodyItems: number
        totalAssets: number
        thisMonthBookings: number
        ratingsGiven: number
        averageRating: number
    }
    recentRequests: Array<{
        id: string
        type: string
        subject: string | null
        status: string
        priority: string
        createdAt: Date | string
        rating: number | null
        completedAt: Date | string | null
        expectedCompletionDate: Date | string | null
    }>
    custodyItems: Array<{
        id: string
        name: string
        description: string | null
        assignedDate: Date | string
        asset: {
            name: string
            tag: string
            type: string
        } | null
    }>
    assets: Array<{
        id: string
        name: string
        tag: string
        type: string
        status: string
    }>
}

const getStatusConfig = (status: string) => {
    const config: Record<string, { label: string; color: string; icon: any }> = {
        PENDING: { label: 'قيد المراجعة', color: 'bg-yellow-500', icon: Clock },
        IN_PROGRESS: { label: 'قيد التنفيذ', color: 'bg-blue-500', icon: AlertCircle },
        COMPLETED: { label: 'مكتمل', color: 'bg-green-500', icon: CheckCircle2 },
        REJECTED: { label: 'مرفوض', color: 'bg-red-500', icon: XCircle },
        CANCELLED: { label: 'ملغي', color: 'bg-gray-500', icon: XCircle }
    }
    return config[status] || config.PENDING
}

const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
        'HARDWARE': 'أجهزة',
        'SOFTWARE': 'برمجيات',
        'ACCESS': 'صلاحيات',
        'MAINTENANCE': 'صيانة',
        'INK': 'أحبار',
        'PAPER': 'أوراق',
        'SUPPORT': 'دعم فني',
        'OTHER': 'أخرى'
    }
    return types[type] || type
}

export default function MyReportPage() {
    const [data, setData] = useState<ReportData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        loadReport()
    }, [])

    const loadReport = async () => {
        try {
            const result = await getMyReport()
            if (result.success && result.data) {
                // Server returns Date objects, UI expects them as is
                setData(result.data as unknown as ReportData)
            } else {
                setError(result.error || 'فشل في تحميل التقرير')
            }
        } catch (err) {
            setError('حدث خطأ غير متوقع')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-muted-foreground">جاري تحميل التقرير...</p>
                </div>
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600 font-medium">{error}</p>
                </div>
            </div>
        )
    }

    const completionRate = data.stats.totalRequests > 0
        ? Math.round((data.stats.completedRequests / data.stats.totalRequests) * 100)
        : 0

    return (
        <div className="space-y-8 pb-12">
            <PremiumPageHeader
                title="تقريري الشخصي"
                description={`ملخص نشاطي في النظام • ${data.employee.department || 'غير محدد'}`}
                icon={FileText}
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground">إجمالي الطلبات</p>
                                <p className="text-3xl font-black text-blue-700 dark:text-blue-400">{data.stats.totalRequests}</p>
                            </div>
                            <FileText className="h-10 w-10 text-blue-500/30" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground">معدل الإنجاز</p>
                                <p className="text-3xl font-black text-green-700 dark:text-green-400">{completionRate}%</p>
                            </div>
                            <TrendingUp className="h-10 w-10 text-green-500/30" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground">العهد الحالية</p>
                                <p className="text-3xl font-black text-purple-700 dark:text-purple-400">{data.stats.totalCustodyItems}</p>
                            </div>
                            <Package className="h-10 w-10 text-purple-500/30" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground">متوسط تقييماتي</p>
                                <p className="text-3xl font-black text-amber-700 dark:text-amber-400">
                                    {data.stats.averageRating > 0 ? data.stats.averageRating : '-'}
                                </p>
                            </div>
                            <Star className="h-10 w-10 text-amber-500/30" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Request Distribution */}
            <Card className="border-0 shadow-xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        توزيع الطلبات حسب الحالة
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">مكتملة</span>
                        <div className="flex items-center gap-2 flex-1 mx-4">
                            <Progress value={data.stats.totalRequests > 0 ? (data.stats.completedRequests / data.stats.totalRequests) * 100 : 0} className="h-2" />
                        </div>
                        <span className="font-bold text-green-600">{data.stats.completedRequests}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">قيد التنفيذ</span>
                        <div className="flex items-center gap-2 flex-1 mx-4">
                            <Progress value={data.stats.totalRequests > 0 ? (data.stats.inProgressRequests / data.stats.totalRequests) * 100 : 0} className="h-2 [&>div]:bg-blue-500" />
                        </div>
                        <span className="font-bold text-blue-600">{data.stats.inProgressRequests}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">معلقة</span>
                        <div className="flex items-center gap-2 flex-1 mx-4">
                            <Progress value={data.stats.totalRequests > 0 ? (data.stats.pendingRequests / data.stats.totalRequests) * 100 : 0} className="h-2 [&>div]:bg-yellow-500" />
                        </div>
                        <span className="font-bold text-yellow-600">{data.stats.pendingRequests}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">مرفوضة</span>
                        <div className="flex items-center gap-2 flex-1 mx-4">
                            <Progress value={data.stats.totalRequests > 0 ? (data.stats.rejectedRequests / data.stats.totalRequests) * 100 : 0} className="h-2 [&>div]:bg-red-500" />
                        </div>
                        <span className="font-bold text-red-600">{data.stats.rejectedRequests}</span>
                    </div>
                </CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Requests */}
                <Card className="border-0 shadow-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarDays className="h-5 w-5 text-blue-600" />
                            آخر الطلبات
                        </CardTitle>
                        <CardDescription>أحدث 10 طلبات قمت بإنشائها</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {data.recentRequests.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">لا توجد طلبات</p>
                        ) : (
                            <div className="space-y-3">
                                {data.recentRequests.map(request => {
                                    const statusConfig = getStatusConfig(request.status)
                                    const StatusIcon = statusConfig.icon
                                    return (
                                        <Link
                                            key={request.id}
                                            href={`/portal/requests/${request.id}`}
                                            className="block"
                                        >
                                            <div className="flex items-center justify-between p-3 rounded-lg border bg-slate-50/50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-800 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${statusConfig.color}/10`}>
                                                        <StatusIcon className={`h-4 w-4 ${statusConfig.color.replace('bg-', 'text-')}`} />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm">{request.subject || getTypeLabel(request.type)}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {new Date(request.createdAt).toLocaleDateString('ar-EG')}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className="text-xs">
                                                    {statusConfig.label}
                                                </Badge>
                                            </div>
                                        </Link>
                                    )
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Custody Items */}
                <Card className="border-0 shadow-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Archive className="h-5 w-5 text-purple-600" />
                            العهد الحالية
                        </CardTitle>
                        <CardDescription>الأصول والمعدات المسجلة باسمي</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {data.custodyItems.length === 0 && data.assets.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">لا توجد عهد مسجلة</p>
                        ) : (
                            <div className="space-y-3">
                                {data.custodyItems.map(item => (
                                    <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border bg-purple-50/50 dark:bg-purple-900/10">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                                                <Package className="h-4 w-4 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{item.name}</p>
                                                {item.asset && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {item.asset.name} • {item.asset.tag}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(item.assignedDate).toLocaleDateString('ar-EG')}
                                        </span>
                                    </div>
                                ))}
                                {data.assets.map(asset => (
                                    <div key={asset.id} className="flex items-center justify-between p-3 rounded-lg border bg-blue-50/50 dark:bg-blue-900/10">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                                <Laptop className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{asset.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {asset.tag} • {asset.type}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="text-xs">
                                            {asset.status === 'IN_USE' ? 'قيد الاستخدام' : asset.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* This Month Summary */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950/20">
                <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-6 justify-center">
                        <div className="text-center">
                            <p className="text-3xl font-black text-blue-600">{data.stats.thisMonthRequests}</p>
                            <p className="text-sm text-muted-foreground">طلبات هذا الشهر</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-black text-purple-600">{data.stats.thisMonthBookings}</p>
                            <p className="text-sm text-muted-foreground">حجوزات هذا الشهر</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-black text-amber-600">{data.stats.ratingsGiven}</p>
                            <p className="text-sm text-muted-foreground">تقييمات قدمتها</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
