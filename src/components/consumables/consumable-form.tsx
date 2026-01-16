'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
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
import { createConsumable } from '@/app/actions/consumables'
import { Loader2, Package, ArrowRight, Save, LayoutGrid } from 'lucide-react'
import { PremiumPageHeader } from '@/components/ui/premium-page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useSidebar } from '@/hooks/use-sidebar'

interface ConsumableFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    categories: any[]
    onSuccess?: () => void
}

export function ConsumableForm({ open, onOpenChange, categories, onSuccess }: ConsumableFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm()
    const { isOpen: isSidebarOpen } = useSidebar()

    async function onSubmit(data: any) {
        setIsLoading(true)
        try {
            const res = await createConsumable({
                name: data.name,
                categoryId: data.categoryId,
                minQuantity: parseInt(data.minQuantity),
                description: data.description
            })

            if (res.success) {
                toast.success('تمت إضافة الصنف بنجاح')
                onOpenChange(false)
                reset()
                onSuccess?.()
            } else {
                toast.error(res.error || 'فشل في إضافة الصنف')
            }
        } catch (error) {
            toast.error('حدث خطأ غير متوقع')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
            <DialogContent
                className={cn(
                    "fixed bottom-0 left-0 right-0 top-16 z-[50] h-[calc(100vh-4rem)] max-w-none p-0 border-0 rounded-none sm:rounded-none translate-x-0 translate-y-0",
                    "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950",
                    "data-[state=open]:!zoom-in-100 data-[state=open]:!slide-in-from-left-0 data-[state=open]:!slide-in-from-top-0 data-[state=open]:!fade-in-0 data-[state=open]:duration-300",
                    "transition-all duration-300 ease-in-out",
                    isSidebarOpen ? "lg:pr-[280px]" : "lg:pr-[80px]"
                )}
            >
                <div className="w-full h-full overflow-y-auto">
                    <PremiumPageHeader
                        title="إضافة صنف جديد"
                        description="أضف صنف جديد إلى قائمة المستهلكات والمخزون"
                        icon={Package}
                        rightContent={
                            <Button variant="ghost" size="lg" onClick={() => onOpenChange(false)} className="text-white hover:bg-white/20 gap-2">
                                <ArrowRight className="h-4 w-4" />
                                إلغاء والعودة
                            </Button>
                        }
                    />

                    <div className="container mx-auto px-4 py-8">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-slide-up stagger-1 max-w-4xl mx-auto">

                            <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-primary/10 p-2">
                                            <LayoutGrid className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="space-y-1">
                                            <CardTitle>بيانات الصنف</CardTitle>
                                            <CardDescription>المعلومات الأساسية للصنف الجديد</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-base">اسم الصنف</Label>
                                            <Input
                                                id="name"
                                                required
                                                {...register('name', { required: true })}
                                                placeholder="مثال: حبر طابعة HP 85A"
                                                className="h-11 bg-slate-950/50 border-slate-800"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-base">التصنيف</Label>
                                            <Select onValueChange={(val) => setValue('categoryId', val)} required>
                                                <SelectTrigger className="h-11 bg-slate-950/50 border-slate-800">
                                                    <SelectValue placeholder="اختر التصنيف" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories?.map((cat) => (
                                                        <SelectItem key={cat.id} value={cat.id}>
                                                            {cat.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="minQuantity" className="text-base">الحد الأدنى للتنبيه</Label>
                                            <Input
                                                id="minQuantity"
                                                type="number"
                                                defaultValue={5}
                                                min={1}
                                                {...register('minQuantity')}
                                                className="h-11 bg-slate-950/50 border-slate-800"
                                            />
                                            <p className="text-xs text-muted-foreground">سيظهر تنبيه عندما تصل الكمية لهذا الرقم أو أقل</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2 pt-2">
                                        <Label htmlFor="description" className="text-base">وصف / ملاحظات</Label>
                                        <Textarea
                                            id="description"
                                            {...register('description')}
                                            className="min-h-[100px] resize-none bg-slate-950/50 border-slate-800"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex justify-end pt-4">
                                <Button type="submit" size="lg" disabled={isLoading} className="min-w-[200px] h-12 text-lg gap-2">
                                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                                    حفظ الصنف
                                </Button>
                            </div>

                        </form>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
