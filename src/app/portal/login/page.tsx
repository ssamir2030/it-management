"use client"

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { employeeLogin } from "@/app/actions/employee-portal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, UserCircle2, Lock, ArrowRight, LayoutDashboard, MonitorSmartphone } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function EmployeeLoginPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    async function onSubmit(formData: FormData) {
        setIsLoading(true)
        const identityNumber = formData.get("identityNumber") as string
        const password = formData.get("password") as string

        try {
            const result = await employeeLogin(identityNumber, password)

            if (result.success) {
                toast({
                    title: "مرحباً بك مجدداً 👋",
                    description: "جاري تأمين اتصالك وتحويلك للبوابة...",
                    className: "bg-emerald-500 text-white border-none"
                })
                // Short delay for visual feedback
                setTimeout(() => {
                    window.location.href = "/portal"
                }, 800)
            } else {
                toast({
                    title: "تعذر الدخول",
                    description: result.error,
                    variant: "destructive",
                })
                setIsLoading(false)
            }
        } catch (error) {
            setIsLoading(false)
            toast({
                title: "خطأ غير متوقع",
                description: "يرجى المحاولة مرة أخرى لاحقاً",
                variant: "destructive",
            })
        }
    }

    if (!mounted) return null

    return (
        <div className="min-h-screen w-full flex overflow-hidden bg-slate-950" dir="rtl">

            {/* Animated Background Layers */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 animate-pulse duration-[10000ms]" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 animate-pulse duration-[7000ms]" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
            </div>

            {/* Left Side: Hero Section (Desktop) */}
            <div className="hidden lg:flex flex-1 relative z-10 flex-col justify-center items-start px-20 text-white">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/50 to-transparent pointer-events-none" />

                <div className="relative z-20 space-y-8 max-w-2xl animate-slide-up bg-white/5 p-8 rounded-3xl backdrop-blur-sm border border-white/10 shadow-2xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-blue-600/20 rounded-xl border border-blue-500/30">
                            <MonitorSmartphone className="h-8 w-8 text-blue-400" />
                        </div>
                        <span className="text-xl font-bold tracking-wider text-blue-200 uppercase">Employee Portal</span>
                    </div>

                    <h1 className="text-5xl font-black leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-indigo-200">
                        بوابة الخدمات الذاتية للموظفين
                    </h1>

                    <p className="text-lg text-slate-300 leading-relaxed">
                        قم بإدارة أصولك التقنية، طلب الخدمات، ومتابعة التذاكر بكل سهولة ومن مكان واحد.
                        نظام متكامل مصمم لخدمتكم.
                    </p>

                    <div className="grid grid-cols-2 gap-4 mt-8">
                        {[
                            "متابعة العهد والأصول",
                            "تقديم طلبات الدعم",
                            "طلب مستلزمات جديدة",
                            "تحديث البيانات الشخصية"
                        ].map((feature, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                <div className="h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]" />
                                <span className="text-sm font-medium">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-20 lg:bg-slate-950/50 lg:backdrop-blur-sm lg:border-r border-white/5">
                <div className="w-full max-w-[420px] space-y-8 animate-slide-up stagger-1">

                    {/* Header for Mobile/Form */}
                    <div className="text-center space-y-2 lg:text-right">
                        <div className="lg:hidden inline-flex p-3 bg-blue-600/20 rounded-2xl mb-4 border border-blue-500/30">
                            <MonitorSmartphone className="h-8 w-8 text-blue-400" />
                        </div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">تسجيل الدخول</h2>
                        <p className="text-slate-400">أدخل بياناتك للوصول إلى حسابك</p>
                    </div>

                    <form action={onSubmit} className="space-y-6">
                        {/* ID Input */}
                        <div className="space-y-2 group">
                            <Label htmlFor="identityNumber" className="text-slate-300 text-sm group-hover:text-blue-400 transition-colors">رقم الهوية</Label>
                            <div className="relative transition-all duration-300 group-focus-within:scale-[1.02]">
                                <div className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-center rounded-r-xl bg-slate-800 border border-slate-700 group-focus-within:border-blue-500/50 group-focus-within:bg-blue-500/10 transition-colors">
                                    <UserCircle2 className="h-5 w-5 text-slate-400 group-focus-within:text-blue-400" />
                                </div>
                                <Input
                                    id="identityNumber"
                                    name="identityNumber"
                                    placeholder="أدخل رقم هويتك"
                                    className="h-12 pr-14 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-blue-500/20 rounded-xl transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-2 group">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="password" className="text-slate-300 text-sm group-hover:text-blue-400 transition-colors">كلمة المرور</Label>
                            </div>
                            <div className="relative transition-all duration-300 group-focus-within:scale-[1.02]">
                                <div className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-center rounded-r-xl bg-slate-800 border border-slate-700 group-focus-within:border-blue-500/50 group-focus-within:bg-blue-500/10 transition-colors">
                                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-400" />
                                </div>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="h-12 pr-14 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-blue-500/20 rounded-xl transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 rounded-xl transition-all duration-300 group"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    الدخول للنظام
                                    <ArrowRight className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="text-center">
                        <p className="text-slate-500 text-xs">
                            نظام إدارة الأصول التقنية v2.0 - جميع الحقوق محفوظة
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
