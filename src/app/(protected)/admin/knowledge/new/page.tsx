'use client'

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createArticle, getCategories } from "@/app/actions/knowledge"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function NewArticlePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [categories, setCategories] = useState<any[]>([])

    // Load categories on client for simplicity (could be server component too)
    useEffect(() => {
        getCategories().then(res => {
            if (res.success) setCategories(res.data || [])
        })
    }, [])

    async function onSubmit(formData: FormData) {
        setLoading(true)
        const result = await createArticle(formData)
        setLoading(false)

        if (result.success) {
            toast.success("تم إنشاء المقال بنجاح")
            router.push('/admin/knowledge')
            router.refresh()
        } else {
            toast.error(result.error)
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">كتابة مقال جديد</h1>

            <form action={onSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>محتوى المقال</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label>عنوان المقال</Label>
                            <Input name="title" required placeholder="مثال: كيفية إعداد الطابعة..." className="text-lg" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>التصنيف</Label>
                                <Select name="categoryId" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="اختر التصنيف" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {cat.nameAr}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <Label htmlFor="published">نشر المقال فوراً؟</Label>
                                <Switch id="published" name="isPublished" value="true" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>المحتوى</Label>
                            <Textarea
                                name="content"
                                required
                                placeholder="اكتب محتوى الشرح هنا..."
                                className="min-h-[400px] font-mono text-base"
                            />
                            <p className="text-xs text-muted-foreground">يدعم النص فقط حالياً.</p>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => router.back()}>إلغاء</Button>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                حفظ المقال
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    )
}
