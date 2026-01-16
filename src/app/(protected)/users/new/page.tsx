'use client'

export const dynamic = 'force-dynamic';

import { createUser } from "@/app/actions/users"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function NewUserPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        const res = await createUser(formData)
        setLoading(false)

        if (res.success) {
            router.push('/admin/settings/users')
        } else {
            alert("حدث خطأ أثناء إنشاء المستخدم")
        }
    }

    return (
        <div className="w-full content-spacing py-8 animate-fade-in">
            {/* Professional Header */}
            <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4" dir="rtl">
                    <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 p-4 shadow-lg shadow-blue-500/20">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 dark:from-blue-400 dark:via-cyan-400 dark:to-teal-400">
                            إضافة مستخدم جديد
                        </h1>
                        <p className="text-muted-foreground text-base">
                            إنشاء حساب مستخدم جديد في النظام مع تحديد الصلاحيات
                        </p>
                    </div>
                </div>
                <Link href="/users">
                    <Button variant="outline" size="lg" className="shadow-sm">
                        إلغاء والعودة
                    </Button>
                </Link>
            </div>

            {/* Enhanced Form Card */}
            <Card className="card-elevated animate-slide-up">
                <CardHeader className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-500/10 p-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold">بيانات المستخدم</CardTitle>
                            <p className="text-sm text-muted-foreground">املأ المعلومات الأساسية للمستخدم</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <form action={handleSubmit} className="space-y-6" dir="rtl">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-base font-semibold">الاسم الكامل *</Label>
                            <Input id="name" name="name" required placeholder="مثال: علي محمد عبدالله" className="h-12 text-base" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-base font-semibold">البريد الإلكتروني *</Label>
                            <Input id="email" name="email" type="email" required placeholder="user@company.com" className="h-12 text-base" dir="ltr" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label htmlFor="role" className="text-base font-semibold">الصلاحية / الدور *</Label>
                                <Select name="role" defaultValue="USER">
                                    <SelectTrigger className="h-12 text-base">
                                        <SelectValue placeholder="اختر الصلاحية" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ADMIN">مدير النظام (Admin)</SelectItem>
                                        <SelectItem value="TECHNICIAN">فني (Technician)</SelectItem>
                                        <SelectItem value="USER">مستخدم (User)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-base font-semibold">كلمة المرور *</Label>
                                <Input id="password" name="password" type="password" required placeholder="••••••••" className="h-12 text-base" dir="ltr" />
                                <p className="text-xs text-muted-foreground">يجب أن تكون 8 أحرف على الأقل</p>
                            </div>
                        </div>

                        <div className="pt-6 flex justify-end gap-3">
                            <Link href="/users">
                                <Button type="button" variant="outline" size="lg" className="shadow-sm">
                                    إلغاء
                                </Button>
                            </Link>
                            <Button type="submit" disabled={loading} size="lg" className="gap-2 shadow-lg shadow-primary/30 hover:shadow-primary/40 min-w-[200px]">
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        جاري الحفظ...
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                        </svg>
                                        إنشاء الحساب
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
