'use client'

export const dynamic = 'force-dynamic';

import { WifiOff, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function OfflinePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-6" dir="rtl">
            <div className="text-center text-white max-w-md">
                {/* أيقونة */}
                <div className="mb-8">
                    <div className="mx-auto w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-4 animate-pulse">
                        <WifiOff className="h-12 w-12" />
                    </div>
                    <div className="h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full" />
                </div>

                {/* النص */}
                <h1 className="text-3xl font-black mb-4">
                    لا يوجد اتصال بالإنترنت
                </h1>
                <p className="text-blue-200 text-lg mb-8 leading-relaxed">
                    يبدو أنك غير متصل بالإنترنت. تحقق من اتصالك وحاول مرة أخرى.
                </p>

                {/* الأزرار */}
                <div className="flex flex-col gap-3">
                    <Button
                        onClick={() => window.location.reload()}
                        className="w-full bg-white text-blue-900 hover:bg-blue-50 font-bold py-6 text-lg"
                    >
                        <RefreshCw className="h-5 w-5 ml-2" />
                        إعادة المحاولة
                    </Button>
                    <Link href="/portal" className="w-full">
                        <Button
                            variant="outline"
                            className="w-full border-white/30 text-white hover:bg-white/10 py-6 text-lg"
                        >
                            <Home className="h-5 w-5 ml-2" />
                            الصفحة الرئيسية
                        </Button>
                    </Link>
                </div>

                {/* رسالة مساعدة */}
                <p className="text-sm text-blue-300/60 mt-8">
                    بعض الصفحات المحملة مسبقاً قد تكون متاحة
                </p>
            </div>
        </div>
    )
}
