export const dynamic = 'force-dynamic';

import { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import { auth } from '@/auth'
import { getTicketById } from '@/app/actions/support'
import { TicketChat } from '@/components/support/ticket-chat'
import { ArrowRight, Headset } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PremiumPageHeader } from '@/components/ui/premium-page-header'

export const metadata: Metadata = {
    title: 'تفاصيل التذكرة | إدارة أصول تقنية المعلومات',
}

export default async function TicketDetailsPage({
    params,
}: {
    params: { id: string }
}) {
    const session = await auth()
    if (!session?.user) {
        redirect('/login')
    }

    const result = await getTicketById(params.id)

    if (!result.success || !result.data) {
        notFound()
    }

    const ticket = result.data

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-slate-900 min-h-screen">
            {/* Header */}
            <div className="container mx-auto px-4 py-6">
                <PremiumPageHeader
                    title={ticket.title}
                    description={`التذكرة #${ticket.id.slice(0, 8)}`}
                    icon={Headset}
                    rightContent={
                        <Link href="/portal/support">
                            <Button variant="ghost" className="gap-2 text-white hover:bg-white/20">
                                <ArrowRight className="h-4 w-4" />
                                العودة
                            </Button>
                        </Link>
                    }
                />
            </div>

            {/* Chat */}
            <div className="flex-1 container mx-auto p-6">
                <TicketChat
                    ticket={ticket}
                    currentUserId={session.user.id || ''}
                />
            </div>
        </div>
    )
}
