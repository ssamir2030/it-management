'use client'

import { useState } from "react"
import { updateSLA } from "@/app/actions/sla"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Clock, Save, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface SLA {
    id: string
    name: string
    priority: string
    responseTime: number
    resolutionTime: number
}

export function SLAConfig({ slaList }: { slaList: SLA[] }) {
    const router = useRouter()
    const [loading, setLoading] = useState<string | null>(null)
    const [formData, setFormData] = useState(slaList)

    const handleChange = (id: string, field: 'responseTime' | 'resolutionTime', value: string) => {
        const numValue = parseInt(value) || 0
        setFormData(prev => prev.map(item =>
            item.id === id ? { ...item, [field]: numValue } : item
        ))
    }

    const handleSave = async (item: SLA) => {
        // Find current value from state
        const currentData = formData.find(i => i.id === item.id)
        if (!currentData) return

        setLoading(item.id)
        try {
            const result = await updateSLA(item.id, currentData.responseTime, currentData.resolutionTime)
            if (result.success) {
                toast.success(`تم تحديث سياسة ${item.name} بنجاح`)
                router.refresh()
            } else {
                toast.error(result.error)
            }
        } catch (error) {
            toast.error("حدث خطأ أثناء الحفظ")
        } finally {
            setLoading(null)
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'URGENT': return 'bg-red-100 text-red-700 border-red-200'
            case 'HIGH': return 'bg-orange-100 text-orange-700 border-orange-200'
            case 'NORMAL': return 'bg-blue-100 text-blue-700 border-blue-200'
            case 'LOW': return 'bg-slate-100 text-slate-700 border-slate-200'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    return (
        <div className="grid gap-6 md:grid-cols-2">
            {formData.map((item) => (
                <Card key={item.id} className="overflow-hidden border-t-4" style={{
                    borderTopColor: item.priority === 'URGENT' ? '#ef4444' :
                        item.priority === 'HIGH' ? '#f97316' :
                            item.priority === 'NORMAL' ? '#3b82f6' : '#64748b'
                }}>
                    <CardHeader className="pb-3 border-b bg-gray-50/50">
                        <div className="flex justify-between items-center">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Clock className="h-5 w-5 text-gray-500" />
                                {item.name}
                            </CardTitle>
                            <Badge variant="outline" className={getPriorityColor(item.priority)}>
                                {item.priority}
                            </Badge>
                        </div>
                        <CardDescription>
                            إعدادات الوقت المسموح به للأولوية {item.name}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor={`response-${item.id}`} className="text-sm font-medium text-gray-600">
                                    وقت الاستجابة (ساعات)
                                </Label>
                                <div className="relative">
                                    <Input
                                        id={`response-${item.id}`}
                                        type="number"
                                        min="0"
                                        value={item.responseTime}
                                        onChange={(e) => handleChange(item.id, 'responseTime', e.target.value)}
                                        className="pl-8"
                                    />
                                    <span className="absolute left-3 top-2.5 text-xs text-muted-foreground">سا</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground">
                                    الوقت المتوقع للرد الأول على التذكرة
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`resolution-${item.id}`} className="text-sm font-medium text-gray-600">
                                    وقت الحل (ساعات)
                                </Label>
                                <div className="relative">
                                    <Input
                                        id={`resolution-${item.id}`}
                                        type="number"
                                        min="0"
                                        value={item.resolutionTime}
                                        onChange={(e) => handleChange(item.id, 'resolutionTime', e.target.value)}
                                        className="pl-8"
                                    />
                                    <span className="absolute left-3 top-2.5 text-xs text-muted-foreground">سا</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground">
                                    الوقت المتوقع لإغلاق التذكرة نهائياً
                                </p>
                            </div>
                        </div>

                        <Button
                            className="w-full mt-2"
                            onClick={() => handleSave(item)}
                            disabled={loading === item.id}
                        >
                            {loading === item.id ? (
                                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                            ) : (
                                <Save className="h-4 w-4 mr-2" />
                            )}
                            حفظ التغييرات
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
