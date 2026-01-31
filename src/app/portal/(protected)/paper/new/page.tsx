export const dynamic = 'force-dynamic';

import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentEmployee } from '@/app/actions/employee-portal'
import { NewRequestForm } from '@/components/requests/new-request-form'
import { ArrowRight, FileText } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PremiumPageHeader } from '@/components/ui/premium-page-header'

export const metadata: Metadata = {
    title: 'طلب أوراق | إدارة أصول تقنية المعلومات',
    description: 'طلب أوراق طباعة',
}

export default async function NewPaperPage() {
    const employee = await getCurrentEmployee()
    if (!employee) {
        redirect('/portal/login')
    }

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-slate-900 min-h-screen" dir="rtl">
            {/* Header */}
            <div className="container mx-auto px-4 py-6">
                <PremiumPageHeader
                    title="طلب أوراق طباعة"
                    description="طلب رزم أوراق A4 أو أحجام أخرى"
                    icon={FileText}
                    rightContent={
                        <Link href="/portal/dashboard">
                            <Button variant="ghost" className="gap-2 text-white hover:bg-white/20">
                                <ArrowRight className="h-4 w-4" />
                                العودة
                            </Button>
                        </Link>
                    }
                />
            </div>

            {/* Form */}
            <div className="flex-1 container mx-auto p-6 h-full">
                <div className="h-full">
                    <NewRequestForm
                        type="PAPER"
                        titlePlaceholder="مثال: 5 رزم ورق A4..."
                        detailsPlaceholder="يرجى تحديد الكمية والنوع المطلوب..."
                    />
                </div>
            </div>
        </div>
    )
}
