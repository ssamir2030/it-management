'use client'

export const dynamic = 'force-dynamic';

import { getDepartmentById, updateDepartment } from "@/app/actions/departments"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import { Building2, ArrowLeft, Loader2, User, FileText, CheckCircle2 } from "lucide-react"

export default function EditDepartmentPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [department, setDepartment] = useState<any>(null)

    useEffect(() => {
        getDepartmentById(params.id).then(res => {
            if (res.success && res.data) {
                setDepartment(res.data)
            } else {
                toast.error("لم يتم العثور على الإدارة")
                router.push('/departments')
            }
        })
    }, [params.id, router])

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        const res = await updateDepartment(params.id, formData)
        setLoading(false)

        if (res.success) {
            toast.success("تم تحديث الإدارة بنجاح", {
                description: "تم حفظ التغييرات على بيانات الإدارة"
            })
            router.push('/departments')
        } else {
            toast.error("حدث خطأ أثناء تحديث الإدارة")
        }
    }

    if (!department) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="w-full py-10 animate-fade-in" dir="rtl">
            <PremiumPageHeader
                title="تعديل الإدارة"
                description={`تحديث بيانات ${department.name}`}
                icon={Building2}
                rightContent={
                    <Link href="/departments">
                        <Button variant="ghost" size="lg" className="text-white hover:bg-white/20 gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            العودة
                        </Button>
                    </Link>
                }
            />

            <form action={handleSubmit} className="space-y-6 animate-slide-up stagger-1">
                <div className="grid gap-6">
                    {/* Main Info Card */}
                    <Card className="card-elevated border-t-4 border-t-indigo-500/20">
                        <CardHeader className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-indigo-500/10 p-2.5">
                                    <Building2 className="h-6 w-6 text-indigo-600" />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-xl font-bold">بيانات الإدارة</CardTitle>
                                    <CardDescription>المعلومات الأساسية والمدير المسؤول</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-base font-medium">اسم الإدارة <span className="text-red-500">*</span></Label>
                                    <div className="relative">
                                        <Input id="name" name="name" required defaultValue={department.name} placeholder="مثال: إدارة الموارد البشرية" className="h-12 text-base pl-10" />
                                        <Building2 className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="managerName" className="text-base font-medium">مدير الإدارة</Label>
                                    <div className="relative">
                                        <Input id="managerName" name="managerName" defaultValue={department.managerName} placeholder="اسم المدير" className="h-12 text-base pl-10" />
                                        <User className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-base font-medium">وصف الإدارة</Label>
                                <div className="relative">
                                    <Textarea
                                        id="description"
                                        name="description"
                                        defaultValue={department.description}
                                        placeholder="وصف مختصر لمهام الإدارة..."
                                        className="min-h-[120px] text-base pl-10 pt-3"
                                    />
                                    <FileText className="absolute left-3 top-4 h-5 w-5 text-muted-foreground" />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-4">
                                <Button type="submit" disabled={loading} size="lg" className="min-w-[200px] gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30">
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            جاري الحفظ...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="h-5 w-5" />
                                            حفظ التعديلات
                                        </>
                                    )}
                                </Button>
                                <Link href="/departments">
                                    <Button type="button" variant="outline" size="lg" className="gap-2">
                                        إلغاء
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </form>
        </div>
    )
}
