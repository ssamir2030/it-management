'use client'

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Save, Loader2, Layout, MapPin, Users, Monitor, Wifi, Volume2, Mic, Video, Settings, CheckCircle2 } from 'lucide-react'
import { PremiumPageHeader } from '@/components/ui/premium-page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { updateMeetingRoom } from '@/app/actions/admin-rooms'
import { getMeetingRoomById } from '@/app/actions/room-bookings'
import { toast } from 'sonner'

export default function EditRoomPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [room, setRoom] = useState<any>(null)

    useEffect(() => {
        async function fetchRoom() {
            const result = await getMeetingRoomById(params.id)
            if (result.success) {
                setRoom(result.data)
            } else {
                toast.error('فشل في جلب بيانات القاعة')
                router.push('/admin/rooms')
            }
            setFetching(false)
        }
        fetchRoom()
    }, [params.id, router])

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const result = await updateMeetingRoom(params.id, formData)

        if (result.success) {
            toast.success('تم تحديث القاعة بنجاح', {
                description: 'تم حفظ التعديلات على بيانات القاعة'
            })
            router.push('/admin/rooms')
        } else {
            toast.error(result.error || 'فشل في تحديث القاعة')
        }

        setLoading(false)
    }

    if (fetching) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!room) return null

    return (
        <div className="w-full py-10" dir="rtl">
            <PremiumPageHeader
                title="تعديل القاعة"
                description={`تعديل بيانات ${room.name}`}
                icon={Layout}
                rightContent={
                    <Button variant="ghost" size="lg" onClick={() => router.back()} className="text-white hover:bg-white/20 gap-2">
                        <ArrowRight className="h-4 w-4" />
                        العودة
                    </Button>
                }
            />

            <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up stagger-1">
                <div className="grid gap-6 lg:grid-cols-2">

                    {/* Basic Info Card */}
                    <Card className="card-elevated border-t-4 border-t-emerald-500/20 lg:col-span-2">
                        <CardHeader className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-emerald-500/10 p-2.5">
                                    <Layout className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-xl font-bold">معلومات القاعة</CardTitle>
                                    <CardDescription>الاسم، الموقع، والسعة الاستيعابية</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-base font-medium">اسم القاعة (عربي) <span className="text-red-500">*</span></Label>
                                    <Input id="name" name="name" defaultValue={room.name} required className="h-12 text-base" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="nameEn" className="text-base font-medium">اسم القاعة (إنجليزي)</Label>
                                    <Input id="nameEn" name="nameEn" defaultValue={room.nameEn || ''} className="h-12 text-base" dir="ltr" />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="location" className="text-base font-medium">الموقع <span className="text-red-500">*</span></Label>
                                    <div className="relative">
                                        <Input id="location" name="location" defaultValue={room.location} required className="h-12 text-base pl-10" />
                                        <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="floor" className="text-base font-medium">الدور</Label>
                                    <Input id="floor" name="floor" defaultValue={room.floor || ''} className="h-12 text-base" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="capacity" className="text-base font-medium">السعة (أشخاص) <span className="text-red-500">*</span></Label>
                                    <div className="relative">
                                        <Input id="capacity" name="capacity" type="number" min="1" defaultValue={room.capacity} required className="h-12 text-base pl-10" />
                                        <Users className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-base font-medium">الوصف</Label>
                                <Textarea id="description" name="description" defaultValue={room.description || ''} className="min-h-[100px] text-base" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Features & Equipment Card */}
                    <Card className="card-elevated border-t-4 border-t-sky-500/20">
                        <CardHeader className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-sky-500/10 p-2.5">
                                    <Monitor className="h-5 w-5 text-sky-600" />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-xl font-bold">التجهيزات والمميزات</CardTitle>
                                    <CardDescription>الأجهزة والخدمات المتوفرة في القاعة</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="flex items-center justify-between p-3 border rounded-xl hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Monitor className="h-5 w-5 text-muted-foreground" />
                                    <Label htmlFor="hasProjector" className="cursor-pointer text-base">جهاز عرض (Projector)</Label>
                                </div>
                                <Switch id="hasProjector" name="hasProjector" defaultChecked={room.hasProjector} />
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-xl hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Monitor className="h-5 w-5 text-muted-foreground" />
                                    <Label htmlFor="hasScreen" className="cursor-pointer text-base">شاشة عرض (TV)</Label>
                                </div>
                                <Switch id="hasScreen" name="hasScreen" defaultChecked={room.hasScreen} />
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-xl hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Video className="h-5 w-5 text-muted-foreground" />
                                    <Label htmlFor="hasVideoConf" className="cursor-pointer text-base">نظام مؤتمرات مرئية</Label>
                                </div>
                                <Switch id="hasVideoConf" name="hasVideoConf" defaultChecked={room.hasVideoConf} />
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-xl hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Volume2 className="h-5 w-5 text-muted-foreground" />
                                    <Label htmlFor="hasSoundSystem" className="cursor-pointer text-base">نظام صوتي</Label>
                                </div>
                                <Switch id="hasSoundSystem" name="hasSoundSystem" defaultChecked={room.hasSoundSystem} />
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-xl hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Mic className="h-5 w-5 text-muted-foreground" />
                                    <Label htmlFor="hasWhiteboard" className="cursor-pointer text-base">سبورة بيضاء</Label>
                                </div>
                                <Switch id="hasWhiteboard" name="hasWhiteboard" defaultChecked={room.hasWhiteboard} />
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-xl hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Wifi className="h-5 w-5 text-muted-foreground" />
                                    <Label htmlFor="hasWifi" className="cursor-pointer text-base">شبكة لاسلكية (WiFi)</Label>
                                </div>
                                <Switch id="hasWifi" name="hasWifi" defaultChecked={room.hasWifi} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Status & Settings Card */}
                    <Card className="card-elevated border-t-4 border-t-orange-500/20">
                        <CardHeader className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-orange-500/10 p-2.5">
                                    <Settings className="h-5 w-5 text-orange-600" />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-xl font-bold">الإعدادات والحالة</CardTitle>
                                    <CardDescription>التحكم في ظهور وحجز القاعة</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between p-4 border rounded-xl bg-orange-50/50 border-orange-100">
                                <div className="space-y-0.5">
                                    <Label htmlFor="isActive" className="text-base font-semibold text-orange-900">تفعيل القاعة</Label>
                                    <p className="text-sm text-orange-700">إظهار القاعة في النظام</p>
                                </div>
                                <Switch id="isActive" name="isActive" defaultChecked={room.isActive} />
                            </div>
                            <div className="flex items-center justify-between p-4 border rounded-xl bg-blue-50/50 border-blue-100">
                                <div className="space-y-0.5">
                                    <Label htmlFor="isAvailable" className="text-base font-semibold text-blue-900">متاحة للحجز</Label>
                                    <p className="text-sm text-blue-700">السماح للموظفين بحجز القاعة</p>
                                </div>
                                <Switch id="isAvailable" name="isAvailable" defaultChecked={room.isAvailable} />
                            </div>

                            <div className="pt-4 border-t">
                                <Label htmlFor="notes" className="text-base font-medium mb-2 block">ملاحظات إدارية</Label>
                                <Textarea id="notes" name="notes" defaultValue={room.notes || ''} placeholder="ملاحظات خاصة للمسؤولين فقط..." className="min-h-[100px] text-base" />
                            </div>
                        </CardContent>
                    </Card>

                </div>

                <div className="flex justify-start gap-4 pt-6 animate-slide-up stagger-2">
                    <Button type="submit" disabled={loading} size="lg" className="min-w-[200px] gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30">
                        {loading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                جاري الحفظ...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="h-5 w-5" />
                                حفظ التعديلات
                            </>
                        )}
                    </Button>
                    <Button type="button" variant="outline" size="lg" onClick={() => router.back()} className="gap-2">
                        إلغاء
                    </Button>
                </div>
            </form>
        </div>
    )
}
