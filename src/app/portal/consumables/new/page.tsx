'use client'

export const dynamic = 'force-dynamic';

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Printer, FileText, ArrowRight, Package, Plus, Minus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { createEmployeeRequest } from '@/app/actions/employee-portal'
import { PremiumPageHeader } from '@/components/ui/premium-page-header'

// Sample data - replace with actual data from database
const PRINTER_MODELS = [
    { id: '1', name: 'HP LaserJet Pro M404dn', inkTypes: ['HP 58A Black', 'HP 30X Black'] },
    { id: '2', name: 'Canon imageCLASS MF445dw', inkTypes: ['Canon 052 Black', 'Canon 052 Cyan', 'Canon 052 Magenta', 'Canon 052 Yellow'] },
    { id: '3', name: 'Epson EcoTank L3250', inkTypes: ['Epson 003 Black', 'Epson 003 Cyan', 'Epson 003 Magenta', 'Epson 003 Yellow'] },
    { id: '4', name: 'Brother MFC-L2750DW', inkTypes: ['Brother TN-2420 Black'] },
    { id: '5', name: 'Xerox WorkCentre 3335', inkTypes: ['Xerox 106R03621 Black'] },
]

const PAPER_TYPES = [
    { id: '1', name: 'ورق A4 - 80 جرام', unit: 'رزمة (500 ورقة)' },
    { id: '2', name: 'ورق A4 - 70 جرام', unit: 'رزمة (500 ورقة)' },
    { id: '3', name: 'ورق A3 - 80 جرام', unit: 'رزمة (500 ورقة)' },
    { id: '4', name: 'ورق ملون A4', unit: 'رزمة (100 ورقة)' },
    { id: '5', name: 'ورق فاخر A4', unit: 'رزمة (250 ورقة)' },
]

export default function ConsumablesRequestPage() {
    const router = useRouter()
    const [type, setType] = useState<'INK' | 'PAPER' | null>(null)
    const [selectedPrinter, setSelectedPrinter] = useState('')
    const [selectedInk, setSelectedInk] = useState('')
    const [selectedPaper, setSelectedPaper] = useState('')
    const [customInkText, setCustomInkText] = useState('')
    const [customPaperText, setCustomPaperText] = useState('')
    const [quantity, setQuantity] = useState(1)
    const [notes, setNotes] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const printerModel = PRINTER_MODELS.find(p => p.id === selectedPrinter)

    async function handleSubmit() {
        if (!type) {
            toast.error('الرجاء تحديد نوع الطلب')
            return
        }

        if (type === 'INK') {
            if (!selectedPrinter || !selectedInk) {
                toast.error('الرجاء تحديد الطابعة ونوع الحبر')
                return
            }
            if (selectedInk === 'other' && !customInkText.trim()) {
                toast.error('الرجاء كتابة نوع الحبر المطلوب')
                return
            }
        }

        if (type === 'PAPER') {
            if (!selectedPaper) {
                toast.error('الرجاء تحديد نوع الورق')
                return
            }
            if (selectedPaper === 'other' && !customPaperText.trim()) {
                toast.error('الرجاء كتابة نوع الورق المطلوب')
                return
            }
        }

        if (quantity < 1) {
            toast.error('الرجاء تحديد الكمية')
            return
        }

        setSubmitting(true)

        let details = ''
        if (type === 'INK') {
            const inkName = selectedInk === 'other' ? customInkText : selectedInk
            details = `طلب حبر: ${inkName}\nللطابعة: ${printerModel?.name}\nالكمية: ${quantity}\nملاحظات: ${notes || 'لا توجد'}`
        } else {
            const paperName = selectedPaper === 'other' ? customPaperText : PAPER_TYPES.find(p => p.id === selectedPaper)?.name
            details = `طلب ورق: ${paperName}\nالكمية: ${quantity}\nملاحظات: ${notes || 'لا توجد'}`
        }

        const result = await createEmployeeRequest(type, details)

        if (result?.success) {
            toast.success('تم إرسال الطلب بنجاح')
            router.push('/portal/dashboard')
        } else {
            toast.error(result?.error || 'فشل في إرسال الطلب')
        }

        setSubmitting(false)
    }

    function incrementQuantity() {
        setQuantity(prev => Math.min(prev + 1, 50))
    }

    function decrementQuantity() {
        setQuantity(prev => Math.max(prev - 1, 1))
    }

    function resetForm() {
        setType(null)
        setSelectedPrinter('')
        setSelectedInk('')
        setSelectedPaper('')
        setCustomInkText('')
        setCustomPaperText('')
        setQuantity(1)
        setNotes('')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" dir="rtl">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <PremiumPageHeader
                    title="طلب أحبار وأوراق"
                    description="اختر نوع الطلب وحدد التفاصيل المطلوبة"
                    icon={Package}
                    rightContent={
                        <Button
                            variant="ghost"
                            onClick={() => router.back()}
                            className="gap-2 text-white hover:bg-white/20"
                        >
                            <ArrowRight className="h-4 w-4" />
                            العودة
                        </Button>
                    }
                />

                {/* Type Selection */}
                {!type ? (
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card
                            className="cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 hover:border-blue-500 group overflow-hidden dark:bg-slate-800 dark:border-slate-700"
                            onClick={() => setType('INK')}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <CardContent className="p-8 text-center relative">
                                <div className="bg-blue-100 mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <Printer className="h-12 w-12 text-blue-600" />
                                </div>
                                <h2 className="text-2xl font-bold mb-3 text-foreground dark:text-gray-100">أحبار طابعات</h2>
                                <p className="text-gray-600 mb-4 dark:text-muted-foreground">طلب خراطيش حبر لطابعة أو آلة تصوير</p>
                                <Button className="w-full bg-blue-600 hover:bg-blue-700 shadow-md">
                                    اختيار
                                    <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
                                </Button>
                            </CardContent>
                        </Card>

                        <Card
                            className="cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 hover:border-green-500 group overflow-hidden dark:bg-slate-800 dark:border-slate-700"
                            onClick={() => setType('PAPER')}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <CardContent className="p-8 text-center relative">
                                <div className="bg-green-100 mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <FileText className="h-12 w-12 text-green-600" />
                                </div>
                                <h2 className="text-2xl font-bold mb-3 text-foreground dark:text-gray-100">أوراق طباعة</h2>
                                <p className="text-gray-600 mb-4 dark:text-muted-foreground">طلب أوراق طباعة بأحجام وأنواع مختلفة</p>
                                <Button className="w-full bg-green-600 hover:bg-green-700 shadow-md">
                                    اختيار
                                    <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <div className="w-full">
                        <Card className="border-2 shadow-xl dark:bg-slate-800 dark:border-slate-700">
                            <div className={`p-6 ${type === 'INK' ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-gradient-to-r from-green-600 to-emerald-600'} text-white`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {type === 'INK' ? <Printer className="h-8 w-8" /> : <FileText className="h-8 w-8" />}
                                        <div>
                                            <h2 className="text-2xl font-bold">
                                                {type === 'INK' ? 'طلب أحبار طابعات' : 'طلب أوراق طباعة'}
                                            </h2>
                                            <p className="text-white/90 text-sm">املأ التفاصيل المطلوبة أدناه</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={resetForm}
                                        className="text-white hover:bg-white/20"
                                    >
                                        تغيير النوع
                                    </Button>
                                </div>
                            </div>

                            <CardContent className="p-8 space-y-6">
                                {type === 'INK' ? (
                                    <>
                                        {/* Printer Selection */}
                                        <div className="space-y-3">
                                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                <Printer className="h-4 w-4 text-blue-600" />
                                                نوع الطابعة أو آلة التصوير
                                            </label>
                                            <Select value={selectedPrinter} onValueChange={(val) => {
                                                setSelectedPrinter(val)
                                                setSelectedInk('')
                                                setCustomInkText('')
                                            }}>
                                                <SelectTrigger className="h-12 text-base border-2 hover:border-blue-500 transition-colors dark:bg-slate-900 dark:border-slate-700 dark:text-gray-100">
                                                    <SelectValue placeholder="اختر الطابعة..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {PRINTER_MODELS.map((printer) => (
                                                        <SelectItem key={printer.id} value={printer.id}>
                                                            {printer.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Ink Selection */}
                                        {selectedPrinter && (
                                            <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                    <Package className="h-4 w-4 text-indigo-600" />
                                                    نوع الحبر
                                                </label>
                                                <Select value={selectedInk} onValueChange={(val) => {
                                                    setSelectedInk(val)
                                                    if (val !== 'other') setCustomInkText('')
                                                }}>
                                                    <SelectTrigger className="h-12 text-base border-2 hover:border-indigo-500 transition-colors dark:bg-slate-900 dark:border-slate-700 dark:text-gray-100">
                                                        <SelectValue placeholder="اختر نوع الحبر..." />
                                                    </SelectTrigger>
                                                    <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                                                        {printerModel?.inkTypes.map((ink, index) => (
                                                            <SelectItem key={index} value={ink}>
                                                                {ink}
                                                            </SelectItem>
                                                        ))}
                                                        <SelectItem value="other" className="font-semibold text-indigo-600">
                                                            أخرى (حدد نوع آخر)
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>

                                                {/* Custom Ink Input */}
                                                {selectedInk === 'other' && (
                                                    <div className="animate-in slide-in-from-top-2 duration-300">
                                                        <Input
                                                            value={customInkText}
                                                            onChange={(e) => setCustomInkText(e.target.value)}
                                                            placeholder="اكتب نوع الحبر المطلوب..."
                                                            className="h-12 text-base border-2 border-indigo-300 focus:border-indigo-500 dark:bg-slate-900 dark:border-slate-700 dark:text-gray-100"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {/* Paper Selection */}
                                        <div className="space-y-3">
                                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                نوع الورق
                                            </label>
                                            <Select value={selectedPaper} onValueChange={(val) => {
                                                setSelectedPaper(val)
                                                if (val !== 'other') setCustomPaperText('')
                                            }}>
                                                <SelectTrigger className="h-12 text-base border-2 hover:border-green-500 transition-colors dark:bg-slate-900 dark:border-slate-700 dark:text-gray-100">
                                                    <SelectValue placeholder="اختر نوع الورق..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {PAPER_TYPES.map((paper) => (
                                                        <SelectItem key={paper.id} value={paper.id}>
                                                            <div className="flex items-center justify-between w-full">
                                                                <span>{paper.name}</span>
                                                                <span className="text-xs text-muted-foreground mr-2">({paper.unit})</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                    <SelectItem value="other" className="font-semibold text-green-600">
                                                        أخرى (حدد نوع آخر)
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>

                                            {/* Custom Paper Input */}
                                            {selectedPaper === 'other' && (
                                                <div className="animate-in slide-in-from-top-2 duration-300">
                                                    <Input
                                                        value={customPaperText}
                                                        onChange={(e) => setCustomPaperText(e.target.value)}
                                                        placeholder="اكتب نوع الورق المطلوب..."
                                                        className="h-12 text-base border-2 border-green-300 focus:border-green-500 dark:bg-slate-900 dark:border-slate-700 dark:text-gray-100"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}

                                {/* Quantity */}
                                {((type === 'INK' && selectedInk) || (type === 'PAPER' && selectedPaper)) && (
                                    <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            الكمية المطلوبة
                                        </label>
                                        <div className="flex items-center gap-4">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={decrementQuantity}
                                                className="h-12 w-12 rounded-full border-2 hover:bg-red-50 hover:border-red-500 hover:text-red-600 dark:bg-slate-800 dark:border-slate-600 dark:text-gray-300"
                                            >
                                                <Minus className="h-5 w-5" />
                                            </Button>
                                            <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg border-2 py-3 dark:bg-slate-900 dark:border-slate-700">
                                                <span className="text-3xl font-bold text-foreground dark:text-gray-100">{quantity}</span>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={incrementQuantity}
                                                className="h-12 w-12 rounded-full border-2 hover:bg-green-50 hover:border-green-500 hover:text-green-600 dark:bg-slate-800 dark:border-slate-600 dark:text-gray-300"
                                            >
                                                <Plus className="h-5 w-5" />
                                            </Button>
                                        </div>
                                        <p className="text-xs text-muted-foreground text-center">
                                            الحد الأقصى: 50 {type === 'INK' ? 'خرطوشة' : 'رزمة'}
                                        </p>
                                    </div>
                                )}

                                {/* Notes */}
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        ملاحظات إضافية (اختياري)
                                    </label>
                                    <Textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="أضف أي ملاحظات أو تفاصيل إضافية..."
                                        rows={4}
                                        className="resize-none border-2 focus:border-blue-500 dark:bg-slate-900 dark:border-slate-700 dark:text-gray-100"
                                    />
                                </div>

                                {/* Submit Button */}
                                <Button
                                    onClick={handleSubmit}
                                    disabled={submitting || (type === 'INK' ? (!selectedInk || !selectedPrinter || (selectedInk === 'other' && !customInkText.trim())) : (!selectedPaper || (selectedPaper === 'other' && !customPaperText.trim())))}
                                    className={`w-full h-14 text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 ${type === 'INK'
                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                                        : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                                        }`}
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                                            جاري الإرسال...
                                        </>
                                    ) : (
                                        <>
                                            إرسال الطلب
                                            <ArrowRight className="mr-2 h-5 w-5 rotate-180" />
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    )
}
