"use client"

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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Plus, Trash2, Save, ArrowRight } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { saveAutomationRule } from "@/app/actions/automation"
import { toast } from "sonner"
import { PremiumPageHeader } from "@/components/ui/premium-page-header"

type Rule = {
    id?: string
    name: string
    description: string | null
    triggerType: string
    conditions: any[]
    actions: any[]
    isActive: boolean
}

interface AutomationRuleFormProps {
    initialData?: Rule
}

export function AutomationRuleForm({ initialData }: AutomationRuleFormProps) {
    const router = useRouter()
    const [formData, setFormData] = useState<Rule>(initialData || {
        name: "",
        description: "",
        triggerType: "TICKET_CREATED",
        conditions: [],
        actions: [],
        isActive: true
    })

    // Condition Helpers
    const addCondition = () => {
        setFormData(prev => ({
            ...prev,
            conditions: [...prev.conditions, { field: 'priority', operator: 'equals', value: '' }]
        }))
    }

    const updateCondition = (index: number, field: string, value: string) => {
        const newConditions = [...formData.conditions]
        newConditions[index] = { ...newConditions[index], [field]: value }
        setFormData(prev => ({ ...prev, conditions: newConditions }))
    }

    const removeCondition = (index: number) => {
        setFormData(prev => ({
            ...prev,
            conditions: prev.conditions.filter((_, i) => i !== index)
        }))
    }

    // Action Helpers
    const addAction = () => {
        setFormData(prev => ({
            ...prev,
            actions: [...prev.actions, { type: 'UPDATE_FIELD', params: {} }]
        }))
    }

    const updateActionParam = (index: number, key: string, value: string) => {
        const newActions = [...formData.actions]
        newActions[index].params = { ...newActions[index].params, [key]: value }
        setFormData(prev => ({ ...prev, actions: newActions }))
    }

    const removeAction = (index: number) => {
        setFormData(prev => ({
            ...prev,
            actions: prev.actions.filter((_, i) => i !== index)
        }))
    }

    const handleSubmit = async () => {
        if (!formData.name) {
            toast.error("اسم القاعدة مطلوب")
            return
        }

        const payload = {
            ...formData,
            description: formData.description || undefined,
            conditions: JSON.stringify(formData.conditions),
            actions: JSON.stringify(formData.actions)
        }

        const result = await saveAutomationRule(payload, formData.id)
        if (result.success) {
            toast.success("تم حفظ القاعدة")
            router.push('/admin/settings/automation')
            router.refresh()
        } else {
            toast.error(result.error)
        }
    }

    return (
        <div className="space-y-6" dir="rtl">
            <PremiumPageHeader
                title={initialData ? "تعديل قاعدة" : "قاعدة جديدة"}
                description="تعريف شروط وإجراءات الأتمتة"
                icon={Save}
                backLink="/admin/settings/automation"
            />

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>البيانات الأساسية</CardTitle>
                        <CardDescription>حدد اسم القاعدة ونوع الحدث المشغل لها.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>اسم القاعدة</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="مثال: تصعيد التذاكر عالية الأولوية"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>المشغل (Trigger Event)</Label>
                            <Select
                                value={formData.triggerType}
                                onValueChange={(val) => setFormData(prev => ({ ...prev, triggerType: val }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TICKET_CREATED">عند إنشاء تذكرة</SelectItem>
                                    <SelectItem value="TICKET_UPDATED">عند تحديث تذكرة</SelectItem>
                                    <SelectItem value="ASSET_UPDATED">عند تحديث أصل</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="col-span-2 space-y-2">
                            <Label>الوصف</Label>
                            <Input
                                value={formData.description || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Conditions */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>الشروط (Conditions)</CardTitle>
                                <CardDescription>متى يتم تنفيذ القاعدة؟</CardDescription>
                            </div>
                            <Button size="sm" onClick={addCondition}>
                                <Plus className="w-4 h-4 ml-1" /> إضافة
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {formData.conditions.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4 border-2 border-dashed rounded-lg">
                                    سيتم التنفيذ دائماً (بدون شروط)
                                </p>
                            )}
                            {formData.conditions.map((cond, idx) => (
                                <div key={idx} className="p-3 bg-muted/40 rounded-lg border space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-muted-foreground">الشرط {idx + 1}</span>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeCondition(idx)}>
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                    <div className="grid gap-2">
                                        <Select value={cond.field} onValueChange={(v) => updateCondition(idx, 'field', v)}>
                                            <SelectTrigger><SelectValue placeholder="الحقل" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="priority">الأولوية</SelectItem>
                                                <SelectItem value="status">الحالة</SelectItem>
                                                <SelectItem value="category">التصنيف</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select value={cond.operator} onValueChange={(v) => updateCondition(idx, 'operator', v)}>
                                            <SelectTrigger><SelectValue placeholder="العملية" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="equals">يساوي (=)</SelectItem>
                                                <SelectItem value="not_equals">لا يساوي (!=)</SelectItem>
                                                <SelectItem value="contains">يحتوي على</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Input
                                            value={cond.value}
                                            onChange={(e) => updateCondition(idx, 'value', e.target.value)}
                                            placeholder="القيمة (مثال: HIGH)"
                                        />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>الإجراءات (Actions)</CardTitle>
                                <CardDescription>ماذا يجب أن يحدث؟</CardDescription>
                            </div>
                            <Button size="sm" onClick={addAction}>
                                <Plus className="w-4 h-4 ml-1" /> إضافة
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {formData.actions.length === 0 && (
                                <p className="text-sm text-destructive text-center py-4 border-2 border-dashed rounded-lg bg-destructive/5">
                                    يجب إضافة إجراء واحد على الأقل
                                </p>
                            )}
                            {formData.actions.map((act, idx) => (
                                <div key={idx} className="p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-primary">الإجراء {idx + 1}</span>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeAction(idx)}>
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                    <div className="grid gap-2">
                                        <Select value={act.type} onValueChange={(v) => {
                                            const newActions = [...formData.actions]
                                            newActions[idx].type = v
                                            setFormData(prev => ({ ...prev, actions: newActions }))
                                        }}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="UPDATE_FIELD">تحديث حقل</SelectItem>
                                                <SelectItem value="SEND_EMAIL">إرسال بريد</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        {act.type === 'UPDATE_FIELD' && (
                                            <div className="grid grid-cols-2 gap-2">
                                                <Input
                                                    placeholder="الحقل"
                                                    value={act.params?.field || ''}
                                                    onChange={(e) => updateActionParam(idx, 'field', e.target.value)}
                                                />
                                                <Input
                                                    placeholder="القيمة"
                                                    value={act.params?.value || ''}
                                                    onChange={(e) => updateActionParam(idx, 'value', e.target.value)}
                                                />
                                            </div>
                                        )}
                                        {act.type === 'SEND_EMAIL' && (
                                            <Input
                                                placeholder="عنوان الرسالة"
                                                value={act.params?.subject || ''}
                                                onChange={(e) => updateActionParam(idx, 'subject', e.target.value)}
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => router.back()}>إلغاء</Button>
                    <Button size="lg" onClick={handleSubmit} className="px-8">
                        حفظ القاعدة
                    </Button>
                </div>
            </div>
        </div>
    )
}
