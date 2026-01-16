export const dynamic = 'force-dynamic';

import { getRequestDetails } from '@/app/actions/employee-portal'
import { getCurrentEmployee } from '@/app/actions/employee-portal'
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
    Paperclip
} from 'lucide-react'
import Link from 'next/link'
import { CancelRequestButton } from '@/components/requests/cancel-request-button'
import { FeedbackForm } from '@/components/requests/feedback-form'
import { submitFeedback } from '@/app/actions/employee-portal'
import { Star } from 'lucide-react'
import { PremiumPageHeader } from '@/components/ui/premium-page-header'

const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
        PENDING: {
            label: 'قيد المراجعة',
            className: 'bg-yellow-600',
            icon: Clock
        },
        IN_PROGRESS: {
            label: 'قيد التنفيذ',
            className: 'bg-blue-600',
            icon: User
        },
        COMPLETED: {
            label: 'مكتمل',
            className: 'bg-green-600',
            icon: CheckCircle2
        },
        REJECTED: {
            label: 'مرفوض',
            className: 'bg-red-600',
            icon: XCircle
        },
        CANCELLED: {
            label: 'ملغي',
            className: 'bg-gray-600',
            icon: XCircle
        }
    }

    const config = statusConfig[status] || statusConfig.PENDING
    const Icon = config.icon

    return (
        <Badge className={`${config.className} gap-1 text-base px-3 py-1`}>
            <Icon className="h-4 w-4" />
            {config.label}
        </Badge>
    )
}

const getRequestTypeLabel = (type: string) => {
    const types: Record<string, string> = {
        'HARDWARE': 'طلب أجهزة',
        'SOFTWARE': 'طلب برمجيات',
        'ACCESS': 'طلب صلاحيات',
        'MAINTENANCE': 'صيانة',
        'INK': 'أحبار',
        'PAPER': 'أوراق',
        'SUPPORT': 'دعم فني',
        'OTHER': 'أخرى'
    }
    return types[type] || type
}

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



    return (
        <>
            <div className="flex flex-col gap-6">
                {/* Header */}
                <PremiumPageHeader
                    title="تفاصيل الطلب"
                    description={`#${request.id.slice(-6)} | تم الإنشاء في ${new Date(request.createdAt).toLocaleDateString('ar-EG')}`}
                    icon={FileText}
                    rightContent={
                        <div className="flex items-center gap-3">
                            {request.status === 'PENDING' && (
                                <CancelRequestButton requestId={request.id} />
                            )}
                            <Link href="/portal/dashboard?tab=history">
                                <Button variant="ghost" className="gap-2 text-white hover:bg-white/20">
                                    <ArrowRight className="h-4 w-4" />
                                    العودة للرئيسية
                                </Button>
                            </Link>
                        </div>
                    }
                />

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Request Info Card */}
                        <Card className="border-t-4 border-t-blue-600 shadow-md dark:bg-slate-800 dark:border-slate-700">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-xl mb-2 dark:text-gray-100">{request.subject || getRequestTypeLabel(request.type)}</CardTitle>
                                        <CardDescription className="dark:text-muted-foreground">
                                            نوع الطلب: <Badge variant="outline" className="dark:text-gray-300 dark:border-gray-600">{getRequestTypeLabel(request.type)}</Badge>
                                        </CardDescription>
                                    </div>
                                    {getStatusBadge(request.status)}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="bg-gray-50 p-4 rounded-lg border dark:bg-slate-900 dark:border-slate-700">
                                    <h3 className="font-semibold mb-2 flex items-center gap-2 dark:text-gray-200">
                                        <FileText className="h-4 w-4 text-muted-foreground dark:text-muted-foreground" />
                                        تفاصيل الطلب
                                    </h3>
                                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed dark:text-gray-300">
                                        {request.details}
                                    </p>
                                </div>

                                {request.attachments && request.attachments.length > 0 && (
                                    <div className="bg-gray-50 p-4 rounded-lg border dark:bg-slate-900 dark:border-slate-700">
                                        <h3 className="font-semibold mb-2 flex items-center gap-2 dark:text-gray-200">
                                            <Paperclip className="h-4 w-4 text-muted-foreground dark:text-muted-foreground" />
                                            المرفقات
                                        </h3>
                                        <div className="mt-2">
                                            <a
                                                href={request.attachments[0].fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-block"
                                            >
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={request.attachments[0].fileUrl}
                                                    alt="Attachment"
                                                    className="max-w-full h-auto max-h-[400px] rounded-lg border hover:opacity-95 transition-opacity"
                                                />
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {request.rejectionReason && (
                                    <div className="bg-red-50 p-4 rounded-lg border border-red-200 dark:bg-red-900/10 dark:border-red-900/30">
                                        <h3 className="font-semibold text-red-800 mb-2 flex items-center gap-2 dark:text-red-400">
                                            <AlertCircle className="h-4 w-4" />
                                            سبب الرفض
                                        </h3>
                                        <p className="text-red-700 dark:text-red-300">
                                            {request.rejectionReason}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Timeline */}
                        <Card className="shadow-md dark:bg-slate-800 dark:border-slate-700">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                                    <History className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    سجل تتبع الطلب
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="relative border-r border-gray-200 mr-3 space-y-8 py-2 dark:border-slate-700">
                                    {request.timeline.map((event: any, index: number) => (
                                        <div key={event.id} className="relative pr-8">
                                            {/* Timeline Dot */}
                                            <span className={`absolute -right-[5px] top-1 h-2.5 w-2.5 rounded-full ring-4 ring-white dark:ring-slate-800 ${index === 0 ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-300 dark:bg-slate-600'
                                                }`} />

                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center justify-between">
                                                    <h4 className={`font-semibold ${index === 0 ? 'text-foreground dark:text-gray-100' : 'text-muted-foreground dark:text-muted-foreground'}`}>
                                                        {event.title}
                                                    </h4>
                                                    <span className="text-xs text-muted-foreground bg-gray-50 px-2 py-1 rounded-full dark:bg-slate-700 dark:text-muted-foreground">
                                                        {new Date(event.createdAt).toLocaleString('ar-EG')}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-muted-foreground">
                                                    {event.description}
                                                </p>
                                                {event.actorName && (
                                                    <p className="text-xs text-muted-foreground mt-1 dark:text-muted-foreground">
                                                        بواسطة: {event.actorName}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Feedback Section - Only for Completed Requests */}
                        {request.status === 'COMPLETED' && (
                            request.rating ? (
                                <Card className="border-amber-200 bg-amber-50/30">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-amber-900">
                                            <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                                            تقييم الخدمة
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={`h-6 w-6 ${star <= (request.rating || 0)
                                                        ? 'fill-amber-400 text-amber-400'
                                                        : 'text-gray-300'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        {request.feedback && (
                                            <div className="bg-white p-4 rounded-lg border">
                                                <p className="text-sm text-gray-700">{request.feedback}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ) : (
                                <FeedbackForm
                                    requestId={request.id}
                                    onSubmit={async (rating, feedback) => {
                                        'use server'
                                        return await submitFeedback(request.id, rating, feedback)
                                    }}
                                />
                            )
                        )}
                    </div>

                    {/* Sidebar Info */}

                    <div className="space-y-6">
                        {/* SLA Tracker */}
                        {request.expectedCompletionDate && request.status !== 'COMPLETED' && request.status !== 'CANCELLED' && request.status !== 'REJECTED' && (
                            <Card className={`shadow-sm ${new Date(request.expectedCompletionDate) < new Date()
                                ? 'border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/30'
                                : 'border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-900/30'
                                }`}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Clock className={`h-5 w-5 ${new Date(request.expectedCompletionDate) < new Date()
                                            ? 'text-red-600 dark:text-red-400'
                                            : 'text-green-600 dark:text-green-400'
                                            }`} />
                                        متتبع SLA
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">الموعد المتوقع</span>
                                        <span className="font-medium text-sm">
                                            {new Date(request.expectedCompletionDate).toLocaleDateString('ar-EG', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>

                                    {(() => {
                                        const now = new Date()
                                        const created = new Date(request.createdAt)
                                        const expected = new Date(request.expectedCompletionDate)
                                        const totalTime = expected.getTime() - created.getTime()
                                        const elapsed = now.getTime() - created.getTime()
                                        const progress = Math.min(100, Math.max(0, (elapsed / totalTime) * 100))
                                        const isOverdue = now > expected
                                        const remainingMs = expected.getTime() - now.getTime()
                                        const remainingHours = Math.abs(Math.floor(remainingMs / (1000 * 60 * 60)))
                                        const remainingDays = Math.floor(remainingHours / 24)
                                        const hours = remainingHours % 24

                                        return (
                                            <>
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-xs">
                                                        <span>التقدم</span>
                                                        <span>{Math.round(progress)}%</span>
                                                    </div>
                                                    <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full transition-all ${isOverdue ? 'bg-red-500' : progress > 75 ? 'bg-yellow-500' : 'bg-green-500'
                                                                }`}
                                                            style={{ width: `${Math.min(progress, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className={`text-center py-2 rounded-lg ${isOverdue
                                                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                                    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                                    }`}>
                                                    {isOverdue ? (
                                                        <span className="font-bold">
                                                            ⚠️ متأخر بـ {remainingDays > 0 ? `${remainingDays} يوم و ` : ''}{hours} ساعة
                                                        </span>
                                                    ) : (
                                                        <span className="font-medium">
                                                            ⏳ متبقي: {remainingDays > 0 ? `${remainingDays} يوم و ` : ''}{hours} ساعة
                                                        </span>
                                                    )}
                                                </div>
                                            </>
                                        )
                                    })()}
                                </CardContent>
                            </Card>
                        )}

                        {/* Completed SLA */}
                        {request.completedAt && request.expectedCompletionDate && (
                            <Card className={`shadow-sm ${new Date(request.completedAt) <= new Date(request.expectedCompletionDate)
                                ? 'border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-900/30'
                                : 'border-orange-200 bg-orange-50 dark:bg-orange-900/10 dark:border-orange-900/30'
                                }`}>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        {new Date(request.completedAt) <= new Date(request.expectedCompletionDate) ? (
                                            <>
                                                <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                                <p className="font-bold text-green-700 dark:text-green-400">✅ تم الإنجاز في الوقت المحدد</p>
                                            </>
                                        ) : (
                                            <>
                                                <AlertCircle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                                                <p className="font-bold text-orange-700 dark:text-orange-400">تم الإنجاز (متأخر)</p>
                                            </>
                                        )}
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {new Date(request.completedAt).toLocaleDateString('ar-EG')}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <Card className="shadow-sm dark:bg-slate-800 dark:border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-lg dark:text-gray-100">معلومات إضافية</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b dark:border-slate-700">
                                    <span className="text-muted-foreground text-sm dark:text-muted-foreground">تاريخ الإنشاء</span>
                                    <span className="font-medium text-sm dark:text-gray-200">
                                        {new Date(request.createdAt).toLocaleDateString('ar-EG')}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b dark:border-slate-700">
                                    <span className="text-muted-foreground text-sm dark:text-muted-foreground">آخر تحديث</span>
                                    <span className="font-medium text-sm dark:text-gray-200">
                                        {new Date(request.updatedAt).toLocaleDateString('ar-EG')}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b dark:border-slate-700">
                                    <span className="text-muted-foreground text-sm dark:text-muted-foreground">الأولوية</span>
                                    <Badge variant="outline" className={
                                        request.priority === 'URGENT' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/50' :
                                            request.priority === 'HIGH' ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-900/50' :
                                                'bg-gray-50 text-gray-700 dark:bg-slate-700 dark:text-gray-300 dark:border-slate-600'
                                    }>
                                        {request.priority === 'URGENT' ? 'عاجل' :
                                            request.priority === 'HIGH' ? 'مهم' : 'عادي'}
                                    </Badge>
                                </div>
                                {request.assignedTo && (
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-muted-foreground text-sm dark:text-muted-foreground">المسؤول</span>
                                        <span className="font-medium text-sm flex items-center gap-1 dark:text-gray-200">
                                            <User className="h-3 w-3" />
                                            {request.assignedTo}
                                        </span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="bg-blue-50 border-blue-100 shadow-sm dark:bg-blue-900/10 dark:border-blue-900/30">
                            <CardContent className="p-4">
                                <h4 className="font-semibold text-blue-900 mb-2 text-sm dark:text-blue-300">تحتاج مساعدة؟</h4>
                                <p className="text-xs text-blue-700 mb-3 dark:text-blue-400">
                                    إذا تأخر طلبك أو واجهت مشكلة، يمكنك فتح تذكرة دعم فني مرتبطة بهذا الطلب.
                                </p>
                                <Link href={`/portal/support/new?requestId=${request.id}`}>
                                    <Button size="sm" variant="outline" className="w-full bg-white hover:bg-blue-50 text-blue-700 border-blue-200 dark:bg-slate-900 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/20">
                                        فتح تذكرة دعم
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    )
}
