'use client'

export const dynamic = 'force-dynamic';

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PremiumPageHeader } from '@/components/ui/premium-page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Loader2, Minus, Plus, ArrowRight } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import { createEmployeeRequest } from '@/app/actions/employee-portal'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'

const PAPER_TYPES = [
    { id: 'A4-80g', name: 'ورق A4 - 80 جرام', desc: 'الورق القياسي للطباعة اليومية', unit: 'رزمة (500 ورقة)' },
    { id: 'A4-70g', name: 'ورق A4 - 70 جرام', desc: 'ورق خفيف للاستخدام الاقتصادي', unit: 'رزمة (500 ورقة)' },
    { id: 'A3-80g', name: 'ورق A3 - 80 جرام', desc: 'ورق كبير للمخططات والجداول', unit: 'رزمة (500 ورقة)' },
    { id: 'A4-Color', name: 'ورق ملون A4', desc: 'مجموعة ألوان متنوعة للفواصل', unit: 'رزمة (100 ورقة)' },
    { id: 'A4-Carton', name: 'كرتون ورق A4', desc: 'كرتون كامل يحتوي على 5 روزم (2500 ورقة)', unit: 'كرتون (5 روزم)' },
    { id: 'Glossy', name: 'ورق فاخر (Glossy)', desc: 'للطباعة عالية الجودة والصور', unit: 'رزمة (50 ورقة)' },
    { id: 'other', name: 'نوع آخر', desc: 'تحديد نوع خاص', unit: '-' },
]

export default function PaperRequestPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [selectedPaper, setSelectedPaper] = useState('')
    const [customPaper, setCustomPaper] = useState('')
    const [quantity, setQuantity] = useState(1)
    const [notes, setNotes] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (!selectedPaper) {
            toast({ title: 'تنبيه', description: 'يرجى اختيار نوع الورق', variant: 'destructive' })
            return
        }
        if (selectedPaper === 'other' && !customPaper.trim()) {
            toast({ title: 'تنبيه', description: 'يرجى تحديد النوع المطلوب', variant: 'destructive' })
            return
        }

        setLoading(true)
        try {
            const paperName = selectedPaper === 'other' ? customPaper : PAPER_TYPES.find(p => p.id === selectedPaper)?.name
            const details = `طلب ورق طباعة\nالنوع: ${paperName}\nالكمية: ${quantity}\nملاحظات: ${notes}`

            const result = await createEmployeeRequest('HARDWARE', details, `طلب ورق: ${paperName}`)

            if (result?.success) {
                toast({ title: 'تم تقديم الطلب', description: 'جاري العمل على تجهيز طلبك' })
                router.push('/portal/requests')
            } else {
                toast({ title: 'خطأ', description: result?.error || 'فشل في الطلب', variant: 'destructive' })
            }
        } catch (error) {
            toast({ title: 'خطأ', description: 'حدث خطأ غير متوقع', variant: 'destructive' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <PremiumPageHeader
                title="طلب أوراق طباعة"
                description="حدد نوع الورق والكمية المطلوبة لاحتياجات القسم"
                icon={FileText}
                rightContent={
                    <Link href="/portal/dashboard">
                        <Button variant="ghost" className="gap-2 text-white hover:bg-white/20">
                            <ArrowRight className="h-4 w-4" />
                            العودة للرئيسية
                        </Button>
                    </Link>
                }
            />

            <div className="grid gap-8 md:grid-cols-[1fr_350px]">
                {/* Types Grid */}
                <div className="grid gap-4">
                    {PAPER_TYPES.map((paper) => (
                        <div
                            key={paper.id}
                            onClick={() => setSelectedPaper(paper.id)}
                            className={`
                                    cursor-pointer p-5 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between
                                    ${selectedPaper === paper.id
                                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-500'
                                    : 'border-transparent bg-white dark:bg-slate-800 hover:border-amber-200 dark:hover:border-amber-800'
                                }
                                    shadow-sm hover:shadow-md
                                `}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`
                                        w-12 h-12 rounded-full flex items-center justify-center
                                        ${selectedPaper === paper.id ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400'}
                                    `}>
                                    <FileText className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{paper.name}</h3>
                                    <p className="text-sm text-muted-foreground">{paper.desc}</p>
                                </div>
                            </div>
                            <span className="text-xs font-mono bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded text-slate-500">
                                {paper.unit}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Order Details Panel */}
                <div className="space-y-6">
                    <Card className="border-0 shadow-lg sticky top-8">
                        <CardContent className="p-6 space-y-6">
                            <h3 className="font-bold text-xl border-b pb-4">تفاصيل الطلب</h3>

                            {selectedPaper === 'other' && (
                                <div className="space-y-2">
                                    <Label>تحديد النوع</Label>
                                    <Input
                                        placeholder="اكتب النوع المطلوب..."
                                        value={customPaper}
                                        onChange={(e) => setCustomPaper(e.target.value)}
                                    />
                                </div>
                            )}

                            <div className="space-y-3">
                                <Label>الكمية (بالرزمة)</Label>
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="outline" size="icon"
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="h-10 w-10 border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-300"
                                    >
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <div className="flex-1 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-md border text-lg font-bold">
                                        {quantity}
                                    </div>
                                    <Button
                                        variant="outline" size="icon"
                                        onClick={() => setQuantity(Math.min(20, quantity + 1))}
                                        className="h-10 w-10 border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-300"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>ملاحظات</Label>
                                <Textarea
                                    placeholder="أي تعليمات إضافية..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={3}
                                />
                            </div>

                            <Button
                                onClick={handleSubmit}
                                disabled={loading || !selectedPaper}
                                className="w-full bg-amber-500 hover:bg-amber-600 text-white h-12 text-lg shadow-lg shadow-amber-500/20"
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'تأكيد الطلب'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
