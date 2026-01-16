'use client'

export const dynamic = 'force-dynamic';

import { createCustodyItem, getEmployeesForSelect } from "@/app/actions/custody"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { useEffect, useState } from "react"
import { UserCog, User, Tag, FileText, CheckCircle2, ArrowRight, RefreshCw, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { PremiumPageHeader } from "@/components/ui/premium-page-header"

export default function NewCustodyItemPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [employees, setEmployees] = useState<any[]>([])

    useEffect(() => {
        getEmployeesForSelect().then(res => {
            if (res.success && res.data) {
                setEmployees(res.data)
            }
        })
    }, [])

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        const data = {
            name: formData.get("name") as string,
            employeeId: formData.get("employeeId") as string,
            description: formData.get("description") as string || undefined
        }
        const res = await createCustodyItem(data)
        setLoading(false)

        if (res.success) {
            toast.success("تم تسليم العهدة بنجاح")
            router.push('/custody')
        } else {
            toast.error("حدث خطأ أثناء تسليم العهدة")
        }
    }

    return (
        <div className="content-spacing animate-fade-in">
            <PremiumPageHeader
                title="تسليم عهدة لموظف"
                description="تسجيل عهدة جديدة وتسليمها للموظف"
                icon={UserCog}
                rightContent={
                    <Link href="/custody">
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
                    {/* Employee Selection Card */}
                    <Card className="card-elevated">
                        <CardHeader className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-primary/10 p-2">
                                    <User className="h-5 w-5 text-primary" />
                                </div>
                                <div className="space-y-1.5">
                                    <CardTitle className="text-xl font-bold">الموظف المستلم</CardTitle>
                                    <CardDescription className="text-base">اختر الموظف لتسليم العهدة</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label htmlFor="employeeId" className="text-base font-semibold">الموظف *</Label>
                                <Select name="employeeId" required>
                                    <SelectTrigger className="h-12 text-base">
                                        <SelectValue placeholder="اختر الموظف" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {employees.map(emp => (
                                            <SelectItem key={emp.id} value={emp.id}>
                                                {emp.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Custody Details Card */}
                    <Card className="card-elevated">
                        <CardHeader className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-blue-500/10 p-2">
                                    <Tag className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="space-y-1.5">
                                    <CardTitle className="text-xl font-bold">تفاصيل العهدة</CardTitle>
                                    <CardDescription className="text-base">الاسم والوصف</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-base font-semibold">اسم العهدة / التاغ *</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    required
                                    placeholder="حقيبة لابتوب / بطاقة دخول"
                                    className="h-12 text-base"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Description Card */}
                <Card className="card-elevated animate-slide-up stagger-2">
                    <CardHeader className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-purple-500/10 p-2">
                                <FileText className="h-5 w-5 text-purple-600" />
                            </div>
                            <div className="space-y-1.5">
                                <CardTitle className="text-xl font-bold">الوصف</CardTitle>
                                <CardDescription className="text-base">تفاصيل إضافية (اختياري)</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-base font-semibold">الوصف</Label>
                            <Input
                                id="description"
                                name="description"
                                placeholder="تفاصيل إضافية..."
                                className="h-12 text-base"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Submit Button */}
                <div className="flex justify-end gap-3 pt-4 animate-slide-up stagger-3">
                    <Link href="/custody">
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
                                جاري الحفظ...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="h-5 w-5" />
                                تسليم العهدة
                                <ArrowRight className="h-4 w-4" />
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
