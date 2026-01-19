'use client'

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react'
import { restoreBackup, exportDatabaseBackup, exportTableAsCSV, getBackupStats } from "@/app/actions/backup"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
    AlertTriangle,
    Download,
    Upload,
    Database,
    FileJson,
    FileSpreadsheet,
    RefreshCw,
    HardDrive,
    Users,
    Building2,
    MapPin,
    Ticket,
    Truck,
    Package,
    Key,
    CheckCircle2
} from "lucide-react"
import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import { toast } from "sonner"

const tables = [
    { id: 'assets', name: 'الأصول', icon: HardDrive },
    { id: 'employees', name: 'الموظفين', icon: Users },
    { id: 'departments', name: 'الإدارات', icon: Building2 },
    { id: 'locations', name: 'المواقع', icon: MapPin },
    { id: 'tickets', name: 'التذاكر', icon: Ticket },
    { id: 'suppliers', name: 'الموردين', icon: Truck },
    { id: 'inventory', name: 'المخزون', icon: Package },
    { id: 'licenses', name: 'التراخيص', icon: Key }
]

export default function BackupPage() {
    const [loading, setLoading] = useState(false)
    const [stats, setStats] = useState<any>(null)
    const [statsLoading, setStatsLoading] = useState(true)
    const [exporting, setExporting] = useState(false)
    const [exportingTable, setExportingTable] = useState<string | null>(null)

    useEffect(() => {
        loadStats()
    }, [])

    const loadStats = async () => {
        setStatsLoading(true)
        const result = await getBackupStats()
        if (result.success) setStats(result.data)
        setStatsLoading(false)
    }

    async function handleRestore(formData: FormData) {
        if (!confirm("تحذير: استعادة النسخة الاحتياطية ستقوم بحذف جميع البيانات الحالية واستبدالها بالنسخة الجديدة. هل أنت متأكد؟")) {
            return
        }

        setLoading(true)
        const res = await restoreBackup(formData)
        setLoading(false)

        if (res.success) {
            toast.success("تم استعادة النسخة الاحتياطية بنجاح")
            window.location.reload()
        } else {
            toast.error("حدث خطأ أثناء الاستعادة")
        }
    }

    const handleExportJSON = async () => {
        setExporting(true)
        try {
            const result = await exportDatabaseBackup()
            if (result.success && result.data) {
                const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `backup_${new Date().toISOString().split('T')[0]}.json`
                a.click()
                URL.revokeObjectURL(url)
                toast.success(result.message)
            } else {
                toast.error(result.error)
            }
        } catch (error) {
            toast.error('فشل في التصدير')
        }
        setExporting(false)
    }

    const handleExportCSV = async (tableName: string) => {
        setExportingTable(tableName)
        try {
            const result = await exportTableAsCSV(tableName)
            if (result.success && result.data) {
                const blob = new Blob([result.data], { type: 'text/csv;charset=utf-8;' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = result.filename || `${tableName}.csv`
                a.click()
                URL.revokeObjectURL(url)
                toast.success(`تم تصدير ${result.count} سجل`)
            } else {
                toast.error(result.error)
            }
        } catch (error) {
            toast.error('فشل في التصدير')
        }
        setExportingTable(null)
    }

    return (
        <div className="flex flex-col gap-6" dir="rtl">
            <PremiumPageHeader
                title="النسخ الاحتياطي والاسترداد"
                description="إدارة النسخ الاحتياطية واستعادة البيانات"
                icon={Database}
                rightContent={
                    <Button variant="outline" onClick={loadStats} className="gap-2 text-white border-white/30 hover:bg-white/10">
                        <RefreshCw className="h-4 w-4" />
                        تحديث
                    </Button>
                }
            />

            {/* Stats Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5 text-blue-500" />
                        إحصائيات قاعدة البيانات
                    </CardTitle>
                    <CardDescription>عدد السجلات في كل جدول</CardDescription>
                </CardHeader>
                <CardContent>
                    {statsLoading ? (
                        <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
                            {stats && Object.entries(stats).filter(([key]) => key !== 'total').map(([key, value]) => (
                                <div key={key} className="p-4 rounded-xl border bg-muted/30 text-center">
                                    <p className="text-2xl font-bold">{String(value)}</p>
                                    <p className="text-sm text-muted-foreground capitalize">
                                        {key === 'assets' ? 'الأصول' :
                                            key === 'employees' ? 'الموظفين' :
                                                key === 'departments' ? 'الإدارات' :
                                                    key === 'locations' ? 'المواقع' :
                                                        key === 'tickets' ? 'التذاكر' :
                                                            key === 'requests' ? 'الطلبات' :
                                                                key === 'suppliers' ? 'الموردين' :
                                                                    key === 'inventory' ? 'المخزون' :
                                                                        key === 'licenses' ? 'التراخيص' : key}
                                    </p>
                                </div>
                            ))}
                            {stats && (
                                <div className="p-4 rounded-xl border bg-blue-50 dark:bg-blue-950 text-center border-blue-200 dark:border-blue-800">
                                    <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                                    <p className="text-sm text-blue-600">إجمالي السجلات</p>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Export Options */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* JSON Export */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileJson className="h-5 w-5 text-emerald-500" />
                            نسخة احتياطية كاملة (JSON)
                        </CardTitle>
                        <CardDescription>تصدير جميع البيانات في ملف JSON واحد</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            onClick={handleExportJSON}
                            disabled={exporting}
                            className="w-full gap-2"
                        >
                            {exporting ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                                <Download className="h-4 w-4" />
                            )}
                            {exporting ? 'جاري التصدير...' : 'تصدير JSON'}
                        </Button>
                    </CardContent>
                </Card>

                {/* DB Download */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Download className="h-5 w-5" />
                            تحميل قاعدة البيانات
                        </CardTitle>
                        <CardDescription>تحميل ملف قاعدة البيانات الكامل</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <a href="/api/backup/download" target="_blank">
                            <Button className="w-full gap-2" variant="outline">
                                <Download className="h-4 w-4" />
                                تحميل ملف .db
                            </Button>
                        </a>
                    </CardContent>
                </Card>
            </div>

            {/* Export by Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5 text-amber-500" />
                        تصدير حسب الجدول (CSV)
                    </CardTitle>
                    <CardDescription>تصدير جداول محددة بصيغة Excel/CSV</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                        {tables.map((table) => (
                            <Button
                                key={table.id}
                                variant="outline"
                                className="h-auto py-4 flex-col gap-2 hover:bg-muted/50"
                                onClick={() => handleExportCSV(table.id)}
                                disabled={exportingTable === table.id}
                            >
                                {exportingTable === table.id ? (
                                    <RefreshCw className="h-6 w-6 animate-spin" />
                                ) : (
                                    <table.icon className="h-6 w-6" />
                                )}
                                <span>{table.name}</span>
                                {stats && stats[table.id] !== undefined && (
                                    <Badge variant="secondary" className="text-xs">
                                        {stats[table.id]} سجل
                                    </Badge>
                                )}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Restore */}
            <Card className="border-red-200 dark:border-red-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                        <Upload className="h-5 w-5" />
                        استرداد نسخة احتياطية
                    </CardTitle>
                    <CardDescription>استعادة البيانات من ملف نسخة احتياطية سابق</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={handleRestore} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="backupFile">ملف النسخة الاحتياطية</Label>
                            <Input id="backupFile" name="backupFile" type="file" accept=".db" required />
                        </div>

                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md flex gap-3 items-start">
                            <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                            <p className="text-sm text-yellow-700 dark:text-yellow-400">
                                انتبه: هذه العملية لا يمكن التراجع عنها. سيتم استبدال جميع البيانات الحالية بالبيانات الموجودة في الملف.
                            </p>
                        </div>

                        <Button type="submit" variant="destructive" className="w-full" disabled={loading}>
                            {loading ? "جاري الاستعادة..." : "استرداد البيانات"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Info */}
            <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
                <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                        <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
                        <div className="space-y-2">
                            <h4 className="font-bold text-emerald-800 dark:text-emerald-200">نصائح للنسخ الاحتياطي</h4>
                            <ul className="text-sm text-emerald-700 dark:text-emerald-300 space-y-1">
                                <li>• قم بعمل نسخة احتياطية بشكل دوري (أسبوعي على الأقل)</li>
                                <li>• احفظ النسخ الاحتياطية في مكان آمن خارج الخادم</li>
                                <li>• ملفات JSON تحتوي على جميع البيانات ويمكن استخدامها للتحليل</li>
                                <li>• ملفات CSV مفيدة للتحليل في Excel أو Google Sheets</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
