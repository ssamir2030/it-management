'use client'

export const dynamic = 'force-dynamic';

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { simpleLogin } from '@/lib/simple-auth'
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Monitor, ShieldCheck, AlertCircle } from "lucide-react"

function LoginButton({ loading }: { loading: boolean }) {
    return (
        <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 text-lg shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 hover:scale-[1.02] active:scale-95 transition-all duration-300 bg-gradient-to-r from-blue-700 to-indigo-800 hover:to-indigo-900"
        >
            {loading ? 'جاري الدخول...' : 'دخول النظام'}
        </Button>
    )
}

export default function LoginPage() {
    const [email, setEmail] = useState('admin@system.com')
    const [password, setPassword] = useState('123456')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const result = await simpleLogin(email, password)

            if (result.success) {
                router.push('/dashboard')
                router.refresh()
            } else {
                setError(result.error || 'فشل تسجيل الدخول')
            }
        } catch (err) {
            setError('حدث خطأ في الاتصال')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen overflow-hidden">
            {/* Left Side - Form */}
            <div className="flex items-center justify-center py-12 relative z-10 bg-background lg:bg-background">
                <div className="mx-auto grid w-[350px] gap-6">
                    <div className="grid gap-2 text-center relative">
                        <div className="flex justify-center mb-6">
                            <div className="relative group cursor-pointer">
                                <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-700 rounded-full blur-md opacity-40 group-hover:opacity-75 transition duration-500 group-hover:duration-200 animate-pulse"></div>
                                <div className="relative p-5 bg-background rounded-full border border-border shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                                    <Monitor className="h-10 w-10 text-primary group-hover:text-blue-600 transition-colors duration-300" />
                                </div>
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-800 to-indigo-900 dark:from-blue-400 dark:to-indigo-300">
                            تسجيل الدخول
                        </h1>
                        <p className="text-balance text-muted-foreground">
                            أدخل بريدك الإلكتروني للدخول إلى النظام
                        </p>
                    </div>

                    <div className="grid gap-4">
                        <form onSubmit={handleSubmit} className="grid gap-4">
                            <div className="grid gap-2 group">
                                <Label htmlFor="email" className="group-focus-within:text-primary transition-colors">البريد الإلكتروني</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="m@example.com"
                                    required
                                    className="h-11 transition-all duration-300 focus:scale-[1.02] focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                    dir="ltr"
                                />
                            </div>
                            <div className="grid gap-2 group">
                                <Label htmlFor="password" className="group-focus-within:text-primary transition-colors">كلمة المرور</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-11 transition-all duration-300 focus:scale-[1.02] focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                    dir="ltr"
                                />
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 dark:bg-red-950 p-3 rounded-lg border border-red-200 dark:border-red-800">
                                    <AlertCircle className="h-4 w-4" />
                                    <p>{error}</p>
                                </div>
                            )}

                            <LoginButton loading={loading} />
                        </form>

                        <div className="mt-4 text-center text-sm bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                            <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">بيانات الدخول الافتراضية:</p>
                            <p className="font-mono text-blue-700 dark:text-blue-300" dir="ltr">admin@system.com</p>
                            <p className="font-mono text-blue-700 dark:text-blue-300" dir="ltr">123456</p>
                        </div>
                    </div>

                    <div className="mt-4 text-center text-sm">
                        <div className="flex items-center justify-center gap-2 text-muted-foreground bg-muted/30 p-3 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors cursor-help">
                            <ShieldCheck className="h-4 w-4 text-green-500 animate-bounce" />
                            <span>نظام آمن ومحمي بتشفير متقدم</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Image & Content */}
            <div className="hidden lg:block relative overflow-hidden bg-black">
                {/* Animated Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-transparent to-slate-900/50 z-10 mix-blend-overlay animate-pulse" />

                {/* Background Image with Slow Zoom */}
                <Image
                    src="/images/login-bg.png"
                    alt="IT Management Background"
                    fill
                    className="object-cover opacity-90 scale-105 animate-in fade-in duration-1000 hover:scale-110 transition-transform duration-1000 ease-linear"
                    priority
                />

                {/* Dark Gradient for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-20" />

                {/* Floating Glass Card */}
                <div className="absolute bottom-20 right-10 left-10 z-30">
                    <div className="relative p-8 bg-white/5 backdrop-blur-lg rounded-3xl border border-white/10 shadow-2xl overflow-hidden group hover:bg-white/10 transition-all duration-500 animate-in slide-in-from-bottom-20 duration-1000 delay-300">
                        {/* Decorative Glow */}
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/30 rounded-full blur-3xl group-hover:bg-primary/50 transition-all duration-1000"></div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-1 w-12 bg-gradient-to-r from-primary to-blue-500 rounded-full" />
                                <span className="text-blue-200 font-medium tracking-widest text-xs uppercase">Enterprise Edition v2.0</span>
                            </div>
                            <h2 className="text-4xl font-bold mb-4 leading-tight text-white">
                                إدارة تقنية متكاملة <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300">لمستقبل رقمي واعد</span>
                            </h2>
                            <p className="text-lg text-gray-300 max-w-lg leading-relaxed">
                                تحكم كامل في الأصول، الموظفين، والدعم الفني من منصة واحدة مركزية مدعومة بأحدث تقنيات الذكاء الاصطناعي.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
