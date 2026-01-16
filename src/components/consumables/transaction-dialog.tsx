'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { restockConsumable, checkoutConsumable } from '@/app/actions/consumables'
import { getEmployees } from '@/app/actions/employees'
import { Loader2, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'

interface TransactionDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    consumable: any
    type: 'IN' | 'OUT'
    onSuccess?: () => void
}

export function TransactionDialog({ open, onOpenChange, consumable, type, onSuccess }: TransactionDialogProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [employees, setEmployees] = useState<any[]>([])
    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm()

    const quantity = watch('quantity')

    useEffect(() => {
        if (open && type === 'OUT') {
            // Load employees for checkout
            getEmployees().then(res => {
                if (res.success && res.data) {
                    setEmployees(res.data)
                }
            })
        }
    }, [open, type])

    async function onSubmit(data: any) {
        setIsLoading(true)
        try {
            let res
            const qty = parseInt(data.quantity)

            if (type === 'IN') {
                res = await restockConsumable(consumable.id, qty, data.notes)
            } else {
                res = await checkoutConsumable(consumable.id, data.employeeId, qty, data.notes)
            }

            if (res.success) {
                toast.success(type === 'IN' ? 'تم إضافة الكمية بنجاح' : 'تم صرف الكمية بنجاح')
                onOpenChange(false)
                reset()
                onSuccess?.()
            }
            if (!res.success) {
                toast.error((res as any).error || "فشلت العملية")
                return
            }
        } catch (error) {
            toast.error('حدث خطأ غير متوقع')
        } finally {
            setIsLoading(false)
        }
    }

    if (!consumable) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {type === 'IN' ? (
                            <>
                                <ArrowDownCircle className="text-green-600 w-6 h-6" />
                                <span>إضافة مخزون (شراء)</span>
                            </>
                        ) : (
                            <>
                                <ArrowUpCircle className="text-red-600 w-6 h-6" />
                                <span>صرف مخزون (استخدام)</span>
                            </>
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        {consumable.name} - الكمية الحالية: <span className="font-bold text-foreground">{consumable.quantity}</span>
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label>الكمية</Label>
                        <Input
                            type="number"
                            min={1}
                            max={type === 'OUT' ? consumable.quantity : undefined}
                            required
                            {...register('quantity', {
                                required: true,
                                min: 1,
                                max: type === 'OUT' ? { value: consumable.quantity, message: 'لا توجد كمية كافية' } : undefined
                            })}
                        />
                        {errors.quantity && <p className="text-sm text-red-500">{errors.quantity.message as string}</p>}
                    </div>

                    {type === 'OUT' && (
                        <div className="space-y-2">
                            <Label>الموظف المستلم</Label>
                            <Select onValueChange={(val) => setValue('employeeId', val)} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="اختر الموظف" />
                                </SelectTrigger>
                                <SelectContent>
                                    {employees.map((emp) => (
                                        <SelectItem key={emp.id} value={emp.id}>
                                            {emp.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>ملاحظات</Label>
                        <Textarea {...register('notes')} placeholder="رقم الطلب، سبب الصرف، إلخ..." />
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isLoading} variant={type === 'IN' ? 'default' : 'destructive'}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {type === 'IN' ? 'تأكيد الإضافة' : 'تأكيد الصرف'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
