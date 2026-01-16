'use client'

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react'
import { getAvailableEquipment, getMyBookings, bookEquipment } from '@/app/actions/equipment'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { Laptop, Camera, Projector, Mic, Clock, CalendarDays, MapPin, ArrowRight, X } from 'lucide-react'
import PortalHeader from '@/components/portal/portal-header'
import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import Link from 'next/link'

// Types based on the Prisma schema
type Equipment = {
    id: string
    name: string
    type: string
    description: string | null
    isAvailable: boolean
    location?: { name: string } | null
}

type Booking = {
    id: string
    startDate: Date
    endDate: Date
    status: string
    purpose: string | null
    equipment: Equipment
}

export default function EquipmentPage() {
    const [equipmentList, setEquipmentList] = useState<Equipment[]>([])
    const [myBookings, setMyBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)
    const { toast } = useToast()

    const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)
    const [bookingOpen, setBookingOpen] = useState(false)
    const [bookingData, setBookingData] = useState({
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        purpose: ''
    })
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)
        const equipRes = await getAvailableEquipment()
        if (equipRes.success && equipRes.data) {
            setEquipmentList(equipRes.data as Equipment[])
        }

        const bookingRes = await getMyBookings()
        if (bookingRes.success && bookingRes.data) {
            setMyBookings(bookingRes.data as Booking[])
        }
        setLoading(false)
    }

    async function handleBook() {
        if (!selectedEquipment || !bookingData.startDate || !bookingData.startTime || !bookingData.endDate || !bookingData.endTime) {
            toast({ title: 'خطأ', description: 'يرجى ملء جميع الحقول المطلوبة', variant: 'destructive' })
            return
        }

        setSubmitting(true)

        try {
            const start = new Date(`${bookingData.startDate}T${bookingData.startTime}`)
            const end = new Date(`${bookingData.endDate}T${bookingData.endTime}`)

            if (end <= start) {
                toast({ title: 'خطأ', description: 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية', variant: 'destructive' })
                setSubmitting(false)
                return
            }

            const result = await bookEquipment({
                equipmentId: selectedEquipment.id,
                startDate: start,
                endDate: end,
                purpose: bookingData.purpose
            })

            if (result.success) {
                toast({ title: 'تم تقديم الطلب', description: 'طلب الحجز قيد المراجعة الآن' })
                setBookingOpen(false)
                setBookingData({ startDate: '', startTime: '', endDate: '', endTime: '', purpose: '' })
                loadData() // Refresh bookings
            } else {
                toast({ title: 'خطأ', description: result.error || 'فشل في الحجز', variant: 'destructive' })
            }
        } catch (error) {
            console.error(error)
            toast({ title: 'خطأ', description: 'حدث خطأ غير متوقع', variant: 'destructive' })
        } finally {
            setSubmitting(false)
        }
    }

    function getIcon(type: string) {
        switch (type.toUpperCase()) {
            case 'LAPTOP': return <Laptop className="h-10 w-10 text-blue-500" />
            case 'CAMERA': return <Camera className="h-10 w-10 text-amber-500" />
            case 'PROJECTOR': return <Projector className="h-10 w-10 text-purple-500" />
            case 'MICROPHONE': return <Mic className="h-10 w-10 text-red-500" />
            default: return <Laptop className="h-10 w-10 text-gray-500" />
        }
    }

    function getIconComponent(type: string) {
        switch (type.toUpperCase()) {
            case 'LAPTOP': return Laptop
            case 'CAMERA': return Camera
            case 'PROJECTOR': return Projector
            case 'MICROPHONE': return Mic
            default: return Laptop
        }
    }

    function getStatusBadge(status: string) {
        switch (status) {
            case 'PENDING': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">قيد الانتظار</Badge>
            case 'APPROVED': return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">معتمد</Badge>
            case 'REJECTED': return <Badge variant="destructive">مرفوض</Badge>
            case 'COMPLETED': return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">مكتمل</Badge>
            case 'CANCELLED': return <Badge variant="outline">ملغي</Badge>
            default: return <Badge variant="outline">{status}</Badge>
        }
    }

    // ... existing imports ...

    return (
        <div className="pb-20 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-500" dir="rtl">
            <div className="container mx-auto px-4">
                <PremiumPageHeader
                    title="حجز الأجهزة والمعدات"
                    description="استعرض واحجز الأجهزة المتاحة للاستخدام المؤقت (لابتوب، بروجيكتور، ملحقات...)"
                    icon={Laptop}
                    rightContent={
                        <div className="flex items-center gap-2">
                            <Link href="/portal/dashboard">
                                <Button variant="ghost" className="gap-2 text-white hover:bg-white/20">
                                    <ArrowRight className="h-4 w-4" />
                                    العودة للرئيسية
                                </Button>
                            </Link>
                            <Button onClick={loadData} variant="ghost" className="gap-2 text-white hover:bg-white/20">
                                <Clock className="h-4 w-4" />
                                تحديث
                            </Button>
                        </div>
                    }
                />

                <Tabs defaultValue="available" className="w-full">
                    <TabsList className="mb-8 w-full md:w-auto p-1 bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 rounded-xl">
                        <TabsTrigger value="available" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-sm">الأجهزة المتاحة</TabsTrigger>
                        <TabsTrigger value="my-bookings" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-sm">حجوزاتي</TabsTrigger>
                    </TabsList>

                    <TabsContent value="available" className="space-y-6">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800/50 animate-pulse" />
                                ))}
                            </div>
                        ) : equipmentList.length === 0 ? (
                            <div className="text-center py-20 bg-white/40 dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                                <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                    <Laptop className="h-8 w-8 text-slate-400" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">لا توجد أجهزة متاحة</h3>
                                <p className="text-slate-500">جميع الأجهزة محجوزة حالياً أو لا تتوفر أجهزة جديدة.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {equipmentList.map((item, index) => (
                                    <Card
                                        key={item.id}
                                        className="group border-0 shadow-lg bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full z-0 group-hover:scale-110 transition-transform" />

                                        <CardHeader className="relative z-10 flex flex-row items-start justify-between pb-2">
                                            <div className="p-3 bg-white dark:bg-slate-950 rounded-xl shadow-sm group-hover:scale-105 transition-transform duration-300">
                                                {getIcon(item.type)}
                                            </div>
                                            <Badge variant="secondary" className="bg-blue-50/80 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200/50 backdrop-blur-sm">
                                                {item.type}
                                            </Badge>
                                        </CardHeader>
                                        <CardContent className="relative z-10">
                                            <CardTitle className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">{item.name}</CardTitle>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 h-10 leading-relaxed">
                                                {item.description || 'لا يوجد وصف متاح لهذا الجهاز'}
                                            </p>
                                            {item.location && (
                                                <div className="flex items-center text-xs font-medium text-slate-500 gap-1.5 mb-2 bg-slate-100 dark:bg-slate-800/50 w-fit px-2 py-1 rounded-md">
                                                    <MapPin className="h-3.5 w-3.5 text-blue-500" />
                                                    {item.location.name}
                                                </div>
                                            )}
                                        </CardContent>
                                        <CardFooter className="relative z-10 pt-0">
                                            <Button
                                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20"
                                                onClick={() => {
                                                    setSelectedEquipment(item)
                                                    setBookingOpen(true)
                                                }}
                                            >
                                                حجز الجهاز
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="my-bookings">
                        <Card className="border-0 shadow-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
                            <CardContent className="p-0">
                                {loading ? (
                                    <div className="p-12 text-center animate-pulse">جار التحميل...</div>
                                ) : myBookings.length === 0 ? (
                                    <div className="p-16 text-center text-slate-500">
                                        <div className="w-20 h-20 mx-auto bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                            <CalendarDays className="h-10 w-10 text-slate-400" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">لا توجد حجوزات</h3>
                                        <p>لم تقم بحجز أي جهاز حتى الآن</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {myBookings.map(booking => (
                                            <div key={booking.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                                <div className="flex items-start gap-4">
                                                    <div className="p-3 bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                                                        {getIcon(booking.equipment.type)}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{booking.equipment.name}</h3>
                                                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mt-2">
                                                            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/50 px-2 py-0.5 rounded-md">
                                                                <CalendarDays className="h-3.5 w-3.5 text-blue-500" />
                                                                <span>{new Date(booking.startDate).toLocaleDateString('ar-EG')}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/50 px-2 py-0.5 rounded-md">
                                                                <Clock className="h-3.5 w-3.5 text-orange-500" />
                                                                <span dir="ltr">
                                                                    {new Date(booking.startDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                                    {' - '}
                                                                    {new Date(booking.endDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {booking.purpose && (
                                                            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                                                                <span className="font-semibold">السبب:</span> {booking.purpose}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto pl-4">
                                                    {getStatusBadge(booking.status)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
                    <DialogContent className="w-screen h-screen max-w-none m-0 p-0 rounded-none border-0 bg-slate-50 dark:bg-slate-950 overflow-y-auto" aria-describedby={undefined}>
                        <DialogTitle className="sr-only">حجز {selectedEquipment?.name || 'جهاز'}</DialogTitle>
                        <div className="min-h-full flex flex-col">
                            <div className="container mx-auto px-4 py-8 max-w-7xl flex-1 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                                <PremiumPageHeader
                                    title={`حجز ${selectedEquipment?.name || 'جهاز'}`}
                                    description="قم بتعبئة النموذج التالي لحجز الجهاز للفترة المطلوبة."
                                    icon={selectedEquipment ? getIconComponent(selectedEquipment.type) : Laptop}
                                    rightContent={
                                        <Button
                                            onClick={() => setBookingOpen(false)}
                                            variant="ghost"
                                            className="text-white hover:bg-white/20 gap-2"
                                        >
                                            <X className="h-4 w-4" />
                                            إغلاق
                                        </Button>
                                    }
                                />
                                <Card className="border-0 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                                    <CardContent className="p-8 md:p-10">
                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                            <div className="lg:col-span-4 space-y-6">
                                                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 text-center relative overflow-hidden">
                                                    <div className="absolute inset-0 bg-blue-500/5 dark:bg-blue-900/10 pointer-events-none" />
                                                    <div className="mx-auto w-24 h-24 bg-white dark:bg-slate-950 rounded-full flex items-center justify-center shadow-lg mb-4 ring-4 ring-slate-50 dark:ring-slate-800">
                                                        {selectedEquipment && getIcon(selectedEquipment.type)}
                                                    </div>
                                                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                                                        {selectedEquipment?.name}
                                                    </h3>
                                                    <div className="flex justify-center mb-4">
                                                        <Badge variant="secondary" className="bg-blue-100/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                                                            {selectedEquipment?.type}
                                                        </Badge>
                                                    </div>
                                                    {selectedEquipment?.description && (
                                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                                            {selectedEquipment.description}
                                                        </p>
                                                    )}
                                                    {selectedEquipment?.location && (
                                                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-center text-sm text-slate-500 gap-2">
                                                            <MapPin className="h-4 w-4 text-blue-500" />
                                                            {selectedEquipment.location.name}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="lg:col-span-8 space-y-8">
                                                <div>
                                                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3 mb-6">
                                                        <div className="bg-blue-600 h-8 w-1.5 rounded-full" />
                                                        تفاصيل الحجز
                                                    </h3>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                                        <div className="bg-slate-50 dark:bg-slate-800/30 p-5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-4">
                                                            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-semibold">
                                                                <CalendarDays className="h-5 w-5" />
                                                                بداية الحجز
                                                            </div>
                                                            <div className="space-y-3">
                                                                <div>
                                                                    <Label className="text-xs text-slate-500 mb-1.5 block">التاريخ</Label>
                                                                    <Input
                                                                        type="date"
                                                                        value={bookingData.startDate}
                                                                        onChange={(e) => setBookingData({ ...bookingData, startDate: e.target.value })}
                                                                        className="bg-white dark:bg-slate-950 font-sans h-11"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <Label className="text-xs text-slate-500 mb-1.5 block">الوقت</Label>
                                                                    <Input
                                                                        type="time"
                                                                        value={bookingData.startTime}
                                                                        onChange={(e) => setBookingData({ ...bookingData, startTime: e.target.value })}
                                                                        className="bg-white dark:bg-slate-950 font-sans h-11"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="bg-slate-50 dark:bg-slate-800/30 p-5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-4">
                                                            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-semibold">
                                                                <Clock className="h-5 w-5" />
                                                                نهاية الحجز
                                                            </div>
                                                            <div className="space-y-3">
                                                                <div>
                                                                    <Label className="text-xs text-slate-500 mb-1.5 block">التاريخ</Label>
                                                                    <Input
                                                                        type="date"
                                                                        value={bookingData.endDate}
                                                                        onChange={(e) => setBookingData({ ...bookingData, endDate: e.target.value })}
                                                                        className="bg-white dark:bg-slate-950 font-sans h-11"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <Label className="text-xs text-slate-500 mb-1.5 block">الوقت</Label>
                                                                    <Input
                                                                        type="time"
                                                                        value={bookingData.endTime}
                                                                        onChange={(e) => setBookingData({ ...bookingData, endTime: e.target.value })}
                                                                        className="bg-white dark:bg-slate-950 font-sans h-11"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <Label className="text-lg font-semibold block">الغرض من الاستخدام</Label>
                                                        <Textarea
                                                            placeholder="اكتب هنا تفاصيل أسباب طلب الجهاز..."
                                                            value={bookingData.purpose}
                                                            onChange={(e) => setBookingData({ ...bookingData, purpose: e.target.value })}
                                                            className="resize-none bg-slate-50 dark:bg-slate-950 min-h-[120px] text-base p-4"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-4">
                                                    <Button variant="outline" size="lg" onClick={() => setBookingOpen(false)} className="h-12 px-8 text-base">
                                                        إلغاء
                                                    </Button>
                                                    <Button
                                                        onClick={handleBook}
                                                        disabled={submitting}
                                                        size="lg"
                                                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white h-12 px-12 text-base shadow-lg shadow-blue-500/20"
                                                    >
                                                        {submitting ? 'جاري الحجز...' : 'تأكيد الحجز'}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}

