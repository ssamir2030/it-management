'use client'

export const dynamic = 'force-dynamic';

import { updateLocation } from "@/app/actions/locations"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { MapPin, Tag, Map, Save, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react"
import { PremiumPageHeader } from '@/components/ui/premium-page-header'

interface EditLocationPageProps {
    params: {
        id: string
    }
}

export default function EditLocationPage({ params }: EditLocationPageProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        const res = await updateLocation(params.id, formData)
        setLoading(false)

        if (res.success) {
            toast.success("تم تحديث الموقع بنجاح", {
                description: "تم حفظ التغييرات على بيانات الموقع"
            })
            router.push('/locations')
        } else {
            toast.error("حدث خطأ أثناء تحديث الموقع")
        }
    }

    return (
        <div className="w-full py-10 animate-fade-in" dir="rtl">
            {/* Header */}
            <PremiumPageHeader
                title="تعديل الموقع"
                description="تحديث بيانات الموقع الجغرافي"
                icon={MapPin}
                rightContent={
                    <Link href="/locations">
                        <Button variant="ghost" size="lg" className="text-white hover:bg-white/20 gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            العودة
                        </Button>
                    </Link>
                }
            />

            {/* Form */}
            <form action={handleSubmit} className="space-y-6 animate-slide-up stagger-1">
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Location Name Card */}
                    <Card className="card-elevated border-t-4 border-t-primary/20">
                        <CardHeader className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-primary/10 p-2.5">
                                    <Tag className="h-6 w-6 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-xl font-bold">بيانات الموقع</CardTitle>
                                    <CardDescription>الاسم والعنوان التفصيلي</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-base font-medium">اسم الموقع <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                    <Input
                                        id="name"
                                        name="name"
                                        required
                                        placeholder="المقر الرئيسي"
                                        className="h-12 text-base pl-10"
                                    />
                                    <Tag className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address" className="text-base font-medium">العنوان</Label>
                                <div className="relative">
                                    <Input
                                        id="address"
                                        name="address"
                                        placeholder="الرياض - حي العليا"
                                        className="h-12 text-base pl-10"
                                    />
                                    <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Map Details Card */}
                    <Card className="card-elevated border-t-4 border-t-blue-500/20">
                        <CardHeader className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-blue-500/10 p-2.5">
                                    <Map className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-xl font-bold">الخريطة</CardTitle>
                                    <CardDescription>رابط خرائط جوجل والإحداثيات</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="googleMapsUrl" className="text-base font-medium">رابط خرائط جوجل</Label>
                                <div className="relative">
                                    <Input
                                        id="googleMapsUrl"
                                        name="googleMapsUrl"
                                        placeholder="https://maps.google.com/..."
                                        className="h-12 text-base pl-10 font-mono"
                                        dir="ltr"
                                    />
                                    <Map className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="latitude" className="text-base font-medium">خط العرض</Label>
                                    <Input
                                        id="latitude"
                                        name="latitude"
                                        type="number"
                                        step="any"
                                        placeholder="24.7136"
                                        className="h-12 text-base font-mono"
                                        dir="ltr"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="longitude" className="text-base font-medium">خط الطول</Label>
                                    <Input
                                        id="longitude"
                                        name="longitude"
                                        type="number"
                                        step="any"
                                        placeholder="46.6753"
                                        className="h-12 text-base font-mono"
                                        dir="ltr"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-end pt-6 gap-4">
                    <Link href="/locations">
                        <Button type="button" variant="outline" size="lg" className="min-w-[120px]">
                            إلغاء
                        </Button>
                    </Link>
                    <Button type="submit" size="lg" className="min-w-[200px] gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                جاري الحفظ...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="h-5 w-5" />
                                حفظ التغييرات
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
