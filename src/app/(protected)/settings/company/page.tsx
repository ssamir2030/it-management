'use client'

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react'
import { PremiumPageHeader } from '@/components/ui/premium-page-header'
import { Building2, Upload, Save, Image as ImageIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ImageUpload } from '@/components/ui/image-upload'
import { getCompanyProfile, updateCompanyProfile } from '@/app/actions/system'
import { toast } from 'sonner'

interface CompanyFormData {
    nameAr: string
    nameEn: string
    taxNumber: string
    commercialReg: string
    email: string
    phone: string
    website: string
    addressAr: string
    addressEn: string
    currency: string
    timezone: string
    logoUrl: string
    letterheadUrl: string
    stampUrl: string
}

export default function CompanyProfilePage() {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState<CompanyFormData>({
        nameAr: '',
        nameEn: '',
        taxNumber: '',
        commercialReg: '',
        email: '',
        phone: '',
        website: '',
        addressAr: '',
        addressEn: '',
        currency: 'SAR',
        timezone: 'Asia/Riyadh',
        logoUrl: '',
        letterheadUrl: '',
        stampUrl: '',
    })

    useEffect(() => {
        loadProfile()
    }, [])

    const loadProfile = async () => {
        const result = await getCompanyProfile()
        if (result.success && result.data) {
            const data = result.data as Partial<CompanyFormData>
            setFormData({
                nameAr: data.nameAr || '',
                nameEn: data.nameEn || '',
                taxNumber: data.taxNumber || '',
                commercialReg: data.commercialReg || '',
                email: data.email || '',
                phone: data.phone || '',
                website: data.website || '',
                addressAr: data.addressAr || '',
                addressEn: data.addressEn || '',
                currency: data.currency || 'SAR',
                timezone: data.timezone || 'Asia/Riyadh',
                logoUrl: data.logoUrl || '',
                letterheadUrl: data.letterheadUrl || '',
                stampUrl: data.stampUrl || '',
            })
        }
    }

    const handleSave = async () => {
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
        <div className="flex flex-col gap-6">
            <PremiumPageHeader
                title="بيانات الشركة"
                description="إدارة المعلومات الأساسية والشعار والمستندات الرسمية"
                icon={Building2}
                backLink="/settings"
                backText="الإعدادات"
            />

            <div className="grid gap-6">
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
                                    placeholder="مثال: شركة التقنية المتقدمة"
                                    className="h-12 text-base"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="nameEn">Company Name (English) *</Label>
                                <Input
                                    id="nameEn"
                                    dir="ltr"
                                    value={formData.nameEn}
                                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                                    placeholder="Example: Advanced Tech Company"
                                    className="h-12 text-base"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="taxNumber">الرقم الضريبي</Label>
                                <Input
                                    id="taxNumber"
                                    dir="ltr"
                                    value={formData.taxNumber}
                                    onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                                    placeholder="300000000000003"
                                    className="h-12 text-base"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="commercialReg">السجل التجاري</Label>
                                <Input
                                    id="commercialReg"
                                    dir="ltr"
                                    value={formData.commercialReg}
                                    onChange={(e) => setFormData({ ...formData, commercialReg: e.target.value })}
                                    placeholder="1010000000"
                                    className="h-12 text-base"
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
                    <CardContent>
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
                                    placeholder="info@company.com"
                                    className="h-12 text-base"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">رقم الهاتف</Label>
                                <Input
                                    id="phone"
                                    dir="ltr"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+966 11 234 5678"
                                    className="h-12 text-base"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="website">الموقع الإلكتروني</Label>
                                <Input
                                    id="website"
                                    dir="ltr"
                                    value={formData.website}
                                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                    placeholder="https://www.company.com"
                                    className="h-12 text-base"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="addressAr">العنوان (عربي)</Label>
                                <Textarea
                                    id="addressAr"
                                    value={formData.addressAr}
                                    onChange={(e) => setFormData({ ...formData, addressAr: e.target.value })}
                                    placeholder="الرياض، المملكة العربية السعودية"
                                    className="min-h-20 text-base"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="addressEn">Address (English)</Label>
                                <Textarea
                                    id="addressEn"
                                    dir="ltr"
                                    value={formData.addressEn}
                                    onChange={(e) => setFormData({ ...formData, addressEn: e.target.value })}
                                    placeholder="Riyadh, Saudi Arabia"
                                    className="min-h-20 text-base"
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
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="timezone">المنطقة الزمنية</Label>
                                <Input
                                    id="timezone"
                                    value={formData.timezone}
                                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                                    className="h-12 text-base"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Save Button */}
                <div className="flex justify-end gap-3">
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={loadProfile}
                        disabled={loading}
                    >
                        إعادة تعيين
                    </Button>
                    <Button
                        size="lg"
                        className="gap-2"
                        onClick={handleSave}
                        disabled={loading}
                    >
                        <Save className="h-4 w-4" />
                        {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                    </Button>
                </div>
            </div>
        </div>
    )
}
