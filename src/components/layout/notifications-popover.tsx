'use client'

import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getTickets } from '@/app/actions/support'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import Link from 'next/link'

export function NotificationsPopover() {
    const [open, setOpen] = useState(false)
    const [notifications, setNotifications] = useState<any[]>([])
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        fetchNotifications()
        const interval = setInterval(fetchNotifications, 10000) // Check every 10 seconds
        return () => clearInterval(interval)
    }, [])

    async function fetchNotifications() {
        try {
            const result = await getTickets()
            if (result?.success && result?.data) {
                // Filter for open or in-progress tickets
                const activeTickets = result.data.filter((t: any) =>
                    t.status === 'OPEN' || t.status === 'IN_PROGRESS'
                )
                setNotifications(activeTickets)
                setUnreadCount(activeTickets.length)
            }
        } catch (error) {
            console.error('Error fetching notifications:', error)
        }
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                    <Bell className="h-[1.2rem] w-[1.2rem]" />
                    {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center p-0 text-xs animate-pulse">
                            {unreadCount}
                        </Badge>
                    )}
                    <span className="sr-only">التنبيهات</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="bg-primary text-primary-foreground p-3 rounded-t-lg">
                    <h4 className="font-medium flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        تذاكر الدعم الفني النشطة
                    </h4>
                </div>
                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                            <Bell className="h-8 w-8 mb-2 opacity-50" />
                            <p className="text-sm">لا توجد تذاكر نشطة حالياً</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((ticket) => (
                                <Link
                                    key={ticket.id}
                                    href={`/support/${ticket.id}`}
                                    onClick={() => setOpen(false)}
                                    className="block p-4 hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h5 className="font-medium text-sm line-clamp-1 text-foreground">
                                            {ticket.title}
                                        </h5>
                                        <Badge variant={ticket.status === 'OPEN' ? 'destructive' : 'default'} className="text-[10px]">
                                            {ticket.status === 'OPEN' ? 'جديدة' : 'جاري العمل'}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                        {ticket.description}
                                    </p>
                                    <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                                        <span>{ticket.createdBy.name}</span>
                                        <span>{format(new Date(ticket.createdAt), 'PP p', { locale: ar })}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </ScrollArea>
                <div className="p-2 border-t bg-muted/20">
                    <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
                        <Link href="/support" onClick={() => setOpen(false)}>
                            عرض جميع التذاكر
                        </Link>
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}
