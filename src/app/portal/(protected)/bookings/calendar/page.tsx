export const dynamic = 'force-dynamic';

import { getBookingsByDateRange, getMeetingRooms } from '@/app/actions/room-bookings'
import { getCurrentEmployee } from '@/app/actions/employee-portal'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, Plus } from 'lucide-react'
import Link from 'next/link'
import { CalendarView } from '@/components/bookings/calendar-view'

export default async function CalendarPage({ searchParams }: { searchParams: { date?: string } }) {
    const employee = await getCurrentEmployee()

    if (!employee) {
        redirect('/portal/login')
    }

    // تحديد الشهر الحالي أو المختار
    const today = new Date()
    const selectedDate = searchParams.date ? new Date(searchParams.date) : today

    // بداية ونهاية الشهر للعرض
    const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
    const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0)

    // جلب الحجوزات لهذا الشهر
    const bookingsResult = await getBookingsByDateRange(startOfMonth, endOfMonth)
    const bookings = bookingsResult.success && bookingsResult.data ? bookingsResult.data : []

    // جلب القاعات للفلترة (مستقبلاً)
    const roomsResult = await getMeetingRooms()
    const rooms = roomsResult.success && roomsResult.data ? roomsResult.data : []

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950" dir="rtl">
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                            <CalendarIcon className="h-8 w-8 text-blue-600 dark:text-blue-500" />
                            تقويم الحجوزات
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">استعراض جدول حجوزات قاعات الاجتماعات</p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/portal/bookings/new">
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                حجز جديد
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Calendar Component */}
                    <div className="lg:col-span-3">
                        <Card className="shadow-md">
                            <CardContent className="p-6">
                                <CalendarView
                                    bookings={bookings}
                                    currentDate={selectedDate}
                                    rooms={rooms}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar / Summary */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">إحصائيات الشهر</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">إجمالي الحجوزات</span>
                                    <span className="font-bold text-lg">{bookings?.length || 0}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">ساعات الاجتماعات</span>
                                    <span className="font-bold text-lg">
                                        {bookings?.reduce((acc: number, curr: any) => {
                                            const start = new Date(curr.startTime).getTime()
                                            const end = new Date(curr.endTime).getTime()
                                            return acc + (end - start) / (1000 * 60 * 60)
                                        }, 0).toFixed(1)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-blue-50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/50">
                            <CardContent className="p-4">
                                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">مفتاح الألوان</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                        <span>اجتماع حضوري</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                        <span>اجتماع أونلاين</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                        <span>اجتماع هجين</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
