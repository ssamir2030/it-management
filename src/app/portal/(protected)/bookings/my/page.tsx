export const dynamic = 'force-dynamic';

import { getMyBookings } from '@/app/actions/room-bookings'
import { getCurrentEmployee } from '@/app/actions/employee-portal'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Calendar,
    Clock,
    MapPin,
    Users,
    Video,
    ArrowRight,
    Plus,
    CheckCircle2,
    XCircle,
    AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { CancelBookingButton } from '@/components/bookings/cancel-booking-button'
import { PremiumPageHeader } from '@/components/ui/premium-page-header'

export default async function MyBookingsPage() {
    const employee = await getCurrentEmployee()

    if (!employee) {
        redirect('/portal/login')
    }

    const bookingsResult = await getMyBookings()
    const bookings = bookingsResult.success ? bookingsResult.data : []

    // تصنيف الحجوزات
    const upcomingBookings = bookings?.filter(b =>
        new Date(b.startTime) > new Date() && ['PENDING', 'APPROVED'].includes(b.status)
    ) || []

    const pastBookings = bookings?.filter(b =>
        new Date(b.endTime) < new Date() || b.status === 'COMPLETED'
    ) || []

    const cancelledBookings = bookings?.filter(b =>
        b.status === 'CANCELLED' || b.status === 'REJECTED'
    ) || []

    function getStatusBadge(status: string) {
        const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
            PENDING: {
                label: 'قيد المراجعة',
                className: 'bg-yellow-600',
                icon: AlertCircle
            },
            APPROVED: {
                label: 'مؤكد',
                className: 'bg-green-600',
                icon: CheckCircle2
            },
            REJECTED: {
                label: 'مرفوض',
                className: 'bg-red-600',
                icon: XCircle
            },
            CANCELLED: {
                label: 'ملغي',
                className: 'bg-gray-600',
                icon: XCircle
            },
            COMPLETED: {
                label: 'مكتمل',
                className: 'bg-blue-600',
                icon: CheckCircle2
            }
        }

        const config = statusConfig[status] || statusConfig.PENDING
        const Icon = config.icon

        return (
            <Badge className={`${config.className} gap-1`}>
                <Icon className="h-3 w-3" />
                {config.label}
            </Badge>
        )
    }

    function getMeetingTypeBadge(type: string) {
        const typeConfig: Record<string, { label: string; className: string }> = {
            PHYSICAL: { label: 'حضوري', className: 'bg-blue-100 text-blue-700' },
            ONLINE: { label: 'أونلاين', className: 'bg-purple-100 text-purple-700' },
            HYBRID: { label: 'هجين', className: 'bg-green-100 text-green-700' }
        }

        const config = typeConfig[type] || typeConfig.PHYSICAL

        return (
            <Badge variant="outline" className={config.className}>
                {config.label}
            </Badge>
        )
    }

    function formatDate(date: Date) {
        return new Date(date).toLocaleDateString('ar-EG', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    function formatTime(date: Date) {
        return new Date(date).toLocaleTimeString('ar-EG', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    function BookingCard({ booking }: { booking: any }) {
        const isUpcoming = new Date(booking.startTime) > new Date()
        const canCancel = isUpcoming && ['PENDING', 'APPROVED'].includes(booking.status)

        return (
            <Card className="border-2 hover:shadow-lg transition-all duration-300 dark:bg-slate-800 dark:border-slate-700">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <CardTitle className="text-xl mb-2 dark:text-gray-100">{booking.title}</CardTitle>
                            <div className="flex flex-wrap gap-2">
                                {getStatusBadge(booking.status)}
                                {getMeetingTypeBadge(booking.meetingType)}
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* القاعة */}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg dark:bg-slate-900">
                        <MapPin className="h-5 w-5 text-blue-600" />
                        <div>
                            <p className="font-semibold dark:text-gray-200">{booking.room.name}</p>
                            <p className="text-sm text-gray-600 dark:text-muted-foreground">{booking.room.location}</p>
                        </div>
                    </div>

                    {/* التاريخ والوقت */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm">{formatDate(booking.startTime)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm">
                                من {formatTime(booking.startTime)} إلى {formatTime(booking.endTime)}
                            </span>
                        </div>
                    </div>

                    {/* الوصف */}
                    {booking.description && (
                        <p className="text-sm text-gray-600 border-t pt-3 dark:text-muted-foreground dark:border-slate-700">
                            {booking.description}
                        </p>
                    )}

                    {/* المشاركون */}
                    {booking.attendeesCount > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 border-t pt-3 dark:text-muted-foreground dark:border-slate-700">
                            <Users className="h-4 w-4" />
                            <span>{booking.attendeesCount} مشارك</span>
                        </div>
                    )}

                    {/* رابط الاجتماع الأونلاين */}
                    {booking.onlineMeetingUrl && (
                        <div className="border-t pt-3 dark:border-slate-700">
                            <a
                                href={booking.onlineMeetingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                            >
                                <Video className="h-4 w-4" />
                                <span className="underline">رابط الاجتماع</span>
                                <ArrowRight className="h-3 w-3 rotate-180" />
                            </a>
                            {booking.onlineMeetingId && (
                                <p className="text-xs text-gray-600 mt-2 dark:text-muted-foreground">
                                    Meeting ID: {booking.onlineMeetingId}
                                </p>
                            )}
                            {booking.onlineMeetingPassword && (
                                <p className="text-xs text-gray-600 dark:text-muted-foreground">
                                    Password: {booking.onlineMeetingPassword}
                                </p>
                            )}
                        </div>
                    )}

                    {/* الملاحظات */}
                    {booking.notes && (
                        <p className="text-xs text-muted-foreground border-t pt-3 dark:text-muted-foreground dark:border-slate-700">
                            📌 {booking.notes}
                        </p>
                    )}

                    {/* الإجراءات */}
                    {canCancel && (
                        <div className="border-t pt-3">
                            <CancelBookingButton bookingId={booking.id} />
                        </div>
                    )}
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" dir="rtl">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <PremiumPageHeader
                    title="حجوزاتي"
                    description="عرض وإدارة حجوزات قاعات الاجتماعات"
                    icon={Calendar}
                    rightContent={
                        <div className="flex items-center gap-3">
                            <Link href="/portal/dashboard">
                                <Button variant="ghost" className="gap-2 text-white hover:bg-white/20">
                                    <ArrowRight className="h-4 w-4" />
                                    العودة للرئيسية
                                </Button>
                            </Link>
                            <Link href="/portal/rooms">
                                <Button variant="ghost" className="gap-2 text-white hover:bg-white/20">
                                    <MapPin className="h-4 w-4" />
                                    عرض القاعات
                                </Button>
                            </Link>
                            <Link href="/portal/bookings/new">
                                <Button className="gap-2 bg-white text-blue-600 hover:bg-blue-50 border-0">
                                    <Plus className="h-4 w-4" />
                                    حجز جديد
                                </Button>
                            </Link>
                        </div>
                    }
                />

                {/* Statistics */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white dark:from-slate-800 dark:to-slate-900 dark:border-slate-700">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-muted-foreground">إجمالي الحجوزات</p>
                                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{bookings?.length || 0}</p>
                                </div>
                                <Calendar className="h-10 w-10 text-blue-600 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white dark:from-slate-800 dark:to-slate-900 dark:border-slate-700">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-muted-foreground">القادمة</p>
                                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">{upcomingBookings.length}</p>
                                </div>
                                <CheckCircle2 className="h-10 w-10 text-green-600 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white dark:from-slate-800 dark:to-slate-900 dark:border-slate-700">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-muted-foreground">السابقة</p>
                                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{pastBookings.length}</p>
                                </div>
                                <Clock className="h-10 w-10 text-purple-600 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white dark:from-slate-800 dark:to-slate-900 dark:border-slate-700">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-muted-foreground">الملغاة</p>
                                    <p className="text-3xl font-bold text-gray-600 dark:text-muted-foreground">{cancelledBookings.length}</p>
                                </div>
                                <XCircle className="h-10 w-10 text-gray-600 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Bookings Sections */}
                <div className="space-y-8">
                    {/* الحجوزات القادمة */}
                    <div>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 dark:text-gray-100">
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                            الحجوزات القادمة
                            <Badge className="bg-green-600">{upcomingBookings.length}</Badge>
                        </h2>
                        {upcomingBookings.length === 0 ? (
                            <Card className="dark:bg-slate-800 dark:border-slate-700">
                                <CardContent className="p-12 text-center">
                                    <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                                    <h3 className="text-xl font-semibold text-foreground mb-2 dark:text-gray-100">لا توجد حجوزات قادمة</h3>
                                    <p className="text-gray-600 mb-4 dark:text-muted-foreground">ابدأ بحجز قاعة اجتماعات الآن</p>
                                    <Link href="/portal/bookings/new">
                                        <Button className="gap-2">
                                            <Plus className="h-4 w-4" />
                                            حجز جديد
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {upcomingBookings.map((booking) => (
                                    <BookingCard key={booking.id} booking={booking} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* الحجوزات السابقة */}
                    {pastBookings.length > 0 && (
                        <div>
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 dark:text-gray-100">
                                <Clock className="h-6 w-6 text-purple-600" />
                                الحجوزات السابقة
                                <Badge className="bg-purple-600">{pastBookings.length}</Badge>
                            </h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {pastBookings.map((booking) => (
                                    <BookingCard key={booking.id} booking={booking} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* الحجوزات الملغاة */}
                    {cancelledBookings.length > 0 && (
                        <div>
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 dark:text-gray-100">
                                <XCircle className="h-6 w-6 text-gray-600" />
                                الحجوزات الملغاة
                                <Badge className="bg-gray-600">{cancelledBookings.length}</Badge>
                            </h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {cancelledBookings.map((booking) => (
                                    <BookingCard key={booking.id} booking={booking} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
