export const dynamic = 'force-dynamic';

import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import { Package, ArrowRight } from "lucide-react"
import { SoftwareForm } from "../software-form"
import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function NewSoftwarePage() {
    return (
        <div className="space-y-6">
            <PremiumPageHeader
                title="إضافة برنامج جديد"
                description="إضافة برنامج جديد إلى الدليل"
                icon={Package}
                rightContent={
                    <Link href="/admin/software">
                        <Button variant="ghost" className="gap-2 text-white hover:bg-white/20">
                            <ArrowRight className="h-4 w-4" />
                            العودة
                        </Button>
                    </Link>
                }
            />

            <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-6 w-full">
                <SoftwareForm />
            </div>
        </div>
    )
}
