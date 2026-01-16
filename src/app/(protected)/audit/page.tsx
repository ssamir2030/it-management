export const dynamic = 'force-dynamic';

import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getAuditLogs } from '@/lib/audit'
import {
    Shield,
    Plus,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    User,
    Clock,
    Calendar
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import { PremiumPageHeader } from "@/components/ui/premium-page-header"

const actionIcons = {
    CREATE: Plus,
    UPDATE: Edit,
    DELETE: Trash2,
    APPROVE: CheckCircle,
    REJECT: XCircle,
    LOGIN: User,
    LOGOUT: User,
    ASSIGN: User,
    RETURN: User
}

const actionColors = {
    CREATE: 'bg-green-500',
    UPDATE: 'bg-blue-500',
    DELETE: 'bg-red-500',
    APPROVE: 'bg-emerald-500',
    REJECT: 'bg-orange-500',
    LOGIN: 'bg-purple-500',
    LOGOUT: 'bg-gray-500',
    ASSIGN: 'bg-cyan-500',
    RETURN: 'bg-yellow-500'
}

const actionLabels = {
    CREATE: 'إنشاء',
    UPDATE: 'تحديث',
    DELETE: 'حذف',
    APPROVE: 'موافقة',
    REJECT: 'رفض',
    LOGIN: 'تسجيل دخول',
    LOGOUT: 'تسجيل خروج',
    ASSIGN: 'تعيين',
    RETURN: 'إرجاع'
}

const entityLabels = {
    ASSET: 'أصل',
    EMPLOYEE: 'موظف',
    TICKET: 'تذكرة',
    USER: 'مستخدم',
    DEPARTMENT: 'قسم',
    LOCATION: 'موقع',
    LICENSE: 'ترخيص',
    CONTRACT: 'عقد'
}

async function AuditLogList() {
    const result = await getAuditLogs(100)

    if (!result.success || !result.data) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                فشل تحميل سجلات التدقيق
            </div>
        )
    }

    const logs = result.data

    if (logs.length === 0) {
        return (
            <div className="text-center py-12">
                <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">لا توجد سجلات حتى الآن</p>
            </div>
        )
    }

    return (
        <ScrollArea className="h-[calc(100vh-250px)]">
            <div className="relative space-y-4 px-4">
                {/* Timeline Line */}
                <div className="absolute right-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 via-primary/30 to-transparent" />

                {logs.map((log, index) => {
                    const ActionIcon = actionIcons[log.action as keyof typeof actionIcons] || Shield
                    const actionColor = actionColors[log.action as keyof typeof actionColors] || 'bg-gray-500'
                    const actionLabel = actionLabels[log.action as keyof typeof actionLabels] || log.action
                    const entityLabel = entityLabels[log.entityType as keyof typeof entityLabels] || log.entityType

                    return (
                        <div key={log.id} className="relative flex gap-4 items-start group">
                            {/* Icon Circle */}
                            <div className={`relative z-10 flex items-center justify-center h-12 w-12 rounded-full ${actionColor} text-white shadow-lg ring-4 ring-background group-hover:scale-110 transition-transform`}>
                                <ActionIcon className="h-6 w-6" />
                            </div>

                            {/* Content Card */}
                            <Card className="flex-1 border-l-4 hover:shadow-md transition-all group-hover:border-primary" style={{ borderLeftColor: actionColor.replace('bg-', '#') }}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 space-y-1">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <Badge variant="secondary" className="font-mono">
                                                    {actionLabel}
                                                </Badge>
                                                <span className="text-muted-foreground text-sm">
                                                    {entityLabel}
                                                </span>
                                            </CardTitle>
                                            <CardDescription className="text-sm">
                                                {log.entityName && (
                                                    <span className="font-medium text-foreground">
                                                        {log.entityName}
                                                    </span>
                                                )}
                                            </CardDescription>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Clock className="h-3 w-3" />
                                            {formatDistanceToNow(new Date(log.createdAt), {
                                                addSuffix: true,
                                                locale: ar
                                            })}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <User className="h-3 w-3" />
                                            <span className="font-medium">{log.userName}</span>
                                        </div>

                                        {log.changes && (
                                            <div className="p-3 bg-muted/50 rounded-lg font-mono text-xs border">
                                                <pre className="whitespace-pre-wrap">
                                                    {JSON.stringify(JSON.parse(log.changes), null, 2)}
                                                </pre>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(log.createdAt).toLocaleString('ar-SA')}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )
                })}
            </div>
        </ScrollArea>
    )
}

export default async function AuditPage() {
    return (
        <div className="space-y-6">
            <PremiumPageHeader
                title="سجل التدقيق"
                description="تتبع جميع العمليات والأنشطة في النظام"
                icon={Shield}
            />

            <Card className="border-2">
                <CardHeader className="bg-muted/50">
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        الخط الزمني للأحداث
                    </CardTitle>
                    <CardDescription>
                        جميع الأحداث مرتبة من الأحدث إلى الأقدم
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <Suspense fallback={
                        <div className="text-center py-12">
                            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                            <p className="text-muted-foreground mt-4">جاري التحميل...</p>
                        </div>
                    }>
                        <AuditLogList />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    )
}
