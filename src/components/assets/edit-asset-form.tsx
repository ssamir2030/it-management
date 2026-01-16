"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { updateAsset } from "@/app/actions/assets"
import { Loader2, Save, Monitor, Hash, Wrench, User, Globe, ArrowRight, CheckCircle2, X, Calendar } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface EditAssetFormProps {
    asset: any
    employees: any[]
    categories: any[]
}

export function EditAssetForm({ asset, employees, categories }: EditAssetFormProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)

    // Find initial main category
    const initialSubCategory = categories.find(c => c.id === asset.categoryId)
    const initialMainCategoryId = initialSubCategory?.parentId || ""
    const [selectedMainCategory, setSelectedMainCategory] = useState<string>(initialMainCategoryId)

    async function onSubmit(formData: FormData) {
        setIsLoading(true)
        const result = await updateAsset(asset.id, formData)
        setIsLoading(false)

        if (result.success) {
            toast({
                title: "تم التحديث بنجاح",
                description: "تم تحديث بيانات الأصل بنجاح",
                variant: "default",
            })
            router.push("/assets")
            router.refresh()
        } else {
            toast({
                title: "خطأ",
                description: result.error,
                variant: "destructive",
            })
        }
    }

    return (
        <form action={onSubmit} className="space-y-6 animate-fade-in">
            <div className="grid gap-6 lg:grid-cols-2">
                {/* 1. Asset Identity Card */}
                <Card className="card-elevated animate-slide-up stagger-1 border-t-4 border-t-primary/20">
                    <CardHeader className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-primary/10 p-2.5">
                                <Monitor className="h-5 w-5 text-primary" />
                            </div>
                            <div className="space-y-1">
                                <CardTitle className="text-xl font-bold">بيانات الأصل</CardTitle>
                                <CardDescription>المعلومات الأساسية والتعريفية</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-base font-medium">اسم الأصل <span className="text-red-500">*</span></Label>
                            <Input id="name" name="name" defaultValue={asset.name} required className="h-12 text-base" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="tag" className="text-base font-medium">Tag (الرقم المرجعي) <span className="text-red-500">*</span></Label>
                                <Input id="tag" name="tag" defaultValue={asset.tag} required className="h-12 text-base" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="serialNumber" className="text-base font-medium">الرقم التسلسلي (S/N)</Label>
                                <Input id="serialNumber" name="serialNumber" defaultValue={asset.serialNumber || ''} className="h-12 text-base font-mono" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status" className="text-base font-medium">الحالة</Label>
                            <Select name="status" defaultValue={asset.status}>
                                <SelectTrigger className="h-12 text-base">
                                    <SelectValue placeholder="اختر الحالة" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="AVAILABLE">✅ متاح</SelectItem>
                                    <SelectItem value="ASSIGNED">👤 مستخدم</SelectItem>
                                    <SelectItem value="MAINTENANCE">🔧 في الصيانة</SelectItem>
                                    <SelectItem value="BROKEN">❌ تالف</SelectItem>
                                    <SelectItem value="RETIRED">📦 متقاعد</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Classification Card */}
                <Card className="card-elevated animate-slide-up stagger-2 border-t-4 border-t-purple-500/20">
                    <CardHeader className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-purple-500/10 p-2.5">
                                <Hash className="h-5 w-5 text-purple-600" />
                            </div>
                            <div className="space-y-1">
                                <CardTitle className="text-xl font-bold">التصنيف</CardTitle>
                                <CardDescription>نوع وفئة الأصل</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="mainCategory" className="text-base font-medium">التصنيف الرئيسي</Label>
                            <Select
                                defaultValue={selectedMainCategory}
                                onValueChange={(value) => {
                                    setSelectedMainCategory(value)
                                }}
                            >
                                <SelectTrigger className="h-12 text-base">
                                    <SelectValue placeholder="النوع الرئيسي" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.filter(c => !c.parentId).map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                            {cat.nameAr}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="categoryId" className="text-base font-medium">التصنيف الفرعي <span className="text-red-500">*</span></Label>
                            <Select
                                name="categoryId"
                                defaultValue={asset.categoryId || undefined}
                                required
                                disabled={!selectedMainCategory}
                                key={selectedMainCategory} // Force re-render on main change
                            >
                                <SelectTrigger className="h-12 text-base">
                                    <SelectValue placeholder="النوع الفرعي" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories
                                        .filter(c => c.parentId === selectedMainCategory)
                                        .map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {cat.nameAr}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Technical Details Card */}
                <Card className="card-elevated animate-slide-up stagger-3 border-t-4 border-t-amber-500/20">
                    <CardHeader className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-amber-500/10 p-2.5">
                                <Wrench className="h-5 w-5 text-amber-600" />
                            </div>
                            <div className="space-y-1">
                                <CardTitle className="text-xl font-bold">التفاصيل التقنية</CardTitle>
                                <CardDescription>المصنع والشبكة</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="manufacturer" className="text-base font-medium">الشركة المصنعة</Label>
                                <Input id="manufacturer" name="manufacturer" defaultValue={asset.manufacturer || ''} className="h-12 text-base" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="model" className="text-base font-medium">الموديل</Label>
                                <Input id="model" name="model" defaultValue={asset.model || ''} className="h-12 text-base" />
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            <h4 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                                <Globe className="h-4 w-4" />
                                الوصول عند بعد
                            </h4>
                            <div className="grid gap-3">
                                <div className="space-y-1">
                                    <Label htmlFor="ipAddress" className="text-xs">IP Address</Label>
                                    <Input id="ipAddress" name="ipAddress" defaultValue={asset.ipAddress || ''} className="font-mono text-left bg-muted/30" dir="ltr" placeholder="192.168.1.1" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label htmlFor="anydeskId" className="text-xs">AnyDesk ID</Label>
                                        <Input id="anydeskId" name="anydeskId" defaultValue={asset.anydeskId || ''} className="font-mono text-left bg-muted/30" dir="ltr" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="dwServiceId" className="text-xs">DWService ID</Label>
                                        <Input id="dwServiceId" name="dwServiceId" defaultValue={asset.dwServiceId || ''} className="font-mono text-left bg-muted/30" dir="ltr" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 4. Assignment Card */}
                <Card className="card-elevated animate-slide-up stagger-4 border-t-4 border-t-emerald-500/20">
                    <CardHeader className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-emerald-500/10 p-2.5">
                                <User className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div className="space-y-1">
                                <CardTitle className="text-xl font-bold">العهدة والمسؤولية</CardTitle>
                                <CardDescription>الموظف المسؤول عن الأصل</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Label htmlFor="employeeId" className="text-base font-medium">الموظف المسؤول</Label>
                            <Select name="employeeId" defaultValue={asset.employeeId || "none"}>
                                <SelectTrigger className="h-12 text-base">
                                    <SelectValue placeholder="اختر موظف" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">-- غير معين --</SelectItem>
                                    {employees.map((emp) => (
                                        <SelectItem key={emp.id} value={emp.id}>
                                            {emp.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground pt-1">
                                تحديد الموظف يعني أن الأصل في عهدته الشخصية.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end gap-4 pt-6 animate-slide-up stagger-5">
                <Button
                    variant="outline"
                    type="button"
                    size="lg"
                    onClick={() => router.back()}
                    className="gap-2 min-w-[120px]"
                >
                    <X className="h-4 w-4" />
                    إلغاء
                </Button>
                <Button
                    type="submit"
                    size="lg"
                    disabled={isLoading}
                    className="gap-2 min-w-[200px] shadow-lg shadow-primary/20 hover:shadow-primary/30"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            جاري الحفظ...
                        </>
                    ) : (
                        <>
                            <CheckCircle2 className="h-4 w-4" />
                            حفظ التغييرات
                        </>
                    )}
                </Button>
            </div>
        </form>
    )
}
