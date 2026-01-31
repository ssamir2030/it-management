export const dynamic = 'force-dynamic';

import { getRequestDetails, getCurrentEmployee, submitFeedback } from '@/app/actions/employee-portal'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    ArrowRight,
    Calendar,
    Clock,
    FileText,
    CheckCircle2,
    XCircle,
    AlertCircle,
    User,
    History,
    Paperclip,
    Star,
    Package
} from 'lucide-react'
import Link from 'next/link'
import { CancelRequestButton } from '@/components/requests/cancel-request-button'
import { FeedbackForm } from '@/components/requests/feedback-form'
import { PremiumPageHeader } from '@/components/ui/premium-page-header'
import { Separator } from '@/components/ui/separator'

export default async function RequestDetailsPage({ params }: { params: { id: string } }) {
    const employee = await getCurrentEmployee()

    if (!employee) {
        redirect('/portal/login')
    }

    const result = await getRequestDetails(params.id)

    if (!result.success || !result.data) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 dark:bg-slate-900" dir="rtl">
                <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold text-foreground mb-2 dark:text-gray-100">الطلب غير موجود</h1>
                <p className="text-gray-600 mb-6 dark:text-muted-foreground">{result.error || 'لم نتمكن من العثور على تفاصيل الطلب'}</p>
                <Link href="/portal/dashboard">
                    <Button>العودة للرئيسية</Button>
                </Link>
            </div>
        )
    }

    const request = result.data

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'PENDING': return { label: 'قيد المراجعة', color: 'bg-amber-100 text-amber-700 border-amber-200' }
            case 'NEEDS_PURCHASE': return { label: 'بانتظار الشراء', color: 'bg-orange-100 text-orange-700 border-orange-200' }
            case 'IN_PROGRESS': return { label: 'جاري العمل', color: 'bg-blue-100 text-blue-700 border-blue-200' }
            case 'COMPLETED': return { label: 'مكتمل', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' }
            case 'REJECTED': return { label: 'مرفوض', color: 'bg-red-100 text-red-700 border-red-200' }
            case 'CANCELLED': return { label: 'ملغي', color: 'bg-slate-100 text-slate-700 border-slate-200' }
            default: return { label: status, color: 'bg-slate-100 text-slate-700 border-slate-200' }
        }
    }

    const statusInfo = getStatusLabel(request.status)

    return (
        <div className="flex flex-col gap-8 pb-12" dir="rtl">
            {/* Header */}
            <PremiumPageHeader
                title={`طلب رقم #${request.id.slice(-6).toUpperCase()}`}
                description={request.subject || "تفاصيل طلب الخدمة"}
                icon={FileText}
                rightContent={
                    <div className="flex items-center gap-3">
                        {request.status === 'PENDING' && (
                            <CancelRequestButton requestId={request.id} />
                        )}
                        <Link href="/portal/dashboard?tab=history">
                            <Button variant="ghost" className="gap-2 text-white hover:bg-white/20 px-6">
                                <ArrowRight className="h-4 w-4" />
                                العودة للقائمة
                            </Button>
                        </Link>
                    </div>
                }
            />

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Professional Info Card */}
                    <Card className="border-0 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
                        <div className={`h-2.5 w-full ${statusInfo.color.split(' ')[0]}`} />
                        <CardHeader className="p-8 pb-4">
                            <div className="flex justify-between items-center">
                                <div className="space-y-1">
                                    <Badge variant="outline" className="mb-2 bg-slate-50 dark:bg-slate-800 font-bold px-4">{request.type}</Badge>
                                    <CardTitle className="text-3xl font-black text-slate-900 dark:text-white leading-tight">
                                        {request.subject}
                                    </CardTitle>
                                </div>
                                <Badge className={`px-6 py-2.5 text-base font-black rounded-2xl shadow-lg border-2 ${statusInfo.color}`} variant="outline">
                                    {statusInfo.label}
                                </Badge>
                            </div>
                        </CardHeader>

                        <CardContent className="p-8 pt-6 space-y-10 font-arabic">
                            {/* Summary Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border-2 border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border shadow-sm">
                                    <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                        <Calendar className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase">تاريخ الطلب</p>
                                        <p className="font-bold text-slate-900 dark:text-slate-100">
                                            {request.createdAt ? new Date(request.createdAt).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }) : '---'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border shadow-sm">
                                    <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                                        <Clock className="h-5 w-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase">الاستحقاق المتوقع</p>
                                        <p className="font-bold text-slate-900 dark:text-slate-100">
                                            {request.expectedCompletionDate ? new Date(request.expectedCompletionDate).toLocaleDateString('ar-EG') : 'غير محدد'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Details with Professional Parsing */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 border-r-4 border-blue-600 pr-4">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                    <h3 className="text-xl font-black text-slate-800 dark:text-slate-200">وصف الطلب</h3>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-950/50 p-8 rounded-[2rem] border shadow-inner min-h-[150px]">
                                    <p className="text-lg text-slate-700 dark:text-slate-300 leading-[1.8] font-medium whitespace-pre-wrap">
                                        {(() => {
                                            if (!request.details) return "لا توجد تفاصيل إضافية";
                                            return request.details
                                                .replace(/:::DATA:::[\s\S]*?:::END_DATA:::/g, '')
                                                .replace(/<!-- DATA: .*? -->/g, '')
                                                .replace(/<!-- USER_NOTES_START -->/g, '')
                                                .replace(/\[\s*\{[\s\S]*?\}\s*\]/g, '')
                                                .replace(/:::DATA:::|:::END_DATA:::/g, '')
                                                .trim() || "لا توجد تفاصيل إضافية";
                                        })()}
                                    </p>
                                </div>
                            </div>

                            {/* Attachments Section */}
                            {request.attachments && request.attachments.length > 0 && (
                                <div className="space-y-4 pt-4">
                                    <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 flex items-center gap-3">
                                        <Paperclip className="h-5 w-5 text-blue-600" />
                                        المرفقات ({request.attachments.length})
                                    </h3>
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                        {request.attachments.map((file: any) => (
                                            <a
                                                key={file.id}
                                                href={file.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group relative border-2 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 hover:border-blue-500 hover:shadow-xl transition-all duration-300"
                                            >
                                                {file.fileType.startsWith('image/') ? (
                                                    <div className="aspect-video w-full relative">
                                                        <img src={file.fileUrl} alt={file.fileName} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" />
                                                    </div>
                                                ) : (
                                                    <div className="aspect-video w-full flex flex-col items-center justify-center p-4">
                                                        <FileText className="h-10 w-10 text-slate-300 mb-2" />
                                                        <span className="text-[10px] font-black text-slate-500 uppercase">{file.fileType.split('/')[1]}</span>
                                                    </div>
                                                )}
                                                <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <p className="text-white text-[10px] font-bold truncate text-center">عرض المرفق</p>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Rejection Notification */}
                            {request.rejectionReason && (
                                <div className="bg-red-50 p-6 rounded-3xl border border-red-100 flex items-start gap-4">
                                    <div className="h-12 w-12 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                                        <XCircle className="h-6 w-6 text-red-600" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-red-900 font-black text-lg">سبب رفض الطلب</h4>
                                        <p className="text-red-700 font-medium leading-relaxed">{request.rejectionReason}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Timeline Log */}
                    <Card className="border-0 shadow-lg rounded-3xl overflow-hidden">
                        <CardHeader className="bg-slate-50 dark:bg-slate-800 p-6 border-b">
                            <CardTitle className="flex items-center gap-3 text-lg font-black">
                                <History className="h-5 w-5 text-blue-600" />
                                سجل تقدم الطلب
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="relative border-r-2 border-slate-100 dark:border-slate-800 pr-8 space-y-10 py-2">
                                {request.timeline.map((event: any, index: number) => (
                                    <div key={event.id} className="relative">
                                        <div className={`absolute -right-[39px] top-1.5 h-5 w-5 rounded-full border-4 border-white dark:border-slate-950 shadow-sm ${index === 0 ? 'bg-blue-600' : 'bg-slate-300'}`} />
                                        <div className={`p-5 rounded-2xl border transition-all ${index === 0 ? 'bg-blue-50/30 border-blue-100 dark:bg-blue-900/10' : 'bg-slate-50/50 border-transparent dark:bg-slate-900/30 text-slate-500'}`}>
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                                                <h4 className="text-lg font-black leading-none">{event.title}</h4>
                                                <span className="text-xs font-bold text-slate-400 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border">
                                                    {new Date(event.createdAt).toLocaleString('ar-EG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-base font-medium leading-relaxed">{event.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    {/* SLA Progress */}
                    {request.status !== 'COMPLETED' && request.status !== 'CANCELLED' && request.status !== 'REJECTED' && (
                        <Card className="border-0 shadow-xl rounded-[2rem] overflow-hidden bg-gradient-to-br from-indigo-600 to-blue-700 text-white">
                            <CardContent className="p-8 text-center space-y-6">
                                <div className="mx-auto w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center p-3 border border-white/30">
                                    <Clock className="h-8 w-8 text-white" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-black uppercase tracking-widest text-white/60">الوقت المتوقع للإنجاز</p>
                                    <h3 className="text-2xl font-black">
                                        {request.expectedCompletionDate ? new Date(request.expectedCompletionDate).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' }) : 'غير محدد'}
                                    </h3>
                                </div>

                                {(() => {
                                    const now = new Date()
                                    const created = request.createdAt ? new Date(request.createdAt) : new Date()
                                    const expected = request.expectedCompletionDate ? new Date(request.expectedCompletionDate) : new Date()
                                    const totalTime = Math.max(1, expected.getTime() - created.getTime())
                                    const elapsed = now.getTime() - created.getTime()
                                    const progress = Math.min(100, Math.max(0, (elapsed / totalTime) * 100))
                                    const isOverdue = now > expected

                                    return (
                                        <div className="space-y-4">
                                            <div className="h-3 bg-black/20 rounded-full overflow-hidden p-0.5 border border-white/10">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-1000 ${isOverdue ? 'bg-red-400' : 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]'}`}
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                                                {isOverdue ? (
                                                    <p className="text-red-200 font-black text-sm">متأخر عن الموعد المحدد ⚠️</p>
                                                ) : (
                                                    <p className="text-emerald-100 font-black text-sm">الطلب ضمن المهلة المحددة ✅</p>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })()}
                            </CardContent>
                        </Card>
                    )}

                    {/* Completion Card */}
                    {request.status === 'COMPLETED' && (
                        <Card className="border-0 shadow-xl rounded-[2rem] overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
                            <CardContent className="p-8 text-center space-y-4">
                                <div className="mx-auto w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/30">
                                    <CheckCircle2 className="h-8 w-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-black">تم الإنجاز بنجاح!</h3>
                                <p className="text-emerald-100 font-bold text-sm">يسعدنا الانتهاء من طلبك ونتطلع لخدمتك دائماً.</p>
                                <div className="bg-black/10 py-2 px-4 rounded-xl inline-block mt-2">
                                    <p className="text-xs font-black">تاريخ الإنجاز: {request.completedAt ? new Date(request.completedAt).toLocaleDateString('ar-EG') : '---'}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Feedback Form Card */}
                    {request.status === 'COMPLETED' && (
                        <Card className="border-0 shadow-lg rounded-3xl overflow-hidden">
                            <CardHeader className="p-6 pb-2">
                                <CardTitle className="text-lg font-black flex items-center gap-2">
                                    <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                                    تقييمك يهمنا
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 pt-2">
                                {request.rating ? (
                                    <div className="space-y-4">
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star key={star} className={`h-6 w-6 ${star <= (request.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                                            ))}
                                        </div>
                                        {request.feedback && (
                                            <p className="text-sm p-4 bg-slate-50 rounded-xl italic border">"{request.feedback}"</p>
                                        )}
                                    </div>
                                ) : (
                                    <FeedbackForm
                                        requestId={request.id}
                                        onSubmit={async (rating, feedback) => {
                                            'use server'
                                            return await submitFeedback(request.id, rating, feedback)
                                        }}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Meta Cards */}
                    <div className="grid grid-cols-1 gap-4">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border shadow-sm space-y-4">
                            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest border-b pb-2">معلومات فنية</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm font-bold">
                                    <span className="text-slate-400">الأولوية:</span>
                                    <span className={request.priority === 'URGENT' ? 'text-red-500' : 'text-slate-600 dark:text-slate-300'}>
                                        {request.priority === 'URGENT' ? 'عاجل جداً' : 'عادي'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-bold">
                                    <span className="text-slate-400">حالة الربط:</span>
                                    <span className="text-slate-600 dark:text-slate-300">نظام تقنية المعلومات</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-[2rem] border border-blue-100 dark:border-blue-900/30">
                            <h4 className="font-black text-blue-900 dark:text-blue-300 mb-2 text-sm">تحتاج مساعدة؟</h4>
                            <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed mb-4">
                                إذا شعرت أن الطلب يحتاج لتوضيح أكثر، يمكنك التواصل مباشرة مع مكتب الدعم الفني.
                            </p>
                            <Link href={`/portal/support/new?requestId=${request.id}`} className="w-full">
                                <Button size="sm" variant="outline" className="w-full bg-white hover:bg-blue-50 text-blue-700 border-blue-200 rounded-xl font-black">
                                    تواصل مع الدعم
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
