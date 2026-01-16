'use client'

import { useState, useEffect } from 'react'
import { Bell, Check, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    getMyEmployeeNotifications,
    getUnreadEmployeeNotificationsCount,
    markEmployeeNotificationAsRead,
    markAllEmployeeNotificationsAsRead,
    deleteEmployeeNotification
} from '@/app/actions/employee-notifications'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function EmployeeNotificationsPopover() {
    const router = useRouter()
    const [notifications, setNotifications] = useState<any[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)

    async function loadNotifications() {
        setLoading(true)
        const result = await getMyEmployeeNotifications(20)
        if (result && result.success) {
            setNotifications(result.data || [])
        }

        const countResult = await getUnreadEmployeeNotificationsCount()
        if (countResult && countResult.success) {
            setUnreadCount(countResult.count || 0)
        }

        setLoading(false)
    }

    useEffect(() => {
        loadNotifications()

        // تحديث كل 30 ثانية
        const interval = setInterval(loadNotifications, 30000)
        return () => clearInterval(interval)
    }, [])

    async function handleNotificationClick(notification: any) {
        if (!notification.isRead) {
            await markEmployeeNotificationAsRead(notification.id)
            loadNotifications()
        }

        if (notification.actionUrl) {
            setOpen(false)
            router.push(notification.actionUrl)
        }
    }

    async function handleMarkAllAsRead() {
        const result = await markAllEmployeeNotificationsAsRead()
        if (result && result.success) {
            toast.success('تم تحديد جميع الإشعارات كمقروءة')
            loadNotifications()
        }
    }

    async function handleDelete(e: React.MouseEvent, notificationId: string) {
        e.stopPropagation()
        const result = await deleteEmployeeNotification(notificationId)
        if (result && result.success) {
            toast.success('تم حذف الإشعار')
            loadNotifications()
        }
    }

    function getNotificationIcon(type: string) {
        switch (type) {
            case 'REQUEST_UPDATE':
                return '📝'
            case 'BOOKING_CONFIRMED':
                return '✅'
            case 'BOOKING_CANCELLED':
                return '❌'
            case 'REMINDER':
                return '⏰'
            case 'ANNOUNCEMENT':
                return '📢'
            case 'SYSTEM':
                return '⚙️'
            default:
                return '🔔'
        }
    }

    function getPriorityColor(priority: string) {
        switch (priority) {
            case 'URGENT':
                return 'border-r-4 border-red-500 bg-red-50'
            case 'HIGH':
                return 'border-r-4 border-orange-500 bg-orange-50'
            case 'NORMAL':
                return 'border-r-4 border-blue-500'
            case 'LOW':
                return 'border-r-4 border-gray-500'
            default:
                return ''
        }
    }

    function getRelativeTime(date: Date) {
        const now = new Date()
        const diff = now.getTime() - new Date(date).getTime()
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(minutes / 60)
        const days = Math.floor(hours / 24)

        if (minutes < 1) return 'الآن'
        if (minutes < 60) return `منذ ${minutes} دقيقة`
        if (hours < 24) return `منذ ${hours} ساعة`
        if (days < 7) return `منذ ${days} يوم`
        return new Date(date).toLocaleDateString('ar-EG')
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-600"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0" align="end" dir="rtl">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-bold text-lg">الإشعارات</h3>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkAllAsRead}
                            className="text-xs"
                        >
                            <Check className="h-3 w-3 ml-1" />
                            تحديد الكل كمقروء
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-[400px]">
                    {loading ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                            <Bell className="h-12 w-12 mb-2 opacity-50" />
                            <p className="text-sm">لا توجد إشعارات</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors relative ${!notification.isRead ? 'bg-blue-50/50' : ''
                                        } ${getPriorityColor(notification.priority)}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="text-2xl flex-shrink-0">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h4 className={`text-sm font-semibold ${!notification.isRead ? 'text-foreground' : 'text-gray-700'}`}>
                                                    {notification.title}
                                                </h4>
                                                {!notification.isRead && (
                                                    <div className="h-2 w-2 rounded-full bg-blue-600 flex-shrink-0 mt-1" />
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-xs text-muted-foreground">
                                                    {getRelativeTime(notification.createdAt)}
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-muted-foreground hover:text-red-600"
                                                    onClick={(e) => handleDelete(e, notification.id)}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {notifications.length > 0 && (
                    <div className="border-t p-2">
                        <Button
                            variant="ghost"
                            className="w-full text-sm"
                            onClick={() => {
                                setOpen(false)
                                router.push('/portal/notifications')
                            }}
                        >
                            عرض جميع الإشعارات
                        </Button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    )
}
