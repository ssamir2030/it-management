'use client'

import { useState } from 'react'
import { submitExternalCertificate } from '@/app/actions/learning'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Upload, Loader2, Calendar as CalendarIcon } from 'lucide-react'
import { toast } from 'sonner'
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export function ExternalCertForm() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [date, setDate] = useState<Date>()

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (!date) return toast.error('يرجى تحديد تاريخ الإكمال')

        setLoading(true)
        const formData = new FormData(event.currentTarget)

        const data = {
            title: formData.get('title') as string,
            issuer: formData.get('issuer') as string,
            completionDate: date,
            fileUrl: formData.get('fileUrl') as string,
        }

        const res = await submitExternalCertificate(data)

        if (res.success) {
            toast.success('تم رفع الشهادة بنجاح وانتظار الاعتماد')
            setOpen(false)
        } else {
            toast.error('حدث خطأ أثناء رفع الشهادة')
        }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    إضافة شهادة خارجية
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>إضافة شهادة خارجية</DialogTitle>
                    <DialogDescription>
                        أضف الدورات والشهادات التي حصلت عليها من خارج المنصة ليتم إضافتها لملفك.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>اسم الدورة / الشهادة</Label>
                        <Input name="title" required placeholder="مثال: إدارة المشاريع الاحترافية PMP" />
                    </div>

                    <div className="space-y-2">
                        <Label>جهة الإصدار (المعهد/الجامعة)</Label>
                        <Input name="issuer" required placeholder="مثال: Project Management Institute" />
                    </div>

                    <div className="space-y-2">
                        <Label>تاريخ الإكمال</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP") : <span>اختر التاريخ</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-2">
                        <Label>رابط الشهادة (اختياري)</Label>
                        <Input name="fileUrl" placeholder="https://..." />
                        <p className="text-[10px] text-muted-foreground">يمكنك وضع رابط Google Drive أو Dropbox للملف</p>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            حفظ الشهادة
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
