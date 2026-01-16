'use client'

export const dynamic = 'force-dynamic';

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2, FileText, Upload, DollarSign, CheckCircle2, X } from "lucide-react"
import { PremiumPageHeader } from '@/components/ui/premium-page-header'
import Link from "next/link"
import { toast } from "sonner"
import { getDocumentById, updateDocument } from "@/app/actions/documents"
import { useUploadThing } from '@/utils/uploadthing'

export default function EditDocumentPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const { id } = params
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [docType, setDocType] = useState("")
    const [initialData, setInitialData] = useState<any>(null)
    const { startUpload } = useUploadThing("attachmentUploader")

    useEffect(() => {
        async function fetchDocument() {
            try {
                const res = await getDocumentById(id)
                if (res.success && res.data) {
                    setInitialData(res.data)
                    setDocType(res.data.type)
                } else {
                    toast.error("لم يتم العثور على المستند")
                    router.push("/documents")
                }
            } catch (error) {
                toast.error("فشل في جلب بيانات المستند")
            } finally {
                setFetching(false)
            }
        }
        fetchDocument()
    }, [id, router])

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            if (file.size > 10 * 1024 * 1024) {
                toast.error("حجم الملف كبير جداً")
                return
            }
            setSelectedFile(file)
        }
    }

    const clearFile = (e: React.MouseEvent) => {
        e.stopPropagation()
        setSelectedFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        if (!docType) {
            toast.error("مطلوب نوع المستند")
            return
        }

        const form = e.currentTarget
        const titleInput = form.elements.namedItem('title') as HTMLInputElement
        const dateInput = form.elements.namedItem('date') as HTMLInputElement
        const amountInput = form.elements.namedItem('amount') as HTMLInputElement

        const title = titleInput.value
        const date = dateInput.valueAsDate || new Date()
        const amount = parseFloat(amountInput.value) || 0

        setLoading(true)

        try {
            let fileData = {}

            // Only upload if a new file is selected
            if (selectedFile) {
                const uploadedFiles = await startUpload([selectedFile])

                if (!uploadedFiles || !uploadedFiles[0]) {
                    throw new Error("فشل رفع الملف")
                }

                fileData = {
                    fileName: selectedFile.name,
                    fileUrl: uploadedFiles[0].url,
                    fileSize: selectedFile.size,
                    fileType: selectedFile.type
                }
            }

            const result = await updateDocument(id, {
                title,
                type: docType,
                documentDate: date,
                amount,
                ...fileData
            })

            if (result.success) {
                toast.success("تم تحديث المستند بنجاح")
                router.push("/documents")
            } else {
                toast.error("خطأ في التحديث", { description: result.error })
            }

        } catch (error) {
            console.error(error)
            toast.error("حدث خطأ غير متوقع")
        } finally {
            setLoading(false)
        }
    }

    if (fetching) {
        return <div className="flex items-center justify-center min-h-[50vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    }

    return (
        <div className="w-full py-10 animate-fade-in" dir="rtl">
            <PremiumPageHeader
                title="تعديل المستند"
                description={`تعديل بيانات المستند: ${initialData?.title}`}
                icon={FileText}
                rightContent={
                    <Link href="/documents">
                        <Button variant="ghost" size="lg" className="text-white hover:bg-white/20 gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            العودة
                        </Button>
                    </Link>
                }
            />

            <form onSubmit={handleSubmit} className="animate-slide-up stagger-1 space-y-6">
                <Card className="card-elevated border-t-4 border-t-indigo-500/20">
                    <CardHeader className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-indigo-500/10 p-2.5">
                                <FileText className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div className="space-y-1">
                                <CardTitle className="text-xl font-bold">بيانات المستند</CardTitle>
                                <CardDescription>تعديل التفاصيل أو استبدال الملف المرفق</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="title" className="text-base font-medium">عنوان المستند <span className="text-red-500">*</span></Label>
                                <Input
                                    id="title"
                                    name="title"
                                    required
                                    defaultValue={initialData?.title}
                                    placeholder="مثال: فاتورة صيانة 2024"
                                    className="h-12 text-base"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="type" className="text-base font-medium">نوع المستند <span className="text-red-500">*</span></Label>
                                <Select required value={docType} onValueChange={setDocType}>
                                    <SelectTrigger className="h-12 text-base">
                                        <SelectValue placeholder="اختر النوع" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="INVOICE">فاتورة (Invoice)</SelectItem>
                                        <SelectItem value="QUOTATION">عرض سعر (Quotation)</SelectItem>
                                        <SelectItem value="CONTRACT">عقد (Contract)</SelectItem>
                                        <SelectItem value="REPORT">تقرير (Report)</SelectItem>
                                        <SelectItem value="OTHER">أخرى (Other)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="date" className="text-base font-medium">التاريخ <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                    <Input
                                        id="date"
                                        name="date"
                                        type="date"
                                        required
                                        defaultValue={initialData?.documentDate ? new Date(initialData.documentDate).toISOString().split('T')[0] : ''}
                                        className="h-12 text-base pl-10 block"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="amount" className="text-base font-medium">المبلغ (ر.س)</Label>
                                <div className="relative">
                                    <Input
                                        id="amount"
                                        name="amount"
                                        type="number"
                                        step="0.01"
                                        defaultValue={initialData?.amount}
                                        placeholder="0.00"
                                        className="h-12 text-base pl-10"
                                        dir="ltr"
                                    />
                                    <DollarSign className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-base font-medium">ملف المستند (اختياري للتحديث)</Label>

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                className="hidden"
                                accept=".pdf,.png,.jpg,.jpeg,.docx"
                            />

                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer group relative
                                    ${selectedFile
                                        ? 'border-indigo-500 bg-indigo-50'
                                        : 'border-muted-foreground/25 hover:bg-muted/30 hover:border-primary/50'
                                    }`}
                            >
                                {selectedFile ? (
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="rounded-full bg-indigo-100 p-4 shadow-sm">
                                            <CheckCircle2 className="h-8 w-8 text-indigo-600" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-lg font-semibold text-indigo-900">{selectedFile.name}</p>
                                            <p className="text-sm text-indigo-600">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="mt-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                                            onClick={clearFile}
                                        >
                                            <X className="h-4 w-4 mr-1" />
                                            إزالة الملف الجديد
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="rounded-full bg-primary/10 p-4 group-hover:bg-primary/20 transition-colors shadow-sm">
                                            <Upload className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-lg font-semibold text-foreground/80 group-hover:text-primary transition-colors">اضغط لاستبدال الملف</p>
                                            <p className="text-sm text-muted-foreground">الملف الحالي: <a href={initialData?.fileUrl} target="_blank" className="underline hover:text-primary" onClick={(e) => e.stopPropagation()}>{initialData?.fileName}</a></p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-6 flex justify-end gap-4">
                            <Button type="submit" disabled={loading} size="lg" className="min-w-[200px] gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30">
                                {loading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        جاري التحديث...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="h-5 w-5" />
                                        حفظ التعديلات
                                    </>
                                )}
                            </Button>
                            <Link href="/documents">
                                <Button type="button" variant="outline" size="lg" className="gap-2">
                                    إلغاء
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    )
}
