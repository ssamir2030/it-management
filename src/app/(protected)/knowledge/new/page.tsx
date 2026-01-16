'use client'

export const dynamic = 'force-dynamic';

import { createArticle, getCategories } from "@/app/actions/knowledge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { PremiumPageHeader } from '@/components/ui/premium-page-header'
import { BookOpen, ArrowRight } from "lucide-react"

export default function NewArticlePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [categories, setCategories] = useState<any[]>([])

    useEffect(() => {
        getCategories().then(res => {
            if (res.success && res.data) {
                setCategories(res.data)
            }
        })
    }, [])

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        const res = await createArticle(formData)
        setLoading(false)

        if (res.success) {
            router.push('/knowledge')
        } else {
            alert("حدث خطأ أثناء نشر المقال")
        }
    }

    return (
        <div className="max-w-7xl mx-auto">
            <PremiumPageHeader
                title="كتابة مقال جديد"
                description="إنشاء مقال معرفي جديد في النظام"
                icon={BookOpen}
                rightContent={
                    <Link href="/knowledge">
                        <Button variant="ghost" size="lg" className="text-white hover:bg-white/20 gap-2">
                            <ArrowRight className="h-4 w-4" />
                            إلغاء والعودة
                        </Button>
                    </Link>
                }
            />

            <Card>
                <CardHeader>
                    <CardTitle>محتوى المقال</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">عنوان المقال</Label>
                            <Input id="title" name="title" required placeholder="مثال: كيفية إعداد الطابعة الشبكية" className="text-lg" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="categoryId">التصنيف</Label>
                                <Select name="categoryId" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="اختر التصنيف" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map(cat => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="excerpt">وصف مختصر</Label>
                                <Input id="excerpt" name="excerpt" placeholder="يظهر في نتائج البحث..." />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="content">نص المقال</Label>
                            <Textarea
                                id="content"
                                name="content"
                                required
                                placeholder="اكتب محتوى المقال هنا..."
                                className="min-h-[400px] font-mono text-sm"
                            />
                            <p className="text-xs text-muted-foreground">يدعم تنسيق Markdown البسيط.</p>
                        </div>

                        <div className="pt-4 flex justify-end gap-4">
                            <Button variant="outline" type="button">حفظ كمسودة</Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? "جاري النشر..." : "نشر المقال"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
