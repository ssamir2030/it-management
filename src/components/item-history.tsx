'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { History, User, Calendar, Globe, Monitor, GitCompare } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import { getItemHistory } from '@/app/actions/history'

interface HistoryEntry {
    id: string
    action: string
    userName: string
    userId: string
    changes: Record<string, any> | null
    ipAddress: string | null
    userAgent: string | null
    timestamp: Date | string
}

interface ItemHistoryProps {
    entityType: string
    entityId: string
    title?: string
}

const actionColors: Record<string, string> = {
    CREATE: 'bg-green-500',
    UPDATE: 'bg-blue-500',
    DELETE: 'bg-red-500',
    ASSIGN: 'bg-cyan-500',
    RETURN: 'bg-yellow-500'
}

const actionLabels: Record<string, string> = {
    CREATE: 'إنشاء',
    UPDATE: 'تحديث',
    DELETE: 'حذف',
    ASSIGN: 'تعيين',
    RETURN: 'إرجاع'
}

export function ItemHistory({ entityType, entityId, title = 'سجل التغييرات' }: ItemHistoryProps) {
    const [history, setHistory] = useState<HistoryEntry[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadHistory()
    }, [entityType, entityId])

    const loadHistory = async () => {
        setLoading(true)
        const result = await getItemHistory(entityType, entityId)
        if (result.success && result.data) {
            setHistory(result.data)
        }
        setLoading(false)
    }

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        {title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                        <p className="text-sm text-muted-foreground mt-4">جاري التحميل...</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (history.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        {title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <History className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-2" />
                        <p className="text-sm text-muted-foreground">لا يوجد سجل تغييرات</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    {title}
                </CardTitle>
                <CardDescription>
                    {history.length} {history.length === 1 ? 'تغيير' : 'تغييرات'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-4">
                        {history.map((entry, index) => {
                            const actionColor = actionColors[entry.action] || 'bg-gray-500'
                            const actionLabel = actionLabels[entry.action] || entry.action

                            return (
                                <div key={entry.id} className="relative">
                                    {/* Timeline Line */}
                                    {index < history.length - 1 && (
                                        <div className="absolute right-[19px] top-10 bottom-0 w-[2px] bg-border" />
                                    )}

                                    <div className="flex gap-3">
                                        {/* Icon */}
                                        <div className={`h-10 w-10 rounded-full ${actionColor} text-white flex items-center justify-center shrink-0 z-10`}>
                                            <History className="h-5 w-5" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="bg-accent/50 rounded-lg p-4 border">
                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                    <div>
                                                        <Badge variant="outline" className="mb-1">
                                                            {actionLabel}
                                                        </Badge>
                                                        <p className="text-sm font-medium">
                                                            {entry.userName}
                                                        </p>
                                                    </div>
                                                    <span className="text-xs text-muted-foreground shrink-0">
                                                        {formatDistanceToNow(new Date(entry.timestamp), {
                                                            addSuffix: true,
                                                            locale: ar
                                                        })}
                                                    </span>
                                                </div>

                                                {/* Changes */}
                                                {entry.changes && Object.keys(entry.changes).length > 0 && (
                                                    <div className="mt-3 space-y-2">
                                                        <p className="text-xs font-semibold text-muted-foreground">التغييرات:</p>
                                                        <div className="bg-background/50 rounded p-2 text-xs font-mono space-y-1">
                                                            {Object.entries(entry.changes).map(([key, value]) => (
                                                                <div key={key} className="flex gap-2">
                                                                    <span className="font-semibold text-primary">{key}:</span>
                                                                    <span className="text-muted-foreground">{String(value)}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Metadata */}
                                                <div className="mt-3 pt-3 border-t flex flex-wrap gap-4 text-xs text-muted-foreground">
                                                    {entry.ipAddress && (
                                                        <div className="flex items-center gap-1">
                                                            <Globe className="h-3 w-3" />
                                                            {entry.ipAddress}
                                                        </div>
                                                    )}
                                                    {entry.userAgent && (
                                                        <div className="flex items-center gap-1">
                                                            <Monitor className="h-3 w-3" />
                                                            {entry.userAgent.split(' ')[0]}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
