'use client'

import { useState } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { requestSoftwareInstallation } from "@/app/actions/software-catalog"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import { X } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export function SoftwareRequestButton({ softwareId, softwareName }: { softwareId: string; softwareName: string }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [details, setDetails] = useState("")

    async function handleRequest() {
        setLoading(true)
        try {
            const result = await requestSoftwareInstallation(softwareId, details)

            if (result.success) {
                toast.success(`تم إرسال طلب تثبيت ${softwareName} بنجاح`)
                setOpen(false)
                setDetails("")
            } else {
                toast.error(result.error || "فشل إرسال الطلب")
            }
        } catch (error) {
            toast.error("حدث خطأ غير متوقع")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full gap-2 bg-violet-600 hover:bg-violet-700">
                    <Download className="h-4 w-4" />
                    طلب التثبيت
                </Button>
            </DialogTrigger>
            <DialogContent className="w-screen h-screen max-w-none m-0 p-0 rounded-none border-0 bg-slate-50 dark:bg-slate-950 overflow-y-auto w-full" aria-describedby={undefined}>
                <DialogTitle className="sr-only">طلب تثبيت {softwareName}</DialogTitle>
                <div className="min-h-full flex flex-col">
                    <div dir="rtl" className="container mx-auto px-4 py-8 max-w-7xl flex-1 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                        <PremiumPageHeader
                            title={`طلب تثبيت ${softwareName}`}
                            description="سيتم إرسال طلبك إلى قسم تقنية المعلومات لمراجعته والموافقة عليه"
                            icon={Download}
                            rightContent={
                                <Button
                                    onClick={() => setOpen(false)}
                                    variant="ghost"
                                    className="text-white hover:bg-white/20 gap-2"
                                >
                                    <X className="h-4 w-4" />
                                    إغلاق
                                </Button>
                            }
                        />
                        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl shadow-2xl p-8 md:p-10 border border-slate-100 dark:border-slate-800">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                                <div className="md:col-span-5 bg-violet-50 dark:bg-violet-900/10 p-8 flex flex-col items-center justify-center text-center rounded-2xl border border-violet-100 dark:border-violet-900/30">
                                    <div className="h-24 w-24 bg-white dark:bg-slate-900 rounded-3xl flex items-center justify-center shadow-lg mb-6 ring-4 ring-violet-50 dark:ring-violet-900/20">
                                        <Download className="h-10 w-10 text-violet-600 dark:text-violet-400" />
                                    </div>
                                    <h3 className="font-bold text-2xl text-slate-900 dark:text-slate-100 mb-2">{softwareName}</h3>
                                    <p className="text-slate-500 dark:text-slate-400">طلب تثبيت برمجيات</p>
                                </div>

                                <div className="md:col-span-7 flex flex-col justify-center">
                                    <div className="mb-6">
                                        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3 mb-2">
                                            <span className="text-violet-600">تأكيد الطلب</span>
                                        </h3>
                                        <p className="text-slate-500 dark:text-slate-400">
                                            يرجى تزويدنا بأي تفاصيل إضافية قد تساعد في معالجة طلبك بشكل أسرع.
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <Label htmlFor="details" className="text-lg font-semibold">تفاصيل إضافية (اختياري)</Label>
                                            <Textarea
                                                id="details"
                                                value={details}
                                                onChange={(e) => setDetails(e.target.value)}
                                                placeholder="هل هناك إصدار معين، إضافات خاصة، أو مبررات محددة؟"
                                                className="min-h-[150px] bg-slate-50 dark:bg-slate-900/50 resize-none text-base p-4 border-slate-200 dark:border-slate-700"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-6 border-t dark:border-slate-800 flex items-center justify-end gap-4">
                                        <Button variant="outline" size="lg" onClick={() => setOpen(false)} className="h-12 px-8 text-base">
                                            إلغاء
                                        </Button>
                                        <Button onClick={handleRequest} disabled={loading} size="lg" className="bg-violet-600 hover:bg-violet-700 h-12 px-10 text-base shadow-lg shadow-violet-500/20">
                                            {loading ? "جاري الإرسال..." : "إرسال الطلب"}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
