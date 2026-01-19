'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, AlertTriangle, AlertCircle, ArrowLeft, RefreshCw } from "lucide-react"
import { getActiveAlerts, getAlertsSummary, refreshAlerts } from '@/app/actions/alerts'
import Link from 'next/link'

export function AlertsWidget() {
    const [alerts, setAlerts] = useState<any[]>([])
    const [summary, setSummary] = useState({ total: 0, unread: 0, critical: 0, warning: 0 })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        const [alertsRes, summaryRes] = await Promise.all([
            getActiveAlerts(),
            getAlertsSummary()
        ])

        if (alertsRes.success) setAlerts((alertsRes.data || []).slice(0, 5))
        if (summaryRes.success) setSummary(summaryRes.data)
        setLoading(false)
    }

    const handleRefresh = async () => {
        setLoading(true)
        await refreshAlerts()
        await loadData()
    }

    if (loading) {
        return (
            <Card className="h-full">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Bell className="h-4 w-4" />
                        التنبيهات
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground text-sm">جاري التحميل...</div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="h-full">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Bell className="h-4 w-4" />
                    التنبيهات
                    {summary.unread > 0 && (
                        <Badge variant="destructive" className="text-xs px-1.5 py-0">
                            {summary.unread}
                        </Badge>
                    )}
                </CardTitle>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleRefresh}>
                    <RefreshCw className="h-3.5 w-3.5" />
                </Button>
            </CardHeader>
            <CardContent className="space-y-2">
                {/* Quick Stats */}
                {(summary.critical > 0 || summary.warning > 0) && (
                    <div className="flex gap-2 mb-3">
                        {summary.critical > 0 && (
                            <Badge variant="destructive" className="gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {summary.critical} حرج
                            </Badge>
                        )}
                        {summary.warning > 0 && (
                            <Badge variant="secondary" className="gap-1 bg-amber-100 text-amber-700">
                                <AlertTriangle className="h-3 w-3" />
                                {summary.warning} تحذير
                            </Badge>
                        )}
                    </div>
                )}

                {/* Alerts List */}
                {alerts.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground text-sm">
                        <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        لا توجد تنبيهات
                    </div>
                ) : (
                    <div className="space-y-2">
                        {alerts.map((alert) => (
                            <div
                                key={alert.id}
                                className={`p-2.5 rounded-lg border text-sm ${alert.severity === 'CRITICAL' ? 'bg-red-50 border-red-200 dark:bg-red-950/30' :
                                        alert.severity === 'WARNING' ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/30' :
                                            'bg-blue-50 border-blue-200 dark:bg-blue-950/30'
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{alert.entityName || alert.title}</p>
                                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                            <Badge variant="outline" className="text-[10px] px-1 py-0">
                                                {alert.type === 'WARRANTY' ? 'ضمان' : 'ترخيص'}
                                            </Badge>
                                            <span>{alert.daysLeft} يوم</span>
                                        </div>
                                    </div>
                                    {alert.severity === 'CRITICAL' && (
                                        <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* View All Link */}
                {summary.total > 0 && (
                    <Link href="/admin/alerts" className="block mt-3">
                        <Button variant="ghost" size="sm" className="w-full gap-1 text-xs">
                            عرض الكل ({summary.total})
                            <ArrowLeft className="h-3 w-3" />
                        </Button>
                    </Link>
                )}
            </CardContent>
        </Card>
    )
}
