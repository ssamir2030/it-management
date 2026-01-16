import { Suspense } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getActivityFeed } from '@/app/actions/activity'
import { Activity, User, Plus, Edit, Trash2, CheckCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'

const actionIcons = {
    CREATE: Plus,
    UPDATE: Edit,
    DELETE: Trash2,
    APPROVE: CheckCircle,
    REJECT: Trash2,
    ASSIGN: User,
    RETURN: User
}

const actionColors = {
    CREATE: 'bg-green-500',
    UPDATE: 'bg-blue-500',
    DELETE: 'bg-red-500',
    APPROVE: 'bg-emerald-500',
    REJECT: 'bg-orange-500',
    ASSIGN: 'bg-cyan-500',
    RETURN: 'bg-yellow-500'
}

const actionLabels = {
    CREATE: 'أنشأ',
    UPDATE: 'حدّث',
    DELETE: 'حذف',
    APPROVE: 'وافق على',
    REJECT: 'رفض',
    ASSIGN: 'عيّن',
    RETURN: 'أرجع'
}

const entityLabels = {
    ASSET: 'أصل',
    EMPLOYEE: 'موظف',
    TICKET: 'تذكرة',
    USER: 'مستخدم',
    DEPARTMENT: 'قسم',
    LOCATION: 'موقع'
}

export async function ActivityList() {
    const result = await getActivityFeed(50)

    if (!result.success || !result.data) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                فشل تحميل الأنشطة
            </div>
        )
    }

    const activities = result.data

    if (activities.length === 0) {
        return (
            <div className="text-center py-12">
                <Activity className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground">لا توجد أنشطة حتى الآن</p>
            </div>
        )
    }

    return (
        <ScrollArea className="h-[600px]" dir="rtl">
            <div className="space-y-3 px-1">
                {activities.map((activity) => {
                    const ActionIcon = actionIcons[activity.action as keyof typeof actionIcons] || Activity
                    const actionColor = actionColors[activity.action as keyof typeof actionColors] || 'bg-gray-500'
                    const actionLabel = actionLabels[activity.action as keyof typeof actionLabels] || activity.action
                    const entityLabel = entityLabels[activity.entityType as keyof typeof entityLabels] || activity.entityType

                    return (
                        <Card key={activity.id} className="hover:shadow-md transition-all border-r-4" style={{ borderRightColor: actionColor.replace('bg-', '#') }}>
                            <CardContent className="p-4">
                                <div className="flex gap-3">
                                    <div className={`h-10 w-10 rounded-full ${actionColor} text-white flex items-center justify-center shrink-0`}>
                                        <ActionIcon className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <p className="text-sm font-medium">
                                                <span className="font-bold">{activity.user}</span>
                                                {' '}
                                                <span className="text-muted-foreground">{actionLabel}</span>
                                                {' '}
                                                <Badge variant="outline" className="text-xs">
                                                    {entityLabel}
                                                </Badge>
                                            </p>
                                            <span className="text-xs text-muted-foreground shrink-0">
                                                {formatDistanceToNow(new Date(activity.timestamp), {
                                                    addSuffix: true,
                                                    locale: ar
                                                })}
                                            </span>
                                        </div>
                                        {activity.entityName && (
                                            <p className="text-sm text-muted-foreground mb-2">
                                                {activity.entityName}
                                            </p>
                                        )}
                                        {activity.details && (
                                            <div className="text-xs bg-muted/50 rounded p-2 font-mono">
                                                {Object.entries(activity.details).map(([key, value]) => (
                                                    <div key={key} className="flex gap-2">
                                                        <span className="font-semibold">{key}:</span>
                                                        <span>{String(value)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </ScrollArea>
    )
}
