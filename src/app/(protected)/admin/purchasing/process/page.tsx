'use client'

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import { ShoppingCart, ArrowRight, Trash2, Printer, Loader2, Save, Package, AlertCircle, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { createPurchaseOrder, rejectRequests } from '@/app/actions/purchasing'

interface RequestItem {
    id: string
    itemName: string
    quantity: number
    details: string
    deviceType?: string
    brandName?: string
    modelName?: string
    inkName?: string
    unitPrice: number
}

export default function ProcessRequestPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [loading, setLoading] = useState(false)
    const [rejecting, setRejecting] = useState(false)

    // Parse URL parameters - now with full details
    const subject = searchParams.get('subject') || ''
    const quantity = parseInt(searchParams.get('quantity') || '1')
    const idsParam = searchParams.get('ids') || ''
    const requestIds = idsParam ? idsParam.split(',') : []

    // Full printer/ink details from URL
    const brandName = searchParams.get('brand') || ''
    const modelName = searchParams.get('model') || ''
    const inkName = searchParams.get('ink') || subject
    const inkCode = searchParams.get('code') || ''
    const printerInfo = searchParams.get('printer') || (brandName && modelName ? `${brandName} ${modelName}` : '')

    // Form State
    const [notes, setNotes] = useState('')
    const [items, setItems] = useState<RequestItem[]>([])

    // Initialize items from URL params
    useEffect(() => {
        // Set notes with proper info
        const noteText = printerInfo
            ? `شراء لتغطية طلبات: ${inkName} لـ ${printerInfo}`
            : `شراء لتغطية طلبات: ${subject}`
        setNotes(noteText)

        if (subject || inkName) {
            setItems([{
                id: '1',
                itemName: inkName || subject,
                inkName: inkName || subject,
                brandName: brandName,
                modelName: printerInfo || modelName,
                quantity: quantity,
                details: inkCode ? `الكود: ${inkCode}` : '',
                unitPrice: 0
            }])
        }
    }, [subject, quantity, brandName, modelName, inkName, inkCode, printerInfo])

    const updateItemPrice = (id: string, price: number) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, unitPrice: price } : item
        ))
    }

    const updateItemQuantity = (id: string, qty: number) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, quantity: qty } : item
        ))
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
                    description: item.modelName
                        ? `${item.inkName}${inkCode ? ` (${inkCode})` : ''} - ${item.modelName}`
                        : item.itemName,
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

    const handleReject = async () => {
        if (requestIds.length === 0) {
            toast.error("لا توجد طلبات لرفضها")
            return
        }

        setRejecting(true)
        try {
            const result = await rejectRequests(requestIds)
            if (result.success) {
                toast.success("تم رفض الطلبات بنجاح")
                router.push('/admin/purchasing')
            } else {
                toast.error(result.error || "فشل في رفض الطلبات")
            }
        } catch (error) {
            toast.error("حدث خطأ غير متوقع")
        } finally {
            setRejecting(false)
        }
    }

    const totalCost = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-slate-900" dir="rtl">
            <PremiumPageHeader
                title="معالجة طلب شراء"
                description="مراجعة وتعديل تفاصيل الطلب قبل إنشاء أمر الشراء"
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

                    {/* Request Info - Now with full details */}
                    <Card className="card-elevated border-blue-200 bg-blue-50/50 dark:bg-blue-900/10">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-blue-500/20 p-2.5">
                                    <AlertCircle className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl text-blue-800 dark:text-blue-400">معلومات الطلب الأصلي</CardTitle>
                                    <CardDescription>تفاصيل الطلب المقدم من الموظفين</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <span className="text-sm text-muted-foreground">اسم الحبر / الصنف</span>
                                    <p className="text-lg font-bold">{inkName || subject}</p>
                                    {inkCode && (
                                        <p className="text-sm font-mono text-blue-600">الكود: {inkCode}</p>
                                    )}
                                </div>
                                {printerInfo && (
                                    <div className="space-y-1">
                                        <span className="text-sm text-muted-foreground">الطابعة / الجهاز</span>
                                        <p className="text-lg font-bold flex items-center gap-2">
                                            <Printer className="h-5 w-5 text-blue-600" />
                                            {printerInfo}
                                        </p>
                                    </div>
                                )}
                                <div className="space-y-1">
                                    <span className="text-sm text-muted-foreground">الكمية المطلوبة</span>
                                    <p className="text-lg font-bold">{quantity}</p>
                                </div>
                                {requestIds.length > 0 && (
                                    <div className="space-y-1">
                                        <span className="text-sm text-muted-foreground">عدد الطلبات المرتبطة</span>
                                        <Badge variant="secondary" className="text-sm">
                                            {requestIds.length} طلب
                                        </Badge>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notes Section */}
                    <Card className="card-elevated">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-slate-500/10 p-2.5">
                                    <Package className="h-6 w-6 text-slate-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">ملاحظات أمر الشراء</CardTitle>
                                    <CardDescription>أضف اسم المورد أو أي ملاحظات</CardDescription>
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

                    {/* Items List with Price Input */}
                    <Card className="card-elevated">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-emerald-500/10 p-2.5">
                                        <ShoppingCart className="h-6 w-6 text-emerald-600" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl">الأصناف المطلوبة</CardTitle>
                                        <CardDescription>راجع وأضف سعر الوحدة لكل صنف</CardDescription>
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
                                    <p>لا توجد أصناف</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {items.map((item) => (
                                        <div key={item.id} className="bg-white dark:bg-slate-800 border p-6 rounded-xl shadow-sm">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex-1">
                                                    <div className="font-bold text-lg">{item.itemName}</div>
                                                    {item.modelName && (
                                                        <div className="text-sm text-blue-600 mt-1 flex items-center gap-1">
                                                            <Printer className="h-4 w-4" />
                                                            {item.modelName}
                                                        </div>
                                                    )}
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

                                            <div className="grid md:grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-semibold">الكمية</Label>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={e => updateItemQuantity(item.id, parseInt(e.target.value) || 1)}
                                                        className="h-11"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-semibold">سعر الوحدة (ريال) *</Label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={item.unitPrice}
                                                        onChange={e => updateItemPrice(item.id, parseFloat(e.target.value) || 0)}
                                                        className="h-11 border-amber-300 focus:border-amber-500"
                                                        placeholder="أدخل السعر"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-semibold">الإجمالي</Label>
                                                    <div className="h-11 flex items-center px-3 bg-slate-50 dark:bg-slate-900 rounded-md border">
                                                        <span className="font-bold text-emerald-600 text-lg">
                                                            {(item.quantity * item.unitPrice).toLocaleString()} ريال
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-between gap-4 pt-4">
                        <Button
                            variant="destructive"
                            size="lg"
                            onClick={handleReject}
                            disabled={rejecting || requestIds.length === 0}
                            className="min-w-[140px] gap-2"
                        >
                            {rejecting ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    <Trash2 className="h-5 w-5" />
                                    رفض الطلبات
                                </>
                            )}
                        </Button>

                        <div className="flex gap-4">
                            <Link href="/admin/purchasing">
                                <Button variant="outline" size="lg" className="min-w-[120px]">
                                    إلغاء
                                </Button>
                            </Link>
                            <Button
                                onClick={handleSubmit}
                                disabled={loading || items.length === 0}
                                size="lg"
                                className="min-w-[180px] bg-emerald-600 hover:bg-emerald-700 gap-2"
                            >
                                {loading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        <CheckCircle2 className="h-5 w-5" />
                                        إنشاء أمر الشراء
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
