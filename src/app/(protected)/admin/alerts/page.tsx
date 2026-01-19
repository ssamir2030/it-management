'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import {
    Bell,
    AlertTriangle,
    AlertCircle,
    Info,
    Check,
    X,
    RefreshCw,
    Shield,
    Key,
    Monitor,
    CheckCircle2,
    Clock
} from "lucide-react"
import { toast } from "sonner"
import {
    getActiveAlerts,
    getAlertsSummary,
    markAlertAsRead,
    dismissAlert,
    markAllAlertsAsRead,
    refreshAlerts
} from '@/app/actions/alerts'
import Link from 'next/link'

const severityConfig = {
    CRITICAL: { color: 'bg-red-500', text: 'حرج', icon: AlertCircle, bgLight: 'bg-red-50 dark:bg-red-950/30' },
    WARNING: { color: 'bg-amber-500', text: 'تحذير', icon: AlertTriangle, bgLight: 'bg-amber-50 dark:bg-amber-950/30' },
    INFO: { color: 'bg-blue-500', text: 'معلومة', icon: Info, bgLight: 'bg-blue-50 dark:bg-blue-950/30' }
}

const typeConfig = {
    WARRANTY: { icon: Shield, text: 'ضمان', color: 'text-orange-600' },
    LICENSE: { icon: Key, text: 'ترخيص', color: 'text-purple-600' },
    MAINTENANCE: { icon: Monitor, text: 'صيانة', color: 'text-blue-600' }
}

export default function AlertsPage() {
    const [alerts, setAlerts] = useState<any[]>([])
    const [summary, setSummary] = useState({ total: 0, unread: 0, critical: 0, warning: 0 })
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        const [alertsRes, summaryRes] = await Promise.all([
            getActiveAlerts(),
            getAlertsSummary()
        ])

        if (alertsRes.success) setAlerts(alertsRes.data || [])
        if (summaryRes.success) setSummary(summaryRes.data)
        setLoading(false)
    }

    const handleRefresh = async () => {
        setRefreshing(true)
        const result = await refreshAlerts()
        if (result.success) {
            toast.success(result.message)
            await loadData()
        } else {
            toast.error(result.error)
        }
        setRefreshing(false)
    }

    const handleMarkAsRead = async (id: string) => {
        await markAlertAsRead(id)
        setAlerts(alerts.map(a => a.id === id ? { ...a, isRead: true } : a))
        setSummary({ ...summary, unread: Math.max(0, summary.unread - 1) })
    }

    const handleDismiss = async (id: string) => {
        await dismissAlert(id)
        setAlerts(alerts.filter(a => a.id !== id))
        setSummary({ ...summary, total: Math.max(0, summary.total - 1) })
        toast.success('تم تجاهل التنبيه')
    }

    const handleMarkAllRead = async () => {
        await markAllAlertsAsRead()
        setAlerts(alerts.map(a => ({ ...a, isRead: true })))
        setSummary({ ...summary, unread: 0 })
        toast.success('تم تحديث جميع التنبيهات')
    }

    return (
        <div className="space-y-6" dir="rtl">
            <PremiumPageHeader
                title="التنبيهات الذكية"
                description="مراقبة انتهاء الضمانات والتراخيص ومواعيد الصيانة"
                icon={Bell}
                rightContent={
                    <div className="flex gap-2">
                        <Button
                            variant="secondary"
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="gap-2"
                        >
                            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                            تحديث
                        </Button>
                        <Link href="/settings/alerts">
                            <Button variant="outline" className="gap-2 text-white border-white/30 hover:bg-white/10">
                                الإعدادات
                            </Button>
                        </Link>
                    </div>
                }
            />

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="border-t-4 border-t-blue-500">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">إجمالي التنبيهات</p>
                                <p className="text-3xl font-bold">{summary.total}</p>
                            </div>
                            <Bell className="h-8 w-8 text-blue-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-t-4 border-t-amber-500">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">غير مقروءة</p>
                                <p className="text-3xl font-bold">{summary.unread}</p>
                            </div>
                            <Clock className="h-8 w-8 text-amber-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-t-4 border-t-red-500">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">حرجة</p>
                                <p className="text-3xl font-bold text-red-600">{summary.critical}</p>
                            </div>
                            <AlertCircle className="h-8 w-8 text-red-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-t-4 border-t-emerald-500">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">تحذيرات</p>
                                <p className="text-3xl font-bold">{summary.warning}</p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-amber-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Alerts List */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>قائمة التنبيهات</CardTitle>
                        <CardDescription>التنبيهات النشطة التي تحتاج انتباهك</CardDescription>
                    </div>
                    {summary.unread > 0 && (
                        <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            تحديد الكل كمقروء
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-12 text-muted-foreground">جاري التحميل...</div>
                    ) : alerts.length === 0 ? (
                        <div className="text-center py-12">
                            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                            <p className="text-lg font-medium">لا توجد تنبيهات نشطة</p>
                            <p className="text-muted-foreground">جميع الأصول والتراخيص في حالة جيدة</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {alerts.map((alert) => {
                                const severity = severityConfig[alert.severity as keyof typeof severityConfig] || severityConfig.INFO
                                const type = typeConfig[alert.type as keyof typeof typeConfig] || typeConfig.WARRANTY
                                const SeverityIcon = severity.icon
                                const TypeIcon = type.icon

                                return (
                                    <div
                                        key={alert.id}
                                        className={`p-4 rounded-xl border transition-all ${severity.bgLight} ${!alert.isRead ? 'ring-2 ring-offset-2 ring-blue-200' : ''}`}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-4">
                                                <div className={`p-2 rounded-lg ${severity.color} text-white`}>
                                                    <SeverityIcon className="h-5 w-5" />
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold">{alert.title}</h4>
                                                        {!alert.isRead && (
                                                            <Badge variant="secondary" className="text-xs">جديد</Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <Badge variant="outline" className="gap-1">
                                                            <TypeIcon className={`h-3 w-3 ${type.color}`} />
                                                            {type.text}
                                                        </Badge>
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Date(alert.expiryDate).toLocaleDateString('ar-SA')}
                                                        </span>
                                                        <Badge
                                                            variant={alert.daysLeft <= 7 ? 'destructive' : 'secondary'}
                                                            className="text-xs"
                                                        >
                                                            {alert.daysLeft} يوم متبقي
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {!alert.isRead && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => handleMarkAsRead(alert.id)}
                                                        title="تحديد كمقروء"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => handleDismiss(alert.id)}
                                                    title="تجاهل"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
