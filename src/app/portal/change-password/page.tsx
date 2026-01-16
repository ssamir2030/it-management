'use client'

export const dynamic = 'force-dynamic';

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { changePassword } from '@/app/actions/employee-portal'
import { toast } from 'sonner'
import { Lock, ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { PremiumPageHeader } from "@/components/ui/premium-page-header"

export default function ChangePasswordPage() {
    const [loading, setLoading] = useState(false)
    const [showCurrent, setShowCurrent] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('كلمة المرور الجديدة وتأكيد كلمة المرور غير متطابقتين')
            return
        }

        if (formData.newPassword.length < 8) {
            toast.error('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
            return
        }

        if (formData.currentPassword === formData.newPassword) {
            toast.error('كلمة المرور الجديدة يجب أن تكون مختلفة عن كلمة المرور الحالية')
            return
        }

        setLoading(true)

        const result = await changePassword(formData.currentPassword, formData.newPassword)

        if (result.success) {
            toast.success('تم تغيير كلمة المرور بنجاح! 🎉', {
                description: 'جاري تسجيل الخروج...',
                duration: 3000
            })

            try {
                // استدعاء API تسجيل الخروج
                await fetch('/api/auth/logout', { method: 'POST' })
            } catch (error) {
                console.error("Logout failed:", error)
            }

            // التحويل لصفحة تسجيل الدخول
            setTimeout(() => {
                window.location.href = '/portal/login'
            }, 1000)
        } else {
            toast.error(result.error || 'فشل في تغيير كلمة المرور')
            setLoading(false)
        }
    }

    const passwordStrength = (password: string) => {
        if (!password) return { strength: 0, label: '', color: '' }

        let strength = 0
        if (password.length >= 8) strength++
        if (password.length >= 12) strength++
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
        if (/\d/.test(password)) strength++
        if (/[^a-zA-Z0-9]/.test(password)) strength++

        if (strength <= 2) return { strength, label: 'ضعيفة', color: 'bg-red-500' }
        if (strength <= 3) return { strength, label: 'متوسطة', color: 'bg-yellow-500' }
        if (strength <= 4) return { strength, label: 'جيدة', color: 'bg-blue-500' }
        return { strength, label: 'قوية جداً', color: 'bg-green-500' }
    }

    const strength = passwordStrength(formData.newPassword)

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4" dir="rtl">
            <div className="w-full space-y-4">
                <PremiumPageHeader
                    title="تغيير كلمة المرور"
                    description="احفظ حسابك بكلمة مرور قوية وآمنة"
                    icon={Lock}
                    rightContent={
                        <Link href="/portal/profile">
                            <Button variant="ghost" className="gap-2 text-white hover:bg-white/20">
                                <ArrowRight className="h-4 w-4" />
                                العودة
                            </Button>
                        </Link>
                    }
                />

                <Card className="border-t-4 border-t-blue-600 shadow-xl">
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
                                <div className="relative">
                                    <Input
                                        id="currentPassword"
                                        type={showCurrent ? "text" : "password"}
                                        placeholder="أدخل كلمة المرور الحالية"
                                        value={formData.currentPassword}
                                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                        required
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrent(!showCurrent)}
                                        className="absolute left-3 top-3 text-muted-foreground hover:text-gray-600"
                                    >
                                        {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                                <div className="relative">
                                    <Input
                                        id="newPassword"
                                        type={showNew ? "text" : "password"}
                                        placeholder="أدخل كلمة المرور الجديدة (8 أحرف على الأقل)"
                                        value={formData.newPassword}
                                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                        required
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNew(!showNew)}
                                        className="absolute left-3 top-3 text-muted-foreground hover:text-gray-600"
                                    >
                                        {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>

                                {formData.newPassword && (
                                    <div className="space-y-2">
                                        <div className="flex gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`h-1.5 flex-1 rounded-full transition-all ${i < strength.strength ? strength.color : 'bg-gray-200'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <p className={`text-sm font-medium ${strength.color.replace('bg-', 'text-')}`}>
                                            قوة كلمة المرور: {strength.label}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">تأكيد كلمة المرور الجديدة</Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirm ? "text" : "password"}
                                        placeholder="أعد إدخال كلمة المرور الجديدة"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        required
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute left-3 top-3 text-muted-foreground hover:text-gray-600"
                                    >
                                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                                    <p className="text-sm text-red-600 flex items-center gap-1">
                                        ✗ كلمة المرور غير متطابقة
                                    </p>
                                )}
                                {formData.confirmPassword && formData.newPassword === formData.confirmPassword && (
                                    <p className="text-sm text-green-600 flex items-center gap-1">
                                        ✓ كلمة المرور متطابقة
                                    </p>
                                )}
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <ShieldCheck className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div className="space-y-1 text-sm text-blue-900">
                                        <p className="font-semibold">نصائح لكلمة مرور قوية:</p>
                                        <ul className="list-disc list-inside space-y-1 text-blue-800">
                                            <li>استخدم 8 أحرف على الأقل</li>
                                            <li>اجمع بين الأحرف الكبيرة والصغيرة</li>
                                            <li>أضف أرقاماً ورموزاً خاصة</li>
                                            <li>لا تستخدم معلومات شخصية</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        جاري التغيير...
                                    </>
                                ) : (
                                    <>
                                        <Lock className="h-4 w-4" />
                                        تغيير كلمة المرور
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
