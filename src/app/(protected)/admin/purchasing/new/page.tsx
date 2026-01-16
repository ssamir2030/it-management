'use client'

export const dynamic = 'force-dynamic';

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShoppingCart, ArrowRight, Plus, Trash2, Printer, Copy, Loader2, Save, Package } from "lucide-react"
import { toast } from "sonner"
import { createPurchaseOrder } from '@/app/actions/purchasing'
import { getPrinterCatalog } from '@/app/actions/catalog'
import { PrinterBrand, PrinterModel, InkToner } from '@/lib/constants/printer-catalog'

interface POItem {
    id: string
    description: string
    quantity: number
    unitPrice: number
    printerName?: string
    inkName?: string
}

export default function NewPurchaseOrderPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [initializing, setInitializing] = useState(true)

    // Form State
    const [notes, setNotes] = useState('')
    const [items, setItems] = useState<POItem[]>([])

    // Printer Catalog
    const [catalog, setCatalog] = useState<Record<'PRINTER' | 'COPIER', PrinterBrand[]>>({ PRINTER: [], COPIER: [] })

    // New Item Input State
    const [deviceType, setDeviceType] = useState<'PRINTER' | 'COPIER' | ''>('')
    const [brandName, setBrandName] = useState('')
    const [modelId, setModelId] = useState('')
    const [selectedInkId, setSelectedInkId] = useState('')
    const [manualDescription, setManualDescription] = useState('')
    const [newQuantity, setNewQuantity] = useState(1)
    const [newUnitPrice, setNewUnitPrice] = useState(0)

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

    const selectedInkToner = useMemo(() => {
        return availableInks.find(t => t.id === selectedInkId)
    }, [availableInks, selectedInkId])

    // Handlers
    const handleDeviceTypeChange = (val: 'PRINTER' | 'COPIER') => {
        setDeviceType(val)
        setBrandName('')
        setModelId('')
        setSelectedInkId('')
    }

    const handleBrandChange = (val: string) => {
        setBrandName(val)
        setModelId('')
        setSelectedInkId('')
    }

    const handleModelChange = (val: string) => {
        setModelId(val)
        setSelectedInkId('')
    }

    const handleAddItem = () => {
        let description = ''
        let printerName = ''
        let inkName = ''

        if (deviceType && selectedModel && selectedInkToner) {
            printerName = `${brandName} ${selectedModel.name}`
            inkName = selectedInkToner.name
            description = `${inkName} - ${printerName}`
        } else if (manualDescription) {
            description = manualDescription
        } else {
            toast.error("الرجاء إدخال وصف الصنف أو اختيار الطابعة والحبر")
            return
        }

        const newItem: POItem = {
            id: Math.random().toString(36).substr(2, 9),
            description,
            quantity: newQuantity,
            unitPrice: newUnitPrice,
            printerName: printerName || undefined,
            inkName: inkName || undefined
        }

        setItems([...items, newItem])

        // Reset inputs
        setManualDescription('')
        setNewQuantity(1)
        setNewUnitPrice(0)
        setSelectedInkId('')
        toast.success("تم إضافة الصنف")
    }

    const handleRemoveItem = (id: string) => {
        setItems(items.filter(item => item.id !== id))
    }

    const handleSubmit = async () => {
        if (items.length === 0) {
            toast.error("يجب إضافة عناصر لأمر الشراء")
            return
        }

        setLoading(true)
        try {
            const result = await createPurchaseOrder({
                notes,
                items: items.map(item => ({
                    description: item.description,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice
                }))
            })

            if (result.success) {
                toast.success("تم إنشاء أمر الشراء بنجاح")
                router.push('/admin/purchasing')
            } else {
                toast.error(result.error || "فشل في إنشاء أمر الشراء")
            }
        } catch (error) {
            toast.error("حدث خطأ غير متوقع")
        } finally {
            setLoading(false)
        }
    }

    const totalCost = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)

    if (initializing) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-slate-900" dir="rtl">
            <PremiumPageHeader
                title="إنشاء أمر شراء جديد"
                description="إنشاء أمر شراء جديد وإضافة الأصناف المطلوبة"
                icon={ShoppingCart}
                rightContent={
                    <Link href="/admin/purchasing">
                        <Button variant="ghost" size="lg" className="text-white hover:bg-white/20 gap-2">
                            <ArrowRight className="h-4 w-4" />
                            إلغاء والعودة
                        </Button>
                    </Link>
                }
            />

            <div className="w-full px-6 py-8">
                <div className="w-full space-y-8">

                    {/* Notes Section */}
                    <Card className="card-elevated">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-blue-500/10 p-2.5">
                                    <Package className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">معلومات أمر الشراء</CardTitle>
                                    <CardDescription>أدخل الملاحظات واسم المورد</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label className="text-base font-semibold">الملاحظات / اسم المورد</Label>
                                <Input
                                    placeholder="أدخل اسم المورد أو أي ملاحظات هامة..."
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    className="h-12 text-base"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Add Item Section */}
                    <Card className="card-elevated">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-emerald-500/10 p-2.5">
                                    <Plus className="h-6 w-6 text-emerald-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">إضافة صنف جديد</CardTitle>
                                    <CardDescription>اختر من قائمة الطابعات والأحبار أو أدخل يدوياً</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            {/* Device Type Selection */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div
                                    onClick={() => handleDeviceTypeChange('PRINTER')}
                                    className={`cursor-pointer rounded-xl border-2 p-4 flex items-center gap-3 transition-all ${deviceType === 'PRINTER'
                                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                                        : 'border-slate-200 dark:border-slate-700 hover:border-blue-200'
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${deviceType === 'PRINTER' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}>
                                        <Printer className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold">طابعة (Printer)</h3>
                                        <p className="text-sm text-muted-foreground">طابعات مكتبية</p>
                                    </div>
                                </div>

                                <div
                                    onClick={() => handleDeviceTypeChange('COPIER')}
                                    className={`cursor-pointer rounded-xl border-2 p-4 flex items-center gap-3 transition-all ${deviceType === 'COPIER'
                                        ? 'border-slate-600 bg-slate-50 dark:bg-slate-900/20 shadow-md'
                                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${deviceType === 'COPIER' ? 'bg-slate-600 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}>
                                        <Copy className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold">آلة تصوير (Copier)</h3>
                                        <p className="text-sm text-muted-foreground">آلات تصوير مركزية</p>
                                    </div>
                                </div>
                            </div>

                            {/* Printer Selection */}
                            {deviceType && (
                                <div className="grid md:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl animate-in fade-in slide-in-from-top-4">
                                    <div className="space-y-2">
                                        <Label className="text-base font-semibold">الماركة (Brand)</Label>
                                        <Select onValueChange={handleBrandChange} value={brandName}>
                                            <SelectTrigger className="h-11">
                                                <SelectValue placeholder="اختر الماركة..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableBrands.map(b => (
                                                    <SelectItem key={b.name} value={b.name}>{b.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className={`space-y-2 ${!brandName ? 'opacity-50 pointer-events-none' : ''}`}>
                                        <Label className="text-base font-semibold">الموديل (Model)</Label>
                                        <Select onValueChange={handleModelChange} value={modelId} disabled={!brandName}>
                                            <SelectTrigger className="h-11">
                                                <SelectValue placeholder="اختر الموديل..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableModels.map(m => (
                                                    <SelectItem key={m.id} value={m.id}>
                                                        {m.name} <span className="text-muted-foreground text-xs">({m.code})</span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className={`space-y-2 ${!modelId ? 'opacity-50 pointer-events-none' : ''}`}>
                                        <Label className="text-base font-semibold">الحبر (Ink/Toner)</Label>
                                        <Select onValueChange={setSelectedInkId} value={selectedInkId} disabled={!modelId}>
                                            <SelectTrigger className="h-11">
                                                <SelectValue placeholder="اختر الحبر..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableInks.map(ink => (
                                                    <SelectItem key={ink.id} value={ink.id}>
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-2 h-2 rounded-full ${ink.color === 'Black' ? 'bg-black' :
                                                                ink.color === 'Cyan' ? 'bg-cyan-500' :
                                                                    ink.color === 'Magenta' ? 'bg-pink-500' :
                                                                        ink.color === 'Yellow' ? 'bg-yellow-400' : 'bg-gray-400'
                                                                }`} />
                                                            {ink.name}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}

                            {/* Divider */}
                            <div className="flex items-center gap-4">
                                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                                <span className="text-sm text-muted-foreground">أو أدخل يدوياً</span>
                                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                            </div>

                            {/* Manual Input */}
                            <div className="space-y-2">
                                <Label className="text-base font-semibold">وصف الصنف (يدوي)</Label>
                                <Input
                                    placeholder="أدخل وصف الصنف يدوياً إذا لم يكن في القائمة..."
                                    value={manualDescription}
                                    onChange={e => setManualDescription(e.target.value)}
                                    className="h-11"
                                />
                            </div>

                            {/* Quantity and Price */}
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-base font-semibold">الكمية</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={newQuantity}
                                        onChange={e => setNewQuantity(parseInt(e.target.value) || 1)}
                                        className="h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-base font-semibold">سعر الوحدة (ريال)</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={newUnitPrice}
                                        onChange={e => setNewUnitPrice(parseFloat(e.target.value) || 0)}
                                        className="h-11"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <Button
                                        onClick={handleAddItem}
                                        className="h-11 w-full bg-emerald-600 hover:bg-emerald-700 gap-2"
                                        disabled={!selectedInkId && !manualDescription}
                                    >
                                        <Plus className="h-4 w-4" />
                                        إضافة للقائمة
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Items List */}
                    <Card className="card-elevated">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-amber-500/10 p-2.5">
                                        <ShoppingCart className="h-6 w-6 text-amber-600" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl">قائمة الأصناف ({items.length})</CardTitle>
                                        <CardDescription>الأصناف المضافة لأمر الشراء</CardDescription>
                                    </div>
                                </div>
                                <div className="text-left">
                                    <p className="text-sm text-muted-foreground">إجمالي التكلفة</p>
                                    <p className="text-2xl font-bold text-emerald-600">{totalCost.toLocaleString()} ريال</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {items.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-30" />
                                    <p>لم يتم إضافة أصناف بعد</p>
                                    <p className="text-sm">استخدم النموذج أعلاه لإضافة أصناف</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {items.map((item, idx) => (
                                        <div key={item.id} className="flex justify-between items-center bg-white dark:bg-slate-800 border p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex-1">
                                                <div className="font-bold text-base">{item.description}</div>
                                                {item.printerName && (
                                                    <div className="text-sm text-blue-600 mt-1">
                                                        <Printer className="h-3 w-3 inline ml-1" />
                                                        {item.printerName}
                                                    </div>
                                                )}
                                                <div className="text-sm text-muted-foreground mt-1">
                                                    {item.quantity} × {item.unitPrice.toLocaleString()} ريال
                                                    <span className="mx-2 text-slate-300">|</span>
                                                    الإجمالي: <span className="font-bold text-emerald-600">{(item.quantity * item.unitPrice).toLocaleString()} ريال</span>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-10 w-10 text-red-500 hover:bg-red-50 hover:text-red-600"
                                                onClick={() => handleRemoveItem(item.id)}
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-end gap-4 pt-4">
                        <Link href="/admin/purchasing">
                            <Button variant="outline" size="lg" className="min-w-[140px]">
                                إلغاء
                            </Button>
                        </Link>
                        <Button
                            onClick={handleSubmit}
                            disabled={loading || items.length === 0}
                            size="lg"
                            className="min-w-[160px] bg-slate-900 hover:bg-slate-800 gap-2"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    <Save className="h-5 w-5" />
                                    إنشاء أمر الشراء
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
