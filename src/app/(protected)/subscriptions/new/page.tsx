"use client"

export const dynamic = 'force-dynamic';

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createSubscription } from "@/app/actions/subscriptions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    ArrowRight,
    Loader2,
    ArrowLeft,
    CreditCard,
    Calendar,
    Users,
    DollarSign,
    RefreshCw,
    Bell,
    FileText,
    CheckCircle2
} from "lucide-react"
import { PremiumPageHeader } from '@/components/ui/premium-page-header'
import Link from "next/link"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"

export default function NewSubscriptionPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const data = {
            name: formData.get("name"),
            provider: formData.get("provider"),
            category: formData.get("category"),
            startDate: formData.get("startDate"),
            renewalDate: formData.get("renewalDate"),
            cost: formData.get("cost"),
            billingCycle: formData.get("billingCycle"),
            email: formData.get("email"),
            managementUrl: formData.get("managementUrl"),
            userLimit: formData.get("userLimit"),
            currentUsers: formData.get("currentUsers"),
            status: formData.get("status") || "ACTIVE",
            autoRenew: formData.get("autoRenew") === "on",
            alertDays: formData.get("alertDays"),
            notes: formData.get("notes")
        }

        const result = await createSubscription(data)

        if (result.success) {
            toast.success("تم إنشاء الاشتراك بنجاح")
            router.push("/subscriptions")
            router.refresh()
        } else {
            toast.error(result.error || "حدث خطأ أثناء إنشاء الاشتراك")
            setLoading(false)
        }
    }

    return (
        <div className="content-spacing animate-fade-in">
            <PremiumPageHeader
                title="اشتراك جديد"
                description="إضافة اشتراك برنامج أو خدمة جديدة"
                icon={CreditCard}
                rightContent={
                    <Link href="/subscriptions">
                        <Button variant="ghost" size="lg" className="text-white hover:bg-white/20 gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            إلغاء والعودة
                        </Button>
                    </Link>
                }
            />

            <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up stagger-1">
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Basic Info Card */}
                    <Card className="card-elevated border-t-4 border-t-primary/20">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-primary/10 p-2">
                                    <CreditCard className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold">معلومات الاشتراك</CardTitle>
                                    <CardDescription>البيانات الأساسية للخدمة أو البرنامج</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-base font-semibold">اسم البرنامج/الخدمة *</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    required
                                    placeholder="مثال: Microsoft 365"
                                    className="h-12 text-base"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="provider" className="text-base font-semibold">المزود</Label>
                                <Input
                                    id="provider"
                                    name="provider"
                                    placeholder="مثال: Microsoft"
                                    className="h-12 text-base"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="category" className="text-base font-semibold">الفئة *</Label>
                                    <Select name="category" required>
                                        <SelectTrigger className="h-12 text-base">
                                            <SelectValue placeholder="اختر الفئة" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="HOSTING">استضافة</SelectItem>
                                            <SelectItem value="SAAS">برمجيات كخدمة</SelectItem>
                                            <SelectItem value="CLOUD">سحابي</SelectItem>
                                            <SelectItem value="EMAIL">بريد إلكتروني</SelectItem>
                                            <SelectItem value="DOMAIN">نطاق</SelectItem>
                                            <SelectItem value="OTHER">أخرى</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status" className="text-base font-semibold">الحالة</Label>
                                    <Select name="status" defaultValue="ACTIVE">
                                        <SelectTrigger className="h-12 text-base">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ACTIVE">نشط</SelectItem>
                                            <SelectItem value="EXPIRING_SOON">ينتهي قريباً</SelectItem>
                                            <SelectItem value="EXPIRED">منتهي</SelectItem>
                                            <SelectItem value="CANCELLED">ملغي</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Cost & Cycle Card */}
                    <Card className="card-elevated border-t-4 border-t-green-500/20">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-green-500/10 p-2">
                                    <DollarSign className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold">التكلفة والتواريخ</CardTitle>
                                    <CardDescription>تفاصيل الدفع والتجديد</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cost" className="text-base font-semibold">التكلفة (ر.س) *</Label>
                                    <Input
                                        id="cost"
                                        name="cost"
                                        type="number"
                                        step="0.01"
                                        required
                                        placeholder="0.00"
                                        className="h-12 text-base"
                                        dir="ltr"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="billingCycle" className="text-base font-semibold">دورة الدفع *</Label>
                                    <Select name="billingCycle" required>
                                        <SelectTrigger className="h-12 text-base">
                                            <SelectValue placeholder="اختر دورة الدفع" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MONTHLY">شهري</SelectItem>
                                            <SelectItem value="YEARLY">سنوي</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="startDate" className="text-base font-semibold">تاريخ البداية *</Label>
                                    <div className="relative">
                                        <Input
                                            id="startDate"
                                            name="startDate"
                                            type="date"
                                            required
                                            className="h-12 text-base pl-10"
                                            dir="ltr"
                                        />
                                        <Calendar className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="renewalDate" className="text-base font-semibold">تاريخ التجديد *</Label>
                                    <div className="relative">
                                        <Input
                                            id="renewalDate"
                                            name="renewalDate"
                                            type="date"
                                            required
                                            className="h-12 text-base pl-10"
                                            dir="ltr"
                                        />
                                        <Calendar className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 space-x-reverse pt-2">
                                <Switch id="autoRenew" name="autoRenew" defaultChecked />
                                <Label htmlFor="autoRenew" className="text-base cursor-pointer">تفعيل التجديد التلقائي</Label>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Usage & Access Card */}
                    <Card className="card-elevated border-t-4 border-t-blue-500/20">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-blue-500/10 p-2">
                                    <Users className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold">الوصول والاستخدام</CardTitle>
                                    <CardDescription>معلومات الحساب وحدود المستخدمين</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-base font-semibold">البريد الإلكتروني للإدارة</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="admin@company.com"
                                    className="h-12 text-base"
                                    dir="ltr"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="managementUrl" className="text-base font-semibold">رابط لوحة التحكم</Label>
                                <Input
                                    id="managementUrl"
                                    name="managementUrl"
                                    type="url"
                                    placeholder="https://console.example.com"
                                    className="h-12 text-base"
                                    dir="ltr"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="userLimit" className="text-base font-semibold">حد المستخدمين</Label>
                                    <Input
                                        id="userLimit"
                                        name="userLimit"
                                        type="number"
                                        placeholder="غير محدود"
                                        className="h-12 text-base"
                                        dir="ltr"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="currentUsers" className="text-base font-semibold">المستخدمون الحاليون</Label>
                                    <Input
                                        id="currentUsers"
                                        name="currentUsers"
                                        type="number"
                                        defaultValue="0"
                                        className="h-12 text-base"
                                        dir="ltr"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Alerts & Notes Card */}
                    <Card className="card-elevated border-t-4 border-t-orange-500/20">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-orange-500/10 p-2">
                                    <Bell className="h-5 w-5 text-orange-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold">التنبيهات والملاحظات</CardTitle>
                                    <CardDescription>إعدادات التنبيه وملاحظات إضافية</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="alertDays" className="text-base font-semibold">تنبيه قبل (يوم)</Label>
                                <Input
                                    id="alertDays"
                                    name="alertDays"
                                    type="number"
                                    defaultValue="30"
                                    className="h-12 text-base"
                                    dir="ltr"
                                />
                                <p className="text-sm text-muted-foreground">سيتم إرسال تنبيه قبل انتهاء الاشتراك بهذه المدة</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="notes" className="text-base font-semibold">ملاحظات</Label>
                                <Textarea
                                    id="notes"
                                    name="notes"
                                    rows={3}
                                    placeholder="أي ملاحظات إضافية..."
                                    className="min-h-[100px] text-base"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-3 pt-4 animate-slide-up stagger-2">
                    <Link href="/subscriptions">
                        <Button type="button" variant="outline" size="lg" className="shadow-sm">
                            إلغاء
                        </Button>
                    </Link>
                    <Button
                        type="submit"
                        disabled={loading}
                        size="lg"
                        className="gap-2 shadow-lg shadow-primary/30 hover:shadow-primary/40 hover-scale min-w-[200px]"
                    >
                        {loading ? (
                            <>
                                <RefreshCw className="h-5 w-5 animate-spin" />
                                جاري الحفظ...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="h-5 w-5" />
                                حفظ الاشتراك
                                <ArrowRight className="h-4 w-4" />
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
