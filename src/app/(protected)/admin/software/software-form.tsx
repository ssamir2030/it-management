'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createSoftware, updateSoftware } from "@/app/actions/software-catalog"
import { toast } from "sonner"
import { Loader2, Package, Tag, Globe, Key, ShieldCheck, CheckCircle2, X } from "lucide-react"

interface SoftwareFormProps {
    software?: any
}

export function SoftwareForm({ software }: SoftwareFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: software?.name || "",
        description: software?.description || "",
        version: software?.version || "",
        icon: software?.icon || "",
        downloadUrl: software?.downloadUrl || "",
        category: software?.category || "General",
        requiresLicense: software?.requiresLicense ?? false,
        isActive: software?.isActive ?? true
    })

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        try {
            let result
            if (software) {
                result = await updateSoftware(software.id, formData)
            } else {
                result = await createSoftware(formData)
            }

            if (result.success) {
                toast.success(software ? "تم تحديث البرنامج بنجاح" : "تم إضافة البرنامج بنجاح", {
                    description: "تم حفظ بيانات البرنامج في الدليل"
                })
                router.push("/admin/software")
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
        <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up stagger-1">
            <div className="grid gap-6 md:grid-cols-2">

                {/* Basic Info Card */}
                <Card className="card-elevated border-t-4 border-t-violet-500/20 md:col-span-2">
                    <CardHeader className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-violet-500/10 p-2.5">
                                <Package className="h-5 w-5 text-violet-600" />
                            </div>
                            <div className="space-y-1">
                                <CardTitle className="text-xl font-bold">معلومات البرنامج</CardTitle>
                                <CardDescription>الاسم، الإصدار، والوصف</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-base font-medium">اسم البرنامج <span className="text-red-500">*</span></Label>
                                <Input
                                    id="name"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="مثال: Microsoft Office"
                                    className="h-12 text-base"
                                    dir="ltr"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="version" className="text-base font-medium">رقم الإصدار</Label>
                                <Input
                                    id="version"
                                    value={formData.version}
                                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                                    placeholder="مثال: 2021"
                                    className="h-12 text-base"
                                    dir="ltr"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-base font-medium">الوصف</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="وصف مختصر للبرنامج..."
                                className="min-h-[100px] text-base"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Classification & Visuals Card */}
                <Card className="card-elevated border-t-4 border-t-pink-500/20">
                    <CardHeader className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-pink-500/10 p-2.5">
                                <Tag className="h-5 w-5 text-pink-600" />
                            </div>
                            <div className="space-y-1">
                                <CardTitle className="text-xl font-bold">التصنيف والمظهر</CardTitle>
                                <CardDescription>الفئة وأيقونة البرنامج</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="category" className="text-base font-medium">التصنيف</Label>
                            <Input
                                id="category"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                placeholder="مثال: إنتاجية، تصميم، برمجة"
                                className="h-12 text-base"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="icon" className="text-base font-medium">رابط الأيقونة</Label>
                            <div className="relative">
                                <Input
                                    id="icon"
                                    value={formData.icon}
                                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                    placeholder="https://example.com/icon.png"
                                    className="h-12 text-base pl-10"
                                    dir="ltr"
                                />
                                <Globe className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Configuration Card */}
                <Card className="card-elevated border-t-4 border-t-slate-500/20">
                    <CardHeader className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-slate-500/10 p-2.5">
                                <Key className="h-5 w-5 text-slate-600" />
                            </div>
                            <div className="space-y-1">
                                <CardTitle className="text-xl font-bold">الإعدادات والتراخيص</CardTitle>
                                <CardDescription>خيارات الترخيص والعرض</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="downloadUrl" className="text-base font-medium">رابط التحميل (اختياري)</Label>
                            <Input
                                id="downloadUrl"
                                value={formData.downloadUrl}
                                onChange={(e) => setFormData({ ...formData, downloadUrl: e.target.value })}
                                placeholder="https://example.com/download"
                                className="h-12 text-base"
                                dir="ltr"
                            />
                            <p className="text-xs text-muted-foreground">رابط تحميل البرنامج أو دليل التثبيت</p>
                        </div>
                        <div className="flex flex-col gap-4 pt-2">
                            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                                <div className="space-y-0.5">
                                    <Label htmlFor="requiresLicense" className="text-base">يتطلب ترخيصاً</Label>
                                    <p className="text-xs text-muted-foreground">هل يحتاج البرنامج لمفتاح تفعيل؟</p>
                                </div>
                                <Switch
                                    id="requiresLicense"
                                    checked={formData.requiresLicense}
                                    onCheckedChange={(checked) => setFormData({ ...formData, requiresLicense: checked })}
                                />
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                                <div className="space-y-0.5">
                                    <Label htmlFor="isActive" className="text-base">نشط</Label>
                                    <p className="text-xs text-muted-foreground">إظهار البرنامج في قائمة الموظفين</p>
                                </div>
                                <Switch
                                    id="isActive"
                                    checked={formData.isActive}
                                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end gap-4 pt-6 animate-slide-up stagger-2">
                <Button type="button" variant="outline" onClick={() => router.back()} size="lg" className="gap-2 min-w-[120px]">
                    <X className="h-4 w-4" />
                    إلغاء
                </Button>
                <Button type="submit" disabled={loading} size="lg" className="gap-2 min-w-[200px] bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30">
                    {loading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            جاري الحفظ...
                        </>
                    ) : (
                        <>
                            <CheckCircle2 className="h-4 w-4" />
                            {software ? "تحديث البرنامج" : "إضافة البرنامج"}
                        </>
                    )}
                </Button>
            </div>
        </form>
    )
}
