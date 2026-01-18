import { AlertTriangle, Mail, Phone, Calendar, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function TrialExpiredPage() {
    const currentYear = new Date().getFullYear()

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4" dir="rtl">
            <div className="max-w-2xl w-full">
                {/* Main Card */}
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 md:p-12 shadow-2xl">
                    {/* Icon */}
                    <div className="flex justify-center mb-8">
                        <div className="relative">
                            <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full"></div>
                            <div className="relative bg-gradient-to-br from-red-500 to-rose-600 p-6 rounded-2xl shadow-lg">
                                <Lock className="h-12 w-12 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl font-black text-white text-center mb-4">
                        انتهت الفترة التجريبية
                    </h1>
                    <p className="text-slate-400 text-center text-lg mb-8">
                        نشكركم على تجربة نظام إدارة تقنية المعلومات
                    </p>

                    {/* Info Box */}
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 mb-8">
                        <div className="flex items-start gap-4">
                            <AlertTriangle className="h-6 w-6 text-amber-400 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="font-bold text-amber-400 mb-2">ملاحظة مهمة</h3>
                                <p className="text-amber-200/80 text-sm leading-relaxed">
                                    جميع بياناتك محفوظة بأمان ولن يتم حذفها. بمجرد تجديد الترخيص،
                                    ستتمكن من الوصول إلى جميع بياناتك وإعداداتك السابقة.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Features Locked */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        {[
                            'إدارة الأصول',
                            'بوابة الموظفين',
                            'التقارير',
                            'الدعم الفني'
                        ].map((feature, i) => (
                            <div key={i} className="flex items-center gap-2 text-slate-500">
                                <Lock className="h-4 w-4" />
                                <span className="text-sm">{feature}</span>
                            </div>
                        ))}
                    </div>

                    {/* Contact Section */}
                    <div className="bg-white/5 rounded-2xl p-6 mb-8">
                        <h3 className="font-bold text-white mb-4 text-center">للتجديد أو الاستفسار</h3>
                        <div className="space-y-3">
                            <a
                                href="mailto:support@example.com"
                                className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors p-3 rounded-lg hover:bg-white/5"
                            >
                                <Mail className="h-5 w-5 text-blue-400" />
                                <span dir="ltr">support@example.com</span>
                            </a>
                            <a
                                href="tel:+966500000000"
                                className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors p-3 rounded-lg hover:bg-white/5"
                            >
                                <Phone className="h-5 w-5 text-emerald-400" />
                                <span dir="ltr">+966 50 000 0000</span>
                            </a>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <div className="flex flex-col gap-3">
                        <a href="mailto:support@example.com?subject=طلب تجديد ترخيص نظام ITAM">
                            <Button size="lg" className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-lg shadow-blue-500/20">
                                <Mail className="h-5 w-5 ml-2" />
                                طلب تجديد الترخيص
                            </Button>
                        </a>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-slate-600 text-sm mt-8">
                    نظام إدارة تقنية المعلومات © {currentYear}
                </p>
            </div>
        </div>
    )
}
