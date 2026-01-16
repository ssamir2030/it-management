"use client"

import { useState } from "react"
import { CalendarEvent } from "@/app/actions/calendar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    ChevronLeft,
    ChevronRight,
    Wrench,
    ShieldAlert,
    CreditCard,
    Calendar as CalendarIcon,
    Clock,
    Filter
} from "lucide-react"
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    startOfWeek,
    endOfWeek,
    isToday
} from "date-fns"
import { arSA } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface CalendarViewProps {
    initialDate?: Date
    events?: CalendarEvent[]
    onMonthChange?: (date: Date) => void
}

export function CalendarView({ initialDate = new Date(), events = [], onMonthChange }: CalendarViewProps) {
    const [currentMonth, setCurrentMonth] = useState(initialDate)
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())

    const days = eachDayOfInterval({
        start: startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 6 }), // Week starts on Saturday for Arabic context
        end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 6 })
    })

    // Group events by date string
    const eventsByDate = new Map<string, CalendarEvent[]>()
    events.forEach(event => {
        const key = format(new Date(event.date), 'yyyy-MM-dd')
        const existing = eventsByDate.get(key) || []
        eventsByDate.set(key, [...existing, event])
    })

    const handlePrevMonth = () => {
        const newDate = subMonths(currentMonth, 1)
        setCurrentMonth(newDate)
        if (onMonthChange) onMonthChange(newDate)
    }

    const handleNextMonth = () => {
        const newDate = addMonths(currentMonth, 1)
        setCurrentMonth(newDate)
        if (onMonthChange) onMonthChange(newDate)
    }

    const selectedDayEvents = selectedDate
        ? eventsByDate.get(format(selectedDate, 'yyyy-MM-dd')) || []
        : []

    const getEventIcon = (type: string) => {
        switch (type) {
            case 'WARRANTY': return <ShieldAlert className="h-4 w-4" />
            case 'MAINTENANCE': return <Wrench className="h-4 w-4" />
            case 'SUBSCRIPTION': return <CreditCard className="h-4 w-4" />
            default: return <CalendarIcon className="h-4 w-4" />
        }
    }

    const getEventGradient = (type: string) => {
        switch (type) {
            case 'WARRANTY': return "from-red-500 to-orange-500"
            case 'MAINTENANCE': return "from-blue-500 to-cyan-500"
            case 'SUBSCRIPTION': return "from-purple-500 to-pink-500"
            default: return "from-zinc-500 to-zinc-400"
        }
    }

    const getEventColor = (type: string) => {
        switch (type) {
            case 'WARRANTY': return "text-red-500 bg-red-500/10 border-red-500/20"
            case 'MAINTENANCE': return "text-blue-500 bg-blue-500/10 border-blue-500/20"
            case 'SUBSCRIPTION': return "text-purple-500 bg-purple-500/10 border-purple-500/20"
            default: return "text-zinc-500 bg-zinc-500/10 border-zinc-500/20"
        }
    }

    return (
        <div className="grid lg:grid-cols-[1fr_400px] gap-8 h-[calc(100vh-140px)] min-h-[600px]">
            {/* Main Calendar Area */}
            <Card className="h-full border-none shadow-2xl bg-black/40 backdrop-blur-xl ring-1 ring-white/10 rounded-3xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 flex items-center justify-between border-b border-white/5 bg-gradient-to-r from-white/5 to-transparent">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 ring-1 ring-white/10">
                            <CalendarIcon className="h-6 w-6 text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-white">
                                {format(currentMonth, 'MMMM yyyy', { locale: arSA })}
                            </h2>
                            <p className="text-sm text-muted-foreground">عرض الأحداث والمهام الشهرية</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-black/20 p-1.5 rounded-xl ring-1 ring-white/5">
                        <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="rounded-lg hover:bg-white/10 hover:text-white transition-colors">
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => {
                            const now = new Date()
                            setCurrentMonth(now)
                            setSelectedDate(now)
                            if (onMonthChange) onMonthChange(now)
                        }} className="px-4 font-semibold text-sm rounded-lg hover:bg-white/10 hover:text-white transition-colors">
                            اليوم
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleNextMonth} className="rounded-lg hover:bg-white/10 hover:text-white transition-colors">
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Days Header */}
                <div className="grid grid-cols-7 text-center py-4 border-b border-white/5 bg-white/[0.02]">
                    {['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'].map((day) => (
                        <div key={day} className="text-sm font-semibold text-muted-foreground/80 tracking-wide">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-7 auto-rows-fr flex-1 bg-black/20">
                    {days.map((day, dayIdx) => {
                        const dateKey = format(day, 'yyyy-MM-dd')
                        const dayEvents = eventsByDate.get(dateKey) || []
                        const isSelected = selectedDate && isSameDay(day, selectedDate)
                        const isCurrentMonth = isSameMonth(day, currentMonth)

                        return (
                            <div
                                key={day.toString()}
                                className={cn(
                                    "min-h-[100px] border-b border-l border-white/5 p-2 relative cursor-pointer group transition-all duration-300",
                                    !isCurrentMonth && "bg-black/20 text-muted-foreground/30",
                                    !isSelected && isCurrentMonth && "hover:bg-white/[0.03]",
                                    isSelected && "bg-indigo-500/10 shadow-[inset_0_0_20px_rgba(99,102,241,0.1)]"
                                )}
                                onClick={() => setSelectedDate(day)}
                            >
                                {isSelected && (
                                    <motion.div
                                        layoutId="selectedDay"
                                        className="absolute inset-0 ring-2 ring-inset ring-indigo-500/50 z-0"
                                    />
                                )}

                                <div className="relative z-10 flex justify-between items-start">
                                    <div className={cn(
                                        "text-sm font-semibold w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-300",
                                        isToday(day)
                                            ? "bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30"
                                            : isSelected
                                                ? "bg-white/10 text-white"
                                                : "text-muted-foreground group-hover:text-white"
                                    )}>
                                        {format(day, 'd')}
                                    </div>

                                    {dayEvents.length > 0 && (
                                        <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-white/10 bg-black/20">
                                            {dayEvents.length}
                                        </Badge>
                                    )}
                                </div>

                                <div className="space-y-1.5 mt-2 relative z-10">
                                    {dayEvents.slice(0, 3).map((event) => (
                                        <motion.div
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            key={event.id}
                                            className="text-[10px] truncate px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/5 flex items-center gap-1.5 transition-colors"
                                        >
                                            <div className={cn("w-1.5 h-1.5 rounded-full bg-gradient-to-br", getEventGradient(event.type))} />
                                            <span className={cn(
                                                "truncate",
                                                event.status === 'OVERDUE' ? "text-red-400" : "text-muted-foreground"
                                            )}>
                                                {event.title}
                                            </span>
                                        </motion.div>
                                    ))}
                                    {dayEvents.length > 3 && (
                                        <div className="text-[10px] text-muted-foreground/60 pl-1 font-medium hover:text-indigo-400 transition-colors">
                                            +{dayEvents.length - 3} المزيد...
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </Card>

            {/* Sidebar / Details Panel */}
            <Card className="h-full border-none shadow-2xl bg-black/40 backdrop-blur-xl ring-1 ring-white/10 rounded-3xl overflow-hidden flex flex-col">
                <div className="p-6 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
                    <h3 className="text-xl font-bold flex items-center gap-3 text-white">
                        <div className="p-2 rounded-xl bg-white/5 ring-1 ring-white/10">
                            <Clock className="h-5 w-5 text-indigo-400" />
                        </div>
                        {selectedDate ? format(selectedDate, 'EEEE, d MMMM', { locale: arSA }) : 'الجدول الزمني'}
                    </h3>
                    {selectedDate && (
                        <p className="text-sm text-muted-foreground mt-2 mr-11">
                            {selectedDayEvents.length} أحداث مجدولة لهذا اليوم
                        </p>
                    )}
                </div>

                <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                    <AnimatePresence mode="popLayout">
                        {!selectedDate ? (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="text-center py-20"
                            >
                                <div className="w-20 h-20 mx-auto rounded-3xl bg-white/5 flex items-center justify-center mb-6 ring-1 ring-white/10">
                                    <CalendarIcon className="h-10 w-10 text-muted-foreground/30" />
                                </div>
                                <h4 className="text-lg font-semibold text-muted-foreground">اختر يوماً</h4>
                                <p className="text-sm text-muted-foreground/50 mt-1">لعرض التفاصيل والمهام والضمانات</p>
                            </motion.div>
                        ) : selectedDayEvents.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center h-full text-center"
                            >
                                <div className="w-20 h-20 rounded-full bg-gradient-to-b from-white/5 to-transparent flex items-center justify-center mb-4 ring-1 ring-white/5">
                                    <Clock className="h-10 w-10 text-muted-foreground/20" />
                                </div>
                                <p className="text-lg font-medium text-muted-foreground/60">لا توجد أحداث في هذا اليوم</p>
                                <Button variant="outline" className="mt-6 border-dashed border-white/20 hover:border-indigo-500/50 hover:bg-indigo-500/10">
                                    إضافة حدث جديد
                                </Button>
                            </motion.div>
                        ) : (
                            <div className="space-y-4">
                                {selectedDayEvents.map((event, idx) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        key={event.id}
                                        className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300"
                                    >
                                        <div className={cn("absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b", getEventGradient(event.type))} />

                                        <div className="p-4 pl-4 pr-5">
                                            <div className="flex items-start gap-4">
                                                <div className={cn("p-2.5 rounded-xl shrink-0 transition-colors", getEventColor(event.type))}>
                                                    {getEventIcon(event.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2 mb-1">
                                                        <h4 className="font-semibold text-base text-white group-hover:text-indigo-400 transition-colors truncate">
                                                            {event.title}
                                                        </h4>
                                                        {event.status === 'OVERDUE' && (
                                                            <Badge variant="destructive" className="h-5 px-1.5 text-[10px] shrink-0">
                                                                متأخر
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-2 mt-2">
                                                        <Badge variant="secondary" className="bg-black/40 border-white/10 text-[10px] font-normal hover:bg-black/60">
                                                            {event.type === 'WARRANTY' ? 'ضمان' :
                                                                event.type === 'MAINTENANCE' ? 'صيانة' : 'اشتراك'}
                                                        </Badge>

                                                        {event.metadata?.tag && (
                                                            <span className="text-[10px] text-muted-foreground font-mono bg-white/5 px-1.5 py-0.5 rounded">
                                                                {event.metadata.tag}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </Card>
        </div>
    )
}
