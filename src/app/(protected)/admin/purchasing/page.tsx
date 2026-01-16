'use client'

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import { ShoppingCart, Package, Plus, CheckCircle2, Clock, Truck, FileText, Trash2, Pencil, XCircle, Eye } from "lucide-react"
import { toast } from "sonner"
import { getPendingRequests, getPurchaseOrders, createPurchaseOrder, receivePurchaseOrder, deletePurchaseOrder, updatePurchaseOrder, rejectRequests } from '@/app/actions/purchasing'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function PurchasingPage() {
    const [pendingRequests, setPendingRequests] = useState<any[]>([])
    const [purchaseOrders, setPurchaseOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Create/Edit Dialog State
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [editingPO, setEditingPO] = useState<any>(null)
    const [newPO, setNewPO] = useState({ supplier: '', notes: '', items: [] as any[] })

    // New Item Input State (within Dialog)
    const [newItem, setNewItem] = useState({ description: '', quantity: 1, unitPrice: 0 })

    // Delete Alert State
    const [deleteAlert, setDeleteAlert] = useState<{ open: boolean, id: string | null, type: 'PO' | 'REQUESTS', requestNames?: string[] }>({ open: false, id: null, type: 'PO' })

    // PO Details Preview Dialog State
    const [detailsPO, setDetailsPO] = useState<any>(null)

    // Initial Data Fetch
    useEffect(() => {
        refreshData()
    }, [])

    const refreshData = async () => {
        setLoading(true)
        const [reqRes, poRes] = await Promise.all([
            getPendingRequests(),
            getPurchaseOrders()
        ])
        if (reqRes.success) setPendingRequests(reqRes.data || [])
        if (poRes.success) setPurchaseOrders(poRes.data || [])
        setLoading(false)
    }

    const openCreateDialog = () => {
        setEditingPO(null)
        setNewPO({ supplier: '', notes: '', items: [] })
        setNewItem({ description: '', quantity: 1, unitPrice: 0 })
        setIsCreateOpen(true)
    }

    const openEditDialog = (po: any) => {
        setEditingPO(po)
        setNewPO({
            supplier: po.supplierId || '',
            notes: po.notes || '',
            items: po.items.map((i: any) => ({
                description: i.description,
                quantity: i.quantity,
                unitPrice: i.unitPrice,
                inventoryItemId: i.inventoryItemId
            }))
        })
        setNewItem({ description: '', quantity: 1, unitPrice: 0 })
        setIsCreateOpen(true)
    }

    const handleAddItem = () => {
        if (!newItem.description) {
            toast.error("الرجاء إدخال وصف الصنف")
            return
        }
        setNewPO({
            ...newPO,
            items: [...newPO.items, { ...newItem }]
        })
        setNewItem({ description: '', quantity: 1, unitPrice: 0 })
    }

    const handleRemoveItem = (idx: number) => {
        const newItems = [...newPO.items]
        newItems.splice(idx, 1)
        setNewPO({ ...newPO, items: newItems })
    }

    const handleSavePO = async () => {
        if (newPO.items.length === 0) {
            toast.error("يجب إضافة عناصر لأمر الشراء")
            return
        }

        let result
        if (editingPO) {
            result = await updatePurchaseOrder(editingPO.id, {
                notes: newPO.notes,
                items: newPO.items
            })
        } else {
            result = await createPurchaseOrder({
                notes: newPO.notes,
                items: newPO.items
            })
        }

        if (result.success) {
            toast.success(editingPO ? "تم تعديل أمر الشراء" : "تم إنشاء أمر الشراء")
            setIsCreateOpen(false)
            setEditingPO(null)
            setNewPO({ supplier: '', notes: '', items: [] })
            refreshData()
        } else {
            toast.error(result.error)
        }
    }

    const confirmDeletePO = (id: string) => {
        setDeleteAlert({ open: true, id, type: 'PO' })
    }

    const confirmRejectRequests = (ids: string[], names: string[]) => {
        setDeleteAlert({ open: true, id: JSON.stringify(ids), type: 'REQUESTS', requestNames: names })
    }

    const handleConfirmDelete = async () => {
        if (deleteAlert.type === 'PO' && deleteAlert.id) {
            const result = await deletePurchaseOrder(deleteAlert.id)
            if (result.success) {
                toast.success("تم حذف أمر الشراء")
                refreshData()
            } else {
                toast.error(result.error)
            }
        } else if (deleteAlert.type === 'REQUESTS' && deleteAlert.id) {
            const ids = JSON.parse(deleteAlert.id)
            const result = await rejectRequests(ids)
            if (result.success) {
                toast.success("تم رفض الطلبات وإزالتها")
                refreshData()
            } else {
                toast.error(result.error)
            }
        }
        setDeleteAlert({ ...deleteAlert, open: false })
    }

    const handleReceivePO = async (id: string) => {
        if (!confirm("هل أنت متأكد من استلام هذا الطلب؟ سيتم تحديث المخزون تلقائياً.")) return // Keep simple confirm for status change or upgrade later

        const result = await receivePurchaseOrder(id)
        if (result.success) {
            toast.success("تم استلام الطلب وتحديث المخزون")
            refreshData()
        } else {
            toast.error(result.error)
        }
    }

    return (
        <div className="space-y-6" dir="rtl">
            <PremiumPageHeader
                title="إدارة المشتريات"
                description="متابعة طلبات الشراء، الموردين، واستلام الشحنات للمستودع"
                icon={ShoppingCart}
            />

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="bg-background/50 backdrop-blur border p-1 h-auto">
                    <TabsTrigger value="overview" className="text-base py-2 px-4 gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <FileText className="h-4 w-4" /> نظرة عامة
                    </TabsTrigger>
                    <TabsTrigger value="pos" className="text-base py-2 px-4 gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Truck className="h-4 w-4" /> أوامر الشراء
                    </TabsTrigger>
                    <TabsTrigger value="requests" className="text-base py-2 px-4 gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Package className="h-4 w-4" /> طلبات معلقة <Badge variant="secondary" className="mr-2">{pendingRequests.length}</Badge>
                    </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview">
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">إجمالي أوامر الشراء</CardTitle>
                                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{purchaseOrders.length}</div>
                                <p className="text-xs text-muted-foreground">أمر شراء مسجل</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">بانتظار الاستلام</CardTitle>
                                <Clock className="h-4 w-4 text-amber-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{purchaseOrders.filter(p => p.status === 'ORDERED').length}</div>
                                <p className="text-xs text-muted-foreground">أوامر جارية حالياً</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">مكتملة</CardTitle>
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{purchaseOrders.filter(p => p.status === 'RECEIVED').length}</div>
                                <p className="text-xs text-muted-foreground">تم استلامها وإضافتها للمخزون</p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Purchase Orders Tab */}
                <TabsContent value="pos">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>أوامر الشراء</CardTitle>
                                <CardDescription>قائمة بجميع أوامر الشراء وحالتها - يمكنك تعديل أو حذف الأوامر غير المستلمة</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Link href="/admin/purchasing/new">
                                    <Button className="bg-slate-900 text-white gap-2">
                                        <Plus className="h-4 w-4" /> أمر شراء جديد
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {loading ? <p className="text-center py-8">جاري التحميل...</p> : purchaseOrders.map((po) => (
                                    <div key={po.id} className="flex items-center justify-between p-4 bg-card border rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-full ${po.status === 'RECEIVED' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="font-bold flex items-center gap-2">
                                                    أمر شراء #{po.id.slice(-6).toUpperCase()}
                                                    {po.status === 'RECEIVED' && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                                                </div>
                                                <div className="text-sm text-muted-foreground mt-1">
                                                    {new Date(po.createdAt).toLocaleDateString('ar-SA')} | عدد الأصناف: {po.items.length}
                                                </div>
                                                {po.notes && <div className="text-xs text-slate-500 mt-1 max-w-md truncate">{po.notes}</div>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-left hidden md:block">
                                                <div className="font-bold text-lg">{po.totalCost.toLocaleString()} ريال</div>
                                                {po.status === 'RECEIVED' ? (
                                                    <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700">
                                                        مستلم
                                                    </Badge>
                                                ) : (
                                                    <Badge
                                                        variant="secondary"
                                                        className="cursor-pointer hover:bg-amber-200 transition-colors"
                                                        onClick={() => setDetailsPO(po)}
                                                    >
                                                        <Eye className="h-3 w-3 ml-1" />
                                                        قيد الانتظار
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1 bg-muted p-1 rounded-lg border">
                                                <Button size="icon" variant="outline" className="h-8 w-8 text-slate-600 border-slate-200 hover:bg-slate-100" onClick={() => setDetailsPO(po)} title="معاينة التفاصيل">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="outline" className="h-8 w-8 text-blue-600 border-blue-200 hover:bg-blue-50 disabled:opacity-30" onClick={() => openEditDialog(po)} disabled={po.status === 'RECEIVED'} title="تعديل أمر الشراء">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="outline" className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50" onClick={() => confirmDeletePO(po.id)} title="حذف أمر الشراء">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                                <div className="w-px h-6 bg-border mx-1" />
                                                {po.status !== 'RECEIVED' && (
                                                    <Button size="sm" onClick={() => handleReceivePO(po.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                                                        <CheckCircle2 className="h-4 w-4" /> استلام
                                                    </Button>
                                                )}
                                                {po.status === 'RECEIVED' && (
                                                    <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50 h-8 px-3">تم الاستلام</Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {!loading && purchaseOrders.length === 0 && (
                                    <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-4">
                                        <div className="bg-muted p-4 rounded-full">
                                            <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <p>لا توجد أوامر شراء مسجلة حالياً</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Pending Requests Tab */}
                <TabsContent value="requests">
                    <Card>
                        <CardHeader>
                            <CardTitle>طلبات الموظفين المعلقة (مجمعة حسب الصنف)</CardTitle>
                            <CardDescription>جميع العناصر المطلوبة مجمعة لتسهيل إنشاء أوامر الشراء</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {(() => {
                                    // Aggregation Logic with full details
                                    const aggregatedData: Record<string, {
                                        subject: string,
                                        totalQty: number,
                                        count: number,
                                        details: string,
                                        ids: string[],
                                        brandName?: string,
                                        modelName?: string,
                                        inkName?: string,
                                        inkCode?: string
                                    }> = {}

                                    pendingRequests.forEach(req => {
                                        let items = [] as any[]
                                        try {
                                            const match = req.details?.match(/<!-- DATA: (.*?) -->/)
                                            if (match && match[1]) {
                                                items = JSON.parse(match[1])
                                            } else {
                                                items = [{ itemName: req.subject || 'جزء غير محدد', quantity: 1 }]
                                            }
                                        } catch (e) {
                                            items = [{ itemName: req.subject || 'جزء غير محدد', quantity: 1 }]
                                        }

                                        items.forEach((item: any) => {
                                            const name = item.itemName || 'جزء غير محدد'
                                            // Create a unique key combining ink and printer for better aggregation
                                            const key = item.brandName && item.modelName
                                                ? `${item.inkName || item.itemName}|${item.brandName}|${item.modelName}`
                                                : name

                                            if (!aggregatedData[key]) {
                                                // Extract ink code from details if available
                                                let inkCode = ''
                                                if (item.details) {
                                                    const codeMatch = item.details.match(/الكود:\s*([^\s|]+)/)
                                                    if (codeMatch) inkCode = codeMatch[1]
                                                }

                                                aggregatedData[key] = {
                                                    subject: name,
                                                    totalQty: 0,
                                                    count: 0,
                                                    details: item.details || '',
                                                    ids: [],
                                                    brandName: item.brandName,
                                                    modelName: item.modelName,
                                                    inkName: item.inkName || item.itemName,
                                                    inkCode: inkCode
                                                }
                                            }
                                            aggregatedData[key].totalQty += (item.quantity || 1)
                                            aggregatedData[key].count++
                                            if (!aggregatedData[key].ids.includes(req.id)) {
                                                aggregatedData[key].ids.push(req.id)
                                            }
                                        })
                                    })

                                    const aggregatedList = Object.values(aggregatedData)

                                    if (aggregatedList.length === 0) {
                                        return <div className="text-center py-12 text-muted-foreground">لا توجد طلبات معلقة</div>
                                    }

                                    return aggregatedList.map((item, idx) => {
                                        // Build full display name
                                        const displayName = item.inkName || item.subject
                                        const printerInfo = item.brandName && item.modelName
                                            ? `${item.brandName} ${item.modelName}`
                                            : ''

                                        // Build URL params with full details
                                        const urlParams = new URLSearchParams({
                                            subject: displayName,
                                            quantity: item.totalQty.toString(),
                                            ids: item.ids.join(','),
                                            ...(item.brandName && { brand: item.brandName }),
                                            ...(item.modelName && { model: item.modelName }),
                                            ...(item.inkName && { ink: item.inkName }),
                                            ...(item.inkCode && { code: item.inkCode }),
                                            ...(printerInfo && { printer: printerInfo })
                                        })

                                        return (
                                            <div key={idx} className="border p-4 rounded-lg flex justify-between items-center bg-white hover:bg-slate-50 transition-colors dark:bg-slate-800 dark:hover:bg-slate-700">
                                                <div className="flex gap-3 items-start">
                                                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg dark:bg-blue-900/30">
                                                        <Package className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-base">{displayName}</div>
                                                        {printerInfo && (
                                                            <div className="text-sm text-blue-600 dark:text-blue-400 mt-0.5 flex items-center gap-1">
                                                                <span className="text-xs">🖨️</span> {printerInfo}
                                                            </div>
                                                        )}
                                                        {item.inkCode && (
                                                            <div className="text-xs text-muted-foreground mt-0.5 font-mono">
                                                                الكود: {item.inkCode}
                                                            </div>
                                                        )}
                                                        <div className="text-sm text-muted-foreground mt-1 flex gap-2">
                                                            <Badge variant="outline">إجمالي الكمية: {item.totalQty}</Badge>
                                                            <span className="flex items-center text-xs">من {item.count} طلب</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button variant="outline" size="icon"
                                                        className="text-red-600 border-red-200 hover:bg-red-50 h-9 w-9"
                                                        title="رفض الطلب"
                                                        onClick={() => confirmRejectRequests(item.ids, [displayName])}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>

                                                    <Link href={`/admin/purchasing/process?${urlParams.toString()}`}>
                                                        <Button variant="outline" size="sm" className="gap-2 h-9 border-blue-200 text-blue-700 hover:bg-blue-50">
                                                            <Pencil className="h-4 w-4" /> تعديل ومعالجة
                                                        </Button>
                                                    </Link>

                                                    <Link href={`/admin/purchasing/process?${urlParams.toString()}`}>
                                                        <Button variant="default" size="sm" className="gap-2 h-9">
                                                            <Plus className="h-4 w-4" /> إنشاء أمر شراء
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        )
                                    })
                                })()}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Create/Edit PRO Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>{editingPO ? 'تعديل أمر شراء' : 'إنشاء أمر شراء جديد'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                            <Label>الملاحظات / اسم المورد</Label>
                            <Input
                                placeholder="أدخل اسم المورد أو أي ملاحظات هامة..."
                                value={newPO.notes}
                                onChange={e => setNewPO({ ...newPO, notes: e.target.value })}
                            />
                        </div>

                        <div className="space-y-4 border rounded-lg p-4 bg-muted/50">
                            <div className="flex items-center justify-between">
                                <Label className="text-base font-semibold">قائمة الأصناف</Label>
                            </div>

                            {/* New Item Input Row */}
                            <div className="flex gap-2 items-end bg-card p-3 rounded border shadow-sm">
                                <div className="grid gap-2 flex-1">
                                    <Label className="text-xs text-muted-foreground">وصف الصنف</Label>
                                    <Input
                                        placeholder="اسم المنتج..."
                                        value={newItem.description}
                                        onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2 w-24">
                                    <Label className="text-xs text-muted-foreground">الكمية</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={newItem.quantity}
                                        onChange={e => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                                    />
                                </div>
                                <div className="grid gap-2 w-32">
                                    <Label className="text-xs text-muted-foreground">سعر الوحدة</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={newItem.unitPrice}
                                        onChange={e => setNewItem({ ...newItem, unitPrice: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <Button size="icon" onClick={handleAddItem} className="mb-[2px]">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                {newPO.items.length === 0 && <p className="text-sm text-center text-muted-foreground py-4">لم يتم إضافة أصناف بعد</p>}
                                {newPO.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-card border p-3 rounded shadow-sm">
                                        <div>
                                            <div className="font-medium text-sm">{item.description}</div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {item.quantity} × {item.unitPrice} ريال
                                                <span className="mx-2 text-slate-300">|</span>
                                                الإجمالي: {(item.quantity * item.unitPrice).toLocaleString()} ريال
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => handleRemoveItem(idx)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between items-center pt-2 border-t mt-2">
                                <span className="font-semibold text-sm">إجمالي التكلفة المتوقعة:</span>
                                <span className="font-bold text-lg">
                                    {newPO.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toLocaleString()} ريال
                                </span>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>إلغاء</Button>
                        <Button onClick={handleSavePO} disabled={newPO.items.length === 0}>
                            {editingPO ? 'حفظ التعديلات' : 'إنشاء أمر الشراء'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Alert */}
            <AlertDialog open={deleteAlert.open} onOpenChange={(open) => setDeleteAlert({ ...deleteAlert, open })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                        <AlertDialogDescription>
                            {deleteAlert.type === 'PO'
                                ? "لا يمكن التراجع عن هذا الإجراء. سيتم حذف أمر الشراء نهائياً."
                                : `سيتم رفض ${deleteAlert.requestNames?.length || ''} طلبات وإزالتها نهائياً. هل تريد المتابعة؟`
                            }
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleConfirmDelete}>
                            نعم، حذف
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* PO Details Preview Dialog */}
            <Dialog open={!!detailsPO} onOpenChange={(open) => !open && setDetailsPO(null)}>
                <DialogContent className="max-w-4xl" dir="rtl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-xl">
                            <div className={`p-2 rounded-lg ${detailsPO?.status === 'RECEIVED' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <span>أمر شراء #{detailsPO?.id?.slice(-6).toUpperCase()}</span>
                                <Badge variant={detailsPO?.status === 'RECEIVED' ? "default" : "secondary"} className={`mr-3 ${detailsPO?.status === 'RECEIVED' ? 'bg-emerald-600' : ''}`}>
                                    {detailsPO?.status === 'RECEIVED' ? 'مستلم' : 'قيد الانتظار'}
                                </Badge>
                            </div>
                        </DialogTitle>
                        <DialogDescription>
                            {detailsPO?.notes || 'لا توجد ملاحظات'}
                        </DialogDescription>
                    </DialogHeader>

                    {detailsPO && (
                        <div className="space-y-4">
                            {/* Order Info */}
                            <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                                <div>
                                    <span className="text-sm text-muted-foreground">تاريخ الإنشاء</span>
                                    <p className="font-bold">{new Date(detailsPO.createdAt).toLocaleDateString('ar-SA')}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground">عدد الأصناف</span>
                                    <p className="font-bold">{detailsPO.items?.length || 0}</p>
                                </div>
                            </div>

                            {/* Items Table */}
                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-slate-100 dark:bg-slate-800">
                                        <tr>
                                            <th className="text-right p-3 font-semibold">الوصف</th>
                                            <th className="text-center p-3 font-semibold w-20">الكمية</th>
                                            <th className="text-center p-3 font-semibold w-28">سعر الوحدة</th>
                                            <th className="text-center p-3 font-semibold w-28">الإجمالي</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {detailsPO.items?.map((item: any, idx: number) => (
                                            <tr key={idx} className="border-t hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                <td className="p-3">{item.description}</td>
                                                <td className="p-3 text-center font-bold">{item.quantity}</td>
                                                <td className="p-3 text-center">{item.unitPrice?.toLocaleString()} ريال</td>
                                                <td className="p-3 text-center font-bold text-emerald-600">{item.totalPrice?.toLocaleString()} ريال</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-slate-100 dark:bg-slate-800 border-t-2">
                                        <tr>
                                            <td colSpan={3} className="p-3 text-left font-bold text-lg">الإجمالي الكلي</td>
                                            <td className="p-3 text-center font-bold text-xl text-emerald-600">{detailsPO.totalCost?.toLocaleString()} ريال</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {/* Actions */}
                            <DialogFooter className="gap-2">
                                <Button variant="outline" onClick={() => setDetailsPO(null)}>
                                    إغلاق
                                </Button>
                                {detailsPO.status !== 'RECEIVED' && (
                                    <>
                                        <Button variant="outline" className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => { setDetailsPO(null); openEditDialog(detailsPO); }}>
                                            <Pencil className="h-4 w-4" /> تعديل
                                        </Button>
                                        <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2" onClick={async () => { await handleReceivePO(detailsPO.id); setDetailsPO(null); }}>
                                            <Truck className="h-4 w-4" /> استلام وتحويل للمستودع
                                        </Button>
                                    </>
                                )}
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
