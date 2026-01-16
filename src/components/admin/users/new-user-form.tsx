"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PremiumPageHeader } from '@/components/ui/premium-page-header'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { UserRole, ROLE_LABELS } from "@/lib/rbac"
import { createUser } from "@/app/actions/users"
import { toast } from "sonner"
import { Plus, Loader2, User, Mail, Lock, ShieldCheck, UserPlus, ArrowRight, CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function NewUserForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: UserRole.IT_SUPPORT
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const result = await createUser(formData)
            if (result.success) {
                toast.success("تم إنشاء المستخدم بنجاح 🎉", {
                    description: "سيتم تحويلك لصفحة المستخدمين..."
                })
                setTimeout(() => {
                    router.push('/admin/settings/users')
                }, 1500)
            } else {
                toast.error(result.error || "فشل إنشاء المستخدم")
                setLoading(false)
            }
        } catch (error) {
            toast.error("حدث خطأ غير متوقع")
            setLoading(false)
        }
    }

    return (
        <div className="space-y-8" dir="rtl">
            <PremiumPageHeader
                title="إضافة مستخدم جديد"
                description="أدخل بيانات الموظف الجديد وحدد صلاحياته للوصول للنظام"
                icon={UserPlus}
                rightContent={
                    <Link href="/admin/settings/users">
                        <Button variant="ghost" className="gap-2 text-white hover:bg-white/20">
                            <ArrowRight className="h-4 w-4" />
                            العودة
                        </Button>
                    </Link>
                }
            />

            <div className="grid gap-8 lg:grid-cols-3 animate-slide-up stagger-1">
                <div className="lg:col-span-2">
                    <Card className="border-t-4 border-t-purple-600 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserPlus className="h-5 w-5 text-purple-600" />
                                بيانات الحساب
                            </CardTitle>
                            <CardDescription>
                                جميع الحقول مطلوبة لإنشاء الحساب
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            الاسم الكامل
                                        </Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="مثال: محمد أحمد"
                                            required
                                            className="h-11 bg-muted/30 focus:border-purple-500 transition-all"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            البريد الإلكتروني
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="name@company.com"
                                            required
                                            className="h-11 bg-muted/30 focus:border-purple-500 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="flex items-center gap-2">
                                            <Lock className="h-4 w-4 text-muted-foreground" />
                                            كلمة المرور
                                        </Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="******"
                                            required
                                            minLength={6}
                                            className="h-11 bg-muted/30 focus:border-purple-500 transition-all"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="role" className="flex items-center gap-2">
                                            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                                            الصلاحية
                                        </Label>
                                        <Select
                                            value={formData.role}
                                            onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
                                        >
                                            <SelectTrigger className="h-11 bg-muted/30 focus:border-purple-500 transition-all">
                                                <SelectValue placeholder="اختر الصلاحية" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.values(UserRole).map((role) => (
                                                    <SelectItem key={role} value={role} className="text-right flex-row-reverse">
                                                        {ROLE_LABELS[role]}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full md:w-auto min-w-[200px] h-11 text-lg"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                                                جاري الإنشاء...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 className="ml-2 h-5 w-5" />
                                                حفظ المستخدم
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="bg-muted/50 border-border">
                        <CardHeader>
                            <CardTitle className="text-lg text-foreground">دليل الصلاحيات</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm text-foreground">مدير النظام (Super Admin)</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    صلاحيات كاملة للوصول لجميع أجزاء النظام، بما في ذلك الإعدادات وإدارة المستخدمين الآخرين.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm text-foreground">مدير تقنية المعلومات (IT Manager)</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    إدارة الطلبات، المخزون، الموظفين، والتقارير. لا يمكنه إدارة مستخدمي النظام الآخرين.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm text-foreground">دعم فني (IT Support)</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    معالجة الطلبات المسندة إليه، وعرض المخزون. صلاحيات محدودة للعمليات اليومية.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
