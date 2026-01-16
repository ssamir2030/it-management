export const dynamic = 'force-dynamic';

import { Metadata } from 'next'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { Calendar, Clock, MapPin, Users, Video, CheckCircle2, XCircle, AlertCircle, Archive } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getAdminBookings, getArchivedBookings, archivePastBookings } from '@/app/actions/admin-bookings'
import { BookingMeetingDetailsDialog } from './meeting-details-dialog'
import { DeleteBookingButton } from './delete-booking-button'
import { PremiumPageHeader } from "@/components/ui/premium-page-header"

export const metadata: Metadata = {
    title: 'إدارة الحجوزات | لوحة التحكم',
}

export default async function AdminBookingsPage() {
    // Auto-archive past bookings on page load
    await archivePastBookings()

    const result = await getAdminBookings()
    const archivedResult = await getArchivedBookings()

    const allBookings = result.success ? result.data : []
    const archivedBookings = archivedResult.success ? archivedResult.data : []

    // Filter active bookings (not completed or cancelled)
    const activeBookings = allBookings?.filter((b: any) => b.status !== 'COMPLETED' && b.status !== 'CANCELLED') || []

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return <Badge className="bg-green-500">مؤكد</Badge>
            case 'PENDING':
                return <Badge variant="secondary" className="bg-yellow-500 text-white">قيد الانتظار</Badge>
            case 'CANCELLED':
                return <Badge variant="destructive">ملغي</Badge>
            case 'COMPLETED':
                return <Badge className="bg-slate-500">مكتمل</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    const getMeetingTypeLabel = (type: string) => {
        switch (type) {
            case 'PHYSICAL':
                return 'حضوري'
            case 'ONLINE':
                return 'أونلاين'
            case 'HYBRID':
                return 'هجين'
            default:
                return type
        }
    }

    const BookingCard = ({ booking, showDelete = true }: { booking: any, showDelete?: boolean }) => (
        <Card className="overflow-hidden" dir="rtl">
            <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
                    <div className="space-y-4 flex-1">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-xl font-bold mb-1">{booking.title}</h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Users className="h-4 w-4" />
                                    <span>{booking.employee.name}</span>
                                    <span className="text-muted-foreground/50">|</span>
                                    <span>{booking.employee.department?.name}</span>
                                </div>
                            </div>
                            <div className="flex gap-2 items-center">
                                {getStatusBadge(booking.status)}
                                <Badge variant="outline">{getMeetingTypeLabel(booking.meetingType)}</Badge>
                                {showDelete && <DeleteBookingButton bookingId={booking.id} bookingTitle={booking.title} />}
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-blue-600" />
                                <span>{format(new Date(booking.startTime), 'EEEE d MMMM yyyy', { locale: ar })}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-blue-600" />
                                <span>
                                    {format(new Date(booking.startTime), 'h:mm a', { locale: ar })} -
                                    {format(new Date(booking.endTime), 'h:mm a', { locale: ar })}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-blue-600" />
                                <span>{booking.room.name}</span>
                            </div>
                            {booking.attendeesCount > 0 && (
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-blue-600" />
                                    <span>{booking.attendeesCount} مشارك</span>
                                </div>
                            )}
                        </div>

                        {(booking.meetingType === 'ONLINE' || booking.meetingType === 'HYBRID') && (
                            <div className="bg-primary/10 dark:bg-primary/20 p-4 rounded-lg border border-primary/20 mt-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2 font-semibold text-primary dark:text-primary">
                                        <Video className="h-4 w-4" />
                                        تفاصيل الاجتماع الأونلاين
                                    </div>
                                    {showDelete && <BookingMeetingDetailsDialog booking={booking} />}
                                </div>

                                {booking.onlineMeetingUrl ? (
                                    <div className="space-y-1 text-sm">
                                        <div className="flex gap-2">
                                            <span className="text-primary font-medium">الرابط:</span>
                                            <a href={booking.onlineMeetingUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate max-w-[300px] block">
                                                {booking.onlineMeetingUrl}
                                            </a>
                                        </div>
                                        {booking.onlineMeetingId && (
                                            <div className="flex gap-2">
                                                <span className="text-primary font-medium">ID:</span>
                                                <span className="font-mono">{booking.onlineMeetingId}</span>
                                            </div>
                                        )}
                                        {booking.onlineMeetingPassword && (
                                            <div className="flex gap-2">
                                                <span className="text-primary font-medium">Pass:</span>
                                                <span className="font-mono">{booking.onlineMeetingPassword}</span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm">
                                        <AlertCircle className="h-4 w-4" />
                                        <span>لم يتم إضافة رابط الاجتماع</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )

    return (
        <div className="container mx-auto p-6 space-y-6" dir="rtl">
            <PremiumPageHeader
                title="حجوزات القاعات"
                description="إدارة الحجوزات وإضافة روابط الاجتماعات"
                icon={Calendar}
            />

            <Tabs defaultValue="active" className="space-y-6">
                <TabsList className="bg-background/50 backdrop-blur border p-1 h-auto w-fit mr-auto">
                    <TabsTrigger value="active" className="text-base py-2 px-4 gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Calendar className="h-4 w-4" /> الحجوزات النشطة
                        <Badge variant="secondary" className="mr-2">{activeBookings.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="archived" className="text-base py-2 px-4 gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Archive className="h-4 w-4" /> الاجتماعات المكتملة
                        <Badge variant="outline" className="mr-2">{archivedBookings?.length || 0}</Badge>
                    </TabsTrigger>
                </TabsList>

                {/* Active Bookings Tab */}
                <TabsContent value="active">
                    <div className="grid gap-4">
                        {activeBookings.map((booking: any) => (
                            <BookingCard key={booking.id} booking={booking} showDelete={true} />
                        ))}

                        {activeBookings.length === 0 && (
                            <div className="text-center py-12 bg-muted/50 rounded-lg border-2 border-dashed">
                                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold">لا توجد حجوزات نشطة</h3>
                                <p className="text-muted-foreground">جميع الاجتماعات السابقة تمت أرشفتها</p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* Archived Bookings Tab */}
                <TabsContent value="archived">
                    <Card>
                        <CardHeader className="text-right">
                            <CardTitle className="flex items-center gap-2 justify-end">
                                تقرير الاجتماعات المكتملة
                                <Archive className="h-5 w-5" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4">
                                {archivedBookings?.map((booking: any) => (
                                    <BookingCard key={booking.id} booking={booking} showDelete={false} />
                                ))}

                                {(!archivedBookings || archivedBookings.length === 0) && (
                                    <div className="text-center py-12 bg-muted/50 rounded-lg border-2 border-dashed">
                                        <Archive className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                        <h3 className="text-lg font-semibold">لا توجد اجتماعات مؤرشفة</h3>
                                        <p className="text-muted-foreground">سيتم أرشفة الاجتماعات تلقائياً بعد انتهائها</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
