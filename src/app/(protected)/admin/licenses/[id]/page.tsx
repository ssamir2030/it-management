export const dynamic = 'force-dynamic';

import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import { getLicense } from "@/app/actions/licenses"
import { notFound } from "next/navigation"
import { Key } from "lucide-react"
import { LicenseDetailsClient } from "@/components/licenses/license-details-client"
import prisma from "@/lib/prisma"

interface LicensePageProps {
    params: {
        id: string
    }
}

export default async function LicensePage({ params }: LicensePageProps) {
    const { success, data: license } = await getLicense(params.id)

    if (!success || !license) {
        notFound()
    }

    // Fetch potential assignment targets
    // In a real app with many items, this should be done via async search in the UI
    // For now, limiting to 100 items for simplicity
    const assets = await prisma.asset.findMany({
        take: 100,
        select: { id: true, name: true, tag: true },
        where: { status: 'AVAILABLE' } // Only available assets? Or unrelated?
    })

    const employees = await prisma.employee.findMany({
        take: 100,
        select: { id: true, name: true, jobTitle: true },
        where: { deletedAt: null }
    })

    return (
        <div className="space-y-6">
            <PremiumPageHeader
                title={license.name}
                description="تفاصيل الرخصة وتعيين المستخدمين"
                icon={Key}
                breadcrumbs={[
                    { label: "إدارة التراخيص", href: "/admin/licenses" },
                    { label: license.name, href: `/admin/licenses/${license.id}` }
                ]}
            />

            <LicenseDetailsClient
                license={license}
                assets={assets}
                employees={employees}
            />
        </div>
    )
}
