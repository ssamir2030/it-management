"use client"

import { useEffect, useState } from "react"
import { getCommandStatus } from "@/app/actions/automation-agents"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, CheckCircle2, XCircle, Clock, Send } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

type Command = {
    id: string
    deviceId: string
    command: string
    status: string
    result: string | null
    errorMessage: string | null
    createdAt: Date
    sentAt: Date | null
    completedAt: Date | null
}

export default function CommandsMonitor() {
    const [commands, setCommands] = useState<Command[]>([])
    const [loading, setLoading] = useState(false)

    const fetchCommands = async () => {
        setLoading(true)
        const res = await getCommandStatus(30)
        if (res.success && res.data) {
            setCommands(res.data as Command[])
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchCommands()
        const interval = setInterval(fetchCommands, 5000)
        return () => clearInterval(interval)
    }, [])

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <Badge className="bg-amber-900 text-amber-300"><Clock className="h-3 w-3 ml-1" />معلق</Badge>
            case 'SENT':
                return <Badge className="bg-blue-900 text-blue-300"><Send className="h-3 w-3 ml-1" />مُرسل</Badge>
            case 'COMPLETED':
                return <Badge className="bg-emerald-900 text-emerald-300"><CheckCircle2 className="h-3 w-3 ml-1" />مكتمل</Badge>
            case 'FAILED':
                return <Badge className="bg-rose-900 text-rose-300"><XCircle className="h-3 w-3 ml-1" />فشل</Badge>
            default:
                return <Badge>{status}</Badge>
        }
    }

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between p-3 bg-slate-800/50 border-b border-slate-700">
                <h3 className="text-sm font-medium text-slate-300">مراقبة الأوامر (تحديث تلقائي)</h3>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={fetchCommands}
                    className="h-7 w-7"
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
            </div>

            <ScrollArea className="h-[400px]">
                {commands.length === 0 ? (
                    <div className="text-center text-slate-500 py-8">
                        لا توجد أوامر
                    </div>
                ) : (
                    <div className="divide-y divide-slate-800">
                        {commands.map(cmd => (
                            <div key={cmd.id} className="p-3 hover:bg-slate-800/30">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            {getStatusBadge(cmd.status)}
                                            <code className="text-xs text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded" dir="ltr">
                                                {cmd.deviceId}
                                            </code>
                                        </div>
                                        <div className="text-xs text-slate-300 font-mono truncate" dir="ltr" title={cmd.command}>
                                            {cmd.command.substring(0, 60)}...
                                        </div>
                                        {cmd.result && (
                                            <div className="mt-2 p-2 bg-black rounded text-xs text-emerald-400 font-mono max-h-20 overflow-auto" dir="ltr">
                                                {cmd.result}
                                            </div>
                                        )}
                                        {cmd.errorMessage && (
                                            <div className="mt-2 p-2 bg-rose-950/50 rounded text-xs text-rose-400" dir="ltr">
                                                {cmd.errorMessage}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-[10px] text-slate-600 text-left shrink-0">
                                        {new Date(cmd.createdAt).toLocaleTimeString('ar-SA')}
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
