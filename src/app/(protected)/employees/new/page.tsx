'use client'

export const dynamic = 'force-dynamic';

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { employeeSchema, type EmployeeFormData } from '@/lib/validations'
import { createEmployee } from '@/app/actions/employees'
import { getLocations } from '@/app/actions/locations'
import { getDepartments } from '@/app/actions/departments'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Users, ArrowLeft, User, CheckCircle2 } from 'lucide-react'
import { PremiumPageHeader } from '@/components/ui/premium-page-header'

export default function NewEmployeePage() {
    const router = useRouter()
    const [locations, setLocations] = useState<{ id: string; name: string }[]>([])
    const [departments, setDepartments] = useState<{ id: string; name: string }[]>([])

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setValue,
        watch,
    } = useForm<EmployeeFormData>({
        resolver: zodResolver(employeeSchema),
        defaultValues: {
            name: '',
            identityNumber: '',
            email: '',
            phone: '',
            password: '',
            jobTitle: '',
            departmentId: null,
            locationId: null,
        },
    })

    useEffect(() => {
        getLocations().then((res) => {
            if (res.success && res.data) {
                setLocations(res.data)
            }
        })
        getDepartments().then((res) => {
            if (res.success && res.data) {
                setDepartments(res.data)
            }
        })
    }, [])

    async function onSubmit(data: EmployeeFormData) {
        const formData = new FormData()
        formData.append('name', data.name)
        formData.append('identityNumber', data.identityNumber)
        formData.append('email', data.email)
        formData.append('password', data.password)
        if (data.phone) formData.append('phone', data.phone)
        if (data.jobTitle) formData.append('jobTitle', data.jobTitle)
        if (data.departmentId) formData.append('departmentId', data.departmentId)
        if (data.locationId) formData.append('locationId', data.locationId)

        const res = await createEmployee(formData)

        if (res.success) {
            toast.success('تم إنشاء الموظف بنجاح')
            router.push('/employees')
        } else {
            toast.error(res.error || 'حدث خطأ أثناء إنشاء الموظف')
        }
    }

    return (
        <div className="content-spacing animate-fade-in">
            <PremiumPageHeader
                title="إضافة موظف جديد"
                description="تسجيل موظف جديد مع التحقق من البيانات"
                icon={Users}
                rightContent={
                    <Link href="/employees">
                        <Button variant="ghost" size="lg" className="text-white hover:bg-white/20 gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            إلغاء والعودة
                        </Button>
                    </Link>
                }
            />

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            المعلومات الأساسية
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="grid md:grid-cols-2 gap-5">
                            {/* Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-base font-semibold">
                                    اسم الموظف *
                                </Label>
                                <Input
                                    id="name"
                                    {...register('name')}
                                    placeholder="محمد أحمد"
                                    className={`h-12 text-base ${errors.name ? 'border-red-500' : ''}`}
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500">{String(errors.name.message)}</p>
                                )}
                            </div>

                            {/* Identity Number */}
                            <div className="space-y-2">
                                <Label htmlFor="identityNumber" className="text-base font-semibold">
                                    رقم الهوية *
                                </Label>
                                <Input
                                    id="identityNumber"
                                    {...register('identityNumber')}
                                    placeholder="1234567890"
                                    dir="ltr"
                                    maxLength={10}
                                    className={`h-12 text-base ${errors.identityNumber ? 'border-red-500' : ''}`}
                                />
                                {errors.identityNumber && (
                                    <p className="text-sm text-red-500">{String(errors.identityNumber.message)}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-base font-semibold">
                                    البريد الإلكتروني *
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    {...register('email')}
                                    placeholder="example@company.com"
                                    dir="ltr"
                                    className={`h-12 text-base ${errors.email ? 'border-red-500' : ''}`}
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-500">{String(errors.email.message)}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-base font-semibold">
                                    كلمة المرور الأولية *
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    {...register('password')}
                                    placeholder="******"
                                    dir="ltr"
                                    className={`h-12 text-base ${errors.password ? 'border-red-500' : ''}`}
                                />
                                {errors.password && (
                                    <p className="text-sm text-red-500">{String(errors.password.message)}</p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    * سيتمكن الموظف من تغيير كلمة المرور بعد تسجيل الدخول
                                </p>
                            </div>

                            {/* Phone */}
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-base font-semibold">
                                    رقم الهاتف
                                </Label>
                                <Input
                                    id="phone"
                                    {...register('phone')}
                                    placeholder="+966 12 345 6789"
                                    dir="ltr"
                                    className={`h-12 text-base ${errors.phone ? 'border-red-500' : ''}`}
                                />
                                {errors.phone && (
                                    <p className="text-sm text-red-500">{String(errors.phone.message)}</p>
                                )}
                            </div>

                            {/* Job Title */}
                            <div className="space-y-2">
                                <Label htmlFor="jobTitle" className="text-base font-semibold">
                                    المسمى الوظيفي
                                </Label>
                                <Input
                                    id="jobTitle"
                                    {...register('jobTitle')}
                                    placeholder="مهندس برمجيات"
                                    className="h-12 text-base"
                                />
                            </div>

                            {/* Department */}
                            <div className="space-y-2">
                                <Label className="text-base font-semibold">الإدارة</Label>
                                <Select
                                    onValueChange={(value) => setValue('departmentId', value)}
                                    value={watch('departmentId') || ''}
                                >
                                    <SelectTrigger className="h-12 text-base">
                                        <SelectValue placeholder="اختر الإدارة" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments.map((dept) => (
                                            <SelectItem key={dept.id} value={dept.id}>
                                                {dept.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Location */}
                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-base font-semibold">الموقع</Label>
                                <Select
                                    onValueChange={(value) => setValue('locationId', value)}
                                    value={watch('locationId') || ''}
                                >
                                    <SelectTrigger className="h-12 text-base">
                                        <SelectValue placeholder="اختر الموقع" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {locations.map((loc) => (
                                            <SelectItem key={loc.id} value={loc.id}>
                                                {loc.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Submit Button */}
                <div className="flex justify-end gap-3">
                    <Link href="/employees">
                        <Button type="button" variant="outline" size="lg" disabled={isSubmitting}>
                            إلغاء
                        </Button>
                    </Link>
                    <Button
                        type="submit"
                        size="lg"
                        className="gap-2"
                        disabled={isSubmitting}
                    >
                        <CheckCircle2 className="h-4 w-4" />
                        {isSubmitting ? 'جاري الحفظ...' : 'حفظ الموظف'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
