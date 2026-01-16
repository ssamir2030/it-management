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
import { Textarea } from "@/components/ui/textarea"
import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import { Package, ArrowRight, ArrowUpCircle, ArrowDownCircle, Loader2, Save, AlertTriangle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { updateStock } from '@/app/actions/inventory'
import { prisma } from '@/lib/prisma'

interface ConsumableItem {
    id: string
    name: string
    category: string
    currentStock: number
    minStock: number
    unit: string
}

export default function AdjustStockPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { toast } = useToast()

    const [loading, setLoading] = useState(false)
    const [item, setItem] = useState<ConsumableItem | null>(null)

    // Get item details from URL params
    const itemId = searchParams.get('id') || ''
    const itemName = searchParams.get('name') || ''
    const currentStock = parseInt(searchParams.get('stock') || '0')
    const unit = searchParams.get('unit') || 'Piece'
    const minStock = parseInt(searchParams.get('min') || '5')

    // Form state
    const [type, setType] = useState<'IN' | 'OUT'>('IN')
    const [quantity, setQuantity] = useState(1)
    const [notes, setNotes] = useState('')

    useEffect(() => {
        if (itemId) {
            setItem({
                id: itemId,
                name: itemName,
                category: '',
                currentStock: currentStock,
                minStock: minStock,
                unit: unit
            })
        }
    }, [itemId, itemName, currentStock, unit, minStock])

    const handleSubmit = async () => {
        if (!itemId) {
            toast({ title: "خطأ", description: "لم يتم تحديد الصنف", variant: "destructive" })
            return
        }

        if (quantity <= 0) {
            toast({ title: "خطأ", description: "الكمية يجب أن تكون أكبر من صفر", variant: "destructive" })
            return
        }

        setLoading(true)
        try {
            const result = await updateStock(itemId, quantity, type, notes)

            if (result.success) {
                toast({ title: "تم بنجاح", description: type === 'IN' ? "تمت إضافة الكمية للمخزون" : "تم خصم الكمية من المخزون" })
                router.push('/admin/inventory')
            } else {
                toast({ title: "خطأ", description: result.error || "فشل تحديث الرصيد", variant: "destructive" })
            }
        } catch (error) {
            toast({ title: "خطأ", description: "حدث خطأ غير متوقع", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    // Calculate new stock preview
    const newStock = type === 'IN' ? currentStock + quantity : currentStock - quantity
    const isLowStock = newStock <= minStock

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-slate-900" dir="rtl">
            <PremiumPageHeader
                title="تعديل رصيد المخزون"
                description={itemName || "تحديث كمية صنف في المخزون"}
                icon={Package}
                rightContent={
                    <Link href="/admin/inventory">
                        <Button variant="ghost" size="lg" className="text-white hover:bg-white/20 gap-2">
                            <ArrowRight className="h-4 w-4" />
                            إلغاء والعودة
                        </Button>
                    </Link>
                }
            />

            <div className="w-full px-6 py-8">
                <div className="w-full space-y-8">

                    {/* Current Stock Info */}
                    <Card className="card-elevated border-blue-200 bg-blue-50/50 dark:bg-blue-900/10">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-blue-500/20 p-2.5">
                                        <Package className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl text-blue-800 dark:text-blue-400">{itemName}</CardTitle>
                                        <CardDescription>معلومات الصنف الحالية</CardDescription>
                                    </div>
                                </div>
                                {currentStock <= minStock && (
                                    <Badge variant="destructive" className="gap-1">
                                        <AlertTriangle className="h-3 w-3" /> مخزون منخفض
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-6 text-center">
                                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border">
                                    <span className="text-sm text-muted-foreground block mb-1">الرصيد الحالي</span>
                                    <p className="text-3xl font-bold text-blue-600">{currentStock}</p>
                                    <span className="text-xs text-muted-foreground">{unit}</span>
                                </div>
                                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border">
                                    <span className="text-sm text-muted-foreground block mb-1">حد الطلب</span>
                                    <p className="text-3xl font-bold text-amber-600">{minStock}</p>
                                    <span className="text-xs text-muted-foreground">{unit}</span>
                                </div>
                                <div className={`rounded-xl p-4 border ${isLowStock ? 'bg-red-50 dark:bg-red-900/20 border-red-200' : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200'}`}>
                                    <span className="text-sm text-muted-foreground block mb-1">الرصيد الجديد</span>
                                    <p className={`text-3xl font-bold ${isLowStock ? 'text-red-600' : 'text-emerald-600'}`}>{newStock}</p>
                                    <span className="text-xs text-muted-foreground">{unit}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Operation Type Selection */}
                    <Card className="card-elevated">
                        <CardHeader>
                            <CardTitle className="text-xl">نوع العملية</CardTitle>
                            <CardDescription>اختر نوع العملية المطلوبة على المخزون</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div
                                    onClick={() => setType('IN')}
                                    className={`cursor-pointer rounded-xl border-2 p-6 flex flex-col items-center gap-3 transition-all ${type === 'IN'
                                        ? 'bg-emerald-50 border-emerald-500 dark:bg-emerald-900/20'
                                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200'
                                        }`}
                                >
                                    <div className={`p-4 rounded-full ${type === 'IN' ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                                        <ArrowUpCircle className={`h-10 w-10 ${type === 'IN' ? 'text-emerald-600' : 'text-slate-400'}`} />
                                    </div>
                                    <span className={`font-bold text-lg ${type === 'IN' ? 'text-emerald-700' : 'text-slate-600'}`}>
                                        إضافة (وارد)
                                    </span>
                                    <span className="text-sm text-muted-foreground text-center">
                                        زيادة كمية المخزون
                                    </span>
                                </div>
                                <div
                                    onClick={() => setType('OUT')}
                                    className={`cursor-pointer rounded-xl border-2 p-6 flex flex-col items-center gap-3 transition-all ${type === 'OUT'
                                        ? 'bg-red-50 border-red-500 dark:bg-red-900/20'
                                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200'
                                        }`}
                                >
                                    <div className={`p-4 rounded-full ${type === 'OUT' ? 'bg-red-100' : 'bg-slate-100'}`}>
                                        <ArrowDownCircle className={`h-10 w-10 ${type === 'OUT' ? 'text-red-600' : 'text-slate-400'}`} />
                                    </div>
                                    <span className={`font-bold text-lg ${type === 'OUT' ? 'text-red-700' : 'text-slate-600'}`}>
                                        خصم (صادر)
                                    </span>
                                    <span className="text-sm text-muted-foreground text-center">
                                        إنقاص كمية المخزون
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quantity and Notes */}
                    <Card className="card-elevated">
                        <CardHeader>
                            <CardTitle className="text-xl">تفاصيل العملية</CardTitle>
                            <CardDescription>أدخل الكمية والملاحظات</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-base font-semibold">الكمية *</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={e => setQuantity(parseInt(e.target.value) || 1)}
                                    className="h-14 text-2xl text-center font-bold"
                                    placeholder="أدخل الكمية"
                                />
                                {type === 'OUT' && quantity > currentStock && (
                                    <p className="text-sm text-red-600 flex items-center gap-1">
                                        <AlertTriangle className="h-4 w-4" />
                                        الكمية المطلوبة أكبر من الرصيد المتوفر
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-base font-semibold">ملاحظات / سبب العملية (اختياري)</Label>
                                <Textarea
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    placeholder="مثال: استلام شحنة جديدة / صرف لقسم المحاسبة..."
                                    className="min-h-[100px] text-base"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-between gap-4 pt-4">
                        <Link href="/admin/inventory">
                            <Button variant="outline" size="lg" className="min-w-[120px]">
                                إلغاء
                            </Button>
                        </Link>
                        <Button
                            onClick={handleSubmit}
                            disabled={loading || quantity <= 0 || (type === 'OUT' && quantity > currentStock)}
                            size="lg"
                            className={`min-w-[180px] gap-2 ${type === 'IN'
                                ? 'bg-emerald-600 hover:bg-emerald-700'
                                : 'bg-red-600 hover:bg-red-700'
                                }`}
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    <Save className="h-5 w-5" />
                                    {type === 'IN' ? 'إضافة للمخزون' : 'خصم من المخزون'}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
