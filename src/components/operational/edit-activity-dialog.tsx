'use client'

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PremiumPageHeader } from '@/components/ui/premium-page-header'
import { ArrowLeft, Target, Layers, Tag, User, Edit2, Trash2, Plus, X } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { useState } from "react"
import { updateActivity } from "@/app/actions/operational-plan"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { EmployeeSelector } from "@/components/employees/employee-selector"

export function EditActivityDialog({ activity }: { activity: any }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [progress, setProgress] = useState([activity.completionPercentage || 0])

    // Initialize items with amount/spent
    const [items, setItems] = useState<{ title: string; amount: string; spent: string }[]>(
        activity.items?.length > 0
            ? activity.items.map((i: any) => ({
                title: i.title,
                amount: i.amount?.toString() || "",
                spent: i.spent?.toString() || ""
            }))
            : [{ title: "", amount: "", spent: "" }]
    )

    // Initialize project budget/spent state
    const [projectBudget, setProjectBudget] = useState<string>(activity.budget?.toString() || "")
    const [projectSpent, setProjectSpent] = useState<string>(activity.spent?.toString() || "")
    const [responsible, setResponsible] = useState<string>(activity.responsible || "")

    // Update items and auto-calculate spent
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

    function addItem() {
        setItems([...items, { title: "", amount: "", spent: "" }])
    }

    function removeItem(index: number) {
        if (items.length > 1) { // Prevent deleting the last item if you want, or just verify logic
            const newItems = [...items]
            newItems.splice(index, 1)
            setItems(newItems)

            // Recalculate spent
            const totalSpent = newItems.reduce((sum, item) => sum + (parseFloat(item.spent) || 0), 0)
            setProjectSpent(totalSpent.toString())
        }
    }

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)

        const validItems = items.filter(i => i.title.trim() !== "")

        // Validation: Sum of items <= Budget
        const budgetVal = parseFloat(projectBudget) || 0
        const itemsTotal = validItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)

        if (itemsTotal > budgetVal) {
            // Check if it's a "Project Budget" (Manual) vs "Derived Budget" scenario.
            // Assuming Budget is strict cap.
            alert(`خطأ: إجمالي مبالغ الأنشطة (${itemsTotal}) يتجاوز ميزانية المشروع (${budgetVal})`)
            setLoading(false)
            return
        }

        const data = {
            name: formData.get("name"),
            code: formData.get("code"),
            budget: projectBudget,
            spent: projectSpent,
            priority: formData.get("priority"),
            status: formData.get("status"),
            responsible: responsible,
            quarter: formData.get("quarter"),
            completionPercentage: progress[0],
            items: validItems
        }

        const res = await updateActivity(activity.id, data)
        if (res.success) {
            setOpen(false)
        } else {
            alert((res as any).error || "حدث خطأ غير معروف")
        }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100 rounded-lg">
                    <Edit2 className="h-4 w-4 text-slate-500" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[100vw] w-full h-[100vh] p-0 gap-0 bg-slate-50 dark:bg-slate-950 overflow-hidden">
                <div className="w-full h-full overflow-y-auto">
                    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-20 space-y-6">
                        <PremiumPageHeader
                            title="تعديل بيانات المشروع"
                            description="تعديل تفاصيل المشروع التشغيلي والأنشطة المرتبطة"
                            icon={Edit2}
                            rightContent={
                                <Button
                                    variant="ghost"
                                    size="lg"
                                    onClick={() => setOpen(false)}
                                    className="text-muted-foreground hover:bg-slate-200/50 gap-2"
                                >
                                    <X className="h-4 w-4" />
                                    إغلاق
                                </Button>
                            }
                        />

                        <form onSubmit={onSubmit} className="space-y-6 animate-slide-up stagger-1">
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
                                                <Label htmlFor="code" className="text-base font-medium">رمز المشروع</Label>
                                                <Input
                                                    id="code"
                                                    name="code"
                                                    defaultValue={activity.code}
                                                    required
                                                    dir="ltr"
                                                    className="h-12 text-base font-mono"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="priority" className="text-base font-medium">الأولوية</Label>
                                                <Select name="priority" defaultValue={activity.priority}>
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

                                        <div className="grid grid-cols-2 gap-4 pt-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="budget" className="text-base font-medium">ميزانية المشروع</Label>
                                                <Input
                                                    id="budget"
                                                    name="budget"
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={projectBudget}
                                                    onChange={(e) => setProjectBudget(e.target.value)}
                                                    required
                                                    placeholder="0.00"
                                                    className="h-12 text-base font-mono text-center font-bold"
                                                    dir="ltr"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="spent" className="text-base font-medium">المصروف الفعلي</Label>
                                                <Input
                                                    id="spent"
                                                    name="spent"
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={projectSpent}
                                                    onChange={(e) => setProjectSpent(e.target.value)}
                                                    placeholder="0.00"
                                                    className="h-12 text-base font-mono text-center"
                                                    dir="ltr"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-base font-medium">اسم المشروع</Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                defaultValue={activity.name}
                                                required
                                                className="h-12 text-base"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Details & Status Card */}
                                <Card className="card-elevated border-t-4 border-t-indigo-500/20">
                                    <CardHeader className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-indigo-500/10 p-2.5">
                                                <User className="h-5 w-5 text-indigo-600" />
                                            </div>
                                            <div className="space-y-1">
                                                <CardTitle className="text-xl font-bold">التفاصيل والمسؤولية</CardTitle>
                                                <CardDescription>الجدول الزمني، الحالة، والمسؤول</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="quarter" className="text-base font-medium">الربع السنوي</Label>
                                                <Select name="quarter" defaultValue={activity.quarter?.toString() || "1"}>
                                                    <SelectTrigger className="h-12 text-base">
                                                        <SelectValue placeholder="اختر الربع" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="1">Q1 (يناير - مارس)</SelectItem>
                                                        <SelectItem value="2">Q2 (أبريل - يونيو)</SelectItem>
                                                        <SelectItem value="3">Q3 (يوليو - سبتمبر)</SelectItem>
                                                        <SelectItem value="4">Q4 (أكتوبر - ديسمبر)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="responsible" className="text-base font-medium">المسؤول عن التنفيذ</Label>
                                                <EmployeeSelector
                                                    value={responsible}
                                                    onChange={setResponsible}
                                                    placeholder="اختر المسؤول..."
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="status" className="text-base font-medium">حالة المشروع</Label>
                                                <Select name="status" defaultValue={activity.status}>
                                                    <SelectTrigger className="h-12 text-base">
                                                        <SelectValue placeholder="اختر الحالة" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="PENDING">معلق</SelectItem>
                                                        <SelectItem value="IN_PROGRESS">قيد التنفيذ</SelectItem>
                                                        <SelectItem value="COMPLETED">مكتمل</SelectItem>
                                                        <SelectItem value="CANCELLED">ملغي</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="space-y-4 p-4 border rounded-xl bg-slate-50/50 dark:bg-slate-900/20">
                                            <div className="flex justify-between items-center">
                                                <Label className="text-base font-semibold">نسبة الإنجاز</Label>
                                                <span className={`px-3 py-1 rounded-full text-sm font-bold ${progress[0] === 100 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {progress}%
                                                </span>
                                            </div>
                                            <div className="px-2">
                                                <Slider
                                                    value={progress}
                                                    onValueChange={setProgress}
                                                    max={100}
                                                    step={5}
                                                    className="w-full py-2"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Items (Activities) Section */}
                                <Card className="card-elevated border-t-4 border-t-emerald-500/20 lg:col-span-2">
                                    <CardHeader className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-emerald-500/10 p-2.5">
                                                <Layers className="h-5 w-5 text-emerald-600" />
                                            </div>
                                            <div className="space-y-1">
                                                <CardTitle className="text-xl font-bold">أنشطة المشروع (Project Activities)</CardTitle>
                                                <CardDescription>توزيع التكلفة على الأنشطة (يجب عدم تجاوز ميزانية المشروع)</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-3">
                                            {items.map((item, index) => (
                                                <div key={index} className="flex gap-4 items-end bg-muted/20 p-4 rounded-xl border hover:border-muted-foreground/20 transition-all">
                                                    <div className="flex-1 space-y-2">
                                                        <Label className="text-xs">اسم النشاط</Label>
                                                        <Input
                                                            value={item.title}
                                                            onChange={(e) => updateItem(index, 'title', e.target.value)}
                                                            placeholder="اسم النشاط"
                                                            className="h-10 text-sm"
                                                        />
                                                    </div>
                                                    <div className="w-32 space-y-2">
                                                        <Label className="text-xs">التكلفة</Label>
                                                        <Input
                                                            type="number"
                                                            value={item.amount}
                                                            onChange={(e) => updateItem(index, 'amount', e.target.value)}
                                                            placeholder="0"
                                                            className="h-10 text-sm"
                                                        />
                                                    </div>
                                                    <div className="w-32 space-y-2">
                                                        <Label className="text-xs">المصروف</Label>
                                                        <Input
                                                            type="number"
                                                            value={item.spent}
                                                            onChange={(e) => updateItem(index, 'spent', e.target.value)}
                                                            placeholder="0"
                                                            className="h-10 text-sm"
                                                        />
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeItem(index)}
                                                        className="h-10 w-10 text-red-500 hover:bg-red-50 hover:text-red-600 mb-0.5"
                                                        disabled={items.length === 1}
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


                            <div className="pt-4 flex justify-end gap-3 border-t mt-2">
                                <Button type="button" variant="outline" size="lg" onClick={() => setOpen(false)}>إلغاء</Button>
                                <Button type="submit" disabled={loading} size="lg" className="min-w-[150px]">
                                    {loading ? "جاري الحفظ..." : "حفظ التعديلات"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
