'use client'

import { useState } from "react"
import { useFormStatus } from "react-dom"
import { Loader2 } from "lucide-react"
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
import { createConsumable } from "@/app/actions/consumables"
import { toast } from "sonner"

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" disabled={pending} className="w-full">
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            حفظ الصنف
        </Button>
    )
}

export function AddConsumableForm({ onSuccess }: { onSuccess: () => void }) {
    async function action(formData: FormData) {
        const name = formData.get('name') as string
        const categoryId = formData.get('category') as string // Changed from 'categoryId' to 'category' based on form field name
        const minQuantity = Number(formData.get('minStock')) // Changed from 'minQuantity' to 'minStock' based on form field name
        const currentStock = Number(formData.get('currentStock')) // Added currentStock based on form field name
        const unit = formData.get('unit') as string // Added unit based on form field name
        // Assuming 'description' is not present in the current form, so omitting it or adding a default/empty string

        const result = await createConsumable({
            name,
            categoryId,
            minQuantity,
            description: '' // Default description since it's missing in form but might be expected
        })
        if (result.success) {
            toast.success("تمت الإضافة بنجاح")
            onSuccess()
        } else {
            toast.error(result.error)
        }
    }

    return (
        <form action={action} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">اسم الصنف</Label>
                <Input id="name" name="name" placeholder="مثال: حبر HP 85A" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="category">التصنيف</Label>
                    <Select name="category" defaultValue="أحبار">
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="أحبار">أحبار طابعات</SelectItem>
                            <SelectItem value="أوراق">أوراق طباعة</SelectItem>
                            <SelectItem value="قرطاسية">قرطاسية مكتبية</SelectItem>
                            <SelectItem value="أخرى">أخرى</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="unit">الوحدة</Label>
                    <Select name="unit" defaultValue="قطعة">
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="قطعة">قطعة</SelectItem>
                            <SelectItem value="علبة">علبة</SelectItem>
                            <SelectItem value="رزمه">رزمه (500 ورقة)</SelectItem>
                            <SelectItem value="كرتون">كرتون</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="currentStock">الرصيد الافتتاحي</Label>
                    <Input id="currentStock" name="currentStock" type="number" min="0" defaultValue="0" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="minStock">حد الطلب (للتنبيه)</Label>
                    <Input id="minStock" name="minStock" type="number" min="1" defaultValue="5" />
                </div>
            </div>

            <SubmitButton />
        </form>
    )
}
