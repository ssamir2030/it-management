"use client"

import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import { Palette, Sun, Moon, Monitor, Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { getSystemSettings, saveSystemSettings } from "@/app/actions/settings"
import { toast } from "sonner"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Shield } from "lucide-react"

const THEME_COLORS = [
    { name: "أزرق (الافتراضي)", value: "blue", class: "bg-blue-600" },
    { name: "بنفسجي", value: "violet", class: "bg-violet-600" },
    { name: "أخضر", value: "green", class: "bg-green-600" },
    { name: "برتقالي", value: "orange", class: "bg-orange-600" },
    { name: "رصاصي", value: "zinc", class: "bg-zinc-600" },
]

const THEME_RADIUS = [
    { name: "0", value: "0" },
    { name: "0.5", value: "0.5rem" },
    { name: "0.75", value: "0.75rem" },
    { name: "1.0", value: "1.0rem" },
]

interface AppearanceViewProps {
    readOnly: boolean
}

export default function AppearanceView({ readOnly }: AppearanceViewProps) {
    const { setTheme, theme } = useTheme()
    const [config, setConfig] = useState({
        THEME_COLOR: "blue",
        THEME_RADIUS: "0.75rem"
    })
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(true)

    // Load saved settings
    useEffect(() => {
        const load = async () => {
            const result = await getSystemSettings(['THEME_COLOR', 'THEME_RADIUS'])
            if (result.success && result.data) {
                setConfig(prev => ({ ...prev, ...result.data }))
            }
            setLoading(false)
        }
        load()
    }, [])

    const handleSave = async () => {
        if (readOnly) return
        setSaving(true)
        const result = await saveSystemSettings(config)
        if (result.success) {
            toast.success("تم تحديث المظهر بنجاح")
            toast.info("قد يتطلب تغيير اللون تحديث النظام لتطبيقه على جميع العناصر")
        } else {
            toast.error("فشل الحفظ")
        }
        setSaving(false)
    }

    return (
        <div className="space-y-6" dir="rtl">
            <PremiumPageHeader
                backLink="/admin/settings"
                backText="الإعدادات"
                title="تخصيص المظهر"
                description="تعديل ألوان النظام، الوضع الليلي، وتجربة المستخدم"
                icon={Palette}
            />

            {readOnly && (
                <Alert variant="default" className="bg-muted border-primary/20">
                    <Shield className="h-4 w-4" />
                    <AlertTitle>وضع المشاهدة فقط</AlertTitle>
                    <AlertDescription>
                        يمكنك تجربة الخيارات أدناه للمعاينة فقط، ولكن لا يمكنك حفظ التغييرات على مستوى النظام.
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

                {/* Mode Selection */}
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle className="text-xl">وضع الإضاءة</CardTitle>
                        <CardDescription>اختر الوضع المفضل لواجهة الاستخدام</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-3 gap-6">
                        <Button
                            variant="outline"
                            className={cn("h-32 flex flex-col gap-4 border-2 hover:bg-accent", theme === 'light' && "border-primary bg-accent/50")}
                            onClick={() => setTheme("light")}
                        >
                            <Sun className="w-8 h-8" />
                            <span className="font-bold">فاتح</span>
                        </Button>
                        <Button
                            variant="outline"
                            className={cn("h-32 flex flex-col gap-4 border-2 hover:bg-accent", theme === 'dark' && "border-primary bg-accent/50")}
                            onClick={() => setTheme("dark")}
                        >
                            <Moon className="w-8 h-8" />
                            <span className="font-bold">داكن</span>
                        </Button>
                        <Button
                            variant="outline"
                            className={cn("h-32 flex flex-col gap-4 border-2 hover:bg-accent", theme === 'system' && "border-primary bg-accent/50")}
                            onClick={() => setTheme("system")}
                        >
                            <Monitor className="w-8 h-8" />
                            <span className="font-bold">تلقائي (النظام)</span>
                        </Button>
                    </CardContent>
                </Card>

                {/* Primary Color */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-xl">لون النظام الأساسي</CardTitle>
                        <CardDescription>اللون الرئيسي للأزرار والروابط والحالات النشطة</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {THEME_COLORS.map(color => (
                                <button
                                    key={color.value}
                                    onClick={() => setConfig(prev => ({ ...prev, THEME_COLOR: color.value }))}
                                    disabled={readOnly}
                                    className={cn(
                                        "group relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all hover:bg-accent",
                                        config.THEME_COLOR === color.value
                                            ? "border-primary ring-2 ring-primary/20 bg-accent/50"
                                            : "border-transparent bg-card",
                                        readOnly && "opacity-60 cursor-not-allowed hover:bg-card"
                                    )}
                                >
                                    <div className={cn("w-full aspect-square rounded-full shadow-lg", color.class)}>
                                        {config.THEME_COLOR === color.value && (
                                            <div className="flex h-full items-center justify-center text-white">
                                                <Check className="w-6 h-6" />
                                            </div>
                                        )}
                                    </div>
                                    <span className="font-medium text-sm">{color.name}</span>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Radius */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">انحناء الزوايا</CardTitle>
                        <CardDescription>مدى استدارة حواف العناصر</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            {THEME_RADIUS.map(r => (
                                <button
                                    key={r.value}
                                    onClick={() => setConfig(prev => ({ ...prev, THEME_RADIUS: r.value }))}
                                    disabled={readOnly}
                                    className={cn(
                                        "flex items-center justify-center p-3 border-2 transition-all hover:bg-accent",
                                        config.THEME_RADIUS === r.value
                                            ? "border-primary bg-primary text-primary-foreground font-bold"
                                            : "border-muted-foreground/20",
                                        readOnly && "opacity-60 cursor-not-allowed hover:bg-card"
                                    )}
                                    style={{ borderRadius: r.value }}
                                >
                                    {r.name}
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Preview */}
                <Card className="lg:col-span-3 bg-muted/20 border-dashed">
                    <CardHeader>
                        <CardTitle>معاينة المظهر</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-4 items-center justify-center p-12">
                        <div className="p-6 rounded-lg border bg-card shadow-lg w-full max-w-md space-y-4" style={{ borderRadius: config.THEME_RADIUS }}>
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold">بطاقة معاينة</h3>
                                <div className={`h-3 w-3 rounded-full ${THEME_COLORS.find(c => c.value === config.THEME_COLOR)?.class || 'bg-blue-600'}`} />
                            </div>
                            <p className="text-muted-foreground">هذا النص يوضح كيف ستبدو النصوص والألوان في النظام بناءً على اختياراتك.</p>
                            <div className="flex gap-2">
                                <Button className={THEME_COLORS.find(c => c.value === config.THEME_COLOR)?.class || 'bg-blue-600'} style={{ borderRadius: config.THEME_RADIUS }}>زر أساسي</Button>
                                <Button variant="secondary" style={{ borderRadius: config.THEME_RADIUS }}>زر ثانوي</Button>
                                <Button variant="outline" style={{ borderRadius: config.THEME_RADIUS }}>حدود</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="lg:col-span-3 flex justify-end">
                    {!readOnly && (
                        <Button
                            size="lg"
                            className="w-full md:w-auto text-lg px-8"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
