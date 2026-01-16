import { Badge } from '@/components/ui/badge'
import { Clock, Zap, Database, Sparkles } from 'lucide-react'

export function DashboardHeader() {
    return (
        <div className="relative overflow-hidden rounded-[2rem] shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800" />
            {/* Removed animate-pulse for stability */}
            <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-white/10 blur-3xl delay-75" />

            <div className="relative px-10 py-12">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="p-6 bg-white/20 backdrop-blur-xl rounded-3xl shadow-2xl">
                            <Sparkles className="h-14 w-14 text-white" />
                        </div>
                        <div>
                            <h1 className="text-6xl font-black text-white mb-2 tracking-tight">
                                لوحة التحكم الشاملة
                            </h1>
                            <p className="text-xl text-blue-100 font-semibold">
                                رؤية 360° • تحليلات متقدمة • مراقبة فورية
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 mt-8">
                    <Badge variant="secondary" className="bg-white/20 backdrop-blur-xl text-white border-0 px-6 py-3 text-sm font-bold shadow-lg">
                        <Clock className="h-5 w-5 ml-2" />
                        {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 backdrop-blur-xl text-white border-0 px-6 py-3 text-sm font-bold shadow-lg">
                        <Zap className="h-5 w-5 ml-2 text-yellow-300" />
                        النظام نشط ومتصل
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 backdrop-blur-xl text-white border-0 px-6 py-3 text-sm font-bold shadow-lg">
                        <Database className="h-5 w-5 ml-2 text-green-300" />
                        قاعدة البيانات متزامنة
                    </Badge>
                </div>
            </div>
        </div>
    )
}
