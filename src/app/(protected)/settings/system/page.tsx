'use client'

export const dynamic = 'force-dynamic';

import { useState } from 'react'
import { PremiumPageHeader } from '@/components/ui/premium-page-header'
import { AlertTriangle, Database, Download, RefreshCcw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
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
import { factoryReset, exportSystemData } from '@/app/actions/system'
import { toast } from 'sonner'

export default function SystemSettingsPage() {
    const [password, setPassword] = useState('')
    const [isResetting, setIsResetting] = useState(false)
    const [isExporting, setIsExporting] = useState(false)

    const handleReset = async () => {
        if (!password) {
            toast.error('يرجى إدخال كلمة المرور')
            return
        }

        setIsResetting(true)
        const result = await factoryReset(password)

        if (result.success) {
            toast.success('تم حذف جميع البيانات بنجاح')
            setPassword('')
            setTimeout(() => {
                window.location.href = '/dashboard'
            }, 1500)
        } else {
            toast.error(result.error)
        }
        setIsResetting(false)
    }

    const handleExport = async () => {
        setIsExporting(true)
        const result = await exportSystemData()

        if (result.success) {
            const blob = new Blob([JSON.stringify(result.data, null, 2)], {
                type: 'application/json'
            })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `backup-${new Date().toISOString().split('T')[0]}.json`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
            toast.success('تم تصدير النسخة الاحتياطية بنجاح')
        } else {
            toast.error(result.error)
        }
        setIsExporting(false)
    }

    return (
        <div className="flex flex-col gap-6">
            <PremiumPageHeader
                title="إدارة النظام"
                description="إعدادات متقدمة للنظام والبيانات"
                icon={Database}
            />

            <div className="grid gap-6">
                {/* Backup Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>النسخ الاحتياطي</CardTitle>
                        <CardDescription>تصدير واستيراد بيانات النظام</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                            <div>
                                <h3 className="font-semibold text-base mb-1">تصدير النسخة الاحتياطية</h3>
                                <p className="text-sm text-muted-foreground">
                                    تصدير جميع بيانات النظام كملف JSON
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={handleExport}
                                disabled={isExporting}
                                className="gap-2"
                            >
                                <Download className="h-4 w-4" />
                                {isExporting ? 'جاري التصدير...' : 'تصدير'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-destructive/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-5 w-5" />
                            منطقة الخطر
                        </CardTitle>
                        <CardDescription>
                            إجراءات حرجة يمكن أن تؤثر على بيانات النظام
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/5">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
                                        <RefreshCcw className="h-4 w-4" />
                                        إعادة تعيين النظام
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        سيتم حذف جميع البيانات بشكل نهائي:
                                    </p>
                                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside mb-4">
                                        <li>جميع الموظفين والعهد</li>
                                        <li>جميع الأصول والمستندات</li>
                                        <li>المواد الاستهلاكية والمعاملات</li>
                                        <li>التذاكر وطلبات الدعم</li>
                                        <li>المخزون وأجهزة الشبكة</li>
                                    </ul>
                                    <div className="flex items-center gap-2 p-3 rounded-md bg-yellow-500/10 border border-yellow-500/20">
                                        <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                                        <p className="text-sm font-medium text-yellow-600">
                                            لن يتم حذف: المستخدمين، بيانات الشركة، الإدارات، والمواقع
                                        </p>
                                    </div>
                                </div>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="lg" className="gap-2 flex-shrink-0">
                                            <Database className="h-4 w-4" />
                                            حذف جميع البيانات
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="max-w-md">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                                                <AlertTriangle className="h-5 w-5" />
                                                تحذير: عملية خطيرة!
                                            </AlertDialogTitle>
                                            <AlertDialogDescription className="text-base space-y-3 pt-2">
                                                <p className="font-semibold">
                                                    هذا الإجراء لا يمكن التراجع عنه!
                                                </p>
                                                <p>
                                                    سيتم حذف جميع البيانات نهائياً من النظام.
                                                </p>
                                                <p className="text-yellow-600 font-medium">
                                                    يُنصح بشدة بعمل نسخة احتياطية أولاً.
                                                </p>
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <div className="space-y-3 py-4">
                                            <Label htmlFor="reset-password" className="text-base font-semibold">
                                                كلمة مرور المسؤول للتأكيد:
                                            </Label>
                                            <Input
                                                id="reset-password"
                                                type="password"
                                                placeholder="أدخل كلمة المرور"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="h-12 text-base"
                                                dir="ltr"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                تحتاج إلى كلمة مرور المسؤول المحددة في ملف .env
                                            </p>
                                        </div>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    handleReset()
                                                }}
                                                disabled={!password || isResetting}
                                                className="bg-destructive hover:bg-destructive/90"
                                            >
                                                {isResetting ? 'جاري الحذف...' : 'نعم، احذف كل شيء'}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Info Card */}
                <Card className="border-blue-500/20 bg-blue-500/5">
                    <CardContent className="pt-6">
                        <div className="flex gap-3">
                            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                                <Database className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">نصيحة مهمة</h3>
                                <p className="text-sm text-muted-foreground">
                                    قبل إجراء أي عملية حذف، تأكد من تصدير نسخة احتياطية كاملة من البيانات.
                                    يمكنك استخدام ملف النسخة الاحتياطية لاستعادة البيانات لاحقاً إذا لزم الأمر.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
