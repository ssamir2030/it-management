"use client"

import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import { Database, HardDrive, Download, Upload, RefreshCw, Activity, AlertCircle, FileJson, Trash2, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getSystemLogs, exportSystemData, importSystemData, factoryReset } from "@/app/actions/system"
import { useEffect, useState, useRef } from "react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Shield } from "lucide-react"

type SystemLog = {
    id: string
    action: string
    entity: string
    details: string | null
    createdAt: Date
    user: {
        name: string | null
        email: string | null
        image: string | null
    } | null
}

interface SystemViewProps {
    readOnly: boolean
}

export default function SystemView({ readOnly }: SystemViewProps) {
    const [logs, setLogs] = useState<SystemLog[]>([])
    const [loadingLogs, setLoadingLogs] = useState(true)
    const [isExporting, setIsExporting] = useState(false)
    const [isImporting, setIsImporting] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const fetchLogs = async () => {
        setLoadingLogs(true)
        const result = await getSystemLogs()
        if (result.success && result.data) {
            setLogs(result.data)
        }
        setLoadingLogs(false)
    }

    useEffect(() => {
        fetchLogs()
    }, [])

    const handleExport = async () => {
        if (readOnly) return
        setIsExporting(true)
        try {
            const result = await exportSystemData()
            if (result.success && result.data) {
                // Trigger download
                const blob = new Blob([result.data], { type: 'application/json' })
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `system-backup-${new Date().toISOString().split('T')[0]}.json`
                document.body.appendChild(a)
                a.click()
                window.URL.revokeObjectURL(url)
                document.body.removeChild(a)

                toast.success("تم تصدير النسخة الاحتياطية بنجاح")
                fetchLogs() // Refresh logs to show export event
            } else {
                toast.error("فشل تصدير البيانات")
            }
        } catch (error) {
            toast.error("حدث خطأ غير متوقع")
        } finally {
            setIsExporting(false)
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = async (event) => {
            const content = event.target?.result as string
            if (content) {
                handleImport(content)
            }
        }
        reader.readAsText(file)
    }

    const handleImport = async (jsonContent: string) => {
        setIsImporting(true)
        toast.promise(importSystemData(jsonContent), {
            loading: 'جاري استعادة النظام... الرجاء الانتظار',
            success: () => {
                fetchLogs()
                return 'تم استعادة النظام بنجاح'
            },
            error: (err) => `فشل الاستعادة: ${err}`,
            finally: () => setIsImporting(false)
        })
    }

    return (
        <div className="space-y-6" dir="rtl">
            <PremiumPageHeader
                backLink="/admin/settings"
                backText="الإعدادات"
                title="إدارة النظام"
                description="النسخ الاحتياطي، الاستعادة، وسجلات النظام"
                icon={Database}
            />

            {readOnly && (
                <Alert variant="default" className="bg-muted border-primary/20">
                    <Shield className="h-4 w-4" />
                    <AlertTitle>وضع المشاهدة فقط</AlertTitle>
                    <AlertDescription>
                        يمكنك الاطلاع على سجلات النظام، ولكن لا يمكنك إجراء عمليات النسخ الاحتياطي أو الاستعادة.
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid gap-6 md:grid-cols-2">
                {/* Backup Card */}
                <Card className="md:col-span-2 bg-gradient-to-br from-card to-muted/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <HardDrive className="w-5 h-5 text-blue-500" />
                            النسخ الاحتياطي والاستعادة
                        </CardTitle>
                        <CardDescription>
                            قم بتصدير نسخة كاملة من بيانات النظام أو استعادتها عند الحاجة.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-4">
                        <Button
                            onClick={handleExport}
                            disabled={isExporting || isImporting || readOnly}
                            className="h-12 px-6 text-lg bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={readOnly ? "ليس لديك صلاحية التصدير" : ""}
                        >
                            <Download className={`w-5 h-5 ml-2 ${isExporting ? 'animate-bounce' : ''}`} />
                            {isExporting ? 'جاري التصدير...' : 'تحميل نسخة احتياطية كاملة'}
                        </Button>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    disabled={isExporting || isImporting || readOnly}
                                    className="h-12 px-6 text-lg border-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title={readOnly ? "ليس لديك صلاحية الاستيراد" : ""}
                                >
                                    <Upload className="w-5 h-5 ml-2" />
                                    استيراد نسخة (Restore)
                                </Button>
                            </AlertDialogTrigger>
                            {!readOnly && (
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="text-destructive flex items-center gap-2">
                                            <AlertCircle className="w-5 h-5" />
                                            تحذير: إجراء حساس
                                        </AlertDialogTitle>
                                        <AlertDialogDescription className="leading-relaxed">
                                            عملية الاستعادة ستقوم <b>بمسح جميع البيانات الحالية</b> واستبدالها بالبيانات الموجودة في ملف النسخة الاحتياطية.
                                            <br /><br />
                                            هل أنت متأكد تماماً من رغبتك في المتابعة؟
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => fileInputRef.current?.click()}
                                            className="bg-destructive hover:bg-destructive/90"
                                        >
                                            نعم، اختر الملف واستعد
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            )}
                        </AlertDialog>

                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept=".json"
                            onChange={handleFileSelect}
                        />
                    </CardContent>
                </Card>

                {/* Audit Logs */}
                <Card className="md:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="w-5 h-5 text-green-500" />
                                سجل أحداث النظام (Audit Log)
                            </CardTitle>
                            <CardDescription>تتبع جميع العمليات الحساسة التي تمت في النظام</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" onClick={fetchLogs} disabled={loadingLogs}>
                            <RefreshCw className={`w-4 h-4 ${loadingLogs ? 'animate-spin' : ''}`} />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="text-right">المستخدم</TableHead>
                                        <TableHead className="text-right">الحدث</TableHead>
                                        <TableHead className="text-right">التفاصيل</TableHead>
                                        <TableHead className="text-right">التاريخ</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loadingLogs ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center">
                                                جاري تحميل السجلات...
                                            </TableCell>
                                        </TableRow>
                                    ) : logs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                                لا توجد سجلات بعد
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        logs.map((log) => (
                                            <TableRow key={log.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-6 w-6">
                                                            <AvatarImage src={log.user?.image || undefined} />
                                                            <AvatarFallback className="text-[10px]">{log.user?.name?.slice(0, 2)}</AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-sm">{log.user?.name || "النظام"}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="font-mono text-xs">
                                                        {log.action} : {log.entity}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="max-w-[300px] truncate text-muted-foreground" title={log.details || ''}>
                                                    {log.details || '-'}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-xs" dir="ltr">
                                                    {new Date(log.createdAt).toLocaleString('en-US')}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Danger Zone: Factory Reset */}
            <Card className="border-destructive/50 bg-destructive/5 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="w-5 h-5" />
                        منطقة الخطر: إعادة ضبط المصنع
                    </CardTitle>
                    <CardDescription className="text-destructive/80">
                        هذه الإجراءات لا يمكن التراجع عنها. يرجى الحذر الشديد.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between bg-card p-4 rounded-lg border border-destructive/20">
                        <div>
                            <h4 className="font-medium text-destructive">حذف جميع بيانات النظام</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                                سيقوم هذا الإجراء بحذف جميع الأصول، التذاكر، الموظفين، والهيكل التنظيمي، واستعادة النظام لحالته الأولية.
                                <br />
                                <b>لن يتم حذف حسابك المسؤول الحالي.</b>
                            </p>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="destructive"
                                    disabled={loadingLogs || readOnly}
                                    title={readOnly ? "ليس لديك صلاحية إعادة الضبط" : ""}
                                >
                                    <Trash2 className="w-4 h-4 ml-2" />
                                    حذف كل البيانات
                                </Button>
                            </AlertDialogTrigger>
                            {!readOnly && (
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="text-destructive flex items-center gap-2 text-xl">
                                            <AlertTriangle className="w-6 h-6" />
                                            تحذير نهائي: هل أنت متأكد؟
                                        </AlertDialogTitle>
                                        <AlertDialogDescription className="text-base leading-relaxed bg-destructive/10 p-4 rounded-md border border-destructive/20 text-destructive-foreground mt-2">
                                            أنت على وشك <b>حذف قاعدة البيانات بالكامل</b>.
                                            <ul className="list-disc list-inside mt-2 space-y-1 text-sm font-medium">
                                                <li>سيتم حذف جميع الأصول والتذاكر.</li>
                                                <li>سيتم حذف جميع سجلات الموظفين والأقسام.</li>
                                                <li>سيتم حذف جميع سجلات التدقيق (Audit Logs).</li>
                                                <li>سيتم حذف جميع المستخدمين الآخرين.</li>
                                            </ul>
                                            <br />
                                            هذا الإجراء <b>لا يمكن التراجع عنه</b> نهائياً.
                                            <div className="mt-4">
                                                <label className="text-sm font-bold text-destructive-foreground block mb-2">أدخل كلمة مرور المسؤول للتأكيد:</label>
                                                <input
                                                    type="password"
                                                    className="w-full p-2 border border-destructive/30 rounded bg-white dark:bg-black"
                                                    placeholder="كلمة المرور"
                                                    id="reset-password-input"
                                                />
                                            </div>
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter className="gap-2">
                                        <AlertDialogCancel className="mt-0">تراجع (آمن)</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => {
                                                const passwordInput = document.getElementById('reset-password-input') as HTMLInputElement
                                                const password = passwordInput?.value || ''

                                                if (!password) {
                                                    toast.error("كلمة المرور مطلوبة")
                                                    return
                                                }

                                                toast.promise(factoryReset(password), {
                                                    loading: 'جاري فرمتة النظام... لا تغلق الصفحة',
                                                    success: () => {
                                                        fetchLogs()
                                                        return 'تم إعادة ضبط المصنع بنجاح'
                                                    },
                                                    error: (err) => `فشل العملية: ${err}`
                                                })
                                            }}
                                            className="bg-red-700 hover:bg-red-800 text-white font-bold"
                                        >
                                            نعم، احذف كل شيء الآن
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            )}
                        </AlertDialog>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
