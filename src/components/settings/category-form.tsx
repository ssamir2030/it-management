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
// Card imports removed as they are handled by parent page
import { Loader2, Save, Wand2 } from "lucide-react"
import { toast } from "sonner"
import { createAssetCategory as createCategory, updateAssetCategory as updateCategory } from '@/app/actions/categories-v2'
import { translateArabicToEnglish } from "@/app/actions/ai"

interface CategoryFormProps {
    category?: any
    categories: any[] // For parent selection
}

export function CategoryForm({ category, categories }: CategoryFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [isTranslating, setIsTranslating] = useState(false)
    const [nameEn, setNameEn] = useState(category?.nameEn || "")
    const isEditing = !!category

    // Handle initial custom type if it's not one of the standard ones
    const standardTypes = ["IT", "FURNITURE", "GENERAL"]
    const initialType = category?.type || "IT"
    const isCustomType = !standardTypes.includes(initialType) && initialType !== "OTHER"

    // State for type selection
    const [selectedType, setSelectedType] = useState(isCustomType ? "OTHER" : initialType)
    const [customType, setCustomType] = useState(isCustomType ? initialType : "")

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)

        // Handle custom type override
        if (selectedType === "OTHER" && customType) {
            formData.set("type", customType)
        } else {
            formData.set("type", selectedType)
        }

        const payload: any = {
            nameAr: formData.get("nameAr") as string,
            nameEn: formData.get("nameEn") as string,
            type: formData.get("type") as string,
            parentId: formData.get("parentId") as string === "none" ? null : formData.get("parentId") as string
        }



        try {
            if (isEditing && category && category.id) {
                const res = await updateCategory(String(category.id), payload)
                if (res.success) {
                    toast.success("تم تحديث التصنيف بنجاح")
                    router.push("/settings/categories")
                    router.refresh()
                } else {
                    toast.error(res.error)
                }
            } else {
                const res = await createCategory(payload)
                if (res.success) {
                    toast.success("تم إضافة التصنيف بنجاح")
                    router.push("/settings/categories")
                    router.refresh()
                } else {
                    toast.error(res.error)
                }
            }
        } catch (error) {
            toast.error("حدث خطأ غير متوقع")
        } finally {
            setIsLoading(false)
        }
    }

    async function handleTranslate() {
        const nameAr = (document.getElementById("nameAr") as HTMLInputElement).value
        if (!nameAr) {
            toast.warning("الرجاء إدخال الاسم بالعربية أولاً")
            return
        }

        setIsTranslating(true)
        try {
            const res = await translateArabicToEnglish(nameAr)
            if (res.success) {
                setNameEn(res.data)
                toast.success("تمت الترجمة بنجاح")
            } else {
                toast.error("فشلت الترجمة")
            }
        } catch (error) {
            toast.error("حدث خطأ أثناء الترجمة")
        } finally {
            setIsTranslating(false)
        }
    }

    // Filter potential parents:
    // 1. Must not be the category itself (if editing)
    const potentialParents = categories.filter(c =>
        !c.parentId &&
        (!isEditing || c.id !== category.id)
    )

    return (
        <form action={handleSubmit} className="space-y-6 animate-slide-up">
            <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="nameAr">الاسم بالعربية <span className="text-destructive">*</span></Label>
                        <Input
                            id="nameAr"
                            name="nameAr"
                            defaultValue={category?.nameAr}
                            required
                            placeholder="مثال: أجهزة كهربائية"
                            className="h-11"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="nameEn">الاسم بالإنجليزية <span className="text-destructive">*</span></Label>
                        <div className="flex gap-2">
                            <Input
                                id="nameEn"
                                name="nameEn"
                                value={nameEn}
                                onChange={(e) => setNameEn(e.target.value)}
                                required
                                placeholder="Example: Electrical Appliances"
                                className="h-11 text-left"
                                dir="ltr"
                            />
                            <Button
                                type="button"
                                variant="secondary"
                                size="icon"
                                className="h-11 w-11 shrink-0"
                                onClick={handleTranslate}
                                disabled={isTranslating}
                                title="ترجمة من العربية"
                            >
                                {isTranslating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="typeSelect">النوع العام <span className="text-destructive">*</span></Label>
                        <Select
                            name="typeSelect"
                            value={selectedType}
                            onValueChange={setSelectedType}
                        >
                            <SelectTrigger className="h-11">
                                <SelectValue placeholder="اختر النوع العام" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="IT">IT (تقنية)</SelectItem>
                                <SelectItem value="FURNITURE">Furniture (أثاث)</SelectItem>
                                <SelectItem value="GENERAL">General (عام)</SelectItem>
                                <SelectItem value="OTHER">أخرى (Other) ...</SelectItem>
                            </SelectContent>
                        </Select>

                        {selectedType === "OTHER" && (
                            <div className="mt-2 animate-in fade-in slide-in-from-top-1">
                                <Label htmlFor="customType" className="text-xs">أدخل نوع التصنيف</Label>
                                <Input
                                    id="customType"
                                    value={customType}
                                    onChange={(e) => setCustomType(e.target.value)}
                                    placeholder="مثال: Vehicles, Supplies..."
                                    className="h-10 mt-1"
                                    required={selectedType === "OTHER"}
                                />
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground">يساعد النوع العام في تجميع التقارير.</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="parentId">تبعية التصنيف</Label>
                        <Select name="parentId" defaultValue={category?.parentId || "none"}>
                            <SelectTrigger className="h-11">
                                <SelectValue placeholder="حدد تبعية التصنيف" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none" className="font-semibold text-primary">⛔ هذا تصنيف رئيسي (Main Category)</SelectItem>
                                {potentialParents.map((cat: any) => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                        ↳ تابع لـ: {cat.nameAr}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            إذا كان هذا التصنيف فرعياً (مثل "طابعة" تابعة لـ "أجهزة")، اختر التصنيف الأب.
                            <br />
                            إذا كان تصنيفاً رئيسياً جديداً، اختر "هذا تصنيف رئيسي".
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 mt-6 border-t">
                <Button
                    variant="outline"
                    type="button"
                    onClick={() => router.push('/settings/categories')}
                    className="gap-2 h-11 px-8"
                >
                    إلغاء
                </Button>
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="gap-2 h-11 px-8"
                >
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    <Save className="h-4 w-4" />
                    حفظ التصنيف
                </Button>
            </div>
        </form>
    )
}
