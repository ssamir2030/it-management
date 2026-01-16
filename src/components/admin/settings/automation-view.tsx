"use client"

import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import { Zap, Plus, Trash2, Edit2, Play } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { getAutomationRules, deleteAutomationRule, toggleAutomationRule, seedAutomationRules } from "@/app/actions/automation"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Shield } from "lucide-react"

type Rule = {
    id: string
    name: string
    description: string | null
    isActive: boolean
    triggerType: string
    conditions: string
    actions: string
    runCount: number
    lastRunAt: Date | null
}

interface AutomationViewProps {
    readOnly: boolean
}

export default function AutomationView({ readOnly }: AutomationViewProps) {
    const [rules, setRules] = useState<Rule[]>([])
    const [loading, setLoading] = useState(true)

    const fetchRules = async () => {
        setLoading(true)
        const result = await getAutomationRules()
        if (result.success && result.data) {
            setRules(result.data)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchRules()
    }, [])

    const handleDelete = async (id: string) => {
        if (readOnly) return
        if (confirm("هل أنت متأكد من حذف هذه القاعدة؟")) {
            await deleteAutomationRule(id)
            fetchRules()
            toast.success("تم الحذف")
        }
    }

    const handleToggle = async (id: string, current: boolean) => {
        if (readOnly) return
        setRules(rules.map(r => r.id === id ? { ...r, isActive: !current } : r))
        const result = await toggleAutomationRule(id, !current)
        if (!result.success) {
            toast.error("فشل التحديث")
            // Revert
            setRules(rules.map(r => r.id === id ? { ...r, isActive: current } : r))
        }
    }

    return (
        <div className="space-y-6" dir="rtl">
            <PremiumPageHeader
                backLink="/admin/settings"
                backText="الإعدادات"
                title="محرك الأتمتة"
                description="إنشاء قواعد سير العمل (Workflows) والتنفيذ التلقائي للمهام"
                icon={Zap}
                rightContent={
                    !readOnly && (
                        <div className="flex gap-2">
                            <Button onClick={async () => {
                                const res = await seedAutomationRules()
                                if (res.success) { fetchRules(); toast.success('تم إضافة قواعد افتراضية') }
                            }} variant="outline" className="gap-2">
                                <Play className="w-4 h-4" />
                                قواعد جاهزة
                            </Button>
                            <Link href="/admin/settings/automation/new">
                                <Button className="gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700">
                                    <Plus className="w-4 h-4" />
                                    قاعدة جديدة
                                </Button>
                            </Link>
                        </div>
                    )
                }
            />

            {readOnly && (
                <Alert variant="default" className="bg-muted border-primary/20">
                    <Shield className="h-4 w-4" />
                    <AlertTitle>وضع المشاهدة فقط</AlertTitle>
                    <AlertDescription>
                        يمكنك استعراض قواعد الأتمتة ولكن لا يمكنك تعديلها أو تشغيلها.
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid gap-4">
                {rules.map(rule => (
                    <Card key={rule.id} className={`transition-all ${!rule.isActive ? 'opacity-60 grayscale' : ''}`}>
                        <CardHeader className="flex flex-row items-start justify-between pb-2">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    {rule.name}
                                    <Badge variant="secondary" className="font-mono text-xs">{rule.triggerType}</Badge>
                                </CardTitle>
                                <CardDescription>{rule.description || "بدون وصف"}</CardDescription>
                            </div>
                            <Switch
                                checked={rule.isActive}
                                onCheckedChange={() => handleToggle(rule.id, rule.isActive)}
                                disabled={readOnly}
                            />
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
                                <div className="flex gap-4">
                                    <span className="flex items-center gap-1">
                                        <Play className="w-3 h-3" />
                                        مرات التشغيل: {rule.runCount}
                                    </span>
                                    {rule.lastRunAt && (
                                        <span>
                                            آخر تشغيل: {new Date(rule.lastRunAt).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                                {!readOnly && (
                                    <div className="flex gap-2">
                                        <Link href={`/admin/settings/automation/${rule.id}`}>
                                            <Button variant="ghost" size="sm">
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(rule.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {rules.length === 0 && !loading && (
                    <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                        لا توجد قواعد أتمتة.
                    </div>
                )}
            </div>
        </div>
    )
}
