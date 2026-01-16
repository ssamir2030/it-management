'use client'

import { useFormStatus } from "react-dom"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { checkoutConsumable } from "@/app/actions/consumables"
import { getEmployeesForSelect } from "@/app/actions/custody"
import { toast } from "sonner"

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" disabled={pending} className="w-full bg-indigo-600 hover:bg-indigo-700">
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            تأكيد الصرف
        </Button>
    )
}

export function DispenseForm({ itemId, maxStock, employees }: { itemId: string, maxStock: number, employees: any[] }) {
    async function action(formData: FormData) {
        const id = formData.get("id") as string;
        const employeeId = formData.get("employeeId") as string;
        const quantity = parseInt(formData.get("quantity") as string);
        const notes = formData.get("notes") as string | undefined;

        const result = await checkoutConsumable(id, employeeId, quantity, notes);
        if (result.success) {
            toast.success("تم الصرف بنجاح")
            // Close dialog logic would be handled by parent re-render or explicit close if passed
        } else {
            toast.error((result as any).error || "فشل الصرف")
        }
    }

    return (
        <form action={action} className="space-y-4">
            <input type="hidden" name="id" value={itemId} />

            <div className="space-y-2">
                <Label htmlFor="employeeId">الموظف المستلم</Label>
                <Select name="employeeId" required>
                    <SelectTrigger>
                        <SelectValue placeholder="اختر الموظف..." />
                    </SelectTrigger>
                    <SelectContent>
                        {employees.map((emp) => (
                            <SelectItem key={emp.id} value={emp.id}>
                                {emp.name} - {emp.department?.name || 'بدون قسم'}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="quantity">الكمية المصروفة (المتوفر: {maxStock})</Label>
                <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    max={maxStock}
                    required
                    defaultValue="1"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="notes">ملاحظات (اختياري)</Label>
                <Textarea id="notes" name="notes" placeholder="سبب الصرف..." />
            </div>

            <SubmitButton />
        </form>
    )
}
