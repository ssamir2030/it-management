export const dynamic = 'force-dynamic';

import { getMeetingRooms } from '@/app/actions/room-bookings'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    ArrowRight,
    Calendar,
    Users,
    MapPin,
    Monitor,
    Presentation,
    Wifi,
    Wind,
    Video,
    Speaker
} from 'lucide-react'
import Link from 'next/link'
import { getCurrentEmployee } from '@/app/actions/employee-portal'
import { PremiumPageHeader } from "@/components/ui/premium-page-header"

export default async function MeetingRoomsPage() {
    const employee = await getCurrentEmployee()

    if (!employee) {
        redirect('/portal/login')
    }

    const roomsResult = await getMeetingRooms()
    const rooms = roomsResult.success ? roomsResult.data : []

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <PremiumPageHeader
                title="حجز قاعات الاجتماعات"
                description="اختر القاعة المناسبة واحجز موعد اجتماعك"
                icon={Calendar}
                rightContent={
                    <div className="flex items-center gap-3">
                        <Link href="/portal/dashboard">
                            <Button variant="ghost" className="gap-2 text-white hover:bg-white/20">
                                <ArrowRight className="h-4 w-4" />
                                العودة للرئيسية
                            </Button>
                        </Link>
                        <Link href="/portal/bookings/my">
                            <Button className="gap-2 bg-white text-blue-600 hover:bg-blue-50 border-0">
                                <Calendar className="h-4 w-4" />
                                حجوزاتي
                            </Button>
                        </Link>
                    </div>
                }
            />

            {/* Statistics Cards */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
                <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white dark:from-slate-800 dark:to-slate-900 dark:border-slate-700">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-muted-foreground">إجمالي القاعات</p>
                                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{rooms?.length || 0}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-full dark:bg-blue-900/30">
                                <MapPin className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white dark:from-slate-800 dark:to-slate-900 dark:border-slate-700">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-muted-foreground">قاعات متاحة</p>
                                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                    {rooms?.filter(r => r.isAvailable).length || 0}
                                </p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-full">
                                <Calendar className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white dark:from-slate-800 dark:to-slate-900 dark:border-slate-700">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-muted-foreground">بها مؤتمرات مرئية</p>
                                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                                    {rooms?.filter(r => r.hasVideoConf).length || 0}
                                </p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-full">
                                <Video className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white dark:from-slate-800 dark:to-slate-900 dark:border-slate-700">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-muted-foreground">بها بروجكتور</p>
                                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                                    {rooms?.filter(r => r.hasProjector).length || 0}
                                </p>
                            </div>
                            <div className="p-3 bg-orange-100 rounded-full">
                                <Presentation className="h-6 w-6 text-orange-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Rooms Grid */}
            {!rooms || rooms.length === 0 ? (
                <Card className="dark:bg-slate-800 dark:border-slate-700">
                    <CardContent className="p-12 text-center">
                        <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-xl font-semibold text-foreground mb-2">لا توجد قاعات متاحة</h3>
                        <p className="text-gray-600">سيتم إضافة القاعات قريباً</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rooms.map((room) => (
                        <Card key={room.id} className="border-2 hover:shadow-xl transition-all duration-300 overflow-hidden group dark:bg-slate-800 dark:border-slate-700">
                            {/* صورة القاعة */}
                            {room.imageUrl && (
                                <div className="h-48 overflow-hidden">
                                    <img
                                        src={room.imageUrl}
                                        alt={room.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                </div>
                            )}

                            <CardHeader>
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <CardTitle className="text-xl mb-2 dark:text-gray-100">{room.name}</CardTitle>
                                        {room.nameEn && (
                                            <p className="text-sm text-muted-foreground dark:text-muted-foreground">{room.nameEn}</p>
                                        )}
                                    </div>
                                    <Badge className={room.isAvailable ? 'bg-green-600' : 'bg-red-600'}>
                                        {room.isAvailable ? 'متاحة' : 'محجوزة'}
                                    </Badge>
                                </div>

                                {room.description && (
                                    <CardDescription className="text-sm">
                                        {room.description}
                                    </CardDescription>
                                )}
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {/* الموقع والسعة */}
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-muted-foreground">
                                        <MapPin className="h-4 w-4" />
                                        <span>{room.location}</span>
                                        {room.floor && <span className="text-muted-foreground dark:text-muted-foreground">• {room.floor}</span>}
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-muted-foreground">
                                        <Users className="h-4 w-4" />
                                        <span>{room.capacity} شخص</span>
                                    </div>
                                </div>

                                {/* المميزات */}
                                <div className="flex flex-wrap gap-2">
                                    {room.hasProjector && (
                                        <Badge variant="outline" className="gap-1 dark:text-gray-300 dark:border-gray-600">
                                            <Presentation className="h-3 w-3" />
                                            بروجكتور
                                        </Badge>
                                    )}
                                    {room.hasVideoConf && (
                                        <Badge variant="outline" className="gap-1 dark:text-gray-300 dark:border-gray-600">
                                            <Video className="h-3 w-3" />
                                            مؤتمرات
                                        </Badge>
                                    )}
                                    {room.hasScreen && (
                                        <Badge variant="outline" className="gap-1 dark:text-gray-300 dark:border-gray-600">
                                            <Monitor className="h-3 w-3" />
                                            شاشة
                                        </Badge>
                                    )}
                                    {room.hasSoundSystem && (
                                        <Badge variant="outline" className="gap-1 dark:text-gray-300 dark:border-gray-600">
                                            <Speaker className="h-3 w-3" />
                                            صوتيات
                                        </Badge>
                                    )}
                                    {room.hasWifi && (
                                        <Badge variant="outline" className="gap-1 dark:text-gray-300 dark:border-gray-600">
                                            <Wifi className="h-3 w-3" />
                                            WiFi
                                        </Badge>
                                    )}
                                    {room.hasAirConditioning && (
                                        <Badge variant="outline" className="gap-1 dark:text-gray-300 dark:border-gray-600">
                                            <Wind className="h-3 w-3" />
                                            تكييف
                                        </Badge>
                                    )}
                                </div>

                                {room.notes && (
                                    <p className="text-xs text-muted-foreground border-t pt-3">
                                        📌 {room.notes}
                                    </p>
                                )}

                                {/* زر الحجز */}
                                <Link href={`/portal/bookings/new?roomId=${room.id}`}>
                                    <Button
                                        className="w-full gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                        disabled={!room.isAvailable}
                                    >
                                        <Calendar className="h-4 w-4" />
                                        {room.isAvailable ? 'احجز الآن' : 'غير متاحة'}
                                        <ArrowRight className="h-4 w-4 rotate-180" />
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
