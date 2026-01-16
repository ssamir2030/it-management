export const dynamic = 'force-dynamic';

import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import { OnboardingWizard } from "@/components/users/onboarding-wizard"
import { UserPlus, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function OnboardingPage() {
    return (
        <div className="space-y-8" dir="rtl">
            <PremiumPageHeader
                title="إعداد موظف جديد"
                description="إضافة حساب، تعيين أجهزة وتراخيص، وطباعة نموذج الاستلام في عملية واحدة."
                icon={UserPlus}
                rightContent={
                    <Link href="/admin/settings/users">
                        <Button variant="ghost" className="gap-2 text-white hover:bg-white/20">
                            <ArrowRight className="h-4 w-4" />
                            العودة للمستخدمين
                        </Button>
                    </Link>
                }
            />

            <OnboardingWizard />
        </div>
    )
}
