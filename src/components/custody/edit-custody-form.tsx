"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { updateCustodyItem } from "@/app/actions/custody"
import { Loader2, Save, User, Package, FileText, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

interface EditCustodyFormProps {
    item: any
    employees: any[]
}

export function EditCustodyForm({ item, employees }: EditCustodyFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    async function onSubmit(formData: FormData) {
        setIsLoading(true)
        const result = await updateCustodyItem(item.id, formData)
        setIsLoading(false)

        if (result.success) {
            toast.success("تم تحديث العهدة بنجاح", {
                description: "تم حفظ التعديلات في النظام"
            })
            router.push("/custody")
            router.refresh()
        } else {
            toast.error("حدث خطأ", {
                description: result.error
            })
        }
    }

    return (
        <form action={onSubmit} className="animate-slide-up stagger-1">
            <Card className="card-elevated border-t-4 border-t-blue-500/20">
                <CardHeader className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-500/10 p-2.5">
                            <Package className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-bold">بيانات العهدة</CardTitle>
                            <CardDescription>تعديل تفاصيل العهدة والموظف المستلم</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-base font-medium">اسم العهدة <span className="text-red-500">*</span></Label>
                            <div className="relative">
                                <Input id="name" name="name" defaultValue={item.name} required className="h-12 text-base pl-10" placeholder="مثال: لابتوب HP" />
                                <Package className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="employeeId" className="text-base font-medium">الموظف المستلم <span className="text-red-500">*</span></Label>
                            <Select name="employeeId" defaultValue={item.employeeId} required>
                                <SelectTrigger className="h-12 text-base">
                                    <SelectValue placeholder="اختر موظف" />
                                </SelectTrigger>
                                <SelectContent>
                                    {employees.map((emp) => (
                                        <SelectItem key={emp.id} value={emp.id}>
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                                {emp.name}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-base font-medium">الوصف / التفاصيل</Label>
                        <div className="relative">
                            <Textarea
                                id="description"
                                name="description"
                                defaultValue={item.description || ''}
                                className="min-h-[120px] text-base pl-10 pt-3"
                                placeholder="تفاصيل إضافية عن العهدة..."
                            />
                            <FileText className="absolute left-3 top-4 h-5 w-5 text-muted-foreground" />
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-6">
                        <Button variant="outline" size="lg" type="button" onClick={() => router.back()}>
                            إلغاء
                        </Button>
                        <Button type="submit" disabled={isLoading} size="lg" className="min-w-[150px] gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30">
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    جاري الحفظ...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="h-5 w-5" />
                                    حفظ التغييرات
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    )
}
