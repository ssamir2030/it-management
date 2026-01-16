export const dynamic = 'force-dynamic';

import { getAssetsForSelect } from "@/app/actions/assets"
import { TechnicalDetailsForm } from "@/components/technical-details/technical-details-form"
import { PremiumPageHeader } from '@/components/ui/premium-page-header'
import { Cpu, ArrowRight } from "lucide-react"
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function NewTechnicalDetailsPage() {
    const { data: assets } = await getAssetsForSelect()

    return (
        <div className="w-full py-10">
            <PremiumPageHeader
                title="إضافة تفاصيل فنية جديدة"
                description="سجل البيانات الفنية والمواصفات للجهاز"
                icon={Cpu}
                rightContent={
                    <Link href="/technical-details">
                        <Button variant="ghost" size="lg" className="text-white hover:bg-white/20 gap-2">
                            <ArrowRight className="h-4 w-4" />
                            إلغاء والعودة
                        </Button>
                    </Link>
                }
            />
            <TechnicalDetailsForm assets={assets || []} />
        </div>
    )
}

