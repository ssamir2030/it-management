'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { createEmployeeRequest } from "@/app/actions/employee-portal"
import { toast } from "sonner"
import { Loader2, ArrowRight, X, Zap, FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function RequestServiceDialog({ service }: { service: any }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        const details = formData.get("details") as string
        const subject = formData.get("subject") as string

        // Use service ID and type 'SERVICE_REQUEST'
        const result = await createEmployeeRequest(
            'SERVICE_REQUEST',
            details,
            subject || service.nameAr,
            'NORMAL',
            [],
            service.id
        )

        setLoading(false)

        if (result.success) {
            toast.success("تم إرسال طلبك بنجاح")
            setOpen(false)
            router.push('/portal/requests')
        } else {
            toast.error(result.error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30">
                    طلب الخدمة
                    <ArrowRight className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[100vw] w-full h-[100vh] p-0 gap-0 bg-slate-50 dark:bg-slate-950 overflow-hidden" dir="rtl">
                <div className="w-full h-full overflow-y-auto">
                    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-20 space-y-6">
                        <PremiumPageHeader
                            title={`طلب خدمة: ${service.nameAr}`}
                            description={`يرجى تعبئة التفاصيل أدناه لإتمام الطلب. الوقت المتوقع للإنجاز: ${service.slaHours} ساعة.`}
                            icon={Zap}
                            rightContent={
                                <Button
                                    variant="ghost"
                                    size="lg"
                                    onClick={() => setOpen(false)}
                                    className="text-muted-foreground hover:bg-slate-200/50 gap-2"
                                >
                                    <X className="h-4 w-4" />
                                    إغلاق
                                </Button>
                            }
                        />

                        <Card className="card-elevated border-t-4 border-t-primary/20">
                            <CardHeader>
                                <CardTitle className="text-xl font-bold flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-primary" />
                                    بيانات الطلب
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form action={handleSubmit} className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-base font-medium">موضوع الطلب</Label>
                                            <Input
                                                name="subject"
                                                defaultValue={service.nameAr}
                                                required
                                                className="h-12 text-lg"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-base font-medium">تفاصيل إضافية / مبررات الطلب</Label>
                                            <Textarea
                                                name="details"
                                                placeholder="اشرح سبب حاجتك لهذه الخدمة أو أي تفاصيل خاصة..."
                                                required
                                                className="min-h-[150px] text-base resize-none p-4"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-6 border-t mt-6">
                                        <Button type="button" variant="outline" size="lg" onClick={() => setOpen(false)}>
                                            إلغاء
                                        </Button>
                                        <Button type="submit" disabled={loading} size="lg" className="min-w-[140px]">
                                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            إرسال الطلب
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
