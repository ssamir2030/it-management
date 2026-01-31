export const dynamic = 'force-dynamic';

import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentEmployee } from '@/app/actions/employee-portal'
import { NewRequestForm } from '@/components/requests/new-request-form'
import { ArrowRight, Box } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PremiumPageHeader } from '@/components/ui/premium-page-header'

export const metadata: Metadata = {
    title: 'طلب قطعة هاردوير | إدارة أصول تقنية المعلومات',
    description: 'طلب ماوس، كيبورد، شاشة، أو قطع أخرى',
}

export default async function NewHardwarePage() {
    const employee = await getCurrentEmployee()
    if (!employee) {
        redirect('/portal/login')
    }

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-slate-900 min-h-screen" dir="rtl">
            {/* Header */}
            <div className="container mx-auto px-4 py-6">
                <PremiumPageHeader
                    title="طلب قطعة هاردوير"
                    description="طلب ماوس، كيبورد، شاشة، أو ملحقات أخرى"
                    icon={Box}
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
                        type="HARDWARE"
                        titlePlaceholder="مثال: ماوس لاسلكي، شاشة إضافية..."
                        detailsPlaceholder="يرجى تحديد المواصفات المطلوبة والسبب..."
                    />
                </div>
            </div>
        </div>
    )
}
