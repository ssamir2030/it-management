'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { changePassword } from "@/app/actions/employee-portal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Lock, Loader2, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface ChangePasswordFormProps {
    employee: any
}

export function ChangePasswordForm({ employee }: ChangePasswordFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)

    async function onSubmit(formData: FormData) {
        setIsLoading(true)
        const currentPassword = formData.get("currentPassword") as string
        const newPassword = formData.get("newPassword") as string

        // Basic validation
        if (newPassword.length < 6) {
            toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل")
            setIsLoading(false)
            return
        }

        const result = await changePassword(currentPassword, newPassword)

        if (result.success) {
            toast.success("تم تغيير كلمة المرور بنجاح")
            router.push("/portal/dashboard")
        } else {
            toast.error(result.error)
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-6" dir="rtl">
            <div className="w-full space-y-6">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
                    <Link href="/portal/dashboard" className="hover:text-primary transition-colors">نظام رافد</Link>
                    <span>»</span>
                    <Link href="/portal/dashboard" className="hover:text-primary transition-colors">المكتب الإلكتروني</Link>
                    <span>»</span>
                    <span className="text-foreground font-medium">تغيير كلمة المرور</span>
                </div>

                <Card className="border-t-4 border-t-yellow-500 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                    <CardHeader className="border-b bg-gray-50/50 dark:bg-slate-800/50 dark:border-slate-700 pb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-lg">
                                    <Lock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                                </div>
                                <CardTitle className="text-xl text-gray-800 dark:text-gray-100">تغيير كلمة المرور</CardTitle>
                            </div>
                        </div>
                    </CardHeader>
                    <form action={onSubmit}>
                        <CardContent className="space-y-6 pt-8 px-8">
                            {/* Read-only fields */}
                            <div className="grid md:grid-cols-1 gap-6">
                                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                                    <Label className="w-40 text-left md:text-left text-gray-600 dark:text-muted-foreground">معرف الدخول:</Label>
                                    <div className="flex-1 p-2 bg-gray-100 dark:bg-slate-800 rounded border dark:border-slate-700 text-gray-600 dark:text-gray-300 font-medium">
                                        {employee.identityNumber}
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 dark:border-slate-700 my-4"></div>

                            {/* Password fields */}
                            <div className="space-y-6">
                                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                                    <Label htmlFor="currentPassword" className="w-40 text-left md:text-left text-gray-600 dark:text-muted-foreground">
                                        كلمة المرور الحالية: <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="flex-1 relative">
                                        <Input
                                            id="currentPassword"
                                            name="currentPassword"
                                            type={showCurrentPassword ? "text" : "password"}
                                            required
                                            className="pr-10 dark:bg-slate-800 dark:border-slate-700"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gray-600 dark:hover:text-gray-300"
                                        >
                                            {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                                    <Label htmlFor="newPassword" className="w-40 text-left md:text-left text-gray-600 dark:text-muted-foreground">
                                        كلمة المرور الجديدة: <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="flex-1 relative">
                                        <Input
                                            id="newPassword"
                                            name="newPassword"
                                            type={showNewPassword ? "text" : "password"}
                                            required
                                            className="pr-10 dark:bg-slate-800 dark:border-slate-700"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gray-600 dark:hover:text-gray-300"
                                        >
                                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                                    <Label className="w-40 text-left md:text-left text-gray-600 dark:text-muted-foreground">الصلاحيات:</Label>
                                    <div className="flex-1 text-gray-600 dark:text-gray-300 font-medium">
                                        {employee.jobTitle || "موظف"}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-center border-t bg-gray-50/50 dark:bg-slate-800/50 dark:border-slate-700 py-6">
                            <Button
                                type="submit"
                                className="bg-green-600 hover:bg-green-700 text-white min-w-[150px]"
                                disabled={isLoading}
                            >
                                {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                                حفظ التغييرات
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    )
}
