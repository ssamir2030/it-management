'use client'

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Search, AlertTriangle, ArrowUpCircle, ArrowDownCircle, History, Package, Save, ArrowRight, Trash2 } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import { createConsumable, getConsumables, updateStock, getConsumableTransactions, deleteConsumable } from '@/app/actions/inventory'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { format } from 'date-fns'
import { Textarea } from '@/components/ui/textarea'
import { PremiumPageHeader } from "@/components/ui/premium-page-header"

// Types
type ConsumableItem = {
    id: string
    name: string
    category: { name: string } | null
    currentStock: number
    minStock: number
    unit: string
    updatedAt: Date
}

type Transaction = {
    id: string
    type: string
    quantity: number
    notes: string | null
    createdAt: Date
}

const CATEGORIES = ["INK", "PAPER", "ACCESSORY", "OTHER"]

export default function InventoryPage() {
    const { toast } = useToast()
    const [items, setItems] = useState<ConsumableItem[]>([])
    const [loading, setLoading] = useState(true)
    const [viewMode, setViewMode] = useState<'LIST' | 'ADD'>('LIST')

    // Search & Filter
    const [searchQuery, setSearchQuery] = useState("")
    const [categoryFilter, setCategoryFilter] = useState("ALL")

    // Dialog States
    const [isStockOpen, setIsStockOpen] = useState(false)
    const [isHistoryOpen, setIsHistoryOpen] = useState(false)
    const [deleteAlert, setDeleteAlert] = useState<{ open: boolean, item: ConsumableItem | null }>({ open: false, item: null })

    // Selection & Forms
    const [selectedItem, setSelectedItem] = useState<ConsumableItem | null>(null)
    const [stockForm, setStockForm] = useState({ type: 'IN' as 'IN' | 'OUT', quantity: 1, notes: '' })

    // Add Item Form
    const [newItemForm, setNewItemForm] = useState({
        name: '',
        category: 'INK',
        minStock: 5,
        unit: 'Piece',
        description: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [history, setHistory] = useState<Transaction[]>([])

    const fetchItems = async () => {
        setLoading(true)
        const res = await getConsumables(searchQuery, categoryFilter)
        if (res.success && res.items) {
            // Map the response to our type
            const mapped = res.items.map((item: any) => ({
                id: item.id,
                name: item.name,
                category: item.category,
                currentStock: item.quantity,
                minStock: item.minQuantity,
                unit: item.unit || 'Piece',
                updatedAt: item.updatedAt
            }))
            setItems(mapped)
        } else {
            toast({ title: "Error", description: "Failed to load inventory", variant: "destructive" })
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchItems()
    }, [searchQuery, categoryFilter])

    const handleCreate = async () => {
        if (!newItemForm.name) {
            toast({ title: "تنبيه", description: "يرجى كتابة اسم الصنف", variant: "destructive" })
            return
        }

        setIsSubmitting(true)
        const res = await createConsumable(newItemForm)
        setIsSubmitting(false)

        if (res.success) {
            toast({ title: "تم الحفظ", description: "تم إضافة الصنف الجديد بنجاح" })
            setNewItemForm({ name: '', category: 'INK', minStock: 5, unit: 'Piece', description: '' })
            setViewMode('LIST')
            fetchItems()
        } else {
            toast({ title: "خطأ", description: res.error, variant: "destructive" })
        }
    }

    const openStockDialog = (item: ConsumableItem) => {
        setSelectedItem(item)
        setStockForm({ type: 'IN', quantity: 1, notes: '' })
        setIsStockOpen(true)
    }

    const handleStockUpdate = async () => {
        if (!selectedItem) return

        const res = await updateStock(selectedItem.id, stockForm.quantity, stockForm.type, stockForm.notes)
        if (res.success) {
            toast({ title: "تم التحديث", description: "تم تحديث الرصيد بنجاح" })
            setIsStockOpen(false)
            fetchItems()
        } else {
            toast({ title: "خطأ", description: res.error, variant: "destructive" })
        }
    }

    const openHistory = async (item: ConsumableItem) => {
        setSelectedItem(item)
        setIsHistoryOpen(true)
        const res = await getConsumableTransactions(item.id)
        if (res.success && res.transactions) {
            setHistory(res.transactions)
        }
    }

    const confirmDelete = (item: ConsumableItem) => {
        setDeleteAlert({ open: true, item })
    }

    const handleDelete = async () => {
        if (!deleteAlert.item) return
        const res = await deleteConsumable(deleteAlert.item.id)
        if (res.success) {
            toast({ title: "تم الحذف", description: "تم حذف الصنف بنجاح" })
            fetchItems()
        } else {
            toast({ title: "خطأ", description: res.error, variant: "destructive" })
        }
        setDeleteAlert({ open: false, item: null })
    }

    // View: Add New Item
    if (viewMode === 'ADD') {
        return (
            <div className="container mx-auto p-6 space-y-6" dir="rtl">
                <PremiumPageHeader
                    title="إضافة صنف جديد"
                    description="تعريف صنف جديد (حبر، ورق، جهاز..) لإضافته للمخزون"
                    icon={Save}
                    rightContent={
                        <Button variant="ghost" className="gap-2" onClick={() => setViewMode('LIST')}>
                            <ArrowRight className="h-4 w-4" />
                            العودة للقائمة
                        </Button>
                    }
                />

                <Card>
                    <CardHeader>
                        <CardTitle className="text-right">بيانات الصنف</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-right block">اسم الصنف</Label>
                                <Input
                                    value={newItemForm.name}
                                    onChange={e => setNewItemForm({ ...newItemForm, name: e.target.value })}
                                    placeholder="مثال: HP 85A Toner Black"
                                    className="text-right"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-right block">التصنيف</Label>
                                <Select
                                    value={newItemForm.category}
                                    onValueChange={v => setNewItemForm({ ...newItemForm, category: v })}
                                >
                                    <SelectTrigger className="text-right" dir="rtl"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-right block">الوحدة (Unit)</Label>
                                <Input
                                    value={newItemForm.unit}
                                    onChange={e => setNewItemForm({ ...newItemForm, unit: e.target.value })}
                                    placeholder="مثال: Piece, Box, Pack"
                                    className="text-right"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-right block">حد الطلب (Minimum Stock)</Label>
                                <Input
                                    type="number"
                                    value={newItemForm.minStock}
                                    onChange={e => setNewItemForm({ ...newItemForm, minStock: parseInt(e.target.value) })}
                                    className="text-right"
                                />
                                <p className="text-xs text-muted-foreground">سيظهر تنبيه عندما يقل الرصيد عن هذا الرقم</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-right block">وصف إضافي (اختياري)</Label>
                            <Textarea
                                value={newItemForm.description}
                                onChange={e => setNewItemForm({ ...newItemForm, description: e.target.value })}
                                placeholder="تفاصيل إضافية عن الصنف..."
                                className="text-right min-h-[100px]"
                            />
                        </div>

                        <div className="flex justify-end gap-4 pt-4 border-t">
                            <Button variant="outline" onClick={() => setViewMode('LIST')} className="w-24">إلغاء</Button>
                            <Button onClick={handleCreate} disabled={isSubmitting} className="min-w-[120px] gap-2 bg-blue-600 hover:bg-blue-700">
                                <Plus className="h-4 w-4" />
                                {isSubmitting ? 'جاري الحفظ...' : 'حفظ الصنف'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // View: List
    return (
        <div className="container mx-auto p-6 space-y-6" dir="rtl">
            <PremiumPageHeader
                title="إدارة المخزون (Consumables)"
                description="تتبع الأحبار، الأوراق، والملحقات وإدارة الكميات المتوفرة"
                icon={Package}
                rightContent={
                    <Button onClick={() => setViewMode('ADD')} className="gap-2 bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4" />
                        إضافة صنف جديد
                    </Button>
                }
            />

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                className="pr-9"
                                placeholder="بحث بالاسم..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="التصنيف" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">الكل</SelectItem>
                                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-right">اسم الصنف</TableHead>
                                <TableHead className="text-right">التصنيف</TableHead>
                                <TableHead className="text-center">الرصيد الحالي</TableHead>
                                <TableHead className="text-center">الحالة</TableHead>
                                <TableHead className="text-left">تعديل الرصيد</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span>{item.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{item.category?.name || 'غير محدد'}</Badge>
                                    </TableCell>
                                    <TableCell className="text-center font-bold text-lg">
                                        {item.currentStock} <span className="text-xs font-normal text-muted-foreground">{item.unit}</span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {item.currentStock <= item.minStock ? (
                                            <Badge variant="destructive" className="gap-1">
                                                <AlertTriangle className="h-3 w-3" /> منخفض
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">متوفر</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-left">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => openHistory(item)} title="سجل الحركات">
                                                <History className="h-4 w-4" />
                                            </Button>
                                            <Link href={`/admin/inventory/adjust?id=${item.id}&name=${encodeURIComponent(item.name)}&stock=${item.currentStock}&unit=${item.unit}&min=${item.minStock}`}>
                                                <Button size="sm" variant="outline">
                                                    تعديل
                                                </Button>
                                            </Link>
                                            <Button size="icon" variant="outline" className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50" onClick={() => confirmDelete(item)} title="حذف الصنف">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!loading && items.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                        لا توجد أصناف. قم بإضافة صنف جديد.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Stock Update Dialog */}
            <Dialog open={isStockOpen} onOpenChange={setIsStockOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>تعديل الرصيد: {selectedItem?.name}</DialogTitle>
                        <DialogDescription>
                            الرصيد الحالي: {selectedItem?.currentStock} {selectedItem?.unit}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div
                                onClick={() => setStockForm({ ...stockForm, type: 'IN' })}
                                className={`cursor-pointer rounded-lg border p-4 flex flex-col items-center gap-2 ${stockForm.type === 'IN' ? 'bg-green-50 border-green-500' : 'hover:bg-slate-50'}`}
                            >
                                <ArrowUpCircle className={`h-8 w-8 ${stockForm.type === 'IN' ? 'text-green-600' : 'text-slate-400'}`} />
                                <span className="font-bold">إضافة (وارد)</span>
                            </div>
                            <div
                                onClick={() => setStockForm({ ...stockForm, type: 'OUT' })}
                                className={`cursor-pointer rounded-lg border p-4 flex flex-col items-center gap-2 ${stockForm.type === 'OUT' ? 'bg-red-50 border-red-500' : 'hover:bg-slate-50'}`}
                            >
                                <ArrowDownCircle className={`h-8 w-8 ${stockForm.type === 'OUT' ? 'text-red-600' : 'text-slate-400'}`} />
                                <span className="font-bold">خصم (صادر)</span>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>الكمية</Label>
                            <Input
                                type="number"
                                min="1"
                                value={stockForm.quantity}
                                onChange={e => setStockForm({ ...stockForm, quantity: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>ملاحظات (اختياري)</Label>
                            <Input
                                placeholder="سبب الإضافة/الخصم..."
                                value={stockForm.notes}
                                onChange={e => setStockForm({ ...stockForm, notes: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleStockUpdate}>تحديث الرصيد</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* History Dialog */}
            <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>سجل حركات الصنف: {selectedItem?.name}</DialogTitle>
                        <DialogDescription>عرض آخر العمليات التي تمت على هذا الصنف.</DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[60vh] overflow-y-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>التاريخ</TableHead>
                                    <TableHead>العملية</TableHead>
                                    <TableHead>الكمية</TableHead>
                                    <TableHead>الملاحظات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {history.map((tx) => (
                                    <TableRow key={tx.id}>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {format(new Date(tx.createdAt), 'dd/MM/yyyy HH:mm')}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={tx.type === 'IN' ? 'default' : 'destructive'} className="text-xs">
                                                {tx.type === 'IN' ? 'وارد' : 'صادر'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-mono font-bold">{tx.quantity}</TableCell>
                                        <TableCell className="text-sm">{tx.notes}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Alert */}
            <AlertDialog open={deleteAlert.open} onOpenChange={(open) => setDeleteAlert({ ...deleteAlert, open })}>
                <AlertDialogContent dir="rtl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                        <AlertDialogDescription>
                            هل أنت متأكد من حذف الصنف "{deleteAlert.item?.name}"؟ سيتم حذف جميع سجلات الحركات المرتبطة به. لا يمكن التراجع عن هذا الإجراء.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>
                            حذف
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
