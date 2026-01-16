'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { PremiumPageHeader } from '@/components/ui/premium-page-header'
import { Edit, Save, Building2, User, Phone, FileText } from 'lucide-react'
import { updateVisit } from '@/app/actions/visitors'
import { toast } from 'sonner'

interface EditVisitFormProps {
    visit: any
}

export function EditVisitForm({ visit }: EditVisitFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: visit.visitor.name,
        phone: visit.visitor.phone || '',
        company: visit.visitor.company || '',
        purpose: visit.purpose || ''
    })

    const handleUpdate = async () => {
        setLoading(true)
        const result = await updateVisit(visit.id, formData)
        if (result.success) {
            toast.success('تم تحديث البيانات بنجاح')
            router.push('/admin/visitors')
            router.refresh()
        } else {
            toast.error(result.error)
        }
        setLoading(false)
    }

    return (
        <div className="container mx-auto p-6 space-y-6" dir="rtl">
            <PremiumPageHeader
                title="تعديل بيانات الزيارة"
                description={`تعديل بيانات الزائر: ${visit.visitor.name}`}
                icon={Edit}
                backLink="/admin/visitors"
            />

            <Card className="w-full border-t-4 border-t-primary">
                <CardContent className="pt-8 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-base">
                                <User className="h-4 w-4 text-muted-foreground" />
                                اسم الزائر
                            </Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="h-12 bg-slate-50 dark:bg-slate-900"
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 text-base">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    رقم الجوال
                                </Label>
                                <Input
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="h-12 bg-slate-50 dark:bg-slate-900"
                                    dir="ltr"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 text-base">
                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                    الشركة / الجهة
                                </Label>
                                <Input
                                    value={formData.company}
                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                    className="h-12 bg-slate-50 dark:bg-slate-900"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-base">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                غرض الزيارة
                            </Label>
                            <Input
                                value={formData.purpose}
                                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                                className="h-12 bg-slate-50 dark:bg-slate-900"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t">
                        <Button variant="outline" size="lg" onClick={() => router.push('/admin/visitors')} disabled={loading}>
                            إلغاء
                        </Button>
                        <Button onClick={handleUpdate} disabled={loading} size="lg" className="min-w-[150px] gap-2">
                            <Save className="h-4 w-4" />
                            {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
