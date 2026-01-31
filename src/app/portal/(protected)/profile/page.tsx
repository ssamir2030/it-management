'use client'

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react'
import { SignaturePad } from '@/components/signature-pad'
import { saveEmployeeSignature, getEmployeeSignature } from '@/app/actions/signature'
import { saveProfilePicture } from '@/app/actions/employee-portal'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { User, Mail, Phone, Building2, Briefcase, Calendar, CheckCircle2, Upload, Pen, ArrowRight } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface EmployeeData {
    id: string
    name: string
    email: string
    phone: string | null
    jobTitle: string | null
    department: string | null
    departmentId: string | null
    location: string | null
    locationAddress: string | null
    locationId: string | null
    identityNumber: string
    image: string | null
    createdAt: string
    updatedAt: string
}

export default function ProfilePage() {
    const [signature, setSignature] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [employeeData, setEmployeeData] = useState<EmployeeData | null>(null)
    const [signatureMode, setSignatureMode] = useState<'draw' | 'upload'>('draw')

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            // Load signature
            const sigResult = await getEmployeeSignature()
            if (sigResult.success && sigResult.signature) {
                setSignature(sigResult.signature)
            }

            // Load employee data
            const response = await fetch('/api/employee/profile')
            if (response.ok) {
                const data = await response.json()
                setEmployeeData(data)
            }
        } catch (error) {
            console.error('Error loading data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSaveSignature = async (signatureData: string) => {
        const result = await saveEmployeeSignature(signatureData)
        if (result.success) {
            setSignature(signatureData)
            toast.success('تم حفظ التوقيع بنجاح')
        } else {
            toast.error(result.error || 'فشل حفظ التوقيع')
        }
    }

    const handleUploadSignature = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Check if it's an image
        if (!file.type.startsWith('image/')) {
            toast.error('الرجاء اختيار صورة فقط')
            return
        }

        // Convert to base64
        const reader = new FileReader()
        reader.onloadend = async () => {
            const base64 = reader.result as string
            await handleSaveSignature(base64)
        }
        reader.readAsDataURL(file)
    }

    const handleUploadProfilePicture = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            toast.error('الرجاء اختيار صورة فقط')
            return
        }

        const reader = new FileReader()
        reader.onloadend = async () => {
            const base64 = reader.result as string

            // Optimistic update
            if (employeeData) {
                setEmployeeData({ ...employeeData, image: base64 })
            }

            const result = await saveProfilePicture(base64)
            if (result.success) {
                toast.success('تم تحديث الصورة الشخصية بنجاح')
            } else {
                toast.error(result.error || 'فشل تحديث الصورة')
                // Revert if failed (optional, but good practice. For now, we rely on page reload or error toast)
            }
        }
        reader.readAsDataURL(file)
    }

    if (loading) {
        return <div className="text-center py-12">جاري التحميل...</div>
    }

    if (!employeeData) {
        return <div className="text-center py-12 text-red-500">فشل تحميل البيانات</div>
    }

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-slate-900" dir="rtl">
            <div className="container mx-auto px-4 py-8 space-y-8">
                <PremiumPageHeader
                    title="الملف الشخصي"
                    description="معلوماتي الشخصية والتوقيع الإلكتروني"
                    icon={User}
                    rightContent={
                        <Link href="/portal/dashboard">
                            <Button variant="ghost" className="gap-2 text-white hover:bg-white/20">
                                <ArrowRight className="h-4 w-4" />
                                العودة للرئيسية
                            </Button>
                        </Link>
                    }
                />

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Employee Info */}
                    <Card className="border-0 shadow-xl">
                        <CardHeader className="bg-gradient-to-br from-blue-50 to-slate-50 dark:from-blue-950/20 dark:to-slate-950/20">
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5 text-blue-700" />
                                معلومات الملف الشخصي
                            </CardTitle>
                            <CardDescription>
                                معلوماتك الأساسية في النظام
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-950/50 border">
                                    <User className="h-5 w-5 text-blue-700 shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-xs text-muted-foreground">الاسم الكامل</p>
                                        <p className="font-bold text-lg">{employeeData?.name || 'غير متوفر'}</p>
                                    </div>
                                </div>



                                <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-950/50 border">
                                    <div className="relative h-12 w-12 rounded-full overflow-hidden bg-slate-200 shrink-0 border-2 border-slate-300">
                                        {employeeData?.image ? (
                                            <img src={employeeData.image} alt={employeeData.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <User className="h-6 w-6 m-auto text-slate-400 absolute inset-0 top-2.5 left-2.5" />
                                        )}
                                        <Label htmlFor="profile-upload" className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer transition-opacity">
                                            <Upload className="h-4 w-4 text-white" />
                                            <Input
                                                id="profile-upload"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleUploadProfilePicture}
                                            />
                                        </Label>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-muted-foreground">صورة الملف الشخصي</p>
                                        <p className="text-sm font-medium text-blue-600">اضغط على الصورة للتغيير</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-950/50 border">
                                    <Mail className="h-5 w-5 text-slate-600 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-muted-foreground">البريد الإلكتروني</p>
                                        <p className="font-semibold truncate">{employeeData?.email || 'غير متوفر'}</p>
                                    </div>
                                </div>

                                {employeeData?.phone && (
                                    <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-950/50 border">
                                        <Phone className="h-5 w-5 text-indigo-600 shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-xs text-muted-foreground">رقم الهاتف</p>
                                            <p className="font-semibold">{employeeData.phone}</p>
                                        </div>
                                    </div>
                                )}

                                {employeeData?.department && (
                                    <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-950/50 border">
                                        <Building2 className="h-5 w-5 text-blue-800 shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-xs text-muted-foreground">القسم</p>
                                            <p className="font-semibold">{employeeData.department}</p>
                                        </div>
                                    </div>
                                )}

                                {employeeData?.jobTitle && (
                                    <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-950/50 border">
                                        <Briefcase className="h-5 w-5 text-slate-700 shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-xs text-muted-foreground">المسمى الوظيفي</p>
                                            <p className="font-semibold">{employeeData.jobTitle}</p>
                                        </div>
                                    </div>
                                )}

                                {employeeData?.identityNumber && (
                                    <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-950/50 border">
                                        <Calendar className="h-5 w-5 text-blue-600 shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-xs text-muted-foreground">رقم الهوية</p>
                                            <p className="font-mono font-semibold">{employeeData.identityNumber}</p>
                                        </div>
                                    </div>
                                )}

                                {employeeData?.location && (
                                    <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-950/50 border">
                                        <Building2 className="h-5 w-5 text-indigo-700 shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-xs text-muted-foreground">الموقع</p>
                                            <p className="font-semibold">{employeeData.location}</p>
                                            {employeeData.locationAddress && (
                                                <p className="text-xs text-muted-foreground mt-1">{employeeData.locationAddress}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {employeeData?.createdAt && (
                                    <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-950/50 border">
                                        <Calendar className="h-5 w-5 text-slate-500 shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-xs text-muted-foreground">تاريخ الإضافة للنظام</p>
                                            <p className="font-semibold">{new Date(employeeData.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Signature Section */}
                    <div className="space-y-6">
                        <Card className="border-2">
                            <CardHeader>
                                <CardTitle>التوقيع الإلكتروني</CardTitle>
                                <CardDescription>
                                    قم بإضافة توقيعك بالرسم أو برفع صورة
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Tabs value={signatureMode} onValueChange={(v) => setSignatureMode(v as 'draw' | 'upload')}>
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="draw" className="gap-2">
                                            <Pen className="h-4 w-4" />
                                            رسم التوقيع
                                        </TabsTrigger>
                                        <TabsTrigger value="upload" className="gap-2">
                                            <Upload className="h-4 w-4" />
                                            رفع صورة
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="draw" className="mt-6">
                                        <SignaturePad
                                            onSave={handleSaveSignature}
                                            initialSignature={signature || undefined}
                                        />
                                    </TabsContent>

                                    <TabsContent value="upload" className="mt-6 space-y-4">
                                        <div className="border-2 border-dashed rounded-lg p-8 text-center">
                                            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                            <Label htmlFor="signature-upload" className="cursor-pointer">
                                                <div className="space-y-2">
                                                    <p className="text-sm font-medium">اضغط لرفع صورة التوقيع</p>
                                                    <p className="text-xs text-muted-foreground">PNG, JPG أو GIF (حتى 5MB)</p>
                                                </div>
                                                <Input
                                                    id="signature-upload"
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleUploadSignature}
                                                />
                                            </Label>
                                        </div>

                                        {signature && (
                                            <div className="space-y-2">
                                                <p className="text-sm font-medium">التوقيع الحالي:</p>
                                                <div className="border-2 border-dashed rounded-lg p-4 bg-slate-50 dark:bg-slate-950">
                                                    <img src={signature} alt="التوقيع" className="max-h-32 mx-auto" />
                                                </div>
                                            </div>
                                        )}
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>

                        {signature && (
                            <Card className="border-2 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20">
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                                        <CheckCircle2 className="h-5 w-5" />
                                        <p className="font-semibold">تم حفظ التوقيع الإلكتروني</p>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        سيظهر هذا التوقيع على تقرير استلام العهدة الخاص بك
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div >

                <Separator className="my-8" />

                <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20">
                    <CardContent className="pt-6">
                        <div className="space-y-2">
                            <h4 className="font-bold text-lg flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                                ملاحظة مهمة
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                • التوقيع الإلكتروني المحفوظ سيظهر تلقائياً على جميع تقارير العهدة والمستندات الرسمية الخاصة بك.
                            </p>
                            <p className="text-sm text-muted-foreground">
                                • تأكد من أن التوقيع واضح ومقروء.
                            </p>
                            <p className="text-sm text-muted-foreground">
                                • يمكنك تغيير التوقيع في أي وقت من هذه الصفحة.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div >
        </div >
    )
}
