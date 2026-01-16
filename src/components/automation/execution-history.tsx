"use client"

import { useState } from "react"
import {
    CheckCircle2,
    XCircle,
    Clock,
    Loader2,
    Filter,
    Trash2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

export type ExecutionLogEntry = {
    id: string
    timestamp: Date
    action: string
    targetCount: number
    status: 'success' | 'error' | 'pending'
    message?: string
}

interface ExecutionHistoryProps {
    logs: ExecutionLogEntry[]
    onClear?: () => void
}

export default function ExecutionHistory({ logs, onClear }: ExecutionHistoryProps) {
    const [filter, setFilter] = useState<'all' | 'success' | 'error'>('all')

    const filteredLogs = logs.filter(log => {
        if (filter === 'all') return true
        return log.status === filter
    })

    const successCount = logs.filter(l => l.status === 'success').length
    const errorCount = logs.filter(l => l.status === 'error').length

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-3 bg-slate-800/50 border-b border-slate-700">
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="font-medium text-sm text-slate-300">سجل العمليات</span>
                    <Badge variant="outline" className="text-[10px] border-slate-700">
                        {logs.length} عملية
                    </Badge>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setFilter('all')}
                            className={cn(
                                "h-6 px-2 text-[10px]",
                                filter === 'all' ? "bg-slate-700 text-white" : "text-slate-500"
                            )}
                        >
                            الكل
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setFilter('success')}
                            className={cn(
                                "h-6 px-2 text-[10px]",
                                filter === 'success' ? "bg-emerald-900 text-emerald-300" : "text-slate-500"
                            )}
                        >
                            ✓ {successCount}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setFilter('error')}
                            className={cn(
                                "h-6 px-2 text-[10px]",
                                filter === 'error' ? "bg-rose-900 text-rose-300" : "text-slate-500"
                            )}
                        >
                            ✗ {errorCount}
                        </Button>
                    </div>

                    {onClear && logs.length > 0 && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClear}
                            className="h-6 w-6 text-slate-500 hover:text-rose-400"
                        >
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Logs List */}
            <ScrollArea className="h-[300px]">
                {filteredLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-600 py-12">
                        <Clock className="h-8 w-8 mb-2 opacity-50" />
                        <span className="text-sm">لا توجد عمليات</span>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-800">
                        {filteredLogs.map((log) => (
                            <div
                                key={log.id}
                                className="p-3 hover:bg-slate-800/30 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-2">
                                        {log.status === 'success' && (
                                            <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                                        )}
                                        {log.status === 'error' && (
                                            <XCircle className="h-4 w-4 text-rose-400 mt-0.5 shrink-0" />
                                        )}
                                        {log.status === 'pending' && (
                                            <Loader2 className="h-4 w-4 text-amber-400 mt-0.5 shrink-0 animate-spin" />
                                        )}

                                        <div>
                                            <div className="font-medium text-sm text-slate-200">
                                                {log.action}
                                            </div>
                                            {log.message && (
                                                <div className="text-xs text-slate-500 mt-0.5">
                                                    {log.message}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="text-left shrink-0">
                                        <div className="text-[10px] text-slate-500">
                                            {log.timestamp.toLocaleTimeString('ar-SA')}
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className="text-[9px] mt-1 border-slate-700 text-slate-500"
                                        >
                                            {log.targetCount} جهاز
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </ScrollArea>
        </div>
    )
}
