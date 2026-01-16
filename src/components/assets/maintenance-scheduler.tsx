'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon, Clock, Trash2, Plus, RefreshCw } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { createMaintenanceSchedule, deleteMaintenanceSchedule, MaintenanceFrequency } from '@/app/actions/maintenance'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'

interface MaintenanceSchedulerProps {
    assetId: string
    schedules: any[] // Prisma type
}

export function MaintenanceScheduler({ assetId, schedules }: MaintenanceSchedulerProps) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        description: '',
        frequency: 'MONTHLY' as MaintenanceFrequency,
        startDate: format(new Date(), 'yyyy-MM-dd')
    })

    async function handleSubmit() {
        if (!formData.description) return
        setLoading(true)
        try {
            const res = await createMaintenanceSchedule(
                assetId,
                formData.frequency,
                formData.description,
                new Date(formData.startDate)
            )

            if (res.success) {
                toast.success("تمت إضافة جدول الصيانة بنجاح")
                setOpen(false)
                router.refresh()
            } else {
                toast.error(res.error || "فشل في الإضافة")
            }
        } catch (error) {
            toast.error("حدث خطأ ما")
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('هل أنت متأكد من حذف هذا الجدول؟')) return
        try {
            const res = await deleteMaintenanceSchedule(id)
            if (res.success) {
                toast.success("تم الحذف بنجاح")
                router.refresh()
            } else {
                toast.error("فشل الحذف")
            }
        } catch (error) {
            toast.error("حدث خطأ")
        }
    }

    const frequencyLabels: Record<string, string> = {
        DAILY: 'يومي',
        WEEKLY: 'أسبوعي',
        MONTHLY: 'شهري',
        QUARTERLY: 'ربع سنوي',
        YEARLY: 'سنوي'
    }

    return (
        <Card className="border-0 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-slate-50/50 dark:bg-slate-900/50 border-b">
                <div className="space-y-1">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        جداول الصيانة الدورية
                    </CardTitle>
                    <CardDescription className="text-xs">
                        إنشاء تذاكر صيانة تلقائية لهذا الأصل
                    </CardDescription>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="h-8 gap-1">
                            <Plus className="h-3.5 w-3.5" />
                            جدول جديد
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>إضافة جدول صيانة دورية</DialogTitle>
                            <DialogDescription>
                                سيقوم النظام بإنشاء تذكرة صيانة تلقائياً بناءً على هذا الجدول.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>عنوان الصيانة</Label>
                                <Input
                                    placeholder="مثال: فحص دوري، تنظيف فلاتر..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>التكرار</Label>
                                    <Select
                                        value={formData.frequency}
                                        onValueChange={(val: MaintenanceFrequency) => setFormData({ ...formData, frequency: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="DAILY">يومي</SelectItem>
                                            <SelectItem value="WEEKLY">أسبوعي</SelectItem>
                                            <SelectItem value="MONTHLY">شهري</SelectItem>
                                            <SelectItem value="QUARTERLY">ربع سنوي</SelectItem>
                                            <SelectItem value="YEARLY">سنوي</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>تاريخ البدء</Label>
                                    <Input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <Button className="w-full" onClick={handleSubmit} disabled={loading || !formData.description}>
                                {loading ? "جاري الحفظ..." : "حفظ الجدول"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent className="pt-4">
                {schedules.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground text-sm">
                        لا توجد جداول صيانة نشطة
                    </div>
                ) : (
                    <div className="space-y-3">
                        {schedules.map(schedule => (
                            <div key={schedule.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center shrink-0">
                                        <RefreshCw className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{schedule.description}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="secondary" className="text-[10px] h-5">
                                                {frequencyLabels[schedule.frequency]}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <CalendarIcon className="h-3 w-3" />
                                                القادم: {new Date(schedule.nextMaintenanceDate).toLocaleDateString('en-GB')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => handleDelete(schedule.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
