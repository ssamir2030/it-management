"use client"

import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import { Bell, Mail, Lock, Server, AtSign, Save, Send, ShieldCheck, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { getSystemSettings, saveSystemSettings, testSMTPConnection } from "@/app/actions/settings"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Shield } from "lucide-react"

interface NotificationsViewProps {
    readOnly: boolean
}

export default function NotificationsView({ readOnly }: NotificationsViewProps) {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [testing, setTesting] = useState(false)

    // Config State
    const [settings, setSettings] = useState({
        SMTP_HOST: "",
        SMTP_PORT: "587",
        SMTP_USER: "",
        SMTP_PASS: "",
        SMTP_FROM: "no-reply@company.com",
        SMTP_SECURE: "false",
        EMAIL_ENABLED: "false",
        DASHBOARD_NOTIFICATIONS: "true"
    })

    const [testEmail, setTestEmail] = useState("")

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true)
            const keys = Object.keys(settings)
            const result = await getSystemSettings(keys)
            if (result.success && result.data) {
                setSettings(prev => ({ ...prev, ...result.data }))
            }
            setLoading(false)
        }
        fetchSettings()
    }, [])

    const handleChange = (key: string, value: string) => {
        if (readOnly) return
        setSettings(prev => ({ ...prev, [key]: value }))
    }

    const handleSave = async () => {
        if (readOnly) return
        setSaving(true)
        const result = await saveSystemSettings(settings)
        if (result.success) {
            toast.success("تم حفظ الإعدادات بنجاح")
        } else {
            toast.error("فشل حفظ الإعدادات")
        }
        setSaving(false)
    }

    const handleTestEmail = async () => {
        if (readOnly) return
        if (!testEmail) {
            toast.error("الرجاء إدخال بريد إلكتروني للتجربة")
            return
        }

        setTesting(true)
        const config = {
            host: settings.SMTP_HOST,
            port: settings.SMTP_PORT,
            user: settings.SMTP_USER,
            pass: settings.SMTP_PASS,
            secure: settings.SMTP_SECURE,
            from: settings.SMTP_FROM
        }

        const result = await testSMTPConnection(config, testEmail)

        if (result.success) {
            toast.success("تم إرسال بريد الاختبار بنجاح")
        } else {
            toast.error(`فشل الاتصال: ${result.error}`)
        }
        setTesting(false)
    }

    return (
        <div className="space-y-6" dir="rtl">
            <PremiumPageHeader
                backLink="/admin/settings"
                backText="الإعدادات"
                title="إعدادات الإشعارات"
                description="تخصيص التنبيهات وإعدادات خادم البريد الإلكتروني (SMTP)"
                icon={Bell}
            />

            {readOnly && (
                <Alert variant="default" className="bg-muted border-primary/20">
                    <Shield className="h-4 w-4" />
                    <AlertTitle>وضع المشاهدة فقط</AlertTitle>
                    <AlertDescription>
                        إعدادات خادم البريد والإشعارات مقروءة فقط. لا يمكنك التعديل أو إجراء تجارب الاتصال.
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid gap-6 md:grid-cols-2">
                {/* SMTP Server Configuration */}
                <Card className="md:col-span-1 shadow-lg border-t-4 border-t-primary">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Server className="w-5 h-5 text-primary" />
                            إعدادات خادم البريد (SMTP)
                        </CardTitle>
                        <CardDescription>
                            قم بتهيئة الاتصال بخادم البريد لإرسال الإشعارات.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>عنوان الخادم (Host)</Label>
                            <div className="relative">
                                <Server className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    className="pr-9 dir-ltr text-left"
                                    placeholder="smtp.office365.com"
                                    value={settings.SMTP_HOST}
                                    onChange={(e) => handleChange('SMTP_HOST', e.target.value)}
                                    disabled={readOnly}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 col-span-2 sm:col-span-1">
                                <Label>المنفذ (Port)</Label>
                                <Input
                                    className="dir-ltr text-left font-mono"
                                    placeholder="587"
                                    value={settings.SMTP_PORT}
                                    onChange={(e) => handleChange('SMTP_PORT', e.target.value)}
                                    disabled={readOnly}
                                />
                            </div>
                            <div className="space-y-2 col-span-2 sm:col-span-1 flex items-end pb-2">
                                <div className="flex items-center gap-2 border rounded-md p-2 w-full bg-muted/20">
                                    <Switch
                                        id="secure"
                                        checked={settings.SMTP_SECURE === "true"}
                                        onCheckedChange={(c) => handleChange('SMTP_SECURE', String(c))}
                                        disabled={readOnly}
                                    />
                                    <Label htmlFor="secure" className="cursor-pointer text-sm">اتصال آمن (SSL/TLS)</Label>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>اسم المستخدم (User)</Label>
                            <div className="relative">
                                <AtSign className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    className="pr-9 dir-ltr text-left"
                                    placeholder="notifications@company.com"
                                    value={settings.SMTP_USER}
                                    onChange={(e) => handleChange('SMTP_USER', e.target.value)}
                                    disabled={readOnly}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>كلمة المرور (Password)</Label>
                            <div className="relative">
                                <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="password"
                                    className="pr-9 dir-ltr text-left font-mono"
                                    value={settings.SMTP_PASS}
                                    onChange={(e) => handleChange('SMTP_PASS', e.target.value)}
                                    disabled={readOnly}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>البريد المرسل (From Address)</Label>
                            <div className="relative">
                                <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    className="pr-9 dir-ltr text-left"
                                    placeholder="no-reply@company.com"
                                    value={settings.SMTP_FROM}
                                    onChange={(e) => handleChange('SMTP_FROM', e.target.value)}
                                    disabled={readOnly}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Status & Testing */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-green-500" />
                                حالة وقنوات الإشعارات
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/10 transition-colors">
                                <div className="space-y-0.5">
                                    <Label className="text-base font-bold">تفعيل التنبيهات البريدية</Label>
                                    <p className="text-sm text-muted-foreground">
                                        إرسال رسائل بريد إلكتروني عند إنشاء التذاكر أو تحديث حالتها.
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.EMAIL_ENABLED === "true"}
                                    onCheckedChange={(c) => handleChange('EMAIL_ENABLED', String(c))}
                                    disabled={readOnly}
                                />
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/10 transition-colors">
                                <div className="space-y-0.5">
                                    <Label className="text-base font-bold">إشعارات لوحة التحكم</Label>
                                    <p className="text-sm text-muted-foreground">
                                        إظهار الإشعارات المنبثقة داخل النظام (Bell Icon).
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.DASHBOARD_NOTIFICATIONS === "true"}
                                    onCheckedChange={(c) => handleChange('DASHBOARD_NOTIFICATIONS', String(c))}
                                    disabled={readOnly}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-muted/30 border-dashed">
                        <CardHeader>
                            <CardTitle className="text-base">تجربة الاتصال</CardTitle>
                            <CardDescription>أرسل بريد تجريبي للتحقق من صحة الإعدادات</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="أدخل بريدك الإلكتروني للتجربة"
                                    className="bg-background"
                                    value={testEmail}
                                    onChange={(e) => setTestEmail(e.target.value)}
                                    disabled={readOnly}
                                />
                                <Button
                                    variant="secondary"
                                    onClick={handleTestEmail}
                                    disabled={testing || !settings.SMTP_HOST || readOnly}
                                >
                                    {testing ? <div className="animate-spin ml-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" /> : <Send className="w-4 h-4 ml-2" />}
                                    إرسال
                                </Button>
                            </div>

                            {!settings.SMTP_HOST && (
                                <Alert variant="destructive" className="py-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle className="text-xs font-bold">تنبيه</AlertTitle>
                                    <AlertDescription className="text-xs">
                                        يجب حفظ إعدادات الخادم أولاً قبل التجربة.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>

                    {!readOnly && (
                        <Button
                            size="lg"
                            className="w-full text-lg shadow-xl"
                            onClick={handleSave}
                            disabled={saving || loading}
                        >
                            {saving ? 'جاري الحفظ...' : (
                                <>
                                    <Save className="w-5 h-5 ml-2" />
                                    حفظ جميع الإعدادات
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
