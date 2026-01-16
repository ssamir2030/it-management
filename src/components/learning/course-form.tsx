'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createCourse } from '@/app/actions/learning'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, BookOpen, Clock, Tag, Image as ImageIcon, Video, CheckCircle2, Save, FileText } from 'lucide-react'

export function CourseForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)

        const formData = new FormData(event.currentTarget)

        const data = {
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            category: formData.get('category') as string,
            duration: parseInt(formData.get('duration') as string) || 0,
            imageUrl: formData.get('imageUrl') as string,
            videoUrl: formData.get('videoUrl') as string,
            isPublished: formData.get('isPublished') === 'on'
        }

        const res = await createCourse(data)

        if (res.success) {
            toast.success('تم إنشاء الدورة بنجاح')
            router.push('/admin/courses')
        } else {
            toast.error('حدث خطأ أثناء إنشاء الدورة')
        }

        setLoading(false)
    }

    return (
        <form onSubmit={onSubmit} className="space-y-6 animate-slide-up stagger-1">

            {/* Basic Info Card */}
            <Card className="card-elevated border-t-4 border-t-indigo-500/20">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-indigo-500/10 p-2">
                            <BookOpen className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div className="space-y-1.5">
                            <CardTitle className="text-xl font-bold">معلومات الدورة</CardTitle>
                            <CardDescription>العنوان والوصف والمحتوى الأساسي</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-base font-semibold">عنوان الدورة *</Label>
                        <Input
                            id="title"
                            name="title"
                            required
                            placeholder="مثال: أساسيات الأمن السيبراني"
                            className="h-12 text-base"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-base font-semibold">الوصف *</Label>
                        <Textarea
                            id="description"
                            name="description"
                            required
                            placeholder="وصف محتوى الدورة وأهدافها..."
                            className="min-h-[120px] text-base"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Details Card */}
            <Card className="card-elevated border-t-4 border-t-blue-500/20">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-500/10 p-2">
                            <Tag className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="space-y-1.5">
                            <CardTitle className="text-xl font-bold">التفاصيل والتصنيف</CardTitle>
                            <CardDescription>فئة الدورة ومدتها الزمنية</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <Label htmlFor="category" className="text-base font-semibold">التصنيف *</Label>
                            <Select name="category" required>
                                <SelectTrigger className="h-12 text-base">
                                    <SelectValue placeholder="اختر تصنيفاً" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SECURITY">أمن المعلومات</SelectItem>
                                    <SelectItem value="SOFTWARE">برمجيات</SelectItem>
                                    <SelectItem value="HARDWARE">أجهزة وشبكات</SelectItem>
                                    <SelectItem value="POLICY">سياسات وإجراءات</SelectItem>
                                    <SelectItem value="OTHER">أخرى</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="duration" className="text-base font-semibold">المدة (بالدقائق)</Label>
                            <div className="relative">
                                <Input
                                    id="duration"
                                    name="duration"
                                    type="number"
                                    min="0"
                                    placeholder="60"
                                    className="h-12 text-base pl-10"
                                    dir="ltr"
                                />
                                <Clock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Media Card */}
            <Card className="card-elevated border-t-4 border-t-purple-500/20">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-purple-500/10 p-2">
                            <Video className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="space-y-1.5">
                            <CardTitle className="text-xl font-bold">الوسائط</CardTitle>
                            <CardDescription>روابط الفيديو والصور</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <Label htmlFor="imageUrl" className="text-base font-semibold">رابط الصورة (اختياري)</Label>
                            <div className="relative">
                                <Input
                                    id="imageUrl"
                                    name="imageUrl"
                                    placeholder="https://..."
                                    className="h-12 text-base pl-10"
                                    dir="ltr"
                                />
                                <ImageIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="videoUrl" className="text-base font-semibold">رابط الفيديو (يوتيوب)</Label>
                            <div className="relative">
                                <Input
                                    id="videoUrl"
                                    name="videoUrl"
                                    placeholder="https://youtube.com/..."
                                    className="h-12 text-base pl-10"
                                    dir="ltr"
                                />
                                <Video className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 space-x-reverse pt-2 border-t pt-4">
                        <Switch id="isPublished" name="isPublished" />
                        <Label htmlFor="isPublished" className="text-base cursor-pointer font-medium">نشر الدورة فوراً</Label>
                    </div>
                </CardContent>
            </Card>

            <div className="pt-2 animate-slide-up stagger-2">
                <Button
                    type="submit"
                    className="w-full h-12 text-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover-scale"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                            جاري الحفظ...
                        </>
                    ) : (
                        <>
                            <CheckCircle2 className="w-5 h-5 ml-2" />
                            حفظ الدورة
                        </>
                    )}
                </Button>
            </div>
        </form>
    )
}
