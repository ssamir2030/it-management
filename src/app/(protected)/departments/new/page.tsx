'use client'

export const dynamic = 'force-dynamic';

import { createDepartment } from "@/app/actions/departments"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Building2, Tag, User, FileText, CheckCircle2, ArrowRight, RefreshCw, ArrowLeft } from "lucide-react"
import { PremiumPageHeader } from "@/components/ui/premium-page-header"

export default function NewDepartmentPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        const res = await createDepartment(formData)
        setLoading(false)

        if (res.success) {
            toast.success("تم إنشاء الإدارة بنجاح")
            router.push('/departments')
        } else {
            toast.error("حدث خطأ أثناء إنشاء الإدارة")
        }
    }

    return (
        <div className="content-spacing animate-fade-in">
            <PremiumPageHeader
                title="إضافة إدارة جديدة"
                description="تسجيل إدارة جديدة في النظام"
                icon={Building2}
                rightContent={
                    <Link href="/departments">
                        <Button variant="ghost" size="lg" className="text-white hover:bg-white/20 gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            إلغاء والعودة
                        </Button>
                    </Link>
                }
            />

            {/* Form */}
            <form action={handleSubmit} className="space-y-6 animate-slide-up stagger-1">
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Department Details Card */}
                    <Card className="card-elevated">
                        <CardHeader className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-primary/10 p-2">
                                    <Tag className="h-5 w-5 text-primary" />
                                </div>
                                <div className="space-y-1.5">
                                    <CardTitle className="text-xl font-bold">معلومات الإدارة</CardTitle>
                                    <CardDescription className="text-base">الاسم والمدير</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-base font-semibold">اسم الإدارة *</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    required
                                    placeholder="مثال: إدارة الموارد البشرية"
                                    className="h-12 text-base"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="managerName" className="text-base font-semibold">مدير الإدارة</Label>
                                <Input
                                    id="managerName"
                                    name="managerName"
                                    placeholder="اسم المدير"
                                    className="h-12 text-base"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Description Card */}
                    <Card className="card-elevated">
                        <CardHeader className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-blue-500/10 p-2">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="space-y-1.5">
                                    <CardTitle className="text-xl font-bold">الوصف</CardTitle>
                                    <CardDescription className="text-base">وصف مختصر لمهام الإدارة</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-base font-semibold">الوصف</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    placeholder="وصف مختصر لمهام الإدارة..."
                                    className="min-h-[140px] text-base"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-3 pt-4 animate-slide-up stagger-2">
                    <Link href="/departments">
                        <Button type="button" variant="outline" size="lg" className="shadow-sm">
                            إلغاء
                        </Button>
                    </Link>
                    <Button
                        type="submit"
                        disabled={loading}
                        size="lg"
                        className="gap-2 shadow-lg shadow-primary/30 hover:shadow-primary/40 hover-scale min-w-[200px]"
                    >
                        {loading ? (
                            <>
                                <RefreshCw className="h-5 w-5 animate-spin" />
                                unت الحفظ...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="h-5 w-5" />
                                حفظ الإدارة
                                <ArrowRight className="h-4 w-4" />
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
