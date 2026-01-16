'use client'

export const dynamic = 'force-dynamic';

import { createLocation } from "@/app/actions/locations"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { MapPin, Tag, Map, CheckCircle2, ArrowRight, RefreshCw, ArrowLeft } from "lucide-react"
import { PremiumPageHeader } from '@/components/ui/premium-page-header'

export default function NewLocationPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        const res = await createLocation(formData)
        setLoading(false)

        if (res.success) {
            toast.success("تم إنشاء الموقع بنجاح")
            router.push('/locations')
        } else {
            toast.error("حدث خطأ أثناء إنشاء الموقع")
        }
    }

    return (
        <div className="content-spacing animate-fade-in">
            {/* Header */}
            <PremiumPageHeader
                title="إضافة موقع جديد"
                description="تسجيل موقع جديد في النظام"
                icon={MapPin}
                rightContent={
                    <Link href="/locations">
                        <Button variant="ghost" size="lg" className="text-white hover:bg-white/20 gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            إلغاء والعودة
                        </Button>
                    </Link>
                }
            />

            {/* Form */}
            <form action={handleSubmit} className="space-y-6 animate-slide-up stagger-1">
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Location Name Card */}
                    <Card className="card-elevated">
                        <CardHeader className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-primary/10 p-2">
                                    <Tag className="h-5 w-5 text-primary" />
                                </div>
                                <div className="space-y-1.5">
                                    <CardTitle className="text-xl font-bold">اسم الموقع</CardTitle>
                                    <CardDescription className="text-base">المقر أو المبنى</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-base font-semibold">اسم الموقع *</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    required
                                    placeholder="المقر الرئيسي"
                                    className="h-12 text-base"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Address Card */}
                    <Card className="card-elevated">
                        <CardHeader className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-blue-500/10 p-2">
                                    <Map className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="space-y-1.5">
                                    <CardTitle className="text-xl font-bold">العنوان</CardTitle>
                                    <CardDescription className="text-base">موقع المبنى (اختياري)</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label htmlFor="address" className="text-base font-semibold">العنوان</Label>
                                <Input
                                    id="address"
                                    name="address"
                                    placeholder="طريق الملك فهد، الرياض"
                                    className="h-12 text-base"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Google Maps Card */}
                <Card className="card-elevated animate-slide-up stagger-2">
                    <CardHeader className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-red-500/10 p-2">
                                <MapPin className="h-5 w-5 text-red-600" />
                            </div>
                            <div className="space-y-1.5">
                                <CardTitle className="text-xl font-bold">الموقع على خرائط جوجل</CardTitle>
                                <CardDescription className="text-base">رابط الموقع على Google Maps (اختياري)</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="space-y-2">
                                <Label htmlFor="googleMapsUrl" className="text-base font-semibold">رابط خرائط جوجل</Label>
                                <Input
                                    id="googleMapsUrl"
                                    name="googleMapsUrl"
                                    type="url"
                                    placeholder="https://maps.google.com/..."
                                    className="h-12 text-base font-mono"
                                    dir="ltr"
                                />
                            </div>
                            <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg border">
                                <p className="font-medium mb-2">💡 كيفية الحصول على الرابط:</p>
                                <ol className="list-decimal list-inside space-y-1 text-xs">
                                    <li>افتح Google Maps وابحث عن الموقع</li>
                                    <li>اضغط على "مشاركة" أو "Share"</li>
                                    <li>انسخ الرابط والصقه هنا</li>
                                </ol>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Submit Button */}
                <div className="flex justify-end gap-3 pt-4 animate-slide-up stagger-3">
                    <Link href="/locations">
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
                                حفظ الموقع
                                <ArrowRight className="h-4 w-4" />
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
