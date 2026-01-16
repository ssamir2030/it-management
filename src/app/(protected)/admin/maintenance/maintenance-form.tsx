'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createMaintenance } from "@/app/actions/maintenance"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wrench, Calendar, FileText, Save, X, CheckCircle2, RefreshCw } from "lucide-react"

export function MaintenanceForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        try {
            const formData = new FormData(e.currentTarget)
            const result = await createMaintenance(formData)

            if (result.success) {
                toast.success("تم جدولة الصيانة بنجاح")
                router.push("/admin/maintenance")
            } else {
                toast.error(result.error || "حدث خطأ ما")
            }
        } catch (error) {
            toast.error("حدث خطأ غير متوقع")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Basic Info Card */}
                <Card className="card-elevated animate-slide-up stagger-1 border-t-4 border-t-primary/20">
                    <CardHeader className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-primary/10 p-2.5">
                                <Wrench className="h-5 w-5 text-primary" />
                            </div>
                            <div className="space-y-1">
                                <CardTitle className="text-xl font-bold">بيانات الصيانة</CardTitle>
                                <CardDescription>العنوان ونوع الصيانة</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-base font-medium">عنوان الصيانة <span className="text-red-500">*</span></Label>
                            <Input
                                name="title"
                                id="title"
                                required
                                placeholder="مثال: صيانة دورية للخوادم"
                                className="h-12 text-base"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="type" className="text-base font-medium">نوع الصيانة <span className="text-red-500">*</span></Label>
                            <Select name="type" required defaultValue="PREVENTIVE">
                                <SelectTrigger className="h-12 text-base">
                                    <SelectValue placeholder="اختر النوع" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PREVENTIVE"> وقائية (Preventive)</SelectItem>
                                    <SelectItem value="CORRECTIVE"> تصحيحية (Corrective)</SelectItem>
                                    <SelectItem value="INSPECTION"> فحص (Inspection)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Scheduling Card */}
                <Card className="card-elevated animate-slide-up stagger-2 border-t-4 border-t-blue-500/20">
                    <CardHeader className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-blue-500/10 p-2.5">
                                <Calendar className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="space-y-1">
                                <CardTitle className="text-xl font-bold">الجدولة</CardTitle>
                                <CardDescription>تاريخ تنفيذ الصيانة</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Label htmlFor="scheduledDate" className="text-base font-medium">تاريخ الجدولة <span className="text-red-500">*</span></Label>
                            <Input
                                type="date"
                                id="scheduledDate"
                                name="scheduledDate"
                                required
                                className="h-12 text-base w-full"
                            />
                            <p className="text-sm text-muted-foreground pt-1">
                                سيتم إرسال تذكير قبل الموعد المحدد
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Details Card */}
            <Card className="card-elevated animate-slide-up stagger-3 border-t-4 border-t-indigo-500/20">
                <CardHeader className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-indigo-500/10 p-2.5">
                            <FileText className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-bold">التفاصيل والملاحظات</CardTitle>
                            <CardDescription>وصف شامل لعملية الصيانة</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-base font-medium">الوصف</Label>
                        <Textarea
                            name="description"
                            id="description"
                            placeholder="تفاصيل عملية الصيانة..."
                            className="min-h-[120px] text-base resize-none focus:ring-2 focus:ring-offset-1"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes" className="text-base font-medium">ملاحظات إضافية</Label>
                        <Textarea
                            name="notes"
                            id="notes"
                            placeholder="أي ملاحظات أخرى..."
                            className="min-h-[80px] text-base resize-none"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4 animate-slide-up stagger-4">
                <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => router.back()}
                    className="gap-2 min-w-[120px]"
                >
                    <X className="h-4 w-4" />
                    إلغاء
                </Button>
                <Button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 gap-2 min-w-[200px] shadow-lg shadow-blue-600/20"
                    size="lg"
                >
                    {loading ? (
                        <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            جاري الحفظ...
                        </>
                    ) : (
                        <>
                            <CheckCircle2 className="h-4 w-4" />
                            جدولة الصيانة
                        </>
                    )}
                </Button>
            </div>
        </form>
    )
}
