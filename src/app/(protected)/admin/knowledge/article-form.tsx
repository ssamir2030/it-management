'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { createArticle, updateArticle } from "@/app/actions/knowledge-base"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, FileText, Save, Globe, X, CheckCircle2, RefreshCw } from "lucide-react"

interface ArticleFormProps {
    categories: any[]
    article?: any
}

export function ArticleForm({ categories, article }: ArticleFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: article?.title || "",
        content: article?.content || "",
        categoryId: article?.categoryId || "",
        isPublished: article?.isPublished ?? true
    })

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        try {
            let result
            if (article) {
                result = await updateArticle(article.id, formData)
            } else {
                result = await createArticle(formData)
            }

            if (result.success) {
                toast.success(article ? "تم تحديث المقال بنجاح" : "تم إنشاء المقال بنجاح")
                router.push("/admin/knowledge")
            } else {
                toast.error(result.error || "حدث خطأ ما")
            }
        } catch (error) {
            toast.error("حدث خطأ غير متوقع")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="card-elevated animate-slide-up stagger-1 border-t-4 border-t-primary/20">
                        <CardHeader className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-primary/10 p-2.5">
                                    <BookOpen className="h-5 w-5 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-xl font-bold">بينات المقال</CardTitle>
                                    <CardDescription>العنوان والمحتوى الرئيسي</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title" className="text-base font-medium">عنوان المقال <span className="text-red-500">*</span></Label>
                                <Input
                                    id="title"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="مثال: كيفية إعداد الطابعة"
                                    className="h-12 text-base font-semibold"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="content" className="text-base font-medium">المحتوى <span className="text-red-500">*</span></Label>
                                <Textarea
                                    id="content"
                                    required
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    placeholder="اكتب محتوى المقال هنا..."
                                    className="min-h-[400px] text-base resize-none p-4"
                                />
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <FileText className="h-3 w-3" />
                                    يمكنك استخدام HTML بسيط للتنسيق.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Settings */}
                <div className="space-y-6">
                    <Card className="card-elevated animate-slide-up stagger-2 border-t-4 border-t-blue-500/20">
                        <CardHeader className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-blue-500/10 p-2.5">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-xl font-bold">الإعدادات</CardTitle>
                                    <CardDescription>التصنيف والنشر</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="category" className="text-base font-medium">التصنيف <span className="text-red-500">*</span></Label>
                                <Select
                                    value={formData.categoryId}
                                    onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                                    required
                                >
                                    <SelectTrigger className="h-12 text-base">
                                        <SelectValue placeholder="اختر التصنيف" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center justify-between rounded-lg border p-4 shadow-sm bg-muted/20">
                                <div className="space-y-0.5">
                                    <Label htmlFor="published" className="text-base font-medium">حالة النشر</Label>
                                    <div className="text-xs text-muted-foreground">نشر المقال للمستخدمين</div>
                                </div>
                                <Switch
                                    id="published"
                                    checked={formData.isPublished}
                                    onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex flex-col gap-3 animate-slide-up stagger-3">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-emerald-600 hover:bg-emerald-700 w-full shadow-lg shadow-emerald-600/20"
                            size="lg"
                        >
                            {loading ? (
                                <>
                                    <RefreshCw className="h-4 w-4 animate-spin ml-2" />
                                    جاري الحفظ...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="h-4 w-4 ml-2" />
                                    {article ? "تحديث المقال" : "نشر المقال"}
                                </>
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            onClick={() => router.back()}
                            className="w-full"
                        >
                            <X className="h-4 w-4 ml-2" />
                            إلغاء
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    )
}
