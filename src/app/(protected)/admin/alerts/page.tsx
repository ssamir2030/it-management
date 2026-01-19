'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
    Clock,
    Plus,
    Calendar,
    Trash2,
    ClipboardList
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
import {
    getReminders,
    createReminder,
    markReminderComplete,
    deleteReminder
} from '@/app/actions/reminders'
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

const reminderTypeLabels: Record<string, string> = {
    WARRANTY_EXPIRY: 'انتهاء ضمان',
    MAINTENANCE_DUE: 'صيانة مجدولة',
    CONTRACT_RENEWAL: 'تجديد عقد',
    LICENSE_RENEWAL: 'تجديد ترخيص',
    CUSTOM: 'تذكير مخصص'
}

const priorityConfig = {
    LOW: { color: 'bg-blue-500', label: 'منخفضة' },
    MEDIUM: { color: 'bg-yellow-500', label: 'متوسطة' },
    HIGH: { color: 'bg-red-500', label: 'عالية' }
}

export default function AlertsPage() {
    const [alerts, setAlerts] = useState<any[]>([])
    const [summary, setSummary] = useState({ total: 0, unread: 0, critical: 0, warning: 0 })
    const [reminders, setReminders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [showNewReminder, setShowNewReminder] = useState(false)
    const [newReminder, setNewReminder] = useState({
        title: '',
        description: '',
        dueDate: '',
        type: 'CUSTOM' as const,
        priority: 'MEDIUM' as const
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        const [alertsRes, summaryRes, remindersRes] = await Promise.all([
            getActiveAlerts(),
            getAlertsSummary(),
            getReminders()
        ])

        if (alertsRes.success) setAlerts(alertsRes.data || [])
        if (summaryRes.success) setSummary(summaryRes.data)
        if (remindersRes.success) setReminders(remindersRes.data || [])
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

    const handleCreateReminder = async () => {
        if (!newReminder.title || !newReminder.dueDate) {
            toast.error('يرجى ملء جميع الحقول المطلوبة')
            return
        }

        const result = await createReminder({
            title: newReminder.title,
            description: newReminder.description,
            dueDate: new Date(newReminder.dueDate),
            type: newReminder.type,
            priority: newReminder.priority
        })

        if (result.success) {
            toast.success('تم إضافة التذكير')
            setShowNewReminder(false)
            setNewReminder({ title: '', description: '', dueDate: '', type: 'CUSTOM', priority: 'MEDIUM' })
            loadData()
        } else {
            toast.error(result.error)
        }
    }

    const handleCompleteReminder = async (id: string) => {
        const result = await markReminderComplete(id)
        if (result.success) {
            toast.success('تم إكمال التذكير')
            setReminders(reminders.map(r => r.id === id ? { ...r, completed: true } : r))
        }
    }

    const handleDeleteReminder = async (id: string) => {
        const result = await deleteReminder(id)
        if (result.success) {
            toast.success('تم حذف التذكير')
            setReminders(reminders.filter(r => r.id !== id))
        }
    }

    const pendingReminders = reminders.filter(r => !r.completed)
    const completedReminders = reminders.filter(r => r.completed)

    return (
        <div className="space-y-6" dir="rtl">
            <PremiumPageHeader
                title="التنبيهات الذكية"
                description="مراقبة انتهاء الضمانات والتراخيص والتذكيرات المخصصة"
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
                                <p className="text-sm text-muted-foreground">تنبيهات النظام</p>
                                <p className="text-3xl font-bold">{summary.total}</p>
                            </div>
                            <Bell className="h-8 w-8 text-blue-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-t-4 border-t-purple-500">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">تذكيرات معلقة</p>
                                <p className="text-3xl font-bold">{pendingReminders.length}</p>
                            </div>
                            <ClipboardList className="h-8 w-8 text-purple-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-t-4 border-t-red-500">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">تنبيهات حرجة</p>
                                <p className="text-3xl font-bold text-red-600">{summary.critical}</p>
                            </div>
                            <AlertCircle className="h-8 w-8 text-red-500 opacity-50" />
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
            </div>

            {/* Tabs for Alerts and Reminders */}
            <Tabs defaultValue="alerts" className="w-full">
                <TabsList className="w-full max-w-md">
                    <TabsTrigger value="alerts" className="flex-1 gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        التنبيهات التلقائية
                        {summary.total > 0 && (
                            <Badge variant="secondary" className="mr-1">{summary.total}</Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="reminders" className="flex-1 gap-2">
                        <ClipboardList className="h-4 w-4" />
                        التذكيرات اليدوية
                        {pendingReminders.length > 0 && (
                            <Badge variant="secondary" className="mr-1">{pendingReminders.length}</Badge>
                        )}
                    </TabsTrigger>
                </TabsList>

                {/* Automatic Alerts Tab */}
                <TabsContent value="alerts" className="mt-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>التنبيهات التلقائية</CardTitle>
                                <CardDescription>تنبيهات يتم إنشاؤها تلقائياً من النظام</CardDescription>
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
                </TabsContent>

                {/* Manual Reminders Tab */}
                <TabsContent value="reminders" className="mt-6 space-y-6">
                    {/* New Reminder Form */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>التذكيرات اليدوية</CardTitle>
                                <CardDescription>أضف تذكيرات مخصصة لمهامك</CardDescription>
                            </div>
                            <Button onClick={() => setShowNewReminder(!showNewReminder)} className="gap-2">
                                <Plus className="h-4 w-4" />
                                تذكير جديد
                            </Button>
                        </CardHeader>
                        {showNewReminder && (
                            <CardContent className="border-t pt-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>العنوان *</Label>
                                        <Input
                                            value={newReminder.title}
                                            onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                                            placeholder="عنوان التذكير"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>تاريخ الاستحقاق *</Label>
                                        <Input
                                            type="date"
                                            value={newReminder.dueDate}
                                            onChange={(e) => setNewReminder({ ...newReminder, dueDate: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>النوع</Label>
                                        <Select
                                            value={newReminder.type}
                                            onValueChange={(v) => setNewReminder({ ...newReminder, type: v as any })}
                                        >
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="CUSTOM">تذكير مخصص</SelectItem>
                                                <SelectItem value="WARRANTY_EXPIRY">انتهاء ضمان</SelectItem>
                                                <SelectItem value="LICENSE_RENEWAL">تجديد ترخيص</SelectItem>
                                                <SelectItem value="MAINTENANCE_DUE">صيانة مجدولة</SelectItem>
                                                <SelectItem value="CONTRACT_RENEWAL">تجديد عقد</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>الأولوية</Label>
                                        <Select
                                            value={newReminder.priority}
                                            onValueChange={(v) => setNewReminder({ ...newReminder, priority: v as any })}
                                        >
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="LOW">منخفضة</SelectItem>
                                                <SelectItem value="MEDIUM">متوسطة</SelectItem>
                                                <SelectItem value="HIGH">عالية</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label>الوصف</Label>
                                        <Textarea
                                            value={newReminder.description}
                                            onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })}
                                            placeholder="وصف إضافي (اختياري)"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 mt-4">
                                    <Button variant="outline" onClick={() => setShowNewReminder(false)}>إلغاء</Button>
                                    <Button onClick={handleCreateReminder}>إضافة التذكير</Button>
                                </div>
                            </CardContent>
                        )}
                    </Card>

                    {/* Pending Reminders */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-amber-500" />
                                التذكيرات المعلقة ({pendingReminders.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {pendingReminders.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    لا توجد تذكيرات معلقة
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {pendingReminders.map((reminder) => {
                                        const priority = priorityConfig[reminder.priority as keyof typeof priorityConfig] || priorityConfig.MEDIUM
                                        const isOverdue = new Date(reminder.dueDate) < new Date()

                                        return (
                                            <div
                                                key={reminder.id}
                                                className={`p-4 rounded-xl border ${isOverdue ? 'bg-red-50 dark:bg-red-950/20 border-red-200' : 'bg-muted/30'}`}
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex items-start gap-3">
                                                        <div className={`w-2 h-2 rounded-full mt-2 ${priority.color}`} />
                                                        <div>
                                                            <h4 className="font-bold">{reminder.title}</h4>
                                                            {reminder.description && (
                                                                <p className="text-sm text-muted-foreground">{reminder.description}</p>
                                                            )}
                                                            <div className="flex items-center gap-3 mt-2">
                                                                <Badge variant="outline">
                                                                    {reminderTypeLabels[reminder.type] || reminder.type}
                                                                </Badge>
                                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                    <Calendar className="h-3 w-3" />
                                                                    {new Date(reminder.dueDate).toLocaleDateString('ar-SA')}
                                                                </span>
                                                                {isOverdue && (
                                                                    <Badge variant="destructive" className="text-xs">متأخر</Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-emerald-600 hover:bg-emerald-50"
                                                            onClick={() => handleCompleteReminder(reminder.id)}
                                                            title="إكمال"
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-red-500 hover:bg-red-50"
                                                            onClick={() => handleDeleteReminder(reminder.id)}
                                                            title="حذف"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
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

                    {/* Completed Reminders */}
                    {completedReminders.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-muted-foreground">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                    تذكيرات مكتملة ({completedReminders.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {completedReminders.slice(0, 5).map((reminder) => (
                                        <div key={reminder.id} className="p-3 rounded-lg bg-muted/30 opacity-60">
                                            <div className="flex items-center justify-between">
                                                <span className="line-through">{reminder.title}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => handleDeleteReminder(reminder.id)}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
