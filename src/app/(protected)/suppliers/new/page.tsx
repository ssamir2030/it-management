'use client'

export const dynamic = 'force-dynamic';

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Loader2, Building2, User, Phone, Mail, MapPin, Package, Globe, CreditCard, FileText, CheckCircle2, X } from 'lucide-react'
import { toast } from 'sonner'
import { createSupplier } from '@/app/actions/suppliers'
import { PremiumPageHeader } from '@/components/ui/premium-page-header'

const SUPPLIER_CATEGORIES = [
    'أجهزة كمبيوتر',
    'قطع غيار',
    'معدات شبكات',
    'طابعات ومستلزماتها',
    'أحبار وأوراق',
    'برمجيات',
    'أثاث مكتبي',
    'أخرى'
]

export default function NewSupplierPage() {
    const router = useRouter()
    const [submitting, setSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        contactPerson: '',
        phone: '',
        email: '',
        website: '',
        address: '',
        category: '',
        taxNumber: '',
        notes: '',
        isActive: true
    })

    function handleChange(field: string, value: any) {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (!formData.name.trim()) {
            toast.error('الرجاء إدخال اسم المورد')
            return
        }

        setSubmitting(true)

        const result = await createSupplier(formData)

        if (result?.success) {
            toast.success('تم إضافة المورد بنجاح')
            router.push('/suppliers')
        } else {
            toast.error(result?.error || 'فشل في إضافة المورد')
        }

        setSubmitting(false)
    }

    return (
        <div className="w-full content-spacing animate-fade-in">
            <PremiumPageHeader
                title="إضافة مورد جديد"
                description="إدخال بيانات مورد أو شركة جديدة للنظام"
                icon={Building2}
                rightContent={
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="gap-2 text-white hover:bg-white/20"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        العودة
                    </Button>
                }
            />

            <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up stagger-1">
                <div className="grid gap-6 lg:grid-cols-2">

                    {/* Basic Info Card */}
                    <Card className="card-elevated border-t-4 border-t-blue-500/20">
                        <CardHeader className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-blue-500/10 p-2.5">
                                    <Building2 className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-xl font-bold">معلومات الشركة</CardTitle>
                                    <CardDescription>البيانات الأساسية للمورد</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-base font-medium">اسم المورد / الشركة <span className="text-red-500">*</span></Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    placeholder="مثال: شركة التقنية المتقدمة"
                                    required
                                    className="h-12 text-base"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category" className="text-base font-medium">الفئة / التخصص <span className="text-red-500">*</span></Label>
                                <Select value={formData.category} onValueChange={(val) => handleChange('category', val)} required>
                                    <SelectTrigger className="h-12 text-base">
                                        <SelectValue placeholder="اختر الفئة..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SUPPLIER_CATEGORIES.map((category) => (
                                            <SelectItem key={category} value={category}>
                                                {category}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="taxNumber" className="text-base font-medium">الرقم الضريبي</Label>
                                <Input
                                    id="taxNumber"
                                    value={formData.taxNumber}
                                    onChange={(e) => handleChange('taxNumber', e.target.value)}
                                    placeholder="مثال: 3xxxxxxxxx"
                                    className="h-12 text-base font-mono text-left"
                                    dir="ltr"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="website" className="text-base font-medium">الموقع الإلكتروني</Label>
                                <div className="relative">
                                    <Input
                                        id="website"
                                        type="url"
                                        value={formData.website}
                                        onChange={(e) => handleChange('website', e.target.value)}
                                        placeholder="https://example.com"
                                        className="h-12 text-base pl-10 text-left"
                                        dir="ltr"
                                    />
                                    <Globe className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-dashed mt-2">
                                <div className="flex flex-col gap-1">
                                    <Label htmlFor="isActive" className="text-base font-medium cursor-pointer">حالة المورد</Label>
                                    <span className="text-xs text-muted-foreground">تفعيل أو تعطيل التعامل مع المورد</span>
                                </div>
                                <Switch
                                    id="isActive"
                                    checked={formData.isActive}
                                    onCheckedChange={(checked) => handleChange('isActive', checked)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact Info Card */}
                    <Card className="card-elevated border-t-4 border-t-purple-500/20">
                        <CardHeader className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-purple-500/10 p-2.5">
                                    <User className="h-5 w-5 text-purple-600" />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-xl font-bold">معلومات الاتصال</CardTitle>
                                    <CardDescription>بيانات التواصل مع الممثل</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="contactPerson" className="text-base font-medium">اسم المسؤول</Label>
                                <Input
                                    id="contactPerson"
                                    value={formData.contactPerson}
                                    onChange={(e) => handleChange('contactPerson', e.target.value)}
                                    placeholder="مثال: أحمد محمد"
                                    className="h-12 text-base"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-base font-medium">رقم الهاتف</Label>
                                <div className="relative">
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => handleChange('phone', e.target.value)}
                                        placeholder="05xxxxxxxx"
                                        className="h-12 text-base pl-10 text-left font-mono"
                                        dir="ltr"
                                    />
                                    <Phone className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-base font-medium">البريد الإلكتروني</Label>
                                <div className="relative">
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleChange('email', e.target.value)}
                                        placeholder="mail@example.com"
                                        className="h-12 text-base pl-10 text-left font-mono"
                                        dir="ltr"
                                    />
                                    <Mail className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address" className="text-base font-medium">العنوان</Label>
                                <Textarea
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) => handleChange('address', e.target.value)}
                                    placeholder="العنوان الكامل للمورد..."
                                    rows={3}
                                    className="resize-none text-base"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notes Card */}
                    <Card className="card-elevated border-t-4 border-t-gray-500/20 lg:col-span-2">
                        <CardHeader className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-gray-500/10 p-2.5">
                                    <FileText className="h-5 w-5 text-gray-600" />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-xl font-bold">ملاحظات إضافية</CardTitle>
                                    <CardDescription>أي تفاصيل أخرى متعلقة بالمورد</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => handleChange('notes', e.target.value)}
                                placeholder="ملاحظات..."
                                rows={4}
                                className="resize-none text-base min-h-[100px]"
                            />
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
                        disabled={submitting}
                        className="gap-2 min-w-[200px] shadow-lg shadow-primary/20 hover:shadow-primary/30"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                جاري الحفظ...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="h-4 w-4" />
                                حفظ المورد
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
