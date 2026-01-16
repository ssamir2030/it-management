export const dynamic = 'force-dynamic';

import { getMyEmployeeNotifications } from '@/app/actions/employee-notifications'
import { getCurrentEmployee } from '@/app/actions/employee-portal'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bell, ArrowRight, Trash2, Clock } from 'lucide-react'
import Link from 'next/link'
import { NotificationActions } from '@/components/portal/notification-actions'
import { PremiumPageHeader } from "@/components/ui/premium-page-header"

export default async function NotificationsPage() {
    const employee = await getCurrentEmployee()

    if (!employee) {
        redirect('/portal/login')
    }

    const notificationsResult = await getMyEmployeeNotifications(100)
    const notifications = notificationsResult.success && notificationsResult.data ? notificationsResult.data : []

    // تصنيف الإشعارات
    const unreadNotifications = notifications?.filter(n => !n.isRead) || []
    const readNotifications = notifications?.filter(n => n.isRead) || []

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

    function getPriorityBadge(priority: string) {
        const config: Record<string, { label: string; className: string }> = {
            URGENT: { label: 'عاجل', className: 'bg-red-600' },
            HIGH: { label: 'مهم', className: 'bg-orange-600' },
            NORMAL: { label: 'عادي', className: 'bg-blue-600' },
            LOW: { label: 'منخفض', className: 'bg-gray-600' }
        }

        const priorityConfig = config[priority] || config.NORMAL
        return (
            <Badge className={priorityConfig.className}>
                {priorityConfig.label}
            </Badge>
        )
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
        return new Date(date).toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    function NotificationCard({ notification }: { notification: any }) {
        return (
            <Card className={`border-2 ${!notification.isRead ? 'bg-blue-50/30 border-blue-200' : ''}`}>
                <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="text-4xl flex-shrink-0">
                            {getNotificationIcon(notification.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="font-bold text-lg">{notification.title}</h3>
                                        {!notification.isRead && (
                                            <div className="h-2 w-2 rounded-full bg-blue-600" />
                                        )}
                                    </div>
                                    <p className="text-gray-700">{notification.message}</p>
                                </div>
                                {getPriorityBadge(notification.priority)}
                            </div>

                            <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{getRelativeTime(notification.createdAt)}</span>
                                </div>
                                {notification.readAt && (
                                    <span className="text-xs text-muted-foreground">
                                        • قُرئ في {new Date(notification.readAt).toLocaleString('ar-EG')}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-2 mt-4">
                                {notification.actionUrl && (
                                    <Link href={notification.actionUrl}>
                                        <Button size="sm" variant="outline" className="gap-1">
                                            عرض التفاصيل
                                            <ArrowRight className="h-3 w-3 rotate-180" />
                                        </Button>
                                    </Link>
                                )}
                                <NotificationActions
                                    notificationId={notification.id}
                                    isRead={notification.isRead}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50" dir="rtl">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <PremiumPageHeader
                    title="الإشعارات"
                    description="جميع الإشعارات والتنبيهات"
                    icon={Bell}
                    rightContent={
                        <Link href="/portal/dashboard">
                            <Button variant="ghost" className="gap-2 text-white hover:bg-white/20">
                                <ArrowRight className="h-4 w-4" />
                                العودة للرئيسية
                            </Button>
                        </Link>
                    }
                />

                {/* Statistics */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">إجمالي الإشعارات</p>
                                    <p className="text-3xl font-bold text-blue-600">{notifications?.length || 0}</p>
                                </div>
                                <Bell className="h-10 w-10 text-blue-600 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">غير مقروءة</p>
                                    <p className="text-3xl font-bold text-red-600">{unreadNotifications.length}</p>
                                </div>
                                <div className="p-3 bg-red-100 rounded-full">
                                    <Bell className="h-6 w-6 text-red-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">مقروءة</p>
                                    <p className="text-3xl font-bold text-green-600">{readNotifications.length}</p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-full">
                                    <Bell className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Notifications List */}
                <div className="space-y-8">
                    {/* Unread Notifications */}
                    {unreadNotifications.length > 0 && (
                        <div>
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-blue-600 animate-pulse" />
                                غير مقروءة
                                <Badge className="bg-blue-600">{unreadNotifications.length}</Badge>
                            </h2>
                            <div className="space-y-4">
                                {unreadNotifications.map((notification) => (
                                    <NotificationCard key={notification.id} notification={notification} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Read Notifications */}
                    {(readNotifications?.length ?? 0) > 0 && (
                        <div>
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                ✅ مقروءة
                                <Badge className="bg-gray-600">{readNotifications.length}</Badge>
                            </h2>
                            <div className="space-y-4">
                                {readNotifications.map((notification) => (
                                    <NotificationCard key={notification.id} notification={notification} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {notifications.length === 0 && (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                                <h3 className="text-xl font-semibold text-foreground mb-2">لا توجد إشعارات</h3>
                                <p className="text-gray-600">سيتم عرض الإشعارات هنا عند وصولها</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
