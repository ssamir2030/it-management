export const dynamic = 'force-dynamic';

import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getTicketById, getTechnicians } from '@/app/actions/support'
import { TicketChat } from '@/components/support/ticket-chat'
import { AdminTicketControls } from '@/components/support/admin-ticket-controls'
import { ArrowRight, Clock, User, Mail, Phone, Tag, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'

export const metadata: Metadata = {
    title: 'إدارة التذكرة | لوحة التحكم',
}

export default async function AdminTicketPage({
    params,
}: {
    params: { id: string }
}) {
    const session = await auth()
    if (!session?.user) {
        redirect('/login')
    }

    const [ticketRes, techniciansRes] = await Promise.all([
        getTicketById(params.id),
        getTechnicians()
    ])

    if (!ticketRes.success || !ticketRes.data) {
        notFound()
    }

    const ticket: any = ticketRes.data
    const technicians = techniciansRes.success ? techniciansRes.data : []

    return (
        <div className="flex flex-col h-full bg-muted/30">
            {/* Header */}
            <div className="border-b bg-white px-6 py-4 sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <Link href="/support">
                        <Button variant="ghost" size="icon">
                            <ArrowRight className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-bold text-foreground">إدارة التذكرة</h1>
                            <Badge variant="outline" className="font-mono">#{ticket.id.slice(0, 8)}</Badge>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                <div className="h-full flex flex-col md:flex-row">
                    {/* Main Content (Chat & Details) */}
                    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Ticket Info Card */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <CardTitle className="text-xl">{ticket.title}</CardTitle>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Clock className="h-4 w-4" />
                                                <span>تم الإنشاء {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true, locale: ar })}</span>
                                            </div>
                                        </div>
                                        <Badge className={
                                            ticket.priority === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                                                ticket.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                                                    ticket.priority === 'MEDIUM' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-gray-100 text-gray-800'
                                        }>
                                            {ticket.priority}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="bg-muted/50 p-4 rounded-lg text-sm">
                                        {ticket.description}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-semibold">مقدم الطلب:</span>
                                            <span>{ticket.createdBy?.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-semibold">البريد:</span>
                                            <span>{ticket.createdBy?.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Tag className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-semibold">الفئة:</span>
                                            <span>{ticket.category}</span>
                                        </div>
                                        {ticket.contactPhone && (
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-semibold">الجوال:</span>
                                                <span>{ticket.contactPhone}</span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Chat Section */}
                            <div className="h-[600px] border rounded-xl overflow-hidden bg-white shadow-sm">
                                <TicketChat
                                    ticket={ticket}
                                    currentUserId={session.user.id || ''}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar (Admin Controls) */}
                    <div className="w-full md:w-80 border-r bg-white overflow-y-auto p-6 space-y-6">
                        <AdminTicketControls
                            ticketId={ticket.id}
                            currentStatus={ticket.status}
                            currentPriority={ticket.priority}
                            currentAssignedTo={ticket.assignedToId}
                            technicians={technicians || []}
                        />

                        {/* Additional Info / SLA (Placeholder) */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">معلومات إضافية</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">آخر تحديث:</span>
                                    <span>{new Date(ticket.updatedAt).toLocaleDateString('ar-EG')}</span>
                                </div>
                                <Separator />
                                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-2 rounded">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>تجاوز SLA: لا</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
