'use client'

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react'
import { getAllEquipment, addEquipment, updateEquipment, deleteEquipment, getAllBookings, processBooking } from '@/app/actions/equipment'
import { getLocations } from '@/app/actions/locations'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { Laptop, Plus, Check, X, Undo, ArrowRight, Save, Pencil, Trash2 } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { PremiumPageHeader } from "@/components/ui/premium-page-header"

export default function AdminEquipmentPage() {
    // UI State
    const [viewMode, setViewMode] = useState<'LIST' | 'ADD'>('LIST')
    const [loading, setLoading] = useState(true)
    const { toast } = useToast()

    // Data State
    const [equipment, setEquipment] = useState<any[]>([])
    const [bookings, setBookings] = useState<any[]>([])
    const [locations, setLocations] = useState<any[]>([])

    // Add/Edit Equipment State
    const [newEquipment, setNewEquipment] = useState({
        name: '',
        type: 'LAPTOP',
        description: '',
        locationId: ''
    })
    const [editingId, setEditingId] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Delete State
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [itemToDelete, setItemToDelete] = useState<any>(null)

    // Process Booking State
    const [processDialogOpen, setProcessDialogOpen] = useState(false)
    const [selectedBooking, setSelectedBooking] = useState<any>(null)
    const [processAction, setProcessAction] = useState<'APPROVED' | 'REJECTED' | 'RETURNED'>('APPROVED')
    const [processNote, setProcessNote] = useState('')

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)
        const [equipRes, bookingRes, locRes] = await Promise.all([
            getAllEquipment(),
            getAllBookings(),
            getLocations()
        ])

        if (equipRes.success && equipRes.data) {
            setEquipment(equipRes.data)
        }
        if (bookingRes.success && bookingRes.data) {
            setBookings(bookingRes.data)
        }
        if (locRes.success && locRes.data) {
            setLocations(locRes.data)
        }
        setLoading(false)
    }

    async function handleAddOrUpdateEquipment() {
        if (!newEquipment.name) {
            toast({ title: 'خطأ', description: 'يرجى إدخال اسم الجهاز', variant: 'destructive' })
            return
        }

        setIsSubmitting(true)
        let result

        if (editingId) {
            result = await updateEquipment(editingId, newEquipment)
        } else {
            result = await addEquipment(newEquipment)
        }

        setIsSubmitting(false)

        if (result.success) {
            toast({ title: editingId ? 'تم التحديث' : 'تمت الإضافة', description: editingId ? 'تم تحديث بيانات الجهاز بنجاح' : 'تم إضافة الجهاز بنجاح' })
            setViewMode('LIST')
            setNewEquipment({ name: '', type: 'LAPTOP', description: '', locationId: '' })
            setEditingId(null)
            loadData()
        } else {
            toast({ title: 'خطأ', description: result.error || 'فشل حفظ الجهاز', variant: 'destructive' })
        }
    }

    function handleEdit(item: any) {
        setNewEquipment({
            name: item.name,
            type: item.type,
            description: item.description || '',
            locationId: item.locationId || ''
        })
        setEditingId(item.id)
        setViewMode('ADD')
    }

    function openDeleteDialog(item: any) {
        setItemToDelete(item)
        setDeleteDialogOpen(true)
    }

    async function handleConfirmDelete() {
        if (!itemToDelete) return

        setIsSubmitting(true)
        const result = await deleteEquipment(itemToDelete.id)
        setIsSubmitting(false)
        setDeleteDialogOpen(false)

        if (result.success) {
            toast({ title: 'تم الحذف', description: 'تم حذف الجهاز بنجاح' })
            loadData()
        } else {
            toast({ title: 'خطأ', description: result.error || 'فشل حذف الجهاز', variant: 'destructive' })
        }
        setItemToDelete(null)
    }

    async function handleProcessBooking() {
        if (!selectedBooking) return

        setIsSubmitting(true)
        const result = await processBooking(selectedBooking.id, processAction, processNote)
        setIsSubmitting(false)

        if (result.success) {
            toast({ title: 'تم التحديث', description: 'تم تحديث حالة الحجز بنجاح' })
            setProcessDialogOpen(false)
            setSelectedBooking(null)
            setProcessNote('')
            loadData()
        } else {
            toast({ title: 'خطأ', description: 'فشل تحديث الحالة', variant: 'destructive' })
        }
    }

    function openProcessDialog(booking: any, action: 'APPROVED' | 'REJECTED' | 'RETURNED') {
        setSelectedBooking(booking)
        setProcessAction(action)
        setProcessNote('')
        setProcessDialogOpen(true)
    }

    function getStatusBadge(status: string) {
        switch (status) {
            case 'PENDING': return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">قيد الانتظار</Badge>
            case 'APPROVED': return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">مقبول</Badge>
            case 'REJECTED': return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">مرفوض</Badge>
            case 'RETURNED': return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">تم الإرجاع</Badge>
            default: return <Badge variant="outline">{status}</Badge>
        }
    }

    if (viewMode === 'ADD') {
        return (
            <div className="w-full p-6" dir="rtl">
                <div className="mb-6">
                    <PremiumPageHeader
                        title={editingId ? "تعديل بيانات الجهاز" : "إضافة جهاز جديد"}
                        description={editingId ? "تعديل تفاصيل الجهاز الموجود" : "أدخل بيانات الجهاز الجديد لإضافته للمخزون"}
                        icon={editingId ? Pencil : Save}
                        rightContent={
                            <Button variant="ghost" className="gap-2 text-white hover:bg-white/20" onClick={() => {
                                setViewMode('LIST')
                                setNewEquipment({ name: '', type: 'LAPTOP', description: '', locationId: '' })
                                setEditingId(null)
                            }}>
                                <ArrowRight className="h-4 w-4" />
                                العودة
                            </Button>
                        }
                    />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-right">معلومات الجهاز</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-right block">اسم الجهاز</Label>
                                <Input
                                    value={newEquipment.name}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })}
                                    placeholder="مثال: لابتوب Dell Latitude 5420"
                                    className="text-right"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-right block">النوع</Label>
                                <Select
                                    value={newEquipment.type}
                                    onValueChange={(val) => setNewEquipment({ ...newEquipment, type: val })}
                                >
                                    <SelectTrigger className="text-right" dir="rtl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="LAPTOP">لابتوب (Laptop)</SelectItem>
                                        <SelectItem value="CAMERA">كاميرا (Camera)</SelectItem>
                                        <SelectItem value="PROJECTOR">بروجيكتور (Projector)</SelectItem>
                                        <SelectItem value="MICROPHONE">ميكروفون (Microphone)</SelectItem>
                                        <SelectItem value="TABLET">تابلت (Tablet)</SelectItem>
                                        <SelectItem value="OTHER">أخرى</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-right block">الموقع (اختياري)</Label>
                            <Select
                                value={newEquipment.locationId}
                                onValueChange={(val) => setNewEquipment({ ...newEquipment, locationId: val })}
                            >
                                <SelectTrigger className="text-right" dir="rtl">
                                    <SelectValue placeholder="اختر الموقع" />
                                </SelectTrigger>
                                <SelectContent>
                                    {locations.map(loc => (
                                        <SelectItem key={loc.id} value={loc.id}>
                                            {loc.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>


                        <div className="space-y-2">
                            <Label className="text-right block">الوصف</Label>
                            <Textarea
                                value={newEquipment.description}
                                onChange={(e) => setNewEquipment({ ...newEquipment, description: e.target.value })}
                                placeholder="مواصفات الجهاز أو ملاحظات إضافية"
                                className="text-right h-32"
                            />
                        </div>

                        <div className="flex justify-end gap-4 pt-4 border-t">
                            <Button variant="outline" onClick={() => setViewMode('LIST')} className="w-24">إلغاء</Button>
                            <Button onClick={handleAddOrUpdateEquipment} disabled={isSubmitting} className="min-w-[120px] gap-2">
                                <Save className="h-4 w-4" />
                                {isSubmitting ? 'جاري الحفظ...' : (editingId ? 'تحديث الجهاز' : 'حفظ الجهاز')}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 space-y-6" dir="rtl">
            <PremiumPageHeader
                title="إدارة الأجهزة"
                description="إدارة المخزون وطلبات الحجز المؤقت"
                icon={Laptop}
                rightContent={
                    <Button onClick={() => {
                        setNewEquipment({ name: '', type: 'LAPTOP', description: '', locationId: '' })
                        setEditingId(null)
                        setViewMode('ADD')
                    }} className="gap-2">
                        <Plus className="h-4 w-4" />
                        إضافة جهاز
                    </Button>
                }
            />

            <Tabs defaultValue="inventory" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="inventory">المخزون</TabsTrigger>
                    <TabsTrigger value="bookings">طلبات الحجز</TabsTrigger>
                </TabsList>

                <TabsContent value="inventory" className="mt-6">
                    <Card>
                        <CardHeader className="text-right">
                            <CardTitle>قائمة الأجهزة</CardTitle>
                            <CardDescription>عرض وإدارة الأجهزة المتاحة للحجز</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>اسم الجهاز</TableHead>
                                        <TableHead>النوع</TableHead>
                                        <TableHead>الموقع</TableHead>
                                        <TableHead>الحالة</TableHead>
                                        <TableHead>عدد الحجوزات</TableHead>
                                        <TableHead>الإجراءات</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8">جار التحميل...</TableCell>
                                        </TableRow>
                                    ) : equipment.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">لا توجد أجهزة مضافة</TableCell>
                                        </TableRow>
                                    ) : (
                                        equipment.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <Laptop className="h-4 w-4 text-muted-foreground" />
                                                        {item.name}
                                                    </div>
                                                </TableCell>
                                                <TableCell><Badge variant="secondary">{item.type}</Badge></TableCell>
                                                <TableCell>{item.location?.name || '-'}</TableCell>
                                                <TableCell>
                                                    {item.isAvailable ? (
                                                        <Badge className="bg-green-500 hover:bg-green-600">متاح</Badge>
                                                    ) : (
                                                        <Badge variant="destructive">غير متاح</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>{item._count?.bookings || 0}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                            onClick={() => handleEdit(item)}
                                                            title="تعديل"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => openDeleteDialog(item)}
                                                            title="حذف"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="bookings" className="mt-6">
                    <Card>
                        <CardHeader className="text-right">
                            <CardTitle>سجل الحجوزات</CardTitle>
                            <CardDescription>متابعة ومعالجة طلبات حجز الأجهزة</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>الموظف</TableHead>
                                        <TableHead>الجهاز</TableHead>
                                        <TableHead>الفترة</TableHead>
                                        <TableHead>الغرض</TableHead>
                                        <TableHead>الحالة</TableHead>
                                        <TableHead>الإجراءات</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8">جار التحميل...</TableCell>
                                        </TableRow>
                                    ) : bookings.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">لا توجد طلبات حجز</TableCell>
                                        </TableRow>
                                    ) : (
                                        bookings.map((booking) => (
                                            <TableRow key={booking.id}>
                                                <TableCell>
                                                    <div className="font-medium">{booking.employee?.name}</div>
                                                    <div className="text-xs text-muted-foreground">{booking.employee?.department?.name}</div>
                                                </TableCell>
                                                <TableCell>{booking.equipment?.name}</TableCell>
                                                <TableCell>
                                                    <div className="text-xs">
                                                        من: {new Date(booking.startDate).toLocaleDateString('ar-EG')}
                                                        <br />
                                                        إلى: {new Date(booking.endDate).toLocaleDateString('ar-EG')}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="max-w-[200px] truncate" title={booking.purpose || ''}>
                                                    {booking.purpose || '-'}
                                                </TableCell>
                                                <TableCell>{getStatusBadge(booking.status)}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center justify-start gap-2">
                                                        {booking.status === 'PENDING' && (
                                                            <>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                                    onClick={() => openProcessDialog(booking, 'APPROVED')}
                                                                    title="قبول"
                                                                >
                                                                    <Check className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                    onClick={() => openProcessDialog(booking, 'REJECTED')}
                                                                    title="رفض"
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </>
                                                        )}
                                                        {booking.status === 'APPROVED' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                                onClick={() => openProcessDialog(booking, 'RETURNED')}
                                                                title="تسجيل الإرجاع"
                                                            >
                                                                <Undo className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Process Booking Dialog */}
            <Dialog open={processDialogOpen} onOpenChange={setProcessDialogOpen}>
                <DialogContent>
                    <DialogHeader className="text-right">
                        <DialogTitle>
                            {processAction === 'APPROVED' && 'قبول طلب الحجز'}
                            {processAction === 'REJECTED' && 'رفض طلب الحجز'}
                            {processAction === 'RETURNED' && 'تأكيد إرجاع الجهاز'}
                        </DialogTitle>
                        <DialogDescription>
                            {processAction === 'APPROVED' && 'هل أنت متأكد من قبول هذا الطلب؟ سيتم إشعار الموظف.'}
                            {processAction === 'REJECTED' && 'يرجى ذكر سبب الرفض (اختياري).'}
                            {processAction === 'RETURNED' && 'تأكيد استلام الجهاز من الموظف وإعادته للمخزون.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label className="text-right">ملاحظات (اختياري)</Label>
                            <Textarea
                                value={processNote}
                                onChange={(e) => setProcessNote(e.target.value)}
                                placeholder="أضف ملاحظات للإشعار..."
                                className="text-right"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setProcessDialogOpen(false)}>إلغاء</Button>
                        <Button
                            onClick={handleProcessBooking}
                            disabled={isSubmitting}
                            variant={processAction === 'REJECTED' ? 'destructive' : 'default'}
                        >
                            {isSubmitting ? 'جاري المعالجة...' : 'تأكيد'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader className="text-right">
                        <DialogTitle>حذف الجهاز</DialogTitle>
                        <DialogDescription>
                            هل أنت متأكد من رغبتك في حذف هذا الجهاز؟ لا يمكن التراجع عن هذا الإجراء.
                            <br />
                            <span className="font-semibold text-red-600">ملاحظة:</span> لا يمكن حذف الأجهزة التي عليها حجوزات نشطة.
                        </DialogDescription>
                    </DialogHeader>
                    {itemToDelete && (
                        <div className="py-4 text-right">
                            <p className="font-medium text-sm text-gray-700">الجهاز: {itemToDelete.name}</p>
                            <p className="text-sm text-gray-500">النوع: {itemToDelete.type}</p>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>إلغاء</Button>
                        <Button
                            onClick={handleConfirmDelete}
                            disabled={isSubmitting}
                            variant="destructive"
                        >
                            {isSubmitting ? 'جاري الحذف...' : 'تأكيد الحذف'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
