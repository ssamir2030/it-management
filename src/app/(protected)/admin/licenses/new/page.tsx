export const dynamic = 'force-dynamic';

import { NewLicenseForm } from '@/components/licenses/new-license-form'
import { ArrowLeft, KeyRound } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PremiumPageHeader } from "@/components/ui/premium-page-header"

export default function NewLicensePage() {
    return (
        <div className="container mx-auto p-6 space-y-6" dir="rtl">
            <div className="flex items-center gap-4">
                <Link href="/admin/licenses">
                    <Button variant="outline" size="sm" className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        العودة للرخص
                    </Button>
                </Link>
            </div>

            <PremiumPageHeader
                title="إضافة رخصة جديدة"
                description="أدخل تفاصيل رخصة البرنامج أو الاشتراك الجديد"
                icon={KeyRound}
            />

            <NewLicenseForm />
        </div>
    )
}
