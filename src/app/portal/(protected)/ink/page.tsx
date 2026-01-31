'use client'

export const dynamic = 'force-dynamic';

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PremiumPageHeader } from '@/components/ui/premium-page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Printer, Loader2, Search, ArrowRight, CheckCircle2, AlertCircle, Copy, ShoppingCart, Trash2, Plus } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import { submitInkRequest, checkInkStock } from '@/app/actions/ink-orders'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { getPrinterCatalog } from '@/app/actions/catalog'
import { PrinterBrand, PrinterModel, InkToner } from '@/lib/constants/printer-catalog'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'

const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
}

interface CartItem {
    id: string
    itemName: string
    quantity: number
    details: string
    // Learning Data
    deviceType?: string
    brandName?: string
    modelName?: string
    inkName?: string
}

export default function InkRequestPage() {
    const router = useRouter()
    const { toast } = useToast()

    // Data State
    const [catalog, setCatalog] = useState<Record<'PRINTER' | 'COPIER', PrinterBrand[]>>({ PRINTER: [], COPIER: [] })
    const [initializing, setInitializing] = useState(true)

    // Cart State
    const [cart, setCart] = useState<CartItem[]>([])

    // Cascading State
    const [deviceType, setDeviceType] = useState<'PRINTER' | 'COPIER' | ''>('')
    const [brandName, setBrandName] = useState('')
    const [modelId, setModelId] = useState('')
    const [selectedInkIds, setSelectedInkIds] = useState<string[]>([])

    // Manual Input State (For Learning)
    const [manualBrandName, setManualBrandName] = useState('')
    const [manualModelName, setManualModelName] = useState('')
    const [manualInkName, setManualInkName] = useState('')

    // Item State
    const [quantity, setQuantity] = useState(1)
    const [notes, setNotes] = useState('')
    const [loading, setLoading] = useState(false)
    const [resultState, setResultState] = useState<'NONE' | 'SUCCESS'>('NONE')

    // Fetch Catalog on Mount
    useEffect(() => {
        getPrinterCatalog().then(data => {
            setCatalog(data)
            setInitializing(false)
        })
    }, [])

    // Derived Data
    const availableBrands = useMemo(() => {
        if (!deviceType) return []
        return catalog[deviceType] || []
    }, [deviceType, catalog])

    const selectedBrand = useMemo(() => {
        return availableBrands.find(b => b.name === brandName)
    }, [availableBrands, brandName])

    const availableModels = selectedBrand?.models || []

    const selectedModel = useMemo(() => {
        return availableModels.find(m => m.id === modelId)
    }, [availableModels, modelId])

    const availableInks = selectedModel?.toners || []

    // Handlers
    const handleDeviceTypeChange = (val: 'PRINTER' | 'COPIER') => {
        setDeviceType(val)
        setBrandName('')
        setModelId('')
        setSelectedInkIds([])
        setManualBrandName('')
        setManualModelName('')
        setManualInkName('')
    }
    const handleBrandChange = (val: string) => {
        setBrandName(val)
        setModelId('')
        setSelectedInkIds([])
        if (val === 'MANUAL_BRAND') {
            setManualBrandName('')
        }
    }
    const handleModelChange = (val: string) => {
        setModelId(val)
        setSelectedInkIds([])
        if (val === 'MANUAL_MODEL') {
            setManualModelName('')
        }
    }

    const toggleInkSelection = (id: string) => {
        setSelectedInkIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const selectAllInks = () => {
        if (!selectedModel) return
        const allIds = selectedModel.toners.map(t => t.id)
        if (selectedInkIds.length === allIds.length) {
            setSelectedInkIds([])
        } else {
            setSelectedInkIds(allIds)
        }
    }

    const addToCart = () => {
        const finalBrand = brandName === 'MANUAL_BRAND' ? manualBrandName : brandName
        const finalModel = modelId === 'MANUAL_MODEL' ? manualModelName : selectedModel?.name

        if (!finalBrand || !finalModel) {
            toast({ title: 'تنبيه', description: 'الرجاء تعبئة جميع الحقول المطلوبة', variant: 'destructive' })
            return
        }

        const newItems: CartItem[] = []

        // Handle selected inks from catalog
        selectedInkIds.forEach(inkId => {
            const ink = availableInks.find(t => t.id === inkId)
            if (ink) {
                const deviceName = `${finalBrand} ${finalModel}`
                const details = `الجهاز: ${deviceName} | الكود: ${ink.code} | ملاحظات: ${notes}`
                newItems.push({
                    id: Math.random().toString(36).substr(2, 9),
                    itemName: ink.name,
                    quantity,
                    details,
                    deviceType: deviceType as string,
                    brandName: finalBrand,
                    modelName: finalModel,
                    inkName: ink.name
                })
            }
        })

        // Handle manual ink if selected
        if (selectedInkIds.includes('MANUAL')) {
            if (!manualInkName) {
                toast({ title: 'تنبيه', description: 'الرجاء كتابة اسم الحبر المطلوب', variant: 'destructive' })
                return
            }
            const deviceName = `${finalBrand} ${finalModel}`
            const details = `الجهاز: ${deviceName} | ملاحظات: ${notes}`
            newItems.push({
                id: Math.random().toString(36).substr(2, 9),
                itemName: manualInkName,
                quantity,
                details,
                deviceType: deviceType as string,
                brandName: finalBrand,
                modelName: finalModel,
                inkName: manualInkName
            })
        }

        if (newItems.length === 0) {
            toast({ title: 'تنبيه', description: 'الرجاء اختيار حبر واحد على الأقل', variant: 'destructive' })
            return
        }

        setCart([...cart, ...newItems])
        toast({ title: 'تمت الإضافة', description: `تم إضافة ${newItems.length} أصناف إلى السلة` })

        // Reset inputs for next group
        setSelectedInkIds([])
        setManualInkName('')
        setNotes('')
        setQuantity(1)
    }

    const removeFromCart = (id: string) => {
        setCart(cart.filter(item => item.id !== id))
    }

    const handleSubmitOrder = async () => {
        if (cart.length === 0) return

        setLoading(true)
        try {

            const result = await submitInkRequest({
                items: cart,
                notes: ''
            })


            if (result.success) {
                // Refresh catalog locally if we learned something (simple re-fetch)
                if (cart.some(i => i.brandName && (i.brandName !== brandName || i.modelName !== selectedModel?.name))) {
                    getPrinterCatalog().then(setCatalog)
                }
                setResultState('SUCCESS')
            } else {
                console.error('❌ Ink Request Failed:', result.error)
                toast({ title: 'خطأ', description: result.error || 'فشل الطلب', variant: 'destructive' })
            }
        } catch (error) {
            console.error('💥 Unexpected Ink Request Error:', error)
            toast({ title: 'خطأ', description: 'حدث خطأ غير متوقع', variant: 'destructive' })
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setCart([])
        setDeviceType('')
        setBrandName('')
        setModelId('')
        setSelectedInkIds([])
        setManualBrandName('')
        setManualModelName('')
        setManualInkName('')
        setQuantity(1)
        setNotes('')
        setResultState('NONE')
    }

    // Success Screen
    if (resultState === 'SUCCESS') {
        return (
            <div className="min-h-screen bg-gray-50/50 dark:bg-slate-900 flex items-center justify-center p-4" dir="rtl">
                <Card className="max-w-md w-full border-0 shadow-2xl overflow-hidden">
                    <div className="h-3 bg-blue-600" />
                    <CardContent className="p-8 text-center space-y-6">
                        <div className="mx-auto w-24 h-24 rounded-full flex items-center justify-center bg-blue-100 text-blue-600">
                            <CheckCircle2 className="h-12 w-12" />
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold mb-2">تم استلام الطلب بنجاح</h2>
                            <p className="text-muted-foreground">
                                تم إرسال طلبك إلى إدارة تقنية المعلومات للمراجعة والاعتماد.
                                سيتم إشعارك عند تحديث الحالة.
                            </p>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button variant="outline" className="flex-1" onClick={() => router.push('/portal/dashboard')}>الرئيسية</Button>
                            <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={resetForm}>طلب جديد</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (initializing) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            <PremiumPageHeader
                title="طلب أحبار طابعات"
                description="نظام ذكي لصرف الأحبار - اختر الجهاز وأضف الطلبات للسلة"
                icon={Printer}
                rightContent={
                    <Link href="/portal/dashboard">
                        <Button variant="ghost" className="gap-2 text-white hover:bg-white/20">
                            <ArrowRight className="h-4 w-4" />
                            العودة للرئيسية
                        </Button>
                    </Link>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Form Area */}
                <div className="lg:col-span-2">
                    <motion.div
                        initial="hidden" animate="visible" variants={containerVariants}
                    >
                        <Card className="border-0 shadow-xl bg-white dark:bg-slate-800 overflow-hidden">
                            <div className="h-2 bg-gradient-to-r from-blue-500 via-blue-600 to-slate-800" />
                            <CardContent className="p-8">

                                {/* Device Type Selection */}
                                <div className="grid md:grid-cols-2 gap-6 mb-8">
                                    <div
                                        onClick={() => handleDeviceTypeChange('PRINTER')}
                                        className={`
                                                cursor-pointer rounded-2xl border-2 p-6 flex items-center gap-4 transition-all
                                                ${deviceType === 'PRINTER'
                                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                                                : 'border-slate-200 dark:border-slate-700 hover:border-blue-200'
                                            }
                                            `}
                                    >
                                        <div className={`w-14 h-14 rounded-full flex items-center justify-center ${deviceType === 'PRINTER' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}>
                                            <Printer className="h-7 w-7" />
                                        </div>
                                        <div className="text-right">
                                            <h3 className="font-bold text-lg">طابعة (Printer)</h3>
                                            <p className="text-sm text-muted-foreground">طابعات مكتبية صغيرة ومتوسطة</p>
                                        </div>
                                    </div>

                                    <div
                                        onClick={() => handleDeviceTypeChange('COPIER')}
                                        className={`
                                                cursor-pointer rounded-2xl border-2 p-6 flex items-center gap-4 transition-all
                                                ${deviceType === 'COPIER'
                                                ? 'border-slate-600 bg-slate-50 dark:bg-slate-900/20 shadow-md'
                                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-200'
                                            }
                                            `}
                                    >
                                        <div className={`w-14 h-14 rounded-full flex items-center justify-center ${deviceType === 'COPIER' ? 'bg-slate-600 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}>
                                            <Copy className="h-7 w-7" />
                                        </div>
                                        <div className="text-right">
                                            <h3 className="font-bold text-lg">آلة تصوير (Copier)</h3>
                                            <p className="text-sm text-muted-foreground">آلات تصوير مركزية (Ricoh, Xerox...)</p>
                                        </div>
                                    </div>
                                </div>

                                <AnimatePresence mode="wait">
                                    {deviceType && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-8"
                                        >
                                            <div className="grid md:grid-cols-2 gap-8">
                                                {/* Filters Column */}
                                                <div className="space-y-6">
                                                    <div className="space-y-2">
                                                        <Label className="text-base font-semibold">1. ماركة الجهاز (Brand)</Label>
                                                        <Select onValueChange={handleBrandChange} value={brandName}>
                                                            <SelectTrigger className="h-12 text-lg">
                                                                <SelectValue placeholder="اختر الماركة..." />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {availableBrands.map(b => (
                                                                    <SelectItem key={b.name} value={b.name}>{b.name}</SelectItem>
                                                                ))}
                                                                <SelectItem value="MANUAL_BRAND" className="font-bold text-amber-600">ماركة أخرى...</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        {brandName === 'MANUAL_BRAND' && (
                                                            <Input
                                                                placeholder="اكتب اسم الماركة (مثال: Samsung)"
                                                                className="mt-2 border-amber-300"
                                                                value={manualBrandName}
                                                                onChange={(e) => setManualBrandName(e.target.value)}
                                                            />
                                                        )}
                                                    </div>

                                                    <div className={`space-y-2 transition-opacity duration-300 ${!brandName ? 'opacity-50 pointer-events-none' : ''}`}>
                                                        <Label className="text-base font-semibold">2. موديل الجهاز (Model)</Label>
                                                        <Select onValueChange={handleModelChange} value={modelId}>
                                                            <SelectTrigger className="h-12 text-lg">
                                                                <SelectValue placeholder="اختر الموديل..." />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {availableModels.map(m => (
                                                                    <SelectItem key={m.id} value={m.id}>
                                                                        {m.name} <span className="text-muted-foreground text-xs mx-2">({m.code})</span>
                                                                    </SelectItem>
                                                                ))}
                                                                <SelectItem value="MANUAL_MODEL" className="font-bold text-amber-600">موديل آخر غير موجود...</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        {modelId === 'MANUAL_MODEL' && (
                                                            <Input
                                                                placeholder="اكتب اسم الموديل (مثال: ML-1640)"
                                                                className="mt-2 border-amber-300"
                                                                value={manualModelName}
                                                                onChange={(e) => setManualModelName(e.target.value)}
                                                            />
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Inks Column */}
                                                <div className={`bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 transition-all duration-300 ${!modelId ? 'opacity-50 pointer-events-none blur-[1px]' : ''}`}>
                                                    <div className="flex items-center justify-between mb-4">
                                                        <Label className="text-base font-semibold">3. الأحبار المتوافقة (Select Ink)</Label>
                                                        {availableInks.length > 1 && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={selectAllInks}
                                                                className="text-[10px] font-black text-blue-600 dark:text-blue-400 hover:bg-blue-600/10 h-7 px-2"
                                                            >
                                                                {selectedInkIds.length === availableInks.length ? 'إلغاء الكل ✕' : 'اختيار الكل ✨'}
                                                            </Button>
                                                        )}
                                                    </div>

                                                    {modelId === 'MANUAL_MODEL' ? (
                                                        <div className="space-y-4 pt-2">
                                                            <AlertCircle className="h-8 w-8 text-amber-500 mb-2" />
                                                            <p className="text-sm text-muted-foreground">بما أن الموديل غير مدرج، يرجى كتابة اسم الحبر المطلوب يدوياً.</p>
                                                            <div
                                                                onClick={() => toggleInkSelection('MANUAL')}
                                                                className={`cursor-pointer p-3 border-2 rounded-lg flex items-center gap-3 bg-white dark:bg-slate-800 ${selectedInkIds.includes('MANUAL') ? 'border-blue-500' : 'border-dashed border-slate-300'}`}
                                                            >
                                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedInkIds.includes('MANUAL') ? 'bg-blue-600 text-white' : 'bg-slate-200'}`}>
                                                                    <CheckCircle2 className="h-4 w-4" />
                                                                </div>
                                                                <span className="font-medium">إدخال معلومات الحبر</span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-3">
                                                            {availableInks.map(ink => (
                                                                <div
                                                                    key={ink.id}
                                                                    onClick={() => toggleInkSelection(ink.id)}
                                                                    className={`
                                                                                cursor-pointer p-4 rounded-lg border-2 flex items-center justify-between transition-colors bg-white dark:bg-slate-800
                                                                                ${selectedInkIds.includes(ink.id) ? 'border-blue-600 shadow-sm' : 'border-transparent hover:border-blue-200'}
                                                                            `}
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <div className={`w-3 h-3 rounded-full 
                                                                                    ${ink.color === 'Black' ? 'bg-black' :
                                                                                ink.color === 'Cyan' ? 'bg-cyan-500' :
                                                                                    ink.color === 'Magenta' ? 'bg-pink-500' :
                                                                                        ink.color === 'Yellow' ? 'bg-yellow-400' : 'bg-gradient-to-r from-cyan-500 via-pink-500 to-yellow-500'}
                                                                                `} />
                                                                        <div className="flex flex-col">
                                                                            <span className="font-bold text-sm">{ink.name}</span>
                                                                            <span className="text-xs text-muted-foreground font-mono">{ink.code}</span>
                                                                        </div>
                                                                    </div>
                                                                    {selectedInkIds.includes(ink.id) && <CheckCircle2 className="h-5 w-5 text-blue-600" />}
                                                                </div>
                                                            ))}

                                                            {availableInks.length === 0 && (
                                                                <div className="text-center py-8 text-muted-foreground">
                                                                    لا توجد أحبار مسجلة لهذا الموديل
                                                                </div>
                                                            )}

                                                            <div
                                                                onClick={() => toggleInkSelection('MANUAL')}
                                                                className={`
                                                                        cursor-pointer p-3 rounded-lg border-2 border-dashed flex items-center gap-3 transition-colors mt-4
                                                                        ${selectedInkIds.includes('MANUAL') ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-900/10' : 'border-slate-300 hover:border-amber-300'}
                                                                    `}
                                                            >
                                                                <Search className="h-4 w-4 text-amber-600" />
                                                                <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">حبر آخر / غير موجود بالقائمة</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Final Details Section */}
                                            <AnimatePresence>
                                                {(selectedInkIds.length > 0) && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                                        className="border-t pt-8 mt-8 grid md:grid-cols-[1fr_200px] gap-6"
                                                    >
                                                        <div className="space-y-4">
                                                            {selectedInkIds.includes('MANUAL') && (
                                                                <div className="space-y-2">
                                                                    <Label>اسم/رقم الحبر المطلوب</Label>
                                                                    <Input
                                                                        value={manualInkName}
                                                                        onChange={(e) => setManualInkName(e.target.value)}
                                                                        placeholder="اكتب المعرف بدقة (مثال: HP 85A)"
                                                                        className="border-amber-200 focus:border-amber-500"
                                                                    />
                                                                    <p className="text-xs text-muted-foreground">سيتم إضافة هذا الحبر إلى القائمة تلقائياً بعد الطلب</p>
                                                                </div>
                                                            )}
                                                            <div className="space-y-2">
                                                                <Label>ملاحظات إضافية</Label>
                                                                <Textarea
                                                                    value={notes} onChange={(e) => setNotes(e.target.value)}
                                                                    rows={2} placeholder="سبب الطلب أو ملاحظات التوصيل..."
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="space-y-6">
                                                            <div className="space-y-2">
                                                                <Label>الكمية</Label>
                                                                <div className="flex items-center gap-3">
                                                                    <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="h-10 w-10"><i className="text-lg">-</i></Button>
                                                                    <div className="flex-1 h-10 flex items-center justify-center font-bold text-lg bg-slate-50 dark:bg-slate-900 rounded border">{quantity}</div>
                                                                    <Button variant="outline" size="icon" onClick={() => setQuantity(Math.min(10, quantity + 1))} className="h-10 w-10"><i className="text-lg">+</i></Button>
                                                                </div>
                                                            </div>
                                                            {/* Stock Status Indicator */}
                                                            <div className="py-2">
                                                                {selectedInkIds.length === 1 && (
                                                                    <StockStatus inkName={selectedInkIds[0] === 'MANUAL' ? manualInkName : availableInks.find(t => t.id === selectedInkIds[0])?.name || ''} />
                                                                )}
                                                                {selectedInkIds.length > 1 && (
                                                                    <div className="text-xs text-blue-600 font-bold bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg border border-blue-200">
                                                                        تم تحديد {selectedInkIds.length} أصناف
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <Button
                                                                onClick={addToCart}
                                                                disabled={selectedInkIds.length === 0 || (selectedInkIds.includes('MANUAL') && !manualInkName)}
                                                                className="w-full h-12 text-lg font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-lg"
                                                            >
                                                                <Plus className="ml-2 h-5 w-5" /> إضافة للسلة
                                                            </Button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {!deviceType && (
                                    <div className="text-center py-12 text-muted-foreground animate-in fade-in zoom-in duration-500">
                                        <p>الرجاء اختيار نوع الجهاز للبدء</p>
                                    </div>
                                )}

                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Cart Sidebar */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-8 border-0 shadow-xl bg-slate-50 dark:bg-slate-900 h-fit">
                        <CardHeader className="bg-slate-100 dark:bg-slate-800 pb-4">
                            <CardTitle className="flex items-center gap-3 text-slate-800 dark:text-slate-100">
                                <ShoppingCart className="h-6 w-6 text-blue-600" />
                                سلة الطلبات ({cart.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            {cart.length === 0 ? (
                                <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-xl">
                                    <p className="text-sm">السلة فارغة</p>
                                    <p className="text-xs mt-1">أضف المنتجات من القائمة</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {cart.map((item, index) => (
                                        <div key={item.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 relative group">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="absolute top-2 left-2 h-6 w-6 text-red-400 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => removeFromCart(item.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                            <div className="pr-2">
                                                <div className="font-bold text-slate-800 dark:text-slate-200">{item.itemName}</div>
                                                <div className="text-xs text-muted-foreground mt-1">{item.details}</div>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-600 dark:text-slate-300">الكمية: {item.quantity}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="pt-4 border-t mt-4">
                                <Button
                                    onClick={handleSubmitOrder}
                                    disabled={loading || cart.length === 0}
                                    className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 dark:shadow-none transition-all"
                                >
                                    {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'إرسال الطلب للاعتماد'}
                                </Button>
                                <p className="text-xs text-center text-muted-foreground mt-3">
                                    سيتم إرسال الطلب للمسؤول للمراجعة والاعتماد
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

function StockStatus({ inkName }: { inkName: string }) {
    const [status, setStatus] = useState<{ found: boolean, stock: number } | null>(null)
    const [loading, setLoading] = useState(false)

    // Import dynamically to avoid top-level await issues if any, or just use the imported function
    // But since this is a client component, we need to be careful.
    // Ideally we import checkInkStock at top level.
    // Let's assume it's imported at top. 

    useEffect(() => {
        if (!inkName) {
            setStatus(null)
            return
        }

        let isMounted = true
        setLoading(true)

        // Use the server action imported at the top (need to make sure it is imported)
        // import { checkInkStock } from '@/app/actions/ink-orders' 
        // We will add the import in a separate edit if not present, but for now assuming we will add it.

        checkInkStock(inkName).then(res => {
            if (isMounted) {
                setStatus(res)
                setLoading(false)
            }
        })

        return () => { isMounted = false }
    }, [inkName])

    if (loading) return <span className="text-xs text-muted-foreground animate-pulse">جاري التحقق من التوفر...</span>

    if (!status) return null

    if (status.found && status.stock > 0) {
        return (
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-lg border border-emerald-200">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-bold">متوفر في المخزون</span>
            </div>
        )
    } else {
        return (
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg border border-amber-200">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-bold">غير متوفر - سيتم تحويل الطلب للمشتريات</span>
            </div>
        )
    }
}
