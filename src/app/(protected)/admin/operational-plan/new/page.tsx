'use client'

export const dynamic = 'force-dynamic';

import { addActivity } from "@/app/actions/operational-plan"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { EmployeeSelector } from "@/components/employees/employee-selector"
import { PremiumPageHeader } from '@/components/ui/premium-page-header'
import { ArrowLeft, Target, Layers, Tag, User, Plus, Trash2, CheckCircle2, Loader2, X } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

export default function NewOperationalActivityPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const planId = searchParams.get('planId') || ""
    const [loading, setLoading] = useState(false)
    const [projectSpent, setProjectSpent] = useState<string>("0")
    const [responsible, setResponsible] = useState<string>("")
    // Items now have amount and spent again
    const [items, setItems] = useState<{ title: string; amount: string; spent: string }[]>([{ title: "", amount: "", spent: "" }])

    function addItem() {
        setItems([...items, { title: "", amount: "", spent: "" }])
    }

    function removeItem(index: number) {
        if (items.length > 1) {
            const newItems = [...items]
            newItems.splice(index, 1)
            setItems(newItems)

            // Recalculate spent
            const totalSpent = newItems.reduce((sum, item) => sum + (parseFloat(item.spent) || 0), 0)
            setProjectSpent(totalSpent.toString())
        }
    }

    function updateItem(index: number, field: keyof typeof items[0], value: string) {
        const newItems = [...items]
        newItems[index] = { ...newItems[index], [field]: value }
        setItems(newItems)

        // Auto-calculate total spent from items
        if (field === 'spent') {
            const totalSpent = newItems.reduce((sum, item) => sum + (parseFloat(item.spent) || 0), 0)
            setProjectSpent(totalSpent.toString())
        }
    }

    async function handleSubmit(formData: FormData) {
        if (!planId) {
            toast.error("خطأ: لم يتم تحديد الخطة التشغيلية")
            return
        }

        setLoading(true)

        const validItems = items.filter(i => i.title.trim() !== "")

        // Validation: Sum of items <= Budget
        const projectBudget = parseFloat(formData.get("budget") as string) || 0
        const itemsTotal = validItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)

        if (itemsTotal > projectBudget) {
            toast.error(`إجمالي مبالغ الأنشطة (${itemsTotal}) يتجاوز ميزانية المشروع (${projectBudget})`)
            setLoading(false)
            return
        }

        const data = {
            name: formData.get("name"),
            code: formData.get("code"),
            // project: formData.get("project"), // Removed 
            budget: formData.get("budget"),
            spent: projectSpent,
            priority: formData.get("priority"),
            responsible: responsible,
            quarter: formData.get("quarter"),
            items: validItems
        }

        const res = await addActivity(planId, data)
        setLoading(false)

        if (res.success) {
            toast.success("تم إضافة المشروع والأنشطة بنجاح")
            router.push('/admin/operational-plan')
        } else {
            toast.error(res.error || "حدث خطأ أثناء إضافة المشروع")
        }
    }

    return (
        <div className="w-full content-spacing animate-fade-in pb-20">
            <PremiumPageHeader
                title="إضافة مشروع تشغيلي"
                description="تسجيل مشروع جديد وتوزيع الأنشطة والميزانية"
                icon={Target}
                rightContent={
                    <Link href="/admin/operational-plan">
                        <Button variant="ghost" size="lg" className="text-white hover:bg-white/20 gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            إلغاء والعودة
                        </Button>
                    </Link>
                }
            />

            <form action={handleSubmit} className="space-y-6 animate-slide-up stagger-1">
                <div className="grid gap-6 lg:grid-cols-2">

                    {/* Basic Info Card */}
                    <Card className="card-elevated border-t-4 border-t-primary/20">
                        <CardHeader className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-primary/10 p-2.5">
                                    <Tag className="h-5 w-5 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-xl font-bold">بيانات المشروع والميزانية</CardTitle>
                                    <CardDescription>التعريف، التصنيف، والمبالغ المالية</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="code" className="text-base font-medium">رمز المشروع <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="code"
                                        name="code"
                                        placeholder="P-2026-01"
                                        required
                                        dir="ltr"
                                        className="h-12 text-base font-mono"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="priority" className="text-base font-medium">الأولوية <span className="text-red-500">*</span></Label>
                                    <Select name="priority" defaultValue="MEDIUM">
                                        <SelectTrigger className="h-12 text-base">
                                            <SelectValue placeholder="اختر الأولوية" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="HIGH">🔥 مرتفعة</SelectItem>
                                            <SelectItem value="MEDIUM">⚖️ متوسطة</SelectItem>
                                            <SelectItem value="LOW">🧊 منخفضة</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Budget and Spent Inputs */}
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="space-y-2">
                                    <Label htmlFor="budget" className="text-base font-medium">ميزانية المشروع (SAR) <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="budget"
                                        name="budget"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        required
                                        placeholder="0.00"
                                        className="h-12 text-base font-mono text-center font-bold"
                                        dir="ltr"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="spent" className="text-base font-medium">المصروف الفعلي (SAR)</Label>
                                    <Input
                                        id="spent"
                                        name="spent"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={projectSpent}
                                        onChange={(e) => setProjectSpent(e.target.value)}
                                        className="h-12 text-base font-mono text-center"
                                        dir="ltr"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-base font-medium">اسم المشروع <span className="text-red-500">*</span></Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="مثال: مشروع تطوير البنية التحتية للشبكات"
                                    required
                                    className="h-12 text-base"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Project & Responsibility Card */}
                    <Card className="card-elevated border-t-4 border-t-indigo-500/20">
                        <CardHeader className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-indigo-500/10 p-2.5">
                                    <User className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-xl font-bold">التفاصيل والمسؤولية</CardTitle>
                                    <CardDescription>المشروع المرتبط والشخص المسؤول</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="hidden">
                                {/* Project input removed - Using Name as Project Name */}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="quarter" className="text-base font-medium">الربع السنوي</Label>
                                    <Select name="quarter" defaultValue="1">
                                        <SelectTrigger className="h-12 text-base">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">الربع الأول (Q1)</SelectItem>
                                            <SelectItem value="2">الربع الثاني (Q2)</SelectItem>
                                            <SelectItem value="3">الربع الثالث (Q3)</SelectItem>
                                            <SelectItem value="4">الربع الرابع (Q4)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="responsible" className="text-base font-medium">المسؤول عن التنفيذ</Label>
                                    <EmployeeSelector
                                        value={responsible}
                                        onChange={setResponsible}
                                        placeholder="بحث عن موظف..."
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Items (Activities) Section */}
                    <Card className="card-elevated border-t-4 border-t-emerald-500/20 lg:col-span-2">
                        <CardHeader className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-emerald-500/10 p-2.5">
                                        <Layers className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <div className="space-y-1">
                                        <CardTitle className="text-xl font-bold">أنشطة المشروع (Project Activities)</CardTitle>
                                        <CardDescription>إضافة الأنشطة وتوزيع التكلفة (يجب أن لا يتجاوز الإجمالي ميزانية المشروع)</CardDescription>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-4">
                                {items.map((item, index) => (
                                    <div key={index} className="flex gap-4 items-end animate-in fade-in slide-in-from-top-2 bg-muted/20 p-4 rounded-xl border hover:border-muted-foreground/20 transition-all">
                                        <div className="flex-1 space-y-2">
                                            <Label className="text-xs">اسم النشاط</Label>
                                            <Input
                                                value={item.title}
                                                onChange={(e) => updateItem(index, 'title', e.target.value)}
                                                placeholder="وصف النشاط..."
                                                required
                                            />
                                        </div>
                                        <div className="w-32 space-y-2">
                                            <Label className="text-xs">المبلغ المخصص</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={item.amount}
                                                onChange={(e) => updateItem(index, 'amount', e.target.value)}
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div className="w-32 space-y-2">
                                            <Label className="text-xs">المصروف</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={item.spent}
                                                onChange={(e) => updateItem(index, 'spent', e.target.value)}
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeItem(index)}
                                            disabled={items.length === 1}
                                            className="text-red-500 hover:bg-red-50 mb-0.5"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={addItem}
                                className="w-full h-12 border-dashed border-2 hover:border-primary hover:bg-primary/5 gap-2 text-muted-foreground hover:text-primary transition-all mt-4"
                            >
                                <Plus className="h-5 w-5" />
                                إضافة نشاط جديد
                            </Button>
                        </CardContent>
                    </Card>

                </div>

                {/* Actions */}
                <div className="flex justify-end gap-4 pt-6 animate-slide-up stagger-2 border-t mt-8">
                    <Link href="/admin/operational-plan">
                        <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            className="gap-2 min-w-[120px]"
                        >
                            <X className="h-4 w-4" />
                            إلغاء
                        </Button>
                    </Link>
                    <Button
                        type="submit"
                        size="lg"
                        disabled={loading}
                        className="gap-2 min-w-[200px] shadow-lg shadow-primary/20 hover:shadow-primary/30"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                جاري الحفظ...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="h-4 w-4" />
                                حفظ النشاط
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
