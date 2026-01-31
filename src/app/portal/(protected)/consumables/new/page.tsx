'use client'


import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Printer, FileText, ArrowRight, Package, Plus, Minus, Loader2, CheckCircle, Box } from 'lucide-react'
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
    {
        id: '1',
        brand: 'Epson',
        name: 'EcoTank L3150',
        modelAlias: 'L3150',
        inkTypes: [
            { name: 'Epson 103 Black', code: 'C13T00S14A', color: 'black' },
            { name: 'Epson 103 Cyan', code: 'C13T00S24A', color: 'cyan' },
            { name: 'Epson 103 Magenta', code: 'C13T00S34A', color: 'magenta' },
            { name: 'Epson 103 Yellow', code: 'C13T00S44A', color: 'yellow' },
        ]
    },
    {
        id: '2',
        brand: 'Canon',
        name: 'imageCLASS MF445dw',
        modelAlias: 'MF445dw',
        inkTypes: [
            { name: 'Canon 052 Black', code: '2199C001', color: 'black' },
            { name: 'Canon 052 Cyan', code: '2199C002', color: 'cyan' },
            { name: 'Canon 052 Magenta', code: '2199C003', color: 'magenta' },
            { name: 'Canon 052 Yellow', code: '2199C004', color: 'yellow' },
        ]
    },
    {
        id: '3',
        brand: 'HP',
        name: 'LaserJet Pro M404dn',
        modelAlias: 'M404dn',
        inkTypes: [
            { name: 'HP 58A Black', code: 'CF258A', color: 'black' },
            { name: 'HP 58X High Yield', code: 'CF258X', color: 'black' },
        ]
    },
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
    const [selectedBrand, setSelectedBrand] = useState('')
    const [selectedPrinter, setSelectedPrinter] = useState('')
    const [selectedInks, setSelectedInks] = useState<string[]>([])
    const [selectedPaper, setSelectedPaper] = useState('')
    const [customInkText, setCustomInkText] = useState('')
    const [customPaperText, setCustomPaperText] = useState('')
    const [quantity, setQuantity] = useState(1)
    const [notes, setNotes] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [showCustomInk, setShowCustomInk] = useState(false)

    const brands = Array.from(new Set(PRINTER_MODELS.map(p => p.brand)))
    const filteredModels = PRINTER_MODELS.filter(p => p.brand === selectedBrand)
    const printerModel = PRINTER_MODELS.find(p => p.id === selectedPrinter)

    async function handleSubmit() {
        if (!type) {
            toast.error('الرجاء تحديد نوع الطلب')
            return
        }

        if (type === 'INK') {
            if (!selectedPrinter || (selectedInks.length === 0 && !customInkText.trim())) {
                toast.error('الرجاء تحديد الطابعة ونوع الحبر')
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
        let dataPayload = []

        if (type === 'INK') {
            const inkNames = [...selectedInks]
            if (customInkText.trim()) inkNames.push(customInkText)

            const inkSummaries = inkNames.map(ink => `${ink} (الكمية: ${quantity})`).join(', ')
            details = `طلب أحبار متعددة: ${inkSummaries}\nللطابعة: ${printerModel?.name}\n<!-- USER_NOTES_START -->\n${notes || 'لا توجد'}`

            inkNames.forEach(ink => {
                dataPayload.push({ itemName: ink, modelName: printerModel?.name, quantity })
            })
        } else {
            const paperName = selectedPaper === 'other' ? customPaperText : PAPER_TYPES.find(p => p.id === selectedPaper)?.name
            details = `طلب ورق: ${paperName}\nالكمية: ${quantity}\n<!-- USER_NOTES_START -->\n${notes || 'لا توجد'}`
            dataPayload.push({ itemName: paperName, quantity })
        }

        // Add hidden data for backend stock checking
        details += `\n<!-- DATA: ${JSON.stringify(dataPayload)} -->`

        const result = await createEmployeeRequest(type, details)

        if (result?.success) {
            toast.success('تم إرسال الطلب بنجاح')
            router.push('/portal/dashboard')
        } else {
            toast.error(result?.error || 'فشل في إرسال الطلب')
        }

        setSubmitting(false)
    }

    function toggleInkSelection(ink: string) {
        setSelectedInks(prev =>
            prev.includes(ink) ? prev.filter(i => i !== ink) : [...prev, ink]
        )
    }

    function selectAllInks() {
        if (!printerModel) return
        const allInks = printerModel.inkTypes.map(i => i.name)
        // If all are already selected, deselect all. Otherwise select all.
        if (selectedInks.length === allInks.length) {
            setSelectedInks([])
        } else {
            setSelectedInks(allInks)
        }
    }

    function incrementQuantity() {
        setQuantity(prev => Math.min(prev + 1, 50))
    }

    function decrementQuantity() {
        setQuantity(prev => Math.max(prev - 1, 1))
    }

    function resetForm() {
        setType(null)
        setSelectedBrand('')
        setSelectedPrinter('')
        setSelectedInks([])
        setSelectedPaper('')
        setCustomInkText('')
        setCustomPaperText('')
        setQuantity(1)
        setNotes('')
    }

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 font-arabic" dir="rtl">
            <div className="container mx-auto px-4 py-8 max-w-5xl">
                {/* Header */}
                <PremiumPageHeader
                    title="طلب أحبار وأوراق"
                    description="اختر نوع الطلب وحدد التفاصيل المطلوبة"
                    icon={Package}
                    rightContent={
                        <Button
                            variant="ghost"
                            onClick={() => router.back()}
                            className="gap-2 text-white hover:bg-white/10 rounded-xl"
                        >
                            <ArrowRight className="h-4 w-4" />
                            العودة
                        </Button>
                    }
                />

                {/* Type Selection */}
                {!type ? (
                    <div className="grid md:grid-cols-2 gap-8 mt-12">
                        <Card
                            className="cursor-pointer hover:shadow-[0_0_50px_rgba(37,99,235,0.15)] transition-all duration-500 border-2 border-slate-800 bg-[#1e293b]/50 hover:border-blue-500/50 group overflow-hidden relative rounded-[2rem]"
                            onClick={() => setType('INK')}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <CardContent className="p-10 text-center relative">
                                <div className="bg-blue-600/20 mx-auto w-24 h-24 rounded-[2rem] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-xl border border-blue-500/20">
                                    <Printer className="h-12 w-12 text-blue-400" />
                                </div>
                                <h2 className="text-3xl font-black mb-3 text-white">أحبار طابعات</h2>
                                <p className="text-slate-400 mb-6 font-medium">طلب خراطيش حبر لطابعة أو آلة تصوير</p>
                                <Button className="w-full bg-blue-600 hover:bg-blue-700 h-14 rounded-2xl shadow-lg text-lg font-black">
                                    اختيار
                                </Button>
                            </CardContent>
                        </Card>

                        <Card
                            className="cursor-pointer hover:shadow-[0_0_50px_rgba(16,185,129,0.15)] transition-all duration-500 border-2 border-slate-800 bg-[#1e293b]/50 hover:border-emerald-500/50 group overflow-hidden relative rounded-[2rem]"
                            onClick={() => setType('PAPER')}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <CardContent className="p-10 text-center relative">
                                <div className="bg-emerald-600/20 mx-auto w-24 h-24 rounded-[2rem] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 shadow-xl border border-emerald-500/20">
                                    <FileText className="h-12 w-12 text-emerald-400" />
                                </div>
                                <h2 className="text-3xl font-black mb-3 text-white">أوراق طباعة</h2>
                                <p className="text-slate-400 mb-6 font-medium">طلب أوراق طباعة بأحجام وأنواع مختلفة</p>
                                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 h-14 rounded-2xl shadow-lg text-lg font-black">
                                    اختيار
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <div className="w-full mt-8 animate-in fade-in zoom-in-95 duration-500">
                        <Card className="border-2 border-slate-800 shadow-2xl bg-[#1e293b] rounded-[2.5rem] overflow-hidden">
                            <div className={`p-8 ${type === 'INK' ? 'bg-gradient-to-r from-blue-900 to-indigo-900 border-b border-white/5' : 'bg-gradient-to-r from-emerald-900 to-teal-900 border-b border-white/5'} text-white`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                                            {type === 'INK' ? <Printer className="h-8 w-8 text-blue-300" /> : <FileText className="h-8 w-8 text-emerald-300" />}
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black">
                                                {type === 'INK' ? 'طلب أحبار طابعات' : 'طلب أوراق طباعة'}
                                            </h2>
                                            <p className="text-white/60 text-sm font-medium">املأ التفاصيل المطلوبة أدناه</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={resetForm}
                                        className="text-white hover:bg-white/10 rounded-xl px-4 py-2 h-auto text-xs font-black"
                                    >
                                        تغيير النوع
                                    </Button>
                                </div>
                            </div>

                            <CardContent className="p-10 space-y-8">
                                {type === 'INK' ? (
                                    <>
                                        {/* Printer/Copier Toggle */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <Card
                                                className={`cursor-pointer transition-all duration-300 border-2 group relative overflow-hidden rounded-2xl ${selectedPrinter ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10' : 'border-slate-800 bg-slate-900/50'}`}
                                            >
                                                <CardContent className="p-6 text-center">
                                                    <div className={`mx-auto w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors ${selectedPrinter ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'}`}>
                                                        <Printer className="h-6 w-6" />
                                                    </div>
                                                    <h3 className={`font-black text-sm ${selectedPrinter ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>طابعة (Printer)</h3>
                                                    <p className="text-[10px] text-slate-500 mt-1 font-bold">طابعات مكتبية صغيرة ومتوسطة</p>
                                                </CardContent>
                                            </Card>
                                            <Card
                                                className="cursor-pointer border-2 border-slate-800 bg-slate-900/50 opacity-40 hover:opacity-60 transition-all group rounded-2xl"
                                            >
                                                <CardContent className="p-6 text-center">
                                                    <div className="mx-auto w-12 h-12 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center mb-3">
                                                        <Box className="h-6 w-6" />
                                                    </div>
                                                    <h3 className="font-black text-sm text-slate-400">آلة تصوير (Copier)</h3>
                                                    <p className="text-[10px] text-slate-500 mt-1 font-bold">آلات تصوير مركزية (Ricoh, Xerox...)</p>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6 pt-4">
                                            {/* Brand Selection */}
                                            <div className="space-y-3">
                                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                    1. ماركة الجهاز (Brand)
                                                </label>
                                                <Select value={selectedBrand} onValueChange={(val) => {
                                                    setSelectedBrand(val)
                                                    setSelectedPrinter('')
                                                    setSelectedInks([])
                                                }}>
                                                    <SelectTrigger className="h-16 text-base border-2 border-slate-800 bg-slate-900/80 hover:border-blue-500/50 transition-all text-white rounded-2xl shadow-xl font-black">
                                                        <SelectValue placeholder="اختر الماركة..." />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-[#1e293b] border-slate-700 text-slate-100 font-bold rounded-2xl overflow-hidden">
                                                        {brands.map((brand) => (
                                                            <SelectItem key={brand} value={brand} className="h-12 focus:bg-blue-600 focus:text-white transition-colors">
                                                                {brand}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Model Selection */}
                                            <div className="space-y-3">
                                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                    2. موديل الجهاز (Model)
                                                </label>
                                                <Select
                                                    value={selectedPrinter}
                                                    onValueChange={(val) => {
                                                        setSelectedPrinter(val)
                                                        setSelectedInks([])
                                                    }}
                                                    disabled={!selectedBrand}
                                                >
                                                    <SelectTrigger className="h-16 text-base border-2 border-slate-800 bg-slate-900/80 hover:border-blue-500/50 disabled:opacity-30 disabled:hover:border-slate-800 transition-all text-white rounded-2xl shadow-xl font-black">
                                                        <SelectValue placeholder="اختر الموديل..." />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-[#1e293b] border-slate-700 text-slate-100 font-bold rounded-2xl overflow-hidden">
                                                        {filteredModels.map((model) => (
                                                            <SelectItem key={model.id} value={model.id} className="h-14 focus:bg-blue-600 focus:text-white transition-colors">
                                                                <div className="flex items-center justify-between w-full gap-4">
                                                                    <span>{model.name}</span>
                                                                    <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-slate-400">({model.modelAlias})</span>
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        {/* Ink Selection Grid */}
                                        {selectedPrinter && (
                                            <div className="space-y-6 animate-in slide-in-from-top-4 duration-500 pt-4 border-t border-slate-800">
                                                <div className="flex items-center justify-between px-2">
                                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                                                        3. الأحبار المتوافقة (Select Ink)
                                                    </label>
                                                    {printerModel && printerModel.inkTypes.length > 1 && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                selectAllInks();
                                                            }}
                                                            className="text-[10px] font-black text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg px-3"
                                                        >
                                                            {selectedInks.length === printerModel.inkTypes.length ? 'إلغاء الكل ✕' : 'اختيار كافة الألوان ✨'}
                                                        </Button>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 gap-3">
                                                    {printerModel?.inkTypes.map((ink, index) => {
                                                        const isSelected = selectedInks.includes(ink.name)
                                                        const colorMap: Record<string, string> = {
                                                            cyan: 'bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]',
                                                            magenta: 'bg-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.4)]',
                                                            yellow: 'bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.4)]',
                                                            black: 'bg-slate-900 ring-2 ring-slate-700 shadow-[0_0_15px_rgba(0,0,0,0.5)]'
                                                        }

                                                        return (
                                                            <div
                                                                key={index}
                                                                onClick={() => toggleInkSelection(ink.name)}
                                                                className={`cursor-pointer group relative p-6 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between ${isSelected
                                                                    ? 'border-blue-500 bg-blue-500/10 shadow-2xl shadow-blue-500/10'
                                                                    : 'border-slate-800 bg-slate-900/30 hover:border-slate-700 hover:bg-slate-900/50'
                                                                    }`}
                                                            >
                                                                <div className="flex items-center gap-5">
                                                                    <div className={`h-4 w-4 rounded-full ${colorMap[ink.color] || 'bg-slate-500'}`} />
                                                                    <div className="text-right">
                                                                        <p className={`font-black text-base ${isSelected ? 'text-white' : 'text-slate-300'}`}>{ink.name}</p>
                                                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{ink.code}</p>
                                                                    </div>
                                                                </div>
                                                                {isSelected && (
                                                                    <div className="bg-blue-600 text-white rounded-full p-1.5 border-4 border-[#1e293b] shadow-xl animate-in zoom-in-50 duration-300">
                                                                        <CheckCircle className="h-4 w-4" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )
                                                    })}

                                                    <div
                                                        onClick={() => setShowCustomInk(!showCustomInk)}
                                                        className={`cursor-pointer p-6 rounded-2xl border-2 border-dashed transition-all duration-300 flex items-center justify-center gap-3 mt-2 ${showCustomInk ? 'border-amber-500 bg-amber-500/10' : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'}`}
                                                    >
                                                        <Plus className={`h-5 w-5 ${showCustomInk ? 'text-amber-500' : 'text-slate-500'}`} />
                                                        <span className={`text-sm font-black ${showCustomInk ? 'text-amber-500' : 'text-slate-500'}`}>حبر آخر / غير موجود بالقائمة</span>
                                                    </div>
                                                </div>

                                                {showCustomInk && (
                                                    <div className="animate-in slide-in-from-top-4 fade-in duration-500 pt-2">
                                                        <Input
                                                            value={customInkText}
                                                            onChange={(e) => setCustomInkText(e.target.value)}
                                                            placeholder="اكتب نوع الحبر المطلوب هنا..."
                                                            className="h-16 bg-slate-900 border-2 border-slate-800 focus:border-amber-500 rounded-2xl text-slate-100 font-black text-center shadow-inner"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {/* Paper Selection */}
                                        <div className="space-y-4">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                نوع الورق المطلوب
                                            </label>
                                            <Select value={selectedPaper} onValueChange={(val) => {
                                                setSelectedPaper(val)
                                                if (val !== 'other') setCustomPaperText('')
                                            }}>
                                                <SelectTrigger className="h-16 text-base border-2 border-slate-800 bg-slate-900/80 hover:border-emerald-500/50 transition-all text-white rounded-2xl shadow-xl font-black">
                                                    <SelectValue placeholder="اختر نوع الورق..." />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#1e293b] border-slate-700 text-slate-100 font-bold rounded-2xl overflow-hidden">
                                                    {PAPER_TYPES.map((paper) => (
                                                        <SelectItem key={paper.id} value={paper.id} className="h-14 focus:bg-emerald-600 focus:text-white transition-colors">
                                                            <div className="flex items-center justify-between w-full gap-4">
                                                                <span>{paper.name}</span>
                                                                <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-slate-400">({paper.unit})</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                    <SelectItem value="other" className="h-14 font-black text-emerald-400 focus:bg-emerald-600 focus:text-white">
                                                        أخرى (حدد نوع آخر)
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>

                                            {selectedPaper === 'other' && (
                                                <div className="animate-in slide-in-from-top-4 fade-in duration-500 pt-2">
                                                    <Input
                                                        value={customPaperText}
                                                        onChange={(e) => setCustomPaperText(e.target.value)}
                                                        placeholder="اكتب نوع الورق المطلوب هنا..."
                                                        className="h-16 bg-slate-900 border-2 border-slate-800 focus:border-emerald-500 rounded-2xl text-slate-100 font-black text-center shadow-inner"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}

                                {/* Quantity */}
                                {((type === 'INK' && (selectedInks.length > 0 || customInkText.trim())) || (type === 'PAPER' && selectedPaper)) && (
                                    <div className="space-y-4 pt-4 border-t border-slate-800 animate-in slide-in-from-top-4 duration-500">
                                        <div className="flex items-center justify-between px-2">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                                                الكمية المطلوبة {type === 'INK' && selectedInks.length > 1 && '(لكل نوع)'}
                                            </label>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={decrementQuantity}
                                                className="h-16 w-16 rounded-2xl border-2 border-slate-800 bg-slate-900 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-500 transition-all shadow-xl"
                                            >
                                                <Minus className="h-6 w-6" />
                                            </Button>
                                            <div className="flex-1 flex items-center justify-center bg-slate-900/80 rounded-[2rem] border-2 border-slate-800 h-20 shadow-inner">
                                                <span className="text-5xl font-black text-white">{quantity}</span>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={incrementQuantity}
                                                className="h-16 w-16 rounded-2xl border-2 border-slate-800 bg-slate-900 hover:bg-emerald-500/10 hover:border-emerald-500/50 hover:text-emerald-500 transition-all shadow-xl"
                                            >
                                                <Plus className="h-6 w-6" />
                                            </Button>
                                        </div>
                                        <p className="text-[10px] text-slate-500 font-bold text-center uppercase tracking-widest mt-2">
                                            الحد الأقصى المسموح به: 50 {type === 'INK' ? 'عبوة' : 'رزمة'}
                                        </p>
                                    </div>
                                )}

                                {/* Notes */}
                                <div className="space-y-4 pt-4">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        ملاحظات إضافية (اختياري)
                                    </label>
                                    <Textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="أضف أي ملاحظات أو تفاصيل إضافية للصرف..."
                                        rows={4}
                                        className="resize-none bg-slate-900 border-2 border-slate-800 focus:border-blue-500/50 rounded-[2rem] text-slate-200 font-medium p-6 shadow-inner"
                                    />
                                </div>

                                {/* Submit Button */}
                                <Button
                                    onClick={handleSubmit}
                                    disabled={submitting || (type === 'INK' ? (selectedInks.length === 0 && !customInkText.trim() || !selectedPrinter) : (!selectedPaper || (selectedPaper === 'other' && !customPaperText.trim())))}
                                    className={`w-full h-20 text-2xl font-black shadow-2xl transition-all duration-300 rounded-[2rem] mt-4 ${type === 'INK'
                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-blue-900/40 text-white translate-y-0 hover:-translate-y-1'
                                        : 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 shadow-emerald-900/40 text-white translate-y-0 hover:-translate-y-1'
                                        }`}
                                >
                                    {submitting ? (
                                        <div className="flex items-center gap-3">
                                            <Loader2 className="h-6 w-6 animate-spin" />
                                            جاري معالجة الطلب...
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-4">
                                            تأكيد وإرسال الطلب
                                            <ArrowRight className="h-6 w-6 rotate-180" />
                                        </div>
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
