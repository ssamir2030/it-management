'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createTicket } from '@/app/actions/support'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export function NewTicketForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'OTHER',
        priority: 'MEDIUM',
        contactPhone: ''
    })

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (!formData.title.trim() || !formData.description.trim()) {
            toast.error('الرجاء ملء جميع الحقول المطلوبة')
            return
        }

        setLoading(true)

        const result = await createTicket(formData)

        if (result.success && result.data) {
            toast.success('تم إنشاء التذكرة بنجاح')
            router.push(`/portal/support/${result.data.id}`)
        } else {
            toast.error(result.error || 'فشل في إنشاء التذكرة')
            setLoading(false)
        }
    }

    return (
        <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* العنوان */}
                <div className="space-y-2">
                    <Label htmlFor="title">عنوان الطلب *</Label>
                    <Input
                        id="title"
                        placeholder="مثال: طابعة لا تعمل في قسم المحاسبة"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                    />
                </div>

                {/* الفئة */}
                <div className="space-y-2">
                    <Label htmlFor="category">نوع الطلب *</Label>
                    <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="MAINTENANCE">صيانة</SelectItem>
                            <SelectItem value="SUPPORT">دعم فني</SelectItem>
                            <SelectItem value="OTHER">أخرى</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* الأولوية */}
                <div className="space-y-2">
                    <Label htmlFor="priority">الأولوية *</Label>
                    <Select
                        value={formData.priority}
                        onValueChange={(value) => setFormData({ ...formData, priority: value })}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="LOW">منخفضة</SelectItem>
                            <SelectItem value="MEDIUM">متوسطة</SelectItem>
                            <SelectItem value="HIGH">عالية</SelectItem>
                            <SelectItem value="CRITICAL">حرجة</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* الوصف */}
                <div className="space-y-2">
                    <Label htmlFor="description">وصف المشكلة *</Label>
                    <Textarea
                        id="description"
                        placeholder="اشرح المشكلة بالتفصيل..."
                        rows={6}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                    />
                </div>

                {/* رقم الهاتف */}
                <div className="space-y-2">
                    <Label htmlFor="contactPhone">رقم الهاتف (اختياري)</Label>
                    <Input
                        id="contactPhone"
                        type="tel"
                        placeholder="05xxxxxxxx"
                        value={formData.contactPhone}
                        onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                        سيتم استخدامه للتواصل معك في حالة الضرورة
                    </p>
                </div>

                {/* الأزرار */}
                <div className="flex gap-3">
                    <Button
                        type="submit"
                        disabled={loading}
                        className="flex-1"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                                جاري الإرسال...
                            </>
                        ) : (
                            'إرسال الطلب'
                        )}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={loading}
                    >
                        إلغاء
                    </Button>
                </div>
            </form>
        </Card>
    )
}
