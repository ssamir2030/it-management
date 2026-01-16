'use client'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import Link from 'next/link'
import { Clock, MessageSquare, User } from 'lucide-react'

interface Ticket {
    id: string
    title: string
    description: string
    category: string
    status: string
    priority: string
    createdAt: Date
    assignedTo: {
        id: string
        name: string | null
        email: string | null
        image: string | null
    } | null
    messages: {
        content: string
        createdAt: Date
    }[]
    _count: {
        messages: number
    }
}

interface TicketsListProps {
    tickets: Ticket[]
}

export function TicketsList({ tickets }: TicketsListProps) {
    if (tickets.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="p-4 bg-gray-100 rounded-full inline-block mb-4">
                    <MessageSquare className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                    لا توجد تذاكر بعد
                </h3>
                <p className="text-sm text-muted-foreground">
                    ابدأ بإنشاء تذكرة دعم جديدة للتواصل مع فريق الدعم الفني
                </p>
            </div>
        )
    }

    return (
        <div className="grid gap-4">
            {tickets.map((ticket) => (
                <Link key={ticket.id} href={`/portal/support/${ticket.id}`}>
                    <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="text-lg font-semibold text-foreground">
                                        {ticket.title}
                                    </h3>
                                    <StatusBadge status={ticket.status} />
                                    <PriorityBadge priority={ticket.priority} />
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                                    {ticket.description}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {formatDistanceToNow(new Date(ticket.createdAt), {
                                            addSuffix: true,
                                            locale: ar
                                        })}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <MessageSquare className="h-3 w-3" />
                                        {ticket._count.messages} رسالة
                                    </div>
                                    <CategoryBadge category={ticket.category} />
                                </div>
                            </div>
                            {ticket.assignedTo && (
                                <div className="flex items-center gap-2 mr-4">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={ticket.assignedTo.image || undefined} />
                                        <AvatarFallback>
                                            {ticket.assignedTo.name?.charAt(0) || 'F'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="text-xs">
                                        <p className="font-medium text-gray-700">
                                            {ticket.assignedTo.name || 'فني'}
                                        </p>
                                        <p className="text-muted-foreground">مسؤول</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        {ticket.messages.length > 0 && (
                            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                                <p className="line-clamp-1">
                                    آخر رسالة: {ticket.messages[0].content}
                                </p>
                            </div>
                        )}
                    </Card>
                </Link>
            ))}
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const variants: Record<string, { label: string; className: string }> = {
        OPEN: { label: 'مفتوحة', className: 'bg-blue-100 text-blue-800' },
        IN_PROGRESS: { label: 'قيد المعالجة', className: 'bg-yellow-100 text-yellow-800' },
        RESOLVED: { label: 'محلولة', className: 'bg-green-100 text-green-800' },
        CLOSED: { label: 'مغلقة', className: 'bg-gray-100 text-gray-800' }
    }

    const variant = variants[status] || variants.OPEN

    return (
        <Badge className={variant.className}>
            {variant.label}
        </Badge>
    )
}

function PriorityBadge({ priority }: { priority: string }) {
    const variants: Record<string, { label: string; className: string }> = {
        LOW: { label: 'منخفضة', className: 'bg-gray-100 text-gray-700' },
        MEDIUM: { label: 'متوسطة', className: 'bg-blue-100 text-blue-700' },
        HIGH: { label: 'عالية', className: 'bg-orange-100 text-orange-700' },
        CRITICAL: { label: 'حرجة', className: 'bg-red-100 text-red-700' }
    }

    const variant = variants[priority] || variants.MEDIUM

    return (
        <Badge variant="outline" className={variant.className}>
            {variant.label}
        </Badge>
    )
}

function CategoryBadge({ category }: { category: string }) {
    const labels: Record<string, string> = {
        MAINTENANCE: 'صيانة',
        SUPPORT: 'دعم فني',
        HARDWARE: 'أجهزة',
        INK: 'حبر',
        PAPER: 'ورق',
        OTHER: 'أخرى'
    }

    return (
        <span className="text-gray-600">
            {labels[category] || category}
        </span>
    )
}
