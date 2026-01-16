"use client"

import { Bell, Check, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useNotifications } from "@/contexts/notification-context"
import { formatDistanceToNow } from "date-fns"
import { arSA } from "date-fns/locale"

export function NotificationBell() {
    const { notifications, unreadCount, markAllAsRead, clearNotifications } = useNotifications()

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end" sideOffset={8}>
                <div className="flex items-center justify-between p-4 border-b">
                    <h4 className="font-semibold text-sm">الإشعارات</h4>
                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={markAllAsRead} title="تحديد الكل كمقروء">
                            <Check className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={clearNotifications} title="مسح الكل">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <ScrollArea className="h-[300px]">
                    <div className="flex flex-col gap-1 p-2">
                        {notifications.length > 0 ? (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`relative flex flex-col gap-1 rounded-lg p-3 text-sm transition-colors hover:bg-muted ${!notification.read ? "bg-muted/50 border-l-2 border-primary" : "opacity-80"
                                        }`}
                                >
                                    <div className="flex w-full flex-col gap-1">
                                        <div className="flex items-center">
                                            <div className="font-semibold">{notification.title}</div>
                                            <span className="mr-auto text-xs text-muted-foreground">
                                                {formatDistanceToNow(notification.timestamp, { addSuffix: true, locale: arSA })}
                                            </span>
                                        </div>
                                        <div className="line-clamp-2 text-xs text-muted-foreground">
                                            {notification.message}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex h-[200px] flex-col items-center justify-center gap-2 text-center text-muted-foreground">
                                <Bell className="h-8 w-8 opacity-20" />
                                <p className="text-sm">لا توجد إشعارات جديدة</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </PopoverContent>
        </Popover>
    )
}
