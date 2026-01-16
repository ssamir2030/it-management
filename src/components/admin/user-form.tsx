"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { UserRole, ROLE_LABELS } from "@/lib/rbac"
import { createUser } from "@/app/actions/users"
import { toast } from "sonner"
import { Loader2, User, Mail, Lock, ShieldCheck, UserPlus, Save } from "lucide-react"

export function UserForm() {
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
                toast.success("تم إنشاء المستخدم بنجاح 🎉")
                router.push("/nav/settings?tab=users") // Redirect relative to where users are, usually settings -> users tab or just back to users page if explicit route
                // Wait, the previous page was /settings/users.
                router.push("/settings/users")
                router.refresh()
            } else {
                toast.error(result.error || "فشل إنشاء المستخدم")
            }
        } catch (error) {
            toast.error("حدث خطأ غير متوقع")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-base font-medium flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            الاسم الكامل
                        </Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="مثال: محمد أحمد"
                            required
                            className="h-11"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-base font-medium flex items-center gap-2">
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
                            className="h-11"
                        />
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-base font-medium flex items-center gap-2">
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
                            className="h-11"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role" className="text-base font-medium flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                            الصلاحية
                        </Label>
                        <Select
                            value={formData.role}
                            onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
                        >
                            <SelectTrigger className="h-11">
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
                        <p className="text-xs mt-2 bg-muted/50 p-2 rounded border border-border text-muted-foreground">
                            * {ROLE_LABELS[formData.role]}: {
                                formData.role === UserRole.SUPER_ADMIN ? "تحكم كامل في النظام" :
                                    formData.role === UserRole.IT_MANAGER ? "إدارة الطلبات والمخزون والموظفين" :
                                        formData.role === UserRole.IT_SUPPORT ? "معالجة الطلبات والدعم الفني" :
                                            "عرض التقارير فقط"
                            }
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 mt-6 border-t">
                <Button
                    variant="outline"
                    type="button"
                    onClick={() => router.push('/settings/users')}
                    className="gap-2 h-11 px-8"
                >
                    إلغاء
                </Button>
                <Button
                    type="submit"
                    disabled={loading}
                    className="gap-2 h-11 px-8"
                >
                    {loading ? (
                        <>
                            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                            جاري الإنشاء...
                        </>
                    ) : (
                        <>
                            <UserPlus className="ml-2 h-4 w-4" />
                            إنشاء المستخدم
                        </>
                    )}
                </Button>
            </div>
        </form>
    )
}
