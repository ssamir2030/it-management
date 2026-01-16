'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Clock, MapPin, User, Video, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'

interface CalendarViewProps {
    bookings: any[]
    currentDate: Date
    rooms: any[]
}

export function CalendarView({ bookings, currentDate, rooms }: CalendarViewProps) {
    const router = useRouter()
    const [selectedDay, setSelectedDay] = useState<Date>(new Date())

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDayOfMonth = new Date(year, month, 1).getDay() // 0 = Sunday

    // Adjust for RTL (Sunday start is standard, but let's ensure grid aligns)
    // In standard grid: Sun, Mon, Tue, Wed, Thu, Fri, Sat

    const monthNames = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ]

    const weekDays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

    function handlePrevMonth() {
        const newDate = new Date(year, month - 1, 1)
        router.push(`/portal/bookings/calendar?date=${newDate.toISOString().split('T')[0]}`)
    }

    function handleNextMonth() {
        const newDate = new Date(year, month + 1, 1)
        router.push(`/portal/bookings/calendar?date=${newDate.toISOString().split('T')[0]}`)
    }

    function getBookingsForDay(day: number) {
        return bookings.filter(b => {
            const date = new Date(b.startTime)
            return date.getDate() === day &&
                date.getMonth() === month &&
                date.getFullYear() === year &&
                b.status !== 'CANCELLED' &&
                b.status !== 'REJECTED'
        })
    }

    function isToday(day: number) {
        const today = new Date()
        return day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()
    }

    function isSelected(day: number) {
        return day === selectedDay.getDate() &&
            month === selectedDay.getMonth() &&
            year === selectedDay.getFullYear()
    }

    const selectedDayBookings = bookings.filter(b => {
        const date = new Date(b.startTime)
        return date.getDate() === selectedDay.getDate() &&
            date.getMonth() === selectedDay.getMonth() &&
            date.getFullYear() === selectedDay.getFullYear() &&
            b.status !== 'CANCELLED' &&
            b.status !== 'REJECTED'
    }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

    return (
        <div className="space-y-8">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <h2 className="text-xl font-bold min-w-[150px] text-center">
                        {monthNames[month]} {year}
                    </h2>
                    <Button variant="outline" size="icon" onClick={handleNextMonth}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </div>
                <Button variant="outline" onClick={() => {
                    const today = new Date()
                    router.push(`/portal/bookings/calendar?date=${today.toISOString().split('T')[0]}`)
                    setSelectedDay(today)
                }}>
                    اليوم
                </Button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-slate-800 rounded-lg overflow-hidden border border-gray-200 dark:border-slate-800">
                {/* Weekday Headers */}
                {weekDays.map(day => (
                    <div key={day} className="bg-gray-50 dark:bg-slate-900 p-2 text-center text-sm font-medium text-muted-foreground">
                        {day}
                    </div>
                ))}

                {/* Empty Cells */}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} className="bg-white dark:bg-slate-950 min-h-[100px]" />
                ))}

                {/* Days */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1
                    const dayBookings = getBookingsForDay(day)
                    const isCurrentDay = isToday(day)
                    const isSelectedDay = isSelected(day)

                    return (
                        <div
                            key={day}
                            className={`bg-white dark:bg-slate-950 min-h-[100px] p-2 cursor-pointer transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20 relative group
                                ${isSelectedDay ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-inset ring-blue-500' : ''}
                            `}
                            onClick={() => setSelectedDay(new Date(year, month, day))}
                        >
                            <div className="flex justify-between items-start">
                                <span className={`
                                    w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium
                                    ${isCurrentDay ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-200'}
                                `}>
                                    {day}
                                </span>
                                {dayBookings.length > 0 && (
                                    <span className="text-xs font-medium text-muted-foreground">
                                        {dayBookings.length}
                                    </span>
                                )}
                            </div>

                            <div className="mt-2 space-y-1">
                                {dayBookings.slice(0, 3).map(booking => (
                                    <div
                                        key={booking.id}
                                        className={`
                                            text-[10px] px-1.5 py-0.5 rounded truncate
                                            ${booking.meetingType === 'PHYSICAL' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200' :
                                                booking.meetingType === 'ONLINE' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-200' :
                                                    'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-200'}
                                        `}
                                    >
                                        {new Date(booking.startTime).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                ))}
                                {dayBookings.length > 3 && (
                                    <div className="text-[10px] text-muted-foreground text-center">
                                        +{dayBookings.length - 3} المزيد
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Selected Day Details */}
            <div className="mt-8 border-t pt-8">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    جدول يوم {selectedDay.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}
                </h3>

                {selectedDayBookings.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 dark:bg-slate-900 rounded-lg border border-dashed border-gray-200 dark:border-slate-800">
                        <p className="text-muted-foreground mb-2">لا توجد حجوزات في هذا اليوم</p>
                        <Link href={`/portal/bookings/new?date=${selectedDay.toISOString().split('T')[0]}`}>
                            <Button variant="outline" className="mt-2">
                                إضافة حجز جديد
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {selectedDayBookings.map(booking => (
                            <Card key={booking.id} className="hover:shadow-md transition-shadow">
                                <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                                    {/* Time Column */}
                                    <div className="min-w-[120px] text-center sm:text-right border-b sm:border-b-0 sm:border-l pl-4 pb-2 sm:pb-0">
                                        <div className="font-bold text-lg text-foreground">
                                            {new Date(booking.startTime).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            إلى {new Date(booking.endTime).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>

                                    {/* Details Column */}
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="font-bold text-lg">{booking.title}</h4>
                                            <Badge variant="outline" className={`
                                                ${booking.meetingType === 'PHYSICAL' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800' :
                                                    booking.meetingType === 'ONLINE' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800' :
                                                        'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'}
                                            `}>
                                                {booking.meetingType === 'PHYSICAL' ? 'حضوري' :
                                                    booking.meetingType === 'ONLINE' ? 'أونلاين' : 'هجين'}
                                            </Badge>
                                        </div>

                                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
                                            <div className="flex items-center gap-1">
                                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                                <span>{booking.room.name}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                                <span>{booking.employee.name}</span>
                                            </div>
                                            {booking.attendeesCount > 0 && (
                                                <div className="flex items-center gap-1">
                                                    <Users className="h-4 w-4 text-muted-foreground" />
                                                    <span>{booking.attendeesCount} مشارك</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Column */}
                                    <div>
                                        <Link href={`/portal/bookings/my`}>
                                            <Button variant="ghost" size="sm">
                                                التفاصيل
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
