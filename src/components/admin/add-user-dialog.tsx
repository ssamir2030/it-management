"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
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
import { Plus, Loader2, User, Mail, Lock, ShieldCheck, UserPlus } from "lucide-react"

export function AddUserDialog() {
    const [open, setOpen] = useState(false)
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
                setOpen(false)
                setFormData({
                    name: "",
                    email: "",
                    password: "",
                    role: UserRole.IT_SUPPORT
                })
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
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                    <UserPlus className="h-5 w-5" />
                    إضافة مستخدم جديد
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full sm:max-w-[540px] border-r-4 border-r-purple-500 overflow-y-auto">
                <SheetHeader className="space-y-4 pb-6 border-b">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <UserPlus className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="space-y-1">
                            <SheetTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                                إضافة مستخدم جديد
                            </SheetTitle>
                            <SheetDescription className="text-base">
                                أدخل بيانات الموظف الجديد وحدد صلاحياته للوصول للنظام.
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="space-y-8 mt-8">
                    <div className="space-y-6">
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
                                className="h-12 text-lg bg-muted/30 border-muted-foreground/20 focus:border-purple-500 transition-all"
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
                                className="h-12 text-lg bg-muted/30 border-muted-foreground/20 focus:border-purple-500 transition-all"
                            />
                        </div>

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
                                className="h-12 text-lg bg-muted/30 border-muted-foreground/20 focus:border-purple-500 transition-all"
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
                                <SelectTrigger className="h-12 text-lg bg-muted/30 border-muted-foreground/20 focus:border-purple-500 transition-all">
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

                    <div className="pt-6 border-t">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 text-lg"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                                    جاري الإنشاء...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="ml-2 h-5 w-5" />
                                    إنشاء المستخدم
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    )
}
