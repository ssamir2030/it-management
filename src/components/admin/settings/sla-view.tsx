"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Save, Trash2, X, Timer, Loader2 } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { toast } from "sonner"
import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import { getSLAList, createSLA, deleteSLA } from "@/app/actions/sla"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Shield } from "lucide-react"

const chartData = [
    { name: "يناير", compliance: 98 },
    { name: "فبراير", compliance: 95 },
    { name: "مارس", compliance: 99 },
    { name: "أبريل", compliance: 92 },
    { name: "مايو", compliance: 96 },
    { name: "يونيو", compliance: 97 },
]

interface SLAPolicy {
    id: string
    name: string
    priority: string
    responseTime: number
    resolutionTime: number
}

const priorityLabels: Record<string, string> = {
    CRITICAL: "حرجة (Critical)",
    HIGH: "عالية (High)",
    MEDIUM: "متوسطة (Medium)",
    LOW: "منخفضة (Low)"
}

const priorityBadgeVariants: Record<string, "destructive" | "default" | "secondary" | "outline"> = {
    CRITICAL: "destructive",
    HIGH: "default",
    MEDIUM: "secondary",
    LOW: "outline"
}

interface SLAViewProps {
    readOnly: boolean
}

export default function SLAView({ readOnly }: SLAViewProps) {
    const [policies, setPolicies] = useState<SLAPolicy[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [newPolicy, setNewPolicy] = useState({
        name: "",
        priority: "MEDIUM",
        responseTime: 60,
        resolutionTime: 8
    })

    useEffect(() => {
        loadPolicies()
    }, [])

    const loadPolicies = async () => {
        setLoading(true)
        const result = await getSLAList()
        if (result.success && result.data) {
            setPolicies(result.data)
        } else {
            // Handle unauthorized if necessary
        }
        setLoading(false)
    }

    const handleAddPolicy = async () => {
        if (readOnly) return
        if (!newPolicy.name.trim()) {
            toast.error("يرجى إدخال اسم السياسة")
            return
        }

        const toastId = toast.loading("جاري إضافة السياسة...")

        const result = await createSLA({
            name: newPolicy.name,
            priority: newPolicy.priority,
            responseTime: newPolicy.responseTime,
            resolutionTime: newPolicy.resolutionTime
        })

        toast.dismiss(toastId)

        if (result.success) {
            toast.success("تم إضافة السياسة بنجاح")
            setIsDialogOpen(false)
            setNewPolicy({ name: "", priority: "MEDIUM", responseTime: 60, resolutionTime: 8 })
            loadPolicies()
        } else {
            toast.error(result.error || "فشل إضافة السياسة")
        }
    }

    const handleDeletePolicy = async (id: string) => {
        if (readOnly) return
        if (!confirm("هل أنت متأكد من حذف هذه السياسة؟")) return

        const toastId = toast.loading("جاري الحذف...")
        const result = await deleteSLA(id)
        toast.dismiss(toastId)

        if (result.success) {
            toast.success("تم حذف السياسة بنجاح")
            loadPolicies()
        } else {
            toast.error(result.error || "فشل حذف السياسة")
        }
    }

    const formatTime = (minutes: number, isHours: boolean = false) => {
        if (isHours) {
            return `${minutes} ساعة`
        }
        if (minutes >= 60) {
            const hours = Math.floor(minutes / 60)
            const mins = minutes % 60
            return mins > 0 ? `${hours} ساعة و ${mins} دقيقة` : `${hours} ساعة`
        }
        return `${minutes} دقيقة`
    }

    return (
        <div className="flex flex-col gap-6" dir="rtl">
            <PremiumPageHeader
                backLink="/admin/settings"
                backText="الإعدادات"
                title="اتفاقيات مستوى الخدمة (SLA)"
                description="تكوين ومراقبة أداء الخدمة"
                icon={Timer}
                rightContent={
                    !readOnly && (
                        <Button className="gap-2 bg-white/20 hover:bg-white/30 text-white" onClick={() => setIsDialogOpen(true)}>
                            <Plus className="h-4 w-4" />
                            سياسة جديدة
                        </Button>
                    )
                }
            />

            {readOnly && (
                <Alert variant="default" className="bg-muted border-primary/20">
                    <Shield className="h-4 w-4" />
                    <AlertTitle>وضع المشاهدة فقط</AlertTitle>
                    <AlertDescription>
                        يمكنك الاطلاع على سياسات SLA ولكن لا تملك صلاحية التعديل.
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>نسبة الالتزام (Compliance Rate)</CardTitle>
                        <CardDescription>أداء الفريق خلال الـ 6 أشهر الماضية</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{
                                            borderRadius: '8px',
                                            border: 'none',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                            backgroundColor: 'hsl(var(--card))',
                                            color: 'hsl(var(--foreground))'
                                        }}
                                    />
                                    <Bar dataKey="compliance" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>إحصائيات سريعة</CardTitle>
                        <CardDescription>ملخص أداء اتفاقيات الخدمة</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">96%</p>
                                <p className="text-sm text-muted-foreground">متوسط الالتزام</p>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{policies.length}</p>
                                <p className="text-sm text-muted-foreground">عدد السياسات</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>السياسات الحالية</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>اسم السياسة</TableHead>
                                    <TableHead>الأولوية</TableHead>
                                    <TableHead>وقت الاستجابة</TableHead>
                                    <TableHead>وقت الحل</TableHead>
                                    <TableHead className="text-left">الإجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {policies.map((policy) => (
                                    <TableRow key={policy.id}>
                                        <TableCell className="font-medium">{policy.name}</TableCell>
                                        <TableCell>
                                            <Badge variant={priorityBadgeVariants[policy.priority]}>
                                                {priorityLabels[policy.priority] || policy.priority}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{formatTime(policy.responseTime)}</TableCell>
                                        <TableCell>{formatTime(policy.resolutionTime, true)}</TableCell>
                                        <TableCell className="text-left">
                                            {!readOnly && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => handleDeletePolicy(policy.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {policies.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                            لا توجد سياسات.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Premium Full-Screen Overlay for Adding Policy */}
            {isDialogOpen && !readOnly && (
                <div className="fixed inset-0 z-50 bg-background" dir="rtl">
                    <div className="min-h-screen flex flex-col">
                        {/* Premium Header - Dark Mode Optimized */}
                        <div className="relative overflow-hidden rounded-b-[2.5rem] shadow-2xl bg-slate-900 border-b border-white/10">
                            {/* Abstract Background Shapes */}
                            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
                            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />

                            <div className="relative z-10 px-8 py-12 md:py-16 container mx-auto max-w-7xl">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                                    <div className="flex items-center gap-8">
                                        <div className="p-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl">
                                            <Timer className="h-10 w-10 text-blue-400" />
                                        </div>
                                        <div className="space-y-2 text-center md:text-right">
                                            <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
                                                إضافة سياسة جديدة
                                            </h1>
                                            <p className="text-lg text-slate-300 font-medium">
                                                تكوين قواعد اتفاقية مستوى الخدمة وأوقات الاستجابة
                                            </p>
                                        </div>
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="lg"
                                        onClick={() => setIsDialogOpen(false)}
                                        className="rounded-xl border-white/20 bg-white/5 hover:bg-white/10 text-white hover:text-white"
                                    >
                                        <X className="h-5 w-5 ml-2" />
                                        إغلاق النافذة
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 container mx-auto max-w-7xl p-6 md:p-10 -mt-10 relative z-20">
                            <div className="grid gap-8">
                                <Card className="border-0 shadow-xl overflow-hidden">
                                    <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500" />
                                    <CardHeader>
                                        <CardTitle>تفاصيل السياسة</CardTitle>
                                        <CardDescription>أدخل البيانات الأساسية للسياسة الجديدة</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-8 p-8">
                                        <div className="grid md:grid-cols-2 gap-8">
                                            <div className="space-y-4 md:col-span-2">
                                                <Label htmlFor="name" className="text-lg">اسم السياسة <span className="text-red-500">*</span></Label>
                                                <Input
                                                    id="name"
                                                    placeholder="مثال: دعم الخوادم الحرجة"
                                                    value={newPolicy.name}
                                                    onChange={(e) => setNewPolicy({ ...newPolicy, name: e.target.value })}
                                                    className="h-14 text-lg bg-muted/50"
                                                />
                                            </div>

                                            <div className="space-y-4 md:col-span-2">
                                                <Label className="text-lg">الأولوية <span className="text-red-500">*</span></Label>
                                                <Select
                                                    value={newPolicy.priority}
                                                    onValueChange={(value) => setNewPolicy({ ...newPolicy, priority: value })}
                                                >
                                                    <SelectTrigger className="h-14 text-lg bg-muted/50">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="CRITICAL">حرجة (Critical)</SelectItem>
                                                        <SelectItem value="HIGH">عالية (High)</SelectItem>
                                                        <SelectItem value="MEDIUM">متوسطة (Medium)</SelectItem>
                                                        <SelectItem value="LOW">منخفضة (Low)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-8">
                                            <div className="p-6 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900/50 space-y-4">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                                        <Timer className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <Label htmlFor="responseTime" className="text-lg font-semibold text-blue-900 dark:text-blue-100">وقت الاستجابة الأولية</Label>
                                                </div>
                                                <div className="relative">
                                                    <Input
                                                        id="responseTime"
                                                        type="number"
                                                        min="1"
                                                        value={newPolicy.responseTime}
                                                        onChange={(e) => setNewPolicy({ ...newPolicy, responseTime: parseInt(e.target.value) || 0 })}
                                                        className="h-14 text-lg pr-4 pl-16 bg-white dark:bg-background"
                                                    />
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                                                        دقيقة
                                                    </div>
                                                </div>
                                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                                    أقصى وقت مسموح به للرد الأول على التذكرة قبل احتساب مخالفة.
                                                </p>
                                            </div>

                                            <div className="p-6 bg-purple-50 dark:bg-purple-950/30 rounded-xl border border-purple-100 dark:border-purple-900/50 space-y-4">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                                                        <Timer className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                                    </div>
                                                    <Label htmlFor="resolutionTime" className="text-lg font-semibold text-purple-900 dark:text-purple-100">وقت الحل النهائي</Label>
                                                </div>
                                                <div className="relative">
                                                    <Input
                                                        id="resolutionTime"
                                                        type="number"
                                                        min="1"
                                                        value={newPolicy.resolutionTime}
                                                        onChange={(e) => setNewPolicy({ ...newPolicy, resolutionTime: parseInt(e.target.value) || 0 })}
                                                        className="h-14 text-lg pr-4 pl-16 bg-white dark:bg-background"
                                                    />
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                                                        ساعة
                                                    </div>
                                                </div>
                                                <p className="text-sm text-purple-700 dark:text-purple-300">
                                                    أقصى وقت مسموح به لإغلاق التذكرة وحل المشكلة جذرياً.
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="flex justify-end gap-4 pb-20">
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        onClick={() => setIsDialogOpen(false)}
                                        className="h-12 w-32"
                                    >
                                        إلغاء
                                    </Button>
                                    <Button
                                        onClick={handleAddPolicy}
                                        size="lg"
                                        className="h-12 w-48 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25"
                                    >
                                        <Save className="h-5 w-5 ml-2" />
                                        حفظ السياسة
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
