"use client"

import { useState, useEffect } from 'react'
import { PremiumPageHeader } from '@/components/ui/premium-page-header'
import { Building2, Upload, Save, Image as ImageIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ImageUpload } from '@/components/ui/image-upload'
import { updateCompanyProfile } from '@/app/actions/system'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Shield } from "lucide-react"

interface CompanyFormProps {
    initialData: any
    readOnly: boolean
}

export default function CompanyForm({ initialData, readOnly }: CompanyFormProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        nameAr: initialData.nameAr || '',
        nameEn: initialData.nameEn || '',
        taxNumber: initialData.taxNumber || '',
        commercialReg: initialData.commercialReg || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        website: initialData.website || '',
        addressAr: initialData.addressAr || '',
        addressEn: initialData.addressEn || '',
        currency: initialData.currency || 'SAR',
        timezone: initialData.timezone || 'Asia/Riyadh',
        logoUrl: initialData.logoUrl || '',
        letterheadUrl: initialData.letterheadUrl || '',
        stampUrl: initialData.stampUrl || '',
    })

    const handleSave = async () => {
        if (readOnly) return
        setLoading(true)
        const result = await updateCompanyProfile(formData)
        if (result.success) {
            toast.success('تم حفظ بيانات الشركة بنجاح')
        } else {
            toast.error(result.error || 'فشل في حفظ البيانات')
        }
        setLoading(false)
    }

    return (
        <div className="flex flex-col gap-6" dir="rtl">
            <PremiumPageHeader
                backLink="/admin/settings"
                backText="الإعدادات"
                title="بيانات الشركة"
                description="إدارة المعلومات الأساسية والشعار والمستندات الرسمية"
                icon={Building2}
            />

            {readOnly && (
                <Alert variant="default" className="bg-muted border-primary/20">
                    <Shield className="h-4 w-4" />
                    <AlertTitle>وضع المشاهدة فقط</AlertTitle>
                    <AlertDescription>
                        ليس لديك صلاحية لتعديل بيانات الشركة. يمكنك فقط استعراض المعلومات.
                    </AlertDescription>
                </Alert>
            )}

            <div className={`grid gap-6 ${readOnly ? 'opacity-90 pointer-events-none' : ''}`}>
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>المعلومات الأساسية</CardTitle>
                        <CardDescription>البيانات الرئيسية للشركة</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="grid md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label htmlFor="nameAr">اسم الشركة (عربي) *</Label>
                                <Input
                                    id="nameAr"
                                    value={formData.nameAr}
                                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                                    className="h-12 text-base"
                                    disabled={readOnly}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="nameEn">Company Name (English) *</Label>
                                <Input
                                    id="nameEn"
                                    dir="ltr"
                                    value={formData.nameEn}
                                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                                    className="h-12 text-base"
                                    disabled={readOnly}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="taxNumber">الرقم الضريبي</Label>
                                <Input
                                    id="taxNumber"
                                    dir="ltr"
                                    value={formData.taxNumber}
                                    onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                                    className="h-12 text-base"
                                    disabled={readOnly}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="commercialReg">السجل التجاري</Label>
                                <Input
                                    id="commercialReg"
                                    dir="ltr"
                                    value={formData.commercialReg}
                                    onChange={(e) => setFormData({ ...formData, commercialReg: e.target.value })}
                                    className="h-12 text-base"
                                    disabled={readOnly}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Branding Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ImageIcon className="h-5 w-5" />
                            الهوية البصرية
                        </CardTitle>
                        <CardDescription>شعار الشركة والأوراق الرسمية</CardDescription>
                    </CardHeader>
                    <CardContent className={readOnly ? 'opacity-90 pointer-events-none' : ''}>
                        <div className="grid md:grid-cols-3 gap-6">
                            <ImageUpload
                                label="شعار الشركة"
                                description="PNG شفاف مفضل، 512x512px"
                                aspectRatio="square"
                                value={formData.logoUrl}
                                onChange={(value) => setFormData({ ...formData, logoUrl: value })}
                            />
                            <ImageUpload
                                label="ورقة رسمية (Letterhead)"
                                description="A4 بجودة عالية"
                                aspectRatio="a4"
                                value={formData.letterheadUrl}
                                onChange={(value) => setFormData({ ...formData, letterheadUrl: value })}
                            />
                            <ImageUpload
                                label="الختم الرسمي"
                                description="PNG شفاف"
                                aspectRatio="square"
                                value={formData.stampUrl}
                                onChange={(value) => setFormData({ ...formData, stampUrl: value })}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>معلومات الاتصال</CardTitle>
                        <CardDescription>بيانات التواصل والعنوان</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="grid md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label htmlFor="email">البريد الإلكتروني</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    dir="ltr"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="h-12 text-base"
                                    disabled={readOnly}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">رقم الهاتف</Label>
                                <Input
                                    id="phone"
                                    dir="ltr"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="h-12 text-base"
                                    disabled={readOnly}
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="website">الموقع الإلكتروني</Label>
                                <Input
                                    id="website"
                                    dir="ltr"
                                    value={formData.website}
                                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                    className="h-12 text-base"
                                    disabled={readOnly}
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="addressAr">العنوان (عربي)</Label>
                                <Textarea
                                    id="addressAr"
                                    value={formData.addressAr}
                                    onChange={(e) => setFormData({ ...formData, addressAr: e.target.value })}
                                    className="min-h-20 text-base"
                                    disabled={readOnly}
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="addressEn">Address (English)</Label>
                                <Textarea
                                    id="addressEn"
                                    dir="ltr"
                                    value={formData.addressEn}
                                    onChange={(e) => setFormData({ ...formData, addressEn: e.target.value })}
                                    className="min-h-20 text-base"
                                    disabled={readOnly}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Regional Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>الإعدادات الإقليمية</CardTitle>
                        <CardDescription>العملة والمنطقة الزمنية</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="grid md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label htmlFor="currency">العملة</Label>
                                <Input
                                    id="currency"
                                    value={formData.currency}
                                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                    className="h-12 text-base"
                                    disabled={readOnly}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="timezone">المنطقة الزمنية</Label>
                                <Input
                                    id="timezone"
                                    value={formData.timezone}
                                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                                    className="h-12 text-base"
                                    disabled={readOnly}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Save Button */}
            {!readOnly && (
                <div className="flex justify-end gap-3 sticky bottom-4">
                    <Button
                        size="lg"
                        className="gap-2 shadow-lg"
                        onClick={handleSave}
                        disabled={loading}
                    >
                        <Save className="h-4 w-4" />
                        {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                    </Button>
                </div>
            )}
        </div>
    )
}
