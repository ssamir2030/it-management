'use client'

import { useState, useEffect } from 'react'
import { Bell, Check, CheckCheck, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import { getMyNotifications, getUnreadNotificationsCount, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } from '@/app/actions/admin-notifications'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

type Notification = {
    id: string
    type: string
    title: string
    message: string
    read: boolean
    entityType: string | null
    entityId: string | null
    createdAt: Date | string
}

const notificationIcons: Record<string, string> = {
    'ASSET_ASSIGNED': '📦',
    'ASSET_RETURNED': '↩️',
    'TICKET_CREATED': '🎫',
    'TICKET_UPDATED': '🔄',
    'TICKET_ASSIGNED': '👤',
    'SLA_WARNING': '⚠️',
    'SLA_BREACH': '🚨',
    'SYSTEM': 'ℹ️'
}

const notificationColors: Record<string, string> = {
    'ASSET_ASSIGNED': 'text-blue-600 bg-blue-50 dark:bg-blue-950/20',
    'ASSET_RETURNED': 'text-green-600 bg-green-50 dark:bg-green-950/20',
    'TICKET_CREATED': 'text-purple-600 bg-purple-50 dark:bg-purple-950/20',
    'TICKET_UPDATED': 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20',
    'TICKET_ASSIGNED': 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/20',
    'SLA_WARNING': 'text-orange-600 bg-orange-50 dark:bg-orange-950/20',
    'SLA_BREACH': 'text-red-600 bg-red-50 dark:bg-red-950/20',
    'SYSTEM': 'text-gray-600 bg-gray-50 dark:bg-gray-950/20'
}

export function NotificationsPopover() {
    const [open, setOpen] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const loadNotifications = async () => {
        setLoading(true)
        const [notificationsRes, countRes] = await Promise.all([
            getMyNotifications(20),
            getUnreadNotificationsCount()
        ])

        if (notificationsRes.success && notificationsRes.data) {
            setNotifications(notificationsRes.data as Notification[])
        }

        if (countRes.success && typeof countRes.count === 'number') {
            setUnreadCount(countRes.count)
        }
        setLoading(false)
    }

    useEffect(() => {
        loadNotifications()
        // Refresh every 30 seconds
        const interval = setInterval(loadNotifications, 30000)
        return () => clearInterval(interval)
    }, [])

    const handleMarkAsRead = async (notificationId: string) => {
        await markNotificationAsRead(notificationId)
        await loadNotifications()
    }

    const handleMarkAllAsRead = async () => {
        await markAllNotificationsAsRead()
        await loadNotifications()
        toast.success('تم تحديد جميع الإشعارات كمقروءة')
    }

    const handleDelete = async (notificationId: string) => {
        await deleteNotification(notificationId)
        await loadNotifications()
        toast.success('تم حذف الإشعار')
    }

    const handleNotificationClick = (notification: Notification) => {
        // Mark as read
        if (!notification.read) {
            handleMarkAsRead(notification.id)
        }

        // Navigate if has entity
        if (notification.entityType && notification.entityId) {
            const routes: Record<string, string> = {
                'ASSET': `/assets/${notification.entityId}`,
                'TICKET': `/support/${notification.entityId}`,
                'EMPLOYEE': `/employees/${notification.entityId}`
            }
            const route = routes[notification.entityType]
            if (route) {
                router.push(route)
                setOpen(false)
            }
        }
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                    <Bell className="h-[1.2rem] w-[1.2rem]" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] font-bold animate-pulse"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                    <span className="sr-only">الإشعارات</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <div>
                        <h3 className="font-semibold">الإشعارات</h3>
                        <p className="text-xs text-muted-foreground">
                            {unreadCount > 0 ? `${unreadCount} غير مقروء` : 'لا توجد إشعارات جديدة'}
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkAllAsRead}
                            className="text-xs"
                        >
                            <CheckCheck className="h-4 w-4 mr-1" />
                            تحديد الكل كمقروء
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-[400px]">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                            <p className="text-sm text-muted-foreground mt-4">جاري التحميل...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center">
                            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                            <p className="text-sm text-muted-foreground">لا توجد إشعارات</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        'p-4 hover:bg-accent cursor-pointer transition-colors group relative',
                                        !notification.read && 'bg-accent/50'
                                    )}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="flex gap-3">
                                        <div className={cn(
                                            'h-10 w-10 rounded-full flex items-center justify-center text-xl shrink-0',
                                            notificationColors[notification.type] || notificationColors['SYSTEM']
                                        )}>
                                            {notificationIcons[notification.type] || notificationIcons['SYSTEM']}
                                        </div>
                                        <div className="flex-1 min-w-0 space-y-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="font-medium text-sm leading-tight">
                                                    {notification.title}
                                                </p>
                                                {!notification.read && (
                                                    <div className="h-2 w-2 rounded-full bg-blue-600 shrink-0 mt-1" />
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground">
                                                {formatDistanceToNow(new Date(notification.createdAt), {
                                                    addSuffix: true,
                                                    locale: ar
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                        {!notification.read && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleMarkAsRead(notification.id)
                                                }}
                                            >
                                                <Check className="h-3 w-3" />
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-destructive"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleDelete(notification.id)
                                            }}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    )
}
