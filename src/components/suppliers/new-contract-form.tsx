'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar, FileText, CheckCircle, ArrowRight, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import { toast } from "sonner"
import { addSupplierContract } from "@/app/actions/suppliers"

interface NewContractFormProps {
    supplierId: string
    supplierName: string
}

export function NewContractForm({ supplierId, supplierName }: NewContractFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState({
        title: "",
        contractNumber: "",
        startDate: "",
        endDate: "",
        slaResponseTime: "",
        slaResolutionTime: "",
        description: "",
        status: "ACTIVE"
    })

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!data.title || !data.startDate || !data.endDate) {
            toast.error("الرجاء ملء الحقول الإلزامية")
            return
        }

        setLoading(true)
        try {
            const res = await addSupplierContract({
                supplierId,
                title: data.title,
                contractNumber: data.contractNumber,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                description: data.description,
                status: data.status,
                slaResponseTime: data.slaResponseTime ? parseInt(data.slaResponseTime) : undefined,
                slaResolutionTime: data.slaResolutionTime ? parseInt(data.slaResolutionTime) : undefined,
            })

            if (res.success) {
                toast.success("تم إنشاء العقد بنجاح")
                router.push(`/suppliers/${supplierId}`)
                router.refresh()
            } else {
                toast.error(res.error)
            }
        } catch (error) {
            toast.error("حدث خطأ ما")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto max-w-5xl py-8 animate-fade-in">
            <PremiumPageHeader
                title="إضافة عقد جديد"
                description={`إضافة عقد أو اتفاقية للمورد: ${supplierName}`}
                icon={FileText}
                rightContent={
                    <Button variant="ghost" onClick={() => router.back()} className="gap-2">
                        <ArrowRight className="w-4 h-4" />
                        إلغاء وعودة
                    </Button>
                }
            />

            <form onSubmit={handleSubmit}>
                <div className="grid gap-8">
                    {/* Basic Info Card */}
                    <Card className="border-t-4 border-t-blue-500 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <FileText className="w-6 h-6 text-blue-500" />
                                تفاصيل العقد الأساسية
                            </CardTitle>
                            <CardDescription>
                                المعلومات الأساسية للعقد مثل العنوان والأرقام المرجعية
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-base">عنوان العقد <span className="text-red-500">*</span></Label>
                                    <Input
                                        value={data.title}
                                        onChange={e => setData({ ...data, title: e.target.value })}
                                        placeholder="مثال: عقد صيانة السيرفرات السنوي"
                                        className="h-12 text-lg"
                                        autoFocus
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-base">رقم العقد / المرجع</Label>
                                    <Input
                                        value={data.contractNumber}
                                        onChange={e => setData({ ...data, contractNumber: e.target.value })}
                                        placeholder="EMP-2024-001"
                                        className="h-12"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-base">وصف العقد وملاحظات</Label>
                                <Textarea
                                    value={data.description}
                                    onChange={e => setData({ ...data, description: e.target.value })}
                                    placeholder="أدخل أي تفاصيل إضافية حول بنود العقد..."
                                    className="min-h-[100px] text-base resize-none"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Dates Card */}
                        <Card className="shadow-md">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Calendar className="w-5 h-5 text-purple-500" />
                                    المدة الزمنية
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>تاريخ البداية <span className="text-red-500">*</span></Label>
                                    <Input
                                        type="date"
                                        value={data.startDate}
                                        onChange={e => setData({ ...data, startDate: e.target.value })}
                                        className="h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>تاريخ النهاية <span className="text-red-500">*</span></Label>
                                    <Input
                                        type="date"
                                        value={data.endDate}
                                        onChange={e => setData({ ...data, endDate: e.target.value })}
                                        className="h-11"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* SLA Card */}
                        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100 shadow-md">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg text-blue-800">
                                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                                    اتفاقية مستوى الخدمة (SLA)
                                </CardTitle>
                                <CardDescription className="text-blue-600/80">
                                    تحديد الجداول الزمنية للاستجابة والحل
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-blue-900">وقت الاستجابة (بالساعات)</Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            value={data.slaResponseTime}
                                            onChange={e => setData({ ...data, slaResponseTime: e.target.value })}
                                            placeholder="4"
                                            className="h-11 border-blue-200 focus-visible:ring-blue-500"
                                        />
                                        <div className="absolute left-3 top-3 text-sm text-gray-400">ساعة</div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">الوقت المستغرق حتى يبدأ العمل على الطلب.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-blue-900">وقت الحل (بالساعات)</Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            value={data.slaResolutionTime}
                                            onChange={e => setData({ ...data, slaResolutionTime: e.target.value })}
                                            placeholder="24"
                                            className="h-11 border-blue-200 focus-visible:ring-blue-500"
                                        />
                                        <div className="absolute left-3 top-3 text-sm text-gray-400">ساعة</div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">الوقت المستغرق لإغلاق الطلب بالكامل.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <Button type="button" variant="outline" size="lg" onClick={() => router.back()} className="min-w-[120px]">
                            إلغاء
                        </Button>
                        <Button type="submit" size="lg" disabled={loading} className="min-w-[150px] gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20">
                            {loading ? "جاري الحفظ..." :
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    حفظ العقد
                                </>
                            }
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    )
}
