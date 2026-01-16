'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check, Trash2 } from 'lucide-react'
import {
    markEmployeeNotificationAsRead,
    deleteEmployeeNotification
} from '@/app/actions/employee-notifications'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface NotificationActionsProps {
    notificationId: string
    isRead: boolean
}

export function NotificationActions({ notificationId, isRead }: NotificationActionsProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    async function handleMarkAsRead() {
        setLoading(true)
        const result = await markEmployeeNotificationAsRead(notificationId)
        if (result.success) {
            toast.success('تم تحديد الإشعار كمقروء')
            router.refresh()
        } else {
            toast.error(result.error || 'فشل في تحديث الإشعار')
        }
        setLoading(false)
    }

    async function handleDelete() {
        setLoading(true)
        const result = await deleteEmployeeNotification(notificationId)
        if (result.success) {
            toast.success('تم حذف الإشعار')
            router.refresh()
        } else {
            toast.error(result.error || 'فشل في حذف الإشعار')
        }
        setLoading(false)
    }

    return (
        <div className="flex items-center gap-2">
            {!isRead && (
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleMarkAsRead}
                    disabled={loading}
                    className="gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                    <Check className="h-4 w-4" />
                    تحديد كمقروء
                </Button>
            )}
            <Button
                size="sm"
                variant="ghost"
                onClick={handleDelete}
                disabled={loading}
                className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
                <Trash2 className="h-4 w-4" />
                حذف
            </Button>
        </div>
    )
}
