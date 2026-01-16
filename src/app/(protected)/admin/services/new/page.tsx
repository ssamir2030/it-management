'use client'

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { createServiceItem, getServiceCategories } from "@/app/actions/services"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function NewServicePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [categories, setCategories] = useState<any[]>([])

    useEffect(() => {
        getServiceCategories().then(res => {
            if (res.success) setCategories(res.data || [])
        })
    }, [])

    async function onSubmit(formData: FormData) {
        setLoading(true)
        const result = await createServiceItem(formData)
        setLoading(false)

        if (result.success) {
            toast.success("تم إنشاء الخدمة بنجاح")
            router.push('/admin/services')
            router.refresh()
        } else {
            toast.error(result.error)
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">إضافة خدمة جديدة</h1>

            <form action={onSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>بيانات الخدمة</CardTitle>
                        <CardDescription>الخدمة ستظهر للموظفين في دليل الخدمات</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label>اسم الخدمة</Label>
                            <Input name="nameAr" required placeholder="مثال: طلب جهاز لابتوب جديد" />
                        </div>

                        <div className="space-y-2">
                            <Label>التصنيف</Label>
                            <Select name="categoryId" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="اختر التصنيف" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                            {cat.nameAr}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>الوصف</Label>
                            <Textarea name="description" placeholder="وصف الخدمة وما تتضمنه..." />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>SLA (بالساعات)</Label>
                                <Input type="number" name="slaHours" defaultValue="24" min="1" />
                            </div>
                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <Label htmlFor="approval">تتطلب موافقة؟</Label>
                                <Switch id="approval" name="approvalRequired" defaultChecked value="true" />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => router.back()}>إلغاء</Button>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                حفظ الخدمة
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    )
}
