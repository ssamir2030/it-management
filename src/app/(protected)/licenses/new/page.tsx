"use client"

export const dynamic = 'force-dynamic';

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createLicense } from "@/app/actions/licenses"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2, ShieldCheck, CreditCard, Calendar, Barcode, DollarSign, CheckCircle2, Package } from "lucide-react"
import { PremiumPageHeader } from '@/components/ui/premium-page-header'
import { toast } from 'sonner'
import Link from "next/link"

export default function NewLicensePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const result = await createLicense(formData)

        if (result.success) {
            toast.success("تم إضافة الترخيص بنجاح", {
                description: "تم حفظ بيانات الترخيص الجديد في النظام"
            })
            router.push("/licenses")
            router.refresh()
        } else {
            toast.error(result.error || "حدث خطأ أثناء حفظ الترخيص")
        }
        setLoading(false)
    }

    return (
        <div className="w-full content-spacing py-8" dir="rtl">
            <PremiumPageHeader
                title="ترخيص جديد"
                description="إضافة ترخيص برنامج جديد وإدارة تفاصيله"
                icon={ShieldCheck}
                rightContent={
                    <Link href="/licenses">
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
                    <Card className="card-elevated border-t-4 border-t-violet-500/20 lg:col-span-2">
                        <CardHeader className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-violet-500/10 p-2.5">
                                    <Package className="h-5 w-5 text-violet-600" />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-xl font-bold">معلومات البرنامج</CardTitle>
                                    <CardDescription>الاسم، المزود، والإصدار</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-base font-medium">اسم البرنامج <span className="text-red-500">*</span></Label>
                                    <Input id="name" name="name" required placeholder="مثال: Windows Server" className="h-12 text-base" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="vendor" className="text-base font-medium">المزود</Label>
                                    <Input id="vendor" name="vendor" placeholder="مثال: Microsoft" className="h-12 text-base" />
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="version" className="text-base font-medium">الإصدار</Label>
                                    <Input id="version" name="version" placeholder="مثال: 2022" className="h-12 text-base" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status" className="text-base font-medium">الحالة</Label>
                                    <Select name="status" defaultValue="ACTIVE">
                                        <SelectTrigger className="h-12 text-base">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ACTIVE">نشط</SelectItem>
                                            <SelectItem value="EXPIRING">ينتهي قريباً</SelectItem>
                                            <SelectItem value="EXPIRED">منتهي</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* License Details Card */}
                    <Card className="card-elevated border-t-4 border-t-indigo-500/20">
                        <CardHeader className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-indigo-500/10 p-2.5">
                                    <Barcode className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-xl font-bold">تفاصيل الترخيص</CardTitle>
                                    <CardDescription>المفاتيح والأرقام التسلسلية</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="licenseKey" className="text-base font-medium">مفتاح الترخيص/السريال <span className="text-red-500">*</span></Label>
                                <Input
                                    id="licenseKey"
                                    name="licenseKey"
                                    required
                                    placeholder="XXXXX-XXXXX-XXXXX-XXXXX"
                                    className="h-12 text-base font-mono"
                                    dir="ltr"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="productKey" className="text-base font-medium">مفتاح المنتج (Product Key)</Label>
                                <Input
                                    id="productKey"
                                    name="productKey"
                                    placeholder="للويندوز وما شابه"
                                    className="h-12 text-base font-mono"
                                    dir="ltr"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="activationFile" className="text-base font-medium">ملف التفعيل</Label>
                                <Input
                                    id="activationFile"
                                    name="activationFile"
                                    placeholder="مسار الملف على الشبكة"
                                    className="h-12 text-base"
                                    dir="ltr"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Cost & Type Card */}
                    <Card className="card-elevated border-t-4 border-t-teal-500/20">
                        <CardHeader className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-teal-500/10 p-2.5">
                                    <CreditCard className="h-5 w-5 text-teal-600" />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-xl font-bold">التكلفة والنوع</CardTitle>
                                    <CardDescription>خيارات الدفع وصلاحية الترخيص</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="licenseType" className="text-base font-medium">نوع الترخيص <span className="text-red-500">*</span></Label>
                                    <Select name="licenseType" required>
                                        <SelectTrigger className="h-12 text-base">
                                            <SelectValue placeholder="اختر النوع" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PERPETUAL">دائم</SelectItem>
                                            <SelectItem value="SUBSCRIPTION">اشتراك</SelectItem>
                                            <SelectItem value="CONCURRENT">متزامن</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="purchaseType" className="text-base font-medium">طريقة الدفع <span className="text-red-500">*</span></Label>
                                    <Select name="purchaseType" required>
                                        <SelectTrigger className="h-12 text-base">
                                            <SelectValue placeholder="اختر الطريقة" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ONE_TIME">مرة واحدة</SelectItem>
                                            <SelectItem value="MONTHLY">شهري</SelectItem>
                                            <SelectItem value="YEARLY">سنوي</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="cost" className="text-base font-medium">التكلفة (ر.س) <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                    <Input id="cost" name="cost" type="number" step="0.01" required placeholder="0.00" className="h-12 text-base pl-10" dir="ltr" />
                                    <DollarSign className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="totalLicenses" className="text-base font-medium">العدد الكلي <span className="text-red-500">*</span></Label>
                                    <Input id="totalLicenses" name="totalLicenses" type="number" required defaultValue="1" min="1" className="h-12 text-base" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="usedLicenses" className="text-base font-medium">المستخدم</Label>
                                    <Input id="usedLicenses" name="usedLicenses" type="number" defaultValue="0" min="0" className="h-12 text-base" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Dates & Notes Card */}
                    <Card className="card-elevated border-t-4 border-t-amber-500/20 lg:col-span-2">
                        <CardHeader className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-amber-500/10 p-2.5">
                                    <Calendar className="h-5 w-5 text-amber-600" />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-xl font-bold">التواريخ والملاحظات</CardTitle>
                                    <CardDescription>تواريخ الشراء والانتهاء وأي ملاحظات إضافية</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="purchaseDate" className="text-base font-medium">تاريخ الشراء <span className="text-red-500">*</span></Label>
                                    <Input id="purchaseDate" name="purchaseDate" type="date" required className="h-12 text-base" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="expiryDate" className="text-base font-medium">تاريخ الانتهاء</Label>
                                    <Input id="expiryDate" name="expiryDate" type="date" className="h-12 text-base" />
                                    <p className="text-xs text-muted-foreground">اتركه فارغاً للتراخيص الدائمة</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes" className="text-base font-medium">ملاحظات</Label>
                                <Textarea id="notes" name="notes" rows={3} placeholder="أي ملاحظات إضافية..." className="min-h-[100px] text-base" />
                            </div>
                        </CardContent>
                    </Card>

                </div>

                <div className="flex justify-start gap-4 pt-6 animate-slide-up stagger-2">
                    <Button type="submit" disabled={loading} size="lg" className="min-w-[200px] gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30">
                        {loading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                جاري الحفظ...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="h-5 w-5" />
                                حفظ الترخيص
                            </>
                        )}
                    </Button>
                    <Link href="/licenses">
                        <Button type="button" variant="outline" size="lg" className="gap-2">
                            إلغاء
                        </Button>
                    </Link>
                </div>
            </form>
        </div>
    )
}

