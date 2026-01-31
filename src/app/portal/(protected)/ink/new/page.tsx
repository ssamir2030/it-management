export const dynamic = 'force-dynamic';

import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentEmployee } from '@/app/actions/employee-portal'
import { NewRequestForm } from '@/components/requests/new-request-form'
import { ArrowRight, Printer } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PremiumPageHeader } from '@/components/ui/premium-page-header'

export const metadata: Metadata = {
    title: 'طلب أحبار | إدارة أصول تقنية المعلومات',
    description: 'طلب خراطيش حبر للطابعات',
}

export default async function NewInkPage() {
    const employee = await getCurrentEmployee()
    if (!employee) {
        redirect('/portal/login')
    }

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-slate-900 min-h-screen" dir="rtl">
            {/* Header */}
            <div className="container mx-auto px-4 py-6">
                <PremiumPageHeader
                    title="طلب أحبار طابعات"
                    description="طلب استبدال أو توفير أحبار للطابعات"
                    icon={Printer}
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
                        type="INK"
                        titlePlaceholder="مثال: حبر أسود لطابعة HP LaserJet..."
                        detailsPlaceholder="يرجى تحديد موديل الطابعة ورقم الحبر المطلوب..."
                    />
                </div>
            </div>
        </div>
    )
}
