'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { requestPasswordReset, resetPassword } from '@/app/actions/password-reset'
import { Monitor, ArrowRight, Mail, KeyRound, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

type Step = 'email' | 'code' | 'success'

export default function ForgotPasswordPage() {
    const router = useRouter()
    const [step, setStep] = useState<Step>('email')
    const [email, setEmail] = useState('')
    const [code, setCode] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')

    // إرسال طلب الكود
    async function handleRequestCode(e: React.FormEvent) {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const result = await requestPasswordReset(email)

            if (result.success) {
                setMessage(result.message || '')
                setStep('code')
            } else {
                setError(result.error || 'حدث خطأ')
            }
        } catch {
            setError('حدث خطأ في الاتصال')
        } finally {
            setLoading(false)
        }
    }

    // التحقق من الكود وتغيير كلمة المرور
    async function handleResetPassword(e: React.FormEvent) {
        e.preventDefault()
        setError('')

        if (newPassword !== confirmPassword) {
            setError('كلمتا المرور غير متطابقتين')
            return
        }

        setLoading(true)

        try {
            const result = await resetPassword(email, code, newPassword)

            if (result.success) {
                setStep('success')
            } else {
                setError(result.error || 'حدث خطأ')
            }
        } catch {
            setError('حدث خطأ في الاتصال')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4" dir="rtl">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur rounded-2xl mb-4">
                        <Monitor className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">استعادة كلمة المرور</h1>
                    <p className="text-slate-400">نظام إدارة تقنية المعلومات</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8">

                    {/* Step 1: Email */}
                    {step === 'email' && (
                        <form onSubmit={handleRequestCode} className="space-y-6">
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                                    <Mail className="h-6 w-6 text-blue-600" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900">أدخل بريدك الإلكتروني</h2>
                                <p className="text-slate-500 text-sm mt-1">سنرسل لك كود للتحقق</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">البريد الإلكتروني</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@example.com"
                                    required
                                    className="h-12"
                                    dir="ltr"
                                />
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                                    <AlertCircle className="h-4 w-4" />
                                    {error}
                                </div>
                            )}

                            <Button type="submit" disabled={loading} className="w-full h-12">
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin ml-2" />
                                        جاري الإرسال...
                                    </>
                                ) : (
                                    'إرسال الكود'
                                )}
                            </Button>

                            <div className="text-center">
                                <Link href="/login" className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1">
                                    <ArrowRight className="h-4 w-4" />
                                    العودة لتسجيل الدخول
                                </Link>
                            </div>
                        </form>
                    )}

                    {/* Step 2: Code & New Password */}
                    {step === 'code' && (
                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mb-3">
                                    <KeyRound className="h-6 w-6 text-emerald-600" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900">أدخل الكود</h2>
                                <p className="text-slate-500 text-sm mt-1">تم إرسال كود مكون من 6 أرقام إلى بريدك</p>
                            </div>

                            {message && (
                                <div className="flex items-center gap-2 text-emerald-600 text-sm bg-emerald-50 p-3 rounded-lg">
                                    <CheckCircle2 className="h-4 w-4" />
                                    {message}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="code">كود التحقق</Label>
                                <Input
                                    id="code"
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="000000"
                                    required
                                    maxLength={6}
                                    className="h-14 text-center text-2xl tracking-[0.5em] font-mono"
                                    dir="ltr"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    className="h-12"
                                    dir="ltr"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="h-12"
                                    dir="ltr"
                                />
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                                    <AlertCircle className="h-4 w-4" />
                                    {error}
                                </div>
                            )}

                            <Button type="submit" disabled={loading} className="w-full h-12">
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin ml-2" />
                                        جاري التحقق...
                                    </>
                                ) : (
                                    'تغيير كلمة المرور'
                                )}
                            </Button>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => setStep('email')}
                                    className="text-sm text-slate-500 hover:text-slate-700"
                                >
                                    إعادة إرسال الكود
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Step 3: Success */}
                    {step === 'success' && (
                        <div className="text-center py-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 mb-2">تم بنجاح!</h2>
                            <p className="text-slate-500 mb-6">تم تغيير كلمة المرور بنجاح</p>

                            <Button onClick={() => router.push('/login')} className="w-full h-12">
                                الذهاب لتسجيل الدخول
                            </Button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}
