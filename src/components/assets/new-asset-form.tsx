"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createAsset } from "@/app/actions/assets"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Monitor, ArrowRight, Package, ShoppingCart, Building2, Tag, User, CheckCircle2, RefreshCw, Calendar } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface NewAssetFormProps {
    employees: any[]
    inventoryItems: any[]
    categories: any[]
    locations: any[]
}

export function NewAssetForm({ employees, inventoryItems, categories, locations }: NewAssetFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [source, setSource] = useState<"NEW" | "INVENTORY">("NEW")
    const [selectedInventoryItem, setSelectedInventoryItem] = useState<any>(null)
    const [selectedMainCategory, setSelectedMainCategory] = useState<string>("")

    async function handleSubmit(formData: FormData) {
        setLoading(true)

        // If from inventory, append the ID
        if (source === "INVENTORY" && selectedInventoryItem) {
            formData.append("inventoryItemId", selectedInventoryItem.id)
        }

        const res = await createAsset(formData)
        setLoading(false)

        if (res.success) {
            toast.success("تم إضافة الأصل بنجاح")
            router.push('/assets')
        } else {
            toast.error(res.error || "حدث خطأ أثناء إضافة الأصل")
        }
    }

    const handleInventorySelect = (itemId: string) => {
        const item = inventoryItems.find(i => i.id === itemId)
        if (item) {
            setSelectedInventoryItem(item)
        }
    }

    return (
        <div className="content-spacing animate-fade-in">


            {/* Form */}
            <form action={handleSubmit} className="space-y-6 animate-slide-up stagger-1">
                {/* Source Selection Card */}
                <Card className="card-elevated">
                    <CardHeader className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-purple-500/10 p-2">
                                <Package className="h-5 w-5 text-purple-600" />
                            </div>
                            <div className="space-y-1.5">
                                <CardTitle className="text-xl font-bold">مصدر الأصل</CardTitle>
                                <CardDescription className="text-base">اختر طريقة إضافة الأصل</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup
                            defaultValue="NEW"
                            onValueChange={(v) => setSource(v as "NEW" | "INVENTORY")}
                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                            <div>
                                <RadioGroupItem value="NEW" id="source-new" className="peer sr-only" />
                                <Label
                                    htmlFor="source-new"
                                    className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-card p-6 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all h-32"
                                >
                                    <ShoppingCart className="mb-3 h-8 w-8" />
                                    <span className="text-lg font-semibold">شراء جديد / خارجي</span>
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="INVENTORY" id="source-inventory" className="peer sr-only" />
                                <Label
                                    htmlFor="source-inventory"
                                    className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-card p-6 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all h-32"
                                >
                                    <Package className="mb-3 h-8 w-8" />
                                    <span className="text-lg font-semibold">سحب من المستودع</span>
                                </Label>
                            </div>
                        </RadioGroup>

                        {/* Inventory Selection */}
                        {source === "INVENTORY" && (
                            <div className="space-y-2 mt-6 animate-in fade-in slide-in-from-top-2">
                                <Label htmlFor="inventory-select" className="text-base font-semibold">اختر من المستودع</Label>
                                <Select onValueChange={handleInventorySelect}>
                                    <SelectTrigger className="h-12 text-base">
                                        <SelectValue placeholder="اختر المادة..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {inventoryItems.map((item) => (
                                            <SelectItem key={item.id} value={item.id}>
                                                {item.name} - {item.model} (المتوفر: {item.quantity})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Basic Information Card */}
                    <Card className="card-elevated">
                        <CardHeader className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-primary/10 p-2">
                                    <Tag className="h-5 w-5 text-primary" />
                                </div>
                                <div className="space-y-1.5">
                                    <CardTitle className="text-xl font-bold">المعلومات الأساسية</CardTitle>
                                    <CardDescription className="text-base">بيانات الأصل الرئيسية</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-5" key={selectedInventoryItem?.id || 'new'}>
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-base font-semibold">اسم الأصل *</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    required
                                    placeholder="مثال: HP EliteBook 840"
                                    defaultValue={selectedInventoryItem?.name || ''}
                                    className="h-12 text-base"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tag" className="text-base font-semibold">رقم الأصل (Asset Tag) *</Label>
                                <Input
                                    id="tag"
                                    name="tag"
                                    required
                                    placeholder="مثال: AST-2024-001"
                                    className="h-12 text-base font-mono"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="mainCategory" className="text-base font-semibold">التصنيف الرئيسي *</Label>
                                        <Select
                                            onValueChange={(value) => {
                                                setSelectedMainCategory(value)
                                                // Reset sub category when main changes
                                                const subSelect = document.querySelector('input[name="categoryId"]') as HTMLInputElement
                                                if (subSelect) subSelect.value = ""
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
                                        <Label htmlFor="categoryId" className="text-base font-semibold">التصنيف الفرعي</Label>
                                        <Select name="categoryId" disabled={!selectedMainCategory}>
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
                                </div>
                            </div>

                            <div className="space-y-2 pt-4 border-t">
                                <Label htmlFor="locationId" className="text-base font-semibold">الموقع الجغرافي / الغرفة *</Label>
                                <Select name="locationId">
                                    <SelectTrigger className="h-12 text-base">
                                        <SelectValue placeholder="حدد موقع الجهاز (المعمل / الفرع)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">-- غير محدد --</SelectItem>
                                        {locations.map((loc) => (
                                            <SelectItem key={loc.id} value={loc.id}>
                                                {loc.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Manufacturer Information Card */}
                    <Card className="card-elevated">
                        <CardHeader className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-blue-500/10 p-2">
                                    <Building2 className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="space-y-1.5">
                                    <CardTitle className="text-xl font-bold">معلومات المصنع</CardTitle>
                                    <CardDescription className="text-base">الشركة والموديل</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-5" key={selectedInventoryItem?.id || 'new-man'}>
                            <div className="space-y-2">
                                <Label htmlFor="manufacturer" className="text-base font-semibold">الشركة المصنعة</Label>
                                <Input
                                    id="manufacturer"
                                    name="manufacturer"
                                    placeholder="مثال: HP, Dell, Apple"
                                    defaultValue={selectedInventoryItem?.manufacturer || ''}
                                    className="h-12 text-base"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="model" className="text-base font-semibold">الموديل</Label>
                                <Input
                                    id="model"
                                    name="model"
                                    placeholder="مثال: G8"
                                    defaultValue={selectedInventoryItem?.model || ''}
                                    className="h-12 text-base"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="serialNumber" className="text-base font-semibold">الرقم التسلسلي (S/N)</Label>
                                <Input
                                    id="serialNumber"
                                    name="serialNumber"
                                    placeholder="الرقم التسلسلي للجهاز"
                                    className="h-12 text-base font-mono"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Remote Access Information Card */}
                    <Card className="card-elevated">
                        <CardHeader className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-orange-500/10 p-2">
                                    <Monitor className="h-5 w-5 text-orange-600" />
                                </div>
                                <div className="space-y-1.5">
                                    <CardTitle className="text-xl font-bold">معلومات الوصول عن بعد</CardTitle>
                                    <CardDescription className="text-base">بيانات الاتصال (اختياري)</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="ipAddress" className="text-base font-semibold">IP Address (للاتصال المباشر)</Label>
                                <Input
                                    id="ipAddress"
                                    name="ipAddress"
                                    placeholder="مثال: 192.168.1.50"
                                    className="h-12 text-base font-mono"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="anydeskId" className="text-base font-semibold">AnyDesk ID</Label>
                                <Input
                                    id="anydeskId"
                                    name="anydeskId"
                                    placeholder="مثال: 123 456 789"
                                    className="h-12 text-base font-mono"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dwServiceId" className="text-base font-semibold">DWService ID (اختياري)</Label>
                                <Input
                                    id="dwServiceId"
                                    name="dwServiceId"
                                    placeholder="مثال: 123-456-789"
                                    className="h-12 text-base font-mono"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Lifecycle Information Card */}
                    <Card className="card-elevated">
                        <CardHeader className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-green-500/10 p-2">
                                    <Calendar className="h-5 w-5 text-green-600" />
                                </div>
                                <div className="space-y-1.5">
                                    <CardTitle className="text-xl font-bold">دورة الحياة والضمان</CardTitle>
                                    <CardDescription className="text-base">تواريخ الشراء والضمان</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="purchaseDate" className="text-base font-semibold">تاريخ الشراء</Label>
                                <Input
                                    id="purchaseDate"
                                    name="purchaseDate"
                                    type="date"
                                    className="h-12 text-base"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="warrantyExpiry" className="text-base font-semibold">تاريخ انتهاء الضمان</Label>
                                <Input
                                    id="warrantyExpiry"
                                    name="warrantyExpiry"
                                    type="date"
                                    className="h-12 text-base"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Employee Assignment Card */}
                <Card className="card-elevated animate-slide-up stagger-2">
                    <CardHeader className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-emerald-500/10 p-2">
                                <User className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div className="space-y-1.5">
                                <CardTitle className="text-xl font-bold">تعيين للموظف</CardTitle>
                                <CardDescription className="text-base">إنشاء عهدة (اختياري)</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <Label htmlFor="employeeId" className="text-base font-semibold">اختر موظف</Label>
                            <Select name="employeeId">
                                <SelectTrigger className="h-12 text-base">
                                    <SelectValue placeholder="اختر موظف لاستلام العهدة (اختياري)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">-- بدون تعيين (متاح في المخزن) --</SelectItem>
                                    {employees.map((emp) => (
                                        <SelectItem key={emp.id} value={emp.id}>
                                            {emp.name} - {emp.department?.name || 'بدون قسم'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg border">
                                💡 عند اختيار موظف، سيتم إنشاء سجل عهدة تلقائياً وتغيير حالة الأصل إلى "مستخدم".
                            </p>
                        </div>

                    </CardContent>
                </Card>

                {/* Submit Button */}
                <div className="flex justify-end gap-3 pt-4 animate-slide-up stagger-3">
                    <Link href="/assets">
                        <Button type="button" variant="outline" size="lg" className="shadow-sm">
                            إلغاء
                        </Button>
                    </Link>
                    <Button
                        type="submit"
                        disabled={loading}
                        size="lg"
                        className="gap-2 shadow-lg shadow-primary/30 hover:shadow-primary/40 hover-scale min-w-[200px]"
                    >
                        {loading ? (
                            <>
                                <RefreshCw className="h-5 w-5 animate-spin" />
                                جاري الحفظ...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="h-5 w-5" />
                                حفظ الأصل
                                <ArrowRight className="h-4 w-4" />
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
