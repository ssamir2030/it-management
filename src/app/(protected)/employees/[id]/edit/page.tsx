'use client'

export const dynamic = 'force-dynamic';

import { getEmployeeById, updateEmployee } from "@/app/actions/employees"
import { getLocations } from "@/app/actions/locations"
import { getDepartments } from "@/app/actions/departments"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
import { toast } from "sonner"
import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import { Users, ArrowLeft, Loader2, User, Briefcase, Lock, Save, CheckCircle2, Phone, Mail, CreditCard } from "lucide-react"

export default function EditEmployeePage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [locations, setLocations] = useState<{ id: string, name: string }[]>([])
    const [departments, setDepartments] = useState<{ id: string, name: string }[]>([])
    const [employee, setEmployee] = useState<any>(null)

    useEffect(() => {
        // Fetch locations
        getLocations().then(res => {
            if (res.success && res.data) {
                setLocations(res.data)
            }
        })

        // Fetch departments
        getDepartments().then(res => {
            if (res.success && res.data) {
                setDepartments(res.data)
            }
        })

        // Fetch employee data
        getEmployeeById(params.id).then(res => {
            if (res.success && res.data) {
                setEmployee(res.data)
            } else {
                toast.error("لم يتم العثور على الموظف")
                router.push('/employees')
            }
        })
    }, [params.id, router])

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        const res = await updateEmployee(params.id, formData)
        setLoading(false)

        if (res.success) {
            toast.success("تم تحديث بيانات الموظف بنجاح", {
                description: "تم حفظ التعديلات على ملف الموظف"
            })
            router.push('/employees')
        } else {
            toast.error("حدث خطأ أثناء تحديث الموظف")
        }
    }

    if (!employee) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="w-full py-10" dir="rtl">
            <PremiumPageHeader
                title="تعديل بيانات الموظف"
                description={`تحديث ملف ${employee.name}`}
                icon={Users}
                rightContent={
                    <Link href="/employees">
                        <Button variant="ghost" size="lg" className="text-white hover:bg-white/20 gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            العودة
                        </Button>
                    </Link>
                }
            />

            <form action={handleSubmit} className="space-y-6 animate-slide-up stagger-1">
                <div className="grid gap-6 lg:grid-cols-2">

                    {/* Personal Info Card */}
                    <Card className="card-elevated border-t-4 border-t-blue-500/20 lg:col-span-2">
                        <CardHeader className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-blue-500/10 p-2.5">
                                    <User className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-xl font-bold">البيانات الشخصية</CardTitle>
                                    <CardDescription>المعلومات الأساسية للموظف</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-base font-medium">الاسم رباعي <span className="text-red-500">*</span></Label>
                                    <Input id="name" name="name" required defaultValue={employee.name} placeholder="مثال: محمد أحمد محمود علي" className="h-12 text-base" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="identityNumber" className="text-base font-medium">رقم الهوية <span className="text-red-500">*</span></Label>
                                    <div className="relative">
                                        <Input id="identityNumber" name="identityNumber" required defaultValue={employee.identityNumber} placeholder="1xxxxxxxxx" className="h-12 text-base pl-10" />
                                        <CreditCard className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                                    </div>
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-base font-medium">رقم الجوال <span className="text-red-500">*</span></Label>
                                    <div className="relative">
                                        <Input id="phone" name="phone" required defaultValue={employee.phone} placeholder="05xxxxxxxx" className="h-12 text-base pl-10 font-mono" dir="ltr" />
                                        <Phone className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-base font-medium">البريد الإلكتروني <span className="text-red-500">*</span></Label>
                                    <div className="relative">
                                        <Input id="email" name="email" type="email" required defaultValue={employee.email} placeholder="mohamed@company.com" className="h-12 text-base pl-10" dir="ltr" />
                                        <Mail className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Job Details Card */}
                    <Card className="card-elevated border-t-4 border-t-emerald-500/20">
                        <CardHeader className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-emerald-500/10 p-2.5">
                                    <Briefcase className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-xl font-bold">البيانات الوظيفية</CardTitle>
                                    <CardDescription>الإدارة والموقع والمسمى الوظيفي</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="departmentId" className="text-base font-medium">الإدارة</Label>
                                <Select name="departmentId" defaultValue={employee.departmentId || undefined}>
                                    <SelectTrigger className="h-12 text-base">
                                        <SelectValue placeholder="اختر الإدارة" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments.map(dept => (
                                            <SelectItem key={dept.id} value={dept.id}>
                                                {dept.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="locationId" className="text-base font-medium">موقع الإدارة</Label>
                                <Select name="locationId" defaultValue={employee.locationId || undefined}>
                                    <SelectTrigger className="h-12 text-base">
                                        <SelectValue placeholder="اختر الموقع" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {locations.map(loc => (
                                            <SelectItem key={loc.id} value={loc.id}>
                                                {loc.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="jobTitle" className="text-base font-medium">المسمى الوظيفي</Label>
                                <Input id="jobTitle" name="jobTitle" defaultValue={employee.jobTitle} placeholder="مثال: مدير مبيعات" className="h-12 text-base" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Security Card */}
                    <Card className="card-elevated border-t-4 border-t-rose-500/20">
                        <CardHeader className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-rose-500/10 p-2.5">
                                    <Lock className="h-5 w-5 text-rose-600" />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-xl font-bold">إعدادات الأمان</CardTitle>
                                    <CardDescription>تحديث كلمة المرور</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-base font-medium">كلمة المرور الجديدة</Label>
                                <div className="relative">
                                    <Input id="password" name="password" type="password" placeholder="اتركه فارغاً للإبقاء على الحالية" className="h-12 text-base pl-10" dir="ltr" />
                                    <Lock className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">يجب أن تحتوي على 8 أحرف على الأقل، حرف كبير، ورقم.</p>
                            </div>
                        </CardContent>
                    </Card>

                </div>

                <div className="flex justify-start gap-4 pt-6 animate-slide-up stagger-2">
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
                    <Link href="/employees">
                        <Button type="button" variant="outline" size="lg" className="gap-2">
                            إلغاء
                        </Button>
                    </Link>
                </div>
            </form>
        </div>
    )
}
