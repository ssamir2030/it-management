'use client'

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Megaphone, Save, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { getAnnouncement, updateAnnouncement } from '@/app/actions/announcements'
import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import Link from 'next/link'

export default function EditAnnouncementPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Form States
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [type, setType] = useState('INFO')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

    useEffect(() => {
        loadAnnouncement()
    }, [])

    async function loadAnnouncement() {
        const res = await getAnnouncement(params.id)
        if (res.success && res.data) {
            const ann = res.data
            setTitle(ann.title)
            setContent(ann.content)
            setType(ann.type)
            // Format dates for input type="datetime-local" (YYYY-MM-DDThh:mm)
            setStartDate(new Date(ann.startDate).toISOString().slice(0, 16))
            if (ann.endDate) {
                setEndDate(new Date(ann.endDate).toISOString().slice(0, 16))
            }
        } else {
            toast.error('لم يتم العثور على الإعلان')
            router.push('/admin/announcements')
        }
        setLoading(false)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true)

        const res = await updateAnnouncement(params.id, {
            title,
            content,
            type,
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : undefined
        })

        if (res.success) {
            toast.success('تم تحديث الإعلان بنجاح')
            router.push('/admin/announcements')
            router.refresh()
        } else {
            toast.error('فشل في تحديث الإعلان')
        }
        setSaving(false)
    }

    if (loading) {
        return <div className="text-center py-20">جاري التحميل...</div>
    }

    return (
        <div className="space-y-6 pb-20" dir="rtl">
            <PremiumPageHeader
                title="تعديل الإعلان"
                description="تعديل تفاصيل الإعلان والتوقيت"
                icon={Megaphone}
                rightContent={
                    <Link href="/admin/announcements">
                        <Button variant="outline" className="gap-2">
                            <ArrowRight className="h-4 w-4" />
                            تراجع
                        </Button>
                    </Link>
                }
            />

            <div className="max-w-2xl mx-auto">
                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label>عنوان الإعلان</Label>
                                <Input
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    required
                                    placeholder="مثال: تحديث النظام"
                                    className="text-lg"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>نص الإعلان</Label>
                                <Textarea
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                    required
                                    rows={5}
                                    placeholder="التفاصيل..."
                                    className="resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>نوع الإعلان</Label>
                                    <Select value={type} onValueChange={setType}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="INFO">معلومة عامة</SelectItem>
                                            <SelectItem value="WARNING">تنبيه</SelectItem>
                                            <SelectItem value="MAINTENANCE">صيانة</SelectItem>
                                            <SelectItem value="CRITICAL">طارئ / هام</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>تاريخ ووقت البدء</Label>
                                    <Input
                                        type="datetime-local"
                                        value={startDate}
                                        onChange={e => setStartDate(e.target.value)}
                                        required
                                        className="ltr:text-left text-right"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>تاريخ الانتهاء (اختياري)</Label>
                                <Input
                                    type="datetime-local"
                                    value={endDate}
                                    onChange={e => setEndDate(e.target.value)}
                                    className="ltr:text-left text-right"
                                />
                                <p className="text-xs text-muted-foreground">
                                    اتركه فارغاً للعرض الدائم حتى يتم إيقافه يدوياً.
                                </p>
                            </div>

                            <div className="pt-4 flex justify-end gap-4">
                                <Link href="/admin/announcements">
                                    <Button type="button" variant="outline">إلغاء</Button>
                                </Link>
                                <Button type="submit" className="min-w-[150px] bg-blue-600 hover:bg-blue-700" disabled={saving}>
                                    {saving ? (
                                        'جاري الحفظ...'
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 ml-2" />
                                            حفظ التغييرات
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
