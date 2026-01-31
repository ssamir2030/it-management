export const dynamic = 'force-dynamic';

import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentEmployee, getMySupportTickets } from '@/app/actions/employee-portal'
import { Button } from '@/components/ui/button'
import { Plus, Headset, Clock, CheckCircle2, XCircle, AlertCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PremiumPageHeader } from "@/components/ui/premium-page-header"

export const metadata: Metadata = {
    title: 'تذاكر الدعم الفني | إدارة أصول تقنية المعلومات',
    description: 'تذاكر الدعم الفني الخاصة بك',
}

export default async function PortalSupportPage() {
    const employee = await getCurrentEmployee()
    if (!employee) {
        redirect('/portal/login')
    }

    const result = await getMySupportTickets()
    const tickets = result.success && result.data ? result.data : []

    function getStatusBadge(status: string) {
        const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
            PENDING: { label: 'قيد المراجعة', className: 'bg-yellow-600', icon: Clock },
            IN_PROGRESS: { label: 'قيد التنفيذ', className: 'bg-blue-600', icon: Clock },
            COMPLETED: { label: 'مكتمل', className: 'bg-green-600', icon: CheckCircle2 },
            REJECTED: { label: 'مرفوض', className: 'bg-red-600', icon: XCircle },
            CANCELLED: { label: 'ملغي', className: 'bg-gray-600', icon: XCircle },
        }
        const config = statusConfig[status] || statusConfig.PENDING
        const Icon = config.icon
        return (
            <Badge className={`${config.className} gap-1 text-xs px-2 py-0.5`}>
                <Icon className="h-3 w-3" />
                {config.label}
            </Badge>
        )
    }

    return (
        <div className="space-y-8 px-4 py-8">
            <PremiumPageHeader
                title="تذاكر الدعم الفني"
                description="تواصل مع فريق الدعم الفني ومتابعة حالة التذاكر"
                icon={Headset}
                rightContent={
                    <div className="flex items-center gap-3">
                        <Link href="/portal/dashboard">
                            <Button variant="ghost" className="gap-2 text-white hover:bg-white/20">
                                <ArrowRight className="h-4 w-4" />
                                العودة للرئيسية
                            </Button>
                        </Link>
                        <Link href="/portal/support/new">
                            <Button>
                                <Plus className="h-4 w-4 ml-2" />
                                طلب دعم جديد
                            </Button>
                        </Link>
                    </div>
                }
                stats={[
                    { label: "إجمالي التذاكر", value: tickets.length, icon: Headset },
                    { label: "قيد المراجعة", value: tickets.filter((t: any) => t.status === 'PENDING').length, icon: Clock },
                ]}
            />

            {/* Tickets List */}
            <div className="flex-1 overflow-auto">
                {tickets.length === 0 ? (
                    <div className="text-center py-12">
                        <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">لا توجد تذاكر بعد</h3>
                        <p className="text-muted-foreground mb-4">ابدأ بإنشاء أول تذكرة دعم فني من خلال الضغط على الزر أعلاه</p>
                    </div>
                ) : (
                    <div className="grid gap-4 max-w-7xl mx-auto">
                        {tickets.map((ticket: any) => (
                            <Link key={ticket.id} href={`/portal/requests/${ticket.id}`}>
                                <Card className="hover:shadow-md transition-shadow cursor-pointer dark:bg-slate-900 dark:border-slate-800">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-foreground dark:text-gray-100 mb-1">
                                                    {ticket.subject}
                                                </h3>
                                                <p className="text-sm text-muted-foreground dark:text-muted-foreground line-clamp-2">
                                                    {ticket.details}
                                                </p>
                                            </div>
                                            {getStatusBadge(ticket.status)}
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground dark:text-muted-foreground">
                                            <span>#{ticket.id.slice(-6)}</span>
                                            <span>•</span>
                                            <span>{new Date(ticket.createdAt).toLocaleDateString('ar-EG')}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
