export const dynamic = 'force-dynamic';

import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import { Wrench, ArrowRight } from "lucide-react"
import { MaintenanceForm } from "../maintenance-form"
import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function NewMaintenancePage() {
    return (
        <div className="space-y-6">
            <PremiumPageHeader
                title="جدولة صيانة جديدة"
                description="إضافة عملية صيانة جديدة للجدول"
                icon={Wrench}
                rightContent={
                    <Link href="/admin/maintenance">
                        <Button variant="ghost" className="gap-2 text-white hover:bg-white/20">
                            <ArrowRight className="h-4 w-4" />
                            العودة
                        </Button>
                    </Link>
                }
            />

            <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-6 w-full">
                <MaintenanceForm />
            </div>
        </div>
    )
}
