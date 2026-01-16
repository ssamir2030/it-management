export const dynamic = 'force-dynamic';

import { getRequestById, updateRequestStatus, assignRequest } from '@/app/actions/requests'
import { notFound } from 'next/navigation'
import { EnhancedPageHeader } from "@/components/ui/enhanced-page-header"
import { FileText, User, Calendar, Clock, CheckCircle, XCircle, AlertCircle, ArrowRight, Send, Paperclip } from "lucide-react"
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

    return (
        <div className="w-full py-6 space-y-6">
            <div className="flex items-center gap-4 mb-4">
                <Link href="/requests">
                    <Button variant="outline" size="icon">
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="flex-1 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-foreground">تفاصيل الطلب #{request.id.slice(-6)}</h1>
                    {request.sla && (
                        <SLATimer
                            breachTime={request.sla.breachTime}
                            status={request.status}
                            completedAt={request.completedAt}
                        />
                    )}
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Request Info */}
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-xl">{request.subject || "بدون عنوان"}</CardTitle>
                                    <CardDescription className="mt-1">
                                        نوع الطلب: <Badge variant="outline">{request.type}</Badge>
                                    </CardDescription>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <Badge className={`
                                    ${request.status === 'PENDING' ? 'bg-amber-500' :
                                            request.status === 'IN_PROGRESS' ? 'bg-blue-600' :
                                                request.status === 'COMPLETED' ? 'bg-emerald-600' :
                                                    request.status === 'REJECTED' ? 'bg-red-600' : 'bg-slate-500'}
                                `}>
                                        {request.status}
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border">
                                <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                                    <FileText className="h-4 w-4" />
                                    التفاصيل
                                </h3>
                                <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                                    {request.details}
                                </p>
                            </div>

                            {request.attachments && request.attachments.length > 0 && (
                                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border">
                                    <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                                        <Paperclip className="h-4 w-4" />
                                        المرفقات ({request.attachments.length})
                                    </h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {request.attachments.map((file: any) => (
                                            <a
                                                key={file.id}
                                                href={file.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group relative border rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow"
                                            >
                                                {file.fileType.startsWith('image/') ? (
                                                    <div className="aspect-square w-full relative">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                            src={file.fileUrl}
                                                            alt={file.fileName}
                                                            className="object-cover w-full h-full"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="aspect-square w-full flex flex-col items-center justify-center p-4 bg-gray-100">
                                                        <FileText className="h-8 w-8 text-gray-400 mb-2" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <p className="text-white text-xs truncate text-center">
                                                        {file.fileName}
                                                    </p>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 p-3 border rounded-lg dark:bg-slate-900/50">
                                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                                        <User className="h-5 w-5 text-blue-700 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">مقدم الطلب</p>
                                        <p className="font-medium">{request.employee.name}</p>
                                        <p className="text-xs text-muted-foreground">{request.employee.department?.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 border rounded-lg dark:bg-slate-900/50">
                                    <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-full">
                                        <Calendar className="h-5 w-5 text-indigo-700 dark:text-indigo-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">تاريخ الإنشاء</p>
                                        <p className="font-medium">{new Date(request.createdAt).toLocaleDateString('ar-EG')}</p>
                                        <p className="text-xs text-muted-foreground">{new Date(request.createdAt).toLocaleTimeString('ar-EG')}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Timeline */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                سجل التتبع (Timeline)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative border-r border-gray-200 mr-3 space-y-8 py-2">
                                {request.timeline.map((event: any, index: number) => (
                                    <div key={event.id} className="relative pr-8">
                                        <span className={`absolute -right-[5px] top-1 h-2.5 w-2.5 rounded-full ring-4 ring-white ${index === 0 ? 'bg-blue-700' : 'bg-slate-300'
                                            }`} />

                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center justify-between">
                                                <h4 className={`font-semibold ${index === 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                    {event.title}
                                                </h4>
                                                <span className="text-xs text-muted-foreground bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                                                    {new Date(event.createdAt).toLocaleString('ar-EG')}
                                                </span>
                                            </div>
                                            <p className="text-sm text-foreground/80 leading-relaxed">
                                                {event.description}
                                            </p>
                                            {event.actorName && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    بواسطة: {event.actorName}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Actions */}
                <div className="space-y-6">
                    <RequestAdminActions
                        requestId={request.id}
                        currentStatus={request.status}
                        assignedTo={request.assignedTo}
                        requestType={request.type}
                    />
                </div>
            </div>
        </div>
    )
}
