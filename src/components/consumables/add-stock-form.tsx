'use client'

import { useFormStatus } from "react-dom"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { restockConsumable } from "@/app/actions/consumables"
import { toast } from "sonner"

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" disabled={pending} className="w-full bg-emerald-600 hover:bg-emerald-700">
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            تأكيد التوريد
        </Button>
    )
}

export function AddStockForm({ itemId }: { itemId: string }) {
    async function action(formData: FormData) {
        const id = formData.get('id') as string;
        const quantity = parseInt(formData.get('quantity') as string);
        const notes = formData.get('notes') as string;

        const result = await restockConsumable(id, quantity, notes)
        if (result.success) {
            toast.success("تم إضافة المخزون بنجاح")
        } else {
            toast.error(result.error)
        }
    }

    return (
        <form action={action} className="space-y-4">
            <input type="hidden" name="id" value={itemId} />

            <div className="space-y-2">
                <Label htmlFor="quantity">الكمية المضافة</Label>
                <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    required
                    defaultValue="1"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="notes">ملاحظات (رقم الفاتورة / المصدر)</Label>
                <Textarea id="notes" name="notes" placeholder="تفاصيل التوريد..." />
            </div>

            <SubmitButton />
        </form>
    )
}
