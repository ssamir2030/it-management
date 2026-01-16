export const dynamic = 'force-dynamic';

import { getCalendarEvents } from "@/app/actions/calendar"
import { CalendarView } from "@/components/calendar/calendar-view"
import { startOfMonth, subMonths, addMonths } from "date-fns"

import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import { CalendarClock } from "lucide-react"

export default async function CalendarPage() {
    // Fetch a buffer of ranges (Previous, Current, Next month) to allow some navigation without immediate refetch
    // Note: For a real robust solution, we'd make the month navigation in CalendarView trigger a server action or API call.
    // For simplicity MVP, we'll fetch a wider range or just the current.
    // Let's fetch 3 months window.

    const now = new Date()
    const eventsPromises = [
        getCalendarEvents(subMonths(now, 1)),
        getCalendarEvents(now),
        getCalendarEvents(addMonths(now, 1))
    ]

    const results = await Promise.all(eventsPromises)

    // Flatten results and filter out undefined
    const events = results.flatMap(r => r.data || [])

    // Remove duplicates if any logic overlap (getCalendarEvents handles distinct months, so safe)

    return (
        <div className="space-y-6">
            <PremiumPageHeader
                title="التقويم الشامل"
                description="تتبع الضمانات، الصيانة الدورية، وتجديد الاشتراكات"
                icon={CalendarClock}
            />

            <CalendarView events={events} />
        </div>
    )
}
