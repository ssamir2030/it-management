export const dynamic = 'force-dynamic';

import { getRequestById } from '@/app/actions/requests'
import { notFound } from 'next/navigation'
import { FileText, User, Calendar, Clock, ArrowRight, Paperclip, Package, Hash, Tag, Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { RequestAdminActions } from '@/components/requests/request-admin-actions'
import { SLATimer } from "@/components/sla/sla-timer"

export default async function RequestDetailsPage({ params }: { params: { id: string } }) {
    const result = await getRequestById(params.id)

    if (!result.success || !result.data) {
        notFound()
    }

    const request = result.data

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'PENDING': return { label: 'قيد المراجعة', color: 'bg-amber-100 text-amber-700 border-amber-200' }
            case 'NEEDS_PURCHASE': return { label: 'بانتظار الشراء', color: 'bg-orange-100 text-orange-700 border-orange-200' }
            case 'IN_PROGRESS': return { label: 'جاري العمل', color: 'bg-blue-100 text-blue-700 border-blue-200' }
            case 'COMPLETED': return { label: 'مكتمل', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' }
            case 'REJECTED': return { label: 'مرفوض', color: 'bg-red-100 text-red-700 border-red-200' }
            default: return { label: status, color: 'bg-slate-100 text-slate-700 border-slate-200' }
        }
    }

    const statusInfo = getStatusInfo(request.status)

    return (
        <div className="w-full py-8 space-y-8" dir="rtl">
            {/* Header Navigation */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border shadow-sm">
                <div className="flex items-center gap-5">
                    <Link href="/requests">
                        <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl hover:bg-slate-50 transition-colors">
                            <ArrowRight className="h-5 w-5 rotate-180" />
                        </Button>
                    </Link>
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <Hash className="h-5 w-5 text-blue-600" />
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">طلب رقم {request.id.slice(-6).toUpperCase()}</h1>
                        </div>
                        <p className="text-slate-500 font-medium text-sm flex items-center gap-2">
                            <Tag className="h-4 w-4" />
                            {request.type} | تاريخ التقديم: {new Date(request.createdAt).toLocaleDateString('ar-EG')}
                        </p>
                    </div>
                </div>

                {request.sla && (
                    <div className="bg-slate-50 dark:bg-slate-800 p-3 px-6 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                        <SLATimer
                            breachTime={request.sla.breachTime}
                            status={request.status}
                            completedAt={request.completedAt}
                        />
                    </div>
                )}
            </div>

            <div className="grid lg:grid-cols-4 gap-8">
                {/* Information Column (Left) */}
                <div className="lg:col-span-3 space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
                    {/* Main Request Content */}
                    <Card className="border-0 shadow-2xl overflow-hidden rounded-[2.5rem] group bg-white dark:bg-slate-950/40 backdrop-blur-sm border dark:border-slate-800/50">
                        <div className={`h-2 w-full ${statusInfo.color.split(' ')[0]}`} />
                        <CardHeader className="p-8 pb-4">
                            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                                <div className="space-y-4 max-w-2xl">
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-black uppercase tracking-widest border border-blue-100 dark:border-blue-900/30">
                                        <Info className="h-3.5 w-3.5" />
                                        موضوع الطلب الرسمي
                                    </div>
                                    <CardTitle className="text-4xl font-black text-slate-900 dark:text-white leading-tight">
                                        {request.subject}
                                    </CardTitle>
                                </div>
                                <Badge className={`px-8 py-3 text-lg font-black rounded-2xl shadow-xl transition-all duration-300 group-hover:scale-105 ${statusInfo.color}`} variant="outline">
                                    {statusInfo.label}
                                </Badge>
                            </div>
                        </CardHeader>

                        <CardContent className="p-8 pt-6 space-y-10">
                            {/* Technical Grid (The "Pro" Touch) */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 dark:bg-slate-900/50 p-8 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">حالة الصنف</p>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm border">
                                            <Package className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <span className="text-lg font-black text-slate-800 dark:text-slate-100">{request.type === 'CONSUMABLE' ? 'أحبار / مستهلكات' : 'خدمات تقنية'}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">الأولوية المسجلة</p>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm border">
                                            <div className={`h-3 w-3 rounded-full ${request.priority === 'URGENT' ? 'bg-red-500' : 'bg-blue-500'}`} />
                                        </div>
                                        <span className="text-lg font-black text-slate-800 dark:text-slate-100">{request.priority === 'URGENT' ? 'عاجل جداً' : 'عادي'}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">المهلة الزمنية (SLA)</p>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm border">
                                            <Clock className="h-5 w-5 text-indigo-600" />
                                        </div>
                                        <span className="text-lg font-black text-slate-800 dark:text-slate-100">
                                            {request.expectedCompletionDate ? new Date(request.expectedCompletionDate).toLocaleDateString('ar-EG') : 'غير محدد'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Description */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 border-b-2 border-slate-100 dark:border-slate-800 pb-4">
                                    <div className="h-10 w-10 bg-blue-600 dark:bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-blue-900/40">
                                        <FileText className="h-5 w-5 text-white" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">تفاصيل ومبررات الطلب</h3>
                                </div>
                                <div className="bg-white dark:bg-slate-900/30 p-8 rounded-3xl border-2 border-slate-100 dark:border-slate-800/50 shadow-inner">
                                    <p className="text-lg text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-[1.8] font-medium">
                                        {(() => {
                                            if (!request.details) return "لا توجد تفاصيل إضافية مسجلة";
                                            // تنظيف شامل لكافة أنواع البيانات التقنية والتاجات البرمجية
                                            return request.details
                                                .replace(/:::DATA:::[\s\S]*?:::END_DATA:::/g, '')
                                                .replace(/<!-- DATA: .*? -->/g, '')
                                                .replace(/<!-- USER_NOTES_START -->/g, '')
                                                .replace(/\[\s*\{[\s\S]*?\}\s*\]/g, '') // إزالة أي مصفوفات JSON متبقية
                                                .replace(/:::DATA:::|:::END_DATA:::/g, '') // إزالة التاجات المنفردة في حال وجود خلل
                                                .trim() || "لا توجد تفاصيل إضافية مسجلة";
                                        })()}
                                    </p>
                                </div>
                            </div>

                            {/* Attachments */}
                            {request.attachments && request.attachments.length > 0 && (
                                <div className="space-y-4 pt-4">
                                    <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 flex items-center gap-3">
                                        <Paperclip className="h-5 w-5 text-blue-600" />
                                        المرفقات الرسمية ({request.attachments.length})
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        {request.attachments.map((file: any) => (
                                            <a
                                                key={file.id}
                                                href={file.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group relative border-2 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 hover:border-blue-500 hover:shadow-2xl transition-all duration-500"
                                            >
                                                {file.fileType.startsWith('image/') ? (
                                                    <div className="aspect-[4/3] w-full relative">
                                                        <img src={file.fileUrl} alt={file.fileName} className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-500" />
                                                    </div>
                                                ) : (
                                                    <div className="aspect-[4/3] w-full flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800">
                                                        <FileText className="h-10 w-10 text-slate-400 mb-3" />
                                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{file.fileType.split('/')[1]}</span>
                                                    </div>
                                                )}
                                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/90 to-transparent p-4 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                                    <p className="text-white text-xs font-black truncate text-center">عرض المرفق</p>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Unified Timeline & Log */}
                    <Card className="border-0 shadow-xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-950/40 backdrop-blur-sm border dark:border-slate-800/50">
                        <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b p-8">
                            <CardTitle className="text-2xl font-black flex items-center gap-4">
                                <Clock className="h-6 w-6 text-blue-600" />
                                سجل دورة حياة الطلب (Timeline)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="relative border-r-4 border-slate-100 dark:border-slate-800 pr-10 space-y-12 py-4">
                                {request.timeline.map((event: any, index: number) => (
                                    <div key={event.id} className="relative">
                                        <div className={`absolute -right-[49px] top-1.5 h-6 w-6 rounded-full border-4 border-white dark:border-slate-900 shadow-lg ${index === 0 ? 'bg-blue-600 ring-4 ring-blue-100 dark:ring-blue-900/20 animate-pulse' : 'bg-slate-300'}`} />
                                        <div className={`p-6 rounded-[1.5rem] border-2 transition-all duration-300 ${index === 0 ? 'bg-blue-50/50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/50 shadow-md' : 'bg-slate-50/50 border-slate-50 dark:bg-slate-900/30'}`}>
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                                                <h4 className={`text-xl font-black ${index === 0 ? 'text-blue-800 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}>
                                                    {event.title}
                                                </h4>
                                                <span className="text-xs font-black text-slate-400 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border-2">
                                                    {event.createdAt ? new Date(event.createdAt).toLocaleString('ar-EG', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) : '---'}
                                                </span>
                                            </div>
                                            <p className="text-lg text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                                                {event.description}
                                            </p>
                                            {event.actorName && (
                                                <div className="mt-4 pt-4 border-t-2 border-dashed border-slate-100 dark:border-slate-800 flex items-center gap-3 text-blue-600 dark:text-blue-400 text-sm font-black">
                                                    <div className="h-2 w-2 rounded-full bg-blue-600" />
                                                    المنفذ: {event.actorName}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Column (Right) */}
                <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
                    {/* Requester Profile */}
                    <Card className="border-0 shadow-2xl rounded-[3rem] overflow-hidden bg-gradient-to-b from-blue-700 to-indigo-800 dark:from-blue-600/90 dark:to-indigo-900/90 text-white border dark:border-white/10 ring-1 ring-white/10 backdrop-blur-xl">
                        <CardContent className="p-8 text-center space-y-6">
                            <div className="mx-auto w-24 h-24 bg-white/20 backdrop-blur-xl rounded-[2rem] flex items-center justify-center p-1 border-2 border-white/20 shadow-2xl ring-8 ring-white/10">
                                <User className="h-12 w-12 text-white" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">مقدم الطلب</p>
                                <h3 className="text-2xl font-black leading-tight">{request.employee.name}</h3>
                                <p className="text-sm font-bold text-white/80 bg-white/10 py-1.5 px-4 rounded-full inline-block backdrop-blur-md">
                                    {request.employee.department?.name || 'بدون قسم'}
                                </p>
                            </div>
                            <Separator className="bg-white/10" />
                            <div className="grid grid-cols-1 gap-4 text-right">
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                    <p className="text-[10px] font-black text-white/40 uppercase mb-1">الرقم الوظيفي</p>
                                    <p className="font-black text-lg">ID-{request.employee.identityNumber || '0000'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Admin Actions Panel */}
                    <Card className="border-0 shadow-2xl rounded-[2.5rem] sticky top-8 bg-white dark:bg-slate-900/60 backdrop-blur-md border dark:border-slate-800/50">
                        <CardHeader className="p-6 pb-2 border-b dark:border-slate-800/50">
                            <CardTitle className="text-xl font-black flex items-center gap-3">
                                <Info className="h-5 w-5 text-blue-600" />
                                إجراءات التحكم
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <RequestAdminActions
                                requestId={request.id}
                                currentStatus={request.status}
                                assignedTo={request.assignedTo}
                                requestType={request.type}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
