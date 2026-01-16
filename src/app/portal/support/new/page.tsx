export const dynamic = 'force-dynamic';

import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentEmployee } from '@/app/actions/employee-portal'
import { NewRequestForm } from '@/components/requests/new-request-form'
import { ArrowRight, Headset } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PremiumPageHeader } from '@/components/ui/premium-page-header'

export const metadata: Metadata = {
    title: 'طلب دعم جديد | إدارة أصول تقنية المعلومات',
    description: 'إنشاء تذكرة دعم فني جديدة',
}

export default async function NewTicketPage({ searchParams }: { searchParams: { requestId?: string } }) {
    const employee = await getCurrentEmployee()
    if (!employee) {
        redirect('/portal/login')
    }

    const defaultSubject = searchParams.requestId
        ? `متابعة للطلب رقم #${searchParams.requestId.slice(-6)}`
        : ''

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-slate-900 min-h-screen" dir="rtl">
            {/* Header */}
            <div className="container mx-auto px-4 py-6">
                <PremiumPageHeader
                    title="طلب دعم فني"
                    description="الإبلاغ عن مشكلة تقنية أو طلب مساعدة"
                    icon={Headset}
                    rightContent={
                        <Link href="/portal/dashboard">
                            <Button variant="ghost" className="gap-2 text-white hover:bg-white/20">
                                <ArrowRight className="h-4 w-4" />
                                العودة للرئيسية
                            </Button>
                        </Link>
                    }
                />
            </div>

            {/* Form */}
            <div className="flex-1 container mx-auto p-6 h-full">
                <div className="h-full">
                    <NewRequestForm
                        type="SUPPORT"
                        titlePlaceholder="مثال: الطابعة لا تعمل، مشكلة في البريد الإلكتروني..."
                        detailsPlaceholder="يرجى وصف المشكلة بالتفصيل..."
                        defaultSubject={defaultSubject}
                    />
                </div>
            </div>
        </div>
    )
}
