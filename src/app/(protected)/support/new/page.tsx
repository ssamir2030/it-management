'use client'

export const dynamic = 'force-dynamic';

import { createTicket } from "@/app/actions/support"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import { Headset, AlertCircle, FileText, CheckCircle2, ArrowRight, RefreshCw, ArrowLeft, Ticket } from "lucide-react"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"

export default function NewTicketPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        const data = {
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            category: formData.get('category') as string || 'OTHER',
            priority: formData.get('priority') as string || 'MEDIUM',
            contactPhone: formData.get('contactPhone') as string | undefined,
        }
        const res = await createTicket(data)
        setLoading(false)

        if (res.success) {
            toast.success("تم إنشاء التذكرة بنجاح", {
                description: "سيتم مراجعة طلبك من قبل فريق الدعم الفني"
            })
            router.push('/support')
        } else {
            toast.error("حدث خطأ أثناء إنشاء التذكرة")
        }
    }

    return (
        <div className="content-spacing animate-fade-in">
            {/* Header */}
            <PremiumPageHeader
                title="إنشاء تذكرة دعم فني"
                description="الإبلاغ عن مشكلة تقنية أو طلب مساعدة"
                icon={Headset}
                rightContent={
                    <Link href="/support">
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
                    {/* Ticket Details Card */}
                    <Card className="card-elevated border-t-4 border-t-red-500/20">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-red-500/10 p-2">
                                    <Ticket className="h-5 w-5 text-red-600" />
                                </div>
                                <div className="space-y-1.5">
                                    <CardTitle className="text-xl font-bold">تفاصيل التذكرة</CardTitle>
                                    <CardDescription>المعلومات الأساسية للمشكلة</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="title" className="text-base font-semibold">الموضوع *</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    required
                                    placeholder="مثال: الطابعة لا تعمل"
                                    className="h-12 text-base"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="priority" className="text-base font-semibold">الأولوية *</Label>
                                    <Select name="priority" defaultValue="MEDIUM">
                                        <SelectTrigger className="h-12 text-base">
                                            <SelectValue placeholder="اختر الأولوية" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="LOW">منخفض</SelectItem>
                                            <SelectItem value="MEDIUM">متوسط</SelectItem>
                                            <SelectItem value="HIGH">عالي</SelectItem>
                                            <SelectItem value="CRITICAL">حرج</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category" className="text-base font-semibold">الفئة</Label>
                                    <Select name="category" defaultValue="OTHER">
                                        <SelectTrigger className="h-12 text-base">
                                            <SelectValue placeholder="اختر الفئة" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="HARDWARE">أجهزة</SelectItem>
                                            <SelectItem value="SOFTWARE">برمجيات</SelectItem>
                                            <SelectItem value="NETWORK">شبكة</SelectItem>
                                            <SelectItem value="ACCESS">صلاحيات</SelectItem>
                                            <SelectItem value="OTHER">أخرى</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="contactPhone" className="text-base font-semibold">رقم التواصل (اختياري)</Label>
                                <Input
                                    id="contactPhone"
                                    name="contactPhone"
                                    placeholder="05xxxxxxxx"
                                    className="h-12 text-base"
                                    dir="ltr"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Description Card */}
                    <Card className="card-elevated border-t-4 border-t-orange-500/20">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-orange-500/10 p-2">
                                    <FileText className="h-5 w-5 text-orange-600" />
                                </div>
                                <div className="space-y-1.5">
                                    <CardTitle className="text-xl font-bold">الوصف</CardTitle>
                                    <CardDescription>شرح تفصيلي للمشكلة التي تواجهها</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-base font-semibold">وصف المشكلة *</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    required
                                    placeholder="يرجى كتابة تفاصيل المشكلة هنا..."
                                    className="min-h-[200px] text-base resize-none"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-3 pt-4 animate-slide-up stagger-2">
                    <Link href="/support">
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
                                إنشاء التذكرة
                                <ArrowRight className="h-4 w-4" />
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
