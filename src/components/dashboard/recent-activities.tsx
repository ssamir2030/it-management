"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react"

interface RecentActivitiesProps {
    requests: any[]
}

export function RecentActivities({ requests }: RecentActivitiesProps) {
    if (!requests || requests.length === 0) {
        return (
            <Card className="col-span-3 card-elevated h-[400px]">
                <CardHeader>
                    <CardTitle>آخر النشاطات</CardTitle>
                    <CardDescription>لا توجد نشاطات حديثة لعرضها</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'COMPLETED': return <CheckCircle2 className="h-4 w-4 text-green-500" />
            case 'RESOLVED': return <CheckCircle2 className="h-4 w-4 text-green-500" />
            case 'IN_PROGRESS': return <Clock className="h-4 w-4 text-blue-500" />
            case 'PENDING': return <AlertCircle className="h-4 w-4 text-yellow-500" />
            case 'REJECTED': return <XCircle className="h-4 w-4 text-red-500" />
            default: return <Clock className="h-4 w-4 text-slate-500" />
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'مكتمل'
            case 'RESOLVED': return 'تم الحل'
            case 'IN_PROGRESS': return 'قيد التنفيذ'
            case 'PENDING': return 'قيد الانتظار'
            case 'REJECTED': return 'مرفوض'
            default: return status
        }
    }

    return (
        <Card className="col-span-3 card-elevated h-[400px] flex flex-col">
            <CardHeader>
                <CardTitle>آخر النشاطات</CardTitle>
                <CardDescription>
                    أحدث الطلبات والعمليات التي تمت في النظام
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="space-y-4">
                    {requests.map((req, i) => (
                        <div key={i} className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                            <div className="mt-1 bg-white dark:bg-slate-800 p-2 rounded-full shadow-sm">
                                {getStatusIcon(req.status)}
                            </div>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                        {req.employeeName}
                                    </p>
                                    <span className="text-[10px] text-muted-foreground bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                        {req.createdAt && !isNaN(new Date(req.createdAt).getTime())
                                            ? format(new Date(req.createdAt), "HH:mm", { locale: ar })
                                            : "--:--"}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                                    قام بإنشاء طلب جديد في قسم {req.department}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="outline" className="text-[10px] font-normal h-5">
                                        {getStatusText(req.status)}
                                    </Badge>
                                    <span className="text-[10px] text-slate-400">
                                        {req.createdAt && !isNaN(new Date(req.createdAt).getTime())
                                            ? format(new Date(req.createdAt), "d MMMM", { locale: ar })
                                            : ""}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
