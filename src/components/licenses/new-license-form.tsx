'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { createLicense } from '@/app/actions/licenses'
import { toast } from 'sonner'
import { Loader2, Key, Calendar, DollarSign, FileText, CheckCircle2, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Link from 'next/link'

export function NewLicenseForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    async function onSubmit(formData: FormData) {
        setLoading(true)
        try {
            const result = await createLicense(formData)
            if (result.success) {
                toast.success('تم إضافة الرخصة بنجاح')
                router.push('/admin/licenses')
                router.refresh()
            } else {
                toast.error(result.error || 'حدث خطأ أثناء الإضافة')
            }
        } catch (error) {
            toast.error('حدث خطأ غير متوقع')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form action={onSubmit} className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* License Details Card */}
                <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm shadow-xl">
                    <CardHeader className="border-b border-white/5 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                                <Key className="h-5 w-5 text-blue-500" />
                            </div>
                            <div className="space-y-1">
                                <CardTitle className="text-base">تفاصيل الرخصة</CardTitle>
                                <CardDescription className="text-xs">المعلومات الأساسية ومفاتيح التفعيل</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium">اسم البرنامج/الرخصة <span className="text-red-500">*</span></Label>
                            <Input
                                id="name"
                                name="name"
                                required
                                placeholder="مثال: Microsoft Office 365"
                                className="h-11 bg-slate-950/50 border-slate-800 focus:border-blue-500/50 focus:ring-blue-500/20"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="type" className="text-sm font-medium">نوع الرخصة</Label>
                            <Select name="type" defaultValue="SUBSCRIPTION">
                                <SelectTrigger className="h-11 bg-slate-950/50 border-slate-800 focus:border-blue-500/50 focus:ring-blue-500/20">
                                    <SelectValue placeholder="اختر النوع" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SUBSCRIPTION">اشتراك (سنوي/شهري)</SelectItem>
                                    <SelectItem value="PERPETUAL">دائم (مدى الحياة)</SelectItem>
                                    <SelectItem value="FREE">مجاني / مفتوح المصدر</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="key" className="text-sm font-medium">مفتاح التفعيل (License Key)</Label>
                            <div dir="ltr">
                                <Input
                                    id="key"
                                    name="key"
                                    placeholder="XXXX-XXXX-XXXX-XXXX"
                                    className="h-11 font-mono text-left bg-slate-950/50 border-slate-800 focus:border-blue-500/50 focus:ring-blue-500/20"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="seats" className="text-sm font-medium">عدد المقاعد (Users/Devices)</Label>
                            <div dir="ltr">
                                <Input
                                    id="seats"
                                    name="seats"
                                    type="number"
                                    min="1"
                                    defaultValue="1"
                                    className="h-11 text-left bg-slate-950/50 border-slate-800 focus:border-blue-500/50 focus:ring-blue-500/20"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Validity & Cost Card */}
                <div className="flex flex-col gap-6">
                    <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm shadow-xl">
                        <CardHeader className="border-b border-white/5 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-purple-500/10">
                                    <Calendar className="h-5 w-5 text-purple-500" />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-base">الصلاحية والتكلفة</CardTitle>
                                    <CardDescription className="text-xs">تواريخ البدء والانتهاء والقيمة المالية</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="purchaseDate" className="text-sm font-medium">تاريخ الشراء/البدء</Label>
                                    <Input
                                        id="purchaseDate"
                                        name="purchaseDate"
                                        type="date"
                                        className="h-11 bg-slate-950/50 border-slate-800 focus:border-purple-500/50 focus:ring-purple-500/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="expiryDate" className="text-sm font-medium">تاريخ الانتهاء</Label>
                                    <Input
                                        id="expiryDate"
                                        name="expiryDate"
                                        type="date"
                                        className="h-11 bg-slate-950/50 border-slate-800 focus:border-purple-500/50 focus:ring-purple-500/20"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="cost" className="text-sm font-medium">التكلفة (ر.س)</Label>
                                <div className="relative">
                                    <Input
                                        id="cost"
                                        name="cost"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        className="h-11 pl-10 bg-slate-950/50 border-slate-800 focus:border-purple-500/50 focus:ring-purple-500/20"
                                    />
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm shadow-xl flex-1">
                        <CardHeader className="border-b border-white/5 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-emerald-500/10">
                                    <FileText className="h-5 w-5 text-emerald-500" />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-base">ملاحظات</CardTitle>
                                    <CardDescription className="text-xs">معلومات إضافية عن الرخصة</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <Textarea
                                id="notes"
                                name="notes"
                                placeholder="أي تفاصيل إضافية..."
                                className="min-h-[100px] bg-slate-950/50 border-slate-800 focus:border-emerald-500/50 focus:ring-emerald-500/20 resize-none"
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                <Button type="button" variant="ghost" size="lg" className="min-w-[120px] h-12 hover:bg-white/5" onClick={() => router.back()}>
                    <X className="mr-2 h-4 w-4" />
                    إلغاء
                </Button>
                <Button type="submit" disabled={loading} size="lg" className="min-w-[150px] gap-2 h-12 bg-blue-600 hover:bg-blue-700">
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                    حفظ الرخصة
                </Button>
            </div>
        </form>
    )
}
