'use client'

export const dynamic = 'force-dynamic';

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { submitExternalCertificate } from '@/app/actions/learning'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowRight, Upload, Loader2, Calendar as CalendarIcon, FileCheck } from 'lucide-react'
import { toast } from 'sonner'
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import Link from 'next/link'
import { useUploadThing } from '@/utils/uploadthing'

export default function NewCertificatePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [date, setDate] = useState<Date>()
    const [fileUrl, setFileUrl] = useState<string>('')
    const [uploading, setUploading] = useState(false)

    // UploadThing hook
    const { startUpload } = useUploadThing("attachmentUploader")

    async function onFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files || e.target.files.length === 0) return

        setUploading(true)
        const file = e.target.files[0]

        try {
            const uploadedFiles = await startUpload([file])

            if (uploadedFiles && uploadedFiles[0]) {
                setFileUrl(uploadedFiles[0].url)
                toast.success('تم رفع الملف بنجاح')
            }
        } catch (error) {
            console.error('Upload Error', error)
            toast.error('حدث خطأ أثناء الرفع')
        } finally {
            setUploading(false)
        }
    }

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (!date) return toast.error('يرجى تحديد تاريخ الإكمال')

        setLoading(true)
        const formData = new FormData(event.currentTarget)

        const data = {
            title: formData.get('title') as string,
            issuer: formData.get('issuer') as string,
            completionDate: date,
            fileUrl: fileUrl, // Use the uploaded URL
        }

        const res = await submitExternalCertificate(data)

        if (res.success) {
            toast.success('تمت إضافة الشهادة بنجاح')
            router.push('/portal/learning')
        } else {
            toast.error('حدث خطأ أثناء إضافة الشهادة')
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
            <div className="py-8 space-y-6">
                <Link href="/portal/learning" className="inline-flex items-center text-slate-500 hover:text-slate-900 mb-6">
                    <ArrowRight className="h-4 w-4 ml-2" />
                    عودة لمركز التعلم
                </Link>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">إضافة شهادة جديدة</CardTitle>
                        <CardDescription>
                            أضف تفاصيل الدورة أو الشهادة التي حصلت عليها وقم بإرفاق نسخة منها.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={onSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label>اسم الدورة / الشهادة</Label>
                                <Input name="title" required placeholder="مثال: شهادة إدارة المخاطر" className="h-12" />
                            </div>

                            <div className="space-y-2">
                                <Label>جهة الإصدار (المعهد/الجامعة)</Label>
                                <Input name="issuer" required placeholder="مثال: معهد الإدارة العامة" className="h-12" />
                            </div>

                            <div className="space-y-2">
                                <Label>تاريخ الإكمال</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full h-12 justify-start text-left font-normal",
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
                                <Label>نسخة الشهادة (صورة أو PDF)</Label>
                                <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors">
                                    {fileUrl ? (
                                        <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-full">
                                            <FileCheck className="h-5 w-5" />
                                            <span className="font-medium">تم إرفاق الملف</span>
                                            <Button type="button" variant="ghost" size="sm" onClick={() => setFileUrl('')} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                                حذف
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            {uploading ? (
                                                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                                            ) : (
                                                <Upload className="h-8 w-8 text-slate-400 mb-2" />
                                            )}
                                            <div className="space-y-1">
                                                <label htmlFor="file-upload" className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-500">
                                                    <span>اضغط للرفع</span>
                                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={onFileUpload} accept="image/*,.pdf" />
                                                </label>
                                                <p className="text-xs text-slate-500">PNG, JPG, PDF up to 10MB</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <Button type="submit" size="lg" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading || uploading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                حفظ الشهادة
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
