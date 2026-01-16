'use client'

export const dynamic = 'force-dynamic';

import { restoreBackup } from "@/app/actions/backup"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertTriangle, Download, Upload, Database } from "lucide-react"
import { useState } from "react"
import { PremiumPageHeader } from "@/components/ui/premium-page-header"

export default function BackupPage() {
    const [loading, setLoading] = useState(false)

    async function handleRestore(formData: FormData) {
        if (!confirm("تحذير: استعادة النسخة الاحتياطية ستقوم بحذف جميع البيانات الحالية واستبدالها بالنسخة الجديدة. هل أنت متأكد؟")) {
            return
        }

        setLoading(true)
        const res = await restoreBackup(formData)
        setLoading(false)

        if (res.success) {
            alert("تم استعادة النسخة الاحتياطية بنجاح")
            window.location.reload()
        } else {
            alert("حدث خطأ أثناء الاستعادة")
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <PremiumPageHeader
                title="النسخ الاحتياطي والاسترداد"
                description="إدارة النسخ الاحتياطية واستعادة البيانات"
                icon={Database}
            />

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Download className="h-5 w-5" />
                            تصدير نسخة احتياطية
                        </CardTitle>
                        <CardDescription>
                            قم بتحميل نسخة كاملة من قاعدة البيانات الحالية للاحتفاظ بها.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <a href="/api/backup/download" target="_blank">
                            <Button className="w-full" variant="outline">
                                <Download className="mr-2 h-4 w-4" />
                                تحميل ملف قاعدة البيانات (.db)
                            </Button>
                        </a>
                    </CardContent>
                </Card>

                <Card className="border-red-200 dark:border-red-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                            <Upload className="h-5 w-5" />
                            استرداد نسخة احتياطية
                        </CardTitle>
                        <CardDescription>
                            استعادة البيانات من ملف نسخة احتياطية سابق.
                        </CardDescription>
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
            </div>
        </div>
    )
}
