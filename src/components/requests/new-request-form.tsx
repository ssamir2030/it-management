'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createEmployeeRequest, createSupportTicket } from '@/app/actions/employee-portal'
import { Button } from '@/components/ui/button'
import { useUploadThing } from '@/utils/uploadthing'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, Send, BookOpen, Sparkles, X, ExternalLink, Paperclip, CheckCircle2, FileText } from 'lucide-react'

interface NewRequestFormProps {
    type: string
    titlePlaceholder?: string
    detailsPlaceholder?: string
    defaultSubject?: string
}

interface AttachmentData {
    fileName: string
    fileUrl: string
    fileType: string
    fileSize: number
}

export function NewRequestForm({
    type,
    titlePlaceholder = "عنوان الطلب",
    detailsPlaceholder = "تفاصيل الطلب...",
    defaultSubject = ""
}: NewRequestFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [formData, setFormData] = useState<{
        subject: string
        details: string
        priority: string
        attachments: AttachmentData[]
    }>({
        subject: defaultSubject,
        details: '',
        priority: 'NORMAL',
        attachments: []
    })

    const { startUpload } = useUploadThing("attachmentUploader") // Use our defined endpoint

    const handleMainAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return

        const files = Array.from(e.target.files)
        setUploading(true)

        try {
            // UploadThing handles the upload process
            const uploadedFiles = await startUpload(files)

            if (uploadedFiles) {
                const newAttachments = uploadedFiles.map(file => ({
                    fileName: file.name,
                    fileUrl: file.ufsUrl,
                    fileType: files.find(f => f.name === file.name)?.type || 'application/octet-stream', // Get real MIME type from original input
                    fileSize: file.size
                }))

                setFormData(prev => ({
                    ...prev,
                    attachments: [...(prev.attachments || []), ...newAttachments]
                }))
                toast.success(`تم رفع ${uploadedFiles.length} ملفات بنجاح`)
            }
        } catch (error) {
            console.error("Upload failed", error)
            toast.error("حدث خطأ أثناء الرفع")
        } finally {
            setUploading(false)
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (!formData.subject.trim() || !formData.details.trim()) {
            toast.error('الرجاء ملء جميع الحقول المطلوبة')
            return
        }

        setLoading(true)

        let result

        // If it's a support ticket, use createSupportTicket
        if (type === 'SUPPORT') {
            result = await createSupportTicket(
                formData.subject,
                formData.details,
                formData.priority,
                formData.attachments
            )
        } else {
            // Otherwise, use createEmployeeRequest (for hardware, ink, paper, etc.)
            result = await createEmployeeRequest(
                type,
                formData.details,
                formData.subject,
                formData.priority,
                formData.attachments
            )
        }

        if (result.success && result.data) {
            toast.success('تم إرسال الطلب بنجاح')

            // Redirect based on type
            if (type === 'SUPPORT') {
                router.push(`/portal/support`)
            } else {
                router.push(`/portal/requests/${result.data.id}`)
            }
        } else {
            toast.error(result.error || 'فشل في إرسال الطلب')
            setLoading(false)
        }
    }

    // Smart Search Logic
    const [suggestions, setSuggestions] = useState<any[]>([])
    const [searching, setSearching] = useState(false)
    let searchTimeout: NodeJS.Timeout

    async function handleSubjectChange(val: string) {
        setFormData({ ...formData, subject: val })

        // Only for support tickets
        if (type !== 'SUPPORT' || val.length < 3) {
            setSuggestions([])
            return
        }

        setSearching(true)
        clearTimeout(searchTimeout)

        searchTimeout = setTimeout(async () => {
            try {
                const { getArticles } = await import('@/app/actions/knowledge')
                const res = await getArticles(val)
                if (res.success && res.data) {
                    setSuggestions(res.data.slice(0, 3)) // Show top 3
                }
            } catch (error) {
                console.error("Failed to fetch suggestions")
            } finally {
                setSearching(false)
            }
        }, 800)
    }

    return (
        <Card className="p-8 shadow-lg border-t-4 border-t-blue-600 h-full dark:bg-slate-900 dark:border-slate-800">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* العنوان */}
                <div className="space-y-3 md:col-span-8 relative">
                    <Label htmlFor="subject" className="text-base font-semibold dark:text-slate-200">عنوان الطلب (v2.1) *</Label>
                    <Input
                        id="subject"
                        placeholder={titlePlaceholder}
                        value={formData.subject}
                        onChange={(e) => handleSubjectChange(e.target.value)}
                        required
                        className="bg-gray-50/50 border-gray-200 focus:bg-white transition-all duration-200 h-12 text-lg dark:bg-slate-950/50 dark:border-slate-800 dark:focus:bg-slate-950 dark:text-gray-100 dark:placeholder:text-muted-foreground"
                    />

                    {/* Suggestions Panel */}
                    {(suggestions.length > 0) && (
                        <div className="absolute top-full left-0 right-0 z-10 mt-2 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-blue-100 dark:border-slate-700 overflow-hidden animate-in fade-in slide-in-from-top-2">
                            <div className="bg-blue-50/50 dark:bg-blue-900/20 p-2 flex items-center justify-between">
                                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                    <Sparkles className="h-3 w-3" />
                                    اقتراحات ذكية من قاعدة المعرفة
                                </span>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-transparent" onClick={() => setSuggestions([])}>
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                            <div className="divide-y dark:divide-slate-700">
                                {suggestions.map(article => (
                                    <a
                                        key={article.id}
                                        href={`/portal/knowledge/${article.id}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="block p-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors group"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                <BookOpen className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-medium dark:text-gray-200 flex items-center gap-2">
                                                    {article.title}
                                                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </h4>
                                                <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                                                    {article.excerpt || article.content.substring(0, 60)}...
                                                </p>
                                            </div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* الأولوية */}
                <div className="space-y-3 md:col-span-4">
                    <Label htmlFor="priority" className="text-base font-semibold dark:text-slate-200">الأولوية</Label>
                    <Select
                        value={formData.priority}
                        onValueChange={(value) => setFormData({ ...formData, priority: value })}
                    >
                        <SelectTrigger className="bg-gray-50/50 border-gray-200 focus:bg-white transition-all duration-200 h-12 dark:bg-slate-950/50 dark:border-slate-800 dark:text-gray-100">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent dir="rtl" className="dark:bg-slate-900 dark:border-slate-800">
                            <SelectItem value="LOW" className="dark:text-gray-100 dark:focus:bg-slate-800">
                                <div className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-green-500" />
                                    <span>منخفضة</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="NORMAL">
                                <div className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                                    <span>عادية</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="HIGH">
                                <div className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-orange-500" />
                                    <span>عالية</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="URGENT">
                                <div className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-red-500" />
                                    <span>عاجلة</span>
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* المرفقات (اختياري) */}
                <div className="space-y-3 md:col-span-12">
                    <Label className="text-base font-semibold dark:text-slate-200">المرفقات (اختياري)</Label>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                            <Input
                                type="file"
                                accept="*"
                                multiple
                                onChange={handleMainAttachmentUpload}
                                className="hidden"
                                id="file-upload"
                                disabled={uploading}
                            />
                            <Label
                                htmlFor="file-upload"
                                className={`flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors ${uploading ? 'opacity-50 cursor-wait' : ''}`}
                            >
                                <Paperclip className="h-4 w-4" />
                                <span>{uploading ? 'جاري الرفع...' : 'إضافة مرفقات'}</span>
                            </Label>
                        </div>

                        {formData.attachments && formData.attachments.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {formData.attachments.map((file, index) => (
                                    <div key={index} className="relative group border rounded-lg p-2 flex flex-col items-center gap-2 bg-gray-50 dark:bg-slate-900">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newAttachments = [...(formData.attachments || [])]
                                                newAttachments.splice(index, 1)
                                                setFormData({ ...formData, attachments: newAttachments })
                                            }}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>

                                        {file.fileType.startsWith('image/') ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={file.fileUrl}
                                                alt={file.fileName}
                                                className="h-20 w-full object-cover rounded"
                                            />
                                        ) : (
                                            <div className="h-20 w-full flex items-center justify-center bg-gray-200 dark:bg-slate-800 rounded">
                                                <FileText className="h-8 w-8 text-gray-400" />
                                            </div>
                                        )}
                                        <span className="text-xs text-center truncate w-full px-1" title={file.fileName}>
                                            {file.fileName}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* التفاصيل */}
                <div className="space-y-3 md:col-span-12">
                    <Label htmlFor="details" className="text-base font-semibold dark:text-slate-200">التفاصيل *</Label>
                    <Textarea
                        id="details"
                        placeholder={detailsPlaceholder}
                        value={formData.details}
                        onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                        required
                        className="min-h-[300px] bg-gray-50/50 border-gray-200 focus:bg-white transition-all duration-200 resize-none text-base leading-relaxed p-4 dark:bg-slate-950/50 dark:border-slate-800 dark:focus:bg-slate-950 dark:text-gray-100 dark:placeholder:text-muted-foreground"
                    />
                </div>
                <div className="md:col-span-12 pt-6 flex justify-end border-t dark:border-slate-800">
                    <Button
                        type="submit"
                        size="lg"
                        className="min-w-[200px] gap-2 bg-blue-600 hover:bg-blue-700 text-lg h-12 shadow-md hover:shadow-xl transition-all duration-300"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                جاري الإرسال...
                            </>
                        ) : (
                            <>
                                <Send className="h-5 w-5" />
                                إرسال الطلب
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Card>
    )
}
