"use client"

import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Activity, AlertCircle, AlertTriangle, CheckCircle2, ChevronLeft, Info, RefreshCw } from "lucide-react"
import { getSystemHealthStatus } from "@/app/actions/health-check"
import { cn } from "@/lib/utils"
import Link from "next/link"

export function HealthCheckDialog() {
    const [open, setOpen] = React.useState(false)
    const [loading, setLoading] = React.useState(false)
    const [data, setData] = React.useState<any>(null)

    const runScan = async () => {
        setLoading(true)
        const result = await getSystemHealthStatus()
        if (result.success) {
            setData(result.data)
        }
        setLoading(false)
    }

    React.useEffect(() => {
        if (open && !data) {
            runScan()
        }
    }, [open])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 h-8">
                    <Activity className="h-4 w-4" />
                    <span>فحص النظام</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl text-right" dir="rtl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <Activity className="h-6 w-6 text-blue-500" />
                        فحص صحة وجودة البيانات
                    </DialogTitle>
                    <DialogDescription>
                        تحليل تلقائي لجودة البيانات، مستويات الخدمة، وحالة التراخيص الأصول.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <RefreshCw className="h-12 w-12 text-blue-500 animate-spin" />
                            <p className="text-muted-foreground animate-pulse">جاري تحليل البيانات...</p>
                        </div>
                    ) : data ? (
                        <div className="space-y-6">
                            {/* Score Panel */}
                            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-2xl border border-blue-100 dark:border-blue-900">
                                <div>
                                    <h3 className="text-lg font-bold text-blue-900 dark:text-blue-300">مؤشر جودة النظام</h3>
                                    <p className="text-sm text-blue-700 dark:text-blue-400">آخر فحص: {new Date(data.lastScan).toLocaleTimeString('ar-SA')}</p>
                                </div>
                                <div className="text-5xl font-black text-blue-600 dark:text-blue-400">
                                    %{data.score}
                                </div>
                            </div>

                            {/* Issues List */}
                            <div className="space-y-3">
                                <h4 className="font-bold text-sm text-muted-foreground">التنبيهات والملاحظات ({data.issues.length})</h4>
                                {data.issues.length > 0 ? (
                                    data.issues.map((issue: any) => (
                                        <div
                                            key={issue.id}
                                            className={cn(
                                                "group flex items-center justify-between p-4 rounded-xl border transition-all hover:shadow-md",
                                                issue.severity === 'critical' ? "border-red-100 bg-red-50/30 dark:border-red-900/50 dark:bg-red-950/10" :
                                                    issue.severity === 'warning' ? "border-amber-100 bg-amber-50/30 dark:border-amber-900/50 dark:bg-amber-950/10" :
                                                        "border-blue-100 bg-blue-50/30 dark:border-blue-900/50 dark:bg-blue-950/10"
                                            )}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "p-2 rounded-full",
                                                    issue.severity === 'critical' ? "bg-red-100 text-red-600" :
                                                        issue.severity === 'warning' ? "bg-amber-100 text-amber-600" :
                                                            "bg-blue-100 text-blue-600"
                                                )}>
                                                    {issue.severity === 'critical' ? <AlertCircle className="h-5 w-5" /> :
                                                        issue.severity === 'warning' ? <AlertTriangle className="h-5 w-5" /> :
                                                            <Info className="h-5 w-5" />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-foreground">{issue.title}</p>
                                                    <p className="text-sm text-muted-foreground">{issue.description}</p>
                                                </div>
                                            </div>
                                            <Link href={issue.actionUrl} onClick={() => setOpen(false)}>
                                                <Button variant="ghost" size="sm" className="gap-1">
                                                    إصلاح
                                                    <ChevronLeft className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 gap-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed">
                                        <CheckCircle2 className="h-10 w-10 text-green-500" />
                                        <p className="font-bold">أحسنت! لا توجد مشاكل تم اكتشافها</p>
                                        <p className="text-sm text-muted-foreground">بيانات النظام مكتملة وتعمل بشكل مثالي.</p>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 flex justify-between">
                                <Button variant="outline" onClick={runScan} disabled={loading}>
                                    <RefreshCw className={cn("ml-2 h-4 w-4", loading && "animate-spin")} />
                                    إعادة الفحص
                                </Button>
                                <Button onClick={() => setOpen(false)}>إغلاق</Button>
                            </div>
                        </div>
                    ) : null}
                </div>
            </DialogContent>
        </Dialog>
    )
}
