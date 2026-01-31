'use client'


import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Calendar, Clock, Users, ArrowRight, Video, MapPin, Loader2, Plus, X, CheckCircle2, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { getMeetingRooms, createRoomBooking, checkRoomAvailability } from '@/app/actions/room-bookings'
import { PremiumPageHeader } from '@/components/ui/premium-page-header'

export default function NewBookingPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const preselectedRoomId = searchParams.get('roomId')

    const [rooms, setRooms] = useState<any[]>([])
    const [selectedRoom, setSelectedRoom] = useState(preselectedRoomId || '')
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [date, setDate] = useState('')
    const [startTime, setStartTime] = useState('')
    const [endTime, setEndTime] = useState('')
    const [meetingType, setMeetingType] = useState<'PHYSICAL' | 'ONLINE' | 'HYBRID'>('PHYSICAL')

    const [attendees, setAttendees] = useState<string[]>([])
    const [newAttendee, setNewAttendee] = useState('')
    const [notes, setNotes] = useState('')
    const [loading, setLoading] = useState(false)
    const [checkingAvailability, setCheckingAvailability] = useState(false)
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null)

    useEffect(() => {
        loadRooms()
    }, [])

    useEffect(() => {
        // التحقق من التوفر عند تغيير الأوقات أو القاعة
        if (selectedRoom && date && startTime && endTime) {
            checkAvailability()
        }
    }, [selectedRoom, date, startTime, endTime])

    async function loadRooms() {
        const result = await getMeetingRooms()
        if (result.success) {
            setRooms(result.data || [])
        }
    }

    async function checkAvailability() {
        if (!selectedRoom || !date || !startTime || !endTime) return

        setCheckingAvailability(true)

        const startDateTime = new Date(`${date}T${startTime}`)
        const endDateTime = new Date(`${date}T${endTime}`)

        if (endDateTime <= startDateTime) {
            setIsAvailable(false)
            setCheckingAvailability(false)
            return
        }

        const result = await checkRoomAvailability(selectedRoom, startDateTime, endDateTime)

        if (result.success) {
            setIsAvailable(result.isAvailable ?? null)
        }

        setCheckingAvailability(false)
    }

    function addAttendee() {
        if (newAttendee.trim() && !attendees.includes(newAttendee.trim())) {
            setAttendees([...attendees, newAttendee.trim()])
            setNewAttendee('')
        }
    }

    function removeAttendee(index: number) {
        setAttendees(attendees.filter((_, i) => i !== index))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (!selectedRoom || !title || !date || !startTime || !endTime) {
            toast.error('الرجاء ملء جميع الحقول المطلوبة')
            return
        }

        if (isAvailable === false) {
            toast.error('القاعة غير متاحة في هذا الوقت')
            return
        }

        const startDateTime = new Date(`${date}T${startTime}`)
        const endDateTime = new Date(`${date}T${endTime}`)

        if (endDateTime <= startDateTime) {
            toast.error('وقت النهاية يجب أن يكون بعد وقت البداية')
            return
        }

        if (startDateTime < new Date()) {
            toast.error('لا يمكن الحجز في الماضي')
            return
        }

        setLoading(true)

        const result = await createRoomBooking({
            roomId: selectedRoom,
            title,
            description,
            startTime: startDateTime,
            endTime: endDateTime,
            meetingType,
            attendees: attendees.length > 0 ? attendees : undefined,
            notes
        })

        if (result.success) {
            toast.success('تم إنشاء الحجز بنجاح!')
            router.push('/portal/bookings/my')
        } else {
            toast.error(result.error || 'فشل في إنشاء الحجز')
        }

        setLoading(false)
    }

    const room = rooms.find(r => r.id === selectedRoom)

    // تعيين الحد الأدنى للتاريخ (اليوم)
    const today = new Date().toISOString().split('T')[0]

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-slate-900" dir="rtl">
            <div className="container mx-auto px-4 py-8 animate-fade-in">
                <PremiumPageHeader
                    title="حجز قاعة اجتماعات"
                    description="املأ التفاصيل لإنشاء حجز جديد"
                    icon={Calendar}
                    rightContent={
                        <Button
                            variant="ghost"
                            onClick={() => router.back()}
                            className="gap-2 text-white hover:bg-white/20"
                        >
                            <ArrowRight className="h-4 w-4" />
                            العودة للرئيسية
                        </Button>
                    }
                />

                <form onSubmit={handleSubmit} className="w-full animate-slide-up stagger-1">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* نموذج الحجز */}
                        <div className={`${room ? 'lg:col-span-8 xl:col-span-9' : 'lg:col-span-12'} space-y-6 transition-all duration-300`}>
                            {/* اختيار القاعة */}
                            <Card className="card-elevated border-t-4 border-t-blue-500/20">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <div className="rounded-lg bg-blue-500/10 p-2.5">
                                            <MapPin className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <span className="text-xl font-bold">اختر القاعة</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                                        <SelectTrigger className="h-12 text-base">
                                            <SelectValue placeholder="اختر القاعة..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {rooms.filter(r => r.isActive && r.isAvailable).map((room) => (
                                                <SelectItem key={room.id} value={room.id}>
                                                    <div className="flex items-center justify-between w-full min-w-[300px]">
                                                        <span className="font-medium">{room.name}</span>
                                                        <span className="text-xs text-muted-foreground mr-2">
                                                            ({room.capacity} شخص - {room.location})
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </CardContent>
                            </Card>

                            {/* تفاصيل الاجتماع */}
                            <Card className="card-elevated border-t-4 border-t-indigo-500/20">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <div className="rounded-lg bg-indigo-500/10 p-2.5">
                                            <Users className="h-5 w-5 text-indigo-600" />
                                        </div>
                                        <span className="text-xl font-bold">تفاصيل الاجتماع</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="title" className="text-base font-medium">عنوان الاجتماع <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="title"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="مثال: اجتماع فريق التطوير"
                                            className="h-12 text-base mt-2"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="description" className="text-base font-medium">الوصف (اختياري)</Label>
                                        <Textarea
                                            id="description"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="وصف موجز للاجتماع..."
                                            rows={3}
                                            className="mt-2 resize-none"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* التاريخ والوقت */}
                            <Card className="card-elevated border-t-4 border-t-emerald-500/20">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <div className="rounded-lg bg-emerald-500/10 p-2.5">
                                            <Clock className="h-5 w-5 text-emerald-600" />
                                        </div>
                                        <span className="text-xl font-bold">التاريخ والوقت</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="date" className="text-base font-medium">التاريخ <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="date"
                                            type="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            min={today}
                                            className="h-12 text-base mt-2"
                                            required
                                        />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="startTime" className="text-base font-medium">من <span className="text-red-500">*</span></Label>
                                            <Input
                                                id="startTime"
                                                type="time"
                                                value={startTime}
                                                onChange={(e) => setStartTime(e.target.value)}
                                                className="h-12 text-base mt-2"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="endTime" className="text-base font-medium">إلى <span className="text-red-500">*</span></Label>
                                            <Input
                                                id="endTime"
                                                type="time"
                                                value={endTime}
                                                onChange={(e) => setEndTime(e.target.value)}
                                                className="h-12 text-base mt-2"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* مؤشر التوفر */}
                                    {selectedRoom && date && startTime && endTime && (
                                        <div className={`p-4 rounded-lg border flex items-center gap-3 animate-in fade-in zoom-in-95 duration-300 ${isAvailable ? 'bg-green-50 border-green-200 text-green-800' : isAvailable === false ? 'bg-red-50 border-red-200 text-red-800' : 'bg-gray-50 border-gray-200'}`}>
                                            {checkingAvailability ? (
                                                <>
                                                    <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                                                    <span className="text-gray-600 font-medium">جاري التحقق من التوفر...</span>
                                                </>
                                            ) : isAvailable === true ? (
                                                <>
                                                    <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                    </div>
                                                    <span className="font-bold">القاعة متاحة في هذا الوقت</span>
                                                </>
                                            ) : isAvailable === false ? (
                                                <>
                                                    <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center">
                                                        <X className="h-4 w-4 text-red-600" />
                                                    </div>
                                                    <span className="font-bold">القاعة محجوزة في هذا الوقت</span>
                                                </>
                                            ) : null}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* نوع الاجتماع */}
                            <Card className="card-elevated border-t-4 border-t-purple-500/20">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <div className="rounded-lg bg-purple-500/10 p-2.5">
                                            <Video className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <span className="text-xl font-bold">نوع الاجتماع</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid md:grid-cols-3 gap-4">
                                        <Button
                                            type="button"
                                            variant={meetingType === 'PHYSICAL' ? 'default' : 'outline'}
                                            onClick={() => setMeetingType('PHYSICAL')}
                                            className={`h-auto py-6 flex flex-col gap-2 transition-all ${meetingType === 'PHYSICAL' ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                                        >
                                            <MapPin className="h-8 w-8 mb-1" />
                                            <div className="font-bold text-lg">حضوري</div>
                                            <div className="text-xs opacity-80 font-normal">في القاعة</div>
                                        </Button>

                                        <Button
                                            type="button"
                                            variant={meetingType === 'ONLINE' ? 'default' : 'outline'}
                                            onClick={() => setMeetingType('ONLINE')}
                                            className={`h-auto py-6 flex flex-col gap-2 transition-all ${meetingType === 'ONLINE' ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                                        >
                                            <Video className="h-8 w-8 mb-1" />
                                            <div className="font-bold text-lg">أونلاين</div>
                                            <div className="text-xs opacity-80 font-normal">عن بُعد</div>
                                        </Button>

                                        <Button
                                            type="button"
                                            variant={meetingType === 'HYBRID' ? 'default' : 'outline'}
                                            onClick={() => setMeetingType('HYBRID')}
                                            className={`h-auto py-6 flex flex-col gap-2 transition-all ${meetingType === 'HYBRID' ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                                        >
                                            <Users className="h-8 w-8 mb-1" />
                                            <div className="font-bold text-lg">هجين</div>
                                            <div className="text-xs opacity-80 font-normal">حضوري + أونلاين</div>
                                        </Button>
                                    </div>

                                    {/* تفاصيل الاجتماع الأونلاين */}
                                    {meetingType !== 'PHYSICAL' && (
                                        <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 animate-slide-up">
                                            <div className="flex items-center gap-2 text-blue-800 mb-2">
                                                <Video className="h-5 w-5" />
                                                <h4 className="font-semibold">رابط الاجتماع</h4>
                                            </div>
                                            <p className="text-sm text-blue-600 leading-relaxed">
                                                سيقوم مسؤول النظام بإضافة رابط الاجتماع وتفاصيل الدخول بعد تأكيد الحجز.
                                                سيصلك إشعار عند إضافة الرابط.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* المشاركون */}
                            <Card className="card-elevated border-t-4 border-t-amber-500/20">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <div className="rounded-lg bg-amber-500/10 p-2.5">
                                            <Users className="h-5 w-5 text-amber-600" />
                                        </div>
                                        <span className="text-xl font-bold">المشاركون (اختياري)</span>
                                    </CardTitle>
                                    <CardDescription className="pr-12">
                                        أضف أسماء أو بريد إلكتروني للمشاركين
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex gap-2">
                                        <Input
                                            value={newAttendee}
                                            onChange={(e) => setNewAttendee(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAttendee())}
                                            placeholder="أضف مشارك..."
                                            className="h-12 text-base"
                                        />
                                        <Button type="button" onClick={addAttendee} size="lg" className="px-6">
                                            <Plus className="h-5 w-5" />
                                        </Button>
                                    </div>

                                    {attendees.length > 0 && (
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {attendees.map((attendee, index) => (
                                                <Badge key={index} variant="secondary" className="pl-1 pr-3 py-1.5 text-sm gap-2">
                                                    {attendee}
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-5 w-5 rounded-full hover:bg-red-100 hover:text-red-600 -ml-1"
                                                        onClick={() => removeAttendee(index)}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </Badge>
                                            ))}
                                        </div>
                                    )}

                                    {room && attendees.length > room.capacity && (
                                        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                                            <X className="h-5 w-5" />
                                            <span className="font-medium text-sm">عدد المشاركين ({attendees.length}) يتجاوز سعة القاعة ({room.capacity})</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* ملاحظات */}
                            <Card className="card-elevated border-t-4 border-t-slate-500/20">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <div className="rounded-lg bg-slate-500/10 p-2.5">
                                            <FileText className="h-5 w-5 text-slate-600" />
                                        </div>
                                        <span className="text-xl font-bold">ملاحظات إضافية</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="أي ملاحظات أو متطلبات خاصة..."
                                        rows={4}
                                        className="resize-none"
                                    />
                                </CardContent>
                            </Card>

                            {/* زر الحجز */}
                            <Button
                                type="submit"
                                disabled={loading || isAvailable === false || !selectedRoom || !title || !date || !startTime || !endTime}
                                className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                                size="lg"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                                        جاري إنشاء الحجز...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="ml-2 h-6 w-6" />
                                        تأكيد الحجز
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* معلومات القاعة */}
                        {room && (
                            <div className="lg:col-span-4 xl:col-span-3">
                                <Card className="card-elevated border-t-4 border-t-blue-600 sticky top-8 animate-slide-up stagger-2">
                                    <CardHeader>
                                        <CardTitle>معلومات القاعة</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <h3 className="font-bold text-xl mb-2 text-primary">{room.name}</h3>
                                            {room.description && (
                                                <p className="text-sm text-muted-foreground mb-4">{room.description}</p>
                                            )}
                                        </div>

                                        <div className="space-y-3 text-sm">
                                            <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                                                <MapPin className="h-4 w-4 text-primary" />
                                                <span className="font-medium">{room.location}</span>
                                            </div>
                                            <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                                                <Users className="h-4 w-4 text-primary" />
                                                <span className="font-medium">السعة: {room.capacity} شخص</span>
                                            </div>
                                            {room.floor && (
                                                <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                                                    <Calendar className="h-4 w-4 text-primary" />
                                                    <span className="font-medium">{room.floor}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="border-t pt-4">
                                            <h4 className="font-semibold mb-3 text-sm flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                المميزات المتوفرة
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {room.hasProjector && <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">بروجكتور</Badge>}
                                                {room.hasWhiteboard && <Badge variant="secondary" className="bg-slate-50 text-slate-700 hover:bg-slate-100">سبورة</Badge>}
                                                {room.hasVideoConf && <Badge variant="secondary" className="bg-purple-50 text-purple-700 hover:bg-purple-100">مؤتمرات</Badge>}
                                                {room.hasScreen && <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100">شاشة</Badge>}
                                                {room.hasSoundSystem && <Badge variant="secondary" className="bg-pink-50 text-pink-700 hover:bg-pink-100">صوتيات</Badge>}
                                                {room.hasWifi && <Badge variant="secondary" className="bg-cyan-50 text-cyan-700 hover:bg-cyan-100">WiFi</Badge>}
                                                {room.hasAirConditioning && <Badge variant="secondary" className="bg-teal-50 text-teal-700 hover:bg-teal-100">تكييف</Badge>}
                                            </div>
                                        </div>

                                        {room.notes && (
                                            <div className="border-t pt-4">
                                                <p className="text-xs text-muted-foreground italic bg-yellow-50/50 p-3 rounded border border-yellow-100/50">
                                                    📌 {room.notes}
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </div>
    )
}
