'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import { Settings, Bell, Save, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { getAlertSettings, updateAlertSettings } from '@/app/actions/alerts'
import Link from 'next/link'

export default function AlertSettingsPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [settings, setSettings] = useState({
        warrantyAlertDays: 30,
        licenseAlertDays: 30,
        maintenanceAlertDays: 7,
        emailNotifications: true,
        dashboardNotifications: true,
        notificationEmail: ''
    })

    useEffect(() => {
        loadSettings()
    }, [])

    const loadSettings = async () => {
        const result = await getAlertSettings()
        if (result.success && result.data) {
            setSettings({
                warrantyAlertDays: result.data.warrantyAlertDays,
                licenseAlertDays: result.data.licenseAlertDays,
                maintenanceAlertDays: result.data.maintenanceAlertDays,
                emailNotifications: result.data.emailNotifications,
                dashboardNotifications: result.data.dashboardNotifications,
                notificationEmail: result.data.notificationEmail || ''
            })
        }
        setLoading(false)
    }

    const handleSave = async () => {
        setSaving(true)
        const result = await updateAlertSettings(settings)
        if (result.success) {
            toast.success('تم حفظ الإعدادات بنجاح')
        } else {
            toast.error(result.error)
        }
        setSaving(false)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-muted-foreground">جاري التحميل...</div>
            </div>
        )
    }

    return (
        <div className="space-y-6" dir="rtl">
            <PremiumPageHeader
                title="إعدادات التنبيهات"
                description="تخصيص فترات التنبيه وطرق الإشعار"
                icon={Settings}
                rightContent={
                    <Link href="/admin/alerts">
                        <Button variant="outline" className="gap-2 text-white border-white/30 hover:bg-white/10">
                            <ArrowRight className="h-4 w-4" />
                            العودة للتنبيهات
                        </Button>
                    </Link>
                }
            />

            <div className="grid gap-6 md:grid-cols-2">
                {/* Alert Periods */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5 text-amber-500" />
                            فترات التنبيه
                        </CardTitle>
                        <CardDescription>تحديد عدد الأيام قبل انتهاء الصلاحية للتنبيه</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="warranty">تنبيه انتهاء الضمان (أيام)</Label>
                            <Input
                                id="warranty"
                                type="number"
                                min="1"
                                max="365"
                                value={settings.warrantyAlertDays}
                                onChange={(e) => setSettings({ ...settings, warrantyAlertDays: parseInt(e.target.value) || 30 })}
                            />
                            <p className="text-xs text-muted-foreground">سيتم إنشاء تنبيه قبل {settings.warrantyAlertDays} يوم من انتهاء الضمان</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="license">تنبيه انتهاء التراخيص (أيام)</Label>
                            <Input
                                id="license"
                                type="number"
                                min="1"
                                max="365"
                                value={settings.licenseAlertDays}
                                onChange={(e) => setSettings({ ...settings, licenseAlertDays: parseInt(e.target.value) || 30 })}
                            />
                            <p className="text-xs text-muted-foreground">سيتم إنشاء تنبيه قبل {settings.licenseAlertDays} يوم من انتهاء الترخيص</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="maintenance">تنبيه مواعيد الصيانة (أيام)</Label>
                            <Input
                                id="maintenance"
                                type="number"
                                min="1"
                                max="90"
                                value={settings.maintenanceAlertDays}
                                onChange={(e) => setSettings({ ...settings, maintenanceAlertDays: parseInt(e.target.value) || 7 })}
                            />
                            <p className="text-xs text-muted-foreground">سيتم إنشاء تنبيه قبل {settings.maintenanceAlertDays} يوم من موعد الصيانة</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Notification Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5 text-blue-500" />
                            طرق الإشعار
                        </CardTitle>
                        <CardDescription>اختر كيف تريد تلقي التنبيهات</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                            <div>
                                <Label htmlFor="dashboard" className="font-medium">إشعارات لوحة التحكم</Label>
                                <p className="text-sm text-muted-foreground mt-1">عرض التنبيهات في واجهة النظام</p>
                            </div>
                            <Switch
                                id="dashboard"
                                checked={settings.dashboardNotifications}
                                onCheckedChange={(checked) => setSettings({ ...settings, dashboardNotifications: checked })}
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                            <div>
                                <Label htmlFor="email" className="font-medium">إشعارات البريد الإلكتروني</Label>
                                <p className="text-sm text-muted-foreground mt-1">إرسال التنبيهات عبر البريد</p>
                            </div>
                            <Switch
                                id="email"
                                checked={settings.emailNotifications}
                                onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                            />
                        </div>

                        {settings.emailNotifications && (
                            <div className="space-y-2 animate-in slide-in-from-top-2">
                                <Label htmlFor="notificationEmail">البريد الإلكتروني للإشعارات</Label>
                                <Input
                                    id="notificationEmail"
                                    type="email"
                                    placeholder="admin@company.com"
                                    value={settings.notificationEmail}
                                    onChange={(e) => setSettings({ ...settings, notificationEmail: e.target.value })}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button
                    size="lg"
                    onClick={handleSave}
                    disabled={saving}
                    className="gap-2 px-8"
                >
                    <Save className="h-4 w-4" />
                    {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
                </Button>
            </div>
        </div>
    )
}
