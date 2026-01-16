'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, Send, ArrowRight, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createEmployeeRequest } from '@/app/actions/employee-portal'
import { PremiumPageHeader } from '@/components/ui/premium-page-header'
import Link from 'next/link'

interface GenericRequestFormProps {
    type: string
    title: string
    description: string
    icon: any
}

// Dynamic placeholders based on request type
const PLACEHOLDERS: Record<string, { subject: string, details: string }> = {
    'HARDWARE': {
        subject: 'مثال: طلب ماوس لاسلكي، شاشة إضافية 24"...',
        details: 'يرجى تحديد المواصفات المطلوبة وسبب الاحتياج...'
    },
    'SOFTWARE': {
        subject: 'مثال: طلب تثبيت برنامج AutoCAD 2024',
        details: 'يرجى ذكر اسم البرنامج، الإصدار المطلوب، وسبب الاحتياج...'
    },
    'ACCESS': {
        subject: 'مثال: صلاحية بريد إلكتروني، مجلد مشترك، أو وصول لنظام',
        details: 'يرجى تحديد نوع الصلاحية المطلوبة (بريد، مجلدات، أنظمة) وسبب الاحتياج...'
    },
    'VPN': {
        subject: 'مثال: طلب VPN للعمل من المنزل',
        details: 'يرجى توضيح سبب الاحتياج للـVPN ومدة الاستخدام المتوقعة...'
    },
    'ERP': {
        subject: 'مثال: مشكلة في نظام الموارد البشرية',
        details: 'يرجى وصف المشكلة بالتفصيل وذكر الشاشة أو الوظيفة المتأثرة...'
    },
    'WIFI': {
        subject: 'مثال: طلب حساب WiFi للضيوف',
        details: 'يرجى تحديد عدد الأجهزة ومدة الاستخدام المطلوبة...'
    },
    'OTHER': {
        subject: 'اكتب موضوع طلبك هنا...',
        details: 'يرجى شرح طلبك بالتفصيل...'
    }
}

export function GenericRequestForm({ type, title, description, icon: Icon }: GenericRequestFormProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [subject, setSubject] = useState('')
    const [details, setDetails] = useState('')
    const [priority, setPriority] = useState('NORMAL')

    const placeholders = PLACEHOLDERS[type] || PLACEHOLDERS['OTHER']

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!subject.trim() || !details.trim()) {
            toast.error('الرجاء تعبئة جميع الحقول المطلوبة')
            return
        }

        setIsSubmitting(true)
        try {
            // createEmployeeRequest expects: (type, details, subject, priority)
            const result = await createEmployeeRequest(type, details, subject, priority)

            if (result.success) {
                toast.success('تم إرسال طلبك بنجاح! سيتم مراجعته قريباً')
                router.push('/portal/requests')
            } else {
                toast.error(result.error || 'حدث خطأ أثناء إرسال الطلب')
            }
        } catch (error) {
            toast.error('حدث خطأ غير متوقع')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 overflow-y-auto" dir="rtl">
            <div className="container mx-auto px-4 py-8 max-w-7xl animate-in fade-in slide-in-from-bottom-8 duration-700">
                <PremiumPageHeader
                    title={title}
                    description={description}
                    icon={Icon}
                    rightContent={
                        <Link href="/portal/dashboard">
                            <Button variant="ghost" className="gap-2 text-white hover:bg-white/20">
                                <ArrowRight className="h-4 w-4" />
                                العودة للرئيسية
                            </Button>
                        </Link>
                    }
                />

                <Card className="border-0 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                    <CardContent className="p-8 md:p-10">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                            {/* Visual/Info Column */}
                            <div className="lg:col-span-4 space-y-6">
                                <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/30 text-center relative overflow-hidden">
                                    <div className="absolute inset-0 bg-blue-500/5 dark:bg-blue-900/20 pointer-events-none" />
                                    <div className="mx-auto w-24 h-24 bg-white dark:bg-slate-950 rounded-3xl shadow-lg flex items-center justify-center mb-6 ring-4 ring-blue-50 dark:ring-blue-900/20">
                                        <Icon className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                                        {title}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 px-2 leading-relaxed">
                                        {description}
                                    </p>
                                </div>
                            </div>

                            {/* Form Column */}
                            <div className="lg:col-span-8 space-y-8">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3 mb-6">
                                        <div className="bg-blue-600 h-8 w-1.5 rounded-full" />
                                        تفاصيل الطلب
                                    </h3>

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="space-y-3">
                                            <Label className="text-lg font-semibold">موضوع الطلب</Label>
                                            <Input
                                                placeholder={placeholders.subject}
                                                value={subject}
                                                onChange={(e) => setSubject(e.target.value)}
                                                className="h-12 bg-slate-50 dark:bg-slate-950 text-lg border-slate-200 dark:border-slate-800"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-lg font-semibold">التفاصيل (والأسباب)</Label>
                                            <Textarea
                                                placeholder={placeholders.details}
                                                rows={5}
                                                value={details}
                                                onChange={(e) => setDetails(e.target.value)}
                                                className="bg-slate-50 dark:bg-slate-950 resize-none text-base min-h-[150px] p-4 border-slate-200 dark:border-slate-800"
                                            />
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                يرجى ذكر الأسباب بالتفصيل لتسريع عملية الموافقة.
                                            </p>
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-lg font-semibold">الأهمية</Label>
                                            <Select value={priority} onValueChange={setPriority}>
                                                <SelectTrigger className="h-12 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="LOW">منخفضة - يمكن الانتظار</SelectItem>
                                                    <SelectItem value="NORMAL">عادية (الافتراضي)</SelectItem>
                                                    <SelectItem value="HIGH">عالية - العمل متوقف</SelectItem>
                                                    <SelectItem value="URGENT">طوارئ - تأثير شامل</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                                            <Link href="/portal/dashboard">
                                                <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                                                    إلغاء
                                                </Button>
                                            </Link>
                                            <Button
                                                type="submit"
                                                size="lg"
                                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white h-12 px-10 text-base shadow-lg shadow-blue-500/20"
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? (
                                                    <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                                                ) : (
                                                    <Send className="ml-2 h-5 w-5" />
                                                )}
                                                إرسال الطلب
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
