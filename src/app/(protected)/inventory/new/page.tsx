'use client'

export const dynamic = 'force-dynamic';

import { createInventoryItem } from "@/app/actions/inventory"
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
import { INVENTORY_CATEGORIES, MANUFACTURERS } from "@/lib/constants"
import { Package, Printer, RefreshCw, Barcode as BarcodeIcon, DollarSign, Hash, Building2, Tag, ArrowRight, CheckCircle2, FileText, X, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { PremiumPageHeader } from "@/components/ui/premium-page-header"

export default function NewInventoryItemPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<string>("")
    const [selectedManufacturer, setSelectedManufacturer] = useState<string>("")
    const [selectedModel, setSelectedModel] = useState<string>("")
    const [barcode, setBarcode] = useState<string>("")
    const [invoice, setInvoice] = useState<File | null>(null)

    async function handleSubmit(formData: FormData) {
        setLoading(true)

        // إضافة قيم Select للـ FormData (لا تُضاف تلقائياً!)
        if (selectedCategory === "OTHER") {
            const customCategory = formData.get('customCategory') as string
            formData.set('category', customCategory)
        } else if (selectedCategory) {
            formData.set('category', selectedCategory)
        }

        if (selectedManufacturer) {
            formData.set('manufacturer', selectedManufacturer)
        }

        if (selectedModel) {
            formData.set('model', selectedModel)
        }

        // إضافة barcode للـ FormData (لأنه مُدار بـ useState)
        if (barcode) {
            formData.set('barcode', barcode)
        }

        // إضافة الفاتورة إذا تم رفعها
        if (invoice) {
            formData.set('invoice', invoice)
        }

        const res = await createInventoryItem(formData)
        setLoading(false)

        if (res.success) {
            router.push('/inventory')
        } else {
            alert(res.error || "حدث خطأ أثناء إضافة العنصر")
        }
    }

    const generateBarcode = () => {
        const timestamp = Date.now().toString().slice(-6)
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
        setBarcode(`INV-${timestamp}-${random}`)
    }

    const printBarcode = () => {
        const printWindow = window.open('', '_blank')
        if (printWindow) {
            printWindow.document.write(`
                <html>
                <head>
                    <title>Print Barcode</title>
                    <style>
                        body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                        .label { text-align: center; border: 1px solid #000; padding: 20px; border-radius: 8px; }
                        .barcode { font-family: 'Libre Barcode 39', cursive; font-size: 48px; margin: 10px 0; }
                        .text { font-family: sans-serif; font-size: 14px; }
                    </style>
                    <link href="https://fonts.googleapis.com/css2?family=Libre+Barcode+39&display=swap" rel="stylesheet">
                </head>
                <body>
                    <div class="label">
                        <div class="text">Inventory Item</div>
                        <div class="barcode">*${barcode}*</div>
                        <div class="text">${barcode}</div>
                    </div>
                    <script>
                        window.onload = () => { window.print(); window.close(); }
                    </script>
                </body>
                </html>
            `)
            printWindow.document.close()
        }
    }

    const handleInvoiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setInvoice(file)
        }
    }

    const removeInvoice = () => {
        setInvoice(null)
        const fileInput = document.getElementById('invoice') as HTMLInputElement
        if (fileInput) {
            fileInput.value = ''
        }
    }

    return (
        <div className="content-spacing animate-fade-in">
            <PremiumPageHeader
                title="إضافة عنصر للمستودع"
                description="أضف عنصر جديد إلى المخزون مع التفاصيل الكاملة"
                icon={Package}
                rightContent={
                    <Link href="/inventory">
                        <Button variant="ghost" size="lg" className="text-white hover:bg-white/20 gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            إلغاء والعودة
                        </Button>
                    </Link>
                }
            />

            {/* Form */}
            <form action={handleSubmit} className="space-y-6 animate-slide-up stagger-1">
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
                                    <CardDescription className="text-base">التصنيف والاسم</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="category" className="text-base font-semibold flex items-center gap-2">
                                    <Hash className="h-4 w-4 text-muted-foreground" />
                                    الصنف *
                                </Label>
                                <Select name="category" required onValueChange={setSelectedCategory}>
                                    <SelectTrigger className="h-12 text-base">
                                        <SelectValue placeholder="اختر الصنف" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {INVENTORY_CATEGORIES.map(cat => (
                                            <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {selectedCategory === "OTHER" ? (
                                <div className="space-y-2">
                                    <Label htmlFor="customCategory" className="text-base font-semibold">حدد الصنف *</Label>
                                    <Input
                                        id="customCategory"
                                        name="customCategory"
                                        required
                                        placeholder="مثال: بروجيكتور"
                                        className="h-12 text-base"
                                    />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Label htmlFor="sku" className="text-base font-semibold">SKU (اختياري)</Label>
                                    <Input
                                        id="sku"
                                        name="sku"
                                        placeholder="رمز المخزون"
                                        className="h-12 text-base"
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-base font-semibold flex items-center gap-2">
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                    اسم العنصر *
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    required
                                    placeholder="مثال: لابتوب HP ProBook"
                                    className="h-12 text-base"
                                />
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
                        <CardContent className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="manufacturer" className="text-base font-semibold">الشركة المصنعة</Label>
                                <Select name="manufacturer" onValueChange={setSelectedManufacturer}>
                                    <SelectTrigger className="h-12 text-base">
                                        <SelectValue placeholder="اختر الشركة" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.keys(MANUFACTURERS).map(m => (
                                            <SelectItem key={m} value={m}>{m}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="model" className="text-base font-semibold">الموديل</Label>
                                {selectedManufacturer && MANUFACTURERS[selectedManufacturer]?.length > 0 ? (
                                    <Select name="model" onValueChange={setSelectedModel}>
                                        <SelectTrigger className="h-12 text-base">
                                            <SelectValue placeholder="اختر الموديل" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {MANUFACTURERS[selectedManufacturer].map(model => (
                                                <SelectItem key={model} value={model}>{model}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <Input
                                        id="model"
                                        name="model"
                                        placeholder="أدخل الموديل يدوياً"
                                        className="h-12 text-base"
                                    />
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="serialNumber" className="text-base font-semibold">السريال نمبر</Label>
                                <Input
                                    id="serialNumber"
                                    name="serialNumber"
                                    placeholder="Serial Number"
                                    className="h-12 text-base font-mono"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Barcode Card */}
                <Card className="card-elevated animate-slide-up stagger-2">
                    <CardHeader className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-purple-500/10 p-2">
                                <BarcodeIcon className="h-5 w-5 text-purple-600" />
                            </div>
                            <div className="space-y-1.5">
                                <CardTitle className="text-xl font-bold">الباركود والتتبع</CardTitle>
                                <CardDescription className="text-base">توليد وطباعة الباركود</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Label htmlFor="barcode" className="text-base font-semibold">باركود</Label>
                            <div className="flex gap-3">
                                <Input
                                    id="barcode"
                                    name="barcode"
                                    value={barcode}
                                    onChange={(e) => setBarcode(e.target.value)}
                                    placeholder="امسح أو أنشئ باركود"
                                    className="h-12 text-base font-mono flex-1"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="lg"
                                    onClick={generateBarcode}
                                    className="gap-2 shadow-sm"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    توليد
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="lg"
                                    onClick={printBarcode}
                                    disabled={!barcode}
                                    className="gap-2 shadow-sm"
                                >
                                    <Printer className="h-4 w-4" />
                                    طباعة
                                </Button>
                            </div>
                            {barcode && (
                                <div className="mt-4 p-4 bg-gradient-primary rounded-lg border border-primary/20">
                                    <p className="text-center text-3xl font-mono tracking-wider text-primary">
                                        {barcode}
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Quantity and Pricing Card */}
                <Card className="card-elevated animate-slide-up stagger-3">
                    <CardHeader className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-orange-500/10 p-2">
                                <DollarSign className="h-5 w-5 text-orange-600" />
                            </div>
                            <div className="space-y-1.5">
                                <CardTitle className="text-xl font-bold">الكمية والتسعير</CardTitle>
                                <CardDescription className="text-base">إدارة المخزون والأسعار</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="quantity" className="text-base font-semibold flex items-center gap-2">
                                    <Hash className="h-4 w-4 text-muted-foreground" />
                                    العدد *
                                </Label>
                                <Input
                                    id="quantity"
                                    name="quantity"
                                    type="number"
                                    required
                                    min="0"
                                    defaultValue="0"
                                    className="h-12 text-base"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="minQuantity" className="text-base font-semibold">الحد الأدنى *</Label>
                                <Input
                                    id="minQuantity"
                                    name="minQuantity"
                                    type="number"
                                    required
                                    min="0"
                                    defaultValue="5"
                                    className="h-12 text-base"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="unitPrice" className="text-base font-semibold flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                    سعر الوحدة
                                </Label>
                                <Input
                                    id="unitPrice"
                                    name="unitPrice"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    className="h-12 text-base"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Invoice Upload Card */}
                <Card className="card-elevated animate-slide-up stagger-4">
                    <CardHeader className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-indigo-500/10 p-2">
                                <FileText className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div className="space-y-1.5">
                                <CardTitle className="text-xl font-bold">فاتورة المشتريات</CardTitle>
                                <CardDescription className="text-base">إرفاق الفاتورة (اختياري)</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <Label htmlFor="invoice" className="text-base font-semibold">
                                رفع الفاتورة
                            </Label>

                            {!invoice ? (
                                <div className="flex items-center gap-3">
                                    <Input
                                        id="invoice"
                                        name="invoice"
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={handleInvoiceChange}
                                        className="h-12 text-base file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 p-4 bg-gradient-primary rounded-lg border border-primary/20">
                                    <FileText className="h-5 w-5 text-primary" />
                                    <div className="flex-1">
                                        <p className="text-base font-medium text-primary">{invoice.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {(invoice.size / 1024).toFixed(2)} KB
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={removeInvoice}
                                        className="h-9 w-9 text-primary hover:bg-primary/10"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                            <p className="text-sm text-muted-foreground">
                                أنواع الملفات المدعومة: PDF, JPG, PNG (حد أقصى 10 MB)
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Submit Button */}
                <div className="flex justify-end gap-3 pt-4 animate-slide-up stagger-5">
                    <Link href="/inventory">
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
                                إضافة للمستودع
                                <ArrowRight className="h-4 w-4" />
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
