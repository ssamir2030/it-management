"use client"

export const dynamic = 'force-dynamic';

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, Loader2, Package, ArrowLeft, Tag, Layers, Archive, FileText, CheckCircle2, RefreshCw } from "lucide-react"
import { PremiumPageHeader } from '@/components/ui/premium-page-header'
import Link from "next/link"

export default function NewConsumablePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        setLoading(false)
        router.push("/consumables")
    }

    return (
        <div className="content-spacing animate-fade-in">
            {/* Professional Header */}
            <PremiumPageHeader
                title="إضافة صنف جديد"
                description="إضافة مادة استهلاكية جديدة إلى مخزون المواد"
                icon={Package}
                rightContent={
                    <Link href="/consumables">
                        <Button variant="ghost" size="lg" className="text-white hover:bg-white/20 gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            إلغاء والعودة
                        </Button>
                    </Link>
                }
            />

            <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up stagger-1">
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Item Details Card */}
                    <Card className="card-elevated border-t-4 border-t-orange-500/20">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-orange-500/10 p-2">
                                    <Tag className="h-5 w-5 text-orange-600" />
                                </div>
                                <div className="space-y-1.5">
                                    <CardTitle className="text-xl font-bold">بيانات الصنف</CardTitle>
                                    <CardDescription>المعلومات الأساسية للمادة</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-base font-semibold">اسم الصنف *</Label>
                                <Input
                                    id="name"
                                    required
                                    placeholder="مثال: حبر طابعة HP 85A"
                                    className="h-12 text-base"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category" className="text-base font-semibold">الفئة *</Label>
                                <Select required>
                                    <SelectTrigger className="h-12 text-base">
                                        <SelectValue placeholder="اختر الفئة" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="INK">أحبار (Ink)</SelectItem>
                                        <SelectItem value="PAPER">ورق (Paper)</SelectItem>
                                        <SelectItem value="CABLES">كابلات (Cables)</SelectItem>
                                        <SelectItem value="OTHER">أخرى (Other)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stock Details Card */}
                    <Card className="card-elevated border-t-4 border-t-blue-500/20">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-blue-500/10 p-2">
                                    <Archive className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="space-y-1.5">
                                    <CardTitle className="text-xl font-bold">المخزون والكميات</CardTitle>
                                    <CardDescription>إدارة الكميات المتوفرة والحدود</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="quantity" className="text-base font-semibold">الكمية الحالية *</Label>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        required
                                        min="0"
                                        placeholder="0"
                                        className="h-12 text-base"
                                        dir="ltr"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="minQuantity" className="text-base font-semibold">الحد الأدنى *</Label>
                                    <Input
                                        id="minQuantity"
                                        type="number"
                                        required
                                        min="0"
                                        placeholder="0"
                                        className="h-12 text-base"
                                        dir="ltr"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="unit" className="text-base font-semibold">الوحدة</Label>
                                <Select defaultValue="PIECE">
                                    <SelectTrigger className="h-12 text-base">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PIECE">قطعة (Piece)</SelectItem>
                                        <SelectItem value="BOX">صندوق (Box)</SelectItem>
                                        <SelectItem value="ROLL">لفة (Roll)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Description Card */}
                <Card className="card-elevated border-t-4 border-t-purple-500/20 animate-slide-up stagger-2">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-purple-500/10 p-2">
                                <FileText className="h-5 w-5 text-purple-600" />
                            </div>
                            <div className="space-y-1.5">
                                <CardTitle className="text-xl font-bold">الوصف</CardTitle>
                                <CardDescription>معلومات إضافية عن الصنف</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-base font-semibold">وصف الصنف</Label>
                            <Textarea
                                id="description"
                                placeholder="معلومات أو ملاحظات إضافية عن الصنف..."
                                className="min-h-[120px] text-base"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Submit Button */}
                <div className="flex justify-end gap-3 pt-4 animate-slide-up stagger-3">
                    <Link href="/consumables">
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
                                حفظ الصنف
                                <ArrowRight className="h-4 w-4" />
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
