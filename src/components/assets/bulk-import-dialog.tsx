'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, Download, FileUp } from 'lucide-react'
import { toast } from "sonner"
import { bulkImportAssets } from '@/app/actions/bulk-import'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function BulkImportDialog() {
    const [open, setOpen] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [result, setResult] = useState<any>(null)
    const router = useRouter()

    async function handleUpload() {
        if (!file) return

        setUploading(true)
        setResult(null)
        const formData = new FormData()
        formData.append('file', file)

        try {
            const res = await bulkImportAssets(formData)
            setResult(res)
            if (res.success) {
                toast.success(`تم استيراد ${res.count} أصل بنجاح`)
                router.refresh()
                // Don't close immediately to show results
            } else {
                toast.error(res.error || "فشل الاستيراد")
            }
        } catch (error) {
            toast.error("حدث خطأ غير متوقع")
        } finally {
            setUploading(false)
        }
    }

    const reset = () => {
        setFile(null)
        setResult(null)
        setUploading(false)
    }

    return (
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val)
            if (!val) reset()
        }}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <FileUp className="h-4 w-4" />
                    استيراد (Excel)
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5 text-green-600" />
                        استيراد الأصول
                    </DialogTitle>
                    <DialogDescription>
                        يمكنك إضافة مئات الأصول دفعة واحدة عن طريق رفع ملف Excel.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {!result ? (
                        <div className="space-y-4">
                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer relative">
                                <input
                                    type="file"
                                    accept=".xlsx, .xls, .csv"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                />
                                <div className="flex flex-col items-center gap-2">
                                    <Upload className="h-10 w-10 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                        {file ? file.name : "اسحب ملف Excel هنا"}
                                    </span>
                                    <span className="text-xs text-gray-400">.xlsx, .xls, .csv</span>
                                </div>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md text-sm text-blue-700 dark:text-blue-300">
                                <p className="font-semibold mb-1">تعليمات الملف:</p>
                                <ul className="list-disc list-inside space-y-1 text-xs opacity-90">
                                    <li>الصف الأول يجب أن يكون أسماء الأعمدة (English).</li>
                                    <li>الأعمدة المطلوبة: <code>tag</code>, <code>name</code>.</li>
                                    <li>الأعمدة الاختيارية: <code>type</code>, <code>serialNumber</code>, <code>model</code>, <code>manufacturer</code>.</li>
                                </ul>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" onClick={() => setOpen(false)}>إلغاء</Button>
                                <Button onClick={handleUpload} disabled={!file || uploading}>
                                    {uploading ? "جاري الرفع..." : "استيراد الملف"}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                            <div className={`p-4 rounded-lg flex items-start gap-3 ${result.success ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 'bg-red-50 text-red-800'}`}>
                                {result.success ? <CheckCircle className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
                                <div>
                                    <h4 className="font-semibold">{result.success ? 'تمت العملية بنجاح' : 'فشل الاستيراد'}</h4>
                                    <p className="text-sm mt-1">
                                        تمت معالجة {result.total} صف. تم إضافة {result.count} أصل بنجاح.
                                    </p>
                                </div>
                            </div>

                            {result.errors && result.errors.length > 0 && (
                                <div className="max-h-40 overflow-y-auto border rounded-md p-2 bg-gray-50 dark:bg-slate-900">
                                    <p className="text-xs font-semibold text-red-600 mb-2 sticky top-0 bg-gray-50 dark:bg-slate-900 pb-1">الأخطاء:</p>
                                    <ul className="text-xs space-y-1 text-red-500 font-mono">
                                        {result.errors.map((err: string, i: number) => (
                                            <li key={i}>{err}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="flex justify-end gap-2">
                                <Button onClick={reset} variant="outline">استيراد ملف آخر</Button>
                                <Button onClick={() => setOpen(false)}>إغلاق</Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
