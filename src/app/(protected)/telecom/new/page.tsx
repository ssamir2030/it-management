'use client'

export const dynamic = 'force-dynamic';

import { createTelecomService, getEmployeesForTelecom } from "@/app/actions/telecom"
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
import { useState, useEffect } from "react"
import { PremiumPageHeader } from '@/components/ui/premium-page-header'
import { Phone, ArrowLeft, User, Smartphone, Building2, CreditCard, Save, Loader2, CheckCircle2, X } from "lucide-react"
import { toast } from "sonner"

export default function NewTelecomServicePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [employees, setEmployees] = useState<{ id: string, name: string, department: { name: string } | null }[]>([])
    const [selectedEmployee, setSelectedEmployee] = useState<string>("")
    const [selectedDepartment, setSelectedDepartment] = useState<string>("")

    useEffect(() => {
        async function loadEmployees() {
            const res = await getEmployeesForTelecom()
            if (res.success && res.data) {
                setEmployees(res.data)
            }
        }
        loadEmployees()
    }, [])

    const handleEmployeeChange = (value: string) => {
        setSelectedEmployee(value)
        const employee = employees.find(e => e.id === value)
        if (employee) {
            setSelectedDepartment(employee.department?.name || "غير محدد")
        } else {
            setSelectedDepartment("")
        }
    }

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        // Append employeeId manually since Select might not be inside the form data automatically if controlled
        if (selectedEmployee) {
            formData.append('employeeId', selectedEmployee)
        }

        const res = await createTelecomService(formData)
        setLoading(false)

        if (res.success) {
            toast.success("تم إضافة الخدمة بنجاح")
            router.push('/telecom')
        } else {
            toast.error("حدث خطأ أثناء إضافة الخدمة")
        }
    }

    return (
        <div className="w-full content-spacing animate-fade-in">
            <PremiumPageHeader
                title="إضافة خدمة اتصالات"
                description="تسجيل خدمة اتصالات جديدة"
                icon={Phone}
                rightContent={
                    <Link href="/telecom">
                        <Button variant="ghost" size="lg" className="text-white hover:bg-white/20 gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            إلغاء والعودة
                        </Button>
                    </Link>
                }
            />

            <form action={handleSubmit} className="space-y-6 animate-slide-up stagger-1">
                <div className="grid gap-6 lg:grid-cols-2">

                    {/* User & Department Card */}
                    <Card className="card-elevated border-t-4 border-t-primary/20">
                        <CardHeader className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-primary/10 p-2.5">
                                    <User className="h-5 w-5 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-xl font-bold">المستخدم</CardTitle>
                                    <CardDescription>بيانات الموظف المستفيد</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="employee" className="text-base font-medium">الموظف <span className="text-red-500">*</span></Label>
                                <Select onValueChange={handleEmployeeChange} value={selectedEmployee} required>
                                    <SelectTrigger className="h-12 text-base">
                                        <SelectValue placeholder="اختر الموظف" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {employees.map((emp) => (
                                            <SelectItem key={emp.id} value={emp.id}>
                                                {emp.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <input type="hidden" name="employeeId" value={selectedEmployee} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="department" className="text-base font-medium">الإدارة (تلقائي)</Label>
                                <Input
                                    id="department"
                                    value={selectedDepartment}
                                    disabled
                                    className="h-12 text-base bg-muted/50 font-medium text-muted-foreground"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Service Details Card */}
                    <Card className="card-elevated border-t-4 border-t-indigo-500/20">
                        <CardHeader className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-indigo-500/10 p-2.5">
                                    <Smartphone className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-xl font-bold">تفاصيل الخدمة</CardTitle>
                                    <CardDescription>نوع الخدمة والمزود</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="type" className="text-base font-medium">نوع الخدمة <span className="text-red-500">*</span></Label>
                                    <Select name="type" required>
                                        <SelectTrigger className="h-12 text-base">
                                            <SelectValue placeholder="اختر النوع" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="INTERNET">🌐 إنترنت</SelectItem>
                                            <SelectItem value="SIM">📱 شريحة اتصال</SelectItem>
                                            <SelectItem value="LANDLINE">☎️ هاتف ثابت</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="provider" className="text-base font-medium">المزود <span className="text-red-500">*</span></Label>
                                    <Select name="provider" required>
                                        <SelectTrigger className="h-12 text-base">
                                            <SelectValue placeholder="اختر المزود" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="STC">STC</SelectItem>
                                            <SelectItem value="Mobily">Mobily</SelectItem>
                                            <SelectItem value="Zain">Zain</SelectItem>
                                            <SelectItem value="Salam">Salam</SelectItem>
                                            <SelectItem value="Virgin Mobile">Virgin Mobile</SelectItem>
                                            <SelectItem value="Lebara">Lebara</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="planDetails" className="text-base font-medium">تفاصيل الباقة</Label>
                                <Input id="planDetails" name="planDetails" placeholder="مثال: 5G لا محدود" className="h-12 text-base" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Account Info Card */}
                    <Card className="card-elevated border-t-4 border-t-emerald-500/20">
                        <CardHeader className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-emerald-500/10 p-2.5">
                                    <Building2 className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-xl font-bold">معلومات الحساب</CardTitle>
                                    <CardDescription>الأرقام والحسابات</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="phoneNumber" className="text-base font-medium">رقم الهاتف <span className="text-red-500">*</span></Label>
                                <Input id="phoneNumber" name="phoneNumber" placeholder="05xxxxxxxx" required className="h-12 text-base font-mono text-left" dir="ltr" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="accountNumber" className="text-base font-medium">رقم الحساب</Label>
                                <Input id="accountNumber" name="accountNumber" placeholder="100xxxxxxx" className="h-12 text-base font-mono text-left" dir="ltr" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Cost & Billing Card */}
                    <Card className="card-elevated border-t-4 border-t-amber-500/20">
                        <CardHeader className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-amber-500/10 p-2.5">
                                    <CreditCard className="h-5 w-5 text-amber-600" />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-xl font-bold">الفوترة</CardTitle>
                                    <CardDescription>التكلفة ودورة الدفع</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cost" className="text-base font-medium">الكلفة الشهرية</Label>
                                    <div className="relative">
                                        <Input
                                            id="cost"
                                            name="cost"
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            className="h-12 text-base pl-12 font-mono"
                                            dir="ltr"
                                        />
                                        <div className="absolute left-3 top-3 text-muted-foreground font-semibold">SAR</div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="billingCycle" className="text-base font-medium">دورة الفوترة</Label>
                                    <Select name="billingCycle" defaultValue="MONTHLY">
                                        <SelectTrigger className="h-12 text-base">
                                            <SelectValue placeholder="اختر الدورة" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MONTHLY">شهري</SelectItem>
                                            <SelectItem value="YEARLY">سنوي</SelectItem>
                                            <SelectItem value="PREPAID">مسبق الدفع</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-4 pt-6 animate-slide-up stagger-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={() => router.back()}
                        className="gap-2 min-w-[120px]"
                    >
                        <X className="h-4 w-4" />
                        إلغاء
                    </Button>
                    <Button
                        type="submit"
                        size="lg"
                        disabled={loading}
                        className="gap-2 min-w-[200px] shadow-lg shadow-primary/20 hover:shadow-primary/30"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                جاري الحفظ...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="h-4 w-4" />
                                حفظ الخدمة
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
